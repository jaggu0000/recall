"use client";

import { useState, useRef, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const RELATIONS = ["Parent", "Child", "Spouse", "Sibling", "Grandparent", "Friend", "Caregiver", "Other"];
const SUGGESTED_TAGS = ["Family", "Home", "Work", "Travel", "Childhood", "Food", "Music", "Hobby", "Pet", "Milestone"];

const RELATION_COLORS = {
  Parent:      "bg-violet-100 text-violet-700",
  Child:       "bg-sky-100 text-sky-700",
  Spouse:      "bg-rose-100 text-rose-700",
  Sibling:     "bg-teal-100 text-teal-700",
  Grandparent: "bg-amber-100 text-amber-700",
  Friend:      "bg-lime-100 text-lime-700",
  Caregiver:   "bg-orange-100 text-orange-700",
  Other:       "bg-stone-100 text-stone-600",
};

const PRIORITY_RING = [
  "ring-red-400",
  "ring-red-300",
  "ring-orange-400",
  "ring-orange-300",
  "ring-amber-400",
  "ring-amber-300",
  "ring-yellow-400",
  "ring-yellow-300",
  "ring-lime-400",
  "ring-green-400",
];

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_PERSONS = [
  {
    id: 1,
    name: "Margaret Ross",
    dateOfBirth: "1942-06-14",
    relation: "Parent",
    priority: 1,
    images: [],
    memories: [
      { id: 1, memory: "Loves afternoon tea by the garden window.", priority: 1, tags: ["Home", "Food"] },
      { id: 2, memory: "Used to sing Edelweiss every Sunday morning.", priority: 2, tags: ["Music", "Family"] },
    ],
    addedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Henry Calloway",
    dateOfBirth: "1938-11-02",
    relation: "Grandparent",
    priority: 2,
    images: [],
    memories: [
      { id: 3, memory: "Was a carpenter for 40 years, loves the smell of cedar.", priority: 1, tags: ["Work", "Childhood"] },
    ],
    addedAt: "2024-02-08",
  },
  {
    id: 3,
    name: "Eleanor Finch",
    dateOfBirth: "1950-03-27",
    relation: "Spouse",
    priority: 1,
    images: [],
    memories: [
      { id: 4, memory: "Met her husband at a jazz concert in 1972.", priority: 1, tags: ["Music", "Travel"] },
      { id: 5, memory: "Favourite dish is her mother's lamb stew.", priority: 2, tags: ["Food", "Family"] },
      { id: 6, memory: "Retired schoolteacher, still loves crosswords.", priority: 3, tags: ["Hobby"] },
    ],
    addedAt: "2024-03-11",
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function calcAge(dob) {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Avatar colours (stable per name) ────────────────────────────────────────
const AVATAR_PALETTES = [
  "bg-violet-200 text-violet-800",
  "bg-sky-200 text-sky-800",
  "bg-rose-200 text-rose-800",
  "bg-teal-200 text-teal-800",
  "bg-amber-200 text-amber-800",
  "bg-lime-200 text-lime-800",
  "bg-orange-200 text-orange-800",
  "bg-pink-200 text-pink-800",
];
function avatarColor(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_PALETTES[h % AVATAR_PALETTES.length];
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [persons, setPersons] = useState(SEED_PERSONS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null); // for detail modal
  const [search, setSearch] = useState("");

  const filtered = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.relation.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = (newPerson) => {
    setPersons((prev) => [newPerson, ...prev]);
    // Drawer stays open — form is already reset inside PersonForm
  };

  // Lock body scroll when drawer / detail open
  useEffect(() => {
    document.body.style.overflow = drawerOpen || selectedPerson ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, selectedPerson]);

  return (
    <div className="min-h-screen bg-stone-950 flex font-serif">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-stone-900 border-r border-stone-800 min-h-screen px-6 py-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <span className="text-3xl">🧠</span>
          <div>
            <p className="text-white font-bold text-base tracking-tight leading-tight">
              Recall
            </p>
            <p className="text-stone-500 text-[11px] italic">
              Restoring Moments
              <br /> one memory at time
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 mb-auto">
          {[
            { icon: "⊞", label: "Dashboard", active: false },
            // { icon: "👤", label: "Persons", active: false },
            { icon: "💭", label: "Memories", active: true },
            { icon: "📍", label: "Locations", active: false },
            { icon: "⚙️", label: "Settings", active: false },
          ].map(({ icon, label, active }) => (
            <button
              key={label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition
                ${
                  active
                    ? "bg-amber-400 text-stone-900 font-semibold shadow-lg shadow-amber-400/20"
                    : "text-stone-400 hover:bg-stone-800 hover:text-white"
                }`}
            >
              <span className="text-base">{icon}</span> {label}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div className="mt-8 space-y-3">
          <StatPill
            label="Total Persons"
            value={persons.length}
            color="text-amber-400"
          />
          <StatPill
            label="Total Memories"
            value={persons.reduce((s, p) => s + p.memories.length, 0)}
            color="text-emerald-400"
          />
          <StatPill
            label="High Priority"
            value={persons.filter((p) => p.priority <= 2).length}
            color="text-rose-400"
          />
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen bg-amber-50">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-amber-50/90 backdrop-blur border-b border-amber-100 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">
              Profiles
            </h1>
            <p className="text-xs text-stone-400 italic mt-0.5">
              {persons.length} people registered
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or relation…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-amber-200 bg-white text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
          </div>

          {/* Add button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-stone-800/20 active:scale-95 transition"
          >
            <span className="text-lg leading-none">＋</span>
            Add Person
          </button>
        </header>

        {/* Grid */}
        <div className="flex-1 p-6">
          {filtered.length === 0 ? (
            <EmptyState onAdd={() => setDrawerOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((person, i) => (
                <PersonTile
                  key={person.id}
                  person={person}
                  index={i}
                  onClick={() => setSelectedPerson(person)}
                />
              ))}

              {/* Ghost add tile */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="border-2 border-dashed border-amber-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition group min-h-[200px]"
              >
                <span className="text-4xl group-hover:scale-110 transition">
                  ＋
                </span>
                <span className="text-sm font-semibold">Add New Person</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Right Drawer (PersonForm) ─────────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-30 bg-stone-950/60 backdrop-blur-sm transition-opacity duration-300
          ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />
      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-2xl bg-amber-50 shadow-2xl overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="sticky top-0 z-10 bg-amber-50/95 backdrop-blur border-b border-amber-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="font-bold text-stone-800 text-base">New Profile</p>
              <p className="text-xs text-stone-400 italic">
                Fill in details and memories
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 text-xl flex items-center justify-center transition"
          >
            ×
          </button>
        </div>

        {/* Embedded form */}
        <div className="px-6 py-6">
          <PersonForm
            onSave={handleSave}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      </div>

      {/* ── Person Detail Modal ───────────────────────────────────────── */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PERSON TILE
// ─────────────────────────────────────────────────────────────────────────────
function PersonTile({ person, index, onClick }) {
  const ringColor = PRIORITY_RING[person.priority - 1] || "ring-stone-300";
  const relColor = RELATION_COLORS[person.relation] || RELATION_COLORS.Other;
  const avColor = avatarColor(person.name);
  const allTags = [...new Set(person.memories.flatMap((m) => m.tags))].slice(
    0,
    4,
  );

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="p-5">
        {/* Avatar + name row */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`relative shrink-0 w-14 h-14 rounded-2xl ${avColor} flex items-center justify-center text-xl font-bold ring-4 ring-offset-2 ring-white ${ringColor}`}
          >
            {person.images?.length > 0 && person.images[0]?.url ? (
              <img
                src={person.images[0].url}
                alt={person.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              getInitials(person.name)
            )}
            {/* Priority badge */}
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-800 text-white text-[10px] font-bold flex items-center justify-center">
              {person.priority}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-800 text-base truncate group-hover:text-amber-600 transition">
              {person.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${relColor}`}
              >
                {person.relation}
              </span>
              <span className="text-[11px] text-stone-400">
                Age {calcAge(person.dateOfBirth)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {/* <div className="flex gap-3 mb-4">
          <InfoChip icon="💭" label={`${person.memories.length} memor${person.memories.length !== 1 ? "ies" : "y"}`} />
          <InfoChip icon="📅" label={formatDate(person.dateOfBirth)} />
        </div> */}

        {/* Tag chips */}
        {/* {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium">
                {tag}
              </span>
            ))}
            {person.memories.flatMap((m) => m.tags).length > 4 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-semibold">
                +{person.memories.flatMap((m) => m.tags).length - 4} more
              </span>
            )}
          </div>
        )} */}
      </div>

      {/* Footer */}
      <div className="border-t border-amber-50 px-5 py-3 flex items-center justify-between bg-amber-50/50">
        <span className="text-[11px] text-stone-400">
          Added {formatDate(person.addedAt)}
        </span>
        <span className="text-xs text-amber-500 font-semibold group-hover:translate-x-1 transition">
          View →
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PERSON DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PersonDetailModal({ person, onClose }) {
  const avColor = avatarColor(person.name);
  const relColor = RELATION_COLORS[person.relation] || RELATION_COLORS.Other;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Modal header */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-stone-100 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${avColor} flex items-center justify-center text-lg font-bold`}>
                {person.images?.[0]?.url ? (
                  <img src={person.images[0].url} alt={person.name} className="w-full h-full object-cover rounded-2xl" />
                ) : getInitials(person.name)}
              </div>
              <div>
                <h2 className="font-bold text-stone-800 text-lg">{person.name}</h2>
                <div className="flex gap-2 mt-0.5">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${relColor}`}>{person.relation}</span>
                  <span className="text-[11px] text-stone-400">Age {calcAge(person.dateOfBirth)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 text-xl flex items-center justify-center transition"
            >
              ×
            </button>
          </div>

          {/* Details */}
          <div className="px-6 py-6 space-y-6">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Date of Birth" value={formatDate(person.dateOfBirth)} />
              <Detail label="Priority" value={`Level ${person.priority}`} />
              <Detail label="Added On" value={formatDate(person.addedAt)} />
              <Detail label="Memories" value={`${person.memories.length} recorded`} />
            </div>

            {/* Memories */}
            {person.memories.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Memory Log</p>
                <div className="space-y-3">
                  {person.memories.map((mem) => (
                    <div key={mem.id} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-stone-700 leading-relaxed">{mem.memory}</p>
                        <span className="shrink-0 text-[10px] font-bold bg-stone-800 text-white px-2 py-0.5 rounded-full">
                          P{mem.priority}
                        </span>
                      </div>
                      {mem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {mem.tags.map((t) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 bg-white border border-amber-200 rounded-full text-amber-700 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PERSON FORM (drawer-embedded version)
// ─────────────────────────────────────────────────────────────────────────────
function PersonForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", images: [], dateOfBirth: "", relation: "", priority: "" });
  const [memories, setMemories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tagInputs, setTagInputs] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false); // brief success banner
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setForm({ name: "", images: [], dateOfBirth: "", relation: "", priority: "" });
    setMemories([]);
    setImagePreviews([]);
    setTagInputs({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addMemory = () => {
    const id = Date.now();
    setMemories((prev) => [...prev, { id, memory: "", priority: "", tags: [] }]);
    setTagInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const removeMemory = (id) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setTagInputs((prev) => { const c = { ...prev }; delete c[id]; return c; });
  };

  const updateMemory = (id, key, value) =>
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));

  const addTag = (id, tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id && !m.tags.includes(trimmed) ? { ...m, tags: [...m.tags, trimmed] } : m
      )
    );
    setTagInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const removeTag = (memId, tag) =>
    setMemories((prev) =>
      prev.map((m) => (m.id === memId ? { ...m, tags: m.tags.filter((t) => t !== tag) } : m))
    );

  const handleTagKeyDown = (e, id) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(id, tagInputs[id] || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const newPerson = {
      id: Date.now(),
      ...form,
      memories,
      addedAt: new Date().toISOString().slice(0, 10),
    };

    // ── Swap this for your real DB / API call ──────────────────────
    // await fetch("/api/persons", { method: "POST", body: JSON.stringify(newPerson) });
    console.log("Saving to database:", newPerson);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    // ──────────────────────────────────────────────────────────────

    // Reset all fields back to initial empty state
    resetForm();
    setSaving(false);

    // Notify parent to add to list, then show brief success flash
    onSave?.(newPerson);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  const inputCls =
    "w-full rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-stone-800 font-serif placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Saved flash banner ── */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out
          ${savedFlash ? "max-h-20 opacity-100 mb-0" : "max-h-0 opacity-0"}`}
      >
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5">
          <span className="w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center shrink-0">✓</span>
          <div>
            <p className="text-sm font-bold text-emerald-800">Profile saved successfully!</p>
            <p className="text-xs text-emerald-600">Form has been reset — ready for the next person.</p>
          </div>
        </div>
      </div>

      {/* ── Person Info ── */}
      <FormSection num="01" title="Person Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <FormLabel>Full Name</FormLabel>
            <input name="name" value={form.name} onChange={handleField} required placeholder="e.g. Margaret Eleanor Ross" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel>Date of Birth</FormLabel>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleField} required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel>Your Relation</FormLabel>
            <select name="relation" value={form.relation} onChange={handleField} required className={inputCls + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select relation…</option>
              {RELATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel>Priority <span className="text-stone-400 font-normal text-[10px] normal-case">(1 = highest)</span></FormLabel>
            <input type="number" name="priority" value={form.priority} onChange={handleField} required min={1} max={10} placeholder="1 – 10" className={inputCls + " max-w-[140px]"} />
          </div>
        </div>
      </FormSection>

      {/* ── Photos ── */}
      <FormSection num="02" title="Person Photos">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-amber-200 rounded-xl py-8 text-center cursor-pointer bg-amber-50 hover:bg-amber-100 hover:border-amber-400 transition"
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
          <div className="text-3xl mb-1">📷</div>
          <p className="text-sm font-semibold text-stone-700">Click to upload photos</p>
          <p className="text-xs text-stone-400 mt-0.5">PNG, JPG, WEBP — multiple allowed</p>
        </div>
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {imagePreviews.map((img, i) => (
              <div key={i} className="relative w-16 text-center">
                <img src={img.url} alt={img.name} className="w-16 h-16 object-cover rounded-xl border-2 border-amber-100" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600 transition">×</button>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {/* ── Memories ── */}
      <FormSection num="03" title="Memory Log" action={
        <button type="button" onClick={addMemory} className="flex items-center gap-1.5 bg-stone-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-stone-700 active:scale-95 transition">
          <span className="text-base leading-none">＋</span> Add Memory
        </button>
      }>
        {memories.length === 0 && (
          <div className="border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-xl py-8 text-center">
            <span className="text-2xl block mb-1">💭</span>
            <p className="text-sm font-semibold text-stone-700">No memories yet.</p>
            <p className="text-xs text-stone-400 mt-0.5">Click <strong>+ Add Memory</strong> to begin.</p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {memories.map((mem, idx) => (
            <div key={mem.id} className="border border-amber-100 rounded-xl bg-amber-50 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-500 tracking-widest uppercase font-mono">Memory #{idx + 1}</span>
                <button type="button" onClick={() => removeMemory(mem.id)} className="text-xs text-red-500 font-semibold underline hover:text-red-700 transition">Remove</button>
              </div>
              <div className="flex flex-col gap-1.5">
                <FormLabel>Description</FormLabel>
                <textarea value={mem.memory} onChange={(e) => updateMemory(mem.id, "memory", e.target.value)} required rows={2} placeholder="Describe the memory…" className={inputCls + " resize-y min-h-[64px]"} />
              </div>
              <div className="flex flex-col gap-1.5">
                <FormLabel>Priority <span className="text-stone-400 font-normal text-[10px] normal-case">(1 = most important)</span></FormLabel>
                <input type="number" value={mem.priority} onChange={(e) => updateMemory(mem.id, "priority", e.target.value)} required min={1} max={10} placeholder="1 – 10" className={inputCls + " max-w-[120px]"} />
              </div>
              <div className="flex flex-col gap-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.filter((t) => !mem.tags.includes(t)).map((t) => (
                    <button key={t} type="button" onClick={() => addTag(mem.id, t)} className="text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-500 hover:text-white transition">+ {t}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagInputs[mem.id] || ""} onChange={(e) => setTagInputs((prev) => ({ ...prev, [mem.id]: e.target.value }))} onKeyDown={(e) => handleTagKeyDown(e, mem.id)} placeholder="Custom tag + Enter" className={inputCls + " flex-1"} />
                  <button type="button" onClick={() => addTag(mem.id, tagInputs[mem.id] || "")} className="bg-amber-100 border border-amber-300 text-stone-700 text-xs font-semibold px-3 rounded-lg hover:bg-amber-200 transition">Add</button>
                </div>
                {mem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {mem.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-stone-800 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(mem.id, tag)} className="text-white/60 hover:text-white font-bold leading-none">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-amber-100 px-5 py-4">
        <p className="text-xs text-stone-400 italic">
          <span className="font-bold text-stone-700">{memories.length}</span> memor{memories.length !== 1 ? "ies" : "y"} ·{" "}
          <span className="font-bold text-stone-700">{imagePreviews.length}</span> photo{imagePreviews.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="text-sm text-stone-500 font-semibold px-4 py-2.5 rounded-xl hover:bg-stone-100 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-200 active:scale-95 transition"
          >
            {saving ? (
              <><span className="animate-spin inline-block">⟳</span> Saving…</>
            ) : (
              "Save Profile →"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center justify-between bg-stone-800 rounded-xl px-4 py-3">
      <span className="text-stone-400 text-xs">{label}</span>
      <span className={`font-bold text-lg leading-none ${color}`}>{value}</span>
    </div>
  );
}

function InfoChip({ icon, label }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-full font-medium">
      {icon} {label}
    </span>
  );
}

function FormSection({ num, title, children, action }) {
  return (
    <section className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-400 font-mono tracking-widest">{num}</span>
          <span className="text-xs font-bold text-stone-700 uppercase tracking-[0.8px]">{title}</span>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function FormLabel({ children }) {
  return (
    <label className="text-[11px] font-bold text-stone-600 uppercase tracking-[0.6px]">{children}</label>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-stone-50 rounded-xl p-3">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-stone-800">{value}</p>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <span className="text-5xl mb-4">🧠</span>
      <h3 className="text-lg font-bold text-stone-700 mb-1">No persons found</h3>
      <p className="text-sm text-stone-400 mb-5">Start by adding your first person profile.</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-stone-800 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition"
      >
        <span className="text-lg">＋</span> Add First Person
      </button>
    </div>
  );
}
