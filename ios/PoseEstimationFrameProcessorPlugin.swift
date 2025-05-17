// PoseEstimationFrameProcessorPlugin.swift
import VisionCamera

@objc(PoseEstimationFrameProcessorPlugin)
public class PoseEstimationFrameProcessorPlugin: FrameProcessorPlugin {
    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]! = [:]) {
        print("🔵 [SWIFT-print] Plugin init")
        NSLog("🔵 [SWIFT-NSLog] Plugin init")
        super.init(proxy: proxy, options: options)
    }

    public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any {
        print("🔵 [SWIFT-print] Frame callback")
        NSLog("🔵 [SWIFT-NSLog] Frame callback")
        return [
            "width": frame.width,
            "height": frame.height,
            "timestamp": frame.timestamp
        ]
    }
}