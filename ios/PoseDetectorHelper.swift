import AVFoundation
import MediaPipeTasksVision
import UIKit
import CoreImage

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
  private let ciContext = CIContext()
  
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
        domain: "MODEL_NOT_FOUND", code: 0, userInfo: ["message": "Model \(modelName) not found"])
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
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      print("⚠️ Failed to get pixel buffer from sample buffer")
      return
    }
    
    let currentFormat = CVPixelBufferGetPixelFormatType(pixelBuffer)
    
    // Convert to BGRA if needed
    let bgraBuffer: CVPixelBuffer
    if currentFormat != kCVPixelFormatType_32BGRA {
      guard let converted = convertPixelBufferToBGRA(pixelBuffer) else {
        print("⚠️ Failed to convert pixel buffer to BGRA")
        return
      }
      bgraBuffer = converted
    } else {
      bgraBuffer = pixelBuffer
    }
    
    // Create MPImage from BGRA buffer
    guard let image = try? MPImage(pixelBuffer: bgraBuffer, orientation: orientation) else {
      print("⚠️ Failed to create MPImage from BGRA buffer")
      return
    }
    
    self.imageSize = CGSize(width: image.width, height: image.height)
    
    do {
      try poseLandmarker?.detectAsync(image: image, timestampInMilliseconds: timestamp)
    } catch {
      print("❌ detectAsync threw: \(error)")
    }
  }
  
  private func convertPixelBufferToBGRA(_ pixelBuffer: CVPixelBuffer) -> CVPixelBuffer? {
    let width = CVPixelBufferGetWidth(pixelBuffer)
    let height = CVPixelBufferGetHeight(pixelBuffer)
    
    // Create BGRA pixel buffer
    var bgraPixelBuffer: CVPixelBuffer?
    let pixelBufferAttributes: [String: Any] = [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
      kCVPixelBufferWidthKey as String: width,
      kCVPixelBufferHeightKey as String: height,
      kCVPixelBufferIOSurfacePropertiesKey as String: [:]
    ]
    
    let status = CVPixelBufferCreate(
      kCFAllocatorDefault,
      width,
      height,
      kCVPixelFormatType_32BGRA,
      pixelBufferAttributes as CFDictionary,
      &bgraPixelBuffer
    )
    
    guard status == kCVReturnSuccess, let outputBuffer = bgraPixelBuffer else {
      print("⚠️ Failed to create BGRA pixel buffer: \(status)")
      return nil
    }
    
    // Use CIContext to convert
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
    ciContext.render(ciImage, to: outputBuffer)
    
    return outputBuffer
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
        print("🔸 Pose \(index): \(pose.count) landmarks detected")
      }
    }
    
    if let error = error {
      print("❌ Pose detection error: \(error)")
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
