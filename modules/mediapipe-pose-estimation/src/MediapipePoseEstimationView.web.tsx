import * as React from 'react';

import { MediapipePoseEstimationViewProps } from './MediapipePoseEstimation.types';

export default function MediapipePoseEstimationView(props: MediapipePoseEstimationViewProps) {
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
