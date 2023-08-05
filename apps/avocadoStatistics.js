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
          reg: `^#(?:${global.God}|鳄梨酱?)?(接龙|投票)(.*)`,
          fnc: 'joinEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?取消(接龙|投票)`,
          fnc: 'cancelEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?结束(接龙|投票)`,
          fnc: 'endEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?(?:查看)?(接龙|投票)[:：]?(.*)(数据|情况|进度)$`,
          fnc: 'checkEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?(查看|删除)?(?:所有)?历史(接龙|投票)(-?\\d*)`,
          fnc: 'adminHistory'
        }
      ]
    })
    // 存在感up
    this.task = [
      {
        cron: '*/39 * * * *',
        // cron: '*/1 * * * *',
        name: 'sendStatisticsProgress',
        fnc: this.sendStatisticsProgress
      }
    ]
  }

  async sendStatisticsProgress () {
    const hour = new Date().getHours()
    const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
    const hasGlobal = await hasGlobalEvent()
    if (hasGlobal) {
      const historyData = await getHistoryStatisticalData('global')
      const statisticEvent = historyData.find(item => item.status)
      const replyMsg = `查询到未完成${statisticEvent.type}：${statisticEvent.topic}\n可通过 #${statisticEvent.type} xxx 参与${statisticEvent.type}`
      for (const groupId of groupIds) {
        await Bot.sendGroupMsg(groupId, replyMsg)
      }
    } else {
      if (hour >= 7) {
        for (const groupId of groupIds) {
          const historyData = await getHistoryStatisticalData('group', groupId)
          const statisticEvent = historyData.filter(item => item.status)
          for (const statisticEventElement of statisticEvent) {
            const replyMsg = `查询到未完成${statisticEventElement.type}：${statisticEventElement.topic}\n可通过 #${statisticEventElement.type} xxx 参与${statisticEventElement.type}`
            await Bot.sendGroupMsg(groupId, replyMsg)
          }
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
    const isGlobalEvent = !!match[1] || false
    const topic = match[4] ? !match[4].includes('#') ? match[4] : match[4].split('#')[0] : null
    const options = match[4] ? match[4].split('#').slice(1) : []
    const isAnonymity = !!match[3] || false
    const statisticalType = match[2] === '接龙' ? '接龙' : '投票'
    logger.warn(statisticalType, match, options)
    const historyData = await getHistoryStatisticalData(isGlobalEvent ? 'global' : 'group', e.group_id)
    const hasExist = !!historyData.find(item => item?.type === statisticalType && item?.status)
    let statisticEvent = historyData.find(item => item?.type === statisticalType && item?.status)
    logger.warn(hasExist, statisticEvent)
    if (hasExist) {
      e.reply(`已存在${statisticalType}：${statisticEvent.topic} \n参与人数：${statisticEvent.arr.length}人\n可回复 #查看${statisticalType}进度 查看详情`)
      return false
    } else {
      statisticEvent = {
        status: false,
        arr: []
      }
    }
    const initiator = Bot.pickMember(e.group_id, e.sender.user_id)
    const isInitiatorAdmin = initiator.is_admin // 只有管理员可发起
    if (isGlobalEvent && !e.isMaster) return false

    if (!e.isGroup) {
      await e.reply('请在群聊中使用本指令！', false, { recallMsg: 10 })
      return false
    }
    // 开始接龙/投票事件
    // 不满足发起事件的情况
    if (!topic) {
      await e.reply(`请给出${statisticalType}主题！`)
      return false
    }
    // 投票没有选项
    if (statisticalType === '投票' && !options.length) {
      await e.reply('请给出投票选项！')
      return false
    }

    const bot = Bot.pickMember(
      statisticEvent?.createGroup || e.group_id,
      Bot.uin
    )
    const isBotAdmin = bot.is_admin

    statisticEvent.isGlobalEvent = isGlobalEvent
    statisticEvent.type = statisticalType
    statisticEvent.initiator = e.sender.user_id
    statisticEvent.isAnonymity = isAnonymity
    statisticEvent.createData = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    statisticEvent.createGroup = e.group_id
    statisticEvent.options = options
    statisticEvent.topic = topic
    statisticEvent.id = uuidV4()
    if (isGlobalEvent) {
      const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
      for (const groupId of groupIds) {
        await Bot.sendGroupMsg(groupId, `发起了群${statisticalType}：${statisticEvent.topic}，可通过#${statisticEvent.type} xxx参与！`)
      }
      statisticEvent.status = true
      await saveStatisticalData(statisticEvent.createGroup, statisticEvent, true)
      return true
    } else {
      // 修改事件标志位
      if (isInitiatorAdmin) {
        if (isBotAdmin) {
          await setAnnounce(
            e.group_id,
                `管理员${e.sender.card || e.sender.nickname}已发起群${statisticalType}：${statisticEvent.topic}${statisticEvent.options.length ? '\n限定选项：' + statisticEvent.options.join(' or ') : ''}`, e.bot ?? Bot)
        }
        statisticEvent.status = true
      } else {
        await e.reply(`只有管理员能发起${statisticalType}！`)
        statisticEvent.status = false
        return false
      }
      logger.warn(statisticEvent)
      await saveStatisticalData(e.group_id, statisticEvent)
      // 推送初始信息
      await e.reply(`群${statisticalType}：${statisticEvent.topic}${statisticEvent.options.length ? '\n限定选项：' + statisticEvent.options.join(' or ') : ''}\n1. `)
      return true
    }
  }

  async joinEvent (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(接龙|投票)(.*)`)
    const match = e.msg.match(regex)
    const statisticalType = match[1] === '接龙' ? '接龙' : '投票'
    const userInput = match[2] || false
    const hasGlobal = await hasGlobalEvent()
    const historyData = await getHistoryStatisticalData(hasGlobal ? 'global' : 'group', e.group_id)
    const statisticEvent = historyData.find(item => item?.type === statisticalType && item?.status)
    logger.warn(hasGlobal, statisticEvent)
    if (!statisticEvent) {
      await e.reply(`当前不存在${statisticalType}！`)
      return false
    }
    if (!e.isGroup && !!statisticEvent.isAnonymity) {
      await e.reply('请在群聊中使用本指令！', false, { recallMsg: 10 })
      return false
    }
    // 只有投票事件能开启匿名
    if (statisticEvent.isAnonymity) {
      if (e.isGroup) {
        await e.reply('本次投票为匿名投票，请私聊发送投票结果！', false, { recallMsg: 10 })
        return false
      } else if (e.isPrivate) {
        // 忽略非群成员投票
        const isGroupMember = !!(Bot.pickMember(
          statisticEvent?.createGroup || e.group_id,
          e.sender.user_id))?.info
        if (!isGroupMember) return false
      }
    }
    // 非匿名投票 => 群内投票/接龙，只能在发起群进行，其他false
    if (!statisticEvent.isGlobalEvent && !statisticEvent.isAnonymity && (e.isPrivate || e.group_id !== statisticEvent.createGroup)) return false
    const time = getCurrentTime()
    const previousData = statisticEvent.arr.find(item => item?.qq === e.sender.user_id)
    let description = ''
    // 处理默认项
    if (!userInput) {
      if (statisticEvent.options.length) {
        description = statisticEvent.options[0]
      } else {
        description = '🙂'
      }
    } else {
      if (statisticEvent.options.length && !statisticEvent.options.includes(userInput.trim())) {
        await e.reply('请使用给定选项！' + statisticEvent.options.join(' or '), false, { recallMsg: 10 })
        return false
      } else {
        description = userInput.trim()
      }
    }
    const newData = {
      qq: e.sender.user_id,
      name: e.sender.card || e.sender.nickname,
      time,
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
      const dataIndex = statisticEvent.arr.indexOf(previousData)
      statisticEvent.arr[dataIndex] = newData
    } else {
      statisticEvent.arr.push(newData)
    }
    if (statisticalType === '投票') {
      await e.reply('投票成功！', false, { recallMsg: 30 })
    } else {
      const initiator = Bot.pickMember(statisticEvent.createGroup, statisticEvent.initiator)
      const msg = '### 群' + statisticalType + '：' + statisticEvent.topic + '\n' +
          '#### 🤚发起人：' + (
        initiator.card
          ? initiator.card + '(' + initiator.info.user_id + ')'
          : statisticEvent.initiator
      ) + '\n' +
          (statisticEvent.options.length ? '#### 👁️‍🗨️限定选项' + statisticEvent.options.join(' or ') + '\n' : '') +
          statisticEvent.arr.map((item, index) => { return `##### ${index + 1}：${item.displayMsg}` }).join('\n')
      await e.reply(await avocadoRender(msg))
    }
    await saveStatisticalData(e.group_id, statisticEvent, hasGlobal)
    return true
  }

  async cancelEvent (e) {
    if (!e.isGroup) return false
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?取消(接龙|投票)$`)
    const match = e.msg.match(regex)
    const statisticalType = match[1]
    const sender = Bot.pickMember(e.group_id, e.sender.user_id)
    const isSenderAdmin = sender.is_admin
    const hasGlobal = await hasGlobalEvent()
    const historyData = await getHistoryStatisticalData(hasGlobal ? 'global' : 'group', e.group_id)
    const statisticEvent = historyData.find(item => item?.type === statisticalType && item?.status)
    if (!statisticEvent) {
      await e.reply(`当前不存在${statisticalType}！`)
      return false
    }
    // 取消接龙/投票
    if ((e.group_id === statisticEvent.createGroup && isSenderAdmin) || e.isMaster) {
      const bot = Bot.pickMember(
        statisticEvent.createGroup || e.group_id,
        Bot.uin)
      const isBotAdmin = bot.is_admin
      if (isBotAdmin) {
        await delAnnounce(statisticEvent.createGroup, 1, e.bot ?? Bot)
      }
      await delStatisticalData(e.group_id, statisticEvent.id, hasGlobal)
      let replyMsg = '已取消' + statisticalType + '！'
      if (hasGlobal) {
        const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
        for (const groupId of groupIds) {
          await Bot.sendGroupMsg(groupId, replyMsg)
        }
      } else {
        await e.reply(replyMsg)
      }
      return true
    } else {
      await e.reply('🚫')
      return false
    }
  }

  // todo 1. 全局事件结束时，上下文的bug 2. getdetail上下文会影响其他群
  // 结束接龙/投票
  // 只有发起者|master可结束
  async endEvent (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?结束(接龙|投票)$`)
    const match = e.msg.match(regex)
    const statisticalType = match[1]
    const hasGlobal = await hasGlobalEvent()
    const historyData = await getHistoryStatisticalData(hasGlobal ? 'global' : 'group', e.group_id)
    const statisticEvent = historyData.find(item => item?.type === statisticalType && item?.status)
    if (!statisticEvent) {
      await e.reply(`当前不存在${statisticalType}！`)
      return false
    }
    if (e.group_id === statisticEvent.createGroup) {
      if (e.sender.user_id === statisticEvent.initiator || e.isMaster) {
        const bot = Bot.pickMember(
          statisticEvent?.createGroup || e.group_id,
          Bot.uin)
        const initiator = Bot.pickMember(
          statisticEvent?.createGroup || e.group_id,
          statisticEvent?.initiator || e.sender.user_id)
        const isBotAdmin = bot.is_admin
        const isInitiatorAdmin = initiator.is_admin
        await e.reply('正在统计' + statisticalType + '信息...')
        await sleep(1000)
        // 只保存正常结束的投票
        // logger.warn(statisticEvent)
        statisticEvent.status = false
        await saveStatisticalData(e.group_id, statisticEvent, hasGlobal)
        e.msg = '#查看历史' + statisticalType + '-1'
        e.obj = statisticEvent
        await this.adminHistory(e)
        if (isBotAdmin && isInitiatorAdmin) {
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
    const hasGlobal = await hasGlobalEvent()
    const historyData = await getHistoryStatisticalData(hasGlobal ? 'global' : 'group', e.group_id)
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(?:查看)?(接龙|投票)[:；]?(.+)?(数据|情况|进度)$`)
    const match = e.msg.match(regex)
    if (match === null) return false
    const statisticalType = match[1]
    const statisticEvent = historyData.find(item => item?.type === statisticalType && item?.status)
    if (!statisticEvent) {
      await e.reply(`当前不存在${statisticalType}！`)
      return false
    }
    const summary = getSummary(statisticEvent)
    const regex1 = new RegExp(`${Object.keys(summary.numCount).join('|')}`)
    let subtype = ''
    if (match[2] && match[2].test(regex1)) subtype = match[2]
    if (subtype) {
      if (statisticalType === '投票' && statisticEvent.isAnonymity) {
        await e.reply('匿名投票不可查看！')
        return false
      }
      await e.reply(
        await avocadoRender(`##### 🙋‍♂️${subtype}：${summary.nameCount[subtype].join('、')}`)
      )
      return true
    }
    const initiator = Bot.pickMember(statisticEvent.createGroup, statisticEvent.initiator)
    let replyMsg = '### 群' + statisticalType + '：' + statisticEvent.topic
    replyMsg += '\n#### 🤚发起人：' + (
      initiator.card
        ? initiator.card + '(' + initiator.info.user_id + ')'
        : statisticEvent.initiator
    )
    replyMsg += `${statisticEvent.type === '投票' ? ('\n#### 👁️‍🗨️是否为匿名投票：' + (statisticEvent.isAnonymity ? '是' : '否')) : ''}`
    replyMsg += (statisticEvent.options.length ? '\n#### ⚠️限定选项：' + statisticEvent.options.join(' or ') : '')
    replyMsg += '\n#### ✅参与人数：' + statisticEvent.arr.length + ' 人'
    Object.entries(summary.numCount).forEach(([key, value]) => {
      replyMsg += `\n&nbsp;&nbsp;&nbsp;&nbsp;**🙋‍♂️${key}：${value} 人**`
    })
    // if (!statisticEvent.isAnonymity) {
    //   replyMsg += '\n' + statisticEvent.arr.map((item, index) => { return `##### ${index + 1}：${item.displayMsg}` }).join('\n')
    // }
    await e.reply(await avocadoRender(replyMsg))
    return true
  }

  // todo
  //  1. 形式： 图片显示 done
  //  2. 内容： 序号：时间 -> 主题 ... 序号：时间 -> 主题 done
  //  3. 查看： 通过序号查看详情 done
  async adminHistory (e) {
    let picked = ''; let isAdminAllHistory = ''; let statisticsArrJson = ''; let dataToProcess = ''
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(查看|删除)?(?:所有)?历史(接龙|投票)(-?\\d*)`)
    const match = e.msg.match(regex)
    let [isDel, type, order] = [match[1] ? match[1] === '删除' : false, match[2], parseInt(match[3] || 9999)]
    if (e?.obj) {
      dataToProcess = [e.obj]
    } else {
      isAdminAllHistory = e.msg.includes('所有')
      if ((!e.isMaster && isAdminAllHistory) || !e.isGroup) return false
      statisticsArrJson = await getHistoryStatisticalData(isAdminAllHistory ? 'groups' : 'group', e.group_id)
      dataToProcess = isAdminAllHistory ? statisticsArrJson : statisticsArrJson.filter(item => item.createGroup === e.group_id)
    }
    if (dataToProcess.length) {
      try {
        // 直接查看某项数据, -1则查看最新投票/接龙
        if ((((order - 1) >= 0 || order === -1) && order <= dataToProcess.length && dataToProcess.length !== 0)) {
          if (dataToProcess.length === 1) {
            picked = dataToProcess[0]
          } else {
            picked = order === -1 ? dataToProcess[dataToProcess.length - 1] : dataToProcess[order - 1]
          }
          if (isDel && e.isMaster) {
            const res = await delStatisticalData(e.group_id, picked.id)
            if (res) {
              await e.reply('删除成功！')
              return true
            } else {
              await e.reply('删除失败！')
              return false
            }
          }
          // 非匿名则开启上下文
          if (!picked.isAnonymity) {
            e.msg = picked.id
            this.setContext('getDetail')
          }
          const summary = getSummary(picked)
          let analysisResult = `**✅共${picked.arr.length}人参与${picked.type}**`
          Object.entries(summary.numCount).forEach(([key, value]) => {
            analysisResult += `\n&nbsp;&nbsp;&nbsp;&nbsp;🙋‍♂️**${key}：${value} 人**`
          })
          const initiator = Bot.pickMember(picked.createGroup, picked.initiator)
          const pendingText = `### 🗳️主题：${picked.topic}\n#### 🤚发起者：${initiator.card ? initiator.card + '(' + initiator.info.user_id + ')' : picked.initiator}\n#### 📆日期：${picked.createData}${picked.type === '投票' ? ('\n#### 👁️‍🗨️是否为匿名投票：' + (picked.isAnonymity ? '是' : '否')) : ''}\n${analysisResult}`
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
            return `${index + 1}：🗳️主题：${item.topic}&nbsp;&nbsp;&nbsp;&nbsp;🤚发起者：${(Bot.pickMember(item.createGroup, item.initiator)).card || item.initiator}&nbsp;&nbsp;&nbsp;&nbsp;📆${item.createData}`
          }).join('\n')
          await e.reply(await avocadoRender(pendingText, { width: 1600, height: 900 }))
        }
      } catch (err) {
        logger.error(err)
        this.finish('getDetail')
      }
    } else {
      await this.e.reply('不存在' + type + '记录！')
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
    const eventId = e.msg
    const groupId = e.group_id
    const dataList = await getHistoryStatisticalData('group', groupId)
    const picked = dataList.find(item => item.id === eventId)
    const summary = getSummary(picked)
    const regex = `#(?:查看)?(${Object.keys(summary.nameCount).join('|')})(?:人员|情况|数据)`
    const match = this.e.msg.match(regex)
    if (!match) return false
    const type = match[1]
    await this.e.reply(
      await avocadoRender(
          `##### 🙋‍♂️${type}：${summary.nameCount[type].join('、')}`,
          {
            footer: `<b>距本次会话结束还剩${refreshTimer(timer.statisticsCtx).leftTime}秒</b>`
          }
      )
    )
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
 * @returns {Promise<Map<any, any>|number|any|boolean>}
 */
async function getHistoryStatisticalData (dataField = 'group', groupId = null) {
  try {
    if (dataField === 'global') {
      const res = await redis.get('AVOCADO:STATISTICS_GLOBAL')
      if (res) return JSON.parse(res)
      return []
    }
    if (dataField === 'groups') {
      // const myMap = new Map()
      const arr = []
      const groupIds = Array.from(Bot.getGroupList().keys(), obj => obj)
      for (const group of groupIds) {
        let res = await redis.get(`AVOCADO:STATISTICS_${group}`)
        if (res) {
          res = JSON.parse(res)
          // myMap.set(group, JSON.parse(res))
          for (const i of res) {
            arr.push(i)
          }
        } else {
          logger.error('history get failed: ' + group)
        }
      }
      // logger.warn(myMap)
      logger.warn(arr)
      return arr || []
    } else {
      const res = await redis.get(`AVOCADO:STATISTICS_${groupId}`)
      logger.error(res)
      if (res) return JSON.parse(res)
      return []
    }
  } catch (error) {
    logger.warn(error)
    return []
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
      await delStatisticalData(groupId, statisticData.id, saveToGlobal)
      let dataList = await getHistoryStatisticalData(field, groupId)
      dataList.push(statisticData)
      status = await redis.set(key, JSON.stringify(dataList))
    }
    return status === 'OK' || false
  } catch (error) {
    logger.warn(error)
    return false
  }
}
async function delStatisticalData (groupId, dataId, isGlobalData = false) {
  const key = isGlobalData ? 'AVOCADO:STATISTICS_GLOBAL' : `AVOCADO:STATISTICS_${groupId}`
  try {
    const res = await redis.get(key)
    if (res) {
      const dataList = JSON.parse(res)
      const processed = dataList.filter(item => item.id !== dataId)
      return await saveStatisticalData(groupId, processed, isGlobalData)
    } else {
      return 0
    }
  } catch (error) {
    logger.warn(error)
    return false
  }
}
async function hasGlobalEvent () {
  const dataList = await getHistoryStatisticalData('global')
  if (dataList.length) {
    return !!dataList.find(item => item.status)
  }
  return false
}
function getSummary (statisticEvent) {
  const summary = { numCount: {}, nameCount: {} } // 包含各项统计总人数与人员名单
  // 初始化summary
  if (statisticEvent.options.length) {
    // 将所有可选项添加到summary中
    for (const i of statisticEvent.options) {
      summary.numCount[i] = 0
      summary.nameCount[i] = []
    }
  }
  for (const item of statisticEvent.arr) {
    summary.numCount[item.description] = 0
    summary.nameCount[item.description] = []
  }

  // 遍历接龙结果
  for (const item of statisticEvent.arr) {
    if (summary.numCount[item.description]) {
      summary.numCount[item.description]++
      summary.nameCount[item.description].push(item.name + '(' + item.qq + ')')
    } else {
      summary.numCount[item.description] = 1
      summary.nameCount[item.description].push(item.name + '(' + item.qq + ')')
    }
  }
  return summary
}
let stateArr = {}
