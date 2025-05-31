export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence: number;
}

export interface PoseResult {
  landmarks: PoseLandmark[];
  timestamp: number;
}

export interface AngleData {
  kneeAngle: number;
  hipAngle: number;
  backAngle: number;
}