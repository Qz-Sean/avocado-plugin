import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import path from 'path'
import { Config } from '../utils/config.js'
import { translate } from '../utils/translate.js'
import {
  avocadoRender,
  getImageOcrText,
  getImg,
  getSourceMsg,
  makeForwardMsg,
  sleep
} from '../utils/common.js'
import { getAreaInfo, weather } from '../utils/weather.js'
import {
  cities,
  pluginRoot,
  pluginVersion,
  translateLangSupports,
  urlRegex,
  yunZaiVersion
} from '../utils/const.js'
import puppeteerManager from '../utils/puppeteer.js'
import { AvocadoPsycho } from './avocadoPsycho.js'

export class AvocadoRuleALL extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 200,
      rule: [
        {
          // 私聊使用在指令开头添加#
          reg: new RegExp(`#?${urlRegex.toString().slice(1, -2)}`, 'i'),
          fnc: 'avocadoPreview'
        },
        {
          reg: `^#?(${global.God}|鳄梨酱?)([!！]{3}|帮助)$`,
          fnc: 'avocadoHelp'
        },
        {
          reg: `^#?(${global.God}|鳄梨酱?)([!！]+)([?？]*)\\s?(.*)`,
          fnc: 'avocado'
        },
        {
          reg: `^#?(.*)(${global.God}|鳄梨酱?)[?？]([?？]*)`,
          fnc: 'avocadoTranslate'
        },
        {
          reg: `^#?(.*)(${global.God}|鳄梨酱?)[.。]([.。]*)$`,
          fnc: 'avocadoWeather'
        },
        {
          reg: `^#?((${global.God}|鳄梨酱?)?#发[癫|电|疯](.+))`,
          fnc: 'avocadoPsycho'
        }
      ]
    })
  }

  async avocadoPsycho (e) {
    const regex = new RegExp(`^#?((${global.God}|鳄梨酱?)?#发[癫电疯](.+))`)
    e.msg = e.msg.match(regex)[3]
    await new AvocadoPsycho().avocadoPsycho(e)
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
        await this.reply(`${global.God}！！！`)
        const img = await avocadoRender(`# ${global.God}！！！`)
        if (img) await e.reply(img)
        return true
      }
      if (!msgInfo) {
        [msgType, msgInfo] = await getImageOcrText(e)
      }
      logger.mark('msgInfo: ', msgInfo)
      logger.mark('msgType: ', msgType)
      if (msgType === 'text') {
        for (const item of msgInfo) {
          const img = await avocadoRender(item)
          if (img) await e.reply(img)
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
        let replyMsg = await makeForwardMsg(e, msgInfo, `${global.God}！`)
        await this.reply(replyMsg)
        return true
      }
    } else {
      let msg
      const regex = new RegExp(`#?(${global.God}|鳄梨酱?)([!！]+)([?？]*)\\s?(.*)`)
      msg = e.msg.trim().match(regex)
      if (!msg) { return false }
      // 鳄梨酱！！！！ + img =》 获取其ocr结果
      if (msg[2].length === 4) {
        let [, ocrRes] = await getImageOcrText(e) || ''
        if (ocrRes) {
          let replyMsg = await makeForwardMsg(e, ocrRes, `${global.God}！`)
          await this.reply(replyMsg, e.isGroup)
        }
        return true
      }
      // text参数不存在
      if (!msg[4].length) {
        await this.reply(`${global.God}！！！`)
        return true
      }
      // 鳄梨酱！？ + text =》 转图片
      if (msg[2].length === 1 && msg[3].length === 1) {
        const img = await avocadoRender(msg[4])
        if (img) await e.reply(img)
        return true
      }
      // 存在链接和其他信息混合时，只预览链接
      if (urlRegex.test(msg)) {
        // 提取链接
        let urlList = msg
          .replace(/[\n\r，。、！？；：“”‘’（）【】`·《》〈〉「」『』﹃﹄〔〕]/g, ' ')
          .match(new RegExp(`(${urlRegex.toString().slice(1, -2)})`, 'ig'))
        logger.warn('urlList:', urlList)
        for (let url of urlList) {
          logger.warn('item: ', url)
          await this.avocadoPreview(this, url.startsWith('http') ? url : 'http://' + url)
        }
        return true
      }
    }
  }

  async avocadoPreview (e, param = '') {
    if (e.isGroup && e.msg.startsWith('#')) return false
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

  async avocadoHelp (e) {
    const start = Date.now()
    await puppeteerManager.init()
    const page = await puppeteerManager.newPage()
    try {
      const filePath = path.join(pluginRoot, 'resources', 'html', 'README.html')
      await page.goto(`file://${filePath}`, { timeout: 120000, waitUntil: 'networkidle0' })
      await page.waitForTimeout(1000)
      await page.evaluate((pluginVersion, yunZaiVersion) => {
        const p = document.createElement('p')
        p.style.textAlign = 'center'
        p.style.fontSize = '18px'
        p.style.marginTop = '-5px'
        p.style.fontWeight = 'bold'
        p.textContent = `Created By Yunzai-Bot ${yunZaiVersion} & Avocado-Plugin ${pluginVersion}`
        document.querySelector('#write').appendChild(p)
      }, pluginVersion, yunZaiVersion) // 将外部变量作为参数传入
      const body = await page.$('body')
      // await page.waitForNavigation({ timeout: 10000 })
      const buff = await body.screenshot({ type: 'jpeg', quality: 100 })
      const kb = (buff.length / 1024).toFixed(2) + 'kb'
      logger.mark(`[图片生成][帮助][${puppeteerManager.screenshotCount}次]${kb} ${logger.green(`${Date.now() - start}ms`)}`)
      await this.reply(segment.image(buff))
      await sleep(1300)
      await this.reply('更多可前往：https://github.com/Qz-Sean/avocado-plugin')
      await puppeteerManager.closePage(page)
    } catch (error) {
      await this.reply(`图片生成失败:${error}`)
      await puppeteerManager.close()
    }
    return true
  }

  async avocadoWeather (e) {
    let targetArea
    const areaConfig = Config.targetArea || []
    let match = e.msg.trim().match(new RegExp(`^#?(.*)${global.God}|鳄梨酱?[.。]([.。]*)`))
    if (match[1]) {
      targetArea = match[1]
      if (!(await getAreaInfo(this, targetArea))) {
        await this.reply(`找不到${match[1]}${global.God}呢╮(╯▽╰)╭`, e.isGroup)
        return true
      }
    } else if (match[2]) {
      targetArea = areaConfig.length > (match[2].length)
        ? areaConfig[match[2].length]
        : cities[Math.floor(Math.random() * cities.length)]
    } else {
      targetArea = areaConfig[0] || cities[Math.floor(Math.random() * cities.length)]
    }
    logger.warn('查询天气: ', targetArea)
    let result = await weather(e, targetArea)
    await this.reply(result ? segment.image(result) : `没有找到这个${global.God}😞`, e.isGroup)
    return true
  }

  /**
   * 鳄梨酱爱学习
   * @param e
   * @param text - 待翻译文本
   * @param languageCode - 语言代码
   * @returns {Promise<boolean>}
   */
  async avocadoTranslate (e, text = '', languageCode = 'auto') {
    let pendingText, langCode
    const codeConfig = Config.translateLang
    // [?？]([?？]+) => 使match[2]结果和配置数组的索引保持一致
    const translateRegex = new RegExp(`^#?(.*)(${global.God}|鳄梨酱?)[?？]([?？]*)`)
    const match = this.e.msg.trim().match(translateRegex)
    if (match[1]) {
      // 支持传入语言code或全称
      langCode = translateLangSupports.find(item => item.label === match[1] || item.code === match[1])?.code
      if (!langCode) {
        await this.reply(`还不支持${match[1]}鳄梨酱哦！`)
        return false
      }
    } else if (match[3]) {
      const langIndex = match[3].length - 1
      langCode = codeConfig.length > langIndex
        ? codeConfig[langIndex]
        : 'auto'
    } else {
      langCode = languageCode
    }
    // 插件内部调用
    if (text.length) {
      pendingText = text
      langCode = languageCode
    } else {
      if (e.source) {
        let msgType, msgInfo
        const isImg = await getImg(e)
        logger.mark('isImg:', isImg)
        if (isImg.length) {
          [msgType, msgInfo] = await getImageOcrText(e) || ['', []]
        } else {
          [msgType, msgInfo] = await getSourceMsg(e) || ['', []]
        }
        logger.mark('msgType:', msgType)
        logger.mark('msgInfo:', msgInfo)
        if (msgType === 'xml') {
          await this.reply('xml信息目前还无能为力哦~')
          return true
        }
        if (msgType === 'url') {
          await this.reply(`www.iLove${global.God}.icu`)
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
              await this.reply(`www.iLove${global.God}.icu`)
              return false
            }
            await this.avocadoTranslate(this, i, langCode)
          }
        }
      } else {
        pendingText = this.e.msg.trim().replace(translateRegex, '')
      }
    }
    logger.mark('pendingText:', pendingText)
    logger.mark('langCode:', langCode)
    // 递归终止
    if (pendingText === undefined || langCode === undefined) return true
    let result = await translate(pendingText, langCode)
    await this.reply(result)
    return true
  }
}
