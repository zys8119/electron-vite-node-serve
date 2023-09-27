<template>
  <div class="box">
    <div v-for="(item, key) in list" :key="key" class="list">
      <button @click="openPage(item, key)">打开页面</button>
      <input v-model="item.url" />
      <button @click="clonePage(item, key)">关闭页面</button>
    </div>
    <button class="button" @click="newWin">创建新窗口</button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { WinMapType } from '../../../types'
const list = ref([])
const parseData = (config: object | object[]) => {
  const isArray = Object.prototype.toString.call(config) === '[object Array]'
  const data: object[] = (isArray ? config : [config]) as object[]
  data.forEach((e) => {
    for (const k in e) {
      if (typeof e[k] === 'function') {
        e[k] = e[k].toString()
      }
    }
  })
  return JSON.parse(JSON.stringify(isArray ? data : data[0]))
}
const openPage = async (item, key) => {
  window.electron.ipcRenderer.send('openPage', parseData(item), key)
}
const clonePage = async (item, key) => {
  list.value.splice(key, 1)
  window.electron.ipcRenderer.send('clonePage', parseData(item), key)
}
const newWin = () => {
  list.value.push({
    id: Date.now().toString(),
    url: 'https://www.iconfont.cn/login',
    exec: async ({ page }: WinMapType) => {
      // 登录
      try {
        await page.tap('#login-form > div:nth-child(4) > button')
      } catch (e) {}
      await page.waitForSelector('#J_search_input_index', { visible: true })
      await page.type('#J_search_input_index', '删除')
      await page.keyboard.down('Enter')
      // 搜索并下载
      await page.waitForSelector('.page-search-container  > ul > li:nth-child(1)', {
        visible: true
      })
      await page.hover('.page-search-container  > ul > li:nth-child(1)')
      await page.tap(
        '.page-search-container  > ul > li:nth-child(1) > div.icon-cover > span.cover-item.iconfont.cover-item-line.icon-xiazai'
      )
      await page.waitForSelector('#body_dlg_73 > div.download-btns > span:nth-child(3)')
      await page.tap('#body_dlg_73 > div.download-btns > span:nth-child(3)')
    }
  })
  send()
}
const send = () => {
  try {
    window?.electron?.ipcRenderer?.send?.('list', parseData(list.value))
  } catch (e) {
    setTimeout(() => send(), 500)
  }
}
window.electron.ipcRenderer.on('syncDeleteWindow', (_, id) => {
  list.value.splice(
    list.value.findIndex((e) => e.id === id),
    1
  )
})
onMounted(() => {
  send()
})
</script>
<style lang="less">
@import './assets/css/styles.less';
.box {
  .list {
  }
}
</style>
