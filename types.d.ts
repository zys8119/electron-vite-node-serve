import { Page } from 'puppeteer-core'
import { BrowserWindow } from 'electron'
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}
export type WinMapType = {
  id: number
  url: string
  win: BrowserWindow | null
  page: Page | null
  exec: string | (() => void)
  on: Record<any, string | (() => void)>
}
