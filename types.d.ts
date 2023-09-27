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
  id: string
  url: string
  win: BrowserWindow
  page: Page
  exec: string | ExecEmitFunType
  on: Record<any, ExecEmitFunType>
  success: Record<any, ExecEmitFunType>
}

export type ExecEmitFunType = string | ((config: WinMapType) => void)
