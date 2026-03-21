import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";

interface Employment {
  _id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Degree {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Certificate {
  _id: string;
  organization: string;
  certificateName: string;
  dateReceived: string;
  description?: string;
  link?: string;
}

type Tab = "employment" | "education" | "certificates";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "employment", label: "Employment", icon: <Briefcase size={16} /> },
  { id: "education", label: "Education", icon: <GraduationCap size={16} /> },
  { id: "certificates", label: "Certificates", icon: <Award size={16} /> },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    month: "short",
    year: "numeric",
  });
}

export default function Experience() {
  const [activeTab, setActiveTab] = useState<Tab>("employment");
  const [employment, setEmployment] = useState<Employment[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    api.get("/employment").then((r) => setEmployment(r.data)).catch(() => {});
    api.get("/degree").then((r) => setDegrees(r.data)).catch(() => {});
    api.get("/certificate").then((r) => setCertificates(r.data)).catch(() => {});
  }, []);

  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title="Experience" subtitle="My professional journey" />

        <div className="flex gap-2 mb-10 overflow-x-auto">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === id
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2" />

          {activeTab === "employment" &&
            employment.map((item, i) => (
              <TimelineItem key={item._id} index={i}>
                <h3 className="font-semibold text-text-primary">
                  {item.position}
                </h3>
                <p className="text-accent text-sm">{item.company}</p>
                <p className="text-text-muted text-xs mt-1">
                  {formatDate(item.startDate)} —{" "}
                  {item.endDate ? formatDate(item.endDate) : "Present"}
                </p>
                {item.description && (
                  <p className="text-text-secondary text-sm mt-3 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </TimelineItem>
            ))}

          {activeTab === "education" &&
            degrees.map((item, i) => (
              <TimelineItem key={item._id} index={i}>
                <h3 className="font-semibold text-text-primary">
                  {item.degree} — {item.fieldOfStudy}
                </h3>
                <p className="text-accent text-sm">{item.institution}</p>
                <p className="text-text-muted text-xs mt-1">
                  {formatDate(item.startDate)} —{" "}
                  {item.endDate ? formatDate(item.endDate) : "Present"}
                </p>
                {item.description && (
                  <p className="text-text-secondary text-sm mt-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </TimelineItem>
            ))}

          {activeTab === "certificates" &&
            certificates.map((item, i) => (
              <TimelineItem key={item._id} index={i}>
                <h3 className="font-semibold text-text-primary">
                  {item.certificateName}
                </h3>
                <p className="text-accent text-sm">{item.organization}</p>
                <p className="text-text-muted text-xs mt-1">
                  {formatDate(item.dateReceived)}
                </p>
                {item.description && (
                  <p className="text-text-secondary text-sm mt-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-sm mt-2 inline-block hover:underline"
                  >
                    View Certificate
                  </a>
                )}
              </TimelineItem>
            ))}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const isLeft = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "relative pl-12 md:pl-0 mb-10 md:w-1/2",
        isLeft ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12"
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-3 h-3 rounded-full bg-accent border-2 border-background",
          "left-3 md:left-auto",
          isLeft ? "md:right-[-6.5px]" : "md:left-[-6.5px]"
        )}
      />
      <div className="bg-surface rounded-xl p-5 border border-border hover:border-border/80 transition-colors">
        {children}
      </div>
    </motion.div>
  );
}
