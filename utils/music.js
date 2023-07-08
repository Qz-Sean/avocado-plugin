import { generateRandomHeader, sendPrivateMsg, sleep } from './common.js'
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
      artist: eachSong?.ar.map(item => item.name),
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
      question = `我们现在在一个群聊中，现在是早上${hour}:${minute}点，以你的口吻将这首来自${introSong.artist.join('')}的${introSong.name}推荐给群友。这首歌的歌曲专辑信息是${await getAlbumDetail(introSong.albumId)}，可以简单为群友介绍一下哦。就让我们来开启大家美好的一天吧！`
      break
    case 2:
      question = `我们现在在一个群聊中，现在是中午${hour}:${minute}点，以你的口吻将这首来自${introSong.artist.join('')}的${introSong.name}推荐给群友。这首歌的歌曲专辑信息是${await getAlbumDetail(introSong.albumId)}，可以简单为群友介绍一下哦。大家下午也要干劲满满！再给大家一点类似'中午小睡一会儿'这样的小建议。`
      break
    case 3:
      question = `我们现在在一个群聊中，已经是晚上${hour}:${minute}点了，以你的口吻写一段话告诉群友早点休息，并将这首来自${introSong.artist.join('')}的${introSong.name}推荐给群友。这首歌的歌曲专辑信息是${await getAlbumDetail(introSong.albumId)}，可以简单为群友介绍一下哦。`
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

/**
 * 获取歌手信息
 * @param nameOrId
 * @returns {Promise<{transName: (string|*[]|*|*[]), briefDesc: (string|*), musicSize: (string|*), name, alias: (*|*[]), secondaryExpertIdentiy: (*|string), id: (number|boolean|[*,boolean]), mvSize: (string|*), albumSize: (string|*)}|boolean>}
 */
export async function getSingerDetail (nameOrId) {
  let r
  let singerId = r = typeof nameOrId === 'number' ? nameOrId : await getSingerId(nameOrId)
  // 因为为获取指定歌手返回值
  if (!singerId) return false
  // 模糊查找的结果,不保真
  if (Array.isArray(r)) singerId = r[0]
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
    id: singerId,
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
 * @param id
 * @returns {Promise<string|boolean>}
 */
async function getMusicUrl (id) {
  let musicUrl = 'http://music.163.com/song/media/outer/url?id=' + id

  let ck = Config.wyy
  try {
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; MI Build/SKQ1.211230.001)',
        Cookie: 'versioncode=8008070; os=android; channel=xiaomi; ;appver=8.8.70; ' + 'MUSIC_U=' + ck
      },
      body: `ids=${JSON.stringify([id])}&level=standard&encodeType=mp3`
    }
    // 播放链接
    let response = await fetch('https://music.163.com/api/song/enhance/player/url/v1', options)
    let res = await response.json()
    if (res.code === 200) {
      musicUrl = res.data[0]?.url
      musicUrl = musicUrl || ''
      logger.mark('MusicUrl: ', musicUrl)
    }
  } catch (err) {
    logger.error(err)
    return false
  }
  return musicUrl
}

/**
 * 获取正常点歌的搜索结果
 * @param userId
 * @param order
 * @param limit
 * @returns {Promise<boolean>}
 */
