import Puppeteer from '../../../renderers/puppeteer/lib/puppeteer.js'
import fs from 'fs'
import yaml from 'yaml'
import puppeteer from 'puppeteer'
import Renderer from '../../../lib/renderer/Renderer.js'

class PuppeteerManager {
  constructor () {
    this.puppeteer = null
  }

  async init () {
    try {
      let puppeteerCfg = {}
      // 有问题把Yunzai/renderers/puppeteer/config.yaml的chromiumPath换成自己的浏览器，linux系统可另外下载一个chromium浏览器
      let configFile = './renderers/puppeteer/config.yaml'
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

  // 截图
  async screenshot (name, data = {}) {
    let renderer = Renderer.getRenderer()
    let img = await renderer.render(name, data)
    return img ? segment.image(img) : img
  }

  // 分片截图
  async screenshots (name, data = {}) {
    let renderer = Renderer.getRenderer()
    data.multiPage = true
    let imgs = await renderer.render(name, data) || []
    let ret = []
    for (let img of imgs) {
      ret.push(img ? segment.image(img) : img)
    }
    return ret.length > 0 ? ret : false
  }
}

export default new PuppeteerManager()
