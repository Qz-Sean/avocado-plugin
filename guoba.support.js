import { Config } from './utils/config.js'
import { initialPsychoData, pluginRoot, translateLangSupports } from './utils/const.js'
import path from 'path'
import fs from 'fs'
import { generateArray, syncPath } from './utils/common.js'

const panel = {
  // 插件信息，将会显示在前端页面
  // 如果你的插件没有在插件库里，那么需要填上补充信息
  // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
  pluginInfo: {
    name: 'avocado-plugin',
    title: 'Avocado-Plugin',
    author: '@Sean Murphy',
    authorLink: 'https://github.com/Qz-Sean',
    link: 'https://github.com/Qz-Sean/avocado-plugin',
    isV3: true,
    isV2: false,
    description: '鳄梨酱！！！',
    icon: 'emojione:avocado',
    iconColor: '#d5e145',
    iconPath: path.join(pluginRoot, 'resources', 'images', 'icon.png')
  },
  // 配置项信息
  configInfo: {
    // 配置项 schemas
    schemas: [
      {
        field: 'OHMYGOD',
        label: '指令触发词',
        bottomHelpMessage: '填写后将全局替换命令触发词。',
        component: 'Input'
      },
      {
        field: 'translateLang',
        label: '翻译顺序',
        bottomHelpMessage: `'鳄梨酱？'默认中英互译。鳄梨酱？？对应第一个值，翻译语言随着？个数递进选择。当前支持${translateLangSupports.map(item => item.label).join('、')}。`,
        component: 'Input'
      },
      {
        field: 'targetArea',
        label: '查询天气地址顺序',
        bottomHelpMessage: '\'鳄梨酱。\'对应第一个值。查询地址随着。个数递增选择。',
        component: 'Input'
      },
      {
        field: 'isAutoShareMusic',
        label: '主动发送问候信息',
        bottomHelpMessage: '开启后会在早中晚向群组发送问候信息与相关音乐。',
        component: 'Switch'
      },
      {
        field: 'initiativeGroups',
        label: '问候群组',
        bottomHelpMessage: '',
        component: 'Input'
      },
      {
        field: 'psychoKey',
        label: '发电Key',
        bottomHelpMessage: '前往 https://api.caonm.net 申请。',
        component: 'Input'
      },
      {
        field: 'isAutoOnset',
        label: '主动发电',
        bottomHelpMessage: '开启后当QQ消息包含关键词时将开始主动发电。',
        component: 'Switch'
      },
      {
        field: 'isPeriodicOnset',
        label: '周期发电',
        bottomHelpMessage: '',
        component: 'Switch'
      },
      {
        field: 'onsetLatentPeriod',
        label: '发电周期',
        bottomHelpMessage: '',
        component: 'InputNumber',
        componentProps: {
          min: 1,
          max: 23,
          addonAfter: '小时'
        }
      },
      {
        field: 'onsetGroups',
        label: '发电群组',
        bottomHelpMessage: '留空则所有群主动发电。',
        component: 'Input'
      },
      {
        field: 'wyy',
        label: '网易云音乐登录ck',
        bottomHelpMessage: '是会员的话可以用自己，否则部分歌曲只能听30s。的获取方法:https://music.163.com 登录 => 下载 https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm => 刷新页面，点击拓展获取"MUSIC_U"字段的值填入此处。',
        component: 'Input'
      },
      {
        field: 'deviceScaleFactor',
        label: '图片渲染精度',
        bottomHelpMessage: '根据自己设备实际情况选择。默认1。',
        component: 'InputNumber',
        componentProps: {
          min: 1,
          max: 10
        }
      },
      {
        field: 'greetSwitch',
        label: '是否打开入群欢迎',
        bottomHelpMessage: '对新人进行友好♂的问候。',
        component: 'Switch'
      },
      {
        field: 'proxy',
        label: 'http代理',
        bottomHelpMessage: '需要可填，预览网页时使用。',
        component: 'Input'
      }
    ],
    // 获取配置数据方法（用于前端填充显示数据）
    getConfigData () {
      return Config
    },
    // 设置配置的方法（前端点确定后调用的方法）
    setConfigData (data, { Result }) {
      for (let [keyPath, value] of Object.entries(data)) {
        if (keyPath === 'translateLang' || keyPath === 'targetArea' || keyPath === 'initiativeGroups' || keyPath === 'onsetGroups') {
          value = value.toString().split(/[,，;；|]/)
          if (!value.join().length) value = []
        }
        if (keyPath === 'onsetLatentPeriod') {
          value = /^\d{1,2}$/.test(value) ? value : 3
        }
        if (keyPath === 'deviceScaleFactor') {
          value = value >= 1 && value <= 10 ? value : 1
        }
        if (Config[keyPath] !== value) {
          Config[keyPath] = value
        }
      }
      return Result.ok({}, '保存成功~')
    }
  }
}
const fullPath = path.join(pluginRoot, 'resources', 'json', 'psycho.json')
syncPath(fullPath, '[]')
let psychoData = JSON.parse(fs.readFileSync(fullPath))
if (!psychoData.length || !Array.isArray(psychoData)) {
  psychoData = initialPsychoData
}

const indices = generateArray(psychoData.length)
let n = indices.length
let index, text
for (const schema of panel.configInfo.schemas) {
  let flag = false
  while (n > 0) {
    const r = Math.floor(Math.random() * n)
    index = indices[r]
    indices[r] = indices[n - 1]
    indices[n - 1] = index
    text = psychoData[index].replace(/(<name>|avocado)/g, global.God)
    flag = text.length < 70
    if (flag) break
    n--
  }
  if (!text) {
    text = '和鳄梨酱赛跑，他从后面狠狠地把我超了。🥵🥵🥵'
  }
  schema.bottomHelpMessage += text
}

export function supportGuoba () {
  return panel
}
