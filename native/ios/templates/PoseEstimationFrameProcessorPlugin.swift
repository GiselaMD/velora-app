import Foundation
import VisionCamera
import AVFoundation
import MediaPipeTasksVision

@objc(PoseEstimationFrameProcessorPlugin)
public class PoseEstimationFrameProcessorPlugin: FrameProcessorPlugin {
  private let detectorHandle = 1  // Fixed handle for now
  private var helper: PoseDetectorHelper?

  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)

    print("🟡 PoseEstimationFrameProcessorPlugin init called")

    do {
      helper = try PoseDetectorHelper(
        handle: detectorHandle,
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        shouldOutputSegmentationMasks: false,
        modelName: "pose_landmarker_full.task",
        delegate: 0,
        runningMode: .liveStream
      )
      print("✅ PoseDetectorHelper created")
    } catch {
      print("❌ Failed to initialize PoseDetectorHelper: \(error)")
    }
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    guard let helper = self.helper else {
      print("⚠️ PoseDetectorHelper not initialized")
      return nil
    }

    let sampleBuffer = frame.buffer
    let timestamp = Int(Date().timeIntervalSince1970 * 1000)

    helper.detectAsync(
      sampleBuffer: sampleBuffer,
      orientation: .up,
      timestamp: timestamp
    )

    if let result = helper.lastResult {
      let serialized = result.landmarks.map { pose in
        pose.map { landmark in
          return [
            "x": landmark.x,
            "y": landmark.y,
            "z": landmark.z,
            "visibility": landmark.visibility
          ]
        }
      }
      print("✅ Pose Estimation result:", serialized)
      return serialized
    }

    return nil
  }
}