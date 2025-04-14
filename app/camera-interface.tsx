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
import Svg, { Circle, Line } from "react-native-svg";
import { router } from "expo-router";
import LocalPoseEstimationModule from "../modules/local-pose-estimation";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const FRAME_DELAY = 100;
const IMAGE_QUALITY = 0.3;

const JOINT_COLOR = "#7C3AED";
const CONNECTION_COLOR = "#EDE9FF";

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

interface Keypoint {
  name: string;
  x: number;
  y: number;
  score: number;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface BodyAngles {
  kneeAngle: number;
  hipAngle: number;
  backAngle: number;
}

export default function CameraInterface() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [poseKeypoints, setPoseKeypoints] = useState<Keypoint[]>([]);
  const [bodyAngles, setBodyAngles] = useState<BodyAngles>({
    kneeAngle: 32,
    hipAngle: 45,
    backAngle: 28,
  });
  const [poseQuality, setPoseQuality] = useState("Adjusting...");
  const [poseConfidence, setPoseConfidence] = useState(0);

  const cameraRef = useRef<CameraView>(null);
  const lastProcessedTime = useRef(0);

  const calculateBodyAngles = useCallback((keypoints: Keypoint[]) => {
    const calculateAngle = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number }
    ) => {
      const radians =
        Math.atan2(p3.y - p2.y, p3.x - p2.x) -
        Math.atan2(p1.y - p2.y, p1.x - p2.x);
      let angle = Math.abs((radians * 180.0) / Math.PI);
      if (angle > 180) angle = 360 - angle;
      return Math.round(angle);
    };

    const findKeypoint = (name: string) =>
      keypoints.find((kp) => kp.name === name);

    const leftHip = findKeypoint("left_hip");
    const leftKnee = findKeypoint("left_knee");
    const leftAnkle = findKeypoint("left_ankle");
    const leftShoulder = findKeypoint("left_shoulder");

    let kneeAngle = 32,
      hipAngle = 45,
      backAngle = 28;

    if (leftHip && leftKnee && leftAnkle) {
      kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    }

    if (leftShoulder && leftHip && leftKnee) {
      hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    }

    if (leftShoulder && leftHip) {
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

    setBodyAngles({ kneeAngle, hipAngle, backAngle });

    const avgConfidence =
      keypoints.reduce((sum, kp) => sum + kp.score, 0) / keypoints.length;
    setPoseConfidence(avgConfidence);
    setPoseQuality(
      avgConfidence > 0.7 ? "Good posture detected" : "Adjust your position"
    );
  }, []);

  const processFrame = useCallback(async () => {
    if (!cameraRef.current) return;

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

      if (frame?.base64) {
        const landmarks: Landmark[] =
          await LocalPoseEstimationModule.estimatePose(frame.base64);

        const keypoints: Keypoint[] = landmarks.map((lm, index) => ({
          name: `keypoint_${index}`,
          x: lm.x,
          y: lm.y,
          score: lm.visibility ?? 1,
        }));

        setPoseKeypoints(keypoints);
        calculateBodyAngles(keypoints);
        lastProcessedTime.current = currentTime;
      }
    } catch (error) {
      console.error("Native pose estimation failed:", error);
    }

    requestAnimationFrame(processFrame);
  }, [calculateBodyAngles]);

  const handleCameraReady = useCallback(() => {
    lastProcessedTime.current = 0;
    processFrame();
  }, [processFrame]);

  const getKeypointPosition = useCallback(
    (name: string) => {
      const keypoint = poseKeypoints.find((kp) => kp.name === name);
      return keypoint
        ? { x: keypoint.x * screenWidth, y: keypoint.y * screenHeight }
        : null;
    },
    [poseKeypoints]
  );

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setCountdown(null);
      router.navigate("analysis-results", {
        bodyAngles: JSON.stringify(bodyAngles),
      });
    } else {
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(countdownInterval);
            setIsRecording(true);
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
  }, [isRecording, bodyAngles]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Camera access required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.button}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        onCameraReady={handleCameraReady}
      />
      <Svg style={StyleSheet.absoluteFill}>
        {poseKeypoints.map((kp, index) => (
          <Circle
            key={index}
            cx={kp.x * screenWidth}
            cy={kp.y * screenHeight}
            r="4"
            fill={JOINT_COLOR}
          />
        ))}
        {skeletonConnections.map(([start, end], index) => {
          const p1 = getKeypointPosition(start);
          const p2 = getKeypointPosition(end);
          return p1 && p2 ? (
            <Line
              key={index}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={CONNECTION_COLOR}
              strokeWidth="2"
            />
          ) : null;
        })}
      </Svg>
      <TouchableOpacity style={styles.buttonContainer} onPress={toggleRecording}>
        <Text style={styles.button}>
          {isRecording ? "Stop" : countdown ? `Starting in ${countdown}` : "Start"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