export async function getOrderSongList (userId, order, limit) {
  const url = `http://110.41.21.181:3000/cloudsearch?keywords=${order}&limit=${limit}`
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
    if (order.includes(',')) {
      const artist = order.split(',')[0]
      const songName = order.split(',')[1]
      const song = result?.result?.songs.find(song => song.ar.find(item => item.name.toLowerCase() === artist.toLowerCase() && song.name.toLowerCase() === songName.toLowerCase()))
      // 没有找到符合的结果，保存此次搜索结果，二次选择 =》 Context : wrongFind
      return song
        ? {
            id: song.id,
            name: song.name,
            artist: song?.ar.map(artist => artist.name),
            album: song?.al.name,
            albumPicUrl: song?.al.picUrl
          }
        : false
    }
    const songList = result?.result?.songs.map((item, index) => ({
      index: index + 1,
      id: item.id,
      name: item.name,
      artist: item?.ar.map(artist => artist.name),
      album: item?.al.name,
      albumPicUrl: item?.al.picUrl
    }))
    const res = await redis.set(`AVOCADO:MUSIC_${userId}_ORDERLIST`, JSON.stringify(songList), { EX: 60 * 3 })
    return res === 'OK' ? songList : false
  } catch (err) {
    logger.error(err)
    return false
  }
}
/**
 * 获取歌曲信息
 * @param {object} data
 * - param：必填，不支持id搜歌，可以是歌曲名或歌曲名+歌手的组合
 * - id：选填，使用该参数时需指定来源'from'
 * - isRandom：选填，是否随机点歌
 * - from： 选填，如果需要使用id参数，则必须指定该参数，以便更好处理搜索结果。ps：现在来看，意义不大 emmm
 * @returns {Promise<{}|boolean>}
 */
export async function findSong (data = { param: '', id: '', isRandom: false, from: '' }) {
  const url = `http://110.41.21.181:3000/cloudsearch?keywords=${data.param}&limit=50`
  try {
    const headers = generateRandomHeader()
    const options = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, options)
    const result = await response.json()
    if (result.code !== 200) {
      if (result.code === 400) logger.error('findSong: limit参数设置过大')
      return false
    }
    if (result.result.songCount === 0) {
      logger.error('没有获取到有效歌单')
      return false
    }
    let song, id
    if (data.id) {
      if (data.from === 'random') {
        logger.mark('avocadoMusic -> 随机点歌')
        // 处理搜id有概率搜不到的问题
        song = result?.result?.songs.find(song => song.id === data.id)
        id = song.id
      }
      // wrongFind
      if (data.from === 'reChoose') {
        logger.mark('avocadoMusic -> 第二次点歌')
        // 处理搜id有概率搜不到的问题
        song = result?.result?.songs.find(song => song.id === data.id)
        id = song.id
      }
      if (data.from === 'image') {
        logger.mark('avocadoMusic -> 图片点歌')
        // 处理搜id有概率搜不到的问题
        song = result?.result?.songs.find(song => song.id === data.id)
        id = song.id
      }
      if (data.from === 'goodnight' || data.from === 'goodAfternoon' || data.from === 'goodMorning') {
        logger.mark('avocadoMusic -> 问好点歌')
        // 处理搜id有概率搜不到的问题
        song = result?.result?.songs.find(song => song.id === data.id)
        id = song.id
      }
    } else if (!data.id && data.isRandom) {
      logger.mark('avocadoMusic -> 随机歌名点歌')
      // 随机但没有传入id ==> 即参数不是歌手
      song = result?.result?.songs?.[Math.floor(Math.random() * result?.result?.songs.length)]
      id = song.id
    } else {
      logger.mark('avocadoMusic -> 正常点歌')
      if (data.param.includes(',')) {
        const [a, b] = data.param.split(',')
        const artist = ((await getSingerDetail(a))?.name || (await getSingerDetail(b))?.name) || a
        const songName = artist === b ? a : b
        const songList = result?.result?.songs
        song = songList.find(song => song.ar.find(item => item.name.toLowerCase() === artist.toLowerCase() && song.name.toLowerCase() === songName.toLowerCase()))
        id = song?.id
        // 没有找到符合的结果，保存此次搜索结果，二次选择 =》 Context : wrongFind
        if (!id) {
          const tempRes = result?.result?.songs.map((song, index) => ({
            index: index + 1,
            name: song.name,
            id: song.id,
            artist: song.ar.map(item => item.name)
          }))
          await redis.set(`AVOCADO:MUSIC_${data.param}`, JSON.stringify(tempRes), { EX: 60 * 2 })
          return tempRes
        }
      } else {
        id = result?.result?.songs?.[0].id
      }
    }
    if (!id) {
      return false
    } else {
      return await getMusicDetail(id)
    }
  } catch (err) {
    logger.error(err)
    return false
  }
}

