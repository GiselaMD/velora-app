// Reexport the native module. On web, it will be resolved to LocalPoseEstimationModule.web.ts
// and on native platforms to LocalPoseEstimationModule.ts
export { default } from './src/LocalPoseEstimationModule';
export { default as LocalPoseEstimationView } from './src/LocalPoseEstimationView';
export * from  './src/LocalPoseEstimation.types';
