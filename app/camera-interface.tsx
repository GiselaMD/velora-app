import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { processPoseEstimation } from '../plugins/frameProcessor';
import { router } from "expo-router";
import Svg, { Line } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Key landmarks for bike fitting
const KEY_LANDMARKS = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface PoseData {
  detected: boolean;
  keyPoints: Record<string, { x: number; y: number; visibility: number }>;
  totalLandmarks: number;
  rawLandmarks?: PoseLandmark[][];
}

export default function CameraInterface() {
  const [frameInfo, setFrameInfo] = useState<any>(null);
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  // Camera setup
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front'); // Using back camera for bike fitting
  
  // Request camera permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);
  
  // Create JS functions to update state from worklets
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 19)]);
  };
  
  const updateFrameInfo = (info: any) => {
    setFrameInfo(info);
    
    // Process pose data if available
    if (info && Array.isArray(info) && info.length > 0) {
      // MediaPipe returns array of poses, each pose is array of landmarks
      const landmarks = info[0]; // First pose
      
      if (landmarks && landmarks.length > 0) {
        const keyPoints: Record<string, { x: number; y: number; visibility: number }> = {};
        
        // Extract key landmarks for bike fitting
        Object.entries(KEY_LANDMARKS).forEach(([name, index]) => {
          if (landmarks[index]) {
            keyPoints[name] = {
              x: landmarks[index].x,
              y: landmarks[index].y,
              visibility: landmarks[index].visibility || 0,
            };
          }
        });
        
        setPoseData({
          detected: true,
          keyPoints,
          totalLandmarks: landmarks.length,
          rawLandmarks: info,
        });
        
        addLog(`Pose detected with ${landmarks.length} landmarks`);
      }
    } else if (info && info.error) {
      addLog(`Error: ${info.error}`);
      setPoseData({ detected: false, keyPoints: {}, totalLandmarks: 0 });
    } else {
      setPoseData({ detected: false, keyPoints: {}, totalLandmarks: 0 });
    }
  };
  
  // Create worklet-compatible versions
  const addLogJS = useRunOnJS(addLog, []);
  const updateFrameInfoJS = useRunOnJS(updateFrameInfo, []);
  
  // Frame processor
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      const result = processPoseEstimation(frame);
      updateFrameInfoJS(result);
    } catch (error) {
      addLogJS(`Frame processor error: ${String(error)}`);
    }
  }, []);

  // Render pose visualization overlay
  const renderPoseOverlay = () => {
    if (!poseData || !poseData.detected || !poseData.rawLandmarks) return null;
    
    const landmarks = poseData.rawLandmarks[0]; // First pose
    const cameraAspectRatio = device ? device.format?.videoHeight / device.format?.videoWidth : 1;
    const screenAspectRatio = screenHeight / screenWidth;
    
    // Calculate scaling factors
    let overlayWidth = screenWidth;
    let overlayHeight = screenHeight;
    
    if (cameraAspectRatio > screenAspectRatio) {
      overlayWidth = screenHeight / cameraAspectRatio;
    } else {
      overlayHeight = screenWidth * cameraAspectRatio;
    }
    
    return (
      <View style={[styles.poseOverlay, { width: overlayWidth, height: overlayHeight }]}>
        {/* Draw skeleton connections */}
        <Svg width={overlayWidth} height={overlayHeight} style={StyleSheet.absoluteFillObject}>
          {/* Body connections */}
          {renderConnection(landmarks, 11, 12, overlayWidth, overlayHeight)} {/* Shoulders */}
          {renderConnection(landmarks, 11, 13, overlayWidth, overlayHeight)} {/* Left arm upper */}
          {renderConnection(landmarks, 13, 15, overlayWidth, overlayHeight)} {/* Left arm lower */}
          {renderConnection(landmarks, 12, 14, overlayWidth, overlayHeight)} {/* Right arm upper */}
          {renderConnection(landmarks, 14, 16, overlayWidth, overlayHeight)} {/* Right arm lower */}
          {renderConnection(landmarks, 11, 23, overlayWidth, overlayHeight)} {/* Left torso */}
          {renderConnection(landmarks, 12, 24, overlayWidth, overlayHeight)} {/* Right torso */}
          {renderConnection(landmarks, 23, 24, overlayWidth, overlayHeight)} {/* Hips */}
          {renderConnection(landmarks, 23, 25, overlayWidth, overlayHeight)} {/* Left leg upper */}
          {renderConnection(landmarks, 25, 27, overlayWidth, overlayHeight)} {/* Left leg lower */}
          {renderConnection(landmarks, 24, 26, overlayWidth, overlayHeight)} {/* Right leg upper */}
          {renderConnection(landmarks, 26, 28, overlayWidth, overlayHeight)} {/* Right leg lower */}
        </Svg>
        
        {/* Draw landmark points */}
        {landmarks.map((landmark: PoseLandmark, index: number) => {
          if (landmark.visibility < 0.5) return null;
          
          const x = landmark.x * overlayWidth;
          const y = landmark.y * overlayHeight;
          
          return (
            <View
              key={index}
              style={[
                styles.landmarkDot,
                {
                  left: x - 4,
                  top: y - 4,
                  backgroundColor: getColorForLandmark(index),
                }
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  const renderConnection = (
    landmarks: PoseLandmark[],
    index1: number,
    index2: number,
    width: number,
    height: number
  ) => {
    if (!landmarks[index1] || !landmarks[index2]) return null;
    if (landmarks[index1].visibility < 0.5 || landmarks[index2].visibility < 0.5) return null;
    
    return (
      <Line
        x1={landmarks[index1].x * width}
        y1={landmarks[index1].y * height}
        x2={landmarks[index2].x * width}
        y2={landmarks[index2].y * height}
        stroke="#4ADE80"
        strokeWidth="2"
      />
    );
  };
  
  const getColorForLandmark = (index: number) => {
    // Color code different body parts
    if (index >= 0 && index <= 10) return '#60A5FA'; // Face - blue
    if (index >= 11 && index <= 16) return '#F87171'; // Arms - red
    if (index >= 17 && index <= 22) return '#FBBF24'; // Hands - yellow
    if (index >= 23 && index <= 28) return '#4ADE80'; // Legs - green
    return '#A78BFA'; // Other - purple
  };

  // Render pose info panel
  const renderPoseInfo = () => {
    if (!poseData || !poseData.detected) {
      return (
        <View style={styles.infoPanel}>
          <Text style={styles.infoTitle}>Waiting for pose detection...</Text>
          <Text style={styles.infoText}>Position yourself in view of the camera</Text>
        </View>
      );
    }
    
    const keyPoints = poseData.keyPoints;
    const visiblePoints = Object.entries(keyPoints).filter(([_, point]) => point.visibility > 0.5);
    
    return (
      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>Pose Detected</Text>
        <Text style={styles.infoText}>
          Tracking {visiblePoints.length}/{Object.keys(KEY_LANDMARKS).length} key points
        </Text>
        <View style={styles.landmarkGrid}>
          {Object.entries(keyPoints).map(([name, point]) => (
            <View key={name} style={styles.landmarkItem}>
              <Text style={styles.landmarkName}>{name}:</Text>
              <Text style={[
                styles.landmarkValue,
                { color: point.visibility > 0.5 ? '#4ADE80' : '#EF4444' }
              ]}>
                {point.visibility > 0.5 ? '✓' : '✗'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera access is required for pose detection</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>No camera device found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      
      {/* Pose skeleton overlay */}
      {renderPoseOverlay()}
      
      {/* UI Overlay */}
      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bike Fit Analysis</Text>
          <TouchableOpacity onPress={() => setShowDebug(!showDebug)} style={styles.debugButton}>
            <Text style={styles.debugButtonText}>{showDebug ? 'Hide' : 'Debug'}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Pose Info Panel */}
        {renderPoseInfo()}
        
        {/* Debug Panel */}
        {showDebug && (
          <ScrollView style={styles.debugPanel}>
            <Text style={styles.debugTitle}>Debug Logs:</Text>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </ScrollView>
        )}
        
        {/* Action Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.captureButton, { opacity: poseData?.detected ? 1 : 0.5 }]}
            disabled={!poseData?.detected}
            onPress={() => {
              // TODO: Implement capture/analysis logic
              console.log('Capturing pose data...');
            }}
          >
            <Text style={styles.captureButtonText}>Analyze Position</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  debugButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
  },
  infoPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
  },
  infoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  landmarkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  landmarkItem: {
    flexDirection: 'row',
    width: '50%',
    paddingVertical: 2,
  },
  landmarkName: {
    color: 'white',
    fontSize: 12,
    flex: 1,
  },
  landmarkValue: {
    fontSize: 12,
    width: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  debugPanel: {
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 10,
    maxHeight: 200,
  },
  debugTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logText: {
    color: 'white',
    fontSize: 11,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  captureButton: {
    backgroundColor: '#6D28D9',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  poseOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    transform: [{ translateY: -screenHeight / 2 }],
  },
  landmarkDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white',
  },
});