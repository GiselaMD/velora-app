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
      print("✅ PoseLandmarker initialized")
    } catch {
      print("❌ Failed to load pose landmarker: \(error.localizedDescription)")
    }
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    let sampleBuffer = frame.buffer
    
    // Extract CVPixelBuffer
     guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
       print("⚠️ Failed to get pixel buffer from sample buffer")
       return nil
     }

     // 🔍 Log pixel buffer properties
     print("📸 Frame received")
     print("🔍 Pixel buffer: \(pixelBuffer)")
     print("🔍 Pixel buffer width: \(CVPixelBufferGetWidth(pixelBuffer)), height: \(CVPixelBufferGetHeight(pixelBuffer))")
     print("🔍 Pixel buffer format: \(CVPixelBufferGetPixelFormatType(pixelBuffer))")


    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      print("⚠️ Failed to get pixel buffer from sample buffer")
      return nil
    }

    guard let mpImage = try? MPImage(
      pixelBuffer: pixelBuffer,
      orientation: .up
    ) else {
      print("⚠️ Failed to convert pixel buffer to MPImage")
      return nil
    }


    guard let landmarker = self.landmarker else {
      print("⚠️ Pose landmarker not initialized")
      return nil
    }

    guard let result = try? landmarker.detect(image: mpImage) else {
      print("⚠️ Pose detection failed")
      return nil
    }

    let serializedLandmarks = result.landmarks.map { pose in
      pose.map { landmark in
        return [
          "x": landmark.x,
          "y": landmark.y,
          "z": landmark.z,
          "visibility": landmark.visibility
        ]
      }
    }

    print("✅ Pose result: \(serializedLandmarks)")
    return serializedLandmarks
  }

  private static func loadLandmarker() throws -> PoseLandmarker {
    print("📦 Looking for model path...")
    guard let modelPath = Bundle.main.path(forResource: "pose_landmarker_full", ofType: "task") else {
      throw NSError(domain: "PoseEstimation", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model not found in bundle"])
    }

    print("📍 Model path found: \(modelPath)")

    let options = PoseLandmarkerOptions()
    options.baseOptions.modelAssetPath = modelPath
    options.runningMode = .video

    print("🧠 Creating PoseLandmarker...")
    return try PoseLandmarker(options: options)
  }
}
