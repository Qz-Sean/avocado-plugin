import puppeteer from 'puppeteer'
import { Config } from './config.js'

class PuppeteerManager {
  constructor () {
    this.screenshotCount = 1
    this.browser = null
    this.config = {
      chromiumPath: Config.executablePath,
      // puppeteer websocket 地址。连接单独存在的 chromium。
      // puppeteerWS: 'ws://browserless:3000'
      puppeteerWS: '',
      headless: false,
      args: [
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--no-zygote',
        '--font-render-hinting=medium',
        '--disable-application-cache',
        '--disable-dev-shm-usage', // 禁用/dev/shm使用
        '--disable-extensions', // 禁用扩展
        '--disable-infobars', // 禁用信息栏
        '--disable-notifications', // 禁用通知
        '--disable-offline-load-stale-cache', // 禁用离线加载过期缓存
        '--dns-prefetch-disable', // 禁用DNS预取
        '--enable-features=NetworkService', // 启用网络服务特性
        '--enable-automation' // 启用自动化
      ]
    }
  }

  async init () {
    if (this.browser) return this.browser
    if (this.lock) return false
    this.lock = true

    logger.mark('avocado puppeteer 启动中...')
    const browserURL = 'http://127.0.0.1:51777'
    try {
      this.browser = await puppeteer.connect({ browserURL })
    } catch (e) {
      /** 初始化puppeteer */
      this.browser = await puppeteer.launch(this.config).catch((err) => {
        logger.error(err.toString())
        if (String(err).includes('correct Chromium')) {
          logger.error('没有正确安装Chromium，可以尝试执行安装命令：node ./node_modules/puppeteer/install.js')
        }
      })
    }
    this.lock = false

    if (!this.browser) {
      logger.error('avocado puppeteer 启动失败')
      return false
    }

    logger.mark('avocado puppeteer 启动成功')

    /** 监听Chromium实例是否断开 */
    this.browser.on('disconnected', (e) => {
      logger.info('Chromium实例关闭或崩溃！')
      this.browser = false
    })
    return this.browser
  }

  async newPage () {
    if (!this.browser) await this.init()
    return await this.browser.newPage().catch((err) => logger.error(err))
  }

  async closePage (page) {
    if (page) {
      await page.close().catch((err) => logger.error('页面关闭出错：' + err))
      this.screenshotCount += 1
      if (this.screenshotCount === 100) {
        await this.close()
      }
    }
  }

  async close () {
    if (this.browser) {
      this.browser.close().catch((err) => logger.error('浏览器关闭出错：' + err))
    }
    this.browser = null
  }
}

export default new PuppeteerManager()
