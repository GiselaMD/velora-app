// plugins/withVeloraPoseEstimation/index.js
const { withPlugins } = require('@expo/config-plugins');
const withXcodeModifications = require('./withXcodeModifications');

const withVeloraPoseEstimation = (config) => {
  // Ensure we have the necessary iOS configuration
  if (!config.ios) {
    config.ios = {};
  }

  return withPlugins(config, [
    withXcodeModifications
  ]);
};

module.exports = withVeloraPoseEstimation;