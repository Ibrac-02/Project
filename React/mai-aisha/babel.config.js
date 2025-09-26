module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
    
      'babel-plugin-react-compiler',

      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],

      'react-native-worklets/plugin',
    ],
  };
};
