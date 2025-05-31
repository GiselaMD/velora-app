import type { PoseLandmark, AngleData } from '../types/pose.types';

export class PoseProcessor {
  static calculateAngle(pointA: PoseLandmark, pointB: PoseLandmark, pointC: PoseLandmark): number {
    const AB = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
    const BC = Math.sqrt(Math.pow(pointB.x - pointC.x, 2) + Math.pow(pointB.y - pointC.y, 2));
    const AC = Math.sqrt(Math.pow(pointC.x - pointA.x, 2) + Math.pow(pointC.y - pointA.y, 2));
    
    const angle = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
    return Math.round(angle * (180 / Math.PI));
  }

  static extractKeyAngles(landmarks: PoseLandmark[]): AngleData {
    // MediaPipe Pose landmark indices
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const leftShoulder = landmarks[11];

    // Calculate knee angle (hip-knee-ankle)
    const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    
    // Calculate hip angle (shoulder-hip-knee)
    const hipAngle = this.calculateAngle(leftShoulder, leftHip, leftKnee);
    
    // Calculate back angle (approximation using shoulder and hip)
    const backAngle = Math.abs(Math.atan2(
      leftShoulder.y - leftHip.y,
      leftShoulder.x - leftHip.x
    ) * (180 / Math.PI));

    return {
      kneeAngle,
      hipAngle,
      backAngle: Math.round(backAngle)
    };
  }

  static isValidPose(landmarks: PoseLandmark[]): boolean {
    const requiredLandmarks = [11, 23, 25, 27]; // shoulder, hip, knee, ankle
    return requiredLandmarks.every(index => 
      landmarks[index] && landmarks[index].visibility > 0.5
    );
  }
}