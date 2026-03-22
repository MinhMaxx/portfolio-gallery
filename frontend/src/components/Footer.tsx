export default function Footer() {
  return (
    <footer className="border-t border-border py-12 px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-text-muted text-sm tracking-wide">
          &copy; {new Date().getFullYear()} Binh Minh Nguyen
        </p>
        <div className="flex items-center gap-8">
          {[
            { label: "GitHub", href: "https://github.com/MinhMaxx" },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/bminhnguyen",
            },
            { label: "Email", href: "mailto:contact@bminhnguyen.dev" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-sm text-text-muted hover:text-text transition-colors duration-300 tracking-wide uppercase"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
