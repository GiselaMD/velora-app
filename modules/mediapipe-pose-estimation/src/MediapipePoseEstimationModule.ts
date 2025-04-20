import { NativeModule, requireNativeModule } from 'expo';

import { MediapipePoseEstimationModuleEvents } from './MediapipePoseEstimation.types';

declare class MediapipePoseEstimationModule extends NativeModule<MediapipePoseEstimationModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MediapipePoseEstimationModule>('MediapipePoseEstimation');
