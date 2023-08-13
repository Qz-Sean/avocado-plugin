import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../utils/config.js'
import {
  confusedSpells,
  incantationResult,
  inspiringWords,
  phantomTransformation,
  translateLangSupports
} from '../utils/const.js'

export class AvocadoManagement extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => 管理',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 200,
      rule: [
        {
          reg: `^#(${Object.keys(phantomTransformation).join('|')})?(全局)?(变身|切换)！?([\u4e00-\u9fa5]*)`,
          fnc: 'setGod',
          permission: 'master'
        },
        {
          reg: '^#?设置翻译顺序(.*)',
          fnc: 'setTranslate',
          permission: 'master'
        },
        {
          reg: '^#?设置地[区域址]顺序(.*)',
          fnc: 'setTargetArea',
          permission: 'master'
        },
        {
          reg: '^#?(我要变身！|查看咒语)$',
          fnc: 'checkSpells',
          permission: 'master'
        },
        {
          reg: '^#?查看(全局|所有)?触发词$',
          fnc: 'checkGod',
          permission: 'master'
        },
        {
          reg: '^#?删除(全局|所有)?触发词$',
          fnc: 'delGod',
          permission: 'master'
        }
      ]
    })
  }

  async checkGod (e) {
    if (!e.isGroup && (!e.msg.includes('全局') || !e.msg.includes('所有'))) return false
    if (e.msg.includes('所有')) {
      const replyMsg = '全局：' + Config.OHMYGOD + '\n' +
          Config.groupGod.map(
            obj => Object.keys(obj).map(
              groupId => (
                e.isGroup
                  ? groupId?.replace(/(\d{3})\d+(\d{3})/, '$1****$2')
                  : groupId
              ) + '：' + obj[groupId]
            ).join('\n')
          ).join('\n')
      await e.reply(replyMsg)
    } else if (e.msg.includes('全局')) {
      await e.reply('全局触发词：' + Config.OHMYGOD)
    } else {
      const godName = Config.groupGod.find(obj => obj?.[e.group_id])?.[e.group_id]
      if (godName) {
        await e.reply('当前群聊触发词为：' + godName)
      } else {
        await e.reply('当前群聊未设置触发词！')
      }
    }
    return true
  }

  async delGod (e) {
    // 私聊只能管理全局和所有触发词
    if (!e.isGroup && (!e.msg.includes('全局') || !e.msg.includes('所有'))) return false
    if (e.msg.includes('所有')) {
      Config.groupGod = []
      Config.OHMYGOD = '鳄梨酱'
    } else if (e.msg.includes('全局')) {
      Config.OHMYGOD = '鳄梨酱'
    } else {
      Config.groupGod = Config.groupGod.filter(obj => !obj?.[e.group_id])
    }
    await e.reply('ok')
    return true
  }

  async checkSpells (e) {
    await e.reply(inspiringWords[Math.floor(Math.random() * inspiringWords.length)] + '\n' + Object.keys(phantomTransformation).map(item => item + '变身！').join('\n'))
    await e.reply('示例：' + Object.keys(phantomTransformation)[0] + '变身！憨憨酱！\n-> 注意此处将不会匹配标点符号，所以全局关键词将被替换为"憨憨酱"')
    return true
  }

  async setTargetArea (e) {
    const msg = e.msg.trim().replace(/^#?设置地[区域址]顺序(.*)/, '')
    const userList = msg.split(/[，,]/)
    if (userList.length === 0) {
      await this.reply('输入为空，请重新输入。')
      return false
    }
    Config.targetArea = userList
    await this.reply('设置成功。')
    return true
  }

  async setTranslate (e) {
    const msg = e.msg.trim().replace(/^#?设置翻译顺序(.*)/, '')
    const userList = msg.split(/[，,]/)
    const supportList = translateLangSupports.map(item => item.label)
    if (userList.length === 0) {
      await this.reply(`输入有误，请重新输入。语言之间使用，分隔。当前支持${supportList.join('，')}`)
    }
    const illeagalInput = []
    const legalInput = []
    userList.forEach(item => {
      if (supportList.includes(item)) {
        legalInput.push(item)
        return true
      } else {
        illeagalInput.push(item)
        return false
      }
    })
    let replyMsg = ''
    if (legalInput.length) {
      replyMsg += '设置失败'
      Config.translateLang = legalInput
    } else {
      replyMsg += '设置成功'
    }
    if (illeagalInput.length) {
      replyMsg += '\n检测到以下错误输入，已自动忽略。可回复 #翻译支持 获取帮助：' + illeagalInput.join('.') + '\n'
    }
    await this.reply(`${replyMsg}`)
    return true
  }

  async setGod (e) {
    const abracadabra = Object.keys(phantomTransformation).join('|')
    // 不匹配标点
    const match = this.e.msg.trim().match(new RegExp(`^#?(${abracadabra})?(全局)?(变身|切换)！?([\u4e00-\u9fa5a-zA-Z0-9]+)`), '')
    const GodName = match[4]
    const isGodAction = match[2] ?? false
    if (!GodName) {
      await this.reply(confusedSpells[Math.floor(Math.random() * confusedSpells.length)], e.isGroup)
      this.setContext('setGod')
      return true
    }
    let replySpell = ''
    // 用户正确说出咒语
    if (match[1]) {
      replySpell = phantomTransformation[match[1]] + '\n'
    }
    if (isGodAction) {
      Config.OHMYGOD = GodName
      global.God = GodName
    } else {
      if (!e.isGroup) {
        await e.reply('请在群聊中使用该命令，全局设置触发词请在指令中添加 "全局"，例如#全局切换鳄梨酱')
        return false
      }
      const arr = Config.groupGod.filter(item => !item?.[e.group_id])
      arr.push({ [e.group_id]: GodName })
      Config.groupGod = arr
      global.groupGodNameList = arr.reduce((acc, obj) => acc.concat(Object.values(obj)), [])
    }
    await this.reply(replySpell + incantationResult[Math.floor(Math.random() * incantationResult.length)])
    this.finish('setGod')
  }
}
