import plugin from '../../../lib/plugins/plugin.js'
import { avocadoRender, makeForwardMsg, splitArray, initTimer, refreshTimer } from '../utils/common.js'
import { analyseMovieList, findMovie, getHotMovieList, getMovieDetail, processMovieDetail } from '../utils/movie.js'
import { timer } from '../utils/const.js'

export class AvocadoMovie extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => Movie',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: `^#?((${global.God}|鳄梨酱?)?#热门电影|来点好看的)$`,
          fnc: 'getHotMovies'
        },
        {
          reg: `^#?(${global.God}|鳄梨酱?)?(?:影视|搜电影)(#|%)?(.+)`,
          fnc: 'searchMovie'
        },
        {
          reg: '^#(刷新|重新获取)(电影|影片)信息$',
          fnc: 'reloadMovieInfo'
        }
      ]
    })
  }

  async reloadMovieInfo (e) {
    let movieList
    try {
      movieList = await getHotMovieList()
      await redis.set('AVOCADO:MOVIE_DETAILS', JSON.stringify(movieList))
      await redis.set('AVOCADO:MOVIE_EXPIRE', 1, { EX: 60 * 60 * 24 * 7 })
    } catch (error) {
      await e.reply(`啊哦!${error}`)
      return false
    }
    if (!movieList.length) {
      await e.reply('出错了！')
      return false
    }
    await e.reply('成功了！')
    return true
  }

  async searchMovie (e) {
    this.e = e
    const regex = new RegExp(`^#?(${global.God}|鳄梨酱?)?(?:影视|搜电影)(#|%)?(.+)`)
    const match = e.msg.match(regex)
    // 1精准 2模糊
    const type = match[2] === '%' ? 1 : 2
    const keyword = match[3]
    const resList = await findMovie(keyword, e.sender.user_id, type)
    if (resList === 'no related movies' || !resList) {
      await this.e.reply('没有找到' + keyword + '相关的影片呢~')
      return false
    }
    // 只有一条搜索结果时,直接开始上下文并发送影片信息
    if (resList.length === 1) {
      const selectedMovie = await getMovieDetail(resList[0].id)
      const [processedMovieDetail, , textOnPic] = processMovieDetail(selectedMovie)
      const img = await avocadoRender(textOnPic, {
        title: `${processedMovieDetail['封面'] ? '![img](' + processedMovieDetail['封面'] + ')' : ''}`,
        footer: `<strong><i>可继续选择影片~~<br>回复 00 获取本片剧照及预告<br>${selectedMovie?.comments ? '回复 000 获取本片热门评论<br>' : ''}回复 0 结束会话<i></strong>`,
        renderType: 3
      })
      if (img) {
        await redis.set(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`, JSON.stringify(selectedMovie), { EX: 60 * 3 })
        await this.e.reply(img)
        this.e.from = 'search'
        this.setContext('pickMe')
      } else {
        await this.e.reply('searchMovie: 图片生成出错了！')
        return false
      }
    } else {
      let processedList = resList.map(item => {
        const img = `<img src="${item.img}" alt="img">`
        return `${img}<div class="text-container"><span>${item.index}. ${item.nm}</span><br><span>主演：${item.star}</span><br><span>评分：${item.sc}</span></div>`
      })
      const img = await avocadoRender(splitArray(processedList, 2), {
        title: 'Avocado Movie Search',
        footer: `<strong><i>共搜到 '${keyword}' ${resList.length}部，你想了解哪一部影片呢~</i></strong>`,
        renderType: 2,
        width: 1920,
        height: 1080,
        transformEntity: true
      })
      this.e.from = 'search'
      await this.e.reply(img)
      this.setContext('pickMe')
    }
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
      footer: `<strong><i>最近上映的影片共有${movieList.length}部，你想了解哪一部影片呢~</i></strong>`,
      renderType: 2
    })
    await this.e.reply(img)
    this.e.from = 'hotMovies'
    this.setContext('pickMe')
  }

  async pickMe (e) {
    if (typeof this.e.msg !== 'string') return
    let movieList
    const from = e.from
    switch (from) {
      case 'search':{
        movieList = JSON.parse(await redis.get(`AVOCADO:MOVIE_${this.e.sender.user_id}_SEARCH`))
        break
      }
      case 'hotMovies':{
        movieList = JSON.parse(await redis.get('AVOCADO:MOVIE_DETAILS'))
        break
      }
    }
    const reg = new RegExp(`^((0{1,3})|(${movieList.map(item => item.index).join('|')})|(${movieList.map(item => item.nm).join('|').replace(/\*/g, ' fuck ')}))$`)
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
        let selected = await redis.get(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`)
        if (selected) {
          selected = JSON.parse(selected)
          choose = movieList.find(item => item.id === selected.id)
        } else {
          await this.reply('先告诉我你想了解的电影吧！')
          return
        }
      } else {
        choose = movieList.find(item => item.index === parseInt(this.e.msg) || item.nm === this.e.msg)
      }
      logger.mark('pickMe: ' + (choose?.index ? choose.index + '. ' + choose.nm : choose.nm))
      await this.e.reply('请稍等...', false, { recallMsg: 2 })
      let selectedMovie
      // 获取本次选择的影片详细信息
      switch (from) {
        case 'search':{
          selectedMovie = await getMovieDetail(choose.id)
          break
        }
        case 'hotMovies':{
          // 热门电影已获取所有细节信息，不用再次获取
          selectedMovie = choose
          break
        }
      }
      const [processedMovieDetail, others, textToShow] = processMovieDetail(selectedMovie)
      // 获取周边信息
      if (this.e.msg === '00') {
        await this.reply(await makeForwardMsg(this.e, [others], '鳄门🙏...'))
        await this.reply('可继续选择影片~~\n回复 000 获取本片热门评论\n回复 0 结束会话, 距本次会话结束还剩' + (refreshTimer(timer.movieCtx).leftTime) + '秒\n¡¡¡( •̀ ᴗ •́ )و!!!')
        return
      }
      // 获取评论 -> 图片形式回复
      if (this.e.msg === '000') {
        const comments = processedMovieDetail['热门评论']
        if (!comments) {
          await this.reply('未获取到热门评论！请重新选择呢。')
          return
        }
        // ...调整排版
        const img = await avocadoRender(comments, {
          title: selectedMovie.nm + '-热门评论',
          footer: `<strong><i>可继续选择影片~~<br>回复 00 获取本片剧照及预告<br>回复 0 结束此次操作, 距本次会话结束还剩${refreshTimer(timer.movieCtx).leftTime}秒<i></strong>`
        })
        await this.e.reply(img)
        return
      }
      const img = await avocadoRender(textToShow, {
        title: `${processedMovieDetail['封面'] ? '![img](' + processedMovieDetail['封面'] + ')' : ''}`,
        footer: `<strong><i>可继续选择影片~~<br>回复 00 获取本片剧照及预告<br>${selectedMovie?.comments ? '回复 000 获取本片热门评论<br>' : ''}回复 0 结束此次操作, 距本次会话结束还剩${refreshTimer(timer.movieCtx).leftTime}秒<i></strong>`,
        renderType: 3
      })
      if (img) {
        await redis.set(`AVOCADO:MOVIE_${this.e.sender.user_id}_PICKEDMOVIE`, JSON.stringify(selectedMovie), { EX: 60 * 3 })
        await this.e.reply(img)
        this.finish('pickMe')
        // 传递给下次对话
        this.e.from = from
        this.setContext('pickMe')
      } else {
        await this.e.reply('图片生成出错了！')
        this.finish('pickMe')
      }
    } catch (error) {
      await this.e.reply('pickMeError: ' + error)
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
  setContext (type, isGroup = false, time = 180) {
    // 每次调用刷新剩余时间
    const duration = time
    logger.mark('start ' + type + ' context')
    initTimer(timer.movieCtx, duration)
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
