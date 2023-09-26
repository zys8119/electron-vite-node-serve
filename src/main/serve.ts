import { BrowserWindow } from 'electron'
import { Browser } from 'puppeteer-core'
import connectBrowser from './browser'
import { ipcMain } from 'electron'
export default async () => {
  let browser: Browser
  let page
  ipcMain.on('openPage', async () => {
    const win = await new BrowserWindow()
    await win.loadURL('https://www.iconfont.cn/login')
    await new Promise((r) => {
      setTimeout(r, 1000)
    })
    browser = (await connectBrowser()) as Browser
    page = (await browser.pages())[1]
    await page.goto('https://www.iconfont.cn/login')
  })
  ipcMain.on('next', async () => {
    try {
      await page.tap('#login-form > div:nth-child(4) > button')
    } catch (e) {}
    await page.waitForSelector('#J_search_input_index', { visible: true })
    await page.type('#J_search_input_index', '删除')
    await page.keyboard.down('Enter')
  })
  ipcMain.on('next2', async () => {
    await page.waitForSelector('#mx_52 > div.wrap > div > ul > li:nth-child(1)', { visible: true })
    await page.hover('#mx_52 > div.wrap > div > ul > li:nth-child(1)')
    await page.tap(
      '#mx_52 > div.wrap > div > ul > li:nth-child(1) > div.icon-cover > span.cover-item.iconfont.cover-item-line.icon-xiazai'
    )
    await page.waitForSelector('#body_dlg_73 > div.download-btns > span:nth-child(3)')
    await page.tap('#body_dlg_73 > div.download-btns > span:nth-child(3)')
  })
}
