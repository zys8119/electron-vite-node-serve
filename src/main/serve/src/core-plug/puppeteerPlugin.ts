import {Plugin} from "@wisdom-serve/serve/types/type";
import { launch, Page} from "puppeteer";

(async function browserInit(bool?:boolean){
    const browser =  await launch()
    const page = await browser.newPage()
    await page.goto('https://baidu.com')
    global.$page =  page
    if(!bool){
        global.$on('a',()=>{
            browserInit(true)
        })
    }
})()

const puppeteerPlugin:Plugin = async function (request, response){


}

export default puppeteerPlugin

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
    }
}
declare global{
    interface GlobalThis {
        $page:Page
    }
}
