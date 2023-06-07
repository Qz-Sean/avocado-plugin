import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'

export class AvocadoManagement extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => 发癫',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 9999,
      rule: [
        {
          reg: global.God,
          fnc: 'avocadoPsycho'
        }
      ]
    })
  }

  async avocadoPsycho (e) {
    const GOD = global.God
    if ((Math.round(Math.random() * 10) / 10) > 0.5) {
      await this.reply(e.msg + '！！！')
      return true
    } else {
      let isExist = await redis.EXISTS('AVOCADO:PSYCHOSEND')
      // 不存在则返回[], psychoData 存在 则 isExit === true
      const psychoData = await redis.lRange('AVOCADO:PSYCHODATA', 0, -1)
      // let url = `https://xiaobapi.top/api/xb/api/onset.php?name=${GOD}`
      let url = `http://api.caonm.net/api/fab/f.php?msg=${GOD}`
      try {
        let response = await fetch(url)
        if (response.status === 200) {
          let json = await response.json()
          if (json.code === 1 && json.data) {
            let filteredData = json.data.replace(new RegExp(GOD, 'g'), '<name>')
            // 判断是否存在重复元素
            if (psychoData && psychoData.includes(filteredData)) {
              logger.warn('存在重复元素，不进行插入操作')
            } else {
              let status = await redis.lPush('AVOCADO:PSYCHODATA', filteredData)
              if (status) {
                logger.warn(`已存入：${json.data}`)
              }
            }
            await this.reply(json.data)
          } else {
            logger.error(json.toString())
          }
        }
      } catch (err) {
        logger.error(err)
        await e.reply('发电失败(ノへ￣、)该提醒作者更换API啦...将使用本地发电¡¡¡( •̀ ᴗ •́ )و!!!')
        let r = Math.floor(Math.random() * psychoData.length)
        logger.warn(global.randomArray)
        while (global.randomArray.includes(r)) {
          r = Math.floor(Math.random() * psychoData.length)
        }
        global.randomArray.push(r)
        if (global.randomArray.length === psychoData.length) global.randomArray = []
        logger.warn(r, global.randomArray)
        let ReplyMsg = psychoData[r].replace(/<name>/g, GOD)
        logger.warn(ReplyMsg)
        if (isExist) {
          await redis.lPush('AVOCADO:PSYCHOSEND', ReplyMsg)
        } else {
          await redis.lPush('AVOCADO:PSYCHOSEND', ReplyMsg)
          await redis.EXPIRE('AVOCADO:PSYCHOSEND', 24 * 60 * 60)
        }
        await this.reply(ReplyMsg)
      }
    }
    return true
  }
}
