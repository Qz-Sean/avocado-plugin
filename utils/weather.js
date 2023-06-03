import fetch from 'node-fetch'
import { _puppeteer, initPuppeteer } from './common.js'

export async function weather (e, targetArea) {
  let [, province, city, district, areaID] = await getAreaInfo(this, targetArea) || ['', '', '', -1]
  if (areaID === -1) return false
  let setting = { card_weather: false }

  if (setting.card_weather) {
    try {
      let pskey = (await getPsKey('mp.qq.com'))['mp.qq.com']
      let getToken = getBKN(pskey)

      let options = {
        method: 'POST',
        headers: {
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; MI 9 Build/SKQ1.211230.001) V1_AND_SQ_8.9.8_3238_YYB_D A_8090800 QQ/8.9.8.9000 NetType/WIFI WebP/0.4.1 Pixel/1080 StatusBarHeight/75 SimpleUISwitch/0 QQTheme/1000 InMagicWin/0 StudyMode/0 CurrentMode/0 CurrentFontScale/1.0 GlobalDensityScale/0.9818182 AppId/537132847',
          'Content-Type': 'application/json',
          Cookie: `p_uin=o${Bot.uin}; p_skey=${pskey}`
        }
      }

      options.method = 'POST'
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify({
        areaID,
        isRealAdcode: false,
        allAstro: false
      })
      let url = `https://weather.mp.qq.com/cgi/home?getToken=${getToken}`

      let response = await fetch(url, options)
      let weatherInfoRes = null
      try {
        weatherInfoRes = await response.json()
        logger.warn('weatherInfoRes: ', weatherInfoRes)
      } catch (err) {
        logger.error(err)
      }
      if (!(weatherInfoRes == null || !weatherInfoRes.weather || !weatherInfoRes.weather?.adcode)) {
        let adcode = weatherInfoRes.weather.adcode
        let weather = weatherInfoRes.weather

        options.body = JSON.stringify({
          adcode
        })

        url = `https://weather.mp.qq.com/cgi/share?getToken=${getToken}`
        response = await fetch(url, options)
        let shareWeatherInfoRes = null
        try {
          shareWeatherInfoRes = await response.json()
        } catch (err) {
          logger.error(err)
        }
        if (shareWeatherInfoRes == null || shareWeatherInfoRes.code !== 0 || !shareWeatherInfoRes.data) {
          return false
        }

        let data = {
          weather,
          share_json: shareWeatherInfoRes.data
        }
        e.reply({ type: 'json', data: data.share_json })
      }
    } catch (err) {
      logger.error(err)
    }
  }

  // 待查询城市
  let attentionCity = JSON.stringify([{
    province,
    city,
    district,
    isDefault: true
  }])
  logger.warn('attentionCity:', attentionCity)
  // 截图结果
  let buff = null
  try {
    await initPuppeteer()
    const page = await _puppeteer.browser.newPage()
    await page.setViewport({
      width: 1280,
      height: 1320
    })
    await page.goto('https://tianqi.qq.com/favicon.ico', { timeout: 120000 })
    await page.evaluate(`localStorage.setItem('attentionCity', '${attentionCity}')`)// 设置默认地区信息
    await page.setRequestInterception(true)
    page.on('request', req => {
      let urls = [
        'trace.qq.com'
      ]

      let url = req.url()
      if (urls.find(val => { return url.includes(val) })) {
        req.abort()
      } else {
        req.continue()
      }
    })

    await page.goto('https://tianqi.qq.com/')
    await page.waitForTimeout(1000 * 3)

    await page.evaluate(() => {
      // 删除a标签和footer
      let elementsToRemove = document.querySelectorAll('a, #ct-footer')
      elementsToRemove.forEach(elem => {
        elem.parentNode.removeChild(elem)
      })
      // 添加插件信息
      const p = document.createElement('p')
      p.style.textAlign = 'center'
      p.style.fontSize = '20px'
      p.style.marginTop = '-30px'
      p.style.lineHeight = '20px'
      p.style.paddingBottom = '10px'
      p.textContent = 'Created By Yunzai-Bot & Avocado-Plugin'
      document.body.appendChild(p)
    })

    // 获取页面加载后的body元素，没有则返回null
    let body = await page.$('body')
    buff = await body.screenshot({
      // fullPage: true,
      type: 'jpeg',
      omitBackground: false,
      quality: 100
    })
    await page.close().catch((err) => logger.error(err))
  } catch (err) {
    logger.error(`${e.msg}图片生成失败:${err}`)
    await _puppeteer.browser.close().catch((err) => console.error(err))
  }

  return !buff ? false : buff
}

function getBKN (skey) {
  let bkn = 5381
  skey = new Buffer(skey)
  for (let v of skey) {
    bkn = bkn + (bkn << 5) + v
  }
  bkn &= 2147483647
  return bkn
}

