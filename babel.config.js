module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // plugin lain...
    'react-native-reanimated/plugin', // <- HARUS jadi yang terakhir
  ],
};
