import type { Frame } from 'react-native-vision-camera'

export const poseEstimation = (frame: Frame) => {
  'worklet'
  // @ts-ignore
  return __poseEstimation(frame)
}

// This needs to match your native module name
const PLUGIN_NAME = 'poseEstimation'

// Register plugin if not in worklet
if (!global.WORKLET) {
  require('react-native-vision-camera').VisionCameraProxy.addFrameProcessor(PLUGIN_NAME)
}