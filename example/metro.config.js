const path = require('path');
const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');
const {createHarmonyMetroConfig} = require('@react-native-oh/react-native-harmony/metro.config');

const root = path.resolve(__dirname, '..');
const exampleNodeModules = path.resolve(__dirname, 'node_modules');
const exampleReact = path.join(exampleNodeModules, 'react');

/**
 * @type {import("metro-config").ConfigT}
 */
const config = {
  watchFolders: [root],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // example 自己的 node_modules 优先；根目录的用于解析库运行时依赖（uuid/validator/es6-error）
    nodeModulesPaths: [exampleNodeModules, path.join(root, 'node_modules')],
    disableHierarchicalLookup: true,
    extraNodeModules: {
      react: exampleReact,
      'react/jsx-runtime': path.join(exampleReact, 'jsx-runtime'),
      'react/jsx-dev-runtime': path.join(exampleReact, 'jsx-dev-runtime'),
      'react-native': path.join(
        exampleNodeModules,
        '@react-native-oh/react-native-harmony'
      ),
      'react-native-payments': path.join(
        exampleNodeModules,
        '@react-native-ohos/react-native-payments'
      ),
    },
    // 根目录的 react / react-native 只是库自身的 dev 依赖（react-native 0.63），
    // 禁止进入 bundle，避免出现两份 React 导致 hooks 报错。
    // 原生构建目录不参与打包；Windows 兜底 watcher 扫描 .cxx 下 CMake 临时目录时，
    // 目录被删会抛 ENOENT 直接把 Metro 崩掉（cmTC_*.dir）。
    blockList: [
      new RegExp(
        `${root.replace(/[/\\]/g, '[\\\\/]')}[\\\\/]node_modules[\\\\/]react[\\\\/].*`
      ),
      new RegExp(
        `${root.replace(/[/\\]/g, '[\\\\/]')}[\\\\/]node_modules[\\\\/]react-native[\\\\/].*`
      ),
      new RegExp(
        `${root.replace(/[/\\]/g, '[\\\\/]')}[\\\\/]harmony[\\\\/].*[\\\\/](?:\\.cxx|build)[\\\\/]`
      ),
      new RegExp(
        `${root.replace(/[/\\]/g, '[\\\\/]')}[\\\\/]example[\\\\/]harmony[\\\\/].*[\\\\/](?:\\.cxx|build)[\\\\/]`
      ),
    ],
  },
};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
  }),
  config
);
