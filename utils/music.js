import { avocadoRender, generateRandomHeader, makeForwardMsg } from './common.js'
import fetch from 'node-fetch'
import { Config } from './config.js'
import { ChatGPTAPI } from 'chatgpt'

async function getRankingLists () {
  let list = await redis.get('AVOCADO_MUSICRANKINGLIST')
  if (list) {
    list = JSON.parse(list)
    return list
  } else {
    const url = 'http://110.41.21.181:3000/toplist/detail'
    // logger.warn(url)
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    try {
      const response = await fetch(url, options)
      let res = await response.json()
      if (res.code !== 200) {
        return false
      }
      let list = res.list
      if (!list || !list.length) return false
      // logger.warn('songs: ', songs)
      list = list.map((eachList, index) => ({
        index: index + 1,
        name: eachList.name,
        id: eachList.id,
        description: eachList?.description !== null ? eachList?.description : ''
      }))
      await redis.set('AVOCADO_MUSICRANKINGLIST', JSON.stringify(list), { EX: 60 * 60 * 24 })
    } catch (err) {
      logger.error(err)
      return false
    }
    return list
  }
}

async function getPlaylistById (listId, listType = 'normal') {
  const url = 'http://110.41.21.181:3000/playlist/detail?id=' + listId
  // logger.warn(url)
  const headers = generateRandomHeader()
  const options = {
    method: 'GET',
    headers
  }
  try {
    const response = await fetch(url, options)
    let res = await response.json()
    if (res.code !== 200) {
      return false
    }
    const songs = res?.playlist?.tracks
    if (!songs || !songs.length) return false
    // logger.warn('songs: ', songs)
    return songs.map((eachSong, index) => ({
      index: index + 1,
      name: eachSong.name,
      id: eachSong.id,
      singer: eachSong?.ar.map(item => item.name),
      albumId: eachSong?.al.id,
      albumName: eachSong?.al.name
    }))
  } catch (err) {
    logger.error(err)
    return false
  }
}

/**
 * @param albumId
 */
async function getAlbumDetail (albumId) {
  const url = 'http://110.41.21.181:3000/album?id=' + albumId
  const headers = generateRandomHeader()
  const options = {
    method: 'GET',
    headers
  }
  try {
    const response = await fetch(url, options)
    let res = await response.json()
    if (res.code !== 200) {
      return false
    }
    const songs = res?.songs.map((eachSong, index) => ({
      index: index + 1,
      name: eachSong.name,
      id: eachSong.id
    }))
    const artist = res.album.artists.map(item => item.name)
    const albumDesc = res.album.description
    return [artist, albumDesc, songs]
  } catch (err) {
    logger.error(err)
  }
}

/**
 *
 * @param listId - 歌单id
 * @param greetType - 问候类型
 * @returns {Promise<(string|*)[]|boolean>}
 */
