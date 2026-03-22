import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import TextReveal from "@/components/TextReveal";
import { useTheme } from "@/lib/ThemeProvider";

export default function Hero() {
  const { theme } = useTheme();
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center px-8 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-sunrise-yellow/[0.08] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-sunrise-orange/[0.06] rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-sunrise-coral/[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-text-secondary text-base md:text-lg tracking-[0.3em] uppercase mb-6"
        >
          Full Stack Developer &mdash; Perth, WA
        </motion.p>

        <h1 className="text-[clamp(3rem,12vw,11rem)] font-black leading-[0.85] tracking-tighter">
          <TextReveal
            text="BINH MINH"
            delay={0.4}
            textClassName={theme === "light" ? "text-sunrise" : ""}
          />
          <br />
          <TextReveal
            text="NGUYEN"
            delay={0.6}
            className="light-sunrise-stroke text-transparent [-webkit-text-stroke:2px_var(--color-text)]"
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-10 flex flex-col md:flex-row md:items-end gap-6 md:gap-16"
        >
          <div className="text-xl md:text-2xl text-text-secondary font-light h-8">
            <TypeAnimation
              sequence={[
                "Building with AWS & Salesforce",
                2500,
                "Capturing moments through a lens",
                2500,
                "Turning complexity into clarity",
                2500,
              ]}
              wrapper="span"
              speed={40}
              repeat={Infinity}
            />
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.33, 1, 0.68, 1] }}
            className="hidden md:block flex-1 h-px bg-border origin-left"
          />

          <motion.a
            href="#projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="group flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-text-secondary hover:text-text transition-colors duration-300"
          >
            Explore my work
            <span className="inline-block w-8 h-px bg-text-secondary group-hover:w-14 group-hover:bg-sunrise transition-all duration-300" />
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        className="absolute bottom-10 left-8 text-text-muted text-xs tracking-[0.2em] uppercase"
      >
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll
        </motion.span>
      </motion.div>
    </section>
  );
}
