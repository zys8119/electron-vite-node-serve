# 基于 electron-vite 与 node-serve 的桌面端程序底层案例


## 注意事项：

1、pnpm 打包失败，推荐使用npm安装依赖

处理方案：在 build 二进制文件是否 请将`puppeteer` 或者 `puppeteer-core` 在 package 依赖字段 dependencies 中 移动至 devDependencies 依赖中
