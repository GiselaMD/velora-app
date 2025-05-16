// ios/Frame Processor Plugins/Simplest Plugin/SimplestPlugin.swift
import VisionCamera

@objc(SimplestPlugin)
public class SimplestPlugin: NSObject, FrameProcessorPluginBase {
    @objc
    public static func callback(_ frame: Frame!, withArgs args: [String: Any]!) -> Any! {
         print("SimplestPlugin: Processing frame \(frame.width)x\(frame.height)")
        return [
            "width": frame.width,
            "height": frame.height,
            "timestamp": frame.timestamp
        ]
    }
}