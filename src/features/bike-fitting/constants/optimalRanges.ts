export const OPTIMAL_ANGLES = {
  knee: {
    min: 25,
    max: 35,
    optimal: 30
  },
  hip: {
    min: 40,
    max: 50,
    optimal: 45
  },
  back: {
    min: 20,
    max: 45,
    optimal: 30
  }
} as const;

export const SETUP_INSTRUCTIONS = [
  "Ensure your bike is mounted securely on a level surface",
  "Position yourself in your natural riding posture, seated on the bike",
  "Ensure your entire body and bike are visible in the frame",
  "Keep your bike parallel to the camera",
] as const;