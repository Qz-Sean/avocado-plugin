import { generateRandomHeader, sleep } from './common.js'
import { movieKeyMap } from './const.js'

/**
 * 获取单部影片的详细信息
 * @param movieId
 * @returns {Promise<{dur: string, img: (*|number), rt: (*|(function(...[*]): *|null|undefined)|(function(...[*]): *)), ver, star: *, enm: string, src, pubDesc: (string|*), filmAlias: (string|*), photos: string, sc: (string|*), wish: (string|*), dra: string, watched: (string|*), viewable: number, diffDays: number, oriLang: (string|*), videourl: (string|*), videoName: (string|*), cat: string, id, nm: string}|boolean>}
 */
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
    let detail = {}
    Object.keys(movieKeyMap).forEach(key => {
      detail.id = movieId
      if (typeof movieDetailJson[key] !== 'undefined') {
        if (key === 'rt') {
          const releaseDate = new Date(movieDetailJson.rt)
          const now = new Date()
          const diffTime = now.getTime() - releaseDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          if (diffDays > 0) {
            detail.viewable = 1
          } else {
            detail.viewable = 0
          }
          detail.diffDays = diffDays
          detail.rt = movieDetailJson.rt
        }
        switch (key) {
          case 'dur': {
            detail.dur = movieDetailJson.dur + '分钟'
            break
          }
          case 'nm': {
            detail.nm = movieDetailJson.nm.replace(/,/g, '，')
            break
          }
          case 'enm': {
            detail.enm = movieDetailJson.enm.replace(/,/g, '，')
            break
          }
          case 'cat':{
            detail.cat = movieDetailJson.cat.replace(/,/g, '，')
            break
          }
          case 'star':{
            detail.star = movieDetailJson.star.replace(/,/g, '，')
            break
          }
          case 'dra':{
            detail.dra = movieDetailJson.dra.replace(/\s/g, '')
            break
          }
          case 'comments':{
            detail.comments = movieDetailJson.comments
            break
          }
          case 'photos':{
            detail.photos = movieDetailJson.photos.slice(0, 6)
            break
          }
          default:{
            detail[key] = movieDetailJson[key]
          }
        }
      }
    })
    detail.comments = await getMovieComments(movieId)
    logger.mark('√ Get ' + detail.nm)
    return detail
  } catch (error) {
    logger.error(error)
    return false
  }
}

export async function getHotMovieList () {
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
      await sleep(2000)
    }
    return movieInfoList
  } catch (error) {
    logger.error(error)
    return false
  }
}
export async function getMovieComments (movieId) {
  try {
    const url = `https://m.maoyan.com/review/v2/comments.json?movieId=${movieId}&userId=-1&offset=1&limit=10`
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
    const resList = (await response.json()).data.hotComments
    if (typeof resList === 'undefined') {
      logger.warn('未获取到有效评论：' + url)
      return false
    } else {
      let comments = []
      resList.forEach((item, index) => {
        const comment = {}
        comment.index = index + 1
        comment.content = item.content.replace(/\n{2,}/g, '\n')
        comment.nick = item.nick
        comment.time = item.time
        if (typeof item?.hotReply !== 'undefined' && typeof item?.hotReply?.content !== 'undefined') {
          comment.hotReply = item.hotReply.content.replace(/\n{2,}/g, '\n')
          comment.hotReplyNick = item.hotReply.nick
          comment.hotReplyTime = item.hotReply.time
        }
        comments.push(comment)
      })
      return comments
    }
  } catch (error) {
    logger.error(error)
    return false
  }
}

/**
 *
 * @returns {Promise<*[]|string|boolean>}
 * @param keyword - 关键词
 * @param userId - 用户qq
 * @param type - 类型，1：精准，2：模糊
 * @returns {Promise<*[]|string|boolean>}
 */
export async function findMovie (keyword, userId, type) {
  try {
    let resList = []
    for (let i = 0; i <= 1; i++) {
      let tempList
      // 两个接口的搜索结果不一样, 新电影接口2一般找不到
      const url = [`https://m.maoyan.com/ajax/search?kw=${keyword}&cityId=1&stype=-1`,
        `https://m.maoyan.com/searchlist/movies?keyword=${keyword}&ci=59&offset=1&limit=20`]
      const headers = generateRandomHeader()
      const options = {
        method: 'GET',
        headers
      }
      const response = await fetch(url[i], options)
      if (!response.ok) {
        logger.error('Request failed with status code', response.status)
        if (i === 0) {
          continue
        } else {
          return false
        }
      }
      const resJson = await response.json()
      if (resJson?.total && resJson.total === 0) {
        if (i === 0) {
          continue
        } else {
          return 'no related movies'
        }
      }
      tempList = i === 0 ? resJson.movies.list.filter(item => item.nm === keyword) : resJson.movies
      // 接口1若能找到完全匹配的结果储存到reslist变量中
      if (tempList.length) {
        resList = i === 0 ? tempList : resList
        // 若type=1则直接跳出循环
        if (type === 1) {
          resList = [tempList[0]]
          break
        }
      }
      // 拼接接口1的结果
      resList = resList.concat(tempList)
      // 去重
      resList = Array.from(new Set(resList.map(item => JSON.stringify(item)))).map(item => JSON.parse(item))
    }
    let roughList = []
    let mIndex = 0
    resList.forEach(item => {
      mIndex = mIndex + 1
      // 跳过非电影
      if (item.movieType !== 0 && resList.length !== 1) {
        mIndex--
        return
      }
      let movie = {}
      movie.index = mIndex
      movie.id = item.id
      movie.nm = item.nm
      movie.sc = item.sc
      movie.star = item.star
      movie.img = item.img
      roughList.push(movie)
    })
    if (!roughList.length) {
      return 'no related movies'
    }
    await redis.set(`AVOCADO:MOVIE_${userId}_SEARCH`, JSON.stringify(roughList), { EX: 60 * 6 })
    await redis.set(`AVOCADO:MOVIE_${userId}_FROM`, 'search', { EX: 60 * 6 })
    return roughList
  } catch (error) {
    logger.error(error)
    return false
  }
}

/**
 * 瞎评
 * @param movieList
 * @returns {*}
 */
export function analyseMovieList (movieList) {
  return movieList
    .filter(item => item.id)
    .map(item => {
      let sc = item.sc
      let n
      if (sc !== 0) {
        return `${item.index}.${item.nm} -> 评分: ${sc}`
      } else if (item.viewable === 1) {
        if (item.diffDays > 15) { // 十五天没出分
          n = '大概率烂片~'
        } else if (item.diffDays > 7) { // 超过七天没出分
          n = '成分复杂...'
        } else { // 七天内
          n = '是新片哦~'
        }
      } else { // 未上映
        n = '还在预售哦~'
      }
      return `${item.index}.${item.nm} -> ${n}`
    })
}
export function processMovieDetail (selectedMovie) {
  let processedMovieDetail = {}
  let trailerAndStills = []
  for (const key in movieKeyMap) {
    if (key === 'index') continue // 跳过'index'键
    const value = selectedMovie[key]
    if (!value) continue // 空值不要
    if (key === 'videoName') {
      trailerAndStills.push(`${movieKeyMap[key]}: ${value}\n\n`)
      continue
    }
    if (key === 'comments') {
      if (value && value.length) {
        processedMovieDetail[movieKeyMap[key]] = value.map(item => {
          return `${item.index}. <span class="nick">${item.nick}：</span>${item.content}${item.hotReply ? '<br><em><span><span class="reply">🗨️' + item.hotReplyNick + '：</span>' + item.hotReply + '</span></em>' : ''}`
        }).join('\n')
      }
      continue
    }
    if (key === 'videourl') {
      trailerAndStills.push(`${value}`)
      trailerAndStills.push('\n\n')
      continue
    }
    if (key === 'photos') {
      trailerAndStills.push(`${movieKeyMap[key]}: \n`)
      for (const i of value) {
        const photo = segment.image(i)
        trailerAndStills.push(photo)
      }
      continue
    }
    processedMovieDetail[movieKeyMap[key]] = value
  }
  // 渲染图片上显示的内容
  let textOnPic = Object.keys(processedMovieDetail).map(function (key) {
    if (key === '封面') return ''
    if (key === '热门评论') return '' // 暂时不显示
    return key + '：' + processedMovieDetail[key] + '\n'
  }).join('')
  return [processedMovieDetail, trailerAndStills, textOnPic]
}
