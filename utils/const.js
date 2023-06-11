import MarkdownIt from 'markdown-it'
import path from 'path'
import { Config } from './config.js'

global.randomArray = []

global.God = Config.OHMYGOD === '' ? '鳄梨酱' : Config.OHMYGOD
// from 3399280843@qq.com@SmallK111407
export const _path = process.cwd().replace(/\\/g, '/')
export const pluginName = path.basename(path.join(import.meta.url, '../../'))
export const pluginRoot = path.join(_path, 'plugins', pluginName)
export const urlRegex = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:((?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?)(?:\/[\w\u00a1-\uffff$-_.+!*'(),%]+)*(?:\?(?:[\w\u00a1-\uffff$-_.+!*(),%:@&=]|(?:[\[\]])|(?:[\u00a1-\uffff]))*)?(?:#(?:[\w\u00a1-\uffff$-_.+!*'(),;:@&=]|(?:[\[\]]))*)?\/?/i
// 欢迎补充
export const phantomTransformation = {
  '黑夜之力，赐予我力量！': '黑暗的力量已经注入你的身体，从此你将成为黑夜的主宰！\n黑夜啊，听从我的召唤，降临于这片大地吧！',
  '万象之力，汇聚我身！': '宇宙的能量已经融入你的血液，从此你将掌控万物之力！\n星辰啊，为我而闪耀，照亮前方的道路吧！',
  '火焰之力，燃烧我的灵魂！': '炽热的火焰已经点燃你内心的激情，从此你将化身为无尽的火焰之王！\n火焰啊，燃尽一切不属于我的东西吧！',
  '风暴之力，撕裂天际！': '狂暴的风暴已经让你成为自然界的主宰，从此你将统御风云际会！\n风啊，为我而呼啸，在这片大地上肆意纵横吧！'
}
export const inspiringWords = [
  '少年啊，如果你想要变得更加强大，就跟我一起大声喊出这个咒语吧！（ง •̀_•́)ง ︵‿︵(´ ͡༎ຶ ͜ʖ ͡༎ຶ `)︵‿︵ Abracadabra！（啊布拉卡达布拉！）',
  '年轻人，你是否渴望强大的力量？那么跟我来，摆出你最燃的招式，喊出这个古老而神秘的咒语——✨༼ つ ◕_◕ ༽つ🔮',
  '哟！你想要获得无敌的力量吗？那就跟我一起摆出夺命狂舞的姿势，大声呼喊这个超酷的咒语吧——💥(づ｡◕‿‿◕｡)づ👻',
  '你心中是否渴望无尽的力量？那就抬起双手，集中全部意念，喊出这个具有神秘魅力的咒语——🌀(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧💫',
  "啊哈！你是否想掌握所有技能？那就跟我一起燃烧自己内心深处的火焰，大声呼唤这个超赞的咒语吧——🔥(ง’̀-'́)ง☄️",
  '听好了！如果你想要突破极限、超越自我，那么就和我一同摆出霸气十足的姿势来吧。现在用全身力气高喊这个奇妙至极地口号��———⚡️ᕙ(`▽´)ᕗ🌩',
  "少年啊，你是否渴望获得强大力量、超越自我？那就拿出你最勇敢的一面，让这个神秘至极的咒语滋养你全身每一个细胞——💪(ง’̀-'́)ง🌟",
  '欧耶！想要变成无人敢挑战的王者吗？那就和我一起喊出这个闪亮登场的酷炫口号来吧——👑(⌐■_■)ノ♪♬',
  '哼唧！如果你想要掌握时间与空间之力，体验穿梭宇宙风采，不如抬头仰望星空，以此激发内心无限潜能，并附上这个深奥而神秘地口诀——✨＼(^o^)／✨'
]
export const confusedSpells = [
  '等一下，小伙子！你还没有告诉我想成为何种神话传说中的人物啊？快跟着我的手势张开双臂，并同时喊出这个充满活力的咒语——🌟(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  '哎呦~看来你还不知道自己最向往成为怎样的英雄或者角色。让我们一起摆出这个魔幻世界风格十足、高深莫测的姿势，然后大声念出以下豪迈之言——💥(^▽^)💥',
  '哈哈，我知道了！原来是因为我们还没做好准备并发挥真正潜能就是吗？现在，请跟随我的指导并左右手配合做一个华丽到令人窒息、带有重新洗礼意义的动作。然后和我一起用全身肺活量喊出：👁️‍🗨️(•̀ᴗ•́)و ̑̑',
  '等一下，你还没有告诉我你想成为哪种神话传说中的英雄！不要着急，现在跟我一起摆出这个超酷又具有仪式感的姿势，并大声念出这个充满力量的咒语——✨(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  '喂！看来我的电波没能完全穿透到你的内心呢。但是别担心，因为我们可以一起挥动手臂、尖叫并呼唤以下魔法口诀即可将灵魂升华——🌀(⌐■_■)ノ♪♬',
  "我的天啊! 你居然还没有和我分享过自己理想人生中最想成为谁吗？那就马上跟着我做一个十分帅气且有仪式感地手势, 然后用自己最高昂沸腾的状态大喊两次发声：😎(ง’̀-'́)ง💥",
  '等等，我好像还没有听到你的心声呢。小家伙，赶紧告诉我你心中渴望成为何种神话传说之人？我们一同摆出这个酷炫又神秘的姿势，并高喊出下面这句口号——🔮(づ｡◕‿‿◕｡)づ💫',
  "唔嗯~ 感觉还差点什么呢。难道是因为我还不了解你想要变成哪位超级英雄/女武士/魔法师？来吧！跟着我的节奏一起做手势，并大声念出以下语句：⚡️(ง’̀-'́)ง☄️",
  '哟！看来你还没有准备好踏上成为超越极限的旅程啊。但不用担心，只要你跟我一起摆出这个超能量激发姿势，大喊出下面的口号，我们就能启动冲刺模式了——🚀(•̀o•́)ง�',
  '呜呜~~ 为什么总是自己一个人在玩呢？难道你已经背弃了作为洛阳城第一少年的荣耀吗？再给你最后一次机会表现自己，请立刻复读我说过的咒语——💫(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'
]
export const incantationResult = [
  '我手握诸天神器，直指众生安乐。你是我的铁甲战马，我们一同踏破苍穹！( •̀ ω •́ )✧',
  '只有你的剑和我的心一起跳动，才能让这世界更加美好！今天我们要征服恶龙、抱得公主归！(ﾉ*>∀<)ﾉ♡',
  '感受那缤纷的色彩和充满激情的战斗吧！在我左右舞动您的长枪，在对峙中迎接属于我们自己的胜利！(^▽^)ゝ',
  '我的勇士，你就是我一生追寻的目标。现在我们一同前进，征服世界！(ง •̀_•́)ง🗡️',
  "在这茫茫人海中，只有你能驾驭我的船，我们一路杀敌、一路逆风而行！(ง’̀-'́)ง",
  '我是昔日的孤狼，在你出现之前一直徘徊。现在我们联手走向世界巅峰！( ´･･)ﾉ(._.`)',
  '请拿起属于自己的武器，跟随我去捍卫正义！勇士啊，请不要放弃！ヽ(＾ω＾)ﾉ',
  '我曾听闻世间最凶恶的野兽也会因为你的英姿而臣服。让他们见证我们迈向辉煌吧！ʕ•ᴥ•ʔゝ☆',
  '看到这无垠的大地和满天繁星，我想起了你清澈勇敢的眼神。伙伴啊，我们要跳出平凡，成就传奇！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  '无论是追逐风中漫舞的花瓣，还是迎战绝境之时残酷剑影下挥洒鲜血；我的心里只有你，在我们值得纪念的岁月里一同战斗、共度荣耀！(๑•̀ㅂ•́)و✧',
  '昔日埋藏在山沟海角之中的宝藏早已失去光彩。但如今有你与我一起寻宝探险，世间万物也都将为我们而亮相！٩(๑^o^๑)۶❤'
]
export const singerTypeMap = {
  华语: 1,
  欧美: 2,
  韩国: 3,
  日本: 4
}
export const singerMap = {
  name: '姓名',
  transName: '中文名',
  trans: '中文名',
  alias: '昵称',
  secondaryExpertIdentiy: '音乐身份',
  briefDesc: '简介',
  albumSize: '专辑数目',
  musicSize: '单曲数目',
  mvSize: 'mv数目'
}
export const movieKeyMap = {
  img: '封面',
  nm: '电影名称',
  enm: '外文名',
  filmAlias: '又称',
  pubDesc: '上映日期',
  sc: '猫眼评分',
  cat: '影片类型',
  star: '主要演员',
  dra: '影片介绍',
  watched: '已看人数',
  wish: '想看人数',
  ver: '支持播放规格',
  src: '片源地',
  dur: '时长',
  oriLang: '语言',
  videoName: '预告',
  videourl: '',
  photos: '剧照'
}
export const cities = [
  '石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市', '太原市',
  '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市', '呼和浩特市', '包头市',
  '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟',
  '沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市',
  '朝阳市', '葫芦岛市', '长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市',
  '哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市',
  '绥化市', '南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市',
  '泰州市', '宿迁市', '杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市',
  '丽水市', '合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市',
  '宿州市', '六安市', '亳州市', '池州市', '宣城市', '福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市',
  '龙岩市', '宁德市', '南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市',
  '上饶市', '济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市',
  '临沂市', '德州市', '聊城市', '滨州市', '菏泽市', '郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市',
  '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '武汉市', '黄石市',
  '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市',
  '长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市',
  '娄底市', '广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市',
  '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市', '南宁市', '柳州市',
  '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市',
  '海口市', '三亚市', '三沙市', '儋州市', '成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市',
  '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '贵阳市', '六盘水市',
  '遵义市', '安顺市', '毕节市', '铜仁市', '昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市',
  '拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市',
  '汉中市', '榆林市', '安康市', '商洛市', '兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市',
  '酒泉市', '庆阳市', '定西市', '陇南市', '西宁市', '海东市', '银川市', '石嘴山市', '吴忠市', '固原市', '中卫市', '乌鲁木齐市',
  '克拉玛依市', '吐鲁番市', '哈密市'
]
export const translateLangSupports = [
  { code: 'ar', label: '阿拉伯语', abbr: '阿', alphabet: 'A' },
  { code: 'de', label: '德语', abbr: '德', alphabet: 'D' },
  { code: 'ru', label: '俄语', abbr: '俄', alphabet: 'E' },
  { code: 'fr', label: '法语', abbr: '法', alphabet: 'F' },
  { code: 'ko', label: '韩语', abbr: '韩', alphabet: 'H' },
  { code: 'nl', label: '荷兰语', abbr: '荷', alphabet: 'H' },
  { code: 'pt', label: '葡萄牙语', abbr: '葡', alphabet: 'P' },
  { code: 'ja', label: '日语', abbr: '日', alphabet: 'R' },
  { code: 'th', label: '泰语', abbr: '泰', alphabet: 'T' },
  { code: 'es', label: '西班牙语', abbr: '西', alphabet: 'X' },
  { code: 'en', label: '英语', abbr: '英', alphabet: 'Y' },
  { code: 'it', label: '意大利语', abbr: '意', alphabet: 'Y' },
  { code: 'vi', label: '越南语', abbr: '越', alphabet: 'Y' },
  { code: 'id', label: '印度尼西亚语', abbr: '印', alphabet: 'Y' },
  { code: 'zh-CHS', label: '中文', abbr: '中', alphabet: 'Z' }
]
