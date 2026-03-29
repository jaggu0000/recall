"use client";

import { useState, useRef } from "react";

const RELATIONS = [
  "Parent",
  "Child",
  "Spouse",
  "Sibling",
  "Grandparent",
  "Friend",
  "Caregiver",
  "Other",
];
const SUGGESTED_TAGS = [
  "Family",
  "Home",
  "Work",
  "Travel",
  "Childhood",
  "Food",
  "Music",
  "Hobby",
  "Pet",
  "Milestone",
  "Vacation",
];

export default function PatientForm() {
  const [form, setForm] = useState({
    name: "",
    images: [],
    dateOfBirth: "",
    relation: "",
    priority: "",
  });
  const [memories, setMemories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [tagInputs, setTagInputs] = useState({});
  const fileInputRef = useRef(null);

  // ── Main form handlers ──────────────────────────────────────────
  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  // ── Memory handlers ─────────────────────────────────────────────
  const addMemory = () => {
    const id = Date.now();
    setMemories((prev) => [
      ...prev,
      { id, memory: "", priority: "", tags: [] },
    ]);
    setTagInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const removeMemory = (id) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setTagInputs((prev) => {
      const c = { ...prev };
      delete c[id];
      return c;
    });
  };

  const updateMemory = (id, key, value) =>
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)),
    );

  const addTag = (id, tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id && !m.tags.includes(trimmed)
          ? { ...m, tags: [...m.tags, trimmed] }
          : m,
      ),
    );
    setTagInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const removeTag = (memId, tag) =>
    setMemories((prev) =>
      prev.map((m) =>
        m.id === memId ? { ...m, tags: m.tags.filter((t) => t !== tag) } : m,
      ),
    );

  const handleTagKeyDown = (e, id) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(id, tagInputs[id] || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitted:", { ...form, memories });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/memory-vault/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: userId,
            type: "person",
            addedBy: "caretaker", // or dynamic

            personData: {
              name: form.name,
              dateOfBirth: form.dateOfBirth,
              relation: form.relation,
              priority: form.priority,
              memories: [], // initially empty
            },
          }),
        },
      );

      const data = await res.json();

      console.log("✅ Vault Created:", data);

      // 👉 After creating, upload memories
      if (form.images.length > 0) {
        await uploadMemories(data._id);
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
    }

    setSubmitted(true);
  };

  // Shared input classes
  const inputCls =
    "w-full rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-stone-800 font-serif placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition";

  // ── Success screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center font-serif px-4">
        <div className="bg-white rounded-2xl border border-amber-100 shadow-xl p-12 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-5">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Profile Saved
          </h2>
          <p className="text-sm text-stone-500 mb-7 leading-relaxed">
            {form.name}&apos;s profile and {memories.length} memor
            {memories.length !== 1 ? "ies" : "y"} have been recorded.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-stone-800 text-white rounded-xl px-7 py-3 font-semibold text-sm hover:bg-stone-700 transition"
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 font-serif py-10 px-4 sm:px-6">
      {/* Decorative background blob */}
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 rounded-full bg-amber-100 opacity-60 blur-3xl -translate-y-1/3 translate-x-1/3" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none">🧠</span>
            <div>
              <h1 className="text-2xl font-bold text-stone-800 tracking-tight">
                Memory Care
              </h1>
              <p className="text-xs text-stone-400 italic mt-0.5">
                Patient Profile & Memory Log
              </p>
            </div>
          </div>
          <span className="bg-amber-400 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
            New Profile
          </span>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <section className="bg-white rounded-2xl border border-amber-100 shadow-sm p-7">
            <SectionHeading num="01" title="Information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <Label>Full Name</Label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleField}
                  required
                  placeholder="e.g. Margaret Eleanor Ross"
                  className={inputCls}
                />
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1.5">
                <Label>Date of Birth</Label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleField}
                  required
                  className={inputCls}
                />
              </div>

              {/* Relation */}
              <div className="flex flex-col gap-1.5">
                <Label>Your Relation</Label>
                <select
                  name="relation"
                  value={form.relation}
                  onChange={handleField}
                  required
                  className={inputCls + " appearance-none cursor-pointer"}
                >
                  <option value="" disabled>
                    Select relation…
                  </option>
                  {RELATIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  Priority Level{" "}
                  <span className="text-stone-400 font-normal normal-case text-[10px]">
                    (1 = highest)
                  </span>
                </Label>
                <input
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={handleField}
                  required
                  min={1}
                  max={10}
                  placeholder="1 – 10"
                  className={inputCls + " max-w-[160px]"}
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-amber-100 shadow-sm p-7">
            <SectionHeading num="02" title="Photos" />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-200 rounded-xl py-10 text-center cursor-pointer bg-amber-50 hover:bg-amber-100 hover:border-amber-400 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="hidden"
              />
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm font-semibold text-stone-700">
                Click to upload photos
              </p>
              <p className="text-xs text-stone-400 mt-1">
                PNG, JPG, WEBP — multiple allowed
              </p>
            </div>

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5">
                {imagePreviews.map((img, i) => (
                  <div key={i} className="relative w-20 text-center">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-amber-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                    <p className="text-[10px] text-stone-400 mt-1 truncate">
                      {img.name.length > 14
                        ? img.name.slice(0, 12) + "…"
                        : img.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ─────────────────── 03 · Memory Log ─────────────────── */}
          <section className="bg-white rounded-2xl border border-amber-100 shadow-sm p-7">
            <div className="flex items-center justify-between mb-5">
              <SectionHeading num="03" title="Memory Log" />
              <button
                type="button"
                onClick={addMemory}
                className="flex items-center gap-1.5 bg-stone-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-stone-700 active:scale-95 transition"
              >
                <span className="text-lg leading-none">＋</span>
                Add Memory
              </button>
            </div>

            {/* Empty state */}
            {memories.length === 0 && (
              <div className="border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-xl py-10 text-center">
                <span className="text-3xl block mb-2">💭</span>
                <p className="text-sm font-semibold text-stone-700">
                  No memories added yet.
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Click <strong>+ Add Memory</strong> to begin logging.
                </p>
              </div>
            )}

            {/* Memory cards */}
            <div className="flex flex-col gap-5 mt-1">
              {memories.map((mem, idx) => (
                <div
                  key={mem.id}
                  className="border border-amber-100 rounded-xl bg-amber-50 p-5 flex flex-col gap-4 hover:shadow-md transition"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 tracking-widest uppercase font-mono">
                      Memory #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMemory(mem.id)}
                      className="text-xs text-red-500 font-semibold underline hover:text-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Memory text */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Memory Description</Label>
                    <textarea
                      value={mem.memory}
                      onChange={(e) =>
                        updateMemory(mem.id, "memory", e.target.value)
                      }
                      required
                      rows={3}
                      placeholder="Describe the memory in detail…"
                      className={inputCls + " resize-y min-h-[80px]"}
                    />
                  </div>

                  {/* Priority */}
                  <div className="flex flex-col gap-1.5">
                    <Label>
                      Priority{" "}
                      <span className="text-stone-400 font-normal normal-case text-[10px]">
                        (1 = most important)
                      </span>
                    </Label>
                    <input
                      type="number"
                      value={mem.priority}
                      onChange={(e) =>
                        updateMemory(mem.id, "priority", e.target.value)
                      }
                      required
                      min={1}
                      max={10}
                      placeholder="1 – 10"
                      className={inputCls + " max-w-[140px]"}
                    />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-col gap-2">
                    <Label>Tags</Label>

                    {/* Suggested tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.filter((t) => !mem.tags.includes(t)).map(
                        (t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => addTag(mem.id, t)}
                            className="text-xs px-3 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition"
                          >
                            + {t}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Tag input row */}
                    <div className="flex gap-2">
                      <input
                        value={tagInputs[mem.id] || ""}
                        onChange={(e) =>
                          setTagInputs((prev) => ({
                            ...prev,
                            [mem.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => handleTagKeyDown(e, mem.id)}
                        placeholder="Type a tag and press Enter"
                        className={inputCls + " flex-1"}
                      />
                      <button
                        type="button"
                        onClick={() => addTag(mem.id, tagInputs[mem.id] || "")}
                        className="bg-amber-100 border border-amber-300 text-stone-700 text-sm font-semibold px-4 rounded-lg hover:bg-amber-200 transition whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    {/* Applied tags */}
                    {mem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {mem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 bg-stone-800 text-white text-xs font-semibold px-3 py-1 rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(mem.id, tag)}
                              className="text-white/60 hover:text-white font-bold leading-none transition"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─────────────────── Submit bar ───────────────────────── */}
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm px-7 py-5 flex items-center justify-between">
            <p className="text-sm text-stone-400 italic">
              <span className="font-bold text-stone-700">
                {memories.length}
              </span>{" "}
              memor{memories.length !== 1 ? "ies" : "y"} ·{" "}
              <span className="font-bold text-stone-700">
                {imagePreviews.length}
              </span>{" "}
              photo{imagePreviews.length !== 1 ? "s" : ""}
            </p>
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg shadow-amber-200 active:scale-95 transition"
            >
              Save Profile →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reusable helpers ──────────────────────────────────────────────────────────

function SectionHeading({ num, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="text-[11px] font-bold text-amber-400 font-mono tracking-widest">
        {num}
      </span>
      <span className="text-xs font-bold text-stone-700 uppercase tracking-[0.8px]">
        {title}
      </span>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="text-[11px] font-bold text-stone-600 uppercase tracking-[0.6px]">
      {children}
    </label>
  );
}
