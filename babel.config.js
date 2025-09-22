// babel.config.js (Expo SDK 50+)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // other plugins if you use them...
      'react-native-reanimated/plugin', // 👈 keep this LAST
    ],
  };
};
