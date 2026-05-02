"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";

type Assessment = {
  _id: string;
  code: string;
  name: string;
  category: string;
  questionBankStatus: string;
};

type QuestionOption = {
  label: string;
  text: string;
  score?: number;
};

type Question = {
  _id: string;
  assessmentCode: string;
  category: string;
  categoryLabel: string;
  questionNumber: number;
  title: string;
  questionText: string;
  options?: QuestionOption[];
  isActive: boolean;
};

type SuperadminResponse = { assessments: Assessment[] };
type QuestionsResponse = { questions: Question[] };

type QuestionFormState = {
  category: string;
  categoryLabel: string;
  questionNumber: number;
  title: string;
  questionText: string;
  options: QuestionOption[];
};

const DEFAULT_FORM: QuestionFormState = {
  category: "",
  categoryLabel: "",
  questionNumber: 1,
  title: "",
  questionText: "",
  options: [],
};

const sanitizeOptions = (options: QuestionOption[]) => {
  return options
    .map((option) => ({
      label: option.label.trim(),
      text: option.text.trim(),
      score: option.score,
    }))
    .filter((option) => option.label && option.text);
};

export default function QuestionsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeCode, setActiveCode] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeCat, setActiveCat] = useState<string>("ALL");

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<QuestionFormState>(DEFAULT_FORM);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState<QuestionFormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const auth = useMemo(() => getStoredAuth(), []);

  const normalizeAssessmentCode = (code: string) => {
    if (code === "METACOGNITION") return "METACOGNITION_TEST";
    return code;
  };

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
      return;
    }

    apiRequest<SuperadminResponse>("/superadmin/dashboard", {}, auth.token)
      .then((res) => {
        setAssessments(res.assessments);
        if (res.assessments.length > 0) {
          setActiveCode(res.assessments[0].code);
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoadingAssessments(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestions = useCallback(async (code: string) => {
    if (!auth || !code) return;

    setLoadingQuestions(true);
    setActiveCat("ALL");

    try {
      const res = await apiRequest<QuestionsResponse>(
        `/superadmin/assessments/${code}/questions`,
        {},
        auth.token
      );

      if (res.questions.length === 0 && code === "METACOGNITION_TEST") {
        const legacy = await apiRequest<QuestionsResponse>(
          "/superadmin/assessments/METACOGNITION/questions",
          {},
          auth.token
        );

        setQuestions(
          legacy.questions.map((question) => ({
            ...question,
            assessmentCode: "METACOGNITION_TEST",
            options: question.options ?? [],
          }))
        );
      } else {
        setQuestions(
          res.questions.map((question) => ({
            ...question,
            assessmentCode: normalizeAssessmentCode(question.assessmentCode),
            options: question.options ?? [],
          }))
        );
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, [auth]);

  useEffect(() => {
    if (!activeCode) return;
    setQuestions([]);
    setActiveCat("ALL");
    void loadQuestions(activeCode);
  }, [activeCode, loadQuestions]);

  const scopedQuestions = useMemo(
    () => questions.filter((question) => normalizeAssessmentCode(question.assessmentCode) === activeCode),
    [questions, activeCode]
  );

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    scopedQuestions.forEach((question) => seen.set(question.category, question.categoryLabel));
    return Array.from(seen.entries()).map(([cat, label]) => ({ cat, label }));
  }, [scopedQuestions]);

  const filteredQuestions = useMemo(
    () => scopedQuestions.filter((question) => activeCat === "ALL" || question.category === activeCat),
    [scopedQuestions, activeCat]
  );

  useEffect(() => {
    if (!showAdd) return;

    const nextNumber = scopedQuestions.length + 1;
    const selectedCategory = activeCat !== "ALL" ? categories.find((c) => c.cat === activeCat) : undefined;

    setAddForm((form) => ({
      ...form,
      questionNumber: nextNumber,
      category: selectedCategory?.cat || form.category,
      categoryLabel: selectedCategory?.label || form.categoryLabel,
    }));
  }, [showAdd, scopedQuestions.length, activeCat, categories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !activeCode) return;

    setAdding(true);
    setAddError(null);

    try {
      await apiRequest(
        `/superadmin/assessments/${activeCode}/questions`,
        {
          method: "POST",
          body: JSON.stringify({
            ...addForm,
            categoryLabel: addForm.categoryLabel || addForm.category,
            options: sanitizeOptions(addForm.options),
          }),
        },
        auth.token
      );

      setMessage("Question added.");
      setShowAdd(false);
      setAddForm(DEFAULT_FORM);
      await loadQuestions(activeCode);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (question: Question) => {
    setEditQuestion(question);
    setEditForm({
      category: question.category,
      categoryLabel: question.categoryLabel,
      questionNumber: question.questionNumber,
      title: question.title,
      questionText: question.questionText,
      options: question.options ?? [],
    });
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !editQuestion) return;

    setSaving(true);
    setEditError(null);

    try {
      await apiRequest(
        `/superadmin/questions/${editQuestion._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...editForm,
            categoryLabel: editForm.categoryLabel || editForm.category,
            options: sanitizeOptions(editForm.options),
          }),
        },
        auth.token
      );

      setMessage("Question updated.");
      setEditQuestion(null);
      setEditForm(DEFAULT_FORM);
      await loadQuestions(activeCode);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth || !confirm("Delete this question?")) return;

    try {
      await apiRequest(`/superadmin/questions/${id}`, { method: "DELETE" }, auth.token);
      setMessage("Question deleted.");
      await loadQuestions(activeCode);
    } catch {
      setMessage("Failed to delete question.");
    }
  };

  const updateAddOption = (index: number, key: keyof QuestionOption, value: string | number | undefined) => {
    setAddForm((form) => ({
      ...form,
      options: form.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [key]: value } : option
      ),
    }));
  };

  const updateEditOption = (index: number, key: keyof QuestionOption, value: string | number | undefined) => {
    setEditForm((form) => ({
      ...form,
      options: form.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [key]: value } : option
      ),
    }));
  };

  const activeAssessment = assessments.find((assessment) => assessment.code === activeCode);

  if (loadingAssessments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Banks</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Add, edit, and manage questions for each assessment.
          </p>
        </div>
        {activeCode && (
          <button
            onClick={() => {
              setShowAdd(true);
              setAddError(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Question
          </button>
        )}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          {message}
          <button onClick={() => setMessage(null)} className="text-green-500 hover:text-green-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4 grid md:grid-cols-2 gap-3 bg-gray-50/40">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assessment</label>
            <select
              value={activeCode}
              onChange={(e) => setActiveCode(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {assessments.map((assessment) => (
                <option key={assessment.code} value={assessment.code}>
                  {assessment.name} ({assessment.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sub-Type</label>
            <select
              value={activeCat}
              onChange={(e) => setActiveCat(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Sub-Types ({scopedQuestions.length})</option>
              {categories.map(({ cat, label }) => {
                const count = scopedQuestions.filter((question) => question.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {label} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="min-h-[400px]">
          {loadingQuestions ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-2">No questions yet for {activeAssessment?.name}.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Add the first question
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-2.5">
              {filteredQuestions.map((question, index) => (
                <div
                  key={question._id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition group"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-base font-semibold text-gray-900">{question.title}</p>
                      <span className="text-sm bg-white border border-gray-200 text-gray-500 rounded px-1.5 py-0.5">
                        {question.categoryLabel} · Q{question.questionNumber}
                      </span>
                    </div>
                    <p className="text-base text-gray-600 leading-relaxed">{question.questionText}</p>
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={`${question._id}-${optionIndex}`}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                          >
                            <span className="font-semibold text-gray-800">{option.label}.</span> {option.text}
                            {option.score !== undefined && (
                              <span className="text-gray-400"> · Score {option.score}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(question)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => void handleDelete(question._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Question</h3>
                <p className="text-sm text-gray-500">{activeAssessment?.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setAddError(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Key *</label>
                  <input
                    required
                    value={addForm.category}
                    onChange={(e) => setAddForm((form) => ({ ...form, category: e.target.value }))}
                    placeholder="e.g. K, SECTION_A"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Label</label>
                  <input
                    value={addForm.categoryLabel}
                    onChange={(e) => setAddForm((form) => ({ ...form, categoryLabel: e.target.value }))}
                    placeholder="e.g. King, Section A"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Number *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={addForm.questionNumber}
                  onChange={(e) => setAddForm((form) => ({ ...form, questionNumber: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                <input
                  required
                  value={addForm.title}
                  onChange={(e) => setAddForm((form) => ({ ...form, title: e.target.value }))}
                  placeholder="Short title for this question"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Text *</label>
                <textarea
                  required
                  rows={4}
                  value={addForm.questionText}
                  onChange={(e) => setAddForm((form) => ({ ...form, questionText: e.target.value }))}
                  placeholder="Full question text as shown to the user..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Options</label>
                  <button
                    type="button"
                    onClick={() => setAddForm((form) => ({
                      ...form,
                      options: [...form.options, { label: "", text: "", score: undefined }],
                    }))}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {addForm.options.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500">
                      No options added yet.
                    </div>
                  )}
                  {addForm.options.map((option, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-[120px_1fr_120px_auto] items-end">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
                        <input
                          value={option.label}
                          onChange={(e) => updateAddOption(index, "label", e.target.value)}
                          placeholder="A"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Text</label>
                        <input
                          value={option.text}
                          onChange={(e) => updateAddOption(index, "text", e.target.value)}
                          placeholder="Option text"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Score</label>
                        <input
                          type="number"
                          value={option.score ?? ""}
                          onChange={(e) => updateAddOption(index, "score", e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Optional"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddForm((form) => ({
                          ...form,
                          options: form.options.filter((_, optionIndex) => optionIndex !== index),
                        }))}
                        className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {addError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-xl">
                  {addError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editQuestion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {editQuestion.questionNumber}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Question</h3>
                <p className="text-sm text-gray-500">{editQuestion.categoryLabel} · Q{editQuestion.questionNumber}</p>
              </div>
              <button
                onClick={() => setEditQuestion(null)}
                className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Key</label>
                  <input
                    value={editForm.category}
                    onChange={(e) => setEditForm((form) => ({ ...form, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Label</label>
                  <input
                    value={editForm.categoryLabel}
                    onChange={(e) => setEditForm((form) => ({ ...form, categoryLabel: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Number</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.questionNumber}
                  onChange={(e) => setEditForm((form) => ({ ...form, questionNumber: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((form) => ({ ...form, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Text</label>
                <textarea
                  rows={4}
                  value={editForm.questionText}
                  onChange={(e) => setEditForm((form) => ({ ...form, questionText: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Options</label>
                  <button
                    type="button"
                    onClick={() => setEditForm((form) => ({
                      ...form,
                      options: [...form.options, { label: "", text: "", score: undefined }],
                    }))}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {editForm.options.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500">
                      No options added yet.
                    </div>
                  )}
                  {editForm.options.map((option, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-[120px_1fr_120px_auto] items-end">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
                        <input
                          value={option.label}
                          onChange={(e) => updateEditOption(index, "label", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Text</label>
                        <input
                          value={option.text}
                          onChange={(e) => updateEditOption(index, "text", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Score</label>
                        <input
                          type="number"
                          value={option.score ?? ""}
                          onChange={(e) => updateEditOption(index, "score", e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditForm((form) => ({
                          ...form,
                          options: form.options.filter((_, optionIndex) => optionIndex !== index),
                        }))}
                        className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-xl">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditQuestion(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !editForm.title.trim() || !editForm.questionText.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
