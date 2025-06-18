// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescriptPlugin from "@rollup/plugin-typescript";

export default {
  // 入口文件
  input: "src/index.tsx",

  // 输出配置
  output: {
    file: "dist/index.js", // 输出文件路径
    format: "es",
    name: "MyBundle", // 全局变量名
    sourcemap: true, // 生成 sourcemap
  },

  // 插件配置
  plugins: [
    resolve(), // 解析 node_modules 中的模块
    typescriptPlugin({ tsconfig: "./tsconfig.json" }),
    babel({
      // https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      exclude: "node_modules/**",
      presets: [["@babel/preset-env", { targets: "defaults" }]],
    }),
  ],
};
