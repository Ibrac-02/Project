module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Expo Router no longer requires a Babel plugin in SDK 50+, so 'expo-router/babel' was removed
      // Resolve TS path alias "@/" at runtime
      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true
      }],
      // Reanimated plugin must be listed last
      'react-native-worklets/plugin',
    ]
  };
};
