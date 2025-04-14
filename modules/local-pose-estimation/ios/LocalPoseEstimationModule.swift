import Foundation
import ExpoModulesCore
import MediaPipeTasksVision

public class LocalPoseEstimationModule: Module {
  private var poseLandmarker: PoseLandmarker?

  public func definition() -> ModuleDefinition {
    Name("LocalPoseEstimationModule")

    Function("estimatePose") { (base64Image: String) -> [[String: Any]] in
      // Decode base64 string
      guard let imageData = Data(base64Encoded: base64Image),
            let uiImage = UIImage(data: imageData),
            let cgImage = uiImage.cgImage else {
        throw PoseError.invalidImage
      }

      // Initialize PoseLandmarker if not already
      if poseLandmarker == nil {
        let options = PoseLandmarkerOptions()
        options.runningMode = .image
        options.modelAssetPath = Bundle.main.path(forResource: "pose_landmarker_full.task", ofType: nil)!
        poseLandmarker = try PoseLandmarker(options: options)
      }

      // Perform pose estimation
      let mpImage = try MPImage(image: cgImage)
      let result = try poseLandmarker!.detect(image: mpImage)

      guard let landmarks = result.poseLandmarks.first else {
        return []
      }

      // Map landmarks to array of dictionaries
      let mapped = landmarks.map { lm in
        return [
          "x": lm.x,
          "y": lm.y,
          "z": lm.z,
          "visibility": lm.visibility ?? 1.0
        ]
      }

      return mapped
    }
  }

  enum PoseError: Error {
    case invalidImage
  }
}
