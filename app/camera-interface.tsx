"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
// import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
// import { FilesetResolver } from "@mediapipe/tasks-vision";
import Svg, { Circle, Line } from "react-native-svg";
import { router } from "expo-router";

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Frame processing configuration
const FRAME_DELAY = 100; // Process a frame every 100ms
const IMAGE_QUALITY = 0.3; // 30% quality for faster processing

// Colors for pose visualization
const JOINT_COLOR = "#7C3AED"; // Purple
const CONNECTION_COLOR = "#EDE9FF"; // Light purple

// Skeleton connections for visualization
const skeletonConnections = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["right_shoulder", "right_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
  ["left_knee", "left_ankle"],
  ["right_knee", "right_ankle"],
];

// Types
interface Keypoint {
  name: string;
  x: number;
  y: number;
  score: number;
}

interface BodyAngles {
  kneeAngle: number;
  hipAngle: number;
  backAngle: number;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export default function CameraInterface() {
  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Camera and detection state
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPoseDetectionActive, setPoseDetectionActive] = useState(false);
  const [poseKeypoints, setPoseKeypoints] = useState<Keypoint[]>([]);
  const [bodyAngles, setBodyAngles] = useState<BodyAngles>({
    kneeAngle: 32,
    hipAngle: 45,
    backAngle: 28,
  });
  const [poseQuality, setPoseQuality] = useState("Adjusting...");
  const [poseConfidence, setPoseConfidence] = useState(0);

  // Refs
  const cameraRef = useRef<CameraView>(null);
  const poseRef = useRef<Pose | null>(null);
  const lastProcessedTime = useRef(0);

  // Calculate body angles from keypoints
  const calculateBodyAngles = useCallback((keypoints: Keypoint[]) => {
    // Helper function to calculate angle between three points
    const calculateAngle = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number }
    ) => {
      if (!p1 || !p2 || !p3) return 0;

      const radians =
        Math.atan2(p3.y - p2.y, p3.x - p2.x) -
        Math.atan2(p1.y - p2.y, p1.x - p2.x);
      let angle = Math.abs((radians * 180.0) / Math.PI);

      if (angle > 180.0) {
        angle = 360.0 - angle;
      }

      return Math.round(angle);
    };

    // Find keypoint by name
    const findKeypoint = (name: string): Keypoint | undefined => {
      return keypoints.find((kp: Keypoint) => kp.name === name);
    };

    // Get key body points
    const leftHip = findKeypoint("left_hip");
    const leftKnee = findKeypoint("left_knee");
    const leftAnkle = findKeypoint("left_ankle");
    const leftShoulder = findKeypoint("left_shoulder");

    // Calculate angles
    let kneeAngle = 32; // Default values
    let hipAngle = 45;
    let backAngle = 28;

    if (leftHip && leftKnee && leftAnkle) {
      kneeAngle = calculateAngle(
        { x: leftHip.x, y: leftHip.y },
        { x: leftKnee.x, y: leftKnee.y },
        { x: leftAnkle.x, y: leftAnkle.y }
      );
    }

    if (leftShoulder && leftHip && leftKnee) {
      hipAngle = calculateAngle(
        { x: leftShoulder.x, y: leftShoulder.y },
        { x: leftHip.x, y: leftHip.y },
        { x: leftKnee.x, y: leftKnee.y }
      );
    }

    if (leftShoulder && leftHip) {
      // Calculate back angle (approximation)
      backAngle = Math.round(
        Math.abs(
          90 -
            (Math.atan2(
              Math.abs(leftShoulder.y - leftHip.y),
              Math.abs(leftShoulder.x - leftHip.x)
            ) *
              180.0) /
              Math.PI
        )
      );
    }

    setBodyAngles({
      kneeAngle,
      hipAngle,
      backAngle,
    });

