import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Github, Linkedin, Mail, FileDown } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

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
    <section id="contact" className="py-24 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Get In Touch"
          subtitle="Let's build something together"
        />

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-text-secondary leading-relaxed mb-8">
              I&apos;m always open to new opportunities and collaborations.
              Whether you have a project in mind or just want to say hi, feel
              free to reach out!
            </p>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:contact@bminhnguyen.dev"
                className="flex items-center gap-3 text-text-secondary hover:text-accent transition-colors"
              >
                <Mail size={18} />
                contact@bminhnguyen.dev
              </a>
              <a
                href="https://github.com/MinhMaxx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-secondary hover:text-accent transition-colors"
              >
                <Github size={18} />
                github.com/MinhMaxx
              </a>
              <a
                href="https://www.linkedin.com/in/bminhnguyen"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-secondary hover:text-accent transition-colors"
              >
                <Linkedin size={18} />
                linkedin.com/in/bminhnguyen
              </a>
            </div>

            <a
              href="/assets/resume.pdf"
              download
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all"
            >
              <FileDown size={16} />
              Download Resume
            </a>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <input
              type="text"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <textarea
              placeholder="Your Message"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />

            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {status === "sending" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            {status === "sent" && (
              <p className="text-green-400 text-sm">
                Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm">
                Failed to send. Please try again or email me directly.
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}
