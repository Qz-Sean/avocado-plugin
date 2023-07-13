import fs from 'node:fs'
import chalk from 'chalk'
import { pluginVersion } from './utils/const.js'

if (!global.segment) {
  global.segment = (await import('oicq')).segment
}

if (!global.core) {
  try {
    global.core = (await import('oicq')).core
  } catch (err) {}
}
const files = fs.readdirSync('./plugins/avocado-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status !== 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

console.log('-------------\\ \\ \\ ٩(๑˃̵ᴗ˂̵)و / / /-------------')
logger.info(chalk.green.bold('   \\'))
logger.info(chalk.green.bold('    \\'))
logger.info(chalk.green.bold('     \\\\'))
logger.info(chalk.green.bold('     /\\\\'))
logger.info(chalk.green.bold('    /  \\\\'))
logger.info(chalk.green.bold('   /    \\\\'))
logger.info(chalk.green.bold('  /      \\\\'))
logger.info(chalk.green.bold(' /        \\\\'))
logger.info(chalk.green.bold('/__________\\\\'))
logger.info(chalk.green.bold('🥑avocado-plugin加载成功'))
logger.info(`🥑当前版本 ${chalk.blue(pluginVersion)}`)
logger.info(`🥑仓库地址 ${chalk.blue('https://github.com/Qz-Sean/avocado-plugin')}`)
console.log('-------------\\ \\ \\ ٩(๑˃̵ᴗ˂̵)و / / /-------------')
export { apps }