    // Determine pose quality based on confidence
    const avgConfidence =
      keypoints.reduce((sum, kp) => sum + kp.score, 0) / keypoints.length;
    setPoseConfidence(avgConfidence);
    setPoseQuality(
      avgConfidence > 0.7 ? "Good posture detected" : "Adjust your position"
    );
  }, []);

  // Initialize MediaPipe pose detector
  useEffect(() => {
    const initPoseDetector = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2.1614787780/pose.js"
        );

        const pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2.1614787780/${file}`;
          },
        });

        pose.setOptions({
          selfieMode: true,
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (results.poseLandmarks) {
            const keypoints = results.poseLandmarks.map(
              (landmark: Landmark, index: number) => ({
                name: `keypoint_${index}`,
                x: landmark.x,
                y: landmark.y,
                score: landmark.visibility || 0,
              })
            );

            setPoseKeypoints(keypoints);
            calculateBodyAngles(keypoints);
          }
        });

        poseRef.current = pose;
        setPoseDetectionActive(true);
        console.log("Pose detector initialized successfully");
      } catch (error) {
        console.error("Failed to initialize pose detector:", error);
      }
    };

    if (permission?.granted) {
      initPoseDetector();
    }

    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [permission?.granted]);

  // Process camera frames
  const processFrame = useCallback(async () => {
    if (!cameraRef.current || !poseRef.current) return;

    const currentTime = Date.now();
    if (currentTime - lastProcessedTime.current < FRAME_DELAY) {
      requestAnimationFrame(processFrame);
      return;
    }

    try {
      const frame = await cameraRef.current.takePictureAsync({
        quality: IMAGE_QUALITY,
        base64: true,
        skipProcessing: true,
      });

      if (frame) {
        await poseRef.current.send({ image: frame });
        lastProcessedTime.current = currentTime;
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    }

    requestAnimationFrame(processFrame);
  }, []);

  const handleCameraReady = useCallback(() => {
    console.log("Camera ready");
    lastProcessedTime.current = 0;
    processFrame();
  }, [processFrame]);

  // Get keypoint position for visualization
  const getKeypointPosition = useCallback(
    (name: string) => {
      const keypoint = poseKeypoints.find((kp: Keypoint) => kp.name === name);
      return keypoint
        ? {
            x: keypoint.x * screenWidth,
            y: keypoint.y * screenHeight,
          }
        : null;
    },
    [poseKeypoints]
  );

  // Toggle recording state
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setCountdown(null);
      router.navigate("analysis-results", { bodyAngles: String(bodyAngles) });
    } else {
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown((prevCount: number | null) => {
          if (prevCount !== null && prevCount <= 1) {
            clearInterval(countdownInterval);
            setIsRecording(true);
            return null;
          }
          return prevCount !== null ? prevCount - 1 : null;
        });
      }, 1000);
    }
  }, [isRecording, bodyAngles]);

  // If camera permissions are still loading
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="mb-4 text-xl text-gray-800">
          Loading camera permissions...
        </Text>
      </View>
    );
  }

  // If camera permissions are not granted
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-4">
        <View className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-purple-600">
          <Text className="text-lg text-white">🚲</Text>
        </View>
        <Text className="mb-2 text-2xl font-bold text-gray-900">
          Camera Access Needed
        </Text>
        <Text className="mb-6 text-center text-gray-600">
          We need camera access to analyze your bike position and provide
          accurate fit recommendations.
        </Text>
        <TouchableOpacity
          className="items-center rounded-xl bg-purple-600 px-8 py-4"
          onPress={async () => {
            const result = await requestPermission();
            if (result.granted) {
              handleCameraReady();
            }
          }}
        >
          <Text className="text-lg font-semibold text-white">
            Grant Camera Access
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-4" onPress={() => navigation.goBack()}>
          <Text className="text-purple-600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />

      {/* Pose skeleton visualization */}
      {isPoseDetectionActive && poseKeypoints.length > 0 && (
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          {/* Draw connections between joints */}
          {skeletonConnections.map((connection, index) => {
            const p1 = getKeypointPosition(connection[0]);
            const p2 = getKeypointPosition(connection[1]);

            if (p1 && p2) {
              return (
                <Line
                  key={`connection-${index}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={CONNECTION_COLOR}
                  strokeWidth="2"
                />
              );
            }
            return null;
          })}

          {/* Draw joints */}
          {poseKeypoints.map((keypoint: Keypoint, index: number) => (
            <Circle
              key={`keypoint-${index}`}
              cx={keypoint.x * screenWidth}
              cy={keypoint.y * screenHeight}
              r="4"
              fill={JOINT_COLOR}
            />
          ))}
        </Svg>
      )}

      <SafeAreaView className="absolute inset-0">
        {/* Pose Detection Status */}
        {isPoseDetectionActive && (
          <View className="absolute left-0 right-0 top-20 items-center">
            <View className="flex-row items-center rounded-full bg-purple-600/80 px-4 py-2">
              <View
                className={`mr-2 h-3 w-3 rounded-full ${
                  poseConfidence > 0.7 ? "bg-green-400" : "bg-yellow-400"
                }`}
              />
              <Text className="font-medium text-white">{poseQuality}</Text>
            </View>
          </View>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <View className="absolute left-0 right-0 top-32 items-center">
            <View className="flex-row items-center rounded-full bg-red-500 px-4 py-2">
              <View className="mr-2 h-3 w-3 rounded-full bg-white" />
              <Text className="font-medium text-white">Recording</Text>
            </View>
          </View>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <Text className="text-7xl font-bold text-white">{countdown}</Text>
          </View>
        )}

        {/* Angle Measurements Display */}
        {isPoseDetectionActive && (
          <View className="absolute right-4 top-1/3 rounded-lg bg-black/70 p-3">
            <Text className="mb-1 font-semibold text-white">
              Live Measurements
            </Text>
            <View className="space-y-1">
              <Text className="text-white">Knee: {bodyAngles.kneeAngle}°</Text>
              <Text className="text-white">Hip: {bodyAngles.hipAngle}°</Text>
              <Text className="text-white">Back: {bodyAngles.backAngle}°</Text>
            </View>
          </View>
        )}

        {/* Position Guide */}
        <View className="absolute bottom-40 left-4 right-4">
          <View className="rounded-xl bg-black/70 p-4">
            <Text className="mb-2 text-lg font-semibold text-white">
              Position Guide
            </Text>
            <View className="mb-2 flex-row items-center">
              <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                <Text className="text-xs text-white">✓</Text>
              </View>
              <Text className="flex-1 text-white">
                Align your bike within the dashed outline
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                <Text className="text-xs text-white">✓</Text>
              </View>
              <Text className="flex-1 text-white">
                Maintain your natural riding position
              </Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View className="absolute bottom-0 left-0 right-0 items-center pb-10">
          <TouchableOpacity
            onPress={toggleRecording}
            className={`h-20 w-20 items-center justify-center rounded-full border-4 ${
              isRecording
                ? "border-red-500 bg-red-500"
                : "border-white bg-white/20"
            }`}
          >
            <View
              className={`h-12 w-12 rounded-full ${
                isRecording ? "bg-white" : "bg-red-500"
              }`}
            />
          </TouchableOpacity>

          <Text className="mt-4 font-medium text-white">
            {isRecording ? "Tap to stop" : "Tap to record"}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
