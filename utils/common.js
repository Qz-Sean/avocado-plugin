import { fileURLToPath } from 'url'
import { dirname } from 'path'
import MarkdownIt from 'markdown-it'
import fs from 'fs'
import yaml from 'yaml'
import puppeteer from 'puppeteer'

// const regex = /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:[\w\x80-\xff]+(?:\.[\w\x80-\xff]+)+)(?:[\w\x80-\xff]*)?(?::\d{2,5})?(?:\/[\w\x80-\xff]*)*(?:\??(?:[\w\x80-\xff]+=[\w\x80-\xff]*&)*[\w\x80-\xff]+=[\w\x80-\xff]*)?(?:#[\w\x80-\xff]*)?)/

export let urlRegex = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:((?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?)(?:\/[\w\u00a1-\uffff$-_.+!*'(),%]+)*(?:\?(?:[\w\u00a1-\uffff$-_.+!*(),%:@&=]|(?:[\[\]])|(?:[\u00a1-\uffff]))*)?(?:#(?:[\w\u00a1-\uffff$-_.+!*'(),;:@&=]|(?:[\[\]]))*)?/i
export let _puppeteer

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)
export const md = new MarkdownIt({
  html: true,
  breaks: true
})
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

export async function initPuppeteer () {
  try {
    const Puppeteer = (await import('../../../renderers/puppeteer/lib/puppeteer.js')).default
    let puppeteerCfg = {}
    let configFile = './renderers/puppeteer/config.yaml'
    logger.warn(fs.existsSync(configFile))
    if (fs.existsSync(configFile)) {
      try {
        puppeteerCfg = yaml.parse(fs.readFileSync(configFile, 'utf8'))
      } catch (e) {
        puppeteerCfg = {}
      }
    }
    _puppeteer = new Puppeteer(puppeteerCfg)
  } catch (e) {
    console.error('未能加载puppeteer，尝试降级到Yunzai的puppeteer尝试', e)
    _puppeteer = puppeteer
  }
  await _puppeteer.browserInit()
}

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