export async function getGreetMsg (listId, greetType) {
  let proxy
  if (Config.proxy) {
    try {
      proxy = (await import('https-proxy-agent')).default
    } catch (e) {
      console.warn('未安装https-proxy-agent，请在插件目录下执行pnpm add https-proxy-agent')
    }
  }
  const greetList = await getPlaylistById(listId)
  // logger.warn('goodnightList:', goodnightList)
  const introSong = greetList ? greetList[Math.floor(Math.random() * greetList.length)] : ''
  logger.warn('introSong:', introSong)
  if (!introSong) return false
  const hour = ('0' + new Date().getHours()).slice(-2)
  const minute = ('0' + new Date().getMinutes()).slice(-2)
  let question
  switch (greetType) {
    case 1:
      question = `我们现在在一个群聊中，现在是早上${hour}:${minute}点，将这首来自${introSong.singer.join('')}的${introSong.name}推荐给群友。这首歌的歌曲专辑信息是${await getAlbumDetail(introSong.albumId)}，可以简单为群友介绍一下哦。就让我们来开启大家美好的一天吧！不用说大家好，大家已经很熟悉了。`
      break
    case 2:
      question = `我们现在在一个群聊中，现在是中午${hour}:${minute}点，将这首来自${introSong.singer.join('')}的${introSong.name}推荐给群友。这首歌的歌曲专辑信息是${await getAlbumDetail(introSong.albumId)}，可以简单为群友介绍一下哦。大家下午也要干净满满！可以给大家一点类似'中午小睡一会儿'这样的小建议。不用说大家好，大家已经很熟悉了。`
      break
    case 3:
      question = `我们现在在一个群聊中，已经晚上${hour}:${minute}点了，写一段话告诉群友早点休息，并将这首来自${introSong.singer.join('')}的${introSong.name}推荐给群友。这首歌的歌曲专辑信息是${await getAlbumDetail(introSong.albumId)}，可以简单为群友介绍一下哦。不用说大家好，大家已经很熟悉了。`
      break
  }
  const newFetch = (url, options = {}) => {
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
  let api = new ChatGPTAPI({
    apiBaseUrl: Config.apiBaseUrl,
    apiKey: Config.apiKey,
    fetch: newFetch
  })
  const res = await api.sendMessage(question)
  return [res.text, introSong.id, introSong.name]
}

export async function getSingerDetail (singerId) {
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
 * @param {object} data
 * - param：必填，不支持id搜歌，可以是歌曲名或歌曲名+歌手的组合
 * - songId：选填，使用该参数时需指定来源'from'
 * - isRandom：选填，是否随机点歌
 * - from： 选填，如果需要使用songId参数，则必须指定该参数，以便更好处理搜索结果。ps：现在来看，意义不大 emmm
 * @returns {Promise<{}|boolean>}
 */
export async function findSong (data = { param: '', songId: '', isRandom: false, from: '' }) {
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
      if (data.from === 'goodnight' || data.from === 'goodAfternoon' || data.from === 'goodMorning') {
        logger.warn('问好点歌')
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
export async function getMusicDetail (musicElem) {
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
export async function getSingerHotList (userId, singer) {
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
  const hotList = songList.map((item, index) => ({
    index: index + 1,
    songId: item.id,
    songName: item.name,
    singer: item?.ar.map(singer => singer.name)
  }))
  await redis.set(`AVOCADO:MUSIC_${userId}_HOTLIST`, JSON.stringify(hotList))
  return hotList
}

export async function getSingerId (singer) {
  let url = `http://110.41.21.181:3000/cloudsearch?keywords=${encodeURI(singer)}&limit=1`
  let singerId
  const headers = generateRandomHeader()
  const options = {
    method: 'GET',
    headers
  }
  const response = await fetch(url, options)
  let res = await response.json()
  if (res.code !== 200) {
    return false
  }
  // 不存在时为空数组
  const songs = res.result?.songs
  // songs.forEach(item => {
  //   let lowerCaseSinger = singer.toLowerCase()
  //   singerId = item.ar.find(item => item.name.toLowerCase() === lowerCaseSinger || (item?.tns.length ? item?.tns[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alias.length ? item?.alias[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alia ? (item?.alia.length ? item?.alia[0]?.toLowerCase() === lowerCaseSinger : false) : false))?.id
  // })
  if (!songs?.length) {
    return false
  }
  songs.forEach(item => {
    const lowerCaseSinger = singer.toLowerCase()
    singerId = item.ar.find(arItem => [arItem.name, arItem?.tns?.[0], arItem?.alias?.[0], arItem?.alia?.[0]].some(name => name?.toLowerCase() === lowerCaseSinger))?.id
  })
  return singerId || false
}

export async function getSingerRankingList (userId = '', singerType) {
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

export async function getHotSingers () {
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

export async function getFavList (userID, SingerID) {
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

export async function sendMusic (e, data, toUin = null) {
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
  if (data.groupId) {
    recvUin = data.groupId
    sendType = 1
  } else {
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
  try {
    let payload = await Bot.sendOidb('OidbSvc.0xb77_9', core.pb.encode(body))
    let result = core.pb.decode(payload)
    if (!data?.from && data?.from !== undefined) {
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
      if (!data.autoSend) {
        return forwardMsg
      } else {
        if (forwardMsg) {
          const formattedMsg = await makeForwardMsg(e, forwardMsg, '鳄门🙏...')
          await e.reply(formattedMsg)
        }
      }
    }
    if (result[3] !== 0) {
      if (!data.groupId) {
        e.reply('歌曲分享失败：' + result[3], true)
      } else {
        logger.error('歌曲分享失败：' + result[3])
      }
    }
  } catch (err) {
    logger.error('err:', err)
  }
}
