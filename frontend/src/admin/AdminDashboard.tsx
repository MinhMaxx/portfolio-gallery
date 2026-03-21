import { useState } from "react";
import {
  Camera,
  Briefcase,
  FolderOpen,
  LogOut,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PhotoManager from "./PhotoManager";
import WorkShowcaseManager from "./WorkShowcaseManager";

interface Props {
  onLogout: () => void;
}

type View = "photos" | "work" | "projects" | "experience";

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "photos", label: "Photos", icon: <Camera size={16} /> },
  { id: "work", label: "Work Showcase", icon: <ImageIcon size={16} /> },
  { id: "projects", label: "Projects", icon: <FolderOpen size={16} /> },
  { id: "experience", label: "Experience", icon: <Briefcase size={16} /> },
];

export default function AdminDashboard({ onLogout }: Props) {
  const [view, setView] = useState<View>("photos");

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 bg-surface border-r border-border p-4 flex flex-col">
        <h2 className="text-lg font-bold text-text-primary mb-6">Admin</h2>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                view === id
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            onLogout();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {view === "photos" && <PhotoManager />}
        {view === "work" && <WorkShowcaseManager />}
        {view === "projects" && (
          <ComingSoon label="Projects management coming soon" />
        )}
        {view === "experience" && (
          <ComingSoon label="Experience management coming soon" />
        )}
      </main>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-text-muted">
      {label}
    </div>
  );
}
