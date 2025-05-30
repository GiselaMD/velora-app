import AVFoundation
import MediaPipeTasksVision
import UIKit

protocol PoseDetectorHelperLiveStreamDelegate: AnyObject {
  func poseDetectorHelper(
    _ poseDetectorHelper: PoseDetectorHelper,
    onResults result: PoseLandmarkerResult?,
    timestamp: Int,
    error: Error?
  )
}

class PoseDetectorHelper: NSObject {
  weak var liveStreamDelegate: PoseDetectorHelperLiveStreamDelegate?

  private var poseLandmarker: PoseLandmarker?
  private var modelPath: String
  private var imageSize: CGSize = .zero

  public private(set) var lastResult: PoseLandmarkerResult?

  init(
    handle: Int,
    numPoses: Int,
    minPoseDetectionConfidence: Float,
    minPosePresenceConfidence: Float,
    minTrackingConfidence: Float,
    shouldOutputSegmentationMasks: Bool,
    modelName: String,
    delegate: Int,
    runningMode: RunningMode
  ) throws {
    let fileURL = URL(fileURLWithPath: modelName)
    let basename = fileURL.deletingPathExtension().lastPathComponent
    let fileExtension = fileURL.pathExtension

    guard let modelPath = Bundle.main.path(forResource: basename, ofType: fileExtension) else {
      throw NSError(
        domain: "MODEL_NOT_FOUND", code: 0, userInfo: ["message": "Model \\(modelName) not found in Bundle.main. Looked for \(basename).\(fileExtension)"]) // Added more detail
    }


    self.modelPath = modelPath
    super.init()
    try createPoseLandmarker(
      numPoses: numPoses,
      minPoseDetectionConfidence: minPoseDetectionConfidence,
      minPosePresenceConfidence: minPosePresenceConfidence,
      minTrackingConfidence: minTrackingConfidence,
      shouldOutputSegmentationMasks: shouldOutputSegmentationMasks,
      delegate: delegate,
      runningMode: runningMode
    )
  }

  private func createPoseLandmarker(
    numPoses: Int,
    minPoseDetectionConfidence: Float,
    minPosePresenceConfidence: Float,
    minTrackingConfidence: Float,
    shouldOutputSegmentationMasks: Bool,
    delegate: Int,
    runningMode: RunningMode
  ) throws {
    let options = PoseLandmarkerOptions()
    options.runningMode = runningMode
    options.baseOptions.modelAssetPath = modelPath
    options.baseOptions.delegate = convertIntToDelegate(delegate)
    options.numPoses = numPoses
    options.minPoseDetectionConfidence = minPoseDetectionConfidence
    options.minPosePresenceConfidence = minPosePresenceConfidence
    options.minTrackingConfidence = minTrackingConfidence
    options.shouldOutputSegmentationMasks = shouldOutputSegmentationMasks
    options.poseLandmarkerLiveStreamDelegate = self

    poseLandmarker = try PoseLandmarker(options: options)
  }

  func detectAsync(sampleBuffer: CMSampleBuffer, orientation: UIImage.Orientation, timestamp: Int) {
    guard let image = try? MPImage(sampleBuffer: sampleBuffer, orientation: orientation) else {
      print("⚠️ Failed to convert sample buffer to MPImage")
      return
    }
    self.imageSize = CGSize(width: image.width, height: image.height)

    do {
      try poseLandmarker?.detectAsync(image: image, timestampInMilliseconds: timestamp)
    } catch {
      print("❌ detectAsync threw: \(error)")
    }
  }
}

extension PoseDetectorHelper: PoseLandmarkerLiveStreamDelegate {
  func poseLandmarker(
    _ poseLandmarker: PoseLandmarker,
    didFinishDetection result: PoseLandmarkerResult?,
    timestampInMilliseconds: Int,
    error: Error?
  ) {
    print("📬 Got pose results at timestamp: \(timestampInMilliseconds)")
    if let result = result {
      for (index, pose) in result.landmarks.enumerated() {
        print("🔸 Pose \(index): \(pose.map { "(\($0.x), \($0.y))" })")
      }
    }

    self.lastResult = result

    liveStreamDelegate?.poseDetectorHelper(
      self,
      onResults: result,
      timestamp: timestampInMilliseconds,
      error: error
    )
  }
}

private func convertIntToDelegate(_ delegate: Int) -> Delegate {
  switch delegate {
  case 1: return .CPU
  case 2: return .GPU
  default: return .CPU
  }
}
