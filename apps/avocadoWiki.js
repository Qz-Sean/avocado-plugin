import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { avocadoRender, sleep } from '../utils/common.js'
const urlMap = new Map()

export class AvocadoWiki extends plugin {
  constructor (e) {
    super({
      name: '鳄梨酱！！！ => 百科',
      dsc: '鳄梨酱！！！',
      event: 'message',
      priority: 60,
      rule: [
        {
          reg: `^#?(${global.God}|鳄梨酱?)?(?:baike|百科)s?(.+)(#\\d+)?$`,
          fnc: 'getWiki'
        },
        {
          reg: `^#?(${global.God}|鳄梨酱?)?(词条|条目)(\\d+)$`,
          fnc: 'getSpecificWiki'
        },
        {
          reg: '^#?(词条|条目)?(\\d+)?(链接|地址|url)$',
          fnc: 'getRealURL'
        }
      ]
    })
  }

  async getWiki (e) {
    const msg = e.msg.trim()
    const nRegex = /(#\d+)$/
    const n = nRegex.test(msg) ? msg.match(nRegex)[1] : ''
    const regex = new RegExp(`^#?(?:${global.God}|鳄梨酱?)?(?:baike|百科)(s)?(.+)$`, 'i')
    const match = msg.slice(0, msg.length - n.length).match(regex)
    const isQueryList = match[1] === 's'
    const query = match[2]
    const url = encodeURI(`https://wiki.gakki.icu/${isQueryList ? 'item_list' : 'item'}/${query}${!isQueryList && n ? '?n=' + n.slice(1) : ''}`)
    const response = await fetch(url)
    if (response.status === 200) {
      let result = await response.json()
      if (result.status === 404 || result.status === 400) {
        await e.reply('词条不存在！')
        return false
      }
      if (!isQueryList) {
        // 空数据，重试一次
        // if (!result.itemName) result = await (await fetch(url)).json()
        const text = `**条目**：${result.data.itemName}\n**简介**：${result.data.description.split('。').filter(item => item).map(item => item + '。').join('\n')}`
        await e.reply(
          avocadoRender(
            text,
            {
              title: `![img](${result.data.cover})`,
              renderType: 3
            }
          )
        )
        if (e.isGroup) UpdateUrlMap(e.group_id, { singleUrl: result.data.link })
        await sleep(1500)
        if (!result.data.isComplete) await e.reply('词条信息获取不完整，详见：' + result.data.link)
        return true
      } else {
        await e.reply('请稍等...', false, { recallMsg: 5 })
        const dataList = result.data.list
        if (result.data.list.length === 0) {
          await e.reply('词条不存在！')
          return false
        } else if (dataList.length === 1) {
          const url = 'https://wiki.gakki.icu/item/' + query + '?n=1'
          let response = await (await fetch(url)).json()
          // 空数据，重试一次
          // if (!response.itemName) response = await (await fetch(url)).json()
          const text = `**条目**：${response.data.itemName}\n**简介**：${response.data.description.split('。').filter(item => item).map(item => item + '。').join('\n')}`
          await e.reply(
            avocadoRender(
              text,
              {
                title: `![img](${response.data.cover})`,
                renderType: 3
              }
            )
          )
          if (e.isGroup) UpdateUrlMap(e.group_id, { singleUrl: response.data.link })
          await sleep(1500)
          if (!response.data.isComplete) {
            await e.reply('词条信息获取不完整，详见：' + response.data.link)
          }
          return true
        } else {
          const wikiUrlList = []
          const originalUrlList = []
          for (const [index, value] of dataList.entries()) {
            const url = 'https://wiki.gakki.icu/item/' + query + '?n=' + (index + 1)
            originalUrlList.push(value.link)
            wikiUrlList.push(encodeURI(url))
          }

          if (e.isGroup) UpdateUrlMap(e.group_id, { wikiUrlList, originalUrlList })

          if (dataList.length <= 5) {
            const resArr = []
            for (let urlListElement of wikiUrlList) {
              let response = await fetch(urlListElement)
              let item = await response.json()

              resArr.push({
                itemName: item.data.itemName,
                description: item.data.description,
                link: item.data.link,
                isComplete: item.data.isComplete,
                cover: item.data.cover
              })
              await sleep(1000)
            }
            await e.reply(
              await avocadoRender(
                resArr.map((item, index) => (index + 1) + '. **' + item.itemName + '**：' + item.description).join('\n'),
                {
                  title: query.toUpperCase(),
                  footer: '回复 词条n 查看具体条目信息'
                }
              )
            )
          } else {
            await e.reply(
              await avocadoRender(
                dataList.map((item, index) => (index + 1) + '. ' + item.title).join('\n'),
                {
                  title: query.toUpperCase(),
                  footer: '回复 词条n 查看具体条目信息'
                }
              )
            )
          }
          return true
        }
      }
    }
  }

  async getSpecificWiki (e) {
    const regex = new RegExp(`^#?(?:${global.God}|鳄梨酱?)?(词条|条目)(\\d+)?$`, 'i')
    const match = e.msg.trim().match(regex)
    const itemIndex = parseInt(match[2])
    // const isGetUrl = match[3] ?? false
    const urlList = urlMap.get(e.group_id)
    if (!urlList.wikiUrlList.length) return false
    const url = urlList.wikiUrlList[itemIndex - 1]
    const response = await fetch(url)
    const item = await response.json()
    const text = `条目：${item.data.itemName}\n**简介**：${item.data.description.split('。').filter(item => item).map(item => item + '。').join('\n')}`
    await e.reply(
      avocadoRender(
        text,
        {
          title: `![img](${item.data.cover})`,
          renderType: 3
        }
      )
    )
    await sleep(1500)
    if (!item.data.isComplete) {
      await e.reply('词条信息获取不完整，详见：' + item.data.link)
    }
    return true
  }

  async getRealURL (e) {
    if (!e.isGroup) return false
    const regex = /^#?(词条|条目)?(\d+)?(链接|地址|url)$/
    const match = e.msg.trim().match(regex)
    const isSpecific = match[1] && match[2]
    const index = isSpecific && match[2]
    if (!urlMap.has(e.group_id)) return false
    const urlList = urlMap.get(e.group_id)
    if (isSpecific) {
      if (index && urlList.originalUrlList.length) {
        await e.reply(urlList.originalUrlList[index - 1], e.isGroup)
      }
    } else {
      await e.reply(urlList.singleUrl, e.isGroup)
    }
    return true
  }
}
function UpdateUrlMap (groupId, obj) {
  if (urlMap.has(groupId)) {
    const item = urlMap.get(groupId)
    if (obj.singleUrl) {
      item.singleUrl = obj.singleUrl
    } else {
      item.wikiUrlList = obj.wikiUrlList
      item.originalUrlList = obj.originalUrlList
    }
    urlMap.set(groupId, item)
  } else {
    urlMap.set(groupId, {
      wikiUrlList: obj?.wikiUrlList ?? [],
      originalUrlList: obj?.originalUrlList ?? [],
      singleUrl: obj?.singleUrl ?? null
    })
  }
  return true
}
