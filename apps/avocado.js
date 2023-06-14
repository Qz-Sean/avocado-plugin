import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import path from 'path'
import { Config } from '../utils/config.js'
import { translate } from '../utils/translate.js'
import {
  avocadoRender,
  getImageOcrText,
  getImg,
  getMovieList,
  getSourceMsg,
  makeForwardMsg,
  sleep, splitArray
} from '../utils/common.js'
import { getAreaInfo, weather } from '../utils/weather.js'
import { cities, movieKeyMap, pluginRoot, translateLangSupports, urlRegex } from '../utils/const.js'
import puppeteerManager from '../utils/puppeteer.js'

export class AvocadoRuleALL extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 200,
      rule: [
        {
          /** 命令正则匹配 */
          reg: new RegExp(`^${urlRegex.toString().slice(1, -2)}$`, 'i'),
          /** 执行方法 */
          fnc: 'avocadoPreview'
        },
        {
          reg: `^#?((${global.God}|鳄梨酱)[!！]{3}|鳄梨酱?帮助)$`,
          fnc: 'avocadoHelp'
        },
        {
          reg: `^#?(.*)${global.God}[！!]`,
          fnc: 'avocadoImg'
        },
        {
          reg: `^#?(.*)${global.God}[?？]([?？]*)`,
          fnc: 'avocadoTranslate'
        },
        {
          reg: `^#?(.*)${global.God}[.。]([.。]*)$`,
          fnc: 'avocadoWeather'
        },
        {
          reg: `^#?((${global.God}|鳄梨酱)?#电影|来点好看的)$`,
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
        const img = await avocadoRender(`# ${global.God}！！！`)
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
        const img = await avocadoRender(msg[3])
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
    const translateRegex = new RegExp(`^#?(.*)${global.God}[?？]([?？]*)`)
    const match = this.e.msg.trim().match(translateRegex)
    if (match[1]) {
      // 支持传入语言code或全称
      langCode = translateLangSupports.find(item => item.label === match[1] || item.code === match[1])?.code
      if (!langCode) {
        await this.reply(`还不支持${match[1]}鳄梨酱哦！`)
        return false
      }
    } else if (match[2]) {
      const langIndex = match[2].length - 1
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
            await this.avocadoTranslate(this, i, langCode)
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
    let movieList
    if (await redis.get('AVOCADO:MOVIE_EXPIRE')) {
      movieList = JSON.parse(await redis.get('AVOCADO:MOVIE_DETAILS'))
    } else {
      await this.reply('更新数据中...此过程需要较长时间，请稍等...')
      try {
        movieList = await getMovieList(this)
        await redis.set('AVOCADO:MOVIE_DETAILS', JSON.stringify(movieList))
        await redis.set('AVOCADO:MOVIE_EXPIRE', 1, { EX: 60 * 60 * 24 * 3 })
      } catch (error) {
        this.reply(`啊哦!${error}`)
        return false
      }
    }
    if (!movieList.length) {
      await this.reply('出错了！')
      return false
    }
    // 我的评价！
    let analyzedList = movieList
      .filter(item => item.id)
      .map(item => {
        let sc = item.sc
        let n
        if (sc !== 0) {
          return `${item.index}.${item.nm} -> 评分: ${sc}`
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
        return `${item.index}.${item.nm} -> ${n}`
      })
    analyzedList = splitArray(analyzedList, 2)
    const img = await avocadoRender(analyzedList, {
      title: '热映电影',
      caption: '',
      footer: `<strong><i>最近上映的影片共有${movieList.length}部，你想了解哪一部影片呢~</i></strong>`,
      renderType: 2
    })

    if (!img) {
      await this.reply('生成图片错误！')
      return false
    }
    await this.reply(img)
    this.setContext('pickMe', e.isGroup, 300)
  }

  async pickMe (e) {
    if (typeof this.e.msg !== 'string') {
      return
    }
    let mainInfoList = JSON.parse(await redis.get('AVOCADO:MOVIE_DETAILS'))
    const reg = new RegExp(`^((0{1,2})|(${mainInfoList.map(item => item.index).join('|')})|(${mainInfoList.map(item => item.nm).join('|').replace(/\*/g, ' fuck ')}))$`)
    if (!reg.test(this.e.msg)) { return }
    if (this.e.msg === '0') {
      await redis.del(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`)
      logger.mark('finish pickMe')
      await this.reply(`${global.God}！！！`)
      this.finish('pickMe')
      return true
    }
    let selectedMovie
    try {
      if (this.e.msg === '00') {
        const movieIndex = await redis.get(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`)
        if (movieIndex) {
          selectedMovie = mainInfoList.find(item => item.index === parseInt(movieIndex))
        } else {
          await this.reply('先告诉我你想了解的电影吧！')
          return
        }
      } else {
        selectedMovie = mainInfoList.find(item => item.index === parseInt(this.e.msg) || item.nm === this.e.msg)
      }
      let transformedMoviesDetails = {}
      let others = []
      Object.keys(movieKeyMap).map(async key => {
        // 空值不要
        if (!selectedMovie[key] || key === 'index') return false
        if (key === 'videoName') {
          others.push(`${movieKeyMap[key]}: ${selectedMovie[key]}\n`)
          return false
        }
        if (key === 'videourl') {
          others.push(`${selectedMovie[key]}`)
          others.push('\n')
          return false
        }
        if (key === 'photos') {
          let photo
          others.push(`${movieKeyMap[key]}: \n`)
          for (const i of selectedMovie[key]) {
            photo = segment.image(i)
            others.push(photo)
          }
          return false
        }
        transformedMoviesDetails[movieKeyMap[key]] = selectedMovie[key]
        return true
      })
      let str = Object.keys(transformedMoviesDetails).map(function (key) {
        if (key === '封面') return null
        return key + '：' + transformedMoviesDetails[key] + '\n'
      }).join('')
      if (this.e.msg === '00') {
        await this.reply(await makeForwardMsg(e, [others], '鳄门🙏...'))
        await this.reply('可继续选择影片~~\n回复 00 获取本片剧照及预告\n回复 0 结束此次操作\n¡¡¡( •̀ ᴗ •́ )و!!!')
        return
      }
      const img = await avocadoRender(str, {
        title: `![img](${transformedMoviesDetails['封面']})`,
        caption: '',
        footer: '<strong><i>可继续选择影片~~<br>回复 00 获取本片剧照及预告<br>回复 0 结束此次操作\n¡¡¡( •̀ ᴗ •́ )و!!!<i></strong>',
        renderType: 3
      })
      if (img) {
        await this.reply(img)
        await redis.set(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`, selectedMovie.index, { EX: 60 * 3 })
      } else {
        await this.e.reply('图片生成出错了！')
        logger.mark('finish pickMe')
        this.finish('pickMe')
      }
    } catch (error) {
      await this.e.reply(error)
      logger.mark('finish pickMe')
      this.finish('pickMe')
    }
  }

  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
   * @param data.at 是否at用户
   */
  reply (msg = '', quote = false, data = {}) {
    if (!this.e.reply || !msg) return false
    return this.e.reply(msg, quote, data)
  }

  conKey (isGroup = false) {
    if (isGroup) {
      return `${this.name}.${this.e.group_id}`
    } else {
      return `${this.name}.${this.userId || this.e.user_id}`
    }
  }

  /**
   * @param type 执行方法
   * @param isGroup 是否群聊
   * @param time 操作时间，默认120秒
   */
  setContext (type, isGroup = false, time = 120) {
    let key = this.conKey(isGroup)
    if (!stateArr[key]) stateArr[key] = {}
    stateArr[key][type] = this.e
    if (time) {
      /** 操作时间 */
      setTimeout(() => {
        if (stateArr[key][type]) {
          delete stateArr[key][type]
          // this.e.reply('操作超时已取消', true)
        }
      }, time * 1000)
    }
  }

  getContext () {
    let key = this.conKey()
    return stateArr[key]
  }

  getContextGroup () {
    let key = this.conKey(true)
    return stateArr[key]
  }

  /**
   * @param type 执行方法
   * @param isGroup 是否群聊
   */
  finish (type, isGroup = false) {
    if (stateArr[this.conKey(isGroup)] && stateArr[this.conKey(isGroup)][type]) {
      delete stateArr[this.conKey(isGroup)][type]
    }
  }
}
let stateArr = []
