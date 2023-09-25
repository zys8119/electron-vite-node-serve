import {createRoute} from "@wisdom-serve/serve"
import axios from "axios"
import {ReadStream} from "fs"
import * as Keyv from "@keyvhq/core"
import * as KeyvMySQL from "@keyvhq/mysql"
export default createRoute({
    routes:[
        {
            path:'/test',
            async controller(){
                if(!global.$page){
                    return this.$error("服务正在启动")
                }
                try {
                    const page = global.$page
                    await page.evaluate((search:string)=>{
                        const input = document.querySelector('#kw') as HTMLInputElement
                        input.value = search
                    },this.$query.get('search'))
                    await page.click('#su')
                    await new Promise(r=>setTimeout(r, 1000))
                    this.$success(await page.evaluate(()=>{
                        return [...document.querySelectorAll('div > div > h3 > a')].map((e:any)=>({
                            title:e.innerText,
                            url:e.href
                        }))
                    }))
                }catch (e){
                    console.log(e)
                    global.$emit('a')
                    return this.$error("服务正在启动")
                }
            }
        }
    ]
});
