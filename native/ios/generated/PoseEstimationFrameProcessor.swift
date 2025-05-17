// ios/PoseEstimationFrameProcessor/PoseEstimationFrameProcessor.swift
import VisionCamera
import MediaPipeTasksVision

@objc(PoseEstimationFrameProcessorPlugin)
public class PoseEstimationFrameProcessorPlugin: FrameProcessorPlugin {
    private let detectorHandle = 1
    private var helper: PoseDetectorHelper?
    
    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]! = [:]) {
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
    
    public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any {
        print("🟡 Processing frame")
        return [
            "width": frame.buffer.width,
            "height": frame.buffer.height,
            "timestamp": frame.timestamp
        ]
    }
}