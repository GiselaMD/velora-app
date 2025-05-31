// Re-export all types from feature modules
export type { BikeType, BikeOption } from '../src/features/bike-selection/types/bike.types';
export type { PoseLandmark, PoseResult, AngleData } from '../src/features/pose-analysis/types/pose.types';
export type { BikeAssessmentImage, SetupInstruction, FittingContext } from '../src/features/bike-fitting/types/fitting.types';

// Legacy exports for backwards compatibility
export type { BikeType as LegacyBikeType } from '../src/features/bike-selection/types/bike.types';
