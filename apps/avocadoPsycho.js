import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { avocadoRender, generateRandomHeader, sleep } from '../utils/common.js'
import { Config } from '../utils/config.js'

let period, period1
if (Config.is24HourOnset) {
  period1 = '*'
  if (Config.onsetLatentPeriod >= 83) {
    period = '*/60'
  } else {
    if (Config.onsetLatentPeriod > 23) {
      period = '*/' + ((parseInt(Config.onsetLatentPeriod) - 23))
    } else {
      period = Math.ceil(Math.random() * 10)
      period1 = '0-23/' + Config.onsetLatentPeriod
    }
  }
} else {
  period = Math.ceil(Math.random() * 10)
  if (Config.onsetLatentPeriod > 23) {
    period1 = '7-23/23'
  } else {
    period1 = '7-23/' + Config.onsetLatentPeriod
  }
}

let cronExpression = period + ' ' + period1 + ' * * *'
// logger.info('cronExpression:', cronExpression)
export class avocadoPsycho extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => 发癫',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 6000,
      rule: [
        {
          reg: `${global.God}`,
          fnc: 'avocadoPsycho'
        }
      ]
    })
    this.task = [
      {
        // 这玩意怎么不好使啊...
        cron: cronExpression,
        // cron: '*/1 * * * *',
        name: '主动发电<(*￣▽￣*)/',
        fnc: this.sendBonkerBabble
      }
    ]
  }

  async avocadoPsycho (e) {
    if (e.msg.includes('#')) return true
    let replyMsg
    replyMsg = await getBonkersBabble(e, global.God, 'api')
    if (!replyMsg) {
      await this.e.reply('发电失败(ノへ￣、)该提醒作者更换API啦...将使用本地发电¡¡¡( •̀ ᴗ •́ )و!!!')
      await sleep(1500)
      replyMsg = await getBonkersBabble(e, global.God, 'native')
      if (!replyMsg) {
        await this.e.reply('Σ( ° △ °|||)︴ 震惊！本地发电失败！')
        return true
      }
    }
    if (Math.random() < 0.5) {
      await this.e.reply(replyMsg)
    } else {
      replyMsg = replyMsg.split('\n').map(item => '# ' + item + '\n').join('')
      const img = await avocadoRender(replyMsg, {})
      if (img) {
        await this.e.reply(img)
      }
    }
    return true
  }

  async sendBonkerBabble () {
    if (!Config.isAutoOnset) return false
    logger.warn('开始发癫...')
    let toSend = Config.initiativeGroups || []
    let prob
    for (const element of toSend) {
      if (!element) {
        continue
      }
      prob = Math.random()
      let groupId = parseInt(element)
      // 降低发癫频率...
      if (Bot.getGroupList().get(groupId)) {
        if (prob < 0.5) {
          logger.warn(groupId + '：时机未到！下次一定！')
          continue
        }
        let replyMsg = await getBonkersBabble({}, global.God, 'native')
        if (replyMsg) {
          if (Math.random() < 0.5) {
            await Bot.sendGroupMsg(groupId, replyMsg)
          } else {
            replyMsg = replyMsg.split('\n').map(item => '# ' + item + '\n').join('')
            const img = await avocadoRender(replyMsg)
            if (img) {
              await Bot.sendGroupMsg(groupId, img)
            }
          }
          await sleep(2000)
        }
      } else {
        logger.warn('机器人不在要发送的群组里，忽略群。同时建议检查配置文件修改要打招呼的群号。' + groupId)
      }
    }
  }
}

/**
 * 获取发电数据
 * @param e
 * @param {string} GodName - 关键词
 * @param {string} dataSource - 数据源
 * @param {number} wordLimit - 字数限制
 */
export async function getBonkersBabble (e = {}, GodName = '', dataSource = '', wordLimit = 0) {
  let replyMsg = ''
  let isExist
  isExist = await redis.EXISTS('AVOCADO:PSYCHOSEND')
  // 不存在则返回[], psychoData 存在 则 isExit === true
  const psychoData = await redis.lRange('AVOCADO:PSYCHODATA', 0, -1)
  if (dataSource === 'api' || dataSource === '') {
    if ((Math.round(Math.random() * 10) / 10) > 0.5) {
      replyMsg = e.msg + '！！！'
    }
    // let url = `https://xiaobapi.top/api/xb/api/onset.php?name=${GOD}`
    let url = `http://api.caonm.net/api/fab/f.php?msg=${GodName}`
    try {
      const headers = generateRandomHeader()
      const options = {
        method: 'GET',
        headers
      }
      const response = await fetch(url, options)
      if (response.status === 200) {
        let json = await response.json()
        if (json.code === 1 && json.data) {
          let filteredData = json.data.replace(new RegExp(GodName, 'g'), '<name>')
          // 判断是否存在重复元素
          if (psychoData && psychoData.includes(filteredData)) {
            logger.warn('存在重复数据，不进行插入操作')
          } else {
            let status = await redis.lPush('AVOCADO:PSYCHODATA', filteredData)
            if (status) {
              logger.warn(`已存入：${json.data}`)
            }
          }
          replyMsg = json.data
        } else {
          replyMsg = json.toString()
        }
      }
    } catch (err) {
      logger.error(err)
      return false
    }
  }
  if (replyMsg !== '') return replyMsg
  if (dataSource === 'native' || dataSource === '') {
    if (!psychoData.length) {
      return false
    }
    let r = Math.floor(Math.random() * psychoData.length)
    // logger.warn(global.randomArray)
    while (global.randomArray.includes(r)) {
      r = Math.floor(Math.random() * psychoData.length)
    }
    global.randomArray.push(r)
    if (global.randomArray.length === psychoData.length) {
      global.randomArray = []
      await redis.DEL('AVOCADO:PSYCHOSEND')
    }
    // logger.warn(r, global.randomArray)
    let flag = true
    if (wordLimit) {
      while (flag) {
        replyMsg = psychoData[r].replace(/<name>/g, GodName)
        flag = replyMsg.length > wordLimit
      }
    } else {
      replyMsg = psychoData[r].replace(/<name>/g, GodName)
    }

    if (isExist) {
      await redis.lPush('AVOCADO:PSYCHOSEND', replyMsg)
    } else {
      await redis.lPush('AVOCADO:PSYCHOSEND', replyMsg)
      await redis.EXPIRE('AVOCADO:PSYCHOSEND', 24 * 60 * 60)
    }
  }
  return replyMsg
}
