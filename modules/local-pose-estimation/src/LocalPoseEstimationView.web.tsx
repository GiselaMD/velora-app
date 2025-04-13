import * as React from 'react';

import { LocalPoseEstimationViewProps } from './LocalPoseEstimation.types';

export default function LocalPoseEstimationView(props: LocalPoseEstimationViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
