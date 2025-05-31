import type { BikeType } from '../../bike-selection/types/bike.types';

export interface BikeAssessmentImage {
  road: any;
  'time-trial': any;
  mountain: any;
}

export interface SetupInstruction {
  text: string;
  completed: boolean;
}

export interface FittingContext {
  bikeType: BikeType;
  setupComplete: boolean;
}