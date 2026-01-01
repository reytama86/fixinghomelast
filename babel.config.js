module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@Atom': './src/Components/Atom',
          '@Molecule': './src/Components/Molecule',
          '@Organism': './src/Components/Organism',
          '@Containers': './src/Containers',
          '@Helpers': './src/Helpers',
          '@Assets': './src/Assets',
          '@Context': './src/Context',
          "@Hooks": './src/Hooks/',
          "@Constants": './src/Constants/',
          "@Types": './src/Types/',
        },
      },
    ],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    'react-native-reanimated/plugin', 
  ],
};
