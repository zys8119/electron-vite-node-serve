import {createApp} from "@wisdom-serve/serve"
import "./global.ts"
import websocket from "./websocket"
createApp({
    route:()=> import("./route"),
    websocket,
    serve:{
      port:80,
      LogServeInfo:true
    },
    cors:true,
    mysqlConfig:{}
})
.listen().then(()=>{})
