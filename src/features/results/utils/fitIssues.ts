export interface FitIssue {
  mistake: string;
  symptoms: string;
}

export const commonFitIssues: FitIssue[] = [
  {
    mistake: "Saddle too high",
    symptoms: "Hip rocking, knee pain (back of knee), overreaching",
  },
  {
    mistake: "Saddle too low",
    symptoms: "Anterior knee pain, inefficient pedaling",
  },
  {
    mistake: "Bars too low",
    symptoms: "Neck, back, wrist pain",
  },
  {
    mistake: "Bars too far",
    symptoms: "Shoulder/neck tension, numb hands",
  },
  {
    mistake: "Wrong frame size",
    symptoms: "Constant discomfort, hard to dial in fit",
  },
];