// native/ios/templates/VeloraPoseEstimation.m
#import <VisionCamera/FrameProcessorPlugin.h>

#if __has_include("veloraapp/veloraapp-Swift.h")
#import "veloraapp/veloraapp-Swift.h"
#else
#import "veloraapp-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(PoseEstimationPlugin, poseEstimation)