/**
 * 获取单曲所有信息
 * @returns {Promise<{}>}
 * @param id
 */
export async function getMusicDetail (id) {
  let response, resJson, song
  const songInfo = {}
  try {
    response = await fetch(`http://110.41.21.181:3000/song/detail?ids=${id}`)
    resJson = await response.json()
    song = resJson.songs[0]
    songInfo.id = song.id
    songInfo.name = song.name
    songInfo.artist = song.ar.map(item => item.name).join(',')
    songInfo.albumId = song.al.id
    songInfo.pic = song.al.picUrl
    songInfo.fee = song.fee
    songInfo.mv = song.mv
    songInfo.dt = song.dt
    songInfo.link = 'https://music.163.com/#/song?id=' + song.id
    songInfo.musicUrl = await getMusicUrl(song.id)
    const list = await getCommentsOrLyrics(id, 0)
    songInfo.comments = list[0]
    songInfo.lyrics = list[1]
    return songInfo
  } catch (err) {
    logger.error(err)
    return false
  }
}

/**
 * 获取热门五十首
 * @param userId
 * @param artist - 歌手名称
 * @returns {Promise<boolean>}
 */
export async function getSingerHotList (userId, artist) {
  const r = await getSingerId(artist)
  let singerId
  if (!r) {
    return false
  } else {
    singerId = r[0]
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
    id: item.id,
    name: item.name,
    artist: item?.ar.map(artist => artist.name)
  }))
  await redis.set(`AVOCADO:MUSIC_${userId}_HOTLIST`, JSON.stringify(hotList))
  return hotList
}

export async function getSingerId (artist) {
  let url = `http://110.41.21.181:3000/cloudsearch?keywords=${encodeURI(artist)}&limit=1`
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
  //   let lowerCaseSinger = artist.toLowerCase()
  //   singerId = item.ar.find(item => item.name.toLowerCase() === lowerCaseSinger || (item?.tns.length ? item?.tns[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alias.length ? item?.alias[0]?.toLowerCase() === lowerCaseSinger : false) || (item?.alia ? (item?.alia.length ? item?.alia[0]?.toLowerCase() === lowerCaseSinger : false) : false))?.id
  // })
  if (!songs?.length) {
    return false
  }
  let flag = true
  songs.forEach(item => {
    const lowerCaseSinger = artist.toLowerCase()
    singerId = item.ar.find(arItem => [arItem.name, arItem?.tns?.[0], arItem?.alias?.[0], arItem?.alia?.[0]].some(name => name?.toLowerCase() === lowerCaseSinger))?.id
  })
  // 如果找不到完全匹配的就返回包含参数的歌手, 并设置flag为false
  // 例如: 三无 => 三无 MarBlue
  if (!singerId) {
    let singer
    songs.forEach(item => {
      const lowerCaseSinger = artist.toLowerCase()
      singer = item.ar.find(arItem => [arItem.name, arItem?.tns?.[0], arItem?.alias?.[0], arItem?.alia?.[0]].some(name => name?.toLowerCase().includes(lowerCaseSinger)))
      singerId = singer?.id
    })
    if (singerId) {
      await redis.set(`AVOCADO:MUSIC_WRONGSINGER_${artist}`, JSON.stringify(singer), { EX: 60 })
      flag = false
    }
  }
  return singerId ? [singerId, flag] : false
}

/**
 * 各地区歌手榜 -> {华语: 1, 欧美: 2,韩国: 3, 日本: 4}
 * @param {string} userId
 * @param {number} singerType
 * @returns {Promise<*|boolean>}
 */
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
      await redis.set(`AVOCADO:MUSIC_${userId}_SINGERTYPE`, singerType, { EX: 60 * 60 * 24 * 7 })
    }
    return list
  } catch (err) {
    logger.error(err)
    return false
  }
}

/**
 * 获取热门歌手,不限制地区
 * @returns {Promise<*|boolean>}
 */
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
    const artists = result?.artists
    if (artists.length) {
      return artists.map((artist, index) => ({ index: index + 1, id: artist.id, name: artist.name }))
    }
  } catch (e) {
    logger.error(e)
    return false
  }
}

