import { requireNativeView } from 'expo';
import * as React from 'react';

import { LocalPoseEstimationViewProps } from './LocalPoseEstimation.types';

const NativeView: React.ComponentType<LocalPoseEstimationViewProps> =
  requireNativeView('LocalPoseEstimation');

export default function LocalPoseEstimationView(props: LocalPoseEstimationViewProps) {
  return <NativeView {...props} />;
}
