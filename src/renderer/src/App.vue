<template>
  <div>
    <button @click="openPage">打开页面</button>
    <button @click="next">登录并进行搜索删除图标</button>
    <button @click="next2">下载第一个图标</button>
  </div>
</template>
<script setup lang="ts">
const openPage = async () => {
  window.electron.ipcRenderer.send('openPage')
}
const next = async () => {
  window.electron.ipcRenderer.send('next')
}
const next2 = async () => {
  window.electron.ipcRenderer.send('next2')
}
</script>
<style lang="less">
@import './assets/css/styles.less';
</style>
