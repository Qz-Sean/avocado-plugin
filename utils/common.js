import {urlRegex} from './const.js'
import axios from 'axios'

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
          logger.warn('match: ', match)
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
    logger.warn('urlList:', urlList)
    logger.warn('result:', result)
  }
  return urlList.length ? ['url', result] : ['text', result]
}

export async function getImg (e) {
  // 取消息中的图片、at的头像、回复的图片，放入e.img
  if (e.at && !e.source) {
    e.img = [`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`]
  }
  let sourceList = await getSource(e)
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
      logger.warn('textList', textList)
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
function generateRandomHeader () {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko'
    // 更多User-Agent选项
  ]
  const acceptLanguages = [
    'en-US,en;q=0.9',
    'zh-CN,zh;q=0.9',
    'ja-JP,ja;q=0.8'
    // 更多Accept-Language选项
  ]
  const referers = [
    'https://www.google.com/',
    'https://www.baidu.com/',
    'https://www.yahoo.com/'
    // 更多Referer选项
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
    // 其他请求头信息
  }

  const keys = Object.keys(headers).sort(() => Math.random() - 0.5)
  const result = {}
  for (let key of keys) {
    result[key] = headers[key]
  }

  return result
}
function addRandomHeader (config) {
  // 随机生成请求头
  const randomHeader = generateRandomHeader()
  config.headers = { ...config.headers, ...randomHeader }
  return config
}

// 获取单部影片的详细信息
export async function getMovieDetail (movieId) {
  try {
    // 添加请求拦截器
    axios.interceptors.request.use(addRandomHeader)
    const response = await axios.get(`https://m.maoyan.com/ajax/detailmovie?movieId=${movieId}`)
    if (response.status !== 200) {
      logger.error('Request failed with status code', response.status)
      return false
    }
    const detailResponse = response.data
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
      nm: movieDetailJson.nm,
      enm: movieDetailJson.enm,
      filmAlias: movieDetailJson.filmAlias,
      rt: movieDetailJson.rt,
      viewable,
      diffDays,
      sc: movieDetailJson.sc,
      cat: movieDetailJson.cat,
      star: movieDetailJson.star,
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
  let response, json, movieList, movieIds
  try {
    response = await axios.get('https://m.maoyan.com/ajax/movieOnInfoList')
    if (response.status !== 200) {
      logger.error('Request failed with status code', response.status)
      return false
    }
    json = response.data
    movieList = json.movieList
    movieIds = json.movieIds
    logger.warn('json:', json)
    logger.warn('movieList:', movieList)
  } catch (error) {
    logger.error(error)
    return false
  }
  const movieInfoList = []
  const otherInfoList = []
  for (const id of movieIds) {
    // const id = movie.id
    // logger.warn(id)
    // let eachMovie = {
    //   // 封面
    //   img: movie?.img || 0,
    //   // 最近上映时间
    //   rt: movie.rt
    // }
    // let viewable = movie?.showStateButton
    // if (viewable) {
    //   if (viewable.content === '购票') {
    //     eachMovie.viewable = 1
    //   } else {
    //     eachMovie.viewable = 0
    //   }
    // }
    let movieDetail, otherDetail
    movieDetail = await getMovieDetail(id)
    // Object.assign(eachMovie, movieDetail)
    movieInfoList.push(movieDetail)
    await sleep(3000)
  }
  return movieInfoList
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
export function sleep (ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
