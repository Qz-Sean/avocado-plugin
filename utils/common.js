import { blockedDomains, pluginRoot, pluginVersion, urlBlacklist, urlRegex, yunZaiVersion } from './const.js'
import path from 'path'
import puppeteerManager from './puppeteer.js'
import fs from 'fs'
import template from 'art-template'
import { segment } from 'icqq'
import MarkdownIt from 'markdown-it'
import { Config } from './config.js'
import fetch from 'node-fetch'
import { ChatGPTAPI } from 'chatgpt'
import chalk from 'chalk'
import dns from 'dns'

export async function getSource (e) {
  if (!e.source) return false
  let sourceReply
  if (e.isGroup) {
    sourceReply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message
  } else {
    // bug：多张图片时有概率不能正常读取信息，应该是拿信息的时候拿错了
    sourceReply = (await e.friend.getChatHistory(e.source.time, 1)).pop()?.message
  }
  // logger.warn('sourceReply: ', sourceReply)
  if (sourceReply.filter(item => item.type === 'xml').length) {
    return 'xml'
  }
  return sourceReply
}

export async function getSourceMsg (e) {
  const isImg = await getImg(e)
  if (isImg.length && isImg !== 'xml') return false
  // 最后的结果
  let result = []
  // 过滤出的url列表
  let urlList = []
  let sourceReplyList = await getSource(e)
  // xml信息
  if (sourceReplyList === 'xml') {
    return ['xml', '']
  }
  if (sourceReplyList) {
    let temp
    for (let val of sourceReplyList) {
      if (val.type === 'text') {
        temp = val.text.split(/[\r\n]/)
        temp.forEach(item => {
          let match = item.match(urlRegex)
          // logger.warn('match: ', match)
          if (match) {
            urlList = urlList.concat(match[0])
          }
        })
        if (urlList.length) {
          result = result.concat(urlList)
        } else {
          result.push(val.text)
        }
      }
    }
    // logger.warn('urlList:', urlList)
    // logger.warn('result:', result)
  }
  return urlList.length ? ['url', result] : ['text', result]
}

export async function getImg (e) {
  // 取消息中的图片、at的头像、回复的图片，放入e.img
  if (e.at && !e.source) {
    e.img = [`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`]
  }
  let sourceList = await getSource(e)
  if (sourceList) {
  // xml信息
    if (sourceList === 'xml') {
      return 'xml'
    }
    if (!sourceList.filter(item => item.type === 'image').length) {
      return false
    }
    if (sourceList) {
      let i = []
      for (let val of sourceList) {
        if (val.type === 'image') {
          i.push(val.url)
        }
      }
      e.img = i
    }
  }
  return e.img
}

export async function getImageOcrText (e) {
  const imgRes = await getImg(e)
  logger.warn('img:', imgRes)
  if (imgRes === 'xml') return ['xml', '']
  if (imgRes) {
    try {
      let textList = []
      let eachImgRes = ''
      for (let i in imgRes) {
        let imgOCR
        try {
          imgOCR = await Bot.imageOcr(imgRes[i])
        } catch (err) {
          logger.error('ocr没有获取有效结果: ' + err)
          break
        }
        for (let text of imgOCR.wordslist) {
          if (text.words) {
            eachImgRes += (`${text.words}  \n`)
          }
        }
        if (eachImgRes) textList.push(eachImgRes)
        eachImgRes = ''
      }
      if (!textList) return false
      // logger.warn('textList', textList)
      return ['ocr', textList]
    } catch (err) {
      logger.error('error: ', err)
      return false
    }
  } else {
    return false
  }
}

export async function getMasterQQ () {
  return (await import('../../../lib/config/config.js')).default.masterQQ
}

