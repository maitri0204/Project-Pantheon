import * as XLSX from "xlsx";

export const STUDENT_IMPORT_HEADERS = [
  "First Name",
  "Middle Name",
  "Last Name",
  "Gender",
  "Email",
  "Phone Code",
  "Phone",
  "Institution Name",
  "Grade / Level",
  "Division",
  "Country",
  "State",
  "City",
] as const;

export type StudentImportRow = {
  rowNumber: number;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  email: string;
  phoneCode: string;
  phone: string;
  institutionName: string;
  grade: string;
  division: string;
  country: string;
  state: string;
  city: string;
};

const SAMPLE_ROWS: Array<Record<(typeof STUDENT_IMPORT_HEADERS)[number], string>> = [
  {
    "First Name": "Aarav",
    "Middle Name": "K",
    "Last Name": "Shah",
    Gender: "male",
    Email: "aarav.shah@example.com",
    "Phone Code": "+91",
    Phone: "9876543210",
    "Institution Name": "Kareer Studio School",
    "Grade / Level": "10",
    Division: "A",
    Country: "IN",
    State: "GJ",
    City: "Vadodara",
  },
  {
    "First Name": "Isha",
    "Middle Name": "",
    "Last Name": "Patel",
    Gender: "female",
    Email: "isha.patel@example.com",
    "Phone Code": "+91",
    Phone: "9123456780",
    "Institution Name": "Kareer Studio School",
    "Grade / Level": "11",
    Division: "B",
    Country: "IN",
    State: "GJ",
    City: "Vadodara",
  },
];

const normalizeHeader = (value: unknown) => String(value ?? "").trim().toLowerCase();

const headerAliases: Record<string, keyof StudentImportRow | "ignore"> = {
  "first name": "firstName",
  "middle name": "middleName",
  "last name": "lastName",
  gender: "gender",
  email: "email",
  "phone code": "phoneCode",
  phone: "phone",
  "institution name": "institutionName",
  "grade / level": "grade",
  grade: "grade",
  division: "division",
  country: "country",
  state: "state",
  city: "city",
};

const cleanCell = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

export function downloadStudentImportSample() {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: [...STUDENT_IMPORT_HEADERS] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "student-import-sample.xlsx");
}

export async function parseStudentImportFile(file: File): Promise<StudentImportRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The Excel file does not contain any sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (rawRows.length === 0) {
    throw new Error("The Excel file does not contain any student rows.");
  }

  return rawRows.map((rawRow, index) => {
    const mapped: StudentImportRow = {
      rowNumber: index + 2,
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      email: "",
      phoneCode: "+91",
      phone: "",
      institutionName: "",
      grade: "",
      division: "",
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
    mapped.division = mapped.division.toUpperCase().slice(0, 3);
    mapped.email = mapped.email.toLowerCase();

    return mapped;
  }).filter((row) =>
    Object.entries(row).some(([key, value]) => key !== "rowNumber" && key !== "phoneCode" && String(value).trim() !== ""),
  );
}
