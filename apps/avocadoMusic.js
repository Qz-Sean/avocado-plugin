import fetch from 'node-fetch'
import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../utils/config.js'
import { avocadoRender, generateRandomHeader, makeForwardMsg, splitArray } from '../utils/common.js'
import { getBonkersBabble } from './avocadoPsycho.js'
import { singerMap, singerTypeMap } from '../utils/const.js'
let stateArr = {}

export class avocadoMusic extends plugin {
  constructor () {
    super({
      name: '鳄梨酱！！！ => Dance',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: `^#?${global.God}#(随机|热门)?(华语|欧美|韩国|日本)?(.*)`,
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
          reg: '^#?重新获取音乐数据',
          fnc: 'reloadMusicInfo'
        },
        {
          reg: '^#?了解(.+)',
          fnc: 'getSinger'
        },
        {
          reg: '^#?(华语|欧美|韩国|日本)歌手榜',
          fnc: 'getSingerRankingList'
        }
      ]
    })
  }

  async sendBoradCast () {
    // 咕咕咕
  }

  async pickMusic (e) {
    if (!Config.wyy) {
      await this.reply('你还没有设置音乐ck呢~')
      return false
    }
    const regex = new RegExp(`^#?${global.God}#(随机|热门)?(华语|欧美|韩国|日本)?(.*)`)
    const match = e.msg.trim().match(regex)
    const selectType = match[1] ? match[1] : ''
    const query = match[3] ? match[3].replace(/，/g, ',') : ''
    const { isRandom, isHotList } = { isRandom: selectType === '随机', isHotList: selectType === '热门' }
    const isSinger = query ? !!(await getSingerId(query)) : false

    let singerType = singerTypeMap[match[2]] || Math.ceil(Math.random() * 4)
    let hotList
    if (isSinger) hotList = await getHotList(e.sender.user_id, query)

    if (selectType) {
      if (query) {
        if (isRandom) {
          if (isSinger) {
            const song = hotList[Math.floor(Math.random() * hotList.length)]
            const songInfo = await findSong(e, { param: song.songName, isRandom: false, songId: song.songId, from: 'random' })
            if (!songInfo) {
              const img = await avocadoRender(`### 没有找到名为 ${query} 的歌曲呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
              if (img) await this.reply(img)
              return
            }
            await sendMusic(e, songInfo)
            return true
          } else {
            if (/歌手|音乐人/.test(query)) {
              const singerRankingList = await getSingerRankingList(e.sender.user_id, singerType)
              const picked = singerRankingList[Math.floor(Math.random() * singerRankingList.length)]
              const singerInfo = await getSingerDetail(picked.id)
              const replyMsg = []
              for (const key in singerInfo) {
                replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
              }
              const img = await avocadoRender(replyMsg.join(''), { title: '', caption: '', footer: `你想不想继续了解${singerInfo.name}的热门单曲呢~` })
              if (img) await this.reply(img)
              await getHotList(e.sender.user_id, singerInfo.name)
              await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_FROM`, 'randomSinger', { EX: 60 * 10 })
              this.setContext('isContinue')
              return true
            }
            // 随机歌名点歌
            const songInfo = await findSong(e, { param: query, isRandom, songId: '', from: 'random' })
            if (!songInfo) {
              const img = await avocadoRender(`### 没有找到名为${query}的歌曲呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
              if (img) await this.reply(img)
              return
            }
            await sendMusic(e, songInfo)
            return true
          }
        }
        if (isHotList) {
          if (isSinger) {
            const text = splitArray(hotList.map(obj => `${obj.index}: ${obj.songName}\n`), 2)
            const img = await avocadoRender(text, { title: `${query}-热门播放50`, caption: '', footer: '可通过发送对应序号获取音乐~' })
            if (img) await e.reply(img)
            this.setContext('selectMusic')
            return true
          } else {
            if (/歌手|音乐人/.test(query)) {
              const hotSingers = splitArray((await getHotSingers()).map(obj => `${obj.index}: ${obj.name}`), 3)
              const img = await avocadoRender(hotSingers, { title: '近日热门歌手', caption: '', footer: '有没有你感兴趣的歌手呢~你想了解谁呢~' })
              await this.reply(img)
              this.setContext('pickHotSinger')
              return true
            }
            const img = await avocadoRender(`### 没有找到名为 ${query} 的歌手呢...\n### 当前指令只支持 \`热门[歌手(名称)|音乐人]\` 哦！试试其他选择吧~\n- 鳄梨酱#热门李健\n- 鳄梨酱#热门歌手\n- 鳄梨酱#热门音乐人\n\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
            if (img) await this.reply(img)
            return true
          }
        }
      } else if (!query) {
        if (isRandom) {
          await this.reply(`什么？可通过发送 '${global.God}#随机+歌手名' 随机播放歌手的热门单曲哦！`)
          return false
        }
        if (isHotList) {
          await this.reply(`你是不是想了解最近的热门歌手呢？可通过发送 '${global.God}#热门+歌手' 获取今日热门歌手哦！`)
          return false
        }
      }
    } else if (!query) {
      await this.reply('告诉我你想听什么吧~')
      return true
    } else {
      // 正常点歌
      const songInfo = await findSong(e, { param: query, isRandom: false, songId: '', from: '' })
      if (!songInfo) {
        const img = await avocadoRender(`### 没有找到名为 ${query} 的歌曲呢...\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
        if (img) await this.reply(img)
        return true
      }
      await sendMusic(e, songInfo)
      return true
    }
  }

  async pickHotSinger (e) {
    if (typeof this.e.msg !== 'string') { return }
    const hotSingers = await getHotSingers()
    const reg = new RegExp(`^((0)|(${hotSingers.map(item => item.index).join('|')})|(${hotSingers.map(item => item.name).join('|').replace(/\*/g, '')}))$`)
    let img
    if (!reg.test(this.e.msg)) {
      img = await avocadoRender(`### 没有找到名为 ${this.e.msg} 的歌手呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
      if (img) await this.reply(img)
    } else {
      if (parseInt(this.e.msg) === 0) {
        this.finish('pickHotSinger')
        return true
      }
      const pickedSinger = (await getHotSingers()).find(item => item.index === parseInt(this.e.msg) || item.name === this.e.msg)
      const singerId = pickedSinger.id
      const singerName = pickedSinger.name
      const singerInfo = await getSingerDetail(singerId)
      let replyMsg = []
      for (const key in singerInfo) {
        replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
      }
      img = await avocadoRender(replyMsg.join(''), { title: '', caption: '', footer: `你想不想继续了解${singerName}的热门单曲呢~` })
      if (img) await this.e.reply(img)
      await getHotList(this.e.sender.user_id, singerName)
      this.setContext('isContinue')
      this.finish('randomHotSinger')
      this.finish('pickHotSinger')
      return true
    }
  }

  async getSinger (e) {
    const singer = e.msg.trim().replace(/#?了解/, '')
    logger.warn(singer)
    const singerId = await getSingerId(singer)
    if (!singerId) {
      const img = await avocadoRender(`### 没有找到名为 ${singer} 的歌手呢...\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
      if (img) await this.reply(img)
      return true
    }

    const singerInfo = await getSingerDetail(singerId)
    let replyMsg = []
    for (const key in singerInfo) {
      replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
    }
    const img = await avocadoRender(replyMsg.join(''), { title: '', caption: '', footer: `你想不想继续了解${singer}的热门单曲呢~` })
    await getHotList(this.e.sender.user_id, singer)
    if (img) {
      await this.reply(img)
    }
    this.setContext('isContinue')
    return true
  }

  async isContinue (e) {
    if (typeof this.e.msg !== 'string') { return }
    const reg = /算了|0|想|1|换/
    if (!reg.test(this.e.msg)) {
      const count = await redis.get(`AVOCADO_${this.e.sender.user_id}_CMDCOUNT`)
      if (!count) {
        const img = await avocadoRender(`### 🤔💭 想要呢？还是算了呢？\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
        if (img) await this.reply(img)
        await redis.set(`AVOCADO_${this.e.sender.user_id}_CMDCOUNT`, 1, { EX: 60 * 2 })
      }
    } else {
      if (/算了|0/.test(this.e.msg)) {
        await this.e.reply(`${global.God}！！！`)
        logger.info('finish isContinue')
        this.finish('isContinue')
        return true
      }
      if (/换/.test(this.e.msg)) {
        const from = await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_FROM`)
        if (from === 'randomSinger') {
          const singerRankingList = await getSingerRankingList(e.sender.user_id, Math.ceil(Math.random() * 4))
          const picked = singerRankingList[Math.floor(Math.random() * singerRankingList.length)]
          const singerInfo = await getSingerDetail(picked.id)
          const replyMsg = []
          for (const key in singerInfo) {
            replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
          }
          const img = await avocadoRender(replyMsg.join(''), { title: '', caption: '', footer: `你愿意继续了解${singerInfo.name}最受欢迎的单曲吗~☺️` })
          if (img) await this.reply(img)
          await getHotList(e.sender.user_id, singerInfo.name)
          this.finish('isContinue')
          this.setContext('isContinue')
          return true
        }
      }
      const hotList = JSON.parse(await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_HOTLIST`))
      const singer = hotList.find(obj => obj.singer.length === 1).singer[0]
      const text = splitArray(hotList.map(obj => `${obj.index}: ${obj.songName}`), 2)
      const img = await avocadoRender(text, { title: `${singer}-热门播放50`, caption: '', footer: '' })
      if (img) await e.reply(img)
      this.finish('isContinue')
      this.setContext('selectMusic')
      return true
    }
  }

  async selectMusic (e) {
    if (typeof this.e.msg !== 'string') { return }
    const hotList = JSON.parse(await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_HOTLIST`))
    const reg = new RegExp(`^((0)|(${hotList.map(item => item.index).join('|')})|(${hotList.map(item => item.songName).join('|').replace(/\*/g, '')}))$`)
    let res, img
    if (!reg.test(this.e.msg)) {
      // img = await avocadoRender(`### 没有找到 ${this.e.msg} 呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
      // if (img) await this.reply(img)
    } else {
      if (parseInt(this.e.msg) === 0) {
        logger.info('finish selectMusic')
        this.finish('selectMusic')
        return true
      }
      const selectedMusic = hotList.find(eachSong => eachSong.index === parseInt(this.e.msg) || eachSong.songName === this.e.msg)
      const songName = selectedMusic?.songName
      const songId = selectedMusic?.songId
      logger.warn('点歌: ', !!hotList, selectedMusic, songName, songId)
      if (!(songName && songId)) return false
      const songInfo = await findSong(e, {
        param: songName,
        isRandom: false,
        songId,
        from: 'hot'
      })
      if (songInfo) {
        res = sendMusic(this.e, songInfo)
      } else {
        logger.info('finish selectMusic')
        this.finish('selectMusic')
      }
    }
    if (!res) {
      logger.info('finish selectMusic')
      this.finish('selectMusic')
    }
  }

  async reloadMusicInfo (e) {
    if (!Config.wyy) {
      await this.reply('你还没有设置音乐ck呢~')
      return false
    }
    const userData = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`)
    if (!userData) {
      await this.reply('你还没有设置歌手')
      return false
    } else {
      const singerId = JSON.parse(userData).singerId
      await this.reply('正在更新歌曲数据...')
      const res = await getFavList(e.sender.user_id, singerId)
      if (res) {
        await this.reply('成功了！')
      }
    }
  }

  async randomMusic (e) {
    if (!Config.wyy) {
      await this.reply('你还没有设置音乐ck呢~')
      return false
    }
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

    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
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

  async getSingerRankingList (e) {
    const singerType = e.msg.match(/^#?(华语|欧美|韩国|日本)歌手榜/)[1]
    const singerRankingList = await getSingerRankingList(e.sender.user_id, singerTypeMap[singerType])
    const text = splitArray(singerRankingList.map(item => `${item.index}: ${item.name}${item.transName ? '(' + item.transName + ')' : ''}`), 2)
    const img = await avocadoRender(text, { title: `${singerType}歌手榜`, caption: '', footer: '有没有你感兴趣的歌手呢~告诉我你想听谁的歌吧~' })
    await this.reply(img)
    this.setContext('pickRankingSinger')
    return true
  }

  async pickRankingSinger (e) {
    if (typeof this.e.msg !== 'string') { return }
    const singerType = await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_SINGERTYPE`)
    const list = await getSingerRankingList('', singerType)
    const reg = new RegExp(`^(0|(${list.map(item => item.index).join('|')})|(${list.map(item => item.name).join('|').replace(/\*/g, '')})|(${list.map(item => item.transName).join('|').replace(/\*/g, '')}))$`)
    if (!reg.test(this.e.msg)) {
      const img = await avocadoRender(`### 没有找到 ${this.e.msg} 呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
      if (img) await this.reply(img)
    } else {
      if (parseInt(this.e.msg) === 0) {
        this.finish('pickRankingSinger')
        return true
      }
      const pickedSinger = list.find(item => item.index === parseInt(this.e.msg) || item.name === this.e.msg || item.transName === this.e.msg)
      const singerId = pickedSinger.id
      const singerName = pickedSinger.name
      const singerInfo = await getSingerDetail(singerId)
      let replyMsg = []
      for (const key in singerInfo) {
        replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
      }
      const img = await avocadoRender(replyMsg.join(''), { title: '', caption: '', footer: `你想不想继续了解${singerName}的热门单曲呢~` })
      await getHotList(this.e.sender.user_id, singerName)
      if (img) {
        await this.reply(img)
      }
      this.setContext('isContinue')
      this.finish('pickRankingSinger')
      return true
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
async function getSingerDetail (singerId) {
  let url = `http://110.41.21.181:3000/artist/detail?id=${singerId}`
  const headers = generateRandomHeader()
  const options = {
    method: 'GET',
    headers
  }
  const response = await fetch(url, options)
  let res = await response.json()
  if (res.code !== 200 && !res?.data?.artist) return false
  const artist = res.data.artist
  return {
    name: artist.name,
    transName: artist.transName || [],
    alias: artist.alias || [],
    secondaryExpertIdentiy: res.data.secondaryExpertIdentiy.length ? res.data.secondaryExpertIdentiy.map(item => item.expertIdentiyName).join('，') : '',
    briefDesc: artist.briefDesc,
    albumSize: artist.albumSize,
    musicSize: artist.musicSize,
    mvSize: artist.mvSize
  }
}

/**
 * 获取播放链接
 * @param songId
 * @returns {Promise<string|boolean>}
 */
async function getMusicUrl (songId) {
  let musicUrl = 'http://music.163.com/song/media/outer/url?id=' + songId

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
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
    const result = await response.json()
    if (result.code !== 200) {
      if (result.code === 400) logger.error('limit参数设置过大')
      return false
    }
    if (result.result.songCount === 0) {
      logger.error('没有获取到有效歌单')
      return false
    }
    let searchRes
    if (data.songId) {
      if (data.from === 'random') {
        logger.warn('随机点歌')
        searchRes = result?.result?.songs
        // 处理搜id有概率搜不到的问题
        searchRes = searchRes.find(song => song.id === data.songId)
      }
      if (data.from === 'hot') {
        logger.warn('热门点歌')
        searchRes = result?.result?.songs
        // 处理搜id有概率搜不到的问题
        searchRes = searchRes.find(song => song.id === data.songId)
      }
    } else if (!data.songId && data.isRandom) {
      logger.warn('随机歌名点歌')
      // 随机但没有传入songId ==> 即参数不是歌手
      searchRes = result?.result?.songs?.[Math.floor(Math.random() * result?.result?.songs.length)]
    } else {
      logger.warn('普通点歌')
      searchRes = result?.result?.songs?.[0]
    }
    if (!searchRes) {
      const img = await avocadoRender(`### 没有找到名为 ${data.param} 的歌曲呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`, { title: '', caption: '', footer: '' })
      if (img) await e.reply(img)
      return false
    } else {
      return await getMusicDetail(searchRes)
    }
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
  try {
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
  } catch (err) {
    logger.error(err)
  }
  return songInfo
}
/**
 * 获取热门五十首
 * @param userId
 * @param singer - 歌手名称
 * @returns {Promise<boolean>}
 */
async function getHotList (userId, singer) {
  const singerId = await getSingerId(singer)
  if (!singerId) {
    return false
  }
  const url = `http://110.41.21.181:3000/artist/top/song?id=${singerId}`
  const headers = generateRandomHeader()
  const options = {
    method: 'GET',
    headers
  }
  const response = await fetch(url, options)
  const res = await response.json()
  if (res.code !== 200) {
    return false
  }
  const songList = res.songs
  const hotList = songList.map((item, index) => ({ index: index + 1, songId: item.id, songName: item.name, singer: item?.ar.map(singer => singer.name) }))
  await redis.set(`AVOCADO:MUSIC_${userId}_HOTLIST`, JSON.stringify(hotList))
  return hotList
}
async function getSingerId (singer) {
  let url = `http://110.41.21.181:3000/cloudsearch?keywords=${encodeURI(singer)}&limit=1`
  let singerId
  const headers = generateRandomHeader()
  const options = {
    method: 'GET',
    headers
  }
  const response = await fetch(url, options)
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
async function getSingerRankingList (userId = '', singerType) {
  let url = `http://110.41.21.181:3000/toplist/artist?type=${singerType}`
  try {
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
    const result = await response.json()
    if (result.code !== 200) {
      return false
    }
    let list = result.list.artists
    list = list.map((artist, index) => ({
      index: index + 1,
      id: artist.id,
      name: artist.name,
      transName: artist.trans
    }))
    //  保存用户的选择
    if (userId) {
      await redis.set(`AVOCADO:MUSIC_${userId}_SINGERTYPE`, singerType, { EX: 60 * 10 })
    }
    return list
  } catch (err) {
    logger.error(err)
    return false
  }
}
async function getHotSingers () {
  let url = 'http://110.41.21.181:3000/top/artists?offset=0&limit=50'
  try {
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
    const result = await response.json()
    if (result.code !== 200) {
      return false
    }
    let searchRes = result?.artists
    if (searchRes.length) {
      return searchRes.map((artist, index) => ({ index: index + 1, id: artist.id, name: artist.name }))
    }
  } catch (e) {
    logger.error(e)
    return false
  }
}
async function getFavList (userID, SingerID) {
  let url = `http://110.41.21.181:3000/artist/songs?id=${SingerID}&limit=100`
  try {
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
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
    // ['']
    if (data.lyrics.join('').length) {
      forwardMsg = [
        await avocadoRender(comments, { title: `${data.name} - 精选评论`, caption: '', footer: '' }),
        await avocadoRender(data.lyrics.join(''), { title: `${data.name}`, caption: '', footer: '' })
      ]
    } else {
      await avocadoRender(comments, { title: `${data.name} - 精选评论`, caption: '', footer: '' })
    }
  } else if (data.lyrics.join('').length) {
    forwardMsg = [
      await avocadoRender(data.lyrics.join(''), { title: `${data.name}`, caption: '', footer: '' })
    ]
  }
  if (forwardMsg) {
    const formattedMsg = await makeForwardMsg(e, forwardMsg, '鳄门🙏...')
    await e.reply(formattedMsg)
  }
  if (result[3] !== 0) {
    e.reply('歌曲分享失败：' + result[3], true)
  }
}
