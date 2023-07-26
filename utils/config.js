import fs from 'fs'
import lodash from 'lodash'
const defaultConfig = {
  translateLang: ['日语', '韩语', '阿拉伯语', '法语'],
  targetArea: ['南昌', '上海', '南京'],
  OHMYGOD: '鳄梨酱',
  isPeriodicOnset: false,
  isAutoOnset: false,
  onsetLatentPeriod: 3,
  initiativeGroups: [],
  onsetGroups: [],
  initiativeName: '',
  isAutoShareMusic: true,
  executablePath: '',
  wyy: '00CE008DE5ABDC956CFB54E005D3C7CE1168BC9CBB37FC96A30DE2FA2FDDDBD1E67D829D0A679C6BEA8099D26284DABB141EC174B76C03D7BE758C36C2FE7780B2B6EEECF8B5F3BDA9CA6C43025448E9E2A21ACF8D4341702648A67EED1B12CAA5F76DB1148E34FED95B063AA5C3E59B72006B19D847937F1FF07FF0B9FCEA8F161164B7C42D58765B99F9D8B6B7AAC70E69C2AB625B5F159758CFDB562E3E74D64B58235C8CB0A3A2B3925FFE9E0D4BAF75E98258BCE8E1935B40D2CDE3BF9F9BD73E667FCAC29B2BCFAB1328892D9226B7F0B8FB4992A38889881A6021DB4C9E8CC4DB83658567E8795BF6B98D599876F26C4E0B2C42E7FD553CF914F5522FF0E57F003FCD96123FEB1EB6096C41E7F0133E396F2EBE5EBD517143AE996D5F9B908B6003EF38E6D4244383520721194790CA6B98D1A4C0F07B04CA696D5CC9A293790A52A9B6FA1D7901E2D3B83880676378AF382757BE5B87FF5C1F89D3A0B80B3F81179C7A2D6B9D22C125A3C6E4D3B035A6D45F0F9E793CCE452E4238EB0E',
  apiKey: '',
  apiBaseUrl: '',
  proxy: '',
  psychoKey: '',
  deviceScaleFactor: '1',
  version: 'v1.8.8'
}
const _path = process.cwd()
let config = {}
if (fs.existsSync(`${_path}/plugins/avocado-plugin/config/config.json`)) {
  const fullPath = fs.realpathSync(`${_path}/plugins/avocado-plugin/config/config.json`)
  const data = fs.readFileSync(fullPath)
  if (data) {
    try {
      config = JSON.parse(data)
    } catch (e) {
      logger.error('avocado插件读取配置文件出错，请检查config/config.json格式，将忽略用户配置转为使用默认配置', e)
      logger.warn('avocado插件即将使用默认配置')
    }
  }
} else if (fs.existsSync(`${_path}/plugins/avocado-plugin/config/config.js`)) {
  // 旧版本的config.js，读取其内容，生成config.json，然后删掉config.js
  const fullPath = fs.realpathSync(`${_path}/plugins/avocado-plugin/config/config.js`)
  config = (await import(`file://${fullPath}`)).default
  try {
    logger.warn('[Avocado-Plugin]发现旧版本config.js文件，正在读取其内容并转换为新版本config.json文件')
    // 读取其内容，生成config.json
    fs.writeFileSync(`${_path}/plugins/avocado-plugin/config/config.json`, JSON.stringify(config, null, 2))
    // 删掉config.js
    fs.unlinkSync(`${_path}/plugins/avocado-plugin/config/config.js`)
    logger.info('[Avocado-Plugin]配置文件转换处理完成')
  } catch (err) {
    logger.error('[Avocado-Plugin]转换旧版配置文件失败，建议手动清理旧版config.js文件，并转为使用新版config.json格式', err)
  }
} else if (fs.existsSync(`${_path}/plugins/avocado-plugin/config/index.js`)) {
  // 兼容旧版本
  const fullPath = fs.realpathSync(`${_path}/plugins/avocado-plugin/config/index.js`)
  config = (await import(`file://${fullPath}`)).Config
  try {
    logger.warn('[Avocado-Plugin]发现旧版本config.js文件，正在读取其内容并转换为新版本config.json文件')
    // 读取其内容，生成config.json
    fs.writeFileSync(`${_path}/plugins/avocado-plugin/config/config.json`, JSON.stringify(config, null, 2))
    // index.js
    fs.unlinkSync(`${_path}/plugins/avocado-plugin/config/index.js`)
    logger.info('[Avocado-Plugin]配置文件转换处理完成')
  } catch (err) {
    logger.error('[Avocado-Plugin]转换旧版配置文件失败，建议手动清理旧版index.js文件，并转为使用新版config.json格式', err)
  }
}
config = Object.assign({}, defaultConfig, config)
config.version = defaultConfig.version

export const Config = new Proxy(config, {
  set (target, property, value) {
    target[property] = value
    const change = lodash.transform(target, function (result, value, key) {
      if (!lodash.isEqual(value, defaultConfig[key])) {
        result[key] = value
      }
    })
    try {
      fs.writeFileSync(`${_path}/plugins/avocado-plugin/config/config.json`, JSON.stringify(change, null, 2), { flag: 'w' })
    } catch (err) {
      logger.error(err)
      return false
    }
    return true
  }
})
