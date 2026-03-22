import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  X,
  Pencil,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import SortableTagList from "./components/SortableTagList";

type Tab = "employment" | "education" | "certificates";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "employment", label: "Employment", icon: <Briefcase size={14} /> },
  { id: "education", label: "Education", icon: <GraduationCap size={14} /> },
  { id: "certificates", label: "Certificates", icon: <Award size={14} /> },
];

const inputClass =
  "w-full bg-background border border-border rounded-lg px-4 py-2.5 mb-3 text-text-primary text-sm focus:outline-none focus:border-accent";

export default function ExperienceManager() {
  const [tab, setTab] = useState<Tab>("employment");

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Experience</h1>
      <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1 border border-border w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm transition-colors",
              tab === t.id
                ? "bg-accent/10 text-accent"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "employment" && <EmploymentTab />}
      {tab === "education" && <EducationTab />}
      {tab === "certificates" && <CertificatesTab />}
    </div>
  );
}

// ─── Employment ────────────────────────────────────────

interface Employment {
  _id: string;
  company: string;
  companyDescription?: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  highlights: string[];
  techStack: string[];
}

function EmploymentTab() {
  const [items, setItems] = useState<Employment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employment | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const r = await api.get("/employment");
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employment entry?")) return;
    await api.delete(`/employment/${id}`);
    setItems((p) => p.filter((x) => x._id !== id));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> New Employment
        </button>
      </div>

      {showForm && (
        <EmploymentForm
          existing={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetch_();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {loading ? (
        <Loader2 className="animate-spin text-text-muted mx-auto" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {item.position}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {item.company}
                    {item.startDate &&
                      ` · ${new Date(item.startDate).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`}
                    {item.endDate
                      ? ` – ${new Date(item.endDate).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`
                      : " – Present"}
                  </p>
                  {item.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.techStack.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-text-muted hover:text-accent"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-text-muted hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmploymentForm({
  existing,
  onSaved,
  onCancel,
}: {
  existing: Employment | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [company, setCompany] = useState(existing?.company || "");
  const [companyDescription, setCompanyDescription] = useState(
    existing?.companyDescription || "",
  );
  const [position, setPosition] = useState(existing?.position || "");
  const [startDate, setStartDate] = useState(
    existing?.startDate ? existing.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    existing?.endDate ? existing.endDate.slice(0, 10) : "",
  );
  const [description, setDescription] = useState(
    existing?.description || "",
  );
  const [highlights, setHighlights] = useState(
    existing?.highlights?.join("\n") || "",
  );
  const [techStack, setTechStack] = useState<string[]>(
    existing?.techStack || [],
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      company,
      companyDescription: companyDescription || undefined,
      position,
      startDate,
      endDate: endDate || undefined,
      description: description || undefined,
      highlights: highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      techStack,
    };
    try {
      if (existing) {
        await api.put(`/employment/${existing._id}`, payload);
      } else {
        await api.post("/employment", payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          {existing ? "Edit Employment" : "New Employment"}
        </h3>
        <button type="button" onClick={onCancel} className="text-text-muted">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Company"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Position"
          required
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className={inputClass}
        />
      </div>
      <input
        placeholder="Company description (optional)"
        value={companyDescription}
        onChange={(e) => setCompanyDescription(e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputClass}
          placeholder="End date (blank = present)"
        />
      </div>
      <textarea
        placeholder="Description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputClass} resize-none`}
      />
      <textarea
        placeholder="Highlights (one per line)"
        rows={4}
        value={highlights}
        onChange={(e) => setHighlights(e.target.value)}
        className={`${inputClass} resize-none`}
      />
      <div className="mb-3">
        <label className="text-xs text-text-muted mb-1.5 block">
          Tech Stack (drag to reorder)
        </label>
        <SortableTagList
          items={techStack}
          onReorder={setTechStack}
          onRemove={(t) =>
            setTechStack((prev) => prev.filter((x) => x !== t))
          }
          onAdd={(t) => {
            if (!techStack.includes(t))
              setTechStack((prev) => [...prev, t]);
          }}
          placeholder="Add technology..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {existing ? "Save Changes" : "Create"}
      </button>
    </form>
  );
}

// ─── Education ─────────────────────────────────────────

interface Degree {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
  link?: string;
}

function EducationTab() {
  const [items, setItems] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Degree | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const r = await api.get("/degree");
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this degree?")) return;
    await api.delete(`/degree/${id}`);
    setItems((p) => p.filter((x) => x._id !== id));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> New Degree
        </button>
      </div>

      {showForm && (
        <DegreeForm
          existing={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetch_();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {loading ? (
        <Loader2 className="animate-spin text-text-muted mx-auto" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {item.degree}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {item.institution} · {item.fieldOfStudy}
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    {new Date(item.startDate).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                    {item.endDate
                      ? ` – ${new Date(item.endDate).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`
                      : " – Present"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-text-muted hover:text-accent"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-text-muted hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DegreeForm({
  existing,
  onSaved,
  onCancel,
}: {
  existing: Degree | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [institution, setInstitution] = useState(
    existing?.institution || "",
  );
  const [degree, setDegree] = useState(existing?.degree || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(
    existing?.fieldOfStudy || "",
  );
  const [startDate, setStartDate] = useState(
    existing?.startDate ? existing.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    existing?.endDate ? existing.endDate.slice(0, 10) : "",
  );
  const [description, setDescription] = useState(
    existing?.description || "",
  );
  const [link, setLink] = useState(existing?.link || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate: endDate || undefined,
      description: description || undefined,
      link: link || undefined,
    };
    try {
      if (existing) {
        await api.put(`/degree/${existing._id}`, payload);
      } else {
        await api.post("/degree", payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          {existing ? "Edit Degree" : "New Degree"}
        </h3>
        <button type="button" onClick={onCancel} className="text-text-muted">
          <X size={16} />
        </button>
      </div>

      <input
        placeholder="Institution"
        required
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Degree (e.g. Bachelor)"
          required
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Field of Study"
          required
          value={fieldOfStudy}
          onChange={(e) => setFieldOfStudy(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <textarea
        placeholder="Description (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputClass} resize-none`}
      />
      <input
        placeholder="Link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {existing ? "Save Changes" : "Create"}
      </button>
    </form>
  );
}

// ─── Certificates ──────────────────────────────────────

interface Certificate {
  _id: string;
  organization: string;
  certificateName: string;
  dateReceived: string;
  description?: string;
  link?: string;
  fileKey?: string;
}

function CertificatesTab() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const r = await api.get("/certificate");
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    await api.delete(`/certificate/${id}`);
    setItems((p) => p.filter((x) => x._id !== id));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> New Certificate
        </button>
      </div>

      {showForm && (
        <CertificateForm
          existing={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetch_();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {loading ? (
        <Loader2 className="animate-spin text-text-muted mx-auto" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {item.certificateName}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {item.organization} ·{" "}
                    {new Date(item.dateReceived).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                  </p>
                  {item.description && (
                    <p className="text-text-muted text-xs mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-text-muted hover:text-accent"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-text-muted hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CertificateForm({
  existing,
  onSaved,
  onCancel,
}: {
  existing: Certificate | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [organization, setOrganization] = useState(
    existing?.organization || "",
  );
  const [certificateName, setCertificateName] = useState(
    existing?.certificateName || "",
  );
  const [dateReceived, setDateReceived] = useState(
    existing?.dateReceived ? existing.dateReceived.slice(0, 10) : "",
  );
  const [description, setDescription] = useState(
    existing?.description || "",
  );
  const [link, setLink] = useState(existing?.link || "");
  const [fileKey, setFileKey] = useState(existing?.fileKey || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      organization,
      certificateName,
      dateReceived,
      description: description || undefined,
      link: link || undefined,
      fileKey: fileKey || undefined,
    };
    try {
      if (existing) {
        await api.put(`/certificate/${existing._id}`, payload);
      } else {
        await api.post("/certificate", payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          {existing ? "Edit Certificate" : "New Certificate"}
        </h3>
        <button type="button" onClick={onCancel} className="text-text-muted">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Organization"
          required
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Certificate Name"
          required
          value={certificateName}
          onChange={(e) => setCertificateName(e.target.value)}
          className={inputClass}
        />
      </div>
      <input
        type="date"
        required
        value={dateReceived}
        onChange={(e) => setDateReceived(e.target.value)}
        className={inputClass}
      />
      <textarea
        placeholder="Description (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputClass} resize-none`}
      />
      <input
        placeholder="URL link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className={inputClass}
      />
      <input
        placeholder="S3 file key (optional, for PDF)"
        value={fileKey}
        onChange={(e) => setFileKey(e.target.value)}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {existing ? "Save Changes" : "Create"}
      </button>
    </form>
  );
}
