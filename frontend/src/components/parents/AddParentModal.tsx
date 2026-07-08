"use client";

import { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import { apiRequest } from "@/lib/api";

const PHONE_CODES = [
  { code: "+91", flag: "🇮🇳" }, { code: "+1", flag: "🇺🇸" }, { code: "+44", flag: "🇬🇧" },
  { code: "+61", flag: "🇦🇺" }, { code: "+971", flag: "🇦🇪" }, { code: "+65", flag: "🇸🇬" },
  { code: "+60", flag: "🇲🇾" }, { code: "+27", flag: "🇿🇦" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" }, { value: "female", label: "Female" },
  { value: "other", label: "Other" }, { value: "prefer_not_to_say", label: "Prefer not to say" },
];

type FormState = {
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

const emptyForm = (): FormState => ({
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
});

type AddParentModalProps = {
  open: boolean;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
};

function FieldWrap({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-700">
        {label}{required && <span className="ml-0.5 text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500";
const selectCls = `${inputCls} cursor-pointer`;

export default function AddParentModal({ open, token, onClose, onSuccess }: AddParentModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const countries = Country.getAllCountries();
  const states = form.country ? State.getStatesOfCountry(form.country) : [];
  const cities = form.country && form.state ? City.getCitiesOfState(form.country, form.state) : [];

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setError("");
    }
  }, [open]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country") {
        next.state = "";
        next.city = "";
      }
      if (field === "state") {
        next.city = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await apiRequest("/superadmin/parents", {
        method: "POST",
        body: JSON.stringify(form),
      }, token);

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add parent");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-20 pb-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Parent</h2>
            <p className="mt-1 text-sm text-slate-600">Parent will be added under Kareer Studio by default.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <FieldWrap label="First Name" required>
              <input type="text" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className={inputCls} required />
            </FieldWrap>
            <FieldWrap label="Middle Name">
              <input type="text" value={form.middleName} onChange={(e) => setField("middleName", e.target.value)} className={inputCls} />
            </FieldWrap>
            <FieldWrap label="Last Name" required>
              <input type="text" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className={inputCls} required />
            </FieldWrap>
            <FieldWrap label="Gender">
              <select value={form.gender} onChange={(e) => setField("gender", e.target.value)} className={selectCls}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </FieldWrap>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldWrap label="Email Address" required>
              <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputCls} required />
            </FieldWrap>
            <FieldWrap label="Phone Number" required>
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-2">
                <select value={form.phoneCode} onChange={(e) => setField("phoneCode", e.target.value)} className={selectCls}>
                  {PHONE_CODES.map((pc) => <option key={pc.code} value={pc.code}>{pc.flag} {pc.code}</option>)}
                </select>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={inputCls}
                  maxLength={10}
                  required
                />
              </div>
            </FieldWrap>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FieldWrap label="Country">
              <select value={form.country} onChange={(e) => setField("country", e.target.value)} className={selectCls}>
                <option value="">Country</option>
                {countries.map((c) => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
              </select>
            </FieldWrap>
            <FieldWrap label="State">
              <select value={form.state} onChange={(e) => setField("state", e.target.value)} disabled={!form.country} className={`${selectCls} disabled:opacity-50`}>
                <option value="">State</option>
                {states.map((s) => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
              </select>
            </FieldWrap>
            <FieldWrap label="City">
              <select value={form.city} onChange={(e) => setField("city", e.target.value)} disabled={!form.state} className={`${selectCls} disabled:opacity-50`}>
                <option value="">City</option>
                {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </FieldWrap>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Adding..." : "Add Parent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
