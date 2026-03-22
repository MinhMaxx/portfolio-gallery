import { useState, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { getFileUrl } from "@/lib/constants";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/resume")
      .then((r) => {
        if (r.data.fileKey) setResumeUrl(getFileUrl(r.data.fileKey));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/contact/submit", form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 md:py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <ScrollReveal>
              <p className="text-text-muted text-sm tracking-[0.3em] uppercase mb-4">
                Get In Touch
              </p>
              <h2 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] light-sunrise">
                LET&apos;S
                <br />
                <span className="light-sunrise-stroke text-transparent [-webkit-text-stroke:2px_var(--color-text)]">
                  TALK
                </span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mt-8 text-text-secondary leading-relaxed max-w-md text-lg">
                Open to new opportunities, collaborations, and interesting
                conversations. Drop me a line.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-12 space-y-4">
                {[
                  {
                    label: "Email",
                    value: "contact@bminhnguyen.dev",
                    href: "mailto:contact@bminhnguyen.dev",
                  },
                  {
                    label: "GitHub",
                    value: "MinhMaxx",
                    href: "https://github.com/MinhMaxx",
                  },
                  {
                    label: "LinkedIn",
                    value: "bminhnguyen",
                    href: "https://www.linkedin.com/in/bminhnguyen",
                  },
                ].map(({ label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="group flex items-center justify-between py-4 border-b border-border hover:border-border-light transition-colors"
                  >
                    <span className="text-text-muted text-sm uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="flex items-center gap-2 text-text group-hover:text-accent transition-colors">
                      {value}
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </span>
                  </a>
                ))}
              </div>
            </ScrollReveal>

            {resumeUrl && (
              <ScrollReveal delay={0.4}>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 inline-flex items-center gap-3 group"
                >
                  <span className="text-sm uppercase tracking-[0.2em] text-text-secondary group-hover:text-text transition-colors">
                    View Resume
                  </span>
                  <span className="w-8 h-px bg-text-muted group-hover:w-14 group-hover:bg-sunrise transition-all duration-300" />
                </a>
              </ScrollReveal>
            )}
          </div>

          <ScrollReveal direction="right">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
              <div>
                <label className="text-text-muted text-xs uppercase tracking-[0.2em] block mb-3">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-border focus:border-accent py-3 text-text text-lg outline-none transition-colors placeholder:text-text-muted/30"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-text-muted text-xs uppercase tracking-[0.2em] block mb-3">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-border focus:border-accent py-3 text-text text-lg outline-none transition-colors placeholder:text-text-muted/30"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="text-text-muted text-xs uppercase tracking-[0.2em] block mb-3">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-border focus:border-accent py-3 text-text text-lg outline-none transition-colors resize-none placeholder:text-text-muted/30"
                  placeholder="Tell me about your project..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === "sending"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 group flex items-center justify-center gap-3 py-4 bg-text text-bg font-bold text-sm uppercase tracking-[0.2em] rounded-xl hover:bg-sunrise hover:text-white transition-colors disabled:opacity-50"
              >
                {status === "sending" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Send Message"
                )}
              </motion.button>

              {status === "sent" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-sm text-center"
                >
                  Message sent — I&apos;ll get back to you soon.
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  Something went wrong. Try emailing me directly.
                </motion.p>
              )}
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
