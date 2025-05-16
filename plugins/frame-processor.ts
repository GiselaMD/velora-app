// plugins/frame-processor.ts
import type { Frame } from 'react-native-vision-camera';

/**
 * Processes a frame through the pose estimation plugin.
 * Makes sure to use the correct function name that matches the one exported in VeloraPoseEstimation.m
 */
export function poseEstimation(frame: Frame) {
  'worklet';
  
  try {
    // @ts-ignore - this function is injected by VisionCamera at runtime
    // The function name should be __poseEstimation to match what's registered in the Obj-C file
    return global.__poseEstimation(frame);
  } catch (e) {
    console.log('[worklet] Pose estimation error:', String(e));
    return [];
  }
}