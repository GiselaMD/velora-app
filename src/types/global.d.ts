// Global type definitions
export type BikeType = 'road' | 'time-trial' | 'mountain';

export interface GlobalPoseData {
  rawLandmarks: any[][];
  totalLandmarks: number;
  frameOrientation: any;
}

declare global {
  namespace NodeJS {
    interface Global {
      __poseEstimation: (frame: any) => any;
    }
  }
}