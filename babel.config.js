module.exports = function (api) {
  api.cache(true);
  const plugins = [ ["react-native-worklets-core/plugin"]];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
