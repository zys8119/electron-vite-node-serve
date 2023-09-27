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
    }
  }
})
export default async (mainWindow: BrowserWindow) => {
  const browser: Browser = (await connectBrowser()) as Browser
  if (mainWindow) {
    mainWindow.on('close', async () => {
      for (const item of winMap.values()) {
        winMap.delete(item.id)
      }
      await browser.close()
      process.exit()
    })
  }
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
        if (mainWindow) {
          mainWindow.webContents.send('syncDeleteWindow', item.id)
        }
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
}
