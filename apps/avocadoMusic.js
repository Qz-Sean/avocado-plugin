import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../utils/config.js'
import { avocadoRender, getGptResponse, initTimer, refreshTimer, sleep, splitArray } from '../utils/common.js'
import { getBonkersBabble } from './avocadoPsycho.js'
import { playingListMap, singerMap, singerTypeMap, timer } from '../utils/const.js'
import {
  avocadoShareMusic,
  findSong,
  getFavList,
  getGreetMsg,
  getMusicDetail,
  getOrderSongList,
  getNewPlayList,
  getSingerDetail,
  getSingerHotList,
  getSingerId,
  getSingerRankingList, updatePlaylist, delPlaylist, getPlayingList, getRandomOneFromPlaylist
} from '../utils/music.js'
export class AvocadoMusic extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => Dance',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: `^#?(鳄梨酱?|${global.God})?(音乐|听|点歌|来首|来一首)(#|%)?(随机|热门)?(华语|欧美|韩国|日本)?(.*)`,
          fnc: 'pickMusic'
        },
        // {
        //   // for fun
        //   reg: '听(#|%)?(随机|热门)?(华语|欧美|韩国|日本)?(.*)',
        //   fnc: 'pickMusic'
        // },
        {
          reg: `^(来点好听的|鳄梨酱?[~～]+|${global.God}[~～]+|下一首|切歌|听歌|换歌|下一曲)$`,
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
          reg: '^#?(华语|中国|欧美|韩国|日本)歌手榜',
          fnc: 'getSingerRankingList'
        },
        {
          reg: '^#?歌词|热评|评论',
          fnc: 'getCommentsOrLyrics'
        },
        {
          // 暂时只提供单群开启与限制主人使用
          // todo fix bug done
          reg: '^#播放(?:歌单)?(.*)',
          fnc: 'startPlaylist',
          permission: 'master'
        },
        {
          reg: '^#查看播放(状态|歌单)',
          fnc: 'checkPlayingList'
        },
        {
          reg: '^#?停止播放',
          fnc: 'stopPlaylist',
          permission: 'master'
        },
        {
          // todo 若正在播放当前用户的歌单则重置apctxmap done
          // 暂时只提供单群开启与主人权限限制
          reg: '^#?(添加|删除)歌单(.*)',
          fnc: 'adminPlayList',
          permission: 'master'
        }
      ]
    })

    this.task = [
      {
        cron: '*/3 * * * *',
        // cron: '*/1 * * * *',
        name: 'autoPlayNextSong',
        fnc: this.autoPlayNext
      },
      {
        cron: '15 7 * * *',
        // cron: '*/1 * * * *',
        name: 'Good morning',
        fnc: this.sayGoodMorning
      },
      {
        cron: '5 12 * * *',
        // cron: '*/1 * * * *',
        name: 'Good afternoon',
        fnc: this.sayGoodAfternoon
      },
      {
        cron: '30 23 * * *',
        // cron: '*/1 * * * *',
        name: 'Nightly-night',
        fnc: this.sayGoodnight
      }
    ]
  }

  async sendBoradCast () {
    // 咕咕咕
  }

  // TODO 多群启用 done
  async autoPlayNext () {
    const groupIds = Array.from(playingListMap.keys())
    timeToSleep = new Date().getHours() < 6
    if (!groupIds.length || timeToSleep) return false
    for (const groupId of groupIds) {
      const playingList = getPlayingList(groupId)
      const listName = playingList.listName
      const timer = playingList.timer
      const initiator = playingList.initiator
      const listDetail = playingList.listDetail
      const listType = playingList.listType
      // 获取剩余时长
      const leftTime = refreshTimer(timer).leftTime
      logger.mark(`当前歌曲剩余时长: ${leftTime}秒`)
      // 若在下一个等待周期内当前歌曲能播放完成则添加定时任务
      if (leftTime < 180) {
        if (timer.timeoutId) clearTimeout(timer.timeoutId)
        const isEnoughTime = leftTime > 15
        timer.timeoutId = setTimeout(async () => {
          let [next, replacedList] = await getRandomOneFromPlaylist(listDetail, listName)
          if (listType === 1) {
            await updatePlaylist(initiator, { listName, listDetail: replacedList })
          }
          if (Config.apiKey && Math.random() > 0.5) {
            const question = '简单介绍一下' + next.artist.join('、') + '的' + next.name + '这首歌，不需要过多介绍歌手。'
            const resText = await getGptResponse(question)
            const img = resText ? await avocadoRender(resText, { title: `${next.name}-${next.artist.join('、')}`, width: 500, height: 500 }) : false
            if (img) await Bot.sendGroupMsg(groupId, img)
          } else {
            await Bot.sendGroupMsg(groupId, '即将播放：' + next.name + '——' + next.artist.join('|'))
          }
          if (isEnoughTime) await sleep(1000 * 8)
          await avocadoShareMusic(next, groupId)
          // 重置计时器
          timer.invokeTime = null
          logger.mark(`${next.name}-${next.artist.join('、')} -> 总时长: ${initTimer(timer, next.dt)}秒`)
          const m = new AvocadoMusic()
          await m.autoPlayNext()
        }, (isEnoughTime ? leftTime - 5 : (leftTime || 1)) * 1000)
      }
    }
  }

  async startPlaylist (e) {
    const reg = /^#播放(?:歌单)?(.*)/
    const match = e.msg.match(reg)
    // todo： 未匹配则播放用户歌手热门单曲 done
    const listName = match[1]
    if (playingListMap.get(e.group_id)) {
      await e.reply('有其他歌单正在播放')
      return false
    }
    let res, singleList, picked, replyMsg, listDetail
    if (listName) { // 播放自定义歌单
      const userPlayList = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_PLAYLIST`)
      if (!userPlayList) {
        await e.reply('你还没有添加歌单呢')
        return false
      }
      singleList = (JSON.parse(userPlayList)).find(item => item.name.toUpperCase() === listName.toUpperCase())
      listDetail = singleList.listDetail
      if (!singleList) {
        await e.reply('找不到名为' + listName + '的歌单！')
        return false
      }
      let replacedList
      [picked, replacedList] = await getRandomOneFromPlaylist(listDetail, listName)
      await updatePlaylist(e.sender.user_id, { listName, listDetail: replacedList })
      replyMsg = `将在本群自动播放歌单 ${listName} 中的歌曲。`
    } else {
      const favSongList = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSONGLIST`)
      if (!favSongList) {
        await e.reply('未设置歌手！示例：#设置歌手周杰伦')
        return false
      }
      const favSinger = JSON.parse(await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`)).singerName
      listDetail = JSON.parse(favSongList)
      picked = await getMusicDetail(listDetail[Math.floor(Math.random() * listDetail.length)].id)
      replyMsg = '即将播放' + favSinger + '的热门单曲'
    }
    await e.reply(replyMsg, true, { recallMsg: 10 })
    const duration = picked.dt
    res = await avocadoShareMusic(picked, e.group_id)
    if (!res) {
      await e.reply('播放失败')
      return false
    }
    if (Config.apiKey) {
      const question = '简单介绍一下' + picked.artist.join('、') + '的' + picked.name + '这首歌，不需要过多介绍歌手。'
      const resText = await getGptResponse(question)
      const img = resText ? await avocadoRender(resText, { title: `${picked.name}-${picked.artist.join('、')}`, width: 500, height: 500 }) : false
      if (img) await e.reply(img)
    }
    await redis.set(`AVOCADO:MUSIC_${e.sender.user_id}_PICKED`, JSON.stringify(picked), { EX: picked.dt })
    // 初始化计时器
    const timer = {
      leftTime: null,
      invokeTime: null,
      timeoutId: null
    }
    const songDuration = initTimer(timer, duration)
    logger.mark(`${picked.name}-${picked.artist.join('、')} -> 总时长: ${songDuration}秒`)
    playingListMap.set(e.group_id, {
      initiator: e.sender.user_id,
      listType: listName ? 1 : 2, // 1: customizedList  2: favSongList
      listName: listName || e.sender.user_id + '的歌手热门',
      timer,
      listDetail
    })
    await this.autoPlayNext()
    return true
  }

  async stopPlaylist (e) {
    const playingList = getPlayingList(e.group_id)
    if (playingList) {
      playingListMap.delete(e.group_id)
      await e.reply('ok', true, { recallMsg: 3 })
    } else {
      await e.reply('没有正在播放的歌单', true, { recallMsg: 3 })
    }
  }

  async checkPlayingList (e) {
    const playingList = getPlayingList(e.group_id)
    if (playingList) {
      const listName = playingList.listName
      const initiator = await Bot.pickMember(e.group_id, playingList.initiator)
      const nickname = initiator.info?.card || initiator.info?.nickname
      await e.reply(`${nickname}：${listName}`)
      return true
    } else {
      await e.reply('nothing')
      return false
    }
  }

  async adminPlayList (e) {
    const regex = /^#?(添加|删除)歌单(.+)/
    const match = e.msg.match(regex)
    const [isAdd, [listName, listId]] = [match[1] === '添加', match[2].split(/[,，\s]/)]
    let replyMsg = ''
    const playingList = await getPlayingList(e.group_id)
    // 停止播放
    if (playingList && playingList.initiator === e.sender.user_id) {
      playingListMap.delete(e.group_id)
    }
    if (isAdd) {
      if (!listId) await e.reply('示例：#添加歌单我喜欢，123456\n数字为你要添加的歌单id，自行获取。')
      const listObj = await getNewPlayList(listId, listName, e.sender.user_id)
      replyMsg = listObj ? `添加歌单${listName}成功！共${listObj.listDetail.length}首歌。` : '添加失败！'
      await updatePlaylist(e.sender.user_id, listObj)
    } else {
      const status = await delPlaylist(e.sender.user_id, listName)
      logger.warn(status)
      replyMsg = `删除歌单${listName}${status ? '成功' : '失败'}！`
    }
    await e.reply(replyMsg)
    return true
  }

  async pickMusic (e) {
    // 绑定this.e, 供context()开启当前plugin上下文
    this.e = e
    const regex = new RegExp(`#?(鳄梨酱?|${global.God})?(听|音乐|点歌|来首|来一首)(#|%)?(随机|热门)?(华语|欧美|韩国|日本)?(.*)`)
    // if (e.msg.includes('听') && e.msg.split('听')[0].length > 8) return false
    const match = this.e.msg.trim().match(regex)
    const isImageOrder = match[3] ? match[3] === '%' : false // 正常点歌将时使用图片点歌的形式
    const selectType = match[4] ? match[4] : ''
    const query = match[6] ? match[6].replace(/[，,]/g, ',') : ''
    logger.mark('avocadoMusic -> 点歌: ', query)
    const { isRandom, isHotList } = { isRandom: selectType === '随机', isHotList: selectType === '热门' }
    const queryIsSinger = query ? !!(await getSingerId(query)) : false
    let singerType = singerTypeMap[match[5]] || Math.ceil(Math.random() * 4)
    let hotList
    if (queryIsSinger) hotList = await getSingerHotList(e.sender.user_id, query)
    // 指令包含类型 =》 随机|热门
    if (selectType) {
      // 存在点歌参数
      if (query) {
        if (isRandom) { // 随机点歌
          // 点歌参数是否为歌手名
          if (queryIsSinger) {
            let song = hotList[Math.floor(Math.random() * hotList.length)]
            const data = {
              param: song.name,
              isRandom: false,
              id: song.id,
              from: 'random'
            }
            song = await findSong(data)
            // if (!song) {
            //   const img = await avocadoRender(`### 没有找到名为 ${query} 的歌曲呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`)
            //   if (img) await this.e.reply(img)
            //   return
            // }
            await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_PICKED`, JSON.stringify(song), { EX: 60 * 3 })
            // await sendMusic(this.e, song)
            const wrongSinger = await redis.get(`AVOCADO:MUSIC_WRONGSINGER_${query}`)
            await avocadoShareMusic(song, this.e.group_id || this.e.sender.user_id)
            if (wrongSinger) {
              const singerName = JSON.parse(wrongSinger).name
              await this.e.reply(`没有找到名为 ${query} 的歌手呢...猜测你想查询的是${singerName}，已为你发送一首${singerName}的${song.name}！`)
            }
            return true
          } else {
            if (/歌手|音乐人/.test(query)) {
              const singerRankingList = await getSingerRankingList(e.sender.user_id, singerType)
              const picked = singerRankingList[Math.floor(Math.random() * singerRankingList.length)]
              const singerInfo = await getSingerDetail(picked.id)
              const replyMsg = []
              for (const key in singerInfo) {
                if (key === 'id') continue
                replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
              }
              const img = await avocadoRender(replyMsg.join(''), { footer: `你想不想继续了解${singerInfo.name}的热门单曲呢~` })
              if (img) await this.e.reply(img)
              await getSingerHotList(e.sender.user_id, singerInfo.name)
              await redis.set(`AVOCADO:MUSIC_${e.sender.user_id}_FROM`, 'randomSinger', { EX: 60 * 10 })
              this.setContext('isContinue')
              return true
            }
            // 随机歌名点歌
            const data = { param: query, isRandom, id: '', from: 'random' }
            const song = await findSong(data)
            if (!song) {
              const img = await avocadoRender(`### 没有找到名为${query}的歌曲呢...试试其他选择吧~\n${await getBonkersBabble(global.God, 'native')}`)
              if (img) await this.e.reply(img)
              return
            }
            await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_PICKED`, JSON.stringify(song), { EX: 60 * 3 })
            await avocadoShareMusic(song, this.e.group_id || this.e.sender.user_id)
            return true
          }
        }
        if (isHotList) { // 指令包含’热门‘参数
          if (singerType) { // 指令包含歌手类型
            if (/歌手|音乐人/.test(query)) { // 点歌参数为歌手|音乐人
              const singerRankingList = await getSingerRankingList(this.e.sender.user_id, singerType)
              const hotSingers = splitArray(singerRankingList.map(obj => `${obj.index}: ${obj.name}`), 3)
              const img = await avocadoRender(hotSingers, {
                title: `热门${match[5]}歌手`,
                footer: '有没有你感兴趣的歌手呢~你想了解谁呢~',
                renderType: 2
              })
              await this.e.reply(img)
              this.setContext('pickHotSinger')
              return true
            }
          }
          if (queryIsSinger) { // 点歌参数为歌手名
            const text = splitArray(hotList.map(obj => `${obj.index}: ${obj.name}\n`), 2)
            const wrongSinger = await redis.get(`AVOCADO:MUSIC_WRONGSINGER_${query}`)
            let wsn = ''
            if (wrongSinger) {
              wsn = JSON.parse(wrongSinger).name
              await this.e.reply(`没有找到名为 ${query} 的歌手呢...猜测你想查询的是${wsn}，即将为你发送${wsn}的热门歌单！`)
            }
            const img = await avocadoRender(text, {
              title: `${wsn || query}-热门播放50`,
              footer: '可通过发送对应序号获取音乐~',
              renderType: 2
            })
            if (img) await this.e.reply(img)
            this.setContext('selectSongFromImage')
            return true
          }
          // const img = await avocadoRender(`### 没有找到名为 ${query} 的歌手呢...\n### 当前指令只支持 \`热门[歌手(名称)|音乐人]\` 哦！试试其他选择吧~\n- 鳄梨酱#热门李健\n- 鳄梨酱#热门歌手\n- 鳄梨酱#热门音乐人\n\n${await getBonkersBabble({}, global.God, 'native')}`)
          // if (img) await e.reply(img)
          // return true
        }
      } else if (!query) { // 没有任何点歌参数
        if (isRandom) {
          await this.e.reply(`什么？可通过发送 '${global.God}#随机+歌手名' 随机播放歌手的热门单曲哦！`)
          return false
        }
        if (isHotList) {
          await this.e.reply(`你是不是想了解最近的热门歌手呢？可通过发送 '${global.God}#热门+歌手' 获取今日热门歌手哦！`)
          return false
        }
      }
    } else if (query) { // 没有指定点歌类型但有点歌参数
      // 随机播放指定歌手的热门单曲
      if (queryIsSinger) {
        let song = hotList[Math.floor(Math.random() * hotList.length)]
        const data = {
          param: song.name,
          isRandom: false,
          id: song.id,
          from: 'random'
        }
        song = await findSong(data)
        await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_PICKED`, JSON.stringify(song), { EX: 60 * 3 })
        await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_PICKEDSINGER`, query, { EX: 60 * 2 })
        // await sendMusic(this.e, song)
        const wrongSinger = await redis.get(`AVOCADO:MUSIC_WRONGSINGER_${query}`)
        await avocadoShareMusic(song, this.e.group_id || this.e.sender.user_id)
        if (wrongSinger) {
          const singerName = JSON.parse(wrongSinger).name
          await this.e.reply(`没有找到名为 ${query} 的歌手呢...猜测你想查询的是${singerName}，已为你发送一首${singerName}的${song.name}！`)
        }
        return true
      }
      // 正常点歌
      if (isImageOrder) {
        const songList = await getOrderSongList(this.e.sender.user_id, query, 50)
        const text = splitArray(songList.map(obj => `${obj.index}: ${obj.name} by ${obj.artist}\n`), 2)
        const img = await avocadoRender(text, {
          title: `${query}-搜索结果`,
          footer: '可通过发送对应序号获取音乐~',
          renderType: 2
        })
        if (img) await this.e.reply(img)
        this.e.orderFrom = 'imageOrder'
        this.setContext('selectSongFromImage')
        return true
      } else {
        const data = { param: query, isRandom: false, id: '', from: '' }
        const song = await findSong(data)
        if (Array.isArray(song)) {
          const text = splitArray(song.map(obj => `${obj.index}: ${obj.name} by ${obj.artist}`), 2)
          await this.e.reply('哎呀，找不到您想听的歌曲啦~(>_<)~不要难过，看看下面的列表吧！说不定您会在这里找到自己心仪的歌曲呢！(≧∇≦)ﾉ 发送对应序号即可选择歌曲哦~ 或者发送 0 取消点歌呦~(＾Ｕ＾)ノ~ＹＯ', false, { recallMsg: 5 })
          const img = await avocadoRender(text, {
            renderType: 2,
            from: 'searchMusic'
          })
          if (img) await this.e.reply(img)
          this.e.songName = query
          this.setContext('wrongFind')
          return true
        }
        if (!song) {
          const img = await avocadoRender(`### 没有找到名为 ${query} 的歌曲呢...\n${await getBonkersBabble(global.God, 'native')}`)
          if (img) await this.e.reply(img)
          return true
        }
        await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_PICKED`, JSON.stringify(song), { EX: 60 * 3 })
        await avocadoShareMusic(song, this.e.group_id || this.e.sender.user_id)
        return true
      }
    } else { // 没有指定点歌类型且没有任何点歌参数
      await this.e.reply('告诉我你想听什么吧~')
      return true
    }
  }

  async wrongFind (e) {
    if (typeof this.e.msg !== 'string') { return }
    logger.mark('wrongFind:', this.e.msg)
    // 从上次对话中获取歌名
    const songList = JSON.parse(await redis.get(`AVOCADO:MUSIC_${e.songName}`))
    const reg = new RegExp(`^((歌词|热评|评论)|(0)|(${songList.map(item => item.index).join('|')})|(${songList.map(item => item.name).join('|').replace(/\*/g, ' fuckWords ').replace(/\(/g, '（').replace(/\)/g, '）').replace(/\./g, ' ')}))$`)
    if (!reg.test(this.e.msg)) {
      const count = await redis.get('AVOCADO_REQUESTCOUNT')
      if (!count) {
        await this.reply(`告诉我序号吧，回复0结束点歌。\n距本次会话结束还剩${refreshTimer(timer.musicCtx).leftTime}秒。。`)
        await redis.set('AVOCADO_REQUESTCOUNT', 1, { EX: 60 * 1.5 })
      }
    } else {
      if (/歌词|热评|评论/.test(this.e.msg)) {
        await this.getCommentsOrLyrics(this.e)
        return
      }
      if (this.e.msg === '0') {
        await this.e.reply(`${global.God}！！！`)
        this.finish('wrongFind')
        return true
      }
      const selectedMusic = songList.find(eachSong => eachSong.index === parseInt(this.e.msg) || eachSong.name === this.e.msg)
      const name = selectedMusic?.name
      const id = selectedMusic?.id
      logger.mark('第二次点歌: ', selectedMusic)
      if (!(name && id)) return false
      const data = {
        param: name,
        isRandom: false,
        id,
        from: 'reChoose'
      }
      const song = await findSong(data)
      if (song) {
        await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_PICKED`, JSON.stringify(song), { EX: 60 * 3 })
        await avocadoShareMusic(song, this.e.group_id || this.e.sender.user_id)
      } else {
        const img = await avocadoRender(`### 没有找到名为${name}的歌曲呢...\n${await getBonkersBabble(global.God, 'native')}`)
        if (img) await this.e.reply(img)
        this.finish('wrongFind')
      }
      this.finish('wrongFind')
    }
  }

  async pickHotSinger (e) {
    if (typeof this.e.msg !== 'string') { return }
    logger.mark('pickHotSinger:', this.e.msg)
    const hotSingers = await getSingerRankingList(this.e.sender.user_id, await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_SINGERTYPE`))
    const reg = new RegExp(`^((0)|(${hotSingers.map(item => item.index).join('|')})|(${hotSingers.map(item => item.name).join('|').replace(/\*/g, ' fuckWords ').replace(/\(/g, '（').replace(/\)/g, '）').replace(/\./g, ' ')}))$`)
    let img
    if (!reg.test(this.e.msg)) {
      const count = await redis.get('AVOCADO_REQUESTCOUNT')
      if (!count) {
        img = await avocadoRender(`### 没有找到名为 ${this.e.msg} 的歌手呢...试试其他选择吧~\n距本次会话结束还剩${refreshTimer(timer.musicCtx).leftTime}秒\n\n${await getBonkersBabble(global.God, 'native')}`)
        if (img) await this.reply(img)
        await redis.set('AVOCADO_REQUESTCOUNT', 1, { EX: 60 * 3 })
      }
      return true
    } else {
      if (parseInt(this.e.msg) === 0) {
        this.finish('pickHotSinger')
        return true
      }
      const pickedSinger = hotSingers.find(item => item.index === parseInt(this.e.msg) || item.name === this.e.msg)
      const singerId = pickedSinger.id
      const singerName = pickedSinger.name
      const singerInfo = await getSingerDetail(singerId)
      let replyMsg = []
      for (const key in singerInfo) {
        if (key === 'id') continue
        replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
      }
      img = await avocadoRender(replyMsg.join(''), { footer: `你想不想继续了解${singerName}的热门单曲呢~` })
      if (img) await this.e.reply(img)
      // 保存用户的选择
      await getSingerHotList(this.e.sender.user_id, singerName)
      this.finish('pickHotSinger')
      this.setContext('isContinue')
      return true
    }
  }

  /**
   * 了解(搜索)歌手
   * @param e
   * @returns {Promise<boolean>}
   */
  async getSinger (e) {
    const singer = e.msg.trim().replace(/#?了解/, '')
    logger.mark('singer: ', singer)
    let singerId
    const res = await getSingerId(singer)
    if (!res) {
      const img = await avocadoRender(`### 没有找到名为 ${singer} 的歌手呢...\n${await getBonkersBabble(global.God, 'native')}`)
      if (img) await this.reply(img)
      return true
    }
    if (res) singerId = res[0]
    const wrongSinger = await redis.get(`AVOCADO:MUSIC_WRONGSINGER_${singer}`)
    if (wrongSinger) {
      const singerName = JSON.parse(wrongSinger).name
      await this.e.reply(`没有找到名为 ${singer} 的歌手呢...猜测你想查询的是${singerName}，即将为你发送${singerName}的歌手卡片~`)
    }
    const singerInfo = await getSingerDetail(singerId)
    let replyMsg = []
    for (const key in singerInfo) {
      if (key === 'id') continue
      replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
    }
    const img = await avocadoRender(replyMsg.join(''), { footer: `你想不想继续了解${singer}的热门单曲呢~` })
    await getSingerHotList(this.e.sender.user_id, singer)
    if (img) {
      await this.reply(img)
    }
    this.setContext('isContinue')
    return true
  }

  async isContinue (e) {
    if (typeof this.e.msg !== 'string') { return }
    logger.mark('isContinue: ', this.e.msg)
    const reg = /不想|算了|不要|no|0|想|1|换|切/i
    if (!reg.test(this.e.msg)) {
      const count = await redis.get('AVOCADO_REQUESTCOUNT')
      if (!count) {
        const img = await avocadoRender(`### 🤔💭 想要呢？还是算了呢？\n距本次会话结束还剩${refreshTimer(timer.musicCtx).leftTime}秒\n\n${await getBonkersBabble(global.God, 'native')}`)
        if (img) await this.reply(img)
        await redis.set('AVOCADO_REQUESTCOUNT', 1, { EX: 60 * 3 }) // 会话期间只提醒一次
      }
      return true
    } else {
      if (/^(不想|算了|不要|no|0)$/i.test(this.e.msg)) {
        await this.e.reply(`${global.God}！！！`)
        this.finish('isContinue')
        return true
      }
      if (/[换切]/.test(this.e.msg)) {
        const from = await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_FROM`)
        if (from === 'randomSinger') {
          const singerRankingList = await getSingerRankingList(this.e.sender.user_id, Math.ceil(Math.random() * 4))
          const picked = singerRankingList[Math.floor(Math.random() * singerRankingList.length)]
          const singerInfo = await getSingerDetail(picked.id)
          const replyMsg = []
          for (const key in singerInfo) {
            if (key === 'id') continue
            replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
          }
          const img = await avocadoRender(replyMsg.join(''), { footer: `你愿意继续了解${singerInfo.name}最受欢迎的单曲吗~☺️` })
          if (img) await this.reply(img)
          await getSingerHotList(this.e.sender.user_id, singerInfo.name)
          this.finish('isContinue')
          this.setContext('isContinue')
          return true
        } else {
          return
        }
      }
      const hotList = JSON.parse(await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_HOTLIST`))
      const artist = hotList.find(obj => obj.artist.length === 1).artist[0]
      const text = splitArray(hotList.map(obj => `${obj.index}: ${obj.name}`), 2)
      const img = await avocadoRender(text, { title: `${artist}-热门播放50`, renderType: 2 })
      if (img) await this.reply(img)
      this.finish('isContinue')
      this.setContext('selectSongFromImage')
      return true
    }
  }

  async selectSongFromImage (e) {
    logger.mark('selectSongFromImage: ', this.e.msg)
    if (typeof this.e.msg !== 'string') { return }
    let songList
    if (e.orderFrom === 'imageOrder') {
      songList = JSON.parse(await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_ORDERLIST`))
    } else {
      songList = JSON.parse(await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_HOTLIST`))
    }
    const reg = new RegExp(`^((歌词|热评|评论)|(0)|(${songList.map(item => item.index).join('|')})|(${songList.map(item => item.name).join('|').replace(/\*/g, ' fuckWords ').replace(/\(/g, '（').replace(/\)/g, '）').replace(/\./g, ' ')}))$`)
    let res, img
    if (!reg.test(this.e.msg)) return
    // img = await avocadoRender(`### 没有找到 ${this.e.msg} 呢...试试其他选择吧~\n${await getBonkersBabble({}, global.God, 'native')}`, {  footer: '' })
    // if (img) await this.reply(img)
    if (this.e.msg === '0') {
      this.finish('selectSongFromImage')
      await this.e.reply(global.God + '！！！')
      return true
    }
    if (/歌词|热评|评论/.test(this.e.msg)) {
      await this.getCommentsOrLyrics(this.e)
      return
    }
    const selectedMusic = songList.find(eachSong => eachSong.index === parseInt(this.e.msg) || eachSong.name === this.e.msg)
    const name = selectedMusic?.name
    const id = selectedMusic?.id
    logger.mark('图片点歌: ', selectedMusic)
    if (!(name && id)) return false
    const data = {
      param: name,
      isRandom: false,
      id,
      from: 'image'
    }
    const song = await findSong(data)
    if (song) {
      await redis.set(`AVOCADO:MUSIC_${this.e.sender.user_id}_PICKED`, JSON.stringify(song), { EX: 60 * 3 })
      await avocadoShareMusic(song, this.e.group_id || this.e.sender.user_id)
    } else {
      const img = await avocadoRender(`### 没有找到名为${name}的歌曲呢...\n距本次会话结束还剩${refreshTimer(timer.musicCtx).leftTime}秒\n\n${await getBonkersBabble(global.God, 'native')}`)
      if (img) await this.e.reply(img)
      this.finish('selectSongFromImage')
    }
  }

  /**
   * 重新获取最爱歌手的歌单
   * @param e
   * @returns {Promise<boolean>}
   */
  async reloadMusicInfo (e) {
    const userData = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`)
    if (!userData) {
      await e.reply('你还没有设置歌手呢!')
      return false
    } else {
      const singerId = JSON.parse(userData).singerId
      await e.reply('正在更新歌曲数据...', { recallMsg: 2 })
      const res = await getFavList(e.sender.user_id, singerId)
      if (res > 0) {
        await e.reply('成功了！本次共获取到' + res + '首歌曲！')
      } else {
        await e.reply('失败了！' + res)
      }
    }
  }

  /**
   * 随机挑选最爱歌手的曲目播放
   * @param e
   * @returns {Promise<boolean>}
   */
  async randomMusic (e) {
    try {
      if (/(下一首|切歌|听歌|换歌|下一曲)/.test(e.msg)) {
        const lastOrder = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_PICKEDSINGER`)
        const playingList = getPlayingList(e.group_id)
        // 优先级最高，若想播放其他歌单需要先停止自动歌单
        if (playingList && e.sender.user_id === playingList.initiator) {
          const listName = playingList.listName
          const listDetail = playingList.listDetail
          const timer = playingList.timer
          if (timer.timeoutId) clearTimeout(timer.timeoutId)
          let [picked, replacedList] = await getRandomOneFromPlaylist(listDetail, listName)
          await updatePlaylist(playingList.initiator, { listName, listDetail: replacedList })
          const duration = picked.dt
          const res = await avocadoShareMusic(picked, e.group_id)
          if (!res) {
            await e.reply('播放失败')
            return false
          }
          initTimer(timer, duration)
          await this.autoPlayNext()
        } else if (lastOrder) {
          e.msg = '听' + lastOrder
          await this.pickMusic(e)
        }
      } else {
        const userData = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSONGLIST`)
        const songList = JSON.parse(userData)
        if (!songList) {
          await this.reply('我还不知道你喜欢听谁的歌呢ο(=•ω＜=)ρ⌒☆\n通过 #设置歌手 告诉我吧~')
          return false
        }
        const selectedMusic = songList[Math.floor(songList.length * Math.random())]
        const song = await getMusicDetail(selectedMusic.id)
        if (song) {
          await redis.set(`AVOCADO:MUSIC_${e.sender.user_id}_PICKED`, JSON.stringify(song), { EX: 60 * 3 })
          await avocadoShareMusic(song, e.group_id || e.sender.user_id)
        }
      }
    } catch (err) {
      logger.error(err)
      return false
    }
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

  /**
   * 设置最爱歌手
   * @param e
   * @returns {Promise<boolean>}
   */
  async setSinger (e) {
    let singerName = e.msg.trim().replace(/^#?设置歌手\s*/, '')
    // 检查是否已存在同名歌手数据
    const userSinger = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`)
    if (userSinger) {
      const data = JSON.parse(userSinger)
      const uSinger = data.singerName
      if (singerName === uSinger) {
        await this.reply('设置成功')
        return true
      }
    }
    const singer = await getSingerDetail(singerName)
    if (!singer) {
      await this.reply(`找不到名为${singerName}的歌手，请检查名称是否输入完整。`)
      return false
    }
    const data = {
      singerName: singer.name,
      singerId: singer.id
    }
    await redis.set(`AVOCADO:MUSIC_${e.sender.user_id}_FAVSINGER`, JSON.stringify(data))
    const wrongSinger = await redis.get(`AVOCADO:MUSIC_WRONGSINGER_${singerName}`)
    if (!wrongSinger) {
      await this.reply('设置成功', false, { recallMsg: 2 })
      await this.reply('正在获取歌曲数据...', false, { recallMsg: 2 })
    } else {
      const sn = JSON.parse(wrongSinger).name
      await this.e.reply(`没有找到名为 ${singerName} 的歌手呢...猜测你想查询的是${sn}，即将为你获取${sn}的歌曲数据...`)
    }
    const res = await getFavList(e.sender.user_id, singer.id)
    if (res > 0) {
      await e.reply('成功了！本次共获取到' + res + '首歌曲！')
    } else {
      await e.reply('失败了！' + res)
    }
  }

  async getSingerRankingList (e) {
    const singerType = e.msg.match(/^#?(华语|中国|欧美|韩国|日本)歌手榜/)[1]
    const singerRankingList = await getSingerRankingList(e.sender.user_id, singerTypeMap[singerType])
    const text = splitArray(singerRankingList.map(item => `${item.index}: ${item.name}${item.transName ? '(' + item.transName + ')' : ''}`), 2)
    const img = await avocadoRender(text, {
      title: `${singerType}歌手榜`,
      footer: '有没有你感兴趣的歌手呢~告诉我你想听谁的歌吧~',
      renderType: 2
    })
    await this.reply(img)
    this.setContext('pickRankingSinger')
    return true
  }

  async pickRankingSinger (e) {
    if (typeof this.e.msg !== 'string') { return }
    logger.mark('pickRankingSinger: ' + this.e.msg)
    const singerType = await redis.get(`AVOCADO:MUSIC_${this.e.sender.user_id}_SINGERTYPE`)
    const list = await getSingerRankingList('', singerType)
    const reg = new RegExp(`^(0|(${list.map(item => item.index).join('|')})|(${list.map(item => item.name).join('|').replace(/\*/g, ' fuckWords ').replace(/\(/g, '（').replace(/\)/g, '）').replace(/\./g, ' ')})|(${list.map(item => item.transName).join('|').replace(/\*/g, '')}))$`)
    if (!reg.test(this.e.msg)) {
      const img = await avocadoRender(`### 没有找到 ${this.e.msg} 呢...试试其他选择吧~\n距本次会话结束还剩${refreshTimer(timer.musicCtx).leftTime}秒\n\n${await getBonkersBabble(global.God, 'native')}`)
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
        if (key === 'id') continue
        replyMsg.push([singerInfo[key]].join('').length ? `${singerMap[key]}：${singerInfo[key]}\n` : '')
      }
      const img = await avocadoRender(replyMsg.join(''), { footer: `你想不想继续了解${singerName}的热门单曲呢~` })
      if (img) await this.reply(img)
      await getSingerHotList(this.e.sender.user_id, singerName)
      this.finish('pickRankingSinger')
      this.setContext('isContinue')
      return true
    }
  }

  async getCommentsOrLyrics (e) {
    const userPicked = await redis.get(`AVOCADO:MUSIC_${e.sender.user_id}_PICKED`)
    if (!userPicked) {
      // await e.reply('你还没有点歌呢~')
      logger.warn('未能获取当前用户的点歌数据')
      return false
    }
    const musicElem = JSON.parse(userPicked)
    const obj = { hasComments: false, hasLyrics: false }
    // 判断是否有歌词或者评论
    if (musicElem?.comments) { obj.hasComments = true }
    if (musicElem?.lyrics) { obj.hasLyrics = true }
    let [a, b] = [e.msg.includes('评论') + e.msg.includes('热评'), +e.msg.includes('歌词')]
    let comments, lyrics
    if (a) {
      if (obj.hasComments) {
        comments = musicElem.comments.map(item => [`点赞数：${item[0]}\n评论内容：${item[1]}`]).join('\n\n')
        comments = await avocadoRender(comments, {
          title: `${musicElem.name} - 精选评论`,
          renderType: 1
        })
        await e.reply(comments)
      } else {
        await e.reply('该歌曲没有热门评论噢')
      }
    }
    if (b) {
      if (obj.hasLyrics) {
        lyrics = await avocadoRender(musicElem.lyrics.join(''), { title: `${musicElem.name}` })
        await e.reply(lyrics)
      } else {
        await e.reply('该歌曲没有歌词噢')
      }
    }
    return true
  }

  async sayGoodMorning () {
    if (!Config.apiKey && !Config.apiBaseUrl) {
      logger.mark('avocadoSayGoodMorning -> 未配置apiKey或apiBaseUrl, 取消本次操作')
      return false
    }
    let [greetMsg, id, name] = await getGreetMsg(105402228, 1)
    let data = { param: name, id, isRandom: false, from: 'goodMorning' }
    let song = await findSong(data)
    // 重试一次
    if (!song) {
      [greetMsg, id, name] = await getGreetMsg(105402228, 1)
      data = { param: name, id, isRandom: false, from: 'goodMorning' }
      song = await findSong(data)
    }
    let toSend = Config.initiativeGroups || []
    let img
    if (greetMsg && song) {
      let comments = song?.comments.map(item => [`🌻${item[1]}`]).join('\n\n')
      if (comments.length) {
        img = await avocadoRender(comments, { title: '🌻早上好呀🌻' })
      }
      await avocadoShareMusic(song, toSend, img, greetMsg)
    }
  }

  async sayGoodAfternoon () {
    if (!Config.apiKey && !Config.apiBaseUrl) {
      logger.mark('avocadoSayGoodAfternoon -> 未配置apiKey或apiBaseUrl, 取消本次操作')
      return false
    }
    let [greetMsg, id, name] = await getGreetMsg(2878202769, 2)
    let data = { param: name, id, isRandom: false, from: 'goodAfternoon' }
    let song = await findSong(data)
    // 重试一次
    if (!song) {
      [greetMsg, id, name] = await getGreetMsg(2878202769, 2)
      data = { param: name, id, isRandom: false, from: 'goodAfternoon' }
      song = await findSong(data)
    }
    let toSend = Config.initiativeGroups || []
    let img
    if (greetMsg && song) {
      let comments = song?.comments.map(item => [`🌊${item[1]}`]).join('\n\n')
      if (comments.length) {
        img = await avocadoRender(comments, { title: '🍴大家中午好呀！！' })
      }
      await avocadoShareMusic(song, toSend, img, greetMsg)
    }
  }

  async sayGoodnight () {
    if (!Config.apiKey && !Config.apiBaseUrl) {
      logger.mark('avocadoSayGoodnight -> 未配置apiKey或apiBaseUrl, 取消本次操作')
      return false
    }
    try {
      let [greetMsg, id, name] = await getGreetMsg(7350109521, 3)
      let data = { param: name, id, isRandom: false, from: 'goodnight' }
      let song = await findSong(data)
      if (!song) {
        [greetMsg, id, name] = await getGreetMsg(7350109521, 3)
        data = { param: name, id, isRandom: false, from: 'goodnight' }
        song = await findSong(data)
      }
      let toSend = Config.initiativeGroups || []
      let img
      if (greetMsg && song) {
        let comments = song?.comments.map(item => [`🌛${item[1]}`]).join('\n\n')
        if (comments.length) {
          img = await avocadoRender(comments, { title: '晚安😴' })
        }
        await avocadoShareMusic(song, toSend, img, greetMsg)
      }
    } catch (error) {
      logger.error(error)
    }
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
    // 每次调用刷新剩余时间
    const ctxDuration = time
    logger.mark('start ' + type + ' context')
    // 云崽的上下文是全局的，群组不做单独处理
    initTimer(timer.musicCtx, ctxDuration)
    let key = this.conKey(isGroup)
    if (!stateArr[key]) stateArr[key] = {}
    stateArr[key][type] = this.e
    // 取消之前的超时操作
    if (stateArr[key][type]) {
      clearTimeout(stateArr[key][type])
      delete stateArr[key][type]
    }
    stateArr[key][type] = this.e
    if (time) {
      /** 操作时间 */
      setTimeout(() => {
        if (stateArr[key][type]) {
          delete stateArr[key][type]
          logger.mark('finish ' + type + ' context')
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
    logger.mark('finish ' + type + ' context')
    if (stateArr[this.conKey(isGroup)] && stateArr[this.conKey(isGroup)][type]) {
      delete stateArr[this.conKey(isGroup)][type]
    }
  }
}
let stateArr = {}
let timeToSleep = false
