import { pluginRoot, pluginVersion, urlRegex, yunZaiVersion } from './const.js'
import path from 'path'
import puppeteerManager from './puppeteer.js'
import fs from 'fs'
import template from 'art-template'
import { segment } from 'icqq'
import MarkdownIt from 'markdown-it'
import { Config } from './config.js'
export async function getSource (e) {
  if (!e.source) return false
  let sourceReply
  if (e.isGroup) {
    sourceReply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message
  } else {
    // bug：多张图片时有概率不能正常读取信息，应该是拿信息的时候拿错了
    sourceReply = (await e.friend.getChatHistory(e.source.time, 1)).pop()?.message
  }
  logger.warn('sourceReply: ', sourceReply)
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
async function getMasterQQ () {
  return (await import('../../../lib/config/config.js')).default.masterQQ
}
function getOnsetMinutes () {
  return Math.ceil(Math.random() * 3)
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
    await replyPrivate(qq, msg)
  }
}

/**
 * 发送私聊消息，仅给好友发送
 * @param userId qq号
 * @param msg 消息
 */
async function replyPrivate (userId, msg) {
  userId = Number(userId)
  let friend = Bot.fl.get(userId)
  if (friend) {
    logger.mark(`发送好友消息[${friend.nickname}](${userId})`)
    return await Bot.pickUser(userId).sendMsg(msg).catch((err) => {
      logger.mark(err)
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
 * @param otherInfo
 * - renderType： 渲染类型 1. 普通文本渲染 2. 以表格样式渲染 3. 渲染电影信息
 * @returns {Promise<ImageElem|string>}
 */
export async function avocadoRender (pendingText, otherInfo = { title: '', caption: '', footer: '', renderType: 1 }) {
  let tplFile, data, buff
  let title = otherInfo.title
  if (title === '') title = Math.random() > 0.5 ? ' Here is Avocado! ' : ' Avocado’s here! '
  try {
    const start = Date.now()
    await puppeteerManager.init()
    const page = await puppeteerManager.newPage()
    if (otherInfo.renderType === 1) {
      tplFile = path.join(pluginRoot, 'resources', 'html', 'text.html')
      // 接替md语法
      const md = new MarkdownIt({
        html: true,
        breaks: true
      })
      const markdownHtml = md.render(pendingText)
      data = {
        title,
        markdownHtml,
        footer: otherInfo.footer,
        pluginVersion,
        yunZaiVersion
      }
    } else if (otherInfo.renderType === 2) {
      tplFile = path.join(pluginRoot, 'resources', 'html', 'table.html')
      data = {
        title,
        caption: otherInfo.caption,
        columns: pendingText,
        footer: otherInfo.footer,
        pluginVersion,
        yunZaiVersion
      }
    } else if (otherInfo.renderType === 3) {
      tplFile = path.join(pluginRoot, 'resources', 'html', 'movie.html')
      // 接替md语法
      const md = new MarkdownIt({
        html: true,
        breaks: true
      })
      const markdownHtml = md.render(pendingText)
      title = md.render(title)
      data = {
        title,
        markdownHtml,
        footer: otherInfo.footer,
        pluginVersion,
        yunZaiVersion
      }
    }
    await page.goto(`file://${tplFile}`, { waitUntil: 'networkidle0' })
    const templateContent = await fs.promises.readFile(tplFile, 'utf-8')
    const render = template.compile(templateContent)
    const htmlContent = render(data)
    await page.setContent(htmlContent)
    if (title === null) {
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
    const { width, height } = await page.$eval('body', (element) => {
      const { width, height } = element.getBoundingClientRect()
      return { width, height }
    })
    await page.setViewport({
      width: Math.round(width) || 1920,
      height: Math.round(height) || 1080,
      deviceScaleFactor: Number(Config.deviceScaleFactor) || 1
    })
    const body = await page.$('body')
    buff = await body.screenshot({
      type: 'jpeg',
      quality: 85
    })
    if (title === null && otherInfo.renderType === 1) { title = '发癫' }
    const kb = (buff.length / 1024).toFixed(2) + 'kb'
    logger.mark(`[图片生成][${title?.length > 20 ? '图片' : title}][${puppeteerManager.screenshotCount}次]${kb} ${logger.green(`${Date.now() - start}ms`)}`)
    await puppeteerManager.closePage(page)
  } catch (error) {
    await puppeteerManager.close()
    return `图片生成失败:${error}`
  }
  return segment.image(buff)
}
export function generateArray (length) {
  const array = []
  for (let i = 0; i < length; i++) { array.push(i) }
  return array
}
// 获取单部影片的详细信息
export async function getMovieDetail (movieId) {
  try {
    const url = `https://m.maoyan.com/ajax/detailmovie?movieId=${movieId}`
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
    if (!response.ok) {
      logger.error('Request failed with status code', response.status)
      return false
    }
    const detailResponse = await response.json()
    const movieDetailJson = detailResponse.detailMovie
    logger.warn('detailResponse', detailResponse)
    let viewable
    const releaseDate = new Date(movieDetailJson.rt)
    const now = new Date()
    const diffTime = now.getTime() - releaseDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > 0) {
      viewable = 1
    } else {
      viewable = 0
    }
    return {
      img: movieDetailJson?.img || 0,
      id: movieId,
      nm: movieDetailJson.nm.replace(',', '，'),
      enm: movieDetailJson.enm.replace(',', '，'),
      filmAlias: movieDetailJson.filmAlias,
      rt: movieDetailJson.rt,
      viewable,
      diffDays,
      sc: movieDetailJson.sc,
      cat: movieDetailJson.cat.replace(',', '，'),
      star: movieDetailJson.star.replace(',', '，'),
      dra: movieDetailJson.dra.replace(/\s/g, ''),
      watched: movieDetailJson.watched,
      wish: movieDetailJson.wish,
      ver: movieDetailJson.ver,
      src: movieDetailJson.src,
      dur: movieDetailJson.dur + '分钟',
      oriLang: movieDetailJson.oriLang,
      pubDesc: movieDetailJson.pubDesc,
      videoName: movieDetailJson.videoName,
      videourl: movieDetailJson.videourl,
      photos: movieDetailJson.photos.slice(0, 5)
    }
  } catch (error) {
    logger.error(error)
    return false
  }
}
export async function getMovieList (e) {
  let movieList, movieIds
  try {
    const url = 'https://m.maoyan.com/ajax/movieOnInfoList'
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
    if (!response.ok) {
      logger.error('Request failed with status code', response.status)
      return false
    }
    const resJson = await response.json()
    movieList = resJson.movieList
    movieIds = resJson.movieIds
    // logger.warn('resJson:', resJson)
    // logger.warn('movieList:', movieList)
    const movieInfoList = []
    for (const [index, id] of movieIds.entries()) {
      let movieDetail = {}
      movieDetail.index = index + 1
      movieDetail = Object.assign({}, movieDetail, await getMovieDetail(id))
      movieInfoList.push(movieDetail)
      await sleep(3000)
    }
    return movieInfoList
  } catch (error) {
    logger.error(error)
    return false
  }
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
export function syncPath (fullPath, dataType) {
  try {
    if (!fs.existsSync(fullPath)) {
      const directoryPath = path.dirname(fullPath)
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true })
      }
      fs.writeFileSync(fullPath, dataType)
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
