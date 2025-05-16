// app/camera-interface.tsx
import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions } from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor, VisionCameraProxy, type Frame} from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { router } from "expo-router";
import Svg, { Circle, Line } from 'react-native-svg';

console.log('Initializing poseEstimation plugin...');
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseEstimation', {});

if (!plugin) {
  console.error('Failed to initialize poseEstimation plugin');
} else {
  console.log('Successfully initialized poseEstimation plugin');
}

/**
 * Processes a frame through the pose estimation plugin.
 */
function poseEstimation(frame: Frame) {
  'worklet';
  
  if (!plugin || typeof plugin.call !== 'function') {
    console.warn('❌ Plugin not initialized');
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

// Keypoint connections for basic pose skeleton
const connections = [
  [11, 13], // Right shoulder to right elbow
  [13, 15], // Right elbow to right wrist
  [12, 14], // Left shoulder to left elbow
  [14, 16], // Left elbow to left wrist
  [11, 12], // Shoulders
  [23, 24], // Hips
  [11, 23], // Right shoulder to right hip
  [12, 24], // Left shoulder to left hip
  [23, 25], // Right hip to right knee
  [24, 26], // Left hip to left knee
  [25, 27], // Right knee to right ankle
  [26, 28], // Left knee to left ankle
];

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence: number;
}

export default function CameraInterface() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  // Create JS functions to be called from worklets
  const handlePoseDetection = (detectedLandmarks: PoseLandmark[]) => {
    setLandmarks(detectedLandmarks);
  };
  
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [info, ...prev.slice(0, 9)]); // Keep last 10 messages
  };

  // Create worklet-compatible versions using useRunOnJS
  const handlePoseDetectionJS = useRunOnJS(handlePoseDetection, []);
  const addDebugInfoJS = useRunOnJS(addDebugInfo, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    if (!isAnalyzing) return;

    try {
      addDebugInfoJS(`Processing frame: ${frame.width}x${frame.height}`);
      
      const pose = poseEstimation(frame);
      
      if (pose?.length > 0) {
        addDebugInfoJS(`Detected pose with ${pose[0].length} landmarks`);
        handlePoseDetectionJS(pose[0]);
      } else {
        addDebugInfoJS('No pose detected');
      }
    } catch (error) {
      addDebugInfoJS(`Error: ${String(error)}`);
    }
  }, [isAnalyzing]);

  const handleStartAnalysis = () => {
    if (isAnalyzing) {
      // If we have landmarks, calculate angles and navigate
      if (landmarks.length > 0) {
        const angles = calculateBodyAngles(landmarks);
        router.push({
          pathname: '/analysis-results',
          params: { bodyAngles: JSON.stringify(angles) }
        });
      }
    } else {
      setIsAnalyzing(true);
      setDebugInfo(['Starting analysis...']);
    }
  };

  const calculateBodyAngles = (poses: PoseLandmark[]) => {
    // These indices are based on MediaPipe's pose landmark model
    const hipIdx = 24; // Right hip
    const kneeIdx = 26; // Right knee
    const ankleIdx = 28; // Right ankle
    const shoulderIdx = 12; // Right shoulder

    const kneeAngle = calculateAngle(
      poses[hipIdx],
      poses[kneeIdx],
      poses[ankleIdx]
    );

    const hipAngle = calculateAngle(
      poses[shoulderIdx],
      poses[hipIdx],
      poses[kneeIdx]
    );

    const backAngle = calculateVerticalAngle(
      poses[shoulderIdx],
      poses[hipIdx]
    );

    return {
      kneeAngle: Math.round(kneeAngle),
      hipAngle: Math.round(hipAngle),
      backAngle: Math.round(backAngle)
    };
  };

  const calculateAngle = (a: PoseLandmark, b: PoseLandmark, c: PoseLandmark) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  };

  const calculateVerticalAngle = (a: PoseLandmark, b: PoseLandmark) => {
    const radians = Math.atan2(b.y - a.y, b.x - a.x);
    return Math.abs(radians * 180.0 / Math.PI);
  };

  if (!hasPermission) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="mb-4 text-center">Camera access required</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-violet-600 px-6 py-3 rounded-full">
          <Text className="text-white font-bold text-base">Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="mb-4 text-center">No camera device found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />

      {/* Pose Visualization */}
      {landmarks.length > 0 && (
        <Svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: screenWidth,
            height: screenHeight,
          }}
        >
          {/* Draw connections */}
          {connections.map((connection, index) => {
            const [start, end] = connection;
            const startLandmark = landmarks[start];
            const endLandmark = landmarks[end];
            
            if (startLandmark && endLandmark &&
                startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
              return (
                <Line
                  key={index}
                  x1={startLandmark.x * screenWidth}
                  y1={startLandmark.y * screenHeight}
                  x2={endLandmark.x * screenWidth}
                  y2={endLandmark.y * screenHeight}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            }
            return null;
          })}

          {/* Draw landmarks */}
          {landmarks.map((landmark, index) => (
            landmark.visibility > 0.5 && (
              <Circle
                key={index}
                cx={landmark.x * screenWidth}
                cy={landmark.y * screenHeight}
                r="4"
                fill="#6D28D9"
                stroke="white"
                strokeWidth="2"
              />
            )
          ))}
        </Svg>
      )}

      {/* Debug Info */}
      <View className="absolute top-12 left-4 right-4 bg-black/70 rounded-lg p-4 max-h-40">
        {debugInfo.map((info, index) => (
          <Text key={index} className="text-white text-xs mb-1">{info}</Text>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleStartAnalysis}
        className="absolute bottom-10 left-0 right-0 items-center"
      >
        <Text className="bg-violet-600 px-6 py-3 rounded-full text-white font-bold text-base">
          {isAnalyzing ? 'Complete Analysis' : 'Start Analysis'}
        </Text>
      </TouchableOpacity>

      {isAnalyzing && (
        <View className="absolute top-2 left-4 right-4 bg-black/50 rounded-lg p-4">
          <Text className="text-white text-center">
            Position yourself in the frame and hold your cycling position
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}