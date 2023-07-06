import { generateRandomHeader, sleep } from './common.js'

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
      nm: movieDetailJson.nm.replace(',', '，'),
      enm: movieDetailJson.enm.replace(',', '，'),
      filmAlias: movieDetailJson.filmAlias,
      rt: movieDetailJson.rt,
      viewable,
      diffDays,
      sc: movieDetailJson.sc,
      cat: movieDetailJson.cat.replace(',', '，'),
      star: movieDetailJson.star.replace(',', '，'),
      dra: movieDetailJson.dra.replace(/\s/g, ''),
      watched: movieDetailJson.watched,
      wish: movieDetailJson.wish,
      ver: movieDetailJson.ver,
      src: movieDetailJson.src,
      dur: movieDetailJson.dur + '分钟',
      oriLang: movieDetailJson.oriLang,
      pubDesc: movieDetailJson.pubDesc,
      comments: await getMovieComments(movieId),
      videoName: movieDetailJson.videoName,
      videourl: movieDetailJson.videourl,
      photos: movieDetailJson.photos.slice(0, 5)
    }
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
    const url = `https://m.maoyan.com/review/v2/comments.json?movieId=${movieId}&userId=-1&offset=1&limit=20`
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
    let comments = []
    for (const [index, item] of resJson.hotComments.entries()) {
      let comment = {}
      comment.index = index + 1
      comment.content = item.content
      comment.nick = item.nick
      comment.time = item.time
      comment.hotReply = item?.hotReply.content
      comment.hotReplyNick = item?.hotReply.nick
      comment.hotReplyTime = item?.hotReply.time
      comments.push(comment)
    }
    return comments
  } catch (error) {
    logger.error(error)
    return false
  }
}

export async function findMovie (keyword, userId) {
  try {
    const url = `https://m.maoyan.com/searchlist/movies?keyword=${keyword}&ci=59&offset=1&limit=30`
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
    const resList = (await response.json()).movies
    // logger.warn(resList)
    let roughList = []
    for (const [index, item] of resList.entries()) {
      let movie = {}
      movie.index = index + 1
      movie.id = item.id
      movie.nm = item.nm
      movie.sc = item.sc
      movie.star = item.star
      movie.img = item.img
      roughList.push(movie)
    }
    await redis.set(`AVOCADO:MOVIE_${userId}_SEARCH`, JSON.stringify(roughList), 'EX', 60 * 3)
    return roughList
  } catch (error) {
    logger.error(error)
    return false
  }
}
export function analyseMovieList (movieList) {
  return movieList
    .filter(item => item.id)
    .map(item => {
      let sc = item.sc
      let n
      if (sc !== 0) {
        return `${item.index}.${item.nm} -> 评分: ${sc}`
      } else if (item.viewable === 1) {
        if (item.diffDays > 15) {
          n = '大概率烂片~'
        } else if (item.diffDays > 7) {
          n = '成分复杂...'
        } else {
          n = '是新片哦~'
        }
      } else {
        n = '还在预售哦~'
      }
      return `${item.index}.${item.nm} -> ${n}`
    })
}
