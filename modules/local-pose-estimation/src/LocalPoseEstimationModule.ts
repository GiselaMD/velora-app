import { NativeModule, requireNativeModule } from 'expo';

import { LocalPoseEstimationModuleEvents } from './LocalPoseEstimation.types';

type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};
declare class LocalPoseEstimationModule extends NativeModule<LocalPoseEstimationModuleEvents> {
  estimatePose(base64Image: string): Promise<Landmark[]>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<LocalPoseEstimationModule>('LocalPoseEstimation');


