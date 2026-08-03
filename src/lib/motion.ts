export const Motion = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,

  spring: {
    type: "spring" as const,
    stiffness: 260,
    damping: 22,
  },

  default: { duration: 0.25 },
};