export type BikeType = 'road' | 'time-trial' | 'mountain';

export interface BikeOption {
  id: BikeType;
  title: string;
  description: string;
  imageSrc: any;
  icon: string;
}