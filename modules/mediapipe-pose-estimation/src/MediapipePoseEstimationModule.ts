import { NativeModule, requireNativeModule } from 'expo';

import { MediapipePoseEstimationModuleEvents } from './MediapipePoseEstimation.types';

declare class MediapipePoseEstimationModule extends NativeModule<MediapipePoseEstimationModuleEvents> {
  initLandmarker(): Promise<void>;
  detectPose(imageBase64: string): Promise<
    {
      x: number;
      y: number;
      z: number;
      visibility: number;
    }[][]
  >;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MediapipePoseEstimationModule>('MediapipePoseEstimation');