export async function getGptResponse (question) {
  try {
    logger.mark(chalk.blue('[avocado-plugin] Waiting for ChatGPT response...'))
    let proxy
    const completionParams = {}
    completionParams.model = 'gpt-3.5-turbo-0613'
    let api = new ChatGPTAPI({
      apiBaseUrl: Config.apiBaseUrl,
      apiKey: Config.apiKey,
      debug: false,
      completionParams,
      fetch: (url, options = {}) => {
        const defaultOptions = Config.proxy
          ? {
              agent: proxy(Config.proxy)
            }
          : {}
        const mergedOptions = {
          ...defaultOptions,
          ...options
        }
        return fetch(url, mergedOptions)
      }
    })
    const res = await api.sendMessage(question)
    if (res) {
      logger.mark(res.detail.usage)
      // logger.mark(Object.entries(res.detail.usage).map(([key, value]) => `${key}: ${value}`).join(', '))
    }
    return res?.text
  } catch (e) {
    logger.error(e)
    return false
  }
}
/**
 * 给主人发送消息
 * @param msg 消息内容
 * @param all 是否发送给所有主人，默认false
 * @param idx 不发送给所有主人时，指定发送给第几个主人，默认发送给第一个主人
 */
export async function sendToMaster (msg, all = false, idx = 0) {
  let masterQQ = await getMasterQQ()
  let sendTo = all ? masterQQ : [masterQQ[idx]]
  for (let qq of sendTo) {
    await sendPrivateMsg(qq, msg)
  }
}

/**
 * 给好友发送发送私聊消息
 * @param userId qq号
 * @param msg 消息
 */
export async function sendPrivateMsg (userId, msg) {
  let friend = Bot.getFriendList().get(userId)
  if (friend) {
    return await Bot.pickUser(userId).sendMsg(msg).catch((err) => {
      logger.error('sendPrivateMsg Error: ' + err)
    })
  }
}

export function generateRandomHeader () {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko'
  ]
  const acceptLanguages = [
    'en-US,en;q=0.9',
    'zh-CN,zh;q=0.9',
    'ja-JP,ja;q=0.8'
  ]
  const referers = [
    'https://www.google.com/',
    'https://www.baidu.com/',
    'https://www.yahoo.com/'
  ]
  const connections = [
    'keep-alive',
    'close'
  ]
  const cacheControls = [
    'no-cache',
    'max-age=0'
  ]

  const headers = {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
    Referer: referers[Math.floor(Math.random() * referers.length)],
    Connection: connections[Math.floor(Math.random() * connections.length)],
    'Cache-Control': cacheControls[Math.floor(Math.random() * cacheControls.length)]
  }

  const keys = Object.keys(headers).sort(() => Math.random() - 0.5)
  const result = {}
  for (let key of keys) {
    result[key] = headers[key]
  }
  return result
}

