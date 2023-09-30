import { connect } from 'puppeteer-core'
import { request } from 'http'
const readJson = async (port: number): Promise<any> =>
  new Promise((resolve, reject) => {
    let json = ''
    const req = request(
      {
        host: '127.0.0.1',
        path: '/json/version',
        port
      },
      (response) => {
        response.on('error', reject)
        response.on('data', (chunk: Buffer) => {
          json += chunk.toString()
        })
        response.on('end', () => resolve(JSON.parse(json)))
      }
    )
    req.on('error', reject)
    req.end()
  })
export const browser = async function (port:number): Promise<any> {
  try {
    const json = await readJson(port)
    return await connect({
      browserWSEndpoint: json.webSocketDebuggerUrl,
      defaultViewport: null
    })
  } catch (e) {
    console.log(e)
  }
}
export default browser
