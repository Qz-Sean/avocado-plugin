import plugin from '../../../lib/plugins/plugin.js'
import { timer, urlRegex } from '../utils/const.js'
import { avocadoRender, filterUrl, initTimer, refreshTimer } from '../utils/common.js'

export class AvocadoPreview extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => 预览网页',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 9000,
      rule: [
        {
          // 私聊使用在指令开头添加#
          reg: new RegExp(`${'[！!]?#?' + urlRegex.toString().slice(1, -2)}`, 'i'),
          fnc: 'avocadoPreview'
        }
      ]
    })
  }

  async avocadoPreview (e, param = '') {
    if (e.isGroup && (e.message[0].type === 'xml' || e.msg.startsWith('#') || e.msg.startsWith('/？'))) return false
    if (e.isPrivate && !e.msg.startsWith('#')) return false // 私聊需要带#避免抢指令
    let url, originalUrl
    originalUrl = e.msg.trim().replace(/^[!！]?#?/, '')
    if (param.length) {
      url = param
    } else {
      // if (e.source) {
      //   const reg = new RegExp(`(${global.God}\\|\\| 鳄梨酱)[！!]{2}`)
      //   if (!reg.test(e.msg)) return false
      //   let msgType, msgInfo
      //   const isImg = await getImg(e)
      //   if (isImg.length) {
      //     [msgType, msgInfo] = await getImageOcrText(e) || ['', []]
      //   } else {
      //     [msgType, msgInfo] = await getSourceMsg(e) || ['', []]
      //   }
      //   logger.info('isImg: ', isImg)
      //   logger.info('msgInfo: ', msgInfo)
      //   logger.info('msgType: ', msgType)
      //   if (msgType === 'xml') {
      //     await this.reply('xml信息目前还无能为力哦~')
      //     return true
      //   }
      //   if (msgType === 'url') {
      //     for (const item of msgInfo) {
      //       await this.avocadoPreview(this, '#' + item)
      //     }
      //   } else if (msgType === 'ocr') {
      //     let i
      //     for (const item of url) {
      //       i = item.replace('\n', '').trim()
      //       if (urlRegex.test(i)) {
      //         i = i.startsWith('http') ? i : 'http://' + i
      //       }
      //       await this.avocadoPreview(this, i)
      //     }
      //   }
      //   if (!url || msgType === 'text') {
      //     await this.reply(`${global.God}！！！`)
      //     return false
      //   }
      // } else {
      // todo 多链接预览，不过好像意义不大
      const enforceFlag = e.msg.startsWith('！') || e.msg.startsWith('!') // 强制预览
      url = await filterUrl(originalUrl)
      url = url[0]
      const leftTime = refreshTimer(timer.previewCtx)?.leftTime
      if (!url?.length) return false
      if (!leftTime) preUrl = []
      if (preUrl.includes(url) && leftTime > 0 && !enforceFlag) {
        return false
      } else {
        await e.reply('收到请求，准备处理url。。。', false, { recallMsg: 2 })
        // 相同的链接十分钟内只处理一次
        initTimer(timer.previewCtx, 60 * 10)
        // 没分群组处理，懒..
        preUrl.push(url)
      }
      // }
    }
    // 递归终止
    // if (Array.isArray(url)) return true

    let img = await avocadoRender('', { title: '网页预览', url })
    // if (typeof img !== 'object') {
    //   await sleep(3000)
    //   img = await avocadoRender('', { title: '网页预览', url })
    // }
    // await e.reply(img)
    // await e.reply([originalUrl, '\n', img], false, { recallMsg: `${typeof img === 'string' && img.includes('avocadoRender图片生成失败') ? 60 : 0}` })
    await e.reply(img, false, { recallMsg: `${typeof img === 'string' && img.includes('avocadoRender图片生成失败') ? 60 : 0}` })
    return false
  }
}
let preUrl = []