export function splitArray (arr, num) {
  const result = []
  const len = arr.length
  const size = Math.ceil(len / num)
  for (let i = 0; i < len; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 *
 * @param pendingText
 * @param {Object} [opts]
 * - renderType： 渲染类型 1. 普通文本渲染 2. 以表格样式渲染 3. 渲染电影详情信息 4. 渲染搜索电影结果详情
 */
export async function avocadoRender (pendingText, opts = {}) {
  let tplFile, data, buff
  const renderType = opts.renderType || 1
  let title = opts.title || (Math.random() > 0.5 ? ' Here is Avocado! ' : ' Avocado’s here! ')
  let caption = opts.caption || ''
  let width = opts.width || null
  let height = opts.height || null
  let from = opts.from || ''
  let footer = opts.footer || ''
  let transformEntity = opts.transformEntity || false
  let url = opts.url || ''
  try {
    const start = Date.now()
    await puppeteerManager.init()

    const page = await puppeteerManager.newPage()
    if (!url) {
      try {
      // 解析md语法
        const md = new MarkdownIt({
          html: true,
          breaks: true
        })
        if (renderType === 1) {
          tplFile = path.join(pluginRoot, 'resources', 'html', 'text.html')
          const markdownHtml = md.render(pendingText)
          data = {
            title,
            markdownHtml,
            footer,
            pluginVersion,
            yunZaiVersion
          }
        } else if (renderType === 2) {
          tplFile = path.join(pluginRoot, 'resources', 'html', 'table.html')
          data = {
            title,
            caption,
            columns: pendingText,
            footer,
            pluginVersion,
            yunZaiVersion
          }
        } else if (renderType === 3) {
          tplFile = path.join(pluginRoot, 'resources', 'html', 'movie.html')
          const markdownHtml = md.render(pendingText)
          title = md.render(title)
          data = {
            title,
            markdownHtml,
            footer,
            pluginVersion,
            yunZaiVersion
          }
        }
      } catch (error) {
        return `avocadoRender解析出错: ${error}`
      }
      await page.goto(`file://${tplFile}`, { waitUntil: 'networkidle0' })
      const templateContent = await fs.promises.readFile(tplFile, 'utf-8')
      const render = template.compile(templateContent)
      let htmlContent = render(data)
      // 当传入内容包含<>且没有经过mdrender时需要转义实体至正常标签
      if (transformEntity) {
        htmlContent = htmlContent.replace(/&#(\d+);/g, function (match, dec) {
          return String.fromCharCode(dec)
        })
      }
      const fullPath = path.join(pluginRoot, 'resources', 'html', 'render.html')
      await fs.writeFileSync(fullPath, htmlContent)
      await page.setContent(htmlContent)
      if (from === 'psycho') {
        await page.evaluate(() => {
          let elements = document.getElementsByClassName('title')
          while (elements.length > 0) {
            elements[0].remove()
          }
        })
      }
      if (from === 'searchMusic') { // 搜索歌曲
        await page.evaluate(() => {
          let elements = document.getElementsByClassName('title')
          while (elements.length > 0) {
            elements[0].remove()
          }
          let regex = /\sby\s/gi
          elements = document.querySelectorAll('*')
          for (let element of elements) {
          // 获取只包含一个文本节点的节点
            if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
              const text = element.childNodes[0].nodeValue
              // 替换斜体
              element.innerHTML = text.replace(regex, ' <em>by</em> ')
            }
          }
        })
      }
    } else {
      logger.info('avocadoPreviewUrl: ', url)
      url = url.trim().replace(/^#?/, '')
      url = url.startsWith('http') ? url : 'http://' + url
      await page.goto(url, { timeout: 1000 * 60 })
      await page.waitForTimeout(1000 * 5)
    }

    const viewportOpts = {}
    if (width && height) {
      viewportOpts.width = width
      viewportOpts.height = height
      viewportOpts.deviceScaleFactor = Number(Config.deviceScaleFactor) || 1
    } else {
      const { width, height } = await page.$eval('body', (element) => {
        const { width, height } = element.getBoundingClientRect()
        return { width, height }
      })
      viewportOpts.width = Math.round((url ? width + 300 : width)) || 1920
      viewportOpts.height = Math.round(height) || 1080
      viewportOpts.deviceScaleFactor = Number(Config.deviceScaleFactor) || 1
    }
    await page.setViewport(viewportOpts)
    const body = await page.$('body')
    const captureOpts = {
      type: 'jpeg',
      quality: 85
    }
    if (url) captureOpts.fullpage = true
    buff = await body.screenshot(captureOpts)
    let kb = (buff.length / 1024).toFixed(2)
    if (kb > 4096) {
      logger.mark('avocadoRender => 图片过大，准备二次处理')
      viewportOpts.deviceScaleFactor = 1
      captureOpts.quality = 100
      await page.setViewport(viewportOpts)
      buff = await body.screenshot(captureOpts)
      kb = '[new]' + (buff.length / 1024).toFixed(2)
    }
    logger.mark(`[图片生成][${title?.length > 20 ? '图片' : title}][${puppeteerManager.screenshotCount}次]${kb}kb ${logger.green(`${Date.now() - start}ms`)}`)
    await puppeteerManager.closePage(page)
  } catch (error) {
    await puppeteerManager.close()
    let errorReply = ''
    if (error.message.includes('net::ERR_CONNECTION_CLOSED')) {
      errorReply += '无法链接到目标服务器！'
    } else if (error.message.includes('Navigation timeout') || error.message.includes('net::ERR_CONNECTION_TIMED_OUT')) {
      errorReply += '连接超时！'
    } else {
      errorReply += error.message
    }
    return `avocadoRender图片生成失败: ${errorReply}`
  }
  return segment.image(buff)
}

export function generateArray (length) {
  const array = []
  for (let i = 0; i < length; i++) { array.push(i) }
  return array
}

export async function makeForwardMsg (e, msg = [], dec = '') {
  let nickname = Bot.nickname
  if (e.isGroup) {
    let info = await Bot.getGroupMemberInfo(e.group_id, Bot.uin)
    nickname = info.card || info.nickname
  }
  let userInfo = {
    user_id: Bot.uin,
    nickname
  }

  let forwardMsg = []
  msg.forEach(v => {
    forwardMsg.push({
      ...userInfo,
      message: v
    })
  })

  /** 制作转发内容 */
  if (e.isGroup) {
    forwardMsg = await e.group.makeForwardMsg(forwardMsg)
  } else if (e.friend) {
    forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
  } else {
    return false
  }

  if (dec) {
    /** 处理描述 */
    forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${dec}</title>`)
  }

  return forwardMsg
}

export function syncPath (fullPath, data) {
  try {
    if (!fs.existsSync(fullPath)) {
      const directoryPath = path.dirname(fullPath)
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true })
      }
      fs.writeFileSync(fullPath, data)
    }
  } catch (err) {
    logger.error(err)
    return false
  }
  return true
}

export function sleep (ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function refreshTimer (t) {
  if (!t.invokeTime) return false
  const currentTime = process.hrtime()

  const previousTime = t.invokeTime
  t.invokeTime = currentTime

  // 计算距上次调用经过的时间
  const diffInSeconds = currentTime[0] - previousTime[0]
  const diffInNanoSeconds = currentTime[1] - previousTime[1]
  const milliseconds = diffInSeconds * 1000 + diffInNanoSeconds / 1000000
  const seconds = milliseconds / 1000

  t.leftTime = Math.max(Math.ceil(t.leftTime - seconds), 0)
  return t
}

export function initTimer (t, duration) {
  const currentTime = process.hrtime()
  t.leftTime = duration
  t.invokeTime = currentTime
  return t.leftTime
}

export async function filterUrl (input) {
  const regex = new RegExp(urlRegex.toString().slice(1, -2), 'ig')
  const regex1 = /[\u4e00-\u9fa5\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/g
  const cleanedInput = input.replace(regex1, ' ')
  const urls = cleanedInput.match(regex)

  if (!urls) return []
  // logger.warn(filteredUrls)
  return await Promise.all(urls.map(async url => {
    return await filterSingleUrl(url)
  }))
  // return urls.filter(async url => await filterSingleUrl(url))
}

async function filterSingleUrl (url) {
  url = url.startsWith('http') ? url : 'http://' + url
  const isBlocked = urlBlacklist.some(item => item.test(url)) || blockedDomains.test(url)
  const isValidUrl = !!(await getIPAddress(getDomain(url)))
  return isBlocked ? false : isValidUrl ? url : false
}
function getDomain (url) {
  const domainRegex = /((?:[\u4e00-\u9fa5a-zA-Z0-9-]+\.)+[\u4e00-\u9fa5a-zA-Z]{2,})/
  const match = url.match(domainRegex)
  return match ? match[1] : false
}
async function getIPAddress (host) {
  try {
    return await new Promise((resolve, reject) => {
      dns.lookup(host, (err, address) => {
        if (err) {
          reject(err)
        } else {
          resolve(address)
        }
      })
    })
  } catch (error) {
    return false
  }
}
