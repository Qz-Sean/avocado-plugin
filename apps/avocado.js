import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import path from 'path'
import { Config } from '../utils/config.js'
import { translate } from '../utils/translate.js'
import { getImageOcrText, getImg, getMovieList, getSourceMsg, makeForwardMsg, sleep } from '../utils/common.js'
import { getAreaInfo, weather } from '../utils/weather.js'
import { cities, movieKeyMap, pluginRoot, translateLangSupports, urlRegex } from '../utils/const.js'
import puppeteerManager from '../utils/puppeteer.js'
import template from 'art-template'
import MarkdownIt from 'markdown-it'

export class AvocadoRuleALL extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 300,
      rule: [
        {
          /** 命令正则匹配 */
          reg: new RegExp(`^${urlRegex.toString().slice(1, -2)}$`, 'i'),
          /** 执行方法 */
          fnc: 'avocadoPreview'
        },
        {
          reg: `^#?${global.God}[!！]{3}$`,
          fnc: 'avocadoHelp'
        },
        {
          reg: `^#?(.*)${global.God}[！!]`,
          fnc: 'avocadoImg'
        },
        {
          reg: `^#?(.*)${global.God}[?？]([?？]*)$`,
          fnc: 'avocadoTranslate'
        },
        {
          reg: `^#?(.*)${global.God}[.。]([.。]*)$`,
          fnc: 'avocadoWeather'
        },
        {
          reg: `^#?(${global.God}0.0|来点好看的)$`,
          fnc: 'avocadoMovie'
        }
      ]
    })
  }

  async avocadoImg (e) {
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
        const img = await this.avocadoRender(e, `# ${global.God}！！！`)
        if (img) await e.reply(img)
        return true
      }
      if (!msgInfo) {
        [msgType, msgInfo] = await getImageOcrText(e)
      }
      logger.warn('msgInfo: ', msgInfo)
      logger.warn('msgType: ', msgType)
      if (msgType === 'text') {
        for (const item of msgInfo) {
          const img = await this.avocadoRender(e, item)
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
      // msg = e.msg.trim().replace(/#?鳄梨酱([！!]+)\s?/, '')
      const regex = new RegExp(`#?${global.God}([!！]+)([?？]+)\\s?(.*)`)
      msg = e.msg.trim().match(regex)
      if (!msg) { return false }
      // 当为鳄梨酱！！！！时获取其ocr结果
      if (msg[1].length === 4) {
        let [, ocrRes] = await getImageOcrText(e) || ''
        if (ocrRes) {
          let replyMsg = await makeForwardMsg(e, ocrRes, `${global.God}！`)
          await this.reply(replyMsg, e.isGroup)
        }
        return true
      }
      if (!msg[3].length) {
        await this.reply(`${global.God}！！！`)
        return true
      }
      if (msg[1].length === 1 && msg[2].length === 1) {
        const img = await this.avocadoRender(e, msg[3])
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
        for (let item of urlList) {
          logger.warn('item: ', item)
          item = item.startsWith('http') ? item : 'http://' + item
          await this.avocadoPreview(this, item)
        }
        return true
      }
    }
  }

  async avocadoRender (e, param = '', title = '') {
    let text, img
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
          await this.reply(`${global.God}！！！`)
          const img = await this.avocadoRender(e, `# ${global.God}！！！`)
          if (img) await e.reply(img)
          return true
        }
        text = msgInfo
        for (const item of text) {
          const img = await this.avocadoRender(this, item)
          if (img) await e.reply(img)
        }
      } else {
        text = e.msg.trim().replace(new RegExp(`#?${global.God}[！!]\\s?`), '')
      }
    }
    // 递归终止
    if (Array.isArray(text)) return true
    const tplFile = path.join(pluginRoot, 'resources', 'html', 'markdown.html')
    if (title === '') {
      title = Math.random() > 0.5 ? ' Here is Avocado! ' : ' Avocado’s here! '
    }
    // 接替md语法
    const md = new MarkdownIt({
      html: true,
      breaks: true
    })
    const markdownHtml = md.render(text)
    try {
      await puppeteerManager.init()
      const page = await puppeteerManager.newPage()
      await page.goto(`file://${tplFile}`, { waitUntil: 'networkidle0' })
      const templateContent = await page.content()
      const render = template.compile(templateContent)
      const data = { title, markdownHtml }
      const htmlContent = render(data)
      await page.setContent(htmlContent)
      const body = await page.$('body')
      img = segment.image(await body.screenshot({
        type: 'jpeg',
        quality: 100
      }))
      await puppeteerManager.closePage(page)
      await puppeteerManager.close()
    } catch (error) {
      logger.error(`${e.msg}图片生成失败:${error}`)
      return `${e.msg}图片生成失败:${error}`
    }
    return img
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
          await this.reply(`${global.God}`)
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
        let msg = e.msg.trim().replace(new RegExp(`#?${global.God}[！!]\\s?`, 'g'), '')
        url = msg.match(urlRegex)[0]
        url = url.startsWith('http') ? url : 'http://' + url
      }
    }
    // 递归终止
    if (Array.isArray(url)) return true
    await puppeteerManager.init()
    const page = await puppeteerManager.newPage()
    try {
      await page.goto(url, { timeout: 120000 })
      await page.setViewport({
        width: 1920,
        height: 1080
      })
      await page.waitForTimeout(1000 * 10)
      // await page.waitForNavigation({ timeout: 10000 })
      await this.reply(segment.image(await page.screenshot({
        fullPage: true,
        type: 'jpeg',
        quality: 100
      })))
      await puppeteerManager.closePage(page)
      await puppeteerManager.close()
    } catch (error) {
      logger.error(`${e.msg}图片生成失败:${error}`)
      await puppeteerManager.close()
      await this.reply(`图片生成失败:${error}`)
    }
  }

  async avocadoHelp (e) {
    await puppeteerManager.init()
    const page = await puppeteerManager.newPage()
    try {
      const filePath = path.join(pluginRoot, 'resources', 'html', 'README.html')
      await page.goto(`file://${filePath}`, { timeout: 120000, waitUntil: 'networkidle0' })
      await page.waitForTimeout(1000)
      await page.evaluate(() => {
        const p = document.createElement('p')
        p.style.textAlign = 'center'
        p.style.fontSize = '18px'
        p.style.marginTop = '-5px'
        p.style.fontWeight = 'bold'
        p.textContent = 'Created By Yunzai-Bot & Avocado-Plugin'
        document.querySelector('#write').appendChild(p)
      })
      const body = await page.$('body')
      // await page.waitForNavigation({ timeout: 10000 })
      await this.reply(segment.image(await body.screenshot({ type: 'jpeg', quality: 100 })))
      await sleep(1300)
      await this.reply('更多可前往：https://github.com/Qz-Sean/avocado-plugin')
      await puppeteerManager.closePage(page)
      await puppeteerManager.close()
    } catch (error) {
      logger.error(`${e.msg}图片生成失败:${error}`)
      await puppeteerManager.close()
      await this.reply(`图片生成失败:${error}`)
    }
    return true
  }

  async avocadoWeather (e) {
    let targetArea
    const areaConfig = Config.targetArea || []
    let match = e.msg.trim().match(new RegExp(`^#?(.*)${global.God}[.。]([.。]*)`))
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

  async avocadoTranslate (e, languageCode = '', param = '') {
    let pendingText, langCode
    const codeConfig = Config.translateLang
    logger.warn(codeConfig)
    // [?？]([?？]+) => 使match结果和配置数组的索引保持一致
    const translateRegex = new RegExp(`^#?(.*)${global.God}[?？]([?？]*)`)
    const match = this.e.msg.trim().match(translateRegex)
    logger.warn(match)
    if (match[1]) {
      langCode = translateLangSupports.find(item => item.label === match[1])?.code || 'auto'
      if (langCode === 'auto') {
        await this.reply(`还不支持${match[1]}${global.God}ヾ(≧O≦)〃嗷~`, e.isGroup)
        return true
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

  async avocadoMovie (e) {
    let mainInfoList
    if (await redis.get('AVOCADO:MOVIE_EXPIRE')) {
      mainInfoList = JSON.parse(await redis.get('AVOCADO:MOVIE_DETAILS'))
    } else {
      await this.reply('更新数据中...请稍等...')
      try {
        mainInfoList = await getMovieList(this)
        await redis.set('AVOCADO:MOVIE_DETAILS', JSON.stringify(mainInfoList))
        await redis.set('AVOCADO:MOVIE_EXPIRE', 1, { EX: 60 * 60 * 24 })
      } catch (error) {
        this.reply(`啊哦!${error}`)
        return false
      }
    }
    const mlistLength = mainInfoList.length
    let scList = mainInfoList
      .filter(item => item.id)
      .map((item, index) => {
        let sc = item.sc
        let n
        if (sc !== 0) {
          return `${index + 1}.${item.nm} -> 评分: ${sc}`
        } else if (item.viewable === 1) {
          if (item.diffDays > 15) {
            n = '大概率烂片~'
          } else if (item.diffDays > 7) {
            n = '成分复杂...'
          } else {
            n = '是新片哦~'
          }
        } else {
          n = '还在预售哦~'
        }
        return `${index + 1}.${item.nm} -> ${n}`
      })
    const img = await this.avocadoRender({}, `最近上映的影片共有${mlistLength}部\n${scList.join('\n')}\n你想了解关于哪一部影片的详细信息呢~`, '热映电影')
    if (img) {
      await this.reply(img)
    }
    this.setContext('pickMe', false, 180)
  }

  async pickMe (e) {
    const msg = this.e.msg
    if (msg === `超！是${global.God}啊！` || parseInt(msg) === 0) {
      await this.reply(`${global.God}！！！`)
      this.finish('pickMe')
      return true
    }
    let mainInfoList = JSON.parse(await redis.get('AVOCADO:MOVIE_DETAILS'))
    if (!/^\d+$/.test(msg)) {
      if (!mainInfoList.some(item => item.nm === msg)) {
        await this.reply('...')
        return
      }
    } else {
      if (!(msg < mainInfoList.length && msg > 0)) {
        await this.reply('...')
        return
      }
    }
    let selectedMovie = !/^\d+$/.test(msg)
      ? mainInfoList.filter(item => item.nm === msg)[0]
      : mainInfoList[parseInt(msg) - 1]
    logger.warn(selectedMovie)
    let transformedMoviesDetails = []
    Object.keys(movieKeyMap).map(async key => {
      // 空值不要
      if (!selectedMovie[key]) return false
      let img
      if (key === 'img') {
        img = segment.image(selectedMovie[key])
        transformedMoviesDetails.push(img)
        transformedMoviesDetails.push('\n')
        return true
      }
      if (key === 'nm') {
        transformedMoviesDetails.push(`${movieKeyMap[key]}: ${selectedMovie[key]}\n`)
        return true
      }
      if (key === 'sc' && selectedMovie.sc !== 0) {
        transformedMoviesDetails.push(`${movieKeyMap[key]}: ${selectedMovie[key]}\n`)
        return true
      }
      if (key === 'videoName') {
        transformedMoviesDetails.push(`${movieKeyMap[key]}: ${selectedMovie[key]}\n`)
        return true
      }
      if (key === 'videourl') {
        transformedMoviesDetails.push(`${selectedMovie[key]}`)
        transformedMoviesDetails.push('\n')
        return true
      }
      if (key === 'photos') {
        let photo
        transformedMoviesDetails.push(`${movieKeyMap[key]}: \n`)
        for (const i of selectedMovie[key]) {
          photo = segment.image(i)
          transformedMoviesDetails.push(photo)
        }
        return true
      }
      transformedMoviesDetails.push(`${movieKeyMap[key]}: ${selectedMovie[key]}\n`)
      return true
    })
    await this.reply(await makeForwardMsg(e, [transformedMoviesDetails], '鳄门🙏...'))
    await this.reply(`可继续选择影片~~输入 超！是${global.God}啊！ 结束此次操作¡¡¡( •̀ ᴗ •́ )و!!!`)
  }
}
