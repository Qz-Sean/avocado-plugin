import plugin from '../../../lib/plugins/plugin.js'
import {
  avocadoRender, makeForwardMsg,
  splitArray
} from '../utils/common.js'
import { analyseMovieList, findMovie, getHotMovieList, getMovieDetail } from '../utils/movie.js'
import { movieKeyMap } from '../utils/const.js'
import { segment } from 'icqq'

export class AvocadoPsycho extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => Movie',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: `^#?((${global.God}|鳄梨酱)?#热门电影|来点好看的)$`,
          fnc: 'getHotMovies'
        },
        {
          reg: `^#?(${global.God}|鳄梨酱)?#搜索电影(.+)`,
          fnc: 'searchMovie'
        }
      ]
    })
  }

  async searchMovie (e) {
    this.e = e
    const regex = new RegExp(`^#?(${global.God}|鳄梨酱)?#搜索电影(.+)`)
    const keyword = e.msg.match(regex)[2]
    const resList = await findMovie(keyword, e.sender.user_id)
    let processList = resList.map(item => {
      const img = `<img src="${item.img}" alt="img">`
      return `${img}${item.index}.${item.nm}`
    })
    const img = await avocadoRender(splitArray(processList, 2), {
      title: 'Avocado Movie Search',
      caption: '',
      footer: `<strong><i>共搜到 '${keyword}' ${resList.length}部，你想了解哪一部影片呢~</i></strong>`,
      renderType: 2
    })
    this.e.from = 'search'
    await this.e.reply(img)
    this.setContext('pickMe')
  }

  async getHotMovies (e) {
    let movieList
    this.e = e
    if (await redis.get('AVOCADO:MOVIE_EXPIRE')) {
      movieList = JSON.parse(await redis.get('AVOCADO:MOVIE_DETAILS'))
    } else {
      await this.e.reply('更新数据中...此过程需要较长时间，请稍等...')
      try {
        movieList = await getHotMovieList()
        await redis.set('AVOCADO:MOVIE_DETAILS', JSON.stringify(movieList))
        await redis.set('AVOCADO:MOVIE_EXPIRE', 1, { EX: 60 * 60 * 24 * 7 })
      } catch (error) {
        this.e.reply(`啊哦!${error}`)
        return false
      }
    }
    if (!movieList.length) {
      await this.e.reply('出错了！')
      return false
    }
    let analyzedList = analyseMovieList(movieList)
    const img = await avocadoRender(splitArray(analyzedList, 2), {
      title: '热映电影',
      caption: '',
      footer: `<strong><i>最近上映的影片共有${movieList.length}部，你想了解哪一部影片呢~</i></strong>`,
      renderType: 2
    })
    await this.e.reply(img)
    this.e.from = 'hotMovies'
    this.setContext('pickMe')
  }

  async pickMe (e) {
    if (typeof this.e.msg !== 'string') return
    let mainInfoList
    logger.warn(e.from)
    switch (e.from) {
      case 'search':{
        mainInfoList = JSON.parse(await redis.get(`AVOCADO:MOVIE_${this.e.sender.user_id}_SEARCH`))
        break
      }
      case 'hotMovies':{
        mainInfoList = JSON.parse(await redis.get('AVOCADO:MOVIE_DETAILS'))
        break
      }
    }
    const reg = new RegExp(`^((0{1,2})|(${mainInfoList.map(item => item.index).join('|')})|(${mainInfoList.map(item => item.nm).join('|').replace(/\*/g, ' fuck ')}))$`)
    if (!reg.test(this.e.msg)) { return }
    if (this.e.msg === '0') {
      await redis.del(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`)
      await this.reply(`${global.God}！！！`)
      this.finish('pickMe')
      return true
    }
    let choose
    try {
      if (this.e.msg === '00' || this.e.msg === '000') {
        // 获取上次选择的查影片
        const selected = await redis.get(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`)
        if (selected) {
          choose = mainInfoList.find(item => item.index === selected.index)
        } else {
          await this.reply('先告诉我你想了解的电影吧！')
          return
        }
      } else {
        choose = mainInfoList.find(item => item.index === parseInt(this.e.msg) || item.nm === this.e.msg)
      }
      logger.mark('pickMe: ' + choose.index + '. ' + choose.nm)
      await this.e.reply('请稍等...', false, { recallMsg: 2 })
      let selectedMovie = await getMovieDetail(choose.id)
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
      // 获取周边信息
      if (this.e.msg === '00') {
        await this.reply(await makeForwardMsg(this.e, [others], '鳄门🙏...'))
        await this.reply('可继续选择影片~~\n回复 0 结束此次操作\n¡¡¡( •̀ ᴗ •́ )و!!!')
        return
      }
      // 获取评论 -> 图片形式回复
      if (this.e.msg === '000') {
        const comments = selectedMovie.comments
        // ...调整排版
        const img = await avocadoRender(comments, {
          title: selectedMovie.nm + '-热门评论',
          caption: '',
          footer: '<strong><i>可继续选择影片~~<br>回复 00 获取本片剧照及预告<br>回复 000 获取本片热门评论<br>回复 0 结束此次操作\n¡¡¡( •̀ ᴗ •́ )و!!!<i></strong>',
          renderType: 1
        })
        await this.e.reply(img)
        return
      }
      const img = await avocadoRender(str, {
        title: `![img](${transformedMoviesDetails['封面']})`,
        caption: '',
        footer: '<strong><i>可继续选择影片~~<br>回复 00 获取本片剧照及预告<br>回复 000 获取本片热门评论<br>回复 0 结束此次操作\n¡¡¡( •̀ ᴗ •́ )و!!!<i></strong>',
        renderType: 3
      })
      if (img) {
        await redis.set(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`, selectedMovie, { EX: 60 * 3 })
        await this.reply(img)
      } else {
        await this.e.reply('图片生成出错了！')
        this.finish('pickMe')
      }
    } catch (error) {
      await this.e.reply(error)
      this.finish('pickMe')
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
    logger.mark('start ' + type + ' context')
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
    logger.mark('finish ' + type + ' context')
    if (stateArr[this.conKey(isGroup)] && stateArr[this.conKey(isGroup)][type]) {
      delete stateArr[this.conKey(isGroup)][type]
    }
  }
}
let stateArr = {}
