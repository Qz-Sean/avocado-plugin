import fetch from 'node-fetch'
import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../utils/config.js'
import { makeForwardMsg } from '../utils/common.js'
import { AvocadoRuleALL } from './avocado.js'
import { getBonkersBabble } from './avocadoPsycho.js'

export class avocadoMusic extends plugin {
  constructor () {
    super({
      name: '鳄梨酱！！！ => Dance',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: `^#?${global.God}#(随机|热门)?(.*)`,
          fnc: 'pickMusic'
        },
        {
          reg: `^(来点好听的|${global.God}[!！]|下一首|切歌|换歌|下一曲)$`,
          fnc: 'randomMusic'
        },
        {
          reg: '^#?设置音乐[cC][kK](.*)',
          fnc: 'setMusicCK',
          permission: 'master'
        },
        {
          reg: '^#?设置歌手.+',
          fnc: 'setSinger'
        },
        {
          reg: '^#重新获取音乐数据',
          fnc: 'reloadMusicInfo'
        }
      ]
    })
  }

  async sendBoradCast () {
    // 咕咕咕
  }

  async pickMusic (e) {
    const regex = new RegExp(`^#?${global.God}#(随机|热门)?(.*)`)
    const match = e.msg.trim().match(regex)
    const { isRandom, isHotList } = { isRandom: match[1] === '随机', isHotList: match[1] === '热门' }
    const isSinger = !!(await getSingerId(match[2].replace(/，/g, ',')))
    let param = match[2].replace(/，/g, ',')
    // 指令没有包含点歌类别且没有待处理信息
    if (!match[1] && !match[2]) {
      await this.reply('告诉我你想听什么吧~')
      return true
    }
    // 参数1存在
    if (match[1]) {
      let isListExist
      const res = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_HOTLIST`)
      if (res) {
        hotList = JSON.parse(res)
        // 参数2存在且为歌手
        if (match[2] && isSinger) {
          // 判断是否已存在相同歌手的热门歌曲
          let count = 0
          let total = 0
          hotList.forEach(eachSong => {
            count += eachSong.singer.filter(name => name.includes(param.toLowerCase())).length
            total += eachSong.singer.length
          })
          isListExist = count / total > 0.2
          // logger.warn(isListExist, isSinger, count, total)
          // 与数据库中歌手不同则重新获取
          if (!isListExist && isSinger) {
            hotList = await getHotList(e.sender.user_id, param)
          }
          // 参数2存在且不为歌手 ps: ‘热门’参数只支持歌手为参数2
        } else if (match[2] && !isSinger) {
          const img = await new AvocadoRuleALL().avocadoRender(e, `## 没有找到名为${param}的歌手呢...\n### ${await getBonkersBabble({}, global.God, 'native')}`, `${param}-热门播放50`)
          if (img) await e.reply(img)
          return true
          // 参数2不存在
        } else if (!match[2]) {
          // 随机歌手点歌
          if (isRandom) {
            const song = hotList[Math.floor(Math.random() * hotList.length)]
            const songInfo = await findSong(e, { param: song.songName, isRandom: false, songId: song.songId, from: 'random' })
            await sendMusic(e, songInfo)
          }
          // 热门歌手点歌
          if (isHotList) {
            const text = hotList.map(obj => `${obj.index}: ${obj.songName}\n`).toString().replace(/[,，]/g, '')
            const img = await new AvocadoRuleALL().avocadoRender({}, text, `${param}-热门播放50`)
            if (img) await e.reply(img)
            this.setContext('selectMusic')
            return true
          }
        }
        // 参数1存在但数据库中没有用户数据且参数2为歌手
      } else if (isSinger) {
        hotList = await getHotList(e.sender.user_id, param)
        const text = hotList.map(obj => `${obj.index}: ${obj.songName}\n`).toString().replace(/[,，]/g, '')
        const img = await new AvocadoRuleALL().avocadoRender({}, text, `${param}-热门播放50`)
        if (img) await e.reply(img)
        this.setContext('selectMusic')
        return true
        // 参数1存在但数据库中没有用户数据且参数2不为歌手名称
      } else {
        // 随机歌名点歌
        const songInfo = await findSong(e, { param, isRandom, songId: '', from: 'random' })
        await sendMusic(e, songInfo)
      }
      // 参数1不存在
    } else {
      // 正常点歌
      const songInfo = await findSong(e, { param, isRandom: false, songId: '', from: '' })
      await sendMusic(e, songInfo)
    }
  }

  async selectMusic (e) {
    if (typeof this.e.msg !== 'string') {
      await this.e.reply('...')
      return
    }
    const reg = /(\d{1,2})/
    const match = this.e.msg.match(reg)
    let res
    if (!reg.test(this.e.msg)) {
      await this.e.reply('...')
      return
    } else {
      if (parseInt(match[1]) === 0) {
        this.finish('selectMusic')
        return true
      }
      const selectedMusic = hotList.find(eachSong => eachSong.index === parseInt(match[1]))
      const songName = selectedMusic?.songName
      const songId = selectedMusic?.songId
      logger.warn('点歌: ', !!hotList, selectedMusic, songName, songId)
      if (!(songName && songId)) return false
      const songInfo = await findSong(this.e, {
        param: songName,
        isRandom: false,
        songId,
        from: 'hot'
      })
      res = sendMusic(this.e, songInfo)
    }
    if (!res) {
      return false
    }
  }

  async reloadMusicInfo (e) {
    const userData = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`)
    const singerId = JSON.parse(userData).singerId
    if (!userData) {
      await this.reply('你还没有设置歌手')
      return false
    } else {
      await this.reply('正在更新歌曲数据...')
      const res = await getFavList(e.sender.user_id, singerId)
      if (res) {
        await this.reply('成功了！')
      }
    }
  }

  async randomMusic (e) {
    const userData = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSONGLIST`)
    const songList = JSON.parse(userData)
    if (!songList) {
      await this.reply('我还不知道你喜欢听谁的歌呢ο(=•ω＜=)ρ⌒☆')
      return false
    }
    const selectedMusic = songList[Math.floor(songList.length * Math.random())]
    const musicDetail = await getMusicDetail(selectedMusic)
    await sendMusic(this.e, musicDetail)
    return true
  }

  async setMusicCK (e) {
    let ck = e.msg.trim().match(/^#?设置音乐[cC][kK](.*)/)[1]
    if (ck) {
      Config.wyy = ck
      await this.reply('设置成功')
    } else {
      await this.reply('设置失败')
    }
  }

  async setSinger (e) {
    let singer = e.msg.trim().replace(/^#?设置歌手/, '')
    const userSinger = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`)
    let singerId
    if (userSinger) {
      const data = JSON.parse(userSinger)
      const uSinger = data.singer
      if (singer === uSinger) {
        await this.reply('设置成功')
        return false
      }
    }
    let url = `http://110.41.21.181:3000/cloudsearch?keywords=${encodeURI(singer)}&limit=1`
    let response = await fetch(url)
    let res = await response.json()
    if (res.code !== 200) { return false }
    const songs = res.result.songs
    // songs.forEach(item => {
    //   let lowerCaseSinger = singer.toLowerCase()
    //   singerId = item.ar.find(item => item.name.toLowerCase() === lowerCaseSinger || (item?.tns.length ? item?.tns[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alias.length ? item?.alias[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alia ? (item?.alia.length ? item?.alia[0]?.toLowerCase() === lowerCaseSinger : false) : false))?.id
    // })
    songs.forEach(item => {
      const lowerCaseSinger = singer.toLowerCase()
      singerId = item.ar.find(arItem => [arItem.name, arItem?.tns?.[0], arItem?.alias?.[0], arItem?.alia?.[0]].some(name => name?.toLowerCase() === lowerCaseSinger))?.id
    })
    if (!singerId) {
      await this.reply(`找不到名为${singer}的歌手，请检查名称是否输入完整。`)
      return false
    }
    const data = {
      singer,
      singerId
    }
    await redis.set(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`, JSON.stringify(data))
    await this.reply('设置成功')
    await this.reply('正在获取歌曲数据...')
    res = await getFavList(e.sender.user_id, singerId)
    if (res) {
      await this.reply('成功了！')
    }
  }
}

/**
 * 获取播放链接
 * @param songId
 * @returns {Promise<string|boolean>}
 */
async function getMusicUrl (songId) {
  let musicUrl = 'http://music.163.com/song/media/outer/url?id=' + songId
  if (!Config.wyy) {
    return false
  }
  let ck = Config.wyy
  try {
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; MI Build/SKQ1.211230.001)',
        Cookie: 'versioncode=8008070; os=android; channel=xiaomi; ;appver=8.8.70; ' + 'MUSIC_U=' + ck
      },
      body: `ids=${JSON.stringify([songId])}&level=standard&encodeType=mp3`
    }
    // 播放链接
    let response = await fetch('https://music.163.com/api/song/enhance/player/url/v1', options)
    let res = await response.json()
    logger.warn('MusicUrl: ', res)
    if (res.code === 200) {
      musicUrl = res.data[0]?.url
      musicUrl = musicUrl || ''
    }
  } catch (err) {
    logger.error(err)
    return false
  }
  return musicUrl
}

/**
 * 获取歌曲信息
 * @param {object} e
 * @param {object} data
 * - param：必填，可以是歌曲名或歌曲名+歌手的组合
 * - songId：选填，使用该参数时需指定来源'from'
 * - isRandom：选填，是否随机点歌
 * - from： 选填，如果需要使用songId参数，则必须指定该参数。
 * @returns {Promise<{}|boolean>}
 */
async function findSong (e, data = { param: '', songId: '', isRandom: false, from: '' }) {
  const url = `http://110.41.21.181:3000/cloudsearch?keywords=${data.param}&limit=60`
  try {
    let response = await fetch(url)
    const result = await response.json()
    if (result.code !== 200 || result.songCount === 0) {
      if (result.code === 400) {
        logger.error('limit参数设置过大')
      } else {
        logger.error('没有获取到有效歌单')
      }
      return false
    }
    let searchRes
    if (data.songId && (data.from === 'random' || data.from === 'hot')) {
      logger.warn('热门|随机点歌')
      searchRes = result?.result?.songs
      // 处理搜id有概率搜不到的问题
      searchRes = searchRes.find(song => song.id === data.songId)
    } else if (data.isRandom) {
      logger.warn('随机歌名点歌')
      // 随机但没有传入songId ==> 即参数不是歌手
      searchRes = result?.result?.songs?.[Math.floor(Math.random() * result?.result?.songs.length)]
    } else {
      logger.warn('普通点歌')
      searchRes = result?.result?.songs?.[0]
    }
    return await getMusicDetail(searchRes)
  } catch (err) {
    logger.error(err)
    return false
  }
}

/**
 * 获取单曲所有信息
 * @param musicElem
 * - 可以是未处理的musicElem，也可以是经过getFavList处理后的elem（已提前获取并处理artist/albumId）
 * - 后期考虑将favList通过图片发送给用户
 * @returns {Promise<{}>}
 */
async function getMusicDetail (musicElem) {
  let response, resJson
  const songInfo = {}
  songInfo.id = musicElem.id
  songInfo.name = musicElem.name
  songInfo.artist = musicElem?.artist || musicElem.ar.map(item => item.name).join(',')
  songInfo.albumId = musicElem?.albumId || musicElem.al.id
  response = await fetch(`http://110.41.21.181:3000/song/detail?ids=${musicElem.id}`)
  resJson = await response.json()
  songInfo.pic = resJson.songs[0].al.picUrl
  songInfo.fee = musicElem.fee
  songInfo.mv = musicElem.mv
  songInfo.link = 'https://music.163.com/#/song?id=' + musicElem.id
  response = await fetch(`http://110.41.21.181:3000/comment/hot?id=${musicElem.id}&type=0`)
  resJson = await response.json()
  songInfo.comments = resJson.hotComments.slice(0, 15).map(item => {
    return [item.likedCount, item.content]
  })
  response = await fetch(`http://110.41.21.181:3000/lyric?id=${musicElem.id}`)
  resJson = await response.json()
  songInfo.lyrics = [resJson.lrc.lyric]
  songInfo.musicUrl = await getMusicUrl(musicElem.id)
  return songInfo
}
let hotList = []

/**
 * 获取热门五十首
 * @param userId - 用户qq号
 * @param singer - 歌手名称
 * @returns {Promise<boolean>}
 */
async function getHotList (userId, singer) {
  const singerId = await getSingerId(singer)
  if (!singerId) {
    return false
  }
  const url = `http://110.41.21.181:3000/artist/top/song?id=${singerId}`
  const response = await fetch(url)
  const res = await response.json()
  if (res.code !== 200) {
    return false
  }
  const songList = res.songs
  hotList = songList.map((item, index) => ({ index: index + 1, songId: item.id, songName: item.name, singer: item?.ar.map(singer => singer.name) }))
  if (hotList) {
    let res = await redis.set(`AVOCADO:MUSIC_${userId}_HOTLIST`, JSON.stringify(hotList))
  }
  return hotList
}
async function getSingerId (singer) {
  let url = `http://110.41.21.181:3000/cloudsearch?keywords=${encodeURI(singer)}&limit=1`
  let singerId
  let response = await fetch(url)
  let res = await response.json()
  if (res.code !== 200) { return false }
  // 不存在时为空数组
  const songs = res.result?.songs
  // songs.forEach(item => {
  //   let lowerCaseSinger = singer.toLowerCase()
  //   singerId = item.ar.find(item => item.name.toLowerCase() === lowerCaseSinger || (item?.tns.length ? item?.tns[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alias.length ? item?.alias[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alia ? (item?.alia.length ? item?.alia[0]?.toLowerCase() === lowerCaseSinger : false) : false))?.id
  // })
  if (!songs?.length) { return false }
  songs.forEach(item => {
    const lowerCaseSinger = singer.toLowerCase()
    singerId = item.ar.find(arItem => [arItem.name, arItem?.tns?.[0], arItem?.alias?.[0], arItem?.alia?.[0]].some(name => name?.toLowerCase() === lowerCaseSinger))?.id
  })
  return singerId || false
}
async function getFavList (userID, SingerID) {
  let url = `http://110.41.21.181:3000/artist/songs?id=${SingerID}&limit=100`
  try {
    let response = await fetch(url)
    const result = await response.json()
    if (result.code !== 200) {
      return false
    }
    let searchRes = result.songs
    const favList = searchRes.map((item, index) => ({
      index: index + 1,
      id: item.id,
      name: item.name,
      artist: item?.ar.map(singer => singer.name),
      albumId: item.al.id,
      fee: item.fee,
      mv: item.mv
    }))
    await redis.set(`AVOCADO:MUSIC_${userID}_FAVSONGLIST`, JSON.stringify(favList))
  } catch (e) {
    logger.error(e)
    return false
  }
  return true
}
async function sendMusic (e, data, toUin = null) {
  if (!Bot.sendOidb) return false

  let appid
  let appname
  let appsign
  let style = 4
  appid = 100495085
  appname = 'com.netease.cloudmusic'
  appsign = 'da6b069da1e2982db3e386233f68d76d'

  let title = data.name
  let singer = data.artist
  let prompt = '[分享]'
  let jumpUrl
  let preview
  let musicUrl

  let types = []
  if (data.musicUrl == null) {
    types.push('musicUrl')
  }
  if (data.pic == null) {
    types.push('pic')
  }
  if (data.link == null) {
    types.push('link')
  }
  if (types.length > 0 && typeof (data.api) == 'function') {
    let { musicUrl, pic, link } = await data.api(data.data, types)
    if (musicUrl) {
      data.musicUrl = musicUrl
    }
    if (pic) {
      data.pic = pic
    }
    if (link) {
      data.link = link
    }
  }

  if (typeof (data.musicUrl) == 'function') {
    musicUrl = await data.url(data.data)
  } else {
    musicUrl = data.musicUrl
  }
  if (typeof (data.pic) == 'function') {
    preview = await data.pic(data.data)
  } else {
    preview = data.pic
  }
  if (typeof (data.link) == 'function') {
    jumpUrl = await data.link(data.data)
  } else {
    jumpUrl = data.link
  }

  if (typeof (musicUrl) != 'string' || musicUrl === '') {
    style = 0
    musicUrl = ''
  }

  prompt = prompt + title + '-' + singer

  let recvUin
  let sendType
  let recvGuildId = 0

  if (e.isGroup && toUin == null) { // 群聊
    recvUin = e.group.gid
    sendType = 1
  } else if (e.guild_id) { // 频道
    recvUin = Number(e.channel_id)
    recvGuildId = BigInt(e.guild_id)
    sendType = 3
  } else if (toUin == null) { // 私聊
    recvUin = e.friend.uid
    sendType = 0
  } else { // 指定号码私聊
    recvUin = toUin
    sendType = 0
  }

  let body = {
    1: appid,
    2: 1,
    3: style,
    5: {
      1: 1,
      2: '0.0.0',
      3: appname,
      4: appsign
    },
    10: sendType,
    11: recvUin,
    12: {
      10: title,
      11: singer,
      12: prompt,
      13: jumpUrl,
      14: preview,
      16: musicUrl
    },
    19: recvGuildId
  }
  let payload = await Bot.sendOidb('OidbSvc.0xb77_9', core.pb.encode(body))
  let result = core.pb.decode(payload)
  let comments = data.comments.map(item => [`点赞数：${item[0]}\n评论内容：${item[1]}`]).join('\n\n')
  let forwardMsg
  if (comments.length) {
    if (data.lyrics) {
      forwardMsg = [
        await new AvocadoRuleALL().avocadoRender(e, comments, `${data.name} - 精选评论`),
        await new AvocadoRuleALL().avocadoRender(e, data.lyrics.join(''), `${data.name}`)
      ]
    } else {
      forwardMsg = [await new AvocadoRuleALL().avocadoRender(e, comments, `${data.name} - 精选评论`)]
    }
  } else if (data.lyrics) {
    forwardMsg = [
      await new AvocadoRuleALL().avocadoRender(e, data.lyrics.join(''), `${data.name}`)
    ]
  }
  if (forwardMsg) {
    const formattedMsg = await makeForwardMsg(e, forwardMsg, '鳄门🙏...')
    await e.reply(formattedMsg)
  }
  if (result[3] !== 0) { e.reply('歌曲分享失败：' + result[3], true) }
}
