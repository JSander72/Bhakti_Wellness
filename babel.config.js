module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        // other plugins...
        // Reanimated must be listed last
        'react-native-reanimated/plugin',
      ],
    };
  };
  