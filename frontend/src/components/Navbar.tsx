import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/ThemeProvider";

const navLinks = [
  { label: "Projects", path: "/projects" },
  { label: "Experience", path: "/experience" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-bg/60 backdrop-blur-2xl" : "bg-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="text-text font-bold text-xl tracking-tight hover:text-accent transition-colors duration-300"
        >
          BMN<span className="text-sunrise">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "group relative text-sm tracking-wide uppercase transition-colors duration-300",
                location.pathname === path
                  ? "text-text"
                  : "text-text-secondary hover:text-text"
              )}
            >
              {label}
              {location.pathname === path && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-sunrise"
                  transition={{ duration: 0.3 }}
                />
              )}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-sunrise transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          <button
            onClick={toggle}
            className="relative w-9 h-9 rounded-full border border-border hover:border-border-light flex items-center justify-center transition-all duration-300 group"
            aria-label="Toggle theme"
          >
            <motion.div
              key={theme}
              initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "dark" ? (
                <Moon size={14} className="text-text-secondary group-hover:text-text transition-colors" />
              ) : (
                <Sun size={14} className="text-text-secondary group-hover:text-text transition-colors" />
              )}
            </motion.div>
          </button>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggle}
            className="relative w-8 h-8 rounded-full border border-border flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Moon size={14} className="text-text-secondary" />
            ) : (
              <Sun size={14} className="text-text-secondary" />
            )}
          </button>

          <button
            className="relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              className="w-6 h-px bg-text block"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-6 h-px bg-text block"
            />
            <motion.span
              animate={
                mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }
              }
              className="w-6 h-px bg-text block"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="md:hidden bg-bg/95 backdrop-blur-2xl border-t border-border"
          >
            <div className="px-8 py-8 flex flex-col gap-6">
              {navLinks.map(({ label, path }, i) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={path}
                    className={cn(
                      "text-2xl font-bold transition-colors",
                      location.pathname === path
                        ? "text-accent"
                        : "text-text-secondary hover:text-text"
                    )}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
