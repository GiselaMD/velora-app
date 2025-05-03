import Foundation
import VisionCamera
import AVFoundation
import MediaPipeTasksVision

@objc(PoseEstimationFrameProcessorPlugin)
public class PoseEstimationFrameProcessorPlugin: FrameProcessorPlugin {
  // ✅ Use instance variable (not static) so multiple plugins don't share one landmarker
  private var landmarker: PoseLandmarker?

  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)

    do {
      self.landmarker = try Self.loadLandmarker()
    } catch {
      print("⚠️ Failed to load pose landmarker: \(error)")
    }
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    print("📸 Frame received - returning dummy result")
    return [["x": 1, "y": 2, "z": 3, "visibility": 0.9]]
  }

//  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
//    print("📸 Plugin callback called")
//
//    let sampleBuffer = frame.buffer
//    print("🧪 Got sampleBuffer")
//
//    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
//      print("❌ Failed to get pixel buffer")
//      return nil
//    }
//    print("✅ Got pixel buffer")
//
//    guard let mpImage = try? MPImage(pixelBuffer: pixelBuffer) else {
//      print("❌ Failed to create MPImage")
//      return nil
//    }
//    print("✅ Created MPImage")
//
//    guard let landmarker = self.landmarker else {
//      print("❌ Landmarker not initialized")
//      return nil
//    }
//
//    do {
//      let result = try landmarker.detect(image: mpImage)
//      print("✅ Pose detection ran")
//
//      if let firstPose = result.landmarks.first {
//        print("🎯 Found pose with \(firstPose.count) landmarks")
//      } else {
//        print("⚠️ No landmarks found")
//      }
//
//      // Convert to serializable format
//      let mapped = result.landmarks.map { pose in
//        pose.map { landmark in
//          return [
//            "x": landmark.x,
//            "y": landmark.y,
//            "z": landmark.z,
//            "visibility": landmark.visibility
//          ]
//        }
//      }
//
//      print("📤 Returning \(mapped.count) poses")
//      return mapped
//
//    } catch {
//      print("❌ Pose detection failed with error: \(error)")
//      return nil
//    }
//  }


  // ✅ Returns a new instance (safer than a shared static one)
  private static func loadLandmarker() throws -> PoseLandmarker {
    guard let modelPath = Bundle.main.path(forResource: "pose_landmarker_full", ofType: "task") else {
      throw NSError(domain: "PoseEstimation", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model not found"])
    }

    let options = PoseLandmarkerOptions()
    options.baseOptions.modelAssetPath = modelPath
    options.runningMode = .video

    return try PoseLandmarker(options: options)
  }
}
