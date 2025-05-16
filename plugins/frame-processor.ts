import { VisionCameraProxy, type Frame } from 'react-native-vision-camera';

console.log('Initializing poseEstimation plugin...');
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseEstimation', {});

if (!plugin) {
  console.error('Failed to initialize poseEstimation plugin!');
} else {
  console.log('Successfully initialized poseEstimation plugin');
}

/**
 * Processes a frame through the pose estimation plugin.
 */
export function poseEstimation(frame: Frame) {
  'worklet';
  
  if (!plugin) {
    console.log('[worklet] Plugin not initialized');
    return [];
  }
  
  try {
    // Call the native plugin
    const result = plugin.call(frame, {});
    console.log('[worklet] Plugin call result type:', result ? typeof result : 'null');
    return result || [];
  } catch (e) {
    console.log('[worklet] Pose estimation error:', String(e));
    return [];
  }
}