import type { BikeAssessmentImage } from '../types/fitting.types';

export const bikeAssessmentImages: BikeAssessmentImage = {
  road: require('../../../../assets/images/position-road.png'),
  'time-trial': require('../../../../assets/images/position-time-trial.png'),
  mountain: require('../../../../assets/images/position-road.png'),
} as const;