//
//  PoseEstimationFrameProcessorPlugin.m
//  veloraapp
//
//  Created by Gisela Difini on 5/17/25.
//

// PoseEstimationFrameProcessorPlugin.m
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

// Make sure this path matches your product name
#if __has_include(<veloraapp/veloraapp-Swift.h>)
#import <veloraapp/veloraapp-Swift.h>
#else
#import "veloraapp-Swift.h"
#endif

// Make sure this matches your Swift class name exactly
VISION_EXPORT_SWIFT_FRAME_PROCESSOR(PoseEstimationFrameProcessorPlugin, poseEstimation)