async function getPsKey (domains) {
  if (!Array.isArray(domains)) domains = [domains]

  let body = {
    1: 4138,
    2: 0,
    3: 0,
    4: {
      1: domains
    },
    6: 'android 8.9.33'
  }
  let core = null
  try {
    core = (await import('oicq')).core
  } catch (error) {
    core = (await import('icqq').catch(() => {}))?.core
  }
  body = core.pb.encode(body)

  let payload = core.pb.decode(await Bot.sendUni('OidbSvcTcp.0x102a', body))
  if (!payload[4]) return null

  let result = core.pb.decode(payload[4].encoded)
  let list = {}
  if (!Array.isArray(result[1])) result[1] = [result[1]]
  for (let val of result[1]) {
    if (val[2]) list[val[1]] = val[2].toString()
  }
  return list
}

// areaInfoRes:  {
//   data: {
//     external: {},
//     internal: { '101240101': '江西, 南昌', '101240103': '江西, 南昌, 南昌县' },
//     tourist: { '10124010102A': '八一南昌起义纪念塔', '10124010103A': '南昌八一起义纪念馆' }
//   },
//   message: 'OK',
//       status: 200
// }
export async function getAreaInfo (e, targetArea) {
  let province = ''
  let city = ''
  let district = ''
  let areaID = -1
  let areaInfoRes = null
  let regex
  targetArea = targetArea.replace(/\s\s/g, ' ').replace(/\s\s/g, ' ')
  regex = /((.*)省)?((.*)市)?((.*)区)?/.exec(targetArea)
  if (regex[2]) { province = regex[2]; targetArea = targetArea.replace(province + '省', ' ') }
  if (regex[4]) { city = regex[4]; targetArea = targetArea.replace('市', ' ') }
  if (regex[6]) { district = regex[6]; targetArea = targetArea.replace('区', ' ') }
  logger.warn('execRegex: ', regex)
  let targetAreaList = targetArea.trim().split(' ').reverse()
  targetAreaList.push(targetArea.trim())
  logger.warn('targetAreaList: ', targetAreaList)
  for (let index in targetAreaList) {
    let value = targetAreaList[index]
    // 获取areaID接口
    let url = `https://wis.qq.com/city/matching?source=xw&city=${encodeURI(value)}`
    let response = await fetch(url) // 获取areaID列表
    try {
      areaInfoRes = await response.json()
      logger.warn('areaInfoRes: ', areaInfoRes)
    } catch (err) {
      logger.error(err)
    }
    if (areaInfoRes === null || areaInfoRes.status !== 200 || !areaInfoRes.data?.internal || areaInfoRes.data?.internal.length < 1) {
      continue
    }

    // 遍历areaInfoRes.data.internal查找对应的地区信息，并返回该地区的 ID，和后面一段作用一样，意义不明
    // internal: { '101240101': '江西, 南昌', '101240103': '江西, 南昌, 南昌县' },
    let internal = areaInfoRes.data.internal
    let keys = Object.keys(internal).reverse()
    for (let key of keys) {
      for (let i = parseInt(index) + 1; i < targetAreaList.length; i++) {
        if (internal[key].includes(targetAreaList[i]) || targetAreaList[i].includes(internal[key])) {
          areaID = key
          break
        }
      }
      if (areaID !== -1) break
    }
    if (areaID !== -1) break
  }

  // 查不到城市信息则终止
  if (areaInfoRes === null || areaInfoRes.status !== 200 || !areaInfoRes.data?.internal || areaInfoRes.data?.internal.length < 1) {
    if (e.msg.includes('#')) e.reply('没有查询到该地区的天气！', true)
    await this.reply(`没有找到${targetArea}鳄梨酱，换个鳄梨酱吧~`, e.isGroup)
    return true
  }

  // 遍历areaInfoRes.data.internal查找对应的地区信息，并返回该地区的 ID，先根据传入的 province、city、district 信息进行筛选，只处理符合条件的地区信息。
  // 并将每个符合条件的地区信息拆分成省、市、区三个部分，并将其赋值给 province、city、district 变量。
  // internal: { '101240101': '江西, 南昌', '101240103': '江西, 南昌, 南昌县' },
  let internal = areaInfoRes.data.internal
  let keys = Object.keys(internal).reverse()
  for (let key of keys) {
    let targetAreaList = internal[key].split(', ')

    if (province && !province.includes(targetAreaList[0])) {
      continue
    }

    if (city && !city.includes(targetAreaList[1])) {
      continue
    }

    if (district && !district.includes(targetAreaList[2])) {
      continue
    }

    if (targetAreaList[0]) province = targetAreaList[0]
    if (targetAreaList[1]) city = targetAreaList[1]
    if (targetAreaList[2]) district = targetAreaList[2]
    areaID = key
    break
  }

  if (areaID === -1) {
    return false
  }

  logger.warn('getAreaInfo: ', areaInfoRes, province, city, district, areaID)
  return [areaInfoRes, province, city, district, areaID]
}
