import plugin from '../../../lib/plugins/plugin.js'
import { getBonkersBabble } from './avocadoPsycho.js'
import {Config} from "../utils/config.js";

export class avocadoGreet extends plugin {
  constructor () {
    super({
      name: '鳄梨酱！！！ => 入群欢迎',
      dsc: '鳄梨酱！！！',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.increase',
      priority: 7000
    })
  }

  /** 接受到消息都会执行一次 */
  async accept () {
    if (this.e.user_id === this.e.bot.uin || !Config.greetSwitch) return
    /** 定义入群欢迎内容 */
    let msg = await getBonkersBabble(this.e.sender.nickname)
    /** 冷却cd 30s */
    let cd = 30

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`
    if (await redis.get(key)) return
    await redis.set(key, '1', { EX: cd })

    /** 回复 */
    await this.reply([
      segment.at(this.e.user_id),
      ' ',
      msg
    ])
  }
}
