import { BrowserWindow } from 'electron'
import { Browser } from 'puppeteer-core'
import connectBrowser from './browser'
import { ipcMain } from 'electron'
import { WinMapType } from '../../types'

const winMap = new Map<any, WinMapType>()
ipcMain.on('list', async (_: any, list: any[]) => {
  // 监听客户端创建列表
  for (const [_, e] of Object.entries(list)) {
    if (!winMap.has(e.id)) {
      winMap.set(e.id, e)
    } else {
      const info = winMap.get(e.id)
      if (info) {
        for (const k in e) {
          ;(info as any)[k] = e[k] as any
        }
      }
    }
  }
})
export default async (mainWindow: BrowserWindow, port:number = 44044) => {
  const browser: Browser = (await connectBrowser(port)) as Browser
  mainWindow.on('close', async () => {
    //关闭主窗口后清理缓存数据
    for (const item of winMap.values()) {
      winMap.delete(item.id)
    }
    await browser.close()
    process.exit()
  })
  ipcMain.on('openPage', async (_, item) => {
    // 创建子窗口
    try {
      // 根据窗口id获取子窗口缓存数据，如没有则创建
      const info = winMap.get(item.id) || ({} as WinMapType)
      info.win =
        info.win ||
        new BrowserWindow({
          title: item.id,
          webPreferences: {
            sandbox: false
          }
        })
      info.win.on('close', () => {
        // 监听子窗口关闭，清理对应窗口，并通知主窗口同步删除子窗口缓存数据
        mainWindow.webContents.send('syncDeleteWindow', item.id)
        info.win = null as unknown as any
        info.page = null as unknown as any
        winMap.delete(item.id)
      })
      // 加载页面地址并聚焦
      await info.win.loadURL(info.url)
      await info.win.focus()
      // 获取窗口页面对象
      const pages = await browser.pages()
      info.page = info.page || pages[pages.length - 1]
      // 执行客户端默认程序
      if (typeof info.exec === 'string' && info.exec) {
        const fn = `(${info.exec})(info, browser)`
        eval(fn)
      }
    } catch (e) {
      console.log(e)
    }
  })
  ipcMain.on('closePage', async (_, item) => {
    // 监听客户端主动关闭窗口通知，并删除对应子窗口缓存
    try {
      const info = winMap.get(item.id) || ({} as WinMapType)
      info?.win?.close?.()
      winMap.delete(item.id)
    } catch (e) {
      console.log(e)
    }
  })
  ipcMain.on('icpEmit', async (_, item, channel: string) => {
    // 注册客户端页面交互发布订阅
    try {
      // 通过窗口id获取窗口缓存信息
      const info = winMap.get(item.id) || ({} as WinMapType)
      const channelFn = info?.on?.[channel]
      // 执行客户端对应的渠道程序代码
      if (typeof channelFn === 'string' && channelFn) {
        const fn = `(${channelFn})(info, browser)`
        const results = await eval(fn)
        // 执行成功后通知客户端成功回调
        mainWindow.webContents.send('icpEmitSuccess', item.id, channel, results)
      }
    } catch (e) {
      console.log(e)
    }
  })
}
