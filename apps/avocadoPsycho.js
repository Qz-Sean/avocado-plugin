import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { avocadoRender, generateArray, generateRandomHeader, sleep, syncPath } from '../utils/common.js'
import { Config } from '../utils/config.js'
import fs from 'fs'
import path from 'path'
import { initialPsychoData, pluginRoot } from '../utils/const.js'

export class AvocadoPsycho extends plugin {
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
        },
        {
          reg: '^#(关闭|打开)主动发[癫电疯]$',
          fnc: 'avocadoPsychoSwitch'
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

  async avocadoPsychoSwitch (e) {
    if (e.msg.includes('关闭')) {
      Config.isAutoOnset = false
      await e.reply('ok')
    } else {
      Config.isAutoOnset = true
      await e.reply('ok')
    }
    return true
  }

  async avocadoPsycho (e) {
    if (Config.onsetGroups.length !== 0 && !Config.onsetGroups.includes(e.group_id.toString())) return true
    if (e.msg.includes('#') || !Config.isAutoOnset) return true
    let godName
    // 内部调用
    if (!e.msg.includes(global.God)) {
      godName = e.msg
    } else {
      godName = global.God
    }
    const isApiErrorStr = await redis.get('AVOCADO_PSYCHO_ERROR')
    const apiErrorCode = isApiErrorStr ? parseInt(isApiErrorStr) : 0
    let replyMsg = ''
    if (apiErrorCode) {
      switch (apiErrorCode) {
        case 1: {
          replyMsg = await getBonkersBabble(e, godName, 'native')
          if (!replyMsg) {
            await e.reply('Σ( ° △ °|||)︴ 震惊！本地发电失败！')
            await redis.set('AVOCADO_PSYCHO_ERROR', 2, { EX: 60 * 30 })
            return false
          }
          break
        }
        // 本地发电失败！没得玩了！
        case 2: {
          return false
        }
      }
    } else {
      const res = await getBonkersBabble(e, godName, 'api')
      if (!res || res === 403) {
        let errorMsg = '发电失败(ノへ￣、)'
        if (!Config.psychoKey) {
          errorMsg += '\n((*・∀・）ゞ→→没有填写发电Key哦!'
        } else if (res === 403) {
          errorMsg += '请检查发电key是否填写正确哦！'
        } else {
          logger.mark('API无法访问...建议去提issue: https://github.com/Qz-Sean/avocado-plugin/issues')
        }
        errorMsg += '将尝试本地发电¡¡¡( •̀ ᴗ •́ )و!!! '
        await e.reply(errorMsg)
        await redis.set('AVOCADO_PSYCHO_ERROR', 1, { EX: 60 * 60 })
        await sleep(1500)
        replyMsg = await getBonkersBabble(e, godName, 'native')
        if (!replyMsg) {
          await e.reply('Σ( ° △ °|||)︴ 震惊！发电失败！')
          await redis.set('AVOCADO_PSYCHO_ERROR', 2, { EX: 60 * 60 })
          return false
        }
      } else {
        replyMsg = res
      }
    }
    if (Math.random() < 0.8) {
      await e.reply(replyMsg)
    } else {
      replyMsg = replyMsg.split('\n').map(item => '# ' + item + '\n').join('')
      const img = await avocadoRender(replyMsg, { title: null, caption: '', footer: '', renderType: 1 })
      if (img) {
        await e.reply(img)
      }
    }
    return true
  }

  async sendBonkerBabble () {
    if (!Config.isPeriodicOnset) return false
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
            const img = await avocadoRender(replyMsg, { title: null, caption: '', footer: '', renderType: 1 })
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
  const fullPath = path.join(pluginRoot, 'resources', 'json', 'psycho.json')
  syncPath(fullPath, '[]')
  let psychoData = JSON.parse(fs.readFileSync(fullPath))
  if (!psychoData.length || !Array.isArray(psychoData)) {
    psychoData = initialPsychoData
  }
  // 不存在则返回[], psychoData 存在 则 isExit === true
  if (dataSource === 'api' || dataSource === '') {
    // let url = `https://xiaobapi.top/api/xb/api/onset.php?name=${GOD}`
    let url = `https://api.caonm.net/api/fab/f?msg=${GodName}&key=${Config.psychoKey}`
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
          let filteredData = json.data.replace(new RegExp(GodName, 'g'), 'avocado')
          // 判断是否存在重复元素
          if (psychoData.length && psychoData.includes(filteredData)) {
            logger.mark('存在重复发癫数据，跳过。')
          } else {
            try {
              psychoData.push(filteredData)
              fs.writeFileSync(fullPath, JSON.stringify(psychoData, null, 2), { flag: 'w' })
            } catch (err) {
              logger.error(err)
            }
            logger.mark(`已存入发癫数据：${json.data}`)
          }
          replyMsg = json.data
        } else if (json.code === 403) {
          return 403
        }
      }
    } catch (err) {
      logger.error(err)
      return false
    }
  }
  if (dataSource === 'native' || dataSource === '') {
    if (!psychoData.length) return false
    const indices = generateArray(psychoData.length)
    let n = indices.length
    let index
    while (n > 0) {
      const r = Math.floor(Math.random() * n)
      index = indices[r]
      indices[r] = indices[n - 1]
      indices[n - 1] = index
      if (!global.hasSend.includes(index)) break
      n--
    }
    global.hasSend.push(index)
    if (global.hasSend.length >= psychoData.length) {
      global.hasSend = []
    }
    let flag = false
    if (wordLimit) {
      n = indices.length
      while (n > 0) {
        const r = Math.floor(Math.random() * n)
        index = indices[r]
        indices[r] = indices[n - 1]
        indices[n - 1] = index
        replyMsg = psychoData[index].replace(/(<name>|avocado)/g, GodName)
        flag = replyMsg.length < wordLimit
        if (flag) break
        n--
      }
    } else {
      replyMsg = psychoData[index].replace(/(<name>|avocado)/g, GodName)
    }
  }
  return replyMsg
}
