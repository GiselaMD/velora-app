import ExpoModulesCore
import MediaPipeTasksVision
import UIKit

public class MediapipePoseEstimationModule: Module {
  var landmarker: PoseLandmarker?

  public func definition() -> ModuleDefinition {
    Name("MediapipePoseEstimation")

    Function("initLandmarker") {
      try? self.loadLandmarker()
    }

      Function("detectPose") { (imageBase64: String) -> [[[String: Any]]] in
      guard let landmarker = self.landmarker else {
          throw Exception(file: "PoseLandmarker: Landmarker not initialized")
      }

      guard let imageData = Data(base64Encoded: imageBase64),
            let uiImage = UIImage(data: imageData),
            let mpImage = try? MPImage(uiImage: uiImage) else {
          throw Exception(file: "PoseLandmarker: Invalid image data")
      }

      let result = try landmarker.detect(image: mpImage)

      return result.landmarks.map { pose in
        pose.map { landmark in
          [
            "x": landmark.x,
            "y": landmark.y,
            "z": landmark.z,
            "visibility": landmark.visibility
          ]
        }
      }
    }
  }

  // ✅ Moved this outside the definition() function
  private func loadLandmarker() throws {
    guard let modelPath = Bundle.main.path(forResource: "pose_landmarker_full", ofType: "task") else {
        throw Exception(file: "PoseLandmarker: Failed to find model in bundle")
    }

    let options = PoseLandmarkerOptions()
      options.baseOptions.modelAssetPath = modelPath
      options.runningMode = .image
//      options.minPoseDetectionConfidence = minPoseDetectionConfidence
//      options.minPosePresenceConfidence = minPosePresenceConfidence
//      options.minTrackingConfidence = minTrackingConfidence
//      options.numPoses = numPoses

    self.landmarker = try PoseLandmarker(options: options)
  }
}
