import { ipcMain } from 'electron'
import { launch } from 'puppeteer'
export default async () => {
  const browser = await launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  })
  browser.on('disconnected', () => {
    console.log('浏览器已关闭')
  })
  let page
  ipcMain.on('openPage', async () => {
    page = await browser.newPage()
    await page.goto('https://www.iconfont.cn/login')
  })
  ipcMain.on('next', async () => {
    await page.tap('#login-form > div:nth-child(4) > button')
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
    await page.close()
  })
}