export async function getFavList (userID, SingerID) {
  let url = `http://110.41.21.181:3000/artist/songs?id=${SingerID}&limit=200`
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
    const songList = result.songs
    let mIndex = 0
    const favList = songList.map((item) => {
      return item.noCopyrightRcmd === null && item.st === 1
        ? {
            index: ++mIndex,
            id: item.id,
            name: item.name,
            dt: Math.ceil(item.dt / 1000),
            artist: item?.ar.map(artist => artist.name),
            albumId: item.al.id,
            fee: item.fee,
            mv: item.mv
          }
        : null
    }).filter(item => item !== null)
    await redis.set(`AVOCADO:MUSIC_${userID}_FAVSONGLIST`, JSON.stringify(favList))
    return favList.length
  } catch (error) {
    return error
  }
}

export async function avocadoShareMusic (id, target, imgToShare, textMsg, platformCode) {
  try {
    const platform = platformCode || '163'
    if (!Array.isArray(target)) {
      let t
      if (Bot.getFriendList().get(target)) {
        t = await Bot.pickFriend(target)
        await t.shareMusic(platform, id)
        if (textMsg) {
          await sleep(1000)
          await sendPrivateMsg(target, textMsg)
        }
        if (imgToShare) {
          await sleep(1000)
          await sendPrivateMsg(target, imgToShare)
        }
        await Bot.send
      } else if (Bot.getGroupList().get(target)) {
        t = await Bot.pickGroup(target)
        await t.shareMusic(platform, id)
      } else {
        throw new Error('所选对象不存在: ' + target)
      }
    } else {
      for (const group of target) {
        let groupId = parseInt(group)
        if (Bot.getGroupList().get(groupId)) {
          let g = await Bot.pickGroup(groupId)
          await g.shareMusic(platform, id)
          await sleep(1000)
          if (textMsg) await Bot.sendGroupMsg(groupId, textMsg)
          await sleep(1000)
          if (imgToShare) await Bot.sendGroupMsg(groupId, imgToShare)
          await sleep(2000)
        } else {
          logger.mark('avocadoSayGoodnight -> 找不到群聊: ' + groupId)
        }
      }
    }
  } catch (e) {
    logger.error('avocadoShareMusic: ' + e)
    return false
  }
}
/**
 *
 * @param musicObjectOrMusicId - 音乐对象或音乐id
 * @param type - 获取类型 0:歌词+评论 1:歌词 2:评论
 * @returns {Promise<*>}
 */
export async function getCommentsOrLyrics (musicObjectOrMusicId, type = 0) {
  let comments, lyrics
  if (typeof musicObjectOrMusicId !== 'object') {
    const id = parseInt(musicObjectOrMusicId)
    let response = await fetch(`http://110.41.21.181:3000/lyric?id=${id}`)
    let resJson = await response.json()
    lyrics = [resJson.lrc?.lyric]
    if (type === 1 || type === 0) {
      response = await fetch(`http://110.41.21.181:3000/comment/hot?id=${id}&type=0`)
      resJson = await response.json()
      comments = resJson.hotComments.slice(0, 15).map(item => {
        return [item.likedCount, item.content]
      })
    }
  }
  switch (type) {
    case 0: {
      if (Object.getOwnPropertyNames(musicObjectOrMusicId).length !== 0) return musicObjectOrMusicId
      return [
        comments,
        lyrics
      ]
    }
    case 1: {
      if (Object.getOwnPropertyNames(musicObjectOrMusicId).length !== 0) return musicObjectOrMusicId?.lyrics
      return lyrics
    }
    case 2: {
      if (Object.getOwnPropertyNames(musicObjectOrMusicId).length !== 0) return musicObjectOrMusicId?.comments
      return comments
    }
  }
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
  let artist = data.artist
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

  prompt = prompt + title + '-' + artist

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
      11: artist,
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
