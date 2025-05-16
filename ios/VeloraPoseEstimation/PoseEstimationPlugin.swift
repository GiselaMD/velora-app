// ios/VeloraPoseEstimation/PoseEstimationPlugin.swift
import Foundation
import VisionCamera
import AVFoundation
import MediaPipeTasksVision

// The class name matches what's in VeloraPoseEstimation.m
@objc(PoseEstimationPlugin)
public class PoseEstimationPlugin: FrameProcessorPlugin {
    private var helper: PoseDetectorHelper?
    private var lastProcessingTimestamp: Int = 0
    private let processingInterval: Int = 100 // ms between processing frames
    
    @objc override public init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
        super.init(proxy: proxy, options: options)
        
        print("🔵 PoseEstimationPlugin initializing...")
        
        do {
            helper = try PoseDetectorHelper(
                handle: 1,
                numPoses: 1,
                minPoseDetectionConfidence: 0.5,
                minPosePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
                shouldOutputSegmentationMasks: false,
                modelName: "pose_landmarker_full.task",
                delegate: 0,
                runningMode: .liveStream
            )
            helper?.liveStreamDelegate = self
            print("✅ PoseDetectorHelper initialized successfully")
        } catch {
            print("❌ Failed to initialize PoseDetectorHelper: \(error.localizedDescription)")
        }
    }
    
    @objc override public func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
        print("🔵 Frame processor callback called")
        
        guard let helper = self.helper else {
            print("⚠️ PoseDetectorHelper not initialized")
            return nil
        }
        
        let currentTimestamp = Int(Date().timeIntervalSince1970 * 1000)
        if currentTimestamp - lastProcessingTimestamp < processingInterval {
            return nil // Skip frame if too soon
        }
        lastProcessingTimestamp = currentTimestamp
        
        helper.detectAsync(
            sampleBuffer: frame.buffer,
            orientation: .up,
            timestamp: currentTimestamp
        )
        
        if let result = helper.lastResult {
            return serializePoseResult(result)
        }
        
        return nil
    }
    
    private func serializePoseResult(_ result: PoseLandmarkerResult) -> [[String: Any]] {
        return result.landmarks.map { pose in
            pose.map { landmark in
                return [
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z,
                    "visibility": landmark.visibility,
                    "presence": landmark.presence
                ]
            }
        }
    }
}

extension PoseEstimationPlugin: PoseDetectorHelperLiveStreamDelegate {
    public func poseDetectorHelper(
        _ poseDetectorHelper: PoseDetectorHelper,
        onResults result: PoseLandmarkerResult?,
        timestamp: Int,
        error: Error?
    ) {
        if let error = error {
            print("❌ Pose detection error: \(error.localizedDescription)")
            return
        }
        
        if let result = result {
            print("✅ Pose detected at timestamp: \(timestamp), poses: \(result.landmarks.count)")
        }
    }
}