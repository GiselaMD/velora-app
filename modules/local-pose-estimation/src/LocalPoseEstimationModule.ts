import { NativeModule, requireNativeModule } from 'expo';

import { LocalPoseEstimationModuleEvents } from './LocalPoseEstimation.types';

declare class LocalPoseEstimationModule extends NativeModule<LocalPoseEstimationModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<LocalPoseEstimationModule>('LocalPoseEstimation');
