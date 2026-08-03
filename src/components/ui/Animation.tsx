import { type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Motion } from "../../lib/motion";
import { fade, scale, slideUp, staggerContainer, staggerItem } from "../../lib/animations";

export function Fade({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: Motion.normal, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList({
  children,
  className = "",
  stagger = 0.04,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      variants={staggerContainer(stagger)}
      initial="hidden"
      animate="show"
      exit="hidden"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

export function PageTransition({
  children,
  animateKey,
}: {
  children: ReactNode;
  animateKey?: string | number;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={animateKey}
        variants={fade}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ScaleIn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={scale}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}