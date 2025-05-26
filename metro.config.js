const { getDefaultConfig,mergeConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// eslint-disable-next-line no-undef
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;
/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = withNativeWind(mergeConfig(defaultConfig, config), { input: './styles/global.css' });