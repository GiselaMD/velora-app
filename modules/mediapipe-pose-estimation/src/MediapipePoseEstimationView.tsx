import { requireNativeView } from 'expo';
import * as React from 'react';

import { MediapipePoseEstimationViewProps } from './MediapipePoseEstimation.types';

const NativeView: React.ComponentType<MediapipePoseEstimationViewProps> =
  requireNativeView('MediapipePoseEstimation');

export default function MediapipePoseEstimationView(props: MediapipePoseEstimationViewProps) {
  return <NativeView {...props} />;
}
