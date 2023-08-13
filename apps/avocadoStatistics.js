import plugin from '../../../lib/plugins/plugin.js'
import {
  avocadoRender,
  delAnnounce,
  getCurrentTime,
  initTimer,
  refreshTimer,
  setAnnounce,
  sleep
} from '../utils/common.js'
import { timer } from '../utils/const.js'

import { v4 as uuidV4 } from 'uuid'
import { getBonkersBabble } from './avocadoPsycho.js'
import { Config } from '../utils/config.js'

export class AvocadoStatistics extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => 投票|接龙',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 10,
      rule: [
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?(接龙|投票)帮助$`,
          fnc: 'help'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?发起?(全局)?(接龙|(匿名)?投票)(.*)`,
          fnc: 'beginEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?(全局)?(接龙|投票)(.*)`,
          fnc: 'joinEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?取消(全局)?(接龙|投票)`,
          fnc: 'cancelEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?结束(全局)?(接龙|投票)`,
          fnc: 'endEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?(?:查看)?(全局)?(接龙|投票)[:：]?(.*)(数据|情况|进度)$`,
          fnc: 'checkEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?(查看|删除)?(?:所有|全局)?历史(接龙|投票)(-?\\d*)`,
          fnc: 'adminHistory'
        }
      ]
    })
    // 存在感up
    // 慎用，小心被踢，最好提前与管理沟通
    this.task = [
      {
        cron: '*/39 * * * *',
        // cron: '*/1 * * * *',
        name: 'sendStatisticsProgress',
        fnc: this.sendStatisticsProgress
      }
    ]
  }

  // todo 控制推送间隔
  // todo edited 14：38 8/9

  async sendStatisticsProgress () {
    if (!Config.statisticsPush) return false
    const hour = new Date().getHours()
    const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
    const globalEvents = await getCurrentEvents('global')
    const e = {
      internalCall: true,
      isGlobalAction: false,
      statisticalType: '',
      specificOption: '',
      isSenderAdmin: true,
      isMaster: true,
      statisticEvent: {},
      targetGroup: null
    }
    if (hour >= 7) {
      const m = new AvocadoStatistics()
      if (globalEvents.length) {
        e.isGlobalAction = true
        // 可能同时存在全局接龙与投票
        for (const statisticEvent of globalEvents) {
          e.statisticalType = statisticEvent.type
          e.statisticEvent = statisticEvent
          const replyMsg = `查询到未完成全局${statisticEvent.type}：${statisticEvent.topic}\n可通过 #全局${statisticEvent.type} xxx 参与${statisticEvent.type}`
          for (const groupId of groupIds) {
            e.targetGroup = groupId
            await Bot.sendGroupMsg(groupId, replyMsg)
            await m.checkEvent(e)
          }
        }
      }
      for (const groupId of groupIds) {
        const currentEvents = await getCurrentEvents('group', groupId)
        for (const statisticEvent of currentEvents) {
          e.targetGroup = groupId
          e.statisticalType = statisticEvent.type
          e.statisticEvent = statisticEvent
          const replyMsg = `查询到未完成${statisticEvent.type}：${statisticEvent.topic}\n可通过 #${statisticEvent.type} xxx 参与${statisticEvent.type}`
          await Bot.sendGroupMsg(groupId, replyMsg)
          await m.checkEvent(e)
        }
      }
    }
  }

  async help (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(接龙|投票)帮助`)
    const type = e.msg.match(regex)[1]
    const msg = ` #### 注意：管理功能只对管理员开放
#发起${type} xxx → 需指定接龙/投票主题，如需按照给出选项${type}，选项间用#隔开
> 例如： 
> 1. #发起${type} 打卡情况 
> 2. #发起${type} 打卡#已打卡#请假

#${type} xxx → 参与${type}

#查看${type}情况

#查看${type}xxx情况 → 可指定特定子项目查看
> 例如：#查看${type}请假情况

#取消${type} → 由${type}发起者取消

#结束${type} → ${type}数据将会储存在数据库中

#发起匿名投票 xxx → 发起投票可指定是否匿名

#查看历史${type} → 查看本群过往数据
`
    await e.reply(await avocadoRender(msg))
    // const b = [{ status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '接龙', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '打卡情况' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '钢铁侠', displayMsg: '☐ way.out 钢铁侠 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '蜘蛛侠', displayMsg: '1234 蜘蛛侠 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: true, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['钢铁侠', '蜘蛛侠'], topic: '最喜欢的漫威电影角色？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '超人', displayMsg: '☐ way.out 超人 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '最喜欢的DC电影角色？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '打卡', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '今天的天气如何？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '美国队长', displayMsg: '☐ way.out 美国队长 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '黑寡妇', displayMsg: '1234 黑寡妇 √8月2日 8:46' }, { qq: 3456059137, name: '5678', description: '雷神', displayMsg: '5678 雷神 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: true, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['美国队长', '黑寡妇', '雷神'], topic: '最喜欢的复仇者联盟成员？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '蝙蝠侠', displayMsg: '☐ way.out 蝙蝠侠 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '神奇女侠', displayMsg: '1234 神奇女侠 √8月2日 8:46' }, { qq: 3456059137, name: '5678', description: '闪电侠', displayMsg: '5678 闪电侠 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['蝙蝠侠', '神奇女侠', '闪电侠'], topic: '最喜欢的正义联盟成员？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '打卡', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '今天吃了什么？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '绿巨人', displayMsg: '☐ way.out 绿巨人 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '黑豹', displayMsg: '1234 黑豹 √8月2日 8:46' }, { qq: 3456059137, name: '5678', description: '美国队长', displayMsg: '5678 美国队长 √8月2日 8:46' }, { qq: 4568059137, name: '9101', description: '钢铁侠', displayMsg: '9101 钢铁侠 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: true, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['绿巨人', '黑豹', '美国队长', '钢铁侠'], topic: '最喜欢的复仇者联盟成员？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '打卡', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '今天心情如何？' }]
    // await redis.del('AVOCADO:STATISTICS_HISTORY')
    // for (const i of b) {
    //   await redis.rPush('AVOCADO:STATISTICS_HISTORY', JSON.stringify(i))
    // }

    return true
  }

  // todo
  //  1. redis存储 => 过往数据查看 done
  //  2. 多群调用 done
  //  2.1. 主人可在任意位置查看并管理所有事件
  //  3. 接入chatgpt-plugin
  //  4. 设置截止时间
  //  5. 全局事件 → 即在机器人所在所有群发起事件 done
  //  6. 同时存在多个事件 done
  async beginEvent (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?发起(全局)?(接龙|(匿名)?投票)(.*)`)
    const match = e.msg.match(regex)
    const isGlobalAction = !!match[1] || false
    const topic = match[4] ? !match[4].includes('#') ? match[4] : match[4].split('#')[0] : null
    const isAnonymity = !!match[3] || false
    const statisticalType = match[2] === '接龙' ? '接龙' : '投票'
    const initiator = Bot.pickMember(e.group_id, e.sender.user_id)
    const isInitiatorAdmin = initiator.is_admin // 只有管理员可发起
    let options = match[4] ? match[4].split('#').slice(1) : []
    if (!e.isGroup && !isGlobalAction) {
      await e.reply('请在群聊中使用本指令！', false, { recallMsg: 10 })
      return false
    }
    if (!isInitiatorAdmin) {
      await e.reply(`只有管理员能发起${statisticalType}！`)
      return false
    }
    if (isGlobalAction) {
      if (!e.isMaster) return false
      const globalEvent = await getCurrentEvents('global', null, statisticalType)
      if (globalEvent) {
        e.reply(`已存在${statisticalType}：${globalEvent.topic} \n参与人数：${globalEvent.arr.length}人\n可回复 #查看${statisticalType}进度 查看详情`)
        return false
      }
    }
    const currentEvent = await getCurrentEvents('group', e.group_id, statisticalType)
    // logger.warn(currentEvent)
    if (currentEvent) {
      e.reply(`已存在${statisticalType}：${currentEvent.topic} \n参与人数：${currentEvent.arr.length}人\n可回复 #查看${statisticalType}进度 查看详情`)
      return false
    }

    const statisticEvent = { status: false, arr: [] }

    // 不满足发起事件的情况
    if (!topic) {
      await e.reply(`请给出${statisticalType}主题！`)
      return false
    }
    // 投票没有选项
    if (statisticalType === '投票') {
      if (!options.length) {
        await e.reply('请给出投票选项！')
        return false
      } else if (options.length < 2) {
        await e.reply('请给出至少两个选项！')
        return false
      } else if ([...new Set(options)].length < options.length) {
        await e.reply('存在重复选项！')
        return false
      }
    }
    const isBotAdmin = Bot.pickMember(statisticEvent?.createGroup || e.group_id, Bot.uin).is_admin
    options = options.length
      ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, options.length).reduce((acc, letter, index) => {
        acc[letter] = options[index]
        return acc
      }, {})
      : {}
    // logger.warn(options)
    statisticEvent.isGlobalEvent = isGlobalAction
    statisticEvent.type = statisticalType
    statisticEvent.initiator = e.sender.user_id
    statisticEvent.isAnonymity = isAnonymity
    statisticEvent.createData = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    statisticEvent.createGroup = e.group_id
    statisticEvent.options = options
    statisticEvent.topic = topic
    statisticEvent.id = uuidV4()
    if (isGlobalAction) {
      const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
      for (const groupId of groupIds) {
        await Bot.sendGroupMsg(groupId, `发起了群${isGlobalAction ? '全局' : ''}${statisticalType}：${statisticEvent.topic}${Object.keys(options).length ? '\n' + Object.keys(options).map(key => key + '：' + options[key]).join('\n') + '\n' : '\n'}可通过 #${isGlobalAction ? '全局' : ''}${statisticalType} xxx 参与！`)
      }
    } else {
      // 修改事件标志位
      if (isBotAdmin) {
        await setAnnounce(
          e.group_id,
                `管理员${e.sender.card || e.sender.nickname}已发起群${statisticalType}：${topic}${Object.keys(options).length ? '\n' + Object.keys(options).map(key => key + '：' + options[key]).join('\n') + '\n' : ''}`,
                e.bot ?? Bot
        )
      }
      // 推送初始信息
      await e.reply(`群${statisticalType}：${topic}${Object.keys(options).length ? '\n' + Object.keys(options).map(key => key + '：' + options[key]).join('\n') + '\n' : '\n1.'}`)
    }
    // logger.warn(statisticEvent)
    statisticEvent.status = true
    await saveStatisticalData(e.group_id, statisticEvent, isGlobalAction)
  }

  async joinEvent (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(全局)?(接龙|投票)(.*)`)
    const match = e.msg.match(regex)
    const statisticalType = match[2] === '接龙' ? '接龙' : '投票'
    const isGlobalAction = !!match[1]
    const userInput = match[3] ? match[3].trim() : false
    const currentEvent = isGlobalAction
      ? await getCurrentEvents('global', null, statisticalType)
      : await getCurrentEvents('group', e.group_id, statisticalType)
    if (!currentEvent) {
      await e.reply(`当前不存在${isGlobalAction ? '全局' : ''}${statisticalType}！`)
      return false
    }
    if (!e.isGroup && !!currentEvent.isAnonymity) {
      await e.reply('请在群聊中使用本指令！', false, { recallMsg: 10 })
      return false
    }
    // 只有投票事件能开启匿名
    if (currentEvent.isAnonymity) {
      if (e.isGroup) {
        await e.reply('本次投票为匿名投票，请私聊发送投票结果！', false, { recallMsg: 10 })
        return false
      } else if (e.isPrivate) {
        if (!isGlobalAction) {
          // 忽略非群成员投票
          const isGroupMember = !!(Bot.pickMember(
            currentEvent?.createGroup || e.group_id,
            e.sender.user_id))?.info
          if (!isGroupMember) return false
        }
      }
    }
    // 非匿名投票 => 群内投票/接龙，只能在发起群进行，其他false
    if (!currentEvent.isGlobalEvent && !currentEvent.isAnonymity && (e.isPrivate || e.group_id !== currentEvent.createGroup)) return false
    const time = getCurrentTime()
    const previousData = currentEvent.arr.find(item => item?.qq === e.sender.user_id)
    let description = ''
    let userOption = ''
    // 处理默认项
    const optionsArr = Object.keys(currentEvent.options).map(key => key + '：' + currentEvent.options[key])
    if (!userInput) {
      if (optionsArr.length) {
        description = statisticalType === '投票' ? 'A' : currentEvent.options.A
      } else {
        description = '🙂'
      }
    } else {
      const inputKey = Object.keys(currentEvent.options).find(key => key === userInput.toUpperCase())
      const inputValue = Object.values(currentEvent.options).find(value => value === userInput)
      if (currentEvent.options.length && (!inputKey || !inputValue)) {
        await e.reply('请使用给定选项！' + optionsArr.join('\n'), false, { recallMsg: 10 })
        return false
      } else {
        if (optionsArr.length) {
          if (inputKey) {
            userOption = inputKey
            if (statisticalType === '投票') {
              description = inputKey
            } else {
              description = currentEvent.options[inputKey]
            }
          } else {
            if (statisticalType === '投票') {
              userOption = description = Object.keys(currentEvent.options).find(key => currentEvent.options[key] === inputValue)
            } else {
              description = inputValue
              userOption = Object.keys(currentEvent.options).find(key => currentEvent.options[key] === inputValue)
            }
          }
        } else {
          description = userInput
        }
      }
    }
    const newData = {
      qq: e.sender.user_id,
      name: e.sender.card || e.sender.nickname,
      time,
      userOption,
      description,
      // displayMsg: `${e.sender.card || e.sender.nickname} ${description} √${time}`
      displayMsg: `${e.sender.card || e.sender.nickname}&nbsp;&nbsp;&nbsp;&nbsp;🙋‍♂️${description}&nbsp;&nbsp;&nbsp;&nbsp;📆${time}`
    }
    // 参与者可修改之前的备注信息,投票不可
    if (previousData) {
      if (statisticalType === '投票') {
        await e.reply('你已投票！', false, { recallMsg: 30 })
        return false
      }
      const dataIndex = currentEvent.arr.indexOf(previousData)
      currentEvent.arr[dataIndex] = newData
    } else {
      currentEvent.arr.push(newData)
    }
    if (statisticalType === '投票') {
      await e.reply('投票成功！', false, { recallMsg: 30 })
    } else {
      const initiator = await Bot.pickMember(e.group_id, currentEvent.initiator)
      const isInitiatorExist = !!initiator.info // 判断发起人是否在当前群聊中
      let formatOptions = ''
      Object.entries(currentEvent.options).forEach(([key, value]) => {
        formatOptions += `\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**${key}：${value}**`
      })
      const msg = '### 群' + statisticalType + '：' + currentEvent.topic + '\n' +
          '#### 🤚发起人：' + (isInitiatorExist
        ? initiator.card
          ? initiator.card + '(' + currentEvent.initiator + ')'
          : initiator.nickname + '(' + currentEvent.initiator + ')'
        : currentEvent.initiator
      ) + '\n' +
          (optionsArr.length ? '#### 👁️‍🗨️限定选项：' + formatOptions + '\n' : '') +
          currentEvent.arr.map((item, index) => { return `##### 🥑${index + 1}F → ${item.displayMsg}` }).join('\n')
      await e.reply(await avocadoRender(msg))
    }
    await saveStatisticalData(e.group_id, currentEvent, isGlobalAction)
    return true
  }

  async cancelEvent (e) {
    if (!e.isGroup) return false
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?取消(全局)?(接龙|投票)$`)
    const match = e.msg.match(regex)
    const isGlobalAction = !!match[1]
    const statisticalType = match[2]
    const sender = Bot.pickMember(e.group_id, e.sender.user_id)
    const isSenderAdmin = sender.is_admin
    if (!isSenderAdmin || !e.isMaster) return false
    const currentEvent = isGlobalAction
      ? await getCurrentEvents('global', null, statisticalType)
      : await getCurrentEvents('group', e.group_id, statisticalType)
    if (!currentEvent) {
      await e.reply(`当前不存在${isGlobalAction ? '全局' : ''}${statisticalType}！`)
      return false
    }
    // 取消接龙/投票 -> 管理原取消
    let replyMsg = '已取消' + statisticalType + '：' + currentEvent.topic + '！'
    if (isGlobalAction && e.isMaster) {
      const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
      for (const groupId of groupIds) {
        await Bot.sendGroupMsg(groupId, replyMsg)
      }
      await delStatisticalData(currentEvent.id, isGlobalAction)
    } else {
      if (e.group_id === currentEvent.createGroup) {
        const bot = Bot.pickMember(
          currentEvent.createGroup || e.group_id,
          Bot.uin)
        const isBotAdmin = bot.is_admin
        if (isBotAdmin) {
          await delAnnounce(currentEvent.createGroup, 1, e.bot ?? Bot)
        }
        await delStatisticalData(currentEvent.id, isGlobalAction)
        await e.reply(replyMsg)
        return true
      } else {
        await e.reply('🚫')
        return false
      }
    }
  }

  // todo 1. 全局事件结束时，上下文的bug done => 不开启上下文，只发送结果 done
  // 结束接龙/投票
  // 只有发起者|master可结束
  async endEvent (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?结束(全局)?(接龙|投票)$`)
    const match = e.msg.match(regex)
    const isGlobalAction = !!match[1]
    const statisticalType = match[2]
    const sender = Bot.pickMember(e.group_id, e.sender.user_id)
    const isSenderAdmin = sender.is_admin
    if (!isSenderAdmin || !e.isMaster) return false
    const currentEvent = isGlobalAction
      ? await getCurrentEvents('global', null, statisticalType)
      : await getCurrentEvents('group', e.group_id, statisticalType)
    if (!currentEvent) {
      await e.reply(`当前不存在${isGlobalAction ? '全局' : ''}${statisticalType}！`)
      return false
    }
    currentEvent.status = false
    await saveStatisticalData(e.group_id, currentEvent, isGlobalAction)
    if (isGlobalAction && e.isMaster) {
      let replyMsg = '### 群' + statisticalType + '：' + currentEvent.topic
      replyMsg += '\n#### 🤚发起人：' + (
        currentEvent.initiator.card
          ? currentEvent.initiator.card + '(' + currentEvent.initiator.info.user_id + ')'
          : currentEvent.initiator
      )
      replyMsg += `${currentEvent.type === '投票' ? ('\n#### 👁️‍🗨️是否为匿名投票：' + (currentEvent.isAnonymity ? '是' : '否')) : ''}`
      let formatOptions = ''
      Object.entries(currentEvent.options).forEach(([key, value]) => {
        formatOptions += `\n&nbsp;&nbsp;&nbsp;&nbsp;**${key}：${value}**`
      })
      replyMsg += (Object.keys(currentEvent.options).length ? '\n#### ⚠️限定选项：' + formatOptions : '')
      replyMsg += '\n#### ✅参与人数：' + currentEvent.arr.length + ' 人'
      const summary = getSummary(currentEvent)
      for (const [key, value] of summary.numCount) {
        replyMsg += `\n&nbsp;&nbsp;&nbsp;&nbsp;**🙋‍♂️${key}：${value} 人**`
      }
      const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
      const img = await avocadoRender(replyMsg)
      for (const groupId of groupIds) {
        let text = '已结束' + (isGlobalAction ? '全局' : '') + statisticalType + '：' + currentEvent.topic
        await Bot.sendGroupMsg(groupId, [text, '\n', img])
      }
    } else {
      if (e.group_id === currentEvent.createGroup) {
        const bot = Bot.pickMember(
          currentEvent?.createGroup || e.group_id,
          Bot.uin)
        const isBotAdmin = bot.is_admin
        await e.reply('正在统计' + statisticalType + '信息...')
        await sleep(1000)
        e.msg = '#查看历史' + statisticalType + '-1'
        e.obj = currentEvent
        await this.adminHistory(e)
        if (isBotAdmin) {
          await delAnnounce(e.group_id, 1, e.bot ?? Bot)
        }
        return true
      } else {
        await e.reply('🚫')
        return false
      }
    }
  }

  async checkEvent (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(?:查看)?(全局)?(接龙|投票)[:；]?(.*)(数据|情况|进度)$`)
    const match = e?.internalCall ? ['', e.isGlobalAction, e.statisticalType, e.specificOption] : e.msg.match(regex)
    if (match === null) return false
    const isGlobalAction = !!match[1]
    const statisticalType = match[2]
    const specificOption = match[3] || null
    const isSenderAdmin = e?.internalCall ? e.isSenderAdmin : Bot.pickMember(e.group_id, e.sender.user_id).is_admin
    if (!isSenderAdmin || !e.isMaster) return false
    const currentEvent = e?.internalCall
      ? e.statisticEvent
      : isGlobalAction
        ? await getCurrentEvents('global', null, statisticalType)
        : await getCurrentEvents('group', e.group_id, statisticalType)
    if (!currentEvent) {
      await e.reply(`当前不存在${isGlobalAction ? '全局' : ''}${statisticalType}！`)
      return false
    }
    if (statisticalType === '投票' && currentEvent.isAnonymity) {
      await e.reply('匿名投票不可查看！')
      return false
    }
    const summary = getSummary(currentEvent)
    // todo 为统计列表添加序号，并可通过序号查看对应结果对应成员 done
    if (specificOption) {
      const regex1 = new RegExp(`${[...summary.numCount].map(([key, value]) => key).join('|')}`)
      const regex2 = new RegExp(`${[...summary.numCount].map((item, index) => { return index + 1 }).join('|')}`)
      let nameList, subTypeName, inputSubType, inputIndex
      if (regex1.test(specificOption)) {
        inputSubType = specificOption
      } else if (regex2.test(specificOption)) {
        inputIndex = specificOption
      } else {
        await e.reply('？')
        return false
      }
      if (inputSubType) {
        nameList = summary.nameCount.get(inputSubType)
      } else {
        const targetEntry = [...summary.nameCount].find((item, i) => (i + 1) + '' === inputIndex)
        subTypeName = targetEntry[0]
        nameList = targetEntry[1]
        // logger.warn(targetEntry, subTypeName, nameList)
      }
      // logger.warn(specificOption)
      const replyMsg = nameList.length
        ? `##### 🙋‍♂️${inputSubType || subTypeName}：${nameList.join('、')}`
        : `### 没有人选择 ${inputSubType} 呢~\n${await getBonkersBabble(global.God, 'native', 80)}`
      await e.reply(
        await avocadoRender(replyMsg)
      )
      return true
    }

    const initiator = Bot.pickMember(e?.targetGroup ? e.targetGroup : currentEvent.createGroup, currentEvent.initiator)
    const isInitiatorExist = !!initiator.info
    let replyMsg = '### 群' + statisticalType + '：' + currentEvent.topic
    replyMsg += '\n#### 🤚发起人：' + (
      isInitiatorExist
        ? initiator.card
          ? initiator.card + '(' + currentEvent.initiator + ')'
          : initiator.nickname + '(' + currentEvent.initiator + ')'
        : currentEvent.initiator
    )
    replyMsg += `${currentEvent.type === '投票' ? ('\n#### 👁️‍🗨️是否为匿名投票：' + (currentEvent.isAnonymity ? '是' : '否')) : ''}`
    let formatOptions = ''
    Object.entries(currentEvent.options).forEach(([key, value]) => {
      formatOptions += `\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**${key}：${value}**`
    })
    replyMsg += (Object.keys(currentEvent.options).length ? '\n**⚠️限定选项：**' + formatOptions + '\n' : '')
    replyMsg += '\n#### ✅参与人数：' + currentEvent.arr.length + ' 人'
    const arr = [...summary.numCount]
    arr.forEach((entry, index) => {
      const [key, value] = entry
      replyMsg += `\n&nbsp;&nbsp;&nbsp;&nbsp;**🥑Opt.${index + 1}&nbsp;&nbsp;&nbsp;🙋‍♂️${key}：${value} 人**`
    })
    if (e?.internalCall) {
      await Bot.sendGroupMsg(e.targetGroup, await avocadoRender(replyMsg))
    } else {
      await e.reply(await avocadoRender(replyMsg))
    }
    return true
  }

  // todo
  //  1. 形式： 图片显示 done
  //  2. 内容： 序号：时间 -> 主题 ... 序号：时间 -> 主题 done
  //  3. 查看： 通过序号查看详情 done
  //  4. regex =》 优化。支持分类查看管理 全局|所有群聊|当前群聊 事件，默认当前 done

  async adminHistory (e) {
    let picked = ''
    let dataToProcess = ''
    let statisticsArr = []
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(查看|删除)?(?:所有|全局)?历史(接龙|投票)(-?\\d*)`)
    const match = e.msg.match(regex)
    let [isDel, statisticalType, order] = [match[1] ? match[1] === '删除' : false, match[2], match[3] ? parseInt(match[3]) : null]
    let isAdminGlobalHistory = e.msg.includes('全局')
    let isAdminAllNoneGlobalHistory = e.msg.includes('所有')
    let isOutOfList = false
    if (e?.obj) {
      dataToProcess = e.obj
    } else {
      const sender = Bot.pickMember(e.group_id, e.sender.user_id)
      const isSenderAdmin = sender.is_admin
      if (!e.isGroup) return false
      if (!isSenderAdmin || !e.isMaster) return false
      if (!e.isMaster && isAdminAllNoneGlobalHistory) return false
      if (isAdminGlobalHistory) {
        dataToProcess = await getHistoryStatisticalData('global', null, statisticalType)
      } else {
        statisticsArr = await getHistoryStatisticalData(isAdminAllNoneGlobalHistory ? 'groups' : 'group', e.group_id, statisticalType)
        dataToProcess = isAdminAllNoneGlobalHistory ? statisticsArr : statisticsArr.filter(item => item.createGroup === e.group_id)
      }
      logger.warn('admin => ', dataToProcess)
      if (dataToProcess.length === 0) {
        await e.reply('未找到' + '历史' + statisticalType + '！')
        return false
      }
      isOutOfList = order !== -1 && (order > dataToProcess.length && order < 1)
    }
    if (dataToProcess) {
      try {
        if (!Array.isArray(dataToProcess)) {
          picked = dataToProcess
        }
        // 直接查看某项数据, -1则查看最新投票/接龙
        if (order && !isOutOfList) {
          if (!picked) picked = order === -1 ? dataToProcess[dataToProcess.length - 1] : dataToProcess[order - 1]
          if (isDel && e.isMaster) {
            const res = await delStatisticalData(picked.id, isAdminGlobalHistory)
            if (res) {
              await e.reply('删除成功！')
              e.msg = '#查看' +
                  (isAdminGlobalHistory ? '全局' : '') +
                  (isAdminAllNoneGlobalHistory ? '所有' : '') +
                  '历史' +
                  statisticalType
              await this.adminHistory(e)
              return true
            } else {
              await e.reply('删除失败！')
              return false
            }
          }
          // 非匿名则开启上下文
          if (!picked.isAnonymity) {
            e.picked = picked
            this.setContext('getDetail')
          }
          const summary = getSummary(picked)
          let formatOptions = ''
          let analysisResult = `**✅共${picked.arr.length}人参与${picked.type}**`
          const arr = [...summary.numCount]
          arr.forEach((entry, index) => {
            const [key, value] = entry
            analysisResult += `\n&nbsp;&nbsp;&nbsp;&nbsp;**🥑Opt.${index + 1}&nbsp;&nbsp;&nbsp;🙋‍♂️${key}：${value} 人**`
          })
          Object.entries(picked.options).forEach(([key, value]) => {
            formatOptions += `\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**${key}：${value}**`
          })
          const initiator = Bot.pickMember(picked.createGroup, picked.initiator)
          let pendingText = `### 🗳️主题：${picked.topic}`
          pendingText += `\n#### 🤚发起者：${initiator.card ? initiator.card + '(' + initiator.info.user_id + ')' : picked.initiator}`
          pendingText += `\n#### 📆日期：${picked.createData}`
          pendingText += `${picked.type === '投票' ? ('\n#### 👁️‍🗨️是否为匿名投票：' + (picked.isAnonymity ? '是' : '否')) : ''}`
          pendingText += (Object.keys(picked.options).length ? '\n⚠️**限定选项：**' + formatOptions + '\n' : '')
          pendingText += `\n${analysisResult}`
          await e.reply(
            await avocadoRender(
              pendingText,
              {
                footer: !picked.isAnonymity
                  ? `<b>回复 <i>#查看xxx人员</i> 获取${picked.type}名单</br>回复 <i>0</i> 结束本次查询</br>距本次会话结束还剩${refreshTimer(timer.statisticsCtx).leftTime}秒</b>`
                  : ''
              }
            )
          )
        } else { // 查看全部投票/接龙数据
          const pendingText = dataToProcess.map((item, index) => {
          // md语法默认忽视连续空格，只保留一个
            return `${index + 1}：🗳️主题：${item.topic}&nbsp;&nbsp;&nbsp;&nbsp;🤚发起者：${(Bot.pickMember(item.createGroup, item.initiator)).card || item.initiator}&nbsp;&nbsp;&nbsp;&nbsp;${isAdminAllNoneGlobalHistory ? '👥群号：' + item.createGroup : ''}&nbsp;&nbsp;&nbsp;&nbsp;📆${item.createData}`
          }).join('\n')
          await e.reply(await avocadoRender(pendingText, { width: 1200, height: 675 }))
        }
      } catch (err) {
        logger.error(err)
        this.finish('getDetail')
      }
    } else {
      await this.e.reply('不存在' + statisticalType + '记录！')
      return false
    }
    return true
  }

  async getDetail (e) {
    if (this.e.msg === '0') {
      await this.e.reply(`${global.God}！！！`)
      this.finish('getDetail')
      return true
    }
    if (typeof this.e.msg !== 'string') return false
    logger.mark('getDetail: ', this.e.msg)
    // const groupId = e.group_id
    const picked = e.picked
    const summary = getSummary(picked)

    const regex = /#(?:查看)?(.+)(?:人员|情况|数据)/
    const match = this.e.msg.match(regex)
    if (!match) return false
    const specificOption = match[1]
    let inputSubType, inputIndex
    const regex1 = new RegExp(`${[...summary.numCount].map(([key, value]) => key).join('|')}`)
    const regex2 = new RegExp(`${[...summary.numCount].map((item, index) => { return index + 1 }).join('|')}`)
    if (regex1.test(specificOption)) {
      inputSubType = specificOption
    } else if (regex2.test(specificOption)) {
      inputIndex = specificOption
    } else {
      return
    }
    if (inputSubType || inputIndex) {
      let nameList, subTypeName
      if (inputSubType) {
        nameList = summary.nameCount.get(inputSubType)
      } else {
        const targetEntry = [...summary.nameCount].find((item, i) => (i + 1) + '' === inputIndex)
        subTypeName = targetEntry[0]
        nameList = targetEntry[1]
      }
      const replyMsg = nameList.length
        ? `##### 🙋‍♂️${inputSubType || subTypeName}：${nameList.join('、')}`
        : `### 没有人选择 ${inputSubType} 呢~\n${await getBonkersBabble(global.God, 'native', 80)}`
      await this.e.reply(
        await avocadoRender(
          replyMsg,
          {
            footer: `<b>距本次会话结束还剩${refreshTimer(timer.statisticsCtx).leftTime}秒</b>`
          }
        )
      )
      return true
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
    initTimer(timer.statisticsCtx, ctxDuration)
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

/**
 *
 * @param {Number}groupId
 * @param dataField
 * @param type
 * @returns {Promise<Map<any, any>|number|any|boolean>}
 */
async function getHistoryStatisticalData (dataField = 'group', groupId = null, type = '') {
  try {
    if (dataField === 'global') {
      const res = JSON.parse(await redis.get('AVOCADO:STATISTICS_GLOBAL'))
      if (res) {
        if (type) return res.filter(item => item.type === type)
        return res
      }
      return []
    }
    if (dataField === 'groups') {
      // const myMap = new Map()
      const arr = []
      const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
      for (const group of groupIds) {
        let res = JSON.parse(await redis.get(`AVOCADO:STATISTICS_${group}`))
        if (res) {
          // myMap.set(group, JSON.parse(res))
          for (const i of res) {
            arr.push(i)
          }
        } else {
          logger.error('history get failed: ' + group)
        }
      }
      if (type) return arr.filter(item => item.type === type)
      // logger.warn(myMap)
      logger.warn('getHistoryStatisticalData => ', arr)
      return arr || []
    } else {
      // todo 优化，增加判断变量，不需要每次都都数据库
      const res = JSON.parse(await redis.get(`AVOCADO:STATISTICS_${groupId}`))
      // logger.error(res, 1111)
      if (res) {
        if (type) return res.filter(item => item.type === type)
        return res
      }
      return []
    }
  } catch (error) {
    logger.error(error)
    return []
  }
}

/**
 * 返回当前进行的事件
 * @param groupId - 群号，field 为 group 时指定
 * @param field - 需要获取的事件范围
 * @param type - 在指定type时， field 为 groups 时返回数组，其余情况均返回事件对象
 * @returns {Promise<*>}
 */
async function getCurrentEvents (field = 'all', groupId = null, type = '') {
  let globalEvents = field === 'global' || field === 'all'
    ? (await getHistoryStatisticalData('global', null, type)).filter(item => item?.status)
    : []
  let singleGroupEvents = field === 'group'
    ? (await getHistoryStatisticalData('group', groupId, type)).filter(item => item?.status)
    : []
  // 指定type时的返回结果也为数组，因为可能在不同群同时存在未结束的同种类型的事件
  let allNormalGroupEvents = field === 'all' || field === 'groups'
    ? (await getHistoryStatisticalData('groups', null, type)).filter(item => item?.status)
    : []
  // logger.warn(globalEvents, singleGroupEvents, allNormalGroupEvents)
  switch (field) {
    case 'all':{
      return type ? allNormalGroupEvents.concat(globalEvents)[0] : allNormalGroupEvents.concat(globalEvents)
    }
    case 'groups':{
      return type ? allNormalGroupEvents[0] : allNormalGroupEvents
    }
    case 'group':{
      return type ? singleGroupEvents[0] : singleGroupEvents
    }
    case 'global':{
      return type ? globalEvents[0] : globalEvents
    }
  }
}
/**
 * @param groupId
 * @param statisticData
 * @param saveToGlobal
 * @returns {Promise<boolean>}
 */
async function saveStatisticalData (groupId, statisticData, saveToGlobal = false) {
  const key = saveToGlobal ? 'AVOCADO:STATISTICS_GLOBAL' : `AVOCADO:STATISTICS_${groupId}`
  const field = saveToGlobal ? 'global' : 'group'
  try {
    let status
    if (Array.isArray(statisticData)) {
      status = await redis.set(key, JSON.stringify(statisticData))
    } else {
      let dataList = await getHistoryStatisticalData(field, groupId)
      const oldItem = dataList.find(item => item.id === statisticData.id)
      if (oldItem) {
        const index = dataList.indexOf(oldItem)
        dataList.splice(index, 1, statisticData)
      } else {
        dataList.push(statisticData)
      }
      status = await redis.set(key, JSON.stringify(dataList))
    }
    return status === 'OK' || false
  } catch (error) {
    logger.error(error)
    return false
  }
}

/**
 *
 * @param dataId
 * @param isGlobalData
 * @returns {Promise<boolean>}
 */
async function delStatisticalData (dataId, isGlobalData = false) {
  const dataList = await getHistoryStatisticalData(isGlobalData ? 'global' : 'groups')
  const groupId = isGlobalData ? null : dataList.find(item => item.id === dataId).createGroup
  const key = isGlobalData ? 'AVOCADO:STATISTICS_GLOBAL' : `AVOCADO:STATISTICS_${groupId}`
  try {
    const res = await redis.get(key)
    if (res) {
      const dataList = JSON.parse(res)
      const processed = dataList.filter(item => item.id !== dataId)
      return await saveStatisticalData(groupId, processed, isGlobalData)
    } else {
      return false
    }
  } catch (error) {
    logger.error(error)
    return false
  }
}

/**
 *
 * @param statisticEvent
 * @returns {{numCount: Map<any, any>, nameCount: Map<any, any>}}
 */
function getSummary (statisticEvent) {
  const summary = { numCount: new Map(), nameCount: new Map() }

  // const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, Object.keys(statisticEvent.options).length)
  const optionsArr = Object.keys(statisticEvent.options)
  if (optionsArr.length) { // 指定了选项的情况
    for (const option of optionsArr) {
      summary.numCount.set(option, 0)
      summary.nameCount.set(option, [])
    }
  } else {
    for (const item of statisticEvent.arr) {
      summary.numCount.set(item.description, 0)
      summary.nameCount.set(item.description, [])
    }
  }

  for (const item of statisticEvent.arr) {
    if (item.userOption) {
      if (summary.numCount.has(item.userOption)) {
        summary.numCount.set(item.userOption, summary.numCount.get(item.userOption) + 1)
        summary.nameCount.get(item.userOption).push(item.name + '(' + item.qq + ')')
      } else {
        summary.numCount.set(item.userOption, 1)
        summary.nameCount.set(item.userOption, [item.name + '(' + item.qq + ')'])
      }
    } else {
      if (summary.numCount.has(item.description)) {
        summary.numCount.set(item.description, summary.numCount.get(item.description) + 1)
        summary.nameCount.get(item.description).push(item.name + '(' + item.qq + ')')
      } else {
        summary.numCount.set(item.description, 1)
        summary.nameCount.set(item.description, [item.name + '(' + item.qq + ')'])
      }
    }
  }

  return summary
}
let stateArr = {}
