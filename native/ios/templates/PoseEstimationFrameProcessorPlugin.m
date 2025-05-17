// PoseEstimationFrameProcessorPlugin.m
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include(<veloraapp/veloraapp-Swift.h>)
#import <veloraapp/veloraapp-Swift.h>
#else
#import "veloraapp-Swift.h"
#endif

// IMPORTANT: Make sure this matches your Swift class name and desired JS function name
VISION_EXPORT_SWIFT_FRAME_PROCESSOR(PoseEstimationFrameProcessorPlugin, poseEstimation)