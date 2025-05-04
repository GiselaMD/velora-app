import Foundation
import VisionCamera
import AVFoundation
import MediaPipeTasksVision

@objc(PoseEstimationFrameProcessorPlugin)
public class PoseEstimationFrameProcessorPlugin: FrameProcessorPlugin {
  private var landmarker: PoseLandmarker?

  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)

    print("🟡 PoseEstimationFrameProcessorPlugin init called")

    do {
      print("🟠 Attempting to load landmarker...")
      self.landmarker = try Self.loadLandmarker()
      self.landmarker?.delegate = self
      print("✅ PoseLandmarker initialized in livestream mode")
    } catch {
      print("❌ Failed to load pose landmarker: \(error.localizedDescription)")
    }
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    let sampleBuffer = frame.buffer

    // Convert to MPImage
    guard let mpImage = try? MPImage(sampleBuffer: sampleBuffer) else {
      print("⚠️ Failed to convert CMSampleBuffer to MPImage")
      return nil
    }

    // Extract timestamp in ms
    let timestamp = Int(CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sampleBuffer)) * 1000)

    guard let landmarker = self.landmarker else {
      print("⚠️ Pose landmarker not initialized")
      return nil
    }

    do {
      try landmarker.detectAsync(image: mpImage, timestampInMilliseconds: timestamp)
    } catch {
      print("⚠️ detectAsync failed: \(error)")
    }

    return nil // results will come in delegate callback
  }

  private static func loadLandmarker() throws -> PoseLandmarker {
    print("📦 Looking for model path...")
    guard let modelPath = Bundle.main.path(forResource: "pose_landmarker_full", ofType: "task") else {
      throw NSError(domain: "PoseEstimation", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model not found in bundle"])
    }

    print("📍 Model path found: \(modelPath)")

    var options = PoseLandmarkerOptions()
    options.baseOptions.modelAssetPath = modelPath
    options.runningMode = .liveStream
    options.outputSegmentationMasks = false
    options.numPoses = 1

    return try PoseLandmarker(options: options)
  }
}

// MARK: - PoseLandmarkerLiveStreamDelegate
extension PoseEstimationFrameProcessorPlugin: PoseLandmarkerLiveStreamDelegate {
  public func poseLandmarker(
    _ landmarker: PoseLandmarker,
    didFinishDetection result: PoseLandmarkerResult?,
    timestampInMilliseconds timestamp: Int,
    error: Error?
  ) {
    if let error = error {
      print("❌ Detection error: \(error)")
      return
    }

    guard let result = result else {
      print("⚠️ No pose detected")
      return
    }

    let serializedLandmarks = result.landmarks.map { pose in
      pose.map { landmark in
        [
          "x": landmark.x,
          "y": landmark.y,
          "z": landmark.z,
          "visibility": landmark.visibility
        ]
      }
    }

    print("✅ Async Pose result: \(serializedLandmarks)")
    // Optionally: send this to JS via event emitter if needed
  }
}
