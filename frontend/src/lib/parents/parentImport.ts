import * as XLSX from "xlsx";

export const PARENT_IMPORT_HEADERS = [
  "First Name",
  "Middle Name",
  "Last Name",
  "Gender",
  "Email",
  "Phone Code",
  "Phone",
  "Country",
  "State",
  "City",
] as const;

export type ParentImportRow = {
  rowNumber: number;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  email: string;
  phoneCode: string;
  phone: string;
  country: string;
  state: string;
  city: string;
};

type ParentImportField = Exclude<keyof ParentImportRow, "rowNumber">;

const SAMPLE_ROWS: Array<Record<(typeof PARENT_IMPORT_HEADERS)[number], string>> = [
  {
    "First Name": "Priya",
    "Middle Name": "R",
    "Last Name": "Mehta",
    Gender: "female",
    Email: "priya.mehta@example.com",
    "Phone Code": "+91",
    Phone: "9876543210",
    Country: "IN",
    State: "GJ",
    City: "Vadodara",
  },
  {
    "First Name": "Rajesh",
    "Middle Name": "",
    "Last Name": "Shah",
    Gender: "male",
    Email: "rajesh.shah@example.com",
    "Phone Code": "+91",
    Phone: "9123456780",
    Country: "IN",
    State: "GJ",
    City: "Vadodara",
  },
];

const normalizeHeader = (value: unknown) => String(value ?? "").trim().toLowerCase();

const headerAliases: Record<string, ParentImportField | "ignore"> = {
  "first name": "firstName",
  "middle name": "middleName",
  "last name": "lastName",
  gender: "gender",
  email: "email",
  "phone code": "phoneCode",
  phone: "phone",
  "institution name": "ignore",
  country: "country",
  state: "state",
  city: "city",
};

const cleanCell = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

export function downloadParentImportSample() {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: [...PARENT_IMPORT_HEADERS] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Parents");
  XLSX.writeFile(workbook, "parent-import-sample.xlsx");
}

export async function parseParentImportFile(file: File): Promise<ParentImportRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The Excel file does not contain any sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (rawRows.length === 0) {
    throw new Error("The Excel file does not contain any parent rows.");
  }

  return rawRows.map((rawRow, index) => {
    const mapped: ParentImportRow = {
      rowNumber: index + 2,
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      email: "",
      phoneCode: "+91",
      phone: "",
      country: "",
      state: "",
      city: "",
    };

    Object.entries(rawRow).forEach(([header, value]) => {
      const field = headerAliases[normalizeHeader(header)];
      if (!field || field === "ignore") return;
      mapped[field] = cleanCell(value);
    });

    mapped.phone = mapped.phone.replace(/\D/g, "").slice(0, 10);
    mapped.email = mapped.email.toLowerCase();

    return mapped;
  }).filter((row) =>
    Object.entries(row).some(([key, value]) => key !== "rowNumber" && key !== "phoneCode" && String(value).trim() !== ""),
  );
}
