import { useFrameProcessor } from 'react-native-vision-camera'
import { runOnJS } from 'react-native-reanimated'
import type { Frame } from 'react-native-vision-camera'
import type { PoseLandmark } from '../types/pose.types'

export const poseEstimation = (frame: Frame) => {
  'worklet'
  // @ts-ignore
  return __poseEstimation(frame)
}

export function usePoseAnalysis(
  onPoseDetected: (landmarks: PoseLandmark[]) => void,
  enabled: boolean = true
) {
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    if (!enabled) return

    try {
      const poses = poseEstimation(frame)
      if (poses?.[0]) {
        runOnJS(onPoseDetected)(poses[0])
      }
    } catch (error) {
      runOnJS(console.error)('Pose estimation error:', error)
    }
  }, [enabled, onPoseDetected])

  return frameProcessor
}