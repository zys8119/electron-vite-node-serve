<template>
  <div class="box">
    <div v-for="(item, key) in list" :key="key" class="list">
      <button @click="openPage(item, key)">打开页面</button>
      <input v-model="item.url" />
      <button @click="icpEmit(item, 'searchAndDownload')">搜索并下载</button>
      <button @click="clonePage(item, key)">关闭页面</button>
    </div>
    <button class="button" @click="createWin">创建新窗口</button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { WinMapType } from '../../../types'
import { cloneDeep } from 'lodash'
const list = ref<Partial<WinMapType>[]>([])
const createWin = () => {
  /**
   * 以下函数定义禁止如下定义，推荐箭头函数定义
   * {
   *   funname:(){
   *     // ....
   *   }
   * }
   */
  list.value.push({
    id: Date.now().toString(),
    url: 'https://www.iconfont.cn/login',
    //todo 初始化执行
    exec: async ({ page }: WinMapType) => {
      // 登录
      try {
        await page.tap('#login-form > div:nth-child(4) > button')
      } catch (e) {}
      await page.waitForSelector('#J_search_input_index', { visible: true })
      await page.type('#J_search_input_index', '删除')
      await page.keyboard.down('Enter')
    },
    //todo 自定义事件
    on: {
      searchAndDownload: async ({ page }: WinMapType) => {
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
        return {
          data: 123
        }
      }
    },
    //todo 自定义事件回调事件
    success: {
      searchAndDownload(result) {
        console.log(result)
        /**
         * 输出
         * {
         *   data:123
         * }
         */
      }
    }
  })
  send()
}
const parseData = (config: object | object[]) => {
  const isArray = Object.prototype.toString.call(config) === '[object Array]'
  const data: object[] = cloneDeep((isArray ? config : [config]) as object[]).map((e) => {
    for (const k in e) {
      switch (Object.prototype.toString.call(e[k])) {
        case '[object AsyncFunction]':
        case '[object Function]':
          e[k] = e[k].toString()
          break
        case '[object Object]':
          e[k] = parseData(e[k])
          break
      }
    }
    return e
  })
  return JSON.parse(JSON.stringify(isArray ? data : data[0]))
}
const openPage = async (item, key) => {
  send()
  window.electron.ipcRenderer.send('openPage', parseData(item), key)
}
const clonePage = async (item, key) => {
  list.value.splice(key, 1)
  window.electron.ipcRenderer.send('clonePage', parseData(item), key)
}
const icpEmit = (item: any, channel: string) => {
  window?.electron?.ipcRenderer?.send?.('icpEmit', parseData(item), channel)
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
window.electron.ipcRenderer.on('icpEmitSuccess', async (_, id, channel, results) => {
  const info = list.value.find((e) => e.id === id) || {}
  await info?.success?.[channel]?.(results)
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
