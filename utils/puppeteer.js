import Puppeteer from '../../../renderers/puppeteer/lib/puppeteer.js'
import fs from 'fs'
import yaml from 'yaml'
import puppeteer from 'puppeteer'

class PuppeteerManager {
  constructor () {
    this.puppeteer = null
  }

  async init () {
    try {
      let puppeteerCfg = {}
      // 有问题把Yunzai/renderers/puppeteer/config.yaml的chromiumPath换成自己浏览器
      let configFile = './renderers/puppeteer/config.yaml'
      logger.warn(fs.existsSync(configFile))
      if (fs.existsSync(configFile)) {
        try {
          puppeteerCfg = yaml.parse(fs.readFileSync(configFile, 'utf8'))
        } catch (e) {
          puppeteerCfg = {}
        }
      }
      this.puppeteer = new Puppeteer(puppeteerCfg)
    } catch (e) {
      logger.error('未能加载puppeteer，尝试降级到Yunzai的puppeteer尝试', e)
      this.puppeteer = puppeteer
    }
    await this.puppeteer.browserInit()
  }

  async newPage () {
    if (!this.puppeteer) {
      await this.init()
    }
    return await this.puppeteer.browser.newPage()
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
        await this.puppeteer.browser.close()
      }
    } catch (e) {
      logger.error('关闭浏览器时出错', e)
    } finally {
      this.puppeteer = null
    }
  }
}

export default new PuppeteerManager()
