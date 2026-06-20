import crypto from "crypto";

const ENCRYPTION_PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const getEncryptionKey = (): Buffer | null => {
  const raw = process.env.ENCRYPTION_KEY?.trim();
  if (!raw) {
    return null;
  }

  if (/^[0-9a-f]{64}$/i.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  return crypto.createHash("sha256").update(raw).digest();
};

export const isFieldEncryptionEnabled = (): boolean => Boolean(getEncryptionKey());

export const encryptSensitiveValue = (value?: string | null): string | undefined => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return undefined;
  }

  const key = getEncryptionKey();
  if (!key) {
    return normalized;
  }

  if (normalized.startsWith(ENCRYPTION_PREFIX)) {
    return normalized;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
};

export const decryptSensitiveValue = (value?: string | null): string | undefined => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return undefined;
  }

  if (!normalized.startsWith(ENCRYPTION_PREFIX)) {
    return normalized;
  }

  const key = getEncryptionKey();
  if (!key) {
    return undefined;
  }

  const payload = normalized.slice(ENCRYPTION_PREFIX.length);
  const [ivPart, tagPart, dataPart] = payload.split(".");
  if (!ivPart || !tagPart || !dataPart) {
    return undefined;
  }

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivPart, "base64url"));
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataPart, "base64url")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return undefined;
  }
};

export const maskPanNumber = (value?: string | null): string | undefined => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.length <= 4) {
    return "XXXX";
  }

  return `${"X".repeat(Math.max(0, normalized.length - 4))}${normalized.slice(-4)}`;
};

export const maskBankAccountNumber = (value?: string | null): string | undefined => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.length <= 4) {
    return "****";
  }

  return `${"*".repeat(Math.max(0, normalized.length - 4))}${normalized.slice(-4)}`;
};

export const decryptRegistrationSensitiveFields = <
  T extends {
    panIndividual?: string;
    panCompany?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    bankAccountName?: string;
  },
>(
  registration: T | null | undefined,
): T | null | undefined => {
  if (!registration) {
    return registration;
  }

  return {
    ...registration,
    panIndividual: decryptSensitiveValue(registration.panIndividual),
    panCompany: decryptSensitiveValue(registration.panCompany),
    bankAccountNumber: decryptSensitiveValue(registration.bankAccountNumber),
    ifscCode: decryptSensitiveValue(registration.ifscCode),
    bankAccountName: decryptSensitiveValue(registration.bankAccountName),
  };
};

export const encryptRegistrationSensitiveFields = <
  T extends {
    panIndividual?: string;
    panCompany?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    bankAccountName?: string;
  },
>(
  registration: T,
): T => ({
  ...registration,
  panIndividual: encryptSensitiveValue(registration.panIndividual),
  panCompany: encryptSensitiveValue(registration.panCompany),
  bankAccountNumber: encryptSensitiveValue(registration.bankAccountNumber),
  ifscCode: encryptSensitiveValue(registration.ifscCode),
  bankAccountName: encryptSensitiveValue(registration.bankAccountName),
});

const SENSITIVE_FIELD_NAMES = [
  "panIndividual",
  "panCompany",
  "bankAccountNumber",
  "ifscCode",
  "bankAccountName",
] as const;

/** Re-encrypt legacy plaintext org registration financial fields when ENCRYPTION_KEY is set. */
export const migratePlaintextRegistrationFields = async (
  findDocuments: () => Promise<Array<Record<string, unknown> & { _id: unknown; save: () => Promise<unknown> }>>,
): Promise<number> => {
  if (!isFieldEncryptionEnabled()) {
    return 0;
  }

  const documents = await findDocuments();
  let migrated = 0;

  for (const document of documents) {
    const updates: Record<string, string | undefined> = {};
    SENSITIVE_FIELD_NAMES.forEach((field) => {
      const current = document[field];
      if (typeof current !== "string" || !current.trim() || current.startsWith(ENCRYPTION_PREFIX)) {
        return;
      }
      updates[field] = encryptSensitiveValue(current);
    });

    if (Object.keys(updates).length === 0) {
      continue;
    }

    Object.assign(document, updates);
    await document.save();
    migrated += 1;
  }

  return migrated;
};
