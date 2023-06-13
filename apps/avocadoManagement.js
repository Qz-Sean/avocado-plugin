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
          reg: `^#?(${Object.keys(phantomTransformation).join('|')})?(变身|切换)！?([\u4e00-\u9fa5]*)`,
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
        }
      ]
    })
  }

  async checkSpells (e) {
    await e.reply(inspiringWords[Math.floor(Math.random() * inspiringWords.length)] + '\n' + Object.keys(phantomTransformation).join('变身！\n！'))
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
    const match = this.e.msg.trim().match(new RegExp(`^#?(${abracadabra})?(变身|切换)！?([\u4e00-\u9fa5a-zA-Z0-9]+)`), '')
    const GodName = match[3]
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
    Config.OHMYGOD = GodName
    global.God = GodName
    await this.reply(replySpell + incantationResult[Math.floor(Math.random() * incantationResult.length)])
    this.finish('setGod')
  }
}
