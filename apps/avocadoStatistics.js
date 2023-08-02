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
          reg: `^#(?:${global.God}|鳄梨酱?)?(发起|结束|取消)?(接龙|(匿名)?投票)(.*)`,
          fnc: 'statisticEvent'
        },
        {
          reg: `^#(?:${global.God}|鳄梨酱?)?(?:查看)?(接龙|投票)(.*)(数据|情况|进度)$`,
          fnc: 'analysis'
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
        cron: '*/45 * * * *',
        // cron: '*/1 * * * *',
        name: 'sendStatisticsProgress',
        fnc: this.sendStatisticsProgress
      }]
  }

  async sendStatisticsProgress () {
    if (statisticEvent.status) {
      const e = seCtx
      e.msg = '#查看' + statisticEvent.type + '进度'
      const m = new AvocadoStatistics()
      await m.analysis(e)
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

发起投票可指定是否匿名 → #发起匿名投票 xxx

#查看历史${type} → 查看过往数据
`
    await e.reply(await avocadoRender(msg))
    // const b = [{ status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '接龙', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '打卡情况' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '钢铁侠', displayMsg: '☐ way.out 钢铁侠 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '蜘蛛侠', displayMsg: '1234 蜘蛛侠 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: true, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['钢铁侠', '蜘蛛侠'], topic: '最喜欢的漫威电影角色？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '超人', displayMsg: '☐ way.out 超人 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '最喜欢的DC电影角色？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '打卡', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '今天的天气如何？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '美国队长', displayMsg: '☐ way.out 美国队长 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '黑寡妇', displayMsg: '1234 黑寡妇 √8月2日 8:46' }, { qq: 3456059137, name: '5678', description: '雷神', displayMsg: '5678 雷神 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: true, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['美国队长', '黑寡妇', '雷神'], topic: '最喜欢的复仇者联盟成员？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '蝙蝠侠', displayMsg: '☐ way.out 蝙蝠侠 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '神奇女侠', displayMsg: '1234 神奇女侠 √8月2日 8:46' }, { qq: 3456059137, name: '5678', description: '闪电侠', displayMsg: '5678 闪电侠 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['蝙蝠侠', '神奇女侠', '闪电侠'], topic: '最喜欢的正义联盟成员？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '打卡', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '今天吃了什么？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '绿巨人', displayMsg: '☐ way.out 绿巨人 √8月2日 8:46' }, { qq: 2444059137, name: '1234', description: '黑豹', displayMsg: '1234 黑豹 √8月2日 8:46' }, { qq: 3456059137, name: '5678', description: '美国队长', displayMsg: '5678 美国队长 √8月2日 8:46' }, { qq: 4568059137, name: '9101', description: '钢铁侠', displayMsg: '9101 钢铁侠 √8月2日 8:46' }], initiator: 1519059137, type: '投票', isAnonymity: true, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: ['绿巨人', '黑豹', '美国队长', '钢铁侠'], topic: '最喜欢的复仇者联盟成员？' }, { status: true, arr: [{ qq: 1519059137, name: '☐ way.out', description: '已打卡', displayMsg: '☐ way.out 已打卡 √8月2日 8:46' }], initiator: 1519059137, type: '打卡', isAnonymity: false, createData: '2023/8/2 08:46:13', createGroup: 336130030, options: [], topic: '今天心情如何？' }]
    // await redis.del('AVOCADO:STATISTICS')
    // for (const i of b) {
    //   await redis.rPush('AVOCADO:STATISTICS', JSON.stringify(i))
    // }

    return true
  }

  // todo
  //  1. redis存储 => 过往数据查看 done
  //  2. 多群调用
  //  2.1. 主人可在任意位置查看并管理所有事件
  //  3. 接入chatgpt-plugin
  async statisticEvent (e) {
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(发起|结束|取消)?(接龙|(匿名)?投票)(.*)`)
    const match = e.msg.match(regex)
    const adminAction = match[1]
    const isStart = adminAction === '发起'
    const isEnd = adminAction === '结束'
    const isCancel = adminAction === '取消'
    if ((isStart || isEnd || isCancel) && !e.isGroup) {
      await e.reply('请在群聊中使用本指令！', false, { recallMsg: 10 })
      return false
    }

    const statisticType = match[2].includes('匿名') ? '投票' : match[2]
    const needFold = statisticEvent.arr.length > 20 && statisticEvent.type === '接龙'

    // 开始接龙/投票事件
    if (isStart) {
      if (!statisticEvent.status) {
      // 不满足发起事件的情况
        if (!match[4] || match[4].trim() === '') {
          await e.reply(`请给出${statisticType}主题！`)
          return false
        }
        // 投票没有选项
        if (statisticType === '投票' && match[4].split('#').length === 1) {
          await e.reply('请给出投票选项！')
          return false
        }

        // 只有管理员可发起
        const bot = Bot.pickMember(statisticEvent?.createGroup || e.group_id, Bot.uin)
        const initiator = Bot.pickMember(statisticEvent?.createGroup || e.group_id, statisticEvent?.initiator || e.sender.user_id)
        const isBotAdmin = bot.is_admin
        const isInitiatorAdmin = initiator.is_admin

        // 初始化
        statisticEvent.type = statisticType
        seCtx = e
        statisticEvent.initiator = e.sender.user_id
        statisticEvent.isAnonymity = !!match[3] || false
        statisticEvent.createData = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        statisticEvent.createGroup = e.group_id
        statisticEvent.options = []
        if (match[4].split('#').length !== 1) {
          const options = match[4].split('#')
          options.splice(0, 1)
          statisticEvent.options = options.filter(item => item !== '')
        }

        // 获取接龙/投票主题
        if (statisticEvent.options.length) {
          statisticEvent.topic = match[4].split('#')[0]
        } else {
          statisticEvent.topic = match[4].trim()
        }

        // 修改事件标志位
        if (isInitiatorAdmin) {
          if (isBotAdmin) {
            await setAnnounce(e.group_id, `管理员${e.sender.card || e.sender.nickname}已发起群${statisticType}：${statisticEvent.topic}${statisticEvent.options.length ? '\n限定选项：' + statisticEvent.options.join(' or ') : ''}`, e.bot ?? Bot)
          }
          statisticEvent.status = true
        } else {
          await e.reply(`只有管理员能发起${statisticType}！`)
          statisticEvent.status = false
          return false
        }

        // 推送初始信息
        await e.reply(`群${statisticType}：${statisticEvent.topic}${statisticEvent.options.length ? '\n限定选项：' + statisticEvent.options.join(' or ') : ''}\n1. `)
        return true
      } else {
        e.reply(`已存在${statisticType}：${statisticEvent.topic} \n参与人数：${statisticEvent.arr.length}人\n可回复 #查看${statisticType}进度 查看详情`)
        return false
      }
    }

    // 进行接龙/投票
    if (statisticEvent.status && !isStart && !isEnd && !adminAction) {
      if (statisticType !== statisticEvent.type) {
        await e.reply(`当前不存在${statisticType}！`)
        return false
      }
      // 只有投票事件能开启匿名
      if (statisticEvent.isAnonymity) {
        if (e.isGroup) {
          await e.reply('本次投票为匿名投票，请私聊发送投票结果！', false, { recallMsg: 10 })
          return false
        } else if (e.isPrivate) {
          // 忽略非群成员投票
          const isGroupMember = !!(Bot.pickMember(statisticEvent?.createGroup || e.group_id, e.sender.user_id))?.info
          if (!isGroupMember) return false
        }
      }
      // 非匿名投票 => 群内投票/接龙，只能在发起群进行，其他false
      if (!statisticEvent.isAnonymity && (e.isPrivate || e.group_id !== statisticEvent.createGroup)) return false
      const time = getCurrentTime()
      const previousData = statisticEvent.arr.find(item => item?.qq === e.sender.user_id)
      let description = ''
      // 处理默认项
      if (!match[4]) {
        if (statisticEvent.options.length) {
          description = statisticEvent.options[0]
        } else {
          description = '🙂'
        }
      } else {
        if (statisticEvent.options.length && !statisticEvent.options.includes(match[4].trim())) {
          await e.reply('请使用给定选项！' + statisticEvent.options.join(' or '), false, { recallMsg: 10 })
          return false
        } else {
          description = match[4].trim()
        }
      }
      const newData = {
        qq: e.sender.user_id,
        name: e.sender.card || e.sender.nickname,
        description,
        // displayMsg: `${e.sender.card || e.sender.nickname} ${description} √${time}`
        displayMsg: `${e.sender.card || e.sender.nickname}&nbsp;&nbsp;&nbsp;&nbsp;🙋‍♂️${description}&nbsp;&nbsp;&nbsp;&nbsp;📆${time}`
      }
      // 参与者可修改之前的备注信息,投票不可
      if (previousData) {
        if (statisticType === '投票') {
          await e.reply('你已投票！', false, { recallMsg: 30 })
          return false
        }
        const dataIndex = statisticEvent.arr.indexOf(previousData)
        statisticEvent.arr[dataIndex] = newData
      } else {
        statisticEvent.arr.push(newData)
      }
      if (statisticType === '投票') {
        await e.reply('投票成功！', false, { recallMsg: 30 })
        return true
      } else {
        // const msg = '群' + statisticType + '：' +
        //             statisticEvent.topic + '\n' +
        //             (statisticEvent.options.length ? '限定选项' + statisticEvent.options.join(' or ') + '\n' : '') +
        //             statisticEvent.arr.map((item, index) => { return `${index + 1}：${item.displayMsg}` }).join('\n')
        // 接龙超过20人折叠消息
        // if (needFold) {
        //   await e.reply(await makeForwardMsg(e, [msg], statisticEvent.topic))
        // } else {
        //   await e.reply(msg)
        // }
        const initiator = Bot.pickMember(statisticEvent.createGroup, statisticEvent.initiator)
        const msg = '### 群' + statisticType + '：' + statisticEvent.topic + '\n' +
            '#### 🤚发起人：' + (
          initiator.card
            ? initiator.card + '(' + initiator.info.user_id + ')'
            : statisticEvent.initiator
        ) + '\n' +
            (statisticEvent.options.length ? '#### 👁️‍🗨️限定选项' + statisticEvent.options.join(' or ') + '\n' : '') +
            statisticEvent.arr.map((item, index) => { return `##### ${index + 1}：${item.displayMsg}` }).join('\n')
        await e.reply(await avocadoRender(msg))
        return true
      }
    }

    // 取消接龙/投票
    if (statisticEvent.status && isCancel && e.group_id === statisticEvent.createGroup) {
      if (e.sender.user_id === statisticEvent.initiator) {
        await e.reply('已取消' + statisticType + '！')
        statisticEvent = { status: false, arr: [] }
        return true
      } else {
        await e.reply('🚫')
        return false
      }
    }

    // 结束接龙/投票
    // 只有发起者可结束
    if (statisticEvent.status && isEnd && e.group_id === statisticEvent.createGroup) {
      if (e.sender.user_id === statisticEvent.initiator) {
        const bot = Bot.pickMember(statisticEvent?.createGroup || e.group_id, Bot.uin)
        const initiator = Bot.pickMember(statisticEvent?.createGroup || e.group_id, statisticEvent?.initiator || e.sender.user_id)
        const isBotAdmin = bot.is_admin
        const isInitiatorAdmin = initiator.is_admin
        await e.reply('正在统计' + statisticType + '信息...')
        await sleep(1000)
        // 只保存正常结束的投票
        // logger.warn(statisticEvent)
        await redis.rPush('AVOCADO:STATISTICS', JSON.stringify(statisticEvent))
        statisticEvent = { status: false, arr: [] }
        e.msg = '#查看历史' + statisticType + '-1'
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

  async analysis (e) {
    if (!statisticEvent.status) return false
    const summary = getSummary(statisticEvent)
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(?:查看)?(接龙|投票)(${Object.keys(summary.numCount).join('|')})?(数据|情况|进度)$`)
    const match = e.msg.match(regex)
    if (match === null) return false
    const statisticalType = match[1]
    const subtype = match[2] || false
    if (statisticalType !== statisticEvent.type) {
      await e.reply(`当前不存在${statisticalType}！`)
      return false
    }
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
    if ((!e.isMaster && e.msg.include('所有')) || !e.isGroup) return false
    const regex = new RegExp(`#(?:${global.God}|鳄梨酱?)?(查看|删除)?(?:所有)?历史(接龙|投票)(-?\\d*)`)
    const match = e.msg.match(regex)
    const [isDel, type, order] = [match[1] ? match[1] === '删除' : false, match[2], parseInt(match[3] || 9999)]
    const statisticsArrStr = await redis.lRange('AVOCADO:STATISTICS', 0, -1)
    const statisticsArrJson = statisticsArrStr.map(jsonString => JSON.parse(jsonString))
    const thisGroupData = e.msg.includes('所有') ? statisticsArrJson : statisticsArrJson.filter(item => item.createGroup === e.group_id)
    const dataToProcess = thisGroupData.filter(item => item?.type === type)
    if (dataToProcess.length) {
      try {
        // 直接查看某项数据, -1则查看最新投票/接龙
        if (((order - 1) >= 0 || order === -1) && order <= dataToProcess.length) {
          const picked = order === -1 ? dataToProcess[dataToProcess.length - 1] : dataToProcess[order - 1]
          if (isDel && e.isMaster) {
            const res = !!statisticsArrJson.splice(statisticsArrJson.indexOf(picked), 1)
            if (res) {
              await e.reply('删除成功！')
              await redis.del('AVOCADO:STATISTICS')
              await redis.rPush('AVOCADO:STATISTICS', JSON.stringify(statisticsArrJson))
              return true
            } else {
              await e.reply('删除失败！')
              return false
            }
          }
          // 非匿名则开启上下文
          if (!picked.isAnonymity) {
            e.msg = picked
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
    const picked = e.msg
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
      summary.nameCount[item.description].push(item.name)
    } else {
      summary.numCount[item.description] = 1
      summary.nameCount[item.description].push(item.name + '(' + item.qq + ')')
    }
  }
  return summary
}
// 事件对象
let statisticEvent = {
  status: false,
  arr: []
}
// 上下文，负责task推送消息
let seCtx = {}
let stateArr = {}
