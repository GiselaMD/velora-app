import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './MediapipePoseEstimation.types';

type MediapipePoseEstimationModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class MediapipePoseEstimationModule extends NativeModule<MediapipePoseEstimationModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(MediapipePoseEstimationModule);
