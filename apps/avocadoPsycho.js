import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { avocadoRender, generateRandomHeader, sleep } from '../utils/common.js'
import { Config } from '../utils/config.js'

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
        cron: Math.ceil(5 + Math.random() * 15) + ' 7-23/' + Config.onsetLatentPeriod + ' * * *',
        name: '主动发电<(*￣▽￣*)/',
        fnc: this.sendBonkerBabble
      }
    ]
  }

  async avocadoPsycho (e) {
    if (e.msg.includes('#')) return true
    const isApiErrorStr = await redis.get('AVOCADO_PSYCHO_APIERROR')
    const isApiError = isApiErrorStr ? parseInt(isApiErrorStr) : 0
    let replyMsg
    if (isApiError) {
      replyMsg = false
    } else {
      replyMsg = await getBonkersBabble(e, global.God, 'api')
      if (!replyMsg) {
        await this.e.reply('发电失败(ノへ￣、)该提醒作者更换API啦...将使用本地发电¡¡¡( •̀ ᴗ •́ )و!!!')
        await redis.set('AVOCADO_PSYCHO_APIERROR', 1, { EX: 60 * 90 })
        await sleep(1500)
      }
    }
    if (isApiError === 2) {
      return false
    } else {
      replyMsg = !replyMsg ? await getBonkersBabble(e, global.God, 'native') : replyMsg
      if (!replyMsg) {
        await this.e.reply('Σ( ° △ °|||)︴ 震惊！本地发电失败！')
        await redis.set('AVOCADO_PSYCHO_APIERROR', 2, { EX: 60 * 90 })
        return false
      }
    }
    if (Math.random() < 0.5) {
      await this.e.reply(replyMsg)
    } else {
      replyMsg = replyMsg.split('\n').map(item => '# ' + item + '\n').join('')
      const img = await avocadoRender(replyMsg, { title: null, caption: '', footer: '' })
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
            const img = await avocadoRender(replyMsg, { title: null, caption: '', footer: '' })
            if (img) {
              await Bot.sendGroupMsg(groupId, img)
            }
          }
          await sleep(2000)
        }
      } else {
        logger.warn('机器人不在要发送的群组里。' + groupId)
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
          if (Math.random() > 0.8) {
            replyMsg = e.msg + '！！！'
          } else {
            replyMsg = json.data
          }
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
