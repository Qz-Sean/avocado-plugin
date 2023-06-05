import { Config } from './utils/config.js'
import { translateLangSupports } from './utils/translate.js'
// 支持锅巴
export function supportGuoba () {
  return {
    // 插件信息，将会显示在前端页面
    // 如果你的插件没有在插件库里，那么需要填上补充信息
    // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
    pluginInfo: {
      name: 'avocado-plugin',
      title: 'Avocado-Plugin',
      author: '@Sean Murphy',
      authorLink: 'https://github.com/Qz-Sean',
      link: 'https://github.com/Qz-Sean?tab=repositories',
      isV3: true,
      isV2: false,
      description: '鳄梨酱！！！',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'simple-icons:openai',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: '#00c3ff'
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
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
        }
      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData () {
        return Config
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData (data, { Result }) {
        for (let [keyPath, value] of Object.entries(data)) {
          if (keyPath === 'translateLang' || keyPath === 'targetArea') { value = value.toString().split(/[,，;；\|]/) }
          if (Config[keyPath] !== value) { Config[keyPath] = value }
        }
        return Result.ok({}, '保存成功~')
      }
    }
  }
}