// native/ios/templates/VeloraPoseEstimation.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VeloraPoseEstimation, NSObject)

RCT_EXTERN_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(detectPose:(CMSampleBuffer)sampleBuffer
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end