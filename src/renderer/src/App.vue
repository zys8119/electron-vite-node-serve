<template>
  <div class="box">
    <div v-for="(item, key) in list" :key="key" class="list">
      <button @click="openPage(item, key)">打开页面</button>
      <input v-model="item.url" />
      <button @click="icpEmit(item, 'searchAndDownload')">搜索并下载</button>
      <button @click="closePage(item, key)">关闭页面</button>
    </div>
    <button class="button" @click="createWin">创建新窗口</button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { WinMapType } from '../../../types'
import { cloneDeep } from 'lodash'


/**
 *
 * @正常业务开发只需要关注这里，无需更改serve.ts,除非定制化开发
 *
 * 窗口信息数据
 *
 */
const list = ref<Partial<WinMapType>[]>([])
/**
 * @正常业务开发只需要关注这里，无需更改serve.ts,除非定制化开发
 *
 * 创建新的窗口信息
 */
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
    // 窗口id，每条数据都是唯一的，确保窗口缓存的唯一性
    id: Date.now().toString(),
    // 子窗口需要打开的页面
    url: 'https://www.iconfont.cn/login',
    //todo 初始化执行，这里是子窗口打开后页面加载完成的第一次自动代码执行
    exec: async () => {},
    //todo 自定义事件，可以实现发布订阅机制的主窗口与子窗口之间的数据通讯，并控制主窗口的行为，具体可以由实际的项目决定是否调整，默认可以不调整
    on: {
      searchAndDownload: async ({ page }: WinMapType) => {
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
/**
 * 解析订阅数据，因为主程序之间通讯不支持嵌套数据传递，导致函数无法传递，需要解藕，即深拷贝，但以下只做函数字符串处理
 * @param config
 */
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
/**
 * 创建并打开新的子窗口页面
 * @param item
 * @param key
 */
const openPage = async (item, key) => {
  // 先发送创建的数据接口
  send()
  window.electron.ipcRenderer.send('openPage', parseData(item), key)
}
/**
 * 主动关闭子窗口
 * @param item
 * @param key
 */
const closePage = async (item, key) => {
  list.value.splice(key, 1)
  window.electron.ipcRenderer.send('closePage', parseData(item), key)
}
/**
 * 子窗口的发布订阅机制绑定
 * @param item
 * @param channel
 */
const icpEmit = (item: any, channel: string) => {
  window?.electron?.ipcRenderer?.send?.('icpEmit', parseData(item), channel)
}
/**
 * 主窗口与子窗口的通讯数据发送格式的封装
 */
const send = () => {
  try {
    window?.electron?.ipcRenderer?.send?.('list', parseData(list.value))
  } catch (e) {
    setTimeout(() => send(), 500)
  }
}
/**
 * 同步子窗口的关闭，包含用户的主动关闭，并删除对应的数据缓存
 */
window.electron.ipcRenderer.on('syncDeleteWindow', (_, id) => {
  list.value.splice(
    list.value.findIndex((e) => e.id === id),
    1
  )
})
/**
 * 发布订阅的成功回调封装
 */
window.electron.ipcRenderer.on('icpEmitSuccess', async (_, id, channel, results) => {
  const info = list.value.find((e) => e.id === id) as unknown as any
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
