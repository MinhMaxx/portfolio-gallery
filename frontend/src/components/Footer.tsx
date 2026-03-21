import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-text-muted text-sm">
          &copy; {new Date().getFullYear()} Minh Nguyen. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/MinhMaxx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <Github size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/bminhnguyen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <Linkedin size={18} />
          </a>
          <a
            href="mailto:contact@bminhnguyen.dev"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
