import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fs from 'fs'
import path from 'path'
import { Config } from '../utils/config.js'
import { translate, translateLangSupports } from '../utils/translate.js'
import {
  __dirname,
  _puppeteer,
  getImageOcrText, getImg,
  getSourceMsg,
  initPuppeteer,
  makeForwardMsg,
  md,
  urlRegex
} from '../utils/common.js'
import { getAreaInfo, weather } from '../utils/weather.js'
import { cities } from '../utils/cities.js'

export class avocado extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '鳄梨酱！！！',
      /** 功能描述 */
      dsc: '🥑🥑🥑🥑🥑',
      /** https://icqqjs.github.io/icqq/interfaces/EventMap.html */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: new RegExp(`^${urlRegex.toString().slice(1, -2)}$`, 'i'),
          /** 执行方法 */
          fnc: 'avocadoPreview'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?鳄梨酱[!！]{3}$',
          /** 执行方法 */
          fnc: 'avocadoHelp'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?鳄梨酱[!！]{2}$',
          /** 执行方法 */
          fnc: 'avocadoPsycho'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?鳄梨酱[！!]',
          /** 执行方法 */
          fnc: 'avocado'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?(.*)鳄梨酱[?？]([?？]*)',
          /** 执行方法 */
          fnc: 'avocadoTranslate'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?(.*)鳄梨酱[.。]([.。]*)',
          /** 执行方法 */
          fnc: 'avocadoWeather'
        }
      ]
    })
  }

  async avocado (e) {
    if (e.source) {
      let msgType, msgInfo
      const isImg = await getImg(e)
      if (isImg.length) {
        [msgType, msgInfo] = await getImageOcrText(e) || ['', []]
      } else {
        [msgType, msgInfo] = await getSourceMsg(e) || ['', []]
      }
      if (msgType === 'xml') {
        await this.reply('xml信息目前还无能为力哦~')
        return true
      }
      if (!msgType) {
        await this.reply('鳄梨酱！！！')
        await this.avocadoRender(e, '# 鳄梨酱！！！')
        return true
      }
      if (!msgInfo) {
        [msgType, msgInfo] = await getImageOcrText(e)
      }
      logger.warn('msgInfo: ', msgInfo)
      logger.warn('msgType: ', msgType)
      if (msgType === 'text') {
        for (const item of msgInfo) {
          await this.avocadoRender(e, item)
        }
        return true
      }
      if (msgType === 'url') {
        for (const item of msgInfo) {
          await this.avocadoPreview(e, item)
        }
        return true
      }
      // 当遇到文字与图片混合的信息时，只会返回图片ocr的结果
      if (msgType === 'ocr') {
        let url
        // let replyMsg = []
        for (const item of msgInfo) {
          url = item.replace('\n', '').trim()
          if (urlRegex.test(url)) {
            url = url.startsWith('http') ? url : 'http://' + url
            await this.avocadoPreview(e, url)
          }
        }
        // 没有是识别到url。发送ocr结果
        let replyMsg = await makeForwardMsg(e, msgInfo, '鳄梨酱！')
        await this.reply(replyMsg)
        return true
      }
    } else {
      let msg
      // msg = e.msg.trim().replace(/#?鳄梨酱([！!]+)\s?/, '')
      msg = e.msg.trim().match(/#?鳄梨酱([！!]+)\s?(.*)/)
      logger.warn(msg)
      // 当为鳄梨酱！！！！时获取其ocr结果
      if (msg[1].length === 4) {
        let [, ocrRes] = await getImageOcrText(e) || ''
        if (ocrRes) {
          let replyMsg = await makeForwardMsg(e, ocrRes, '鳄梨酱！')
          await this.reply(replyMsg, e.isGroup)
        }
        return true
      }
      if (!msg[2].length) {
        await this.reply('鳄梨酱！！！')
        return true
      }
      // 存在链接和其他信息混合时，只预览链接
      if (urlRegex.test(msg)) {
        // 提取链接
        let urlList = msg
          .replace(/[\n\r，。、！？；：“”‘’（）【】`·《》〈〉「」『』﹃﹄〔〕]/g, ' ')
          .match(new RegExp(`(${urlRegex.toString().slice(1, -2)})`, 'ig'))
        logger.warn('urlList:', urlList)
        for (let item of urlList) {
          logger.warn('item: ', item)
          item = item.startsWith('http') ? item : 'http://' + item
          await this.avocadoPreview(this, item)
        }
        return true
      } else {
        await this.avocadoRender(this, msg)
        return true
      }
    }
  }

  async avocadoRender (e, param = '') {
    let text
    if (param.length) {
      text = param
    } else {
      if (e.source) {
        let msgType, msgInfo
        const isImg = await getImg(e)
        if (isImg.length) {
          [msgType, msgInfo] = await getImageOcrText(e) || ['', []]
        } else {
          [msgType, msgInfo] = await getSourceMsg(e) || ['', []]
        }
        if (msgType === 'xml') {
          await this.reply('xml信息目前还无能为力哦~')
          return true
        }
        if (!msgType) {
          await this.reply('鳄梨酱！！！')
          await this.avocadoRender(e, '# 鳄梨酱！！！')
          return true
        }
        text = msgInfo
        for (const item of text) {
          await this.avocadoRender(this, item)
        }
      } else {
        text = e.msg.trim().replace(/#?(鳄梨酱[！!]|md)\s?/, '')
      }
    }
    // 递归终止
    if (Array.isArray(text)) return true
    const markdownHtml = md.render(text)
    const tplFile = path.join(__dirname, '..', 'resources', 'markdown.html')
    let data = {
      markdownHtml,
      tplFile,
      quality: 100
    }
    await initPuppeteer()
    try {
      const page = await _puppeteer.browser.newPage()
      await this.reply(await puppeteer.screenshot('markdown', data))
      await page.close().catch((err) => logger.error(err))
    } catch (error) {
      logger.error(`${e.msg}图片生成失败:${error}`)
      await _puppeteer.browser.close().catch((err) => console.error(err))
      await this.reply(`图片生成失败:${error}`)
    }
  }

  async avocadoPreview (e, param = '') {
    let url
    if (param.length) {
      url = param
    } else {
      if (e.source) {
        let msgType, msgInfo
        const isImg = await getImg(e)
        if (isImg.length) {
          [msgType, msgInfo] = await getImageOcrText(e) || ['', []]
        } else {
          [msgType, msgInfo] = await getSourceMsg(e) || ['', []]
        }
        if (msgType === 'xml') {
          await this.reply('xml信息目前还无能为力哦~')
          return true
        }
        if (!url || msgType === 'text') {
          await this.reply('鳄梨酱！！！')
          return false
        }
        if (msgType === 'url') {
          for (const item of msgInfo) {
            await this.avocadoPreview(this, item)
          }
        } else if (msgType === 'ocr') {
          let i
          for (const item of url) {
            i = item.replace('\n', '').trim()
            if (urlRegex.test(i)) {
              i = i.startsWith('http') ? i : 'http://' + i
            }
            await this.avocadoPreview(this, i)
          }
        }
      } else {
        let msg = e.msg.trim().replace(/#?鳄梨酱[！!]\s?/, '')
        url = msg.match(urlRegex)[0]
        url = url.startsWith('http') ? url : 'http://' + url
      }
    }
    // 递归终止
    if (Array.isArray(url)) return true
    await initPuppeteer()
    const page = await _puppeteer.browser.newPage()
    try {
      await page.goto(url, { timeout: 120000 })
      await page.setViewport({
        width: 1920,
        height: 1080
      })
      await page.waitForTimeout(1000 * 10)
      // await page.waitForNavigation({ timeout: 10000 })
      await this.reply(segment.image(await page.screenshot({ fullPage: true })))
      await page.close().catch((err) => logger.error(err))
    } catch (error) {
      logger.error(`${e.msg}图片生成失败:${error}`)
      await _puppeteer.browser.close().catch((err) => console.error(err))
      await this.reply(`图片生成失败:${error}`)
    }
  }

  async avocadoHelp (e) {
    await initPuppeteer()
    const page = await _puppeteer.browser.newPage()
    try {
      await page.goto('file:///D:\\Miao-Yunzai\\plugins\\avocado-plugin\\resources\\README.html', { timeout: 120000 })
      await page.waitForTimeout(1000 * 3)
      // 获取需要截取的元素
      const elementHandle = await page.$('#write')

      // 获取元素在页面中的位置和尺寸
      const boundingBox = await elementHandle.boundingBox()

      // 计算需要截取的区域
      const clip = {
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height
      }
      logger.warn(Config.version)
      await page.evaluate(() => {
        const p = document.createElement('p')
        p.style.textAlign = 'center'
        p.style.fontSize = '20px'
        p.style.marginTop = '-25px'
        p.style.fontWeight = 'bold'
        p.textContent = 'Created By Yunzai-Bot & Avocado-Plugin'
        document.querySelector('#write').appendChild(p)
      })
      // await page.waitForNavigation({ timeout: 10000 })
      await this.reply(segment.image(await page.screenshot({ clip, type: 'jpeg', quality: 100 })))
      await page.close().catch((err) => logger.error(err))
    } catch (error) {
      logger.error(`${e.msg}图片生成失败:${error}`)
      await _puppeteer.browser.close().catch((err) => console.error(err))
    }
    return true
  }

  async avocadoWeather (e) {
    let targetArea
    const areaConfig = Config.targetArea || []
    let match = e.msg.trim().match(/^#?(.*)鳄梨酱[.。]([.。]*)/)
    if (match[1]) {
      targetArea = match[1]
      if (!(await getAreaInfo(this, targetArea))) {
        await this.reply(`还不支持${match[1]}鳄梨酱ヾ(≧O≦)〃嗷~`, e.isGroup)
        return false
      }
    } else if (match[2]) {
      targetArea = areaConfig.length > (match[2].length)
        ? areaConfig[match[2].length]
        : cities[Math.floor(Math.random() * cities.length)]
    } else {
      targetArea = areaConfig[0] || cities[Math.floor(Math.random() * cities.length)]
    }
    logger.warn('match: ', match)
    logger.warn('targetArea:', targetArea)
    let result = await weather(e, targetArea)
    await this.reply(result ? segment.image(result) : '没有找到这个鳄梨酱😞', e.isGroup)
    return true
  }

  async avocadoTranslate (e, languageCode = '', param = '') {
    let pendingText, langCode
    const codeConfig = Config.translateLang
    logger.warn(codeConfig)
    // [?？]([?？]+) => 使match结果和配置数组的索引保持一致
    const translateRegex = /^#?(.*)鳄梨酱[?？]([?？]*)/
    const match = this.e.msg.trim().match(translateRegex)
    if (match[1]) {
      langCode = translateLangSupports.find(item => item.label === match[1])?.code || 'auto'
      if (langCode === 'auto') {
        await this.reply(`还不支持${match[1]}鳄梨酱ヾ(≧O≦)〃嗷~`, e.isGroup)
      }
    } else if (match[2]) {
      langCode = codeConfig.length > (match[2].length - 1)
        ? codeConfig[match[2].length - 1].charAt(0)
        : languageCode || 'auto'
    } else {
      langCode = 'auto'
    }
    if (param.length) {
      pendingText = param
      langCode = languageCode
    } else {
      if (e.source) {
        let msgType, msgInfo
        const isImg = await getImg(e)
        logger.warn('isImg:', isImg)
        if (isImg.length) {
          [msgType, msgInfo] = await getImageOcrText(e) || ['', []]
        } else {
          [msgType, msgInfo] = await getSourceMsg(e) || ['', []]
        }
        logger.warn('msgType:', msgType)
        logger.warn('msgInfo:', msgInfo)
        if (msgType === 'xml') {
          await this.reply('xml信息目前还无能为力哦~')
          return true
        }
        if (msgType === 'url') {
          await this.reply('www.iLove鳄梨酱.icu')
          return false
        }
        if (msgType === 'text') {
          pendingText = msgInfo
        }
        if (msgType === 'ocr') {
          let i
          for (const item of msgInfo) {
            i = item.replace(/\n\r/, '').trim().replace(translateRegex, '')
            if (urlRegex.test(i)) {
              await this.reply('www.iLove鳄梨酱.icu')
              return false
            }
            await this.avocadoTranslate(this, langCode, i)
          }
        }
      } else {
        pendingText = this.e.msg.trim().replace(translateRegex, '')
      }
    }
    logger.warn('pendingText:', pendingText)
    logger.warn('langCode:', langCode)
    // 递归终止
    if (pendingText === undefined || langCode === undefined) return true
    let result = await translate(pendingText, langCode)
    await this.reply(result)
    return true
  }

  async avocadoPsycho (e) {
    let url = 'https://xiaobapi.top/api/xb/api/onset.php?name=鳄梨酱'
    try {
      let response = await fetch(url)
      logger.warn(response)
      if (response.status === 200) {
        let json = await response.json()
        if (json.code === 1 && json.data) {
          await this.reply(json.data)
        } else {
          await e.reply('发电失败(ノへ￣、)：' + json.toString())
          return true
        }
      }
    } catch (err) {
      logger.error('发电失败(ノへ￣、)：', err)
      await e.reply('发电失败(ノへ￣、)：' + err)
      return false
    }
  }
}
