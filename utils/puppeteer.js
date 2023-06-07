import puppeteer from 'puppeteer'
import { Config } from './config.js'

class PuppeteerManager {
  constructor () {
    this.puppeteer = null
    this.flag = 1
    this.browser = null
  }

  async init () {
    this.puppeteer = puppeteer
    try {
      const Puppeteer = (await import('../../../renderers/puppeteer/lib/puppeteer.js')).default
      let puppeteerCfg = {
        chromiumPath: Config.executablePath,
        // puppeteer websocket 地址。连接单独存在的 chromium。
        // puppeteerWS: 'ws://browserless:3000'
        puppeteerWS: '',
        headless: 'new',
        args: [
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--no-zygote'
        ]
      }
      this.puppeteer = new Puppeteer(puppeteerCfg)
      await this.puppeteer.browserInit()
    } catch (e) {
      this.flag = 0
      logger.error('未能加载puppeteer，尝试降级到Yunzai的puppeteer尝试', e)
      logger.error('喵崽好用，建议换喵崽！')
      let args = [
        '--exclude-switches',
        '--no-sandbox',
        '--remote-debugging-port=51777',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--ignore-certificate-errors',
        '--no-first-run',
        '--no-service-autorun',
        '--password-store=basic',
        '--system-developer-mode',
        '--mute-audio',
        '--disable-default-apps',
        '--no-zygote',
        '--disable-accelerated-2d-canvas',
        '--disable-web-security'
      ]
      const executablePath = Config.executablePath
      this.browser = await puppeteer.launch({
        defaultViewport: { width: 1200, height: 300 },
        headless: true,
        executablePath,
        args
      })
    }
  }

  async newPage () {
    if (!this.puppeteer) {
      await this.init()
    }
    if (this.flag) {
      return await this.puppeteer.browser.newPage()
    } else {
      return await this.browser.newPage()
    }
  }

  async closePage (page) {
    try {
      if (page) {
        await page.close()
      }
    } catch (e) {
      logger.error('关闭浏览器时出错', e)
    }
  }

  async close () {
    try {
      if (this.puppeteer) {
        if (this.flag) {
          await this.puppeteer.browser.close()
        } else {
          this.browser.close()
        }
      }
    } catch (e) {
      logger.error('关闭浏览器时出错', e)
    } finally {
      this.puppeteer = null
      this.browser = null
    }
  }
}

export default new PuppeteerManager()
