import type { Variants } from "motion/react";
import { Motion } from "./motion";

export const fade: Variants = {
  initial: { opacity: 0, transition: { duration: Motion.normal } },
  animate: { opacity: 1, transition: { duration: Motion.normal } },
  exit: { opacity: 0, transition: { duration: Motion.normal } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 12, transition: { duration: Motion.normal, ease: "easeOut" } },
  animate: { opacity: 1, y: 0, transition: { duration: Motion.normal, ease: "easeOut" } },
  exit: { opacity: 0, y: 8, transition: { duration: Motion.normal, ease: "easeOut" } },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -12, transition: { duration: Motion.normal, ease: "easeOut" } },
  animate: { opacity: 1, y: 0, transition: { duration: Motion.normal, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: Motion.normal, ease: "easeOut" } },
};

export const scale: Variants = {
  initial: { opacity: 0, scale: 0.96, transition: { duration: Motion.fast, ease: "easeOut" } },
  animate: { opacity: 1, scale: 1, transition: { duration: Motion.fast, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: Motion.fast, ease: "easeOut" } },
};

export const pop: Variants = {
  initial: { opacity: 0, scale: 0.9, transition: Motion.spring },
  animate: { opacity: 1, scale: 1, transition: Motion.spring },
  exit: { opacity: 0, scale: 0.94, transition: Motion.spring },
};

export const toast: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97, transition: { duration: Motion.fast, ease: "easeOut" } },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: Motion.fast, ease: "easeOut" } },
  exit: { opacity: 0, y: 12, scale: 0.97, transition: { duration: Motion.fast, ease: "easeOut" } },
};

export const modal: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8, transition: { duration: Motion.fast, ease: "easeOut" } },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: Motion.fast, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: Motion.fast, ease: "easeOut" } },
};

export const dropdown: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.99, transition: { duration: Motion.fast, ease: "easeOut" } },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: Motion.fast, ease: "easeOut" } },
  exit: { opacity: 0, y: -4, scale: 0.99, transition: { duration: Motion.fast, ease: "easeOut" } },
};

export const staggerContainer = (stagger = 0.04, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: Motion.fast, ease: "easeOut" } },
};