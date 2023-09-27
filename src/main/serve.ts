import { BrowserWindow } from 'electron'
import { Browser } from 'puppeteer-core'
import connectBrowser from './browser'
import { ipcMain } from 'electron'
import { WinMapType } from '../../types'

const winMap = new Map<any, WinMapType>()
ipcMain.on('list', async (_: any, list: any[]) => {
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
export default async (mainWindow: BrowserWindow) => {
  const browser: Browser = (await connectBrowser()) as Browser
  mainWindow.on('close', async () => {
    for (const item of winMap.values()) {
      winMap.delete(item.id)
    }
    await browser.close()
    process.exit()
  })
  ipcMain.on('openPage', async (_, item) => {
    try {
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
        mainWindow.webContents.send('syncDeleteWindow', item.id)
        info.win = null
        info.page = null
        winMap.delete(item.id)
      })
      await info.win.loadURL(info.url)
      await info.win.focus()
      const pages = await browser.pages()
      info.page = info.page || pages[pages.length - 1]
      if (typeof info.exec === 'string' && info.exec) {
        const fn = `(${info.exec})(info, browser)`
        eval(fn)
      }
    } catch (e) {
      console.log(e)
    }
  })
  ipcMain.on('clonePage', async (_, item) => {
    try {
      const info = winMap.get(item.id) || ({} as WinMapType)
      info?.win?.close?.()
      winMap.delete(item.id)
    } catch (e) {
      console.log(e)
    }
  })
  ipcMain.on('icpEmit', async (_, item, channel: string) => {
    try {
      const info = winMap.get(item.id) || ({} as WinMapType)
      const channelFn = info?.on?.[channel]
      if (typeof channelFn === 'string' && channelFn) {
        const fn = `(${channelFn})(info, browser)`
        eval(fn)
      }
    } catch (e) {
      console.log(e)
    }
  })
}
