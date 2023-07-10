import plugin from '../../../lib/plugins/plugin.js'
import { urlRegex } from '../utils/const.js'
import puppeteerManager from '../utils/puppeteer.js'
import { segment } from 'icqq'

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
          reg: new RegExp(`#?${urlRegex.toString().slice(1, -2)}`, 'i'),
          fnc: 'avocadoPreview'
        }
      ]
    })
  }

  async avocadoPreview (e, param = '') {
    if (e.isGroup && (e.msg.startsWith('#') || e.msg.startsWith('/？'))) return false
    if (e.isPrivate && !e.msg.startsWith('#')) return false
    let url
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
      const regex = new RegExp(urlRegex.toString().slice(1, -2), 'i')
      url = e.msg.trim().replace(/^#?/, '').replace(/[,，。]/g, '').match(regex)[0]
      if (!url) { return false }
      if (/(wolai|example|onetimesecret).com/i.test(url)) return false
      // }
    }
    // 递归终止
    if (Array.isArray(url)) return true
    const start = Date.now()
    await puppeteerManager.init()
    const page = await puppeteerManager.newPage()
    try {
      url = url.trim().replace(/^#?/, '')
      url = url.startsWith('http') ? url : 'http://' + url
      logger.info('avocadoPreviewUrl: ', url)
      await page.goto(url, { timeout: 120000 })
      await page.waitForTimeout(1000 * 5)
      // await page.waitForNavigation({ waitUntil: 'networkidle2' })
      const { width, height } = await page.$eval('body', (element) => {
        const { width, height } = element.getBoundingClientRect()
        return { width, height }
      })
      await page.setViewport({
        width: Math.round(width + 300),
        height: Math.round(height),
        deviceScaleFactor: 3
      })
      const buff = await page.screenshot({
        type: 'jpeg',
        quality: 85,
        fullPage: true
      })
      const kb = (buff.length / 1024).toFixed(2) + 'kb'
      logger.mark(`[图片生成][网页预览][${puppeteerManager.screenshotCount}次]${kb} ${logger.green(`${Date.now() - start}ms`)}`)
      await puppeteerManager.closePage(page)
      await this.reply([url + '\n', segment.image(buff)])
      return false
    } catch (error) {
      await this.reply(`图片生成失败:${error}`)
      await puppeteerManager.close()
      return false
    }
  }
}
