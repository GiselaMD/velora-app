// app/utils/frameProcessors.ts
import { VisionCameraProxy, Frame } from 'react-native-vision-camera';

interface FrameInfo {
  width: number;
  height: number;
  timestamp: number;
}

// Initialize plugin
console.log('Initializing simplest plugin...');console.log('[Setup] Attempting to initialize plugin...');
const plugin = VisionCameraProxy.initFrameProcessorPlugin('simplest', {});
console.log('[Setup] Plugin initialization result:', plugin ? 'success' : 'failed');

// Export a type-safe frame processor function
export function simplestProcessor(frame: Frame): FrameInfo | null {
  'worklet';
    console.log('[Worklet] Frame received:', frame.width, 'x', frame.height);

  
  if (!plugin) {
    console.log('[worklet] Simplest plugin not initialized');
    return null;
  }
  
  try {
    // Call the native plugin
    return plugin.call(frame) as FrameInfo;
  } catch (e) {
    console.log('[worklet] Simplest plugin error:', String(e));
    return null;
  }
}