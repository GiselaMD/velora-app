import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './LocalPoseEstimation.types';

type LocalPoseEstimationModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class LocalPoseEstimationModule extends NativeModule<LocalPoseEstimationModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(LocalPoseEstimationModule);
