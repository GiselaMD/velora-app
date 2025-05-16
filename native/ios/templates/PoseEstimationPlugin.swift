// native/ios/templates/PoseEstimationPlugin.swift
import VisionCamera

@objc(PoseEstimationPlugin)
class PoseEstimationPlugin: FrameProcessorPlugin {
    private let poseEstimation = VeloraPoseEstimation()
    
    override init(proxy: VisionCameraProxyHolder, options: [String: Any]?) {
        super.init(proxy: proxy, options: options)
        try? poseEstimation.initialize()
    }
    
    override func callback(_ frame: Frame, withArguments arguments: [String: Any]?) -> Any? {
        guard let buffer = CMSampleBufferCreate(from: frame) else {
            return nil
        }
        
        var result: Any?
        let semaphore = DispatchSemaphore(value: 0)
        
        poseEstimation.detectPose(buffer) { landmarks in
            result = landmarks
            semaphore.signal()
        } rejecter: { _, message, _ in
            print("Error detecting pose: \(message ?? "")")
            semaphore.signal()
        }
        
        semaphore.wait()
        return result
    }
}

// Register the plugin
VisionCameraProxy.registerFrameProcessorPlugin("poseEstimation")