// app/utils/frameProcessor.ts
import { VisionCameraProxy, Frame } from 'react-native-vision-camera';

interface PoseInfo {
  width: number;
  height: number;
  timestamp: number;
}

console.log('[POSE] Initializing plugin...');
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseEstimation', {});
console.log('[POSE] Plugin initialized:', plugin ? 'success' : 'failed');

export function processPoseEstimation(frame: Frame): PoseInfo {
  'worklet';
  
  try {
    if (plugin == null) {
      console.log('[POSE] Plugin not initialized');
      throw new Error('Failed to load Frame Processor Plugin "poseEstimation"!');
    }
    
    const result = plugin.call(frame);
    console.log('[POSE] Frame processed:', result);
    return result as PoseInfo;
  } catch (error) {
    console.log('[POSE] Error:', error);
    throw error;
  }
}