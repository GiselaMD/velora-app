//
//  PoseEstimationFrameProcessorPlugin.swift
//  veloraapp
//
//  Created by Gisela Difini on 5/17/25.
//

// PoseEstimationFrameProcessorPlugin.swift
import VisionCamera

@objc(PoseEstimationFrameProcessorPlugin)
public class PoseEstimationFrameProcessorPlugin: FrameProcessorPlugin {
    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]! = [:]) {
        super.init(proxy: proxy, options: options)
        print("🟢 [POSE] Plugin instance created")
    }

    public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any {
        print("🟢 [POSE] Processing frame")
        return [
            "width": frame.width,
            "height": frame.height,
            "timestamp": frame.timestamp
        ]
    }
}
