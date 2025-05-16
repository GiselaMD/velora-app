// native/ios/templates/VeloraPoseEstimation.swift
import Foundation
import MediaPipeTasksVision

@objc(VeloraPoseEstimation)
class VeloraPoseEstimation: NSObject {
    private var poseLandmarker: PoseLandmarker?
    
    @objc
    func initialize(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            let modelPath = Bundle.main.path(forResource: "pose_landmarker_lite", ofType: "task")!
            let options = PoseLandmarkerOptions(baseOptions: BaseOptions(modelAssetPath: modelPath))
            poseLandmarker = try PoseLandmarker(options: options)
            resolve(true)
        } catch {
            reject("INIT_ERROR", "Failed to initialize pose landmarker: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func detectPose(_ sampleBuffer: CMSampleBuffer, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let poseLandmarker = poseLandmarker else {
            reject("NOT_INITIALIZED", "Pose landmarker not initialized", nil)
            return
        }
        
        do {
            let mpImage = try MPImage(sampleBuffer: sampleBuffer)
            let result = try poseLandmarker.detect(image: mpImage)
            
            let landmarks = result.poseLandmarks.map { poses in
                poses.map { landmark in
                    [
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z,
                        "visibility": landmark.visibility,
                        "presence": landmark.presence
                    ]
                }
            }
            
            resolve(landmarks)
        } catch {
            reject("DETECTION_ERROR", "Failed to detect pose: \(error.localizedDescription)", error)
        }
    }
}