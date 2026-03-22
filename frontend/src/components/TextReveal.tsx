import { motion } from "framer-motion";

interface Props {
  text: string;
  className?: string;
  textClassName?: string;
  delay?: number;
  staggerChildren?: number;
}

export default function TextReveal({
  text,
  className = "",
  textClassName = "",
  delay = 0,
  staggerChildren = 0.03,
}: Props) {
  const words = text.split(" ");

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren, delayChildren: delay } },
      }}
      className={className}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className={`inline-block ${textClassName}`}
            variants={{
              hidden: { y: "100%", opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
