import MarkdownIt from 'markdown-it'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)
export const urlRegex = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:((?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?)(?:\/[\w\u00a1-\uffff$-_.+!*'(),%]+)*(?:\?(?:[\w\u00a1-\uffff$-_.+!*(),%:@&=]|(?:[\[\]])|(?:[\u00a1-\uffff]))*)?(?:#(?:[\w\u00a1-\uffff$-_.+!*'(),;:@&=]|(?:[\[\]]))*)?/i
export const md = new MarkdownIt({
  html: true,
  breaks: true
})
export const movieKeyMap = {
  img: '封面',
  nm: '电影名称',
  enm: '外文名',
  filmAlias: '又称',
  sc: '猫眼评分',
  cat: '影片类型',
  star: '主要演员',
  dra: '影片介绍',
  ver: '支持播放规格',
  src: '片源地',
  dur: '时长',
  oriLang: '语言',
  pubDesc: '上映时间',
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
export const hotMovie = {
  movieDetails: [
    {
      folder: 'https://p0.pipi.cn/mmdb/fb738671be10fab860281ec0afaeb3403530a.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1228,
      nm: '天空之城',
      enm: 'CASTLE IN THE SKY/天空の城ラピュタ',
      filmAlias: 'Tenkû no shiro Rapyuta,Laputa: Castle in the Sky,天空の城ラピュタ',
      sc: 9.6,
      cat: '动画,冒险,家庭,奇幻',
      star: '田中真弓,横泽启子,初井言荣',
      dra: '小号一响、热泪盈眶，全被治愈，被爱与美好包围，这就是独一无二的宫崎骏的《天空之城》。2023年夏天，这个儿童节，疗愈鼓舞所有人的机会只此一次！让所有人孩子与曾经的孩子重享美好。',
      ver: '中国巨幕2D/CINITY 2D/2D',
      src: '日本',
      dur: '125分钟',
      oriLang: '国语,日语',
      pubDesc: '2023-06-01 08:00中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb7386719ab92357e216bd36002d74e8efa85.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1298450,
      nm: '蜘蛛侠：纵横宇宙',
      enm: 'Spider-Man: Across The Spider-Verse',
      filmAlias: '蜘蛛侠：纵横宇宙（上）,蜘蛛侠：平行宇宙2,蜘蛛俠：飛躍蜘蛛宇宙（港）',
      sc: 9.4,
      cat: '动画,动作,科幻',
      star: '沙梅克·摩尔,彭昱畅,海莉·斯坦菲尔德',
      dra: '奥斯卡最佳动画长片续作《蜘蛛侠：纵横宇宙》呈现了脑洞大开、潮流酷炫的视听风格。影片讲述了新生代蜘蛛侠迈尔斯携手蜘蛛格温，穿越多元宇宙踏上更宏大的冒险征程的故事。面临每个蜘蛛侠都会失去至亲的宿命，迈尔斯誓言打破命运魔咒，到属于自己的英雄之路。而这个决定和蜘蛛侠2099所领军的蜘蛛联盟产生了极大冲突，一场以一敌百的蜘蛛侠大战即将拉响！',
      ver: 'IMAX 2D/杜比影院 2D/中国巨幕2D/CINITY 2D/2D',
      src: '美国',
      dur: '140分钟',
      oriLang: '英语,国语',
      pubDesc: '2023-06-02 09:00中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb738687b5351bbe2a395b44c7f48c1f8d8cf.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 343035,
      nm: '速度与激情10',
      enm: 'Fast X',
      filmAlias: '玩命关头10,狂野時速10（港）,Fast & Furious 10,速激',
      sc: 8.9,
      cat: '动作',
      star: '范·迪塞尔,米歇尔·罗德里格兹,杰森·莫玛',
      dra: '当家人们陷入危机，唐老大（范·迪塞尔饰）为救飞车家族再度出山。终途启程，这场前所未有的疾速狂飙，你准备好了吗？',
      ver: 'IMAX 3D/IMAX 2D/杜比影院 2D/中国巨幕3D/中国巨幕2D/CINITY 3D/3D/2D',
      src: '美国',
      dur: '141分钟',
      oriLang: '国语,英语',
      pubDesc: '2023-05-17中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb7386718d3e7acbae7a35cfcf6d28513113e.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1451323,
      nm: '人生路不熟',
      enm: 'GODSPEED',
      filmAlias: undefined,
      sc: 9.4,
      cat: '喜剧,剧情',
      star: '乔杉,范丞丞,马丽',
      dra: '超两千万人认证的高分喜剧！爆笑之外收获燃泪感动！乔杉、范丞丞、马丽、张婧仪、常远、田雨、尹正笑闹囧途！车队大佬周东海（乔杉饰）和老婆霍梅梅（马丽饰）阴差阳错地与女儿周微雨（张婧仪饰）及女儿的男朋友万一帆（范丞丞饰）同行驾，踏上人生路不熟的探亲之旅，周东海决定借此机会给准女婿来一场全方位无死角的考察，万一帆也用生命演绎了什么叫做教科书级翻车。一路上先后遭遇周东海死对头“添堵专业户”贾主任（田雨饰）的房车事故、微雨“青梅竹马”光子(常远饰)的“野鸡”山山醉酒闹剧、捉拿公路贼团“油耗子”的围堵大战，鸡飞狗跳的探亲之旅窘态百出，爆笑不断！',
      ver: 'IMAX 2D/中国巨幕2D/CINITY 2D/2D/4DX',
      src: '中国大陆',
      dur: '100分钟',
      oriLang: '国语',
      pubDesc: '2023-04-28 18:00中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb7386719abb12be2ab8608dd5a8bf699b34b.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1481984,
      nm: '哆啦A梦：大雄与天空的理想乡',
      enm: '映画ドラえもん のび太と空の理想郷',
      filmAlias: '哆啦A梦：大雄与天空乌托邦、哆啦A梦：大雄与天空桃花源、哆啦A梦：大雄与天空幻想乡、哆啦A梦：大雄与天空伊甸园',
      sc: 9.2,
      cat: '动画,冒险',
      star: '哆啦A梦,大雄,水田山葵',
      dra: '天空大冒险，出发！哆啦A梦与大雄驾驶着具有时光跳跃机能的“时光齐柏林飞艇”，为了寻找⾃古以来许多冒险家梦寐以求的亚特兰提斯和⻰宫城等每个人都曾想象过的梦幻之地，在空中展开了⼀场⼤冒险......',
      ver: 'CINITY 2D/2D',
      src: '日本',
      dur: '108分钟',
      oriLang: '国语,日语',
      pubDesc: '2023-06-01 09:00中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb738671be151b8ea3d236ee9a5ea5392606f.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 341224,
      nm: '银河护卫队3',
      enm: 'Guardians of the Galaxy Vol. 3',
      filmAlias: '银护3,銀河守護隊3（港）',
      sc: 9.2,
      cat: '动作,科幻,冒险',
      star: '克里斯·帕拉特,佐伊·索尔达娜,戴夫·巴蒂斯塔',
      dra: '银河护卫队全员回归，寻觅身世记忆，迎战全新危机，携手踏上最后一次旅程。',
      ver: 'IMAX 3D/IMAX 2D/杜比影院 3D/中国巨幕3D/CINITY 3D/3D/2D',
      src: '美国',
      dur: '150分钟',
      oriLang: '国语,英语',
      pubDesc: '2023-05-05中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb7386877a3ddd50c8537c28e942a908d8890.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1300115,
      nm: '温柔壳',
      enm: 'Awakening Spring',
      filmAlias: undefined,
      sc: 9.1,
      cat: '爱情,剧情',
      star: '王子文,尹昉,咏梅',
      dra: '华语爱情电影获奖佳作，王子文尹昉突破演绎极致戳心爱恋，冲破世俗勇敢相爱。在觉晓（王子文饰）人生最艰难的低潮点，戴春（尹昉饰）的出现像一抹阳光冲破了黑暗。封闭的环境里，两人从相识到相爱，用爱情编织幸福的可能，也将对方从沉的迷雾中拯救出来。随着美好生活的继续，现实的考验也向他们的爱情暗袭而来，他们还能成为彼此眼中最好的那个人吗？',
      ver: '2D',
      src: '中国大陆',
      dur: '104分钟',
      oriLang: '国语',
      pubDesc: '2023-05-26 18:00中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb7386870300fa7a35e5bc615562b8e6bafcd.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1446250,
      nm: '巧虎奇幻舞台历险记',
      enm: 'Qiaohu And The Fantastic Magic Circus',
      filmAlias: undefined,
      sc: 0,
      cat: '动画',
      star: '李晔,罗玉婷,沈达威',
      dra: '魔术表演团要来巧虎岛表演了！小伙伴们都很兴奋。主演帽子船长的竟然是一位名叫玛丽的白虎小女孩，可惜魔术团的帐篷被调皮捣蛋的小布和他的伙伴们搞得一团糟，猩猩团长正准备取消这次表演的时候，巧虎带着他的小伙伴，邀请了巧虎岛上的朋友们、小朋友们一起来帮忙。另一方面，饰演帽子船长的玛丽对于自己的表演也没有信心，巧虎就担负起鼓励玛丽的责任，但他和玛丽却被意外地吸进了魔法皮包里。他们发现，魔法皮包里竟然别有洞天。',
      ver: '2D',
      src: '中国大陆',
      dur: '75分钟',
      oriLang: '国语',
      pubDesc: '2023-06-01中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb73860202f5bf8ea32ff789179d3ff804532.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1297465,
      nm: '小美人鱼',
      enm: 'The Little Mermaid',
      filmAlias: '小美人鱼真人版,迪士尼版小美人鱼,The Little Mermaid (2023),小魚仙 (2023)（港）',
      sc: 7.6,
      cat: '音乐',
      star: '海莉·贝利,乔纳·豪尔·金,戴维德·迪格斯',
      dra: '小美人鱼爱上人类王子，为了与王子在一起，她牺牲了自己的声音、忍着巨大痛苦把自己变成人类，但王子却与公主结婚了。小美人鱼没有杀死王子以变回美人鱼，而是选择牺牲了自己，最终她得到了一个永恒的灵魂。',
      ver: 'IMAX 2D/杜比影院 3D/中国巨幕3D/CINITY 3D/3D/2D',
      src: '美国',
      dur: '136分钟',
      oriLang: '英语,国语',
      pubDesc: '2023-05-26中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb7386bee7ac7e338fd7c316918ec78e573ba.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1383605,
      nm: '灌篮高手',
      enm: 'The First Slam Dunk',
      filmAlias: '灌篮高手电影版,Slam Dunk,The First Slam Dunk,男兒當入樽（港）',
      sc: 9.2,
      cat: '动画,青春,热血',
      star: '宫城良田,三井寿,流川枫',
      dra: '影片讲述全民期待了27年的全国大赛。宫城良田、三井寿、流川枫、樱木花道和赤木刚宪终于站在全国大赛的赛场，代表湘北高中与日本最强球队山王工业展开激烈对决。上半场两队势均力敌，下半场在山王盯人战术的高压之下，湘北节节落败。面强大的对手和几乎不可能追回的悬殊分差，湘北五人组能够再一次践行永不言弃的精神，突破自我团结一致，在这场生死大战中反败为胜吗？',
      ver: 'IMAX 2D/中国巨幕2D/CINITY 2D/2D',
      src: '日本',
      dur: '124分钟',
      oriLang: '国语,日语',
      pubDesc: '2023-04-20中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb73868787a807cbae71f74de48b058b8a09d.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1461072,
      nm: '长空之王',
      enm: 'Born to Fly',
      filmAlias: '長空之王（港）',
      sc: 9.6,
      cat: '剧情,动作',
      star: '王一博,胡军,于适',
      dra: '发动机骤停甚至失火，飞机失去控制......高空之上，雷宇（王一博饰）等年轻试飞员在队长张挺（胡军饰）的带领下，一次次与死神过招，只为获取最极限的数据，试出最新型隐身战机。但随着战机交付日期的临近，任务难度逐渐升级。生死一线，他们能否凯旋……笑泪燃爽俱全，全家都爱看的电影，唤醒孩子们对蓝天的向往。五一首选，高分佳作，正在热映中。',
      ver: 'IMAX 2D/杜比影院 2D/中国巨幕2D/CINITY 2D/2D/4DX',
      src: '中国大陆',
      dur: '128分钟',
      oriLang: '国语',
      pubDesc: '2023-04-28 09:00中国大陆上映'
    },
    {
      folder: 'https://p0.pipi.cn/mmdb/fb7386beb53ddd338f07ac311aa9711648537.jpg?imageMogr2/thumbnail/2500x2500%3E',
      id: 1250896,
      nm: '超级马力欧兄弟大电影',
      enm: 'The Super Mario Bros. Movie',
      filmAlias: 'スーパーマリオ,超级马里奥兄弟大电影,超级马力欧兄弟大电影,超級瑪利歐兄弟大電影（港）',
      sc: 9.3,
      cat: '动作,喜剧,动画',
      star: '克里斯·帕拉特,安雅·泰勒-乔伊,查理·戴',
      dra: '影片改编自任天堂经典游戏。企鹅冰雪王国遭到入侵能否逆袭？马力欧和他的兄弟路易吉如何拯救世界？童年经典大银幕重启，精彩冒险即将上演。',
      ver: 'IMAX 3D/杜比影院 3D/中国巨幕3D/CINITY 3D/3D',
      src: '美国',
      dur: '93分钟',
      oriLang: '国语,英语',
      pubDesc: '2023-04-05中国大陆上映'
    },
    {
      folder: '',
      id: 1433776,
      nm: '变形金刚：超能勇士崛起',
      enm: 'Transformers: Rise of the Beasts',
      filmAlias: '变形金刚7：群兽崛起,变形金刚7,变形金刚：万兽崛起(台),真人版超能勇士,變形金剛：狂獸崛起（港）',
      sc: 0,
      cat: '动作,科幻,冒险',
      star: '擎天柱,擎天圣,大黄蜂',
      dra: '2023年顶级大银幕视觉盛宴来袭！时隔5年，变形金刚震撼归来！故事重返上世纪90年代，终极反派宇宙大帝从天而降，驱使以天灾为首的恐惧兽掀起地球危机。绝境之中，蛰伏许久的巨无霸终觉醒，联合汽车人变形出发！一场前所未有的史诗决战 即将上演！《变形金刚：超能勇士崛起》将于6月9日全国献映。',
      ver: 'IMAX 3D/IMAX 2D/杜比影院 2D/中国巨幕3D/中国巨幕2D/CINITY 3D/3D/2D',
      src: '美国',
      dur: '128分钟',
      oriLang: '英语,国语',
      pubDesc: '2023-06-09中国大陆上映'
    },
    {
      folder: '',
      id: 1466121,
      nm: '新猪猪侠大电影·超级赛车',
      enm: 'Racing 72H',
      filmAlias: '猪猪侠大电影·竞速之城',
      sc: 8.6,
      cat: '动画,冒险,喜剧',
      star: '陆双,徐经纬,陈志荣',
      dra: '竞速之城，一座悬浮在空中的赛车城市。正受邀出席最新赛季开幕式的超星特工猪猪侠，意外接到紧急任务：支撑悬浮的竞速之星被盗，城市即将坠毁，猪猪侠必须在72小时内找回能源。一场惊险刺激的冒险赛程，就此展开。',
      ver: '2D',
      src: '中国大陆',
      dur: '85分钟',
      oriLang: '国语',
      pubDesc: '2023-04-29 08:00中国大陆上映'
    },
    {
      folder: '',
      id: 1480580,
      nm: '刀剑神域进击篇：暮色黄昏',
      enm: '劇場版 ソードアート・オンライン プログレッシブ 冥き夕闇のスケルツォ',
      filmAlias: '刀劍神域劇場版 -Progressive- 陰沉薄暮的詼諧曲(港)，刀剑神域 进击篇 黯淡黄昏的谐谑曲 劇場版',
      sc: 8.3,
      cat: '动作,动画',
      star: '松冈祯丞,户松遥,井泽诗织',
      dra: '世界首个VRMMORPG游戏《SwordArtOnline》成为了“死亡游戏”。距1万名用户被困在游戏中一事发生，已有一个多月。攻略了钢铁浮游城“艾恩葛朗特”第一层后，亚丝娜继续与桐人搭档，以最顶层为目标继续着旅程。然而，带领玩家攻略游戏的两大精英公会“ALS”（艾恩葛朗特解放队）和“DKB”（龙骑士团）之间爆发了冲突，这背后，有一名神秘人物在暗中行动。在命悬一线的危险战斗中，继“攻略”压力后的另一重“威胁”将桐人和亚丝娜卷入其中。影片根据川原砾同名人气小说改编，将于5月26日全国上 映。',
      ver: '2D',
      src: '日本',
      dur: '101分钟',
      oriLang: '国语,日语',
      pubDesc: '2023-05-26 18:00中国大陆上映'
    },
    {
      folder: '',
      id: 1410386,
      nm: '铃芽之旅',
      enm: 'すずめの戸締まり',
      filmAlias: "Suzume's Door-Locking,Suzume no tojimari,铃芽户缔",
      sc: 9.1,
      cat: '爱情,动画,奇幻',
      star: '原菜乃华,松村北斗,深津绘里',
      dra: '生活在日本九州田舍的17岁少女・铃芽遇见了为了寻找“门”而踏上旅途的青年。追随着青年的脚步，铃芽来到了山上一片废墟之地，在这里静静伫立着一扇古老的门，仿佛是坍塌中存留的唯一遗迹。铃芽仿佛被什么吸引了一般，将手伸向了那扇门… 不久之后，日本各地的门开始一扇一扇地打开。据说，开着的门必须关上，否则灾祸将会从门的那一边降临于现世。星星，夕阳，拂晓，误入之境的天空，仿佛溶解了一切的时间。在神秘之门的引导下，铃芽踏上了关门的旅途。',
      ver: 'IMAX 2D/杜比影院 2D/中国巨幕2D/CINITY 2D/2D',
      src: '日本',
      dur: '122分钟',
      oriLang: '国语,日语',
      pubDesc: '2023-03-24 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1423417,
      nm: '余生那些年',
      enm: 'The Last 10 Years',
      filmAlias: '余生10年',
      sc: 8.8,
      cat: '剧情,爱情',
      star: '小松菜奈,坂口健太郎,山田裕贵',
      dra: '一段以10年为期限的生命，一场以10年为倒数的爱情。20岁的高林茉莉（小松菜奈饰）因患罕见病被告知仅剩10年寿命，已经注定结局的命运，却因为在同窗会遇到真部和人（坂口健太郎饰）而产生意外的插曲。爱情的眷恋、亲情的牵念、友情的羁……在余下的时光里，茉莉开始重新思索对待自己和世界的方式——如果生命只剩10年，是否还会去做想做的事，去爱想爱的人？电影改编自同名小说，原作者小坂流加和主人公茉莉一样身患绝症，并于2017年2月文库本发行前夕离世。',
      ver: '2D',
      src: '日本',
      dur: '125分钟',
      oriLang: '国语,日语',
      pubDesc: '2023-05-20中国大陆上映'
    },
    {
      folder: '',
      id: 1455642,
      nm: '宇宙护卫队：风暴力量',
      enm: 'COSMICREW: STORM FORCE',
      filmAlias: undefined,
      sc: 8.9,
      cat: '动画,冒险',
      star: '李靖,刘蕊,姜英俊',
      dra: '十年前，风暴的父亲和族人在和狂岚博士的战斗中失踪。如今风暴已成为宇宙护卫队的队长，并偶然间得知父亲可能和狂岚博士一同被困在异时空中。于是风暴和伙伴们通过制造时空缝隙来到异时空，并找到了消失的蓝虎族。',
      ver: '2D',
      src: '中国大陆',
      dur: '94分钟',
      oriLang: '国语',
      pubDesc: '2023-04-29 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1379055,
      nm: '请别相信她',
      enm: 'Too Beautiful Too Lie',
      filmAlias: undefined,
      sc: 9,
      cat: '爱情,喜剧',
      star: '章若楠,吴昱翰,吴彦姝',
      dra: '章若楠惊喜搭档吴昱翰，今年520不可错过的爱情喜剧电影！“江湖女骗子”白娜（章若楠饰）与“小镇憨憨男”方耀东（吴昱翰饰）在船上不打不相识，谁料冤家路窄白娜阴差阳错竟被当成方耀东媳妇，受到方家人的热情款待。而方耀东为了戳穿白娜 谎言、赢回家人信任，与白娜斗智斗勇惹出笑料不断，家庭保卫战一触即发，“女骗子”与“男憨憨”高手过招会如何相爱相杀？',
      ver: '2D',
      src: '中国大陆',
      dur: '106分钟',
      oriLang: '国语',
      pubDesc: '2023-05-20 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1417368,
      nm: '造梦之家',
      enm: 'The Fabelmans',
      filmAlias: undefined,
      sc: 0,
      cat: '剧情,家庭',
      star: '米歇尔·威廉姆斯,保罗·达诺,塞斯·罗根',
      dra: '本片是斯皮尔伯格受成长经历启发的初心之作，讲述了主人公萨姆·法贝尔曼（加布里埃尔·拉贝尔饰）的成长经历。萨姆从小就爱上了电影，并尝试创作属于自己的电影。这一兴趣得到了他的艺术家母亲米兹（米歇尔·威廉姆斯饰）、计算机工程师父亲伯特（保罗·达诺饰）以及家中其他人的一致支持。如果说电影是造梦的艺术，那么法贝尔曼一家就是一个“造梦之家”。多年之后，萨姆已成长为一个天才的少年导演，凭热爱创作出一部部令人惊喜的业余电影。但意外的是，通过摄影机的镜头，他发现了 一个关于母亲的心碎真相。而这将改变他与整个家庭的未来。',
      ver: 'CINITY 2D/2D',
      src: '美国',
      dur: '151分钟',
      oriLang: '英语,国语',
      pubDesc: '2023-05-25 18:00中国大陆上映'
    },
    {
      folder: '',
      id: 1419058,
      nm: '乔治娅',
      enm: 'Georgia',
      filmAlias: 'GeoGeo和她的好朋友',
      sc: 0,
      cat: '剧情,儿童,家庭',
      star: '乔治娅,王柠,陈齐',
      dra: '三岁小女孩乔治娅，为了帮助已经死去的小流浪狗找妈妈自己却意外走丢，当她和因为父母离异缺失家庭温暖的少年相遇后，乔治娅的纯洁、善良、信任和爱，让原本就是一个正直善良的男孩，更加坚定信念，勇敢的面对现实。也让自己即将破碎的庭重获温暖!',
      ver: '2D',
      src: '中国大陆',
      dur: '88分钟',
      oriLang: '国语',
      pubDesc: '2023-06-03中国大陆上映'
    },
    {
      folder: '',
      id: 1443511,
      nm: '这么多年',
      enm: 'All These Years',
      filmAlias: undefined,
      sc: 8.9,
      cat: '爱情,青春,家庭',
      star: '张新成,孙千,刘丹',
      dra: '你想象过和前任久别重逢的场景吗？你会抱紧，还是逃离？从小生活在重男轻女环境中的女孩陈见夏（孙千饰），在振华中学遇见了叛逆却善良的浑小子李燃（张新成饰），他成为陈见夏生活里的唯一光亮。他们彼此救赎，却又遗憾分开。多年后，逢的那刻才明白，以为是反复地爱上你，原来是，我一直没有停止过爱你。',
      ver: '2D',
      src: '中国大陆',
      dur: '116分钟',
      oriLang: '国语',
      pubDesc: '2023-04-28 18:00中国大陆上映'
    },
    {
      folder: '',
      id: 1308844,
      nm: '复合吧！前任',
      enm: 'Ex：Fall In Love Again',
      filmAlias: '奋斗吧，青年',
      sc: 0,
      cat: '爱情,喜剧',
      star: '张一鸣,于文文,王成思',
      dra: '“我可以错过任何人，但唯独不想错过你。”上官江春（张一鸣饰）与女友陈星星（于文文饰）相恋多年，蜗居大城市里打拼，虽然坎坷但女友一直悉心陪伴。当一切苦尽甘来，上官江春却在名利中迷失...他把她弄丢了才知道自己有多崩溃，原来互 相深爱的两个人也会走散，嘴上说着走了，但心里却想着回头。如果再勇敢一次，我们的结局会不会不一样？',
      ver: '2D',
      src: '中国大陆',
      dur: '93分钟',
      oriLang: '国语',
      pubDesc: '2023-05-13中国大陆上映'
    },
    {
      folder: '',
      id: 341210,
      nm: '闪电侠',
      enm: 'The Flash',
      filmAlias: '闪电侠：闪点,Flashpoint,閃電俠（港）',
      sc: 0,
      cat: '动作,冒险,奇幻',
      star: '埃兹拉·米勒,迈克尔·基顿,萨莎·卡莱',
      dra: '巴里用自己的超能力重返过去，想要改变历史、拯救自己的家人，然而他的所作所为，也在无意间改变了未来。在这个新的未来里，佐德将军回归，并威胁要毁灭世界。巴里孤立无援，除非他能劝动一位非常不同且已隐退的蝙蝠侠重出江湖，并拯救囚禁的氪星人——尽管这位并不是他所熟悉的超人。最终，为了拯救他身处这个世界，并回到他熟知的未来，巴里惟一的希望就是为命运而极速狂奔。不过，即使巴里做出最终极的牺牲……他真的能让整个宇宙都重归正轨吗？',
      ver: 'IMAX 2D/杜比影院 2D/中国巨幕2D/CINITY 2D/2D',
      src: '美国',
      dur: '0分钟',
      oriLang: '英语,国语',
      pubDesc: '2023-06-16 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1435124,
      nm: '神兜兜和奶爸',
      enm: 'DOUDOU',
      filmAlias: undefined,
      sc: 0,
      cat: '儿童,励志',
      star: '钭皓倍,钭晨熙',
      dra: '2020年4月，神兜兜童装店被迫停止营业，本想回老家散心的阿钭，看到女儿兜兜想上幼儿园，但是幼儿园又暂时不开学，读万卷书行万里路，于是他选择了带着四岁的女儿兜兜骑行去拉萨。他们一路骑行，一路记录，美好的风景，温馨的父女亲情，获得了众人关注，得到了越来越多人的赞赏和帮助，也引来了网友的争论和质疑。在这场骑行中阿钭经历了多次信仰与现实困难的心路斗争，父亲以身作则给教会女儿很多道理，女儿也温馨的给予父亲艰难骑行继续下去的勇气，这次旅程即是父亲送给女儿的场特殊的生日礼物，父亲本身也通过一场骑行完成了一场自我救赎与治愈，他们历时71天行程4139公里成功抵达拉萨。他用行动向观众展示了“父亲”二字的含义，在年轻父亲身上也展现了当代年轻人在面对人生困惑时那种不服输的奋斗精神，也体现了社会主主大家庭的温暖，这是一部包含了青春、亲情、励志、爱国、展示了当下中国新生活方式的影片。',
      ver: '2D',
      src: '中国大陆',
      dur: '103分钟',
      oriLang: '国语',
      pubDesc: '2023-06-01中国大陆上映'
    },
    {
      folder: '',
      id: 1261245,
      nm: '极寒之城',
      enm: 'The Coldest City',
      filmAlias: '红.尘',
      sc: 0,
      cat: '动作,悬疑,剧情',
      star: '夏雨,李立群,谭凯',
      dra: '1944年，枪手顾念受挚友方平之临终委托，来到滨城送交遗物，顾念来到滨城后得知，方家几年前就惨遭灭门。顾念决定留在滨城暗中调查杀害方家的幕后真凶。此后的一年，顾念冒名“方平”开始逐一暗杀所怀疑的各派恶人。时间来到了1945年抗战利，伪满洲国暂由苏军接管。为掩饰身份,顾念便受雇于货场码头老板仲震，在其手下谋了个枪客的差事。此时的仲震在滨城的黑白两道如日中天，顾念也为接下来的复仇行动找到了最好的隐蔽所。蛰伏在郊外裁缝铺里的枪手老焦，嫉恶如仇，滨城的暗黑势力一直是他暗杀的目标。提及老焦滨城的各帮派均闻之色变。1944年的冬夜，顾念受仲震之命追踪到老焦的藏身之所，欲取其性命交差。然而，在二人一番交锋后，关于方家遭灭门事件的蛛丝马迹开始逐渐清晰。影片揭示了人性的不同层面，在这个物欲横流的时代每个人都有两幅面孔。一个关于信守承诺，舍身成仁的史诗传奇故事也就此拉开帷幕。',
      ver: '中国巨幕2D/CINITY 2D/2D',
      src: '中国大陆',
      dur: '120分钟',
      oriLang: '国语',
      pubDesc: '2023-06-10中国大陆上映'
    },
    {
      folder: '',
      id: 1413255,
      nm: '疯狂小世界',
      enm: 'Crazy World',
      filmAlias: undefined,
      sc: 0,
      cat: '动画,冒险,合家欢',
      star: '苏倩芸,张艺雯,张成杰',
      dra: '邪恶的蝗爷攻陷了湖心岛。势力大增的它将黑手伸向了整座森林，所有生灵都岌岌可危。虾宝成为众人唯一的希望，从此虾宝踏上了寻找光明之力“真元”的道路。只要掌握了真元，就能战胜蝗爷，让和平与光明再现。',
      ver: '3D/2D',
      src: '中国大陆',
      dur: '86分钟',
      oriLang: '国语',
      pubDesc: '2023-06-22 10:00中国大陆上映'
    },
    {
      folder: '',
      id: 1490684,
      nm: '煞面迷影',
      enm: 'LOST MEMORIES',
      filmAlias: undefined,
      sc: 0,
      cat: '恐怖,惊悚,悬疑',
      star: '周育竹,侯旭,雷承昆',
      dra: '孩子神秘消失，煞面诡影骇人出没，怪异玩偶时隐时现，小孩身驱嵌入墙壁，年轻妈妈踏入惊悚绝境！恐怖背后，暗夜楼顶，二十年前的坠楼亡魂，似已为复仇归来！惊吓不断、迷影丛生、尖叫连连……手术台上，真相揭开的刹那，鬼魅现形、凶相毕，极致恐惧穿越阴阳两界，让所有人不寒而栗！',
      ver: '2D',
      src: '中国大陆',
      dur: '90分钟',
      oriLang: '国语',
      pubDesc: '2023-06-02中国大陆上映'
    },
    {
      folder: '',
      id: 1237938,
      nm: '凌晨两点半2',
      enm: 'At Two Thirty',
      filmAlias: undefined,
      sc: 0,
      cat: '恐怖,悬疑',
      star: '彭剑雄,张露文,王尊',
      dra: '凌晨两点半丑时，阴气最重，禁忌最多。依成和一帮朋友去聚魂灵山的迷踪岭探险，据说这里埋葬着千年不腐女尸，千年不灭之阴火，去迷踪岭的人有去无回。凌晨两点半，依成的弟弟出帐篷上厕所后猛然消失，随后身穿红衣的依成女友也人间蒸发依成寻找队友，进入了无限循环的灵异空间中，不时漂浮着白衣人形物，随时出现的神秘野人，永远走回原点的森林，身后呼唤着自己名字的声音，依成几近绝望崩溃，但更加恐惧的事情却接踵而至……',
      ver: '2D',
      src: '中国大陆',
      dur: '92分钟',
      oriLang: '国语',
      pubDesc: '2023-05-20中国大陆上映'
    },
    {
      folder: '',
      id: 1336792,
      nm: '京门烽火',
      enm: 'The Capital War',
      filmAlias: undefined,
      sc: 0,
      cat: '剧情',
      star: '郭艳,赵亦骥,马国飞',
      dra: '作为中国共产党建党一百周年的献礼之作，电影《京门烽火》聚焦于京西儿女为民族独立，民族自强而浴血奋战的故事。',
      ver: '2D',
      src: '中国大陆',
      dur: '86分钟',
      oriLang: '国语',
      pubDesc: '2023-06-09中国大陆上映'
    },
    {
      folder: '',
      id: 1353959,
      nm: '海门一号',
      enm: '',
      filmAlias: undefined,
      sc: 0,
      cat: '剧情',
      star: '郭凯敏,恬妞,刘思艺',
      dra: '两艘海峡两岸的渔船在南海捕鱼遇到台风，渔民共同抗御台风，相互救助结下深厚情义。台湾渔民将两羽信鸽送给大陆少年，随后，因为信鸽，发生了一系列爱情、亲情、骨肉情的人间故事。',
      ver: '2D',
      src: '中国大陆',
      dur: '97分钟',
      oriLang: '国语',
      pubDesc: '2023-06-09中国大陆上映'
    },
    {
      folder: '',
      id: 1414090,
      nm: '醒来2',
      enm: 'Awaken2',
      filmAlias: undefined,
      sc: 0,
      cat: '剧情',
      star: '傅淼,陶慧敏,乔涵',
      dra: '主人公徐丽忙于事业而忽略了对家人的关爱，母亲离世让她体会到了‘子欲养而亲不待’的彻心之痛。孩子抑郁加上公司倒闭把她推向痛苦深渊。在家人和社会的关心下，徐丽从噩梦中醒来......',
      ver: '2D',
      src: '中国大陆',
      dur: '93分钟',
      oriLang: '国语',
      pubDesc: '2023-05-18中国大陆上映'
    },
    {
      folder: '',
      id: 1496581,
      nm: '不孤岛',
      enm: 'AN ISLE',
      filmAlias: undefined,
      sc: 0,
      cat: '纪录片',
      star: '田哉妹,程建勇,苏群茵',
      dra: '2022年3月6日，隔断香港与深圳的铁丝网被火焰割开，中央援港应急医院及落马洲方舱设施基建工程火速展开，16000建设者迅速投入工程建设。24小时人声鼎沸、机器轰鸣，生活区、办公区、方舱区、隔离区、治疗区等等飞快建成，全体建设人员 不舍昼夜、全力以赴，用不到两个月的时间完成需要两年才能完成的任务。本片忠实记录了建设过程中普通人的感人故事，记录内地与香港守望相助的点点滴滴，记录中国速度、建设奇迹，记录共克时艰、戮力同心，记录以命保命、以心暖心。',
      ver: '2D',
      src: '中国大陆',
      dur: '83分钟',
      oriLang: '国语',
      pubDesc: '2023-05-26中国大陆上映'
    },
    {
      folder: '',
      id: 1470379,
      nm: '我爱你！',
      enm: 'Love Never Ends',
      filmAlias: undefined,
      sc: 0,
      cat: '剧情,爱情,家庭',
      star: '倪大红,惠英红,梁家辉',
      dra: '你是否想过自己会如何老去？四个花甲老人，两段迟暮之恋，他们的爱善良而纯粹、浪漫又浓烈。在生命这段有限的旅程里，趁还来得及，我要对你说声“我爱你！”。',
      ver: '2D',
      src: '中国大陆',
      dur: '116分钟',
      oriLang: '国语',
      pubDesc: '2023-06-21中国大陆上映'
    },
    {
      folder: '',
      id: 1384453,
      nm: '透明侠侣',
      enm: 'Look At Me',
      filmAlias: undefined,
      sc: 0,
      cat: '喜剧,奇幻',
      star: '史策,王皓,孙天宇',
      dra: '如果全世界只有一个人能看见你，你会怎么赖着她？碌碌无为的普通房产中介黄小鹿（史策饰）在一场车祸前救下科技鬼才吴聪（王皓饰），却发现全世界只有她能看见他！原来作为东吴科技创始人的他早前在一场发布会上不幸发生事故，阴差阳错成不可接触不被看见的“透明人”。小鹿为了帮助吴聪“重回人间”，开启“真透明”与“小透明”之间的一场“人鬼不了情”。在这一段相爱相杀的互救之旅中，两人逐渐找回真正的自己。',
      ver: '2D',
      src: '中国大陆',
      dur: '99分钟',
      oriLang: '国语',
      pubDesc: '2023-06-30 18:00中国大陆上映'
    },
    {
      folder: '',
      id: 1396308,
      nm: '魔幻奇缘之宝石公主',
      enm: 'Princess Gem',
      filmAlias: undefined,
      sc: 0,
      cat: '动画,冒险,合家欢',
      star: '张艺雯,唐宗泽,吴凡',
      dra: '宝石公主由于眼泪可以变成宝石，因此从小便被巫婆从城堡里偷偷抱走，送给邻近的国王，被国王软禁在皇宫内。出于对外面世界的好奇以及对自由的向往，宝石公主在大盗司马森的帮助下逃出皇宫，一场奇妙的冒险就此展开，前方等待她的将会是么呢？',
      ver: '3D/2D',
      src: '中国大陆',
      dur: '81分钟',
      oriLang: '国语',
      pubDesc: '2023-04-29 10:00中国大陆上映'
    },
    {
      folder: '',
      id: 1367022,
      nm: '生命中最特别的朋友',
      enm: 'Envole-moi/Fly Me Away',
      filmAlias: 'Fly Me Away,带我飞',
      sc: 0,
      cat: '剧情',
      star: '维克多·贝尔蒙多,热拉尔·朗万,约安·厄隆都',
      dra: '至死不渝的友情，胜过每场敷衍的关系。富二代托马斯游手好闲拒绝长大，被迫照顾一个身患先天疾病、随时会危及生命的男孩马库斯。对他们来说，对方的出现就像一束光，照亮了原本灰暗的世界。然而人生有一百次失望的时刻，就有一百零一次朋友的爱打捞的瞬间。这只有一次的人世间，他们彼此鼓励、相互救赎，只要对方热烈、而又自在的活着。',
      ver: '2D',
      src: '法国',
      dur: '91分钟',
      oriLang: '国语,法语',
      pubDesc: '2023-05-26 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1434052,
      nm: '保你平安',
      enm: 'Post Truth',
      filmAlias: undefined,
      sc: 9.3,
      cat: '剧情,喜剧',
      star: '大鹏,李雪琴,尹正',
      dra: '落魄中年魏平安以直播带货卖墓地为生，他的客户韩露过世后被造谣抹黑，魏平安路见不平，辟谣跑断腿，笑料频出，反转不断，而他自己也因此陷入到新的谣言和网暴之中。',
      ver: 'IMAX 2D/中国巨幕2D/CINITY 2D/2D',
      src: '中国大陆',
      dur: '112分钟',
      oriLang: '国语',
      pubDesc: '2023-03-10 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1499840,
      nm: '今日方长',
      enm: 'The Long Today',
      filmAlias: undefined,
      sc: 0,
      cat: '纪录片',
      star: undefined,
      dra: '在这个充满不确定性的时代里，户外探险者们也越发珍视当下的拥有，无论是它是去往山野的机会，还是陪伴家人的时刻：挪威海岸的雪山脚下等待风暴过境所收获的思考与友谊，远比在家看着电视那一小时要多；2次打入冬奥会、世界单板滑雪冠军奥布莱恩，则决定从横冲直撞的竞技生涯中回过头来，认真了解自己的故乡、文化和家人；情侣飞行员安柏·福特埃斯彭·菲德尼斯都是世界级的选手，他们决定在海拔3000米的山上完成一系列极限双人飞行动作，那是他们活到老飞到老挑战的一部分；而真正入老年的纳奥比把全家叫上他亲手制作的独木舟，用漂流探险的方式庆祝70岁的生日……我们终有一天会老去，未来也始终保有它的不确定性。但是，今日方长，来日可期。',
      ver: '2D',
      src: '英国',
      dur: '95分钟',
      oriLang: '英语',
      pubDesc: undefined
    },
    {
      folder: '',
      id: 1499841,
      nm: '奇妙六维',
      enm: 'Six Dimensions of Awesomeness',
      filmAlias: undefined,
      sc: 0,
      cat: '纪录片',
      star: undefined,
      dra: '准备好了吗？我们要穿越到平行世界的六段奇妙人生第一维《寻浪骆驼》此时此地，化腐朽为神奇。岸边捡来的破旧小船，也能改造为乘风破浪的“战舰”。对富有热情和智慧的冲浪者来说，如果兜里的钱买不到梦想，那就己造一个！第二维《雪脉》条线，牵动内心引力。莫诺德家族三代经营着一家雪具店，也将滑雪的精神刻在家族基因中，即使家族中年轻一代遇到了成长的困惑，这条脉络也会帮助他们找回初心，相信坚持热爱，便能成就伟大。第三维《镜框之外》极限摄影师的空间魔法。在阿尔卑斯斯山身处，一位年轻的摄影师带领一群高空扁带运动员，实现脑海中的壮美画面。第四维《两秒》瞬间即永恒，这是时间的魅力。而在有些瞬间，所有的恐惧、犹豫、怀疑，都荡然无存——比如悬崖跳水运动员安娜·巴德尔在空中那两秒。第五维《荒野米其林》发动五感，拥抱自然。曾经是米其林三星餐厅厨师的约瑟巴·克鲁兹出走了，他开着自己的移动城堡进入自然。他认为创作是自由的，正如他的灵魂。第六维《首攀贾格杜拉》敢做先敢想。1962年，六位女性组成的登山探险队前往喜马拉雅，探寻贾格杜拉山域 。她们对成为“首攀的女性”没什么兴趣，要做就做前无古人的“首攀者”。',
      ver: '2D',
      src: '英国',
      dur: '95分钟',
      oriLang: '英语',
      pubDesc: undefined
    },
    {
      folder: '',
      id: 1433415,
      nm: '南极大穿越',
      enm: 'After Antarctica',
      filmAlias: undefined,
      sc: 0,
      cat: '纪录片',
      star: undefined,
      dra: '1989-1990年，由中、美、英、法、日、苏联共六个国家的探险科考队员组成的国际探险队，历时220天，行进里程6000公里，完成了人类首次徒步+狗拉雪橇横穿南极大陆的远征（Trans-AntarcticaExpedition)，是一项人类探险的壮举。同时，本次险还具有另一个重大意义。探险科考为研究气候变迁搜集了重要数据，并成功凝聚起全人类团结的信念，唤起公众和全球政界领导对南极的关注，最终推动《南极条约》的落实，保护南极免于矿藏和石油开采的命运。当年国际联合探险科考队队长WillSteger r,影片中已经75岁，他是拥有50多年南北两极探险经验的勇者，也是极地和全球气候变化的见证者。《南极大穿越》以Will的视角，将他在2018年最后一次北极单人徒步探险与1989-1990南极大穿越的探险结合起来，通过Will的讲述和当年珍贵且丰富的影像记录既还原了30年前那趟史诗级的探险征程，也通过30年来极地的变化，深入展现了“探险”的意义以及环境对人类的重要性。本片获2021年肯道尔国际山地电影节最佳探险精神影片。',
      ver: '2D',
      src: '美国',
      dur: '107分钟',
      oriLang: '英语',
      pubDesc: '2021-04-09美国上映'
    },
    {
      folder: '',
      id: 1298429,
      nm: '检察风云',
      enm: 'The Procurator',
      filmAlias: undefined,
      sc: 8.3,
      cat: '剧情,犯罪',
      star: '黄景瑜,白百何,王丽坤',
      dra: '根据真实案例改编，黄景瑜白百何领衔年度超敢拍犯罪商业大片。中国首部新时代检察官视角罪案公诉巨制来袭！大学教授夏薇（王丽坤饰）涉嫌故意杀人，舆论发酵失控，多方压力涌来。随着检察官李睿（黄景瑜饰）和同事张有成（王千源饰）对案进行审查，发现作恶多端的富商陈鑫（包贝尔饰）与此案密切相关，一桩深埋多年的旧案被牵出…故意杀人案、强奸案、官商勾结环环相扣，所有人都被迫卷进这场命运的漩涡。李睿与夏薇辩护律师童雨辰（白百何饰）在法庭上激烈交锋，夏薇究竟为何沉   默不语？她的丈夫洪俊山（冯绍峰饰）又隐藏了什么秘密？正邪敌我难辨，无法预料的危机等待着众人…',
      ver: '2D',
      src: '中国大陆',
      dur: '112分钟',
      oriLang: '国语',
      pubDesc: '2023-04-29中国大陆上映'
    },
    {
      folder: '',
      id: 1364066,
      nm: '冥绝村',
      enm: 'Ming Jue Village',
      filmAlias: undefined,
      sc: 0,
      cat: '恐怖,惊悚,悬疑',
      star: '刘浩闻,马继,魏允熙',
      dra: '冥绝村，古老神秘的死亡村落，百年禁忌之地。乱葬野坟，黑鸦枯树，白日迷雾笼罩，阴风阵阵；午夜时分，更是鬼魅飘飘，坟堆纸人转动脖颈，似乎还魂复活，目光邪魅骇人。全村只有一个入口，外人闯入将有进无出；迷离幻境，不见人影，却能人丧命于无形；山野鸟类通灵，为阴阳两界传递音讯……民国时期军阀混战，冥绝村中的黄眼碧玉碑为天下至宝，“入村即死”的诅咒，并不能阻挡不轨之人的疯狂探寻……月黑天高之际，与世隔绝多年的古村骤然间人哭猫叫，刀光血影，枪声大作，那古老神秘的的量终被解开封印，终极恐怖冲出坟茔！',
      ver: '2D',
      src: '中国大陆',
      dur: '102分钟',
      oriLang: '国语',
      pubDesc: '2023-02-17中国大陆上映'
    },
    {
      folder: '',
      id: 1417411,
      nm: '暴风',
      enm: 'Faces in the Crowd',
      filmAlias: '秘密交通站,绝密使命',
      sc: 8.2,
      cat: '剧情,动作,悬疑',
      star: '陈伟霆,王千源,王龙正',
      dra: '上世纪30年代的汕头，王历文（王千源饰）在执行任务的过程中意外重逢昔年好友陈家栋（陈伟霆饰），两兄弟联手调查隐秘任务，神秘人的出现打乱了原本的计划。随着调查深入，兄弟二人之间的角力日渐明显。暴风已至，漩涡中的每个人都在竭扳回一局…',
      ver: '2D/4DX',
      src: '中国大陆',
      dur: '103分钟',
      oriLang: '国语,粤语',
      pubDesc: '2023-04-14 18:00中国大陆上映'
    },
    {
      folder: '',
      id: 1352380,
      nm: '水边维纳斯',
      enm: 'Venus By Water',
      filmAlias: 'Vénus sur la rive',
      sc: 0,
      cat: '剧情',
      star: '李Q,朱惠英,毛敏卓',
      dra: '1992年中国南⽅的⼀间病房⾥，奇奇看着妈妈剪去了长发。妈妈治疗期间，奇奇被送去外婆家⽣活。同⼀屋檐下的⼤姨担负着⼯⼚改制、安置⼯⼈的重任，年轻的表姐渴望长⼤，⼩姨幻想着去美国，过上截然不同的⼈⽣……⼤⼈们想着各⾃的⼼事，奇期待着妈妈回家。',
      ver: '2D',
      src: '中国大陆',
      dur: '100分钟',
      oriLang: '国语',
      pubDesc: '2023-05-19 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1319147,
      nm: '妈妈的礼物',
      enm: '18 Regali/18 Presents',
      filmAlias: '18个礼物,18 Presents',
      sc: 0,
      cat: '剧情',
      star: '维多利亚·普齐尼,贝内黛塔·波尔卡罗利,爱德华多·莱奥',
      dra: '影片根据真人真事改编，讲述了身患绝症的艾丽莎离世前为即将出生的女儿准备了18份礼物，随着女儿安娜的长大，每一年拆礼物成为了安娜的负担。在安娜即将年满18岁的一天晚上，她和父亲争吵后离家出走，却意外地撞上了正怀着孕的妈妈，母俩开始以一种奇妙的方式认识和相处......',
      ver: '2D',
      src: '意大利',
      dur: '115分钟',
      oriLang: '国语,意大利语',
      pubDesc: '2023-05-13 09:00中国大陆上映'
    },
    {
      folder: '',
      id: 1443473,
      nm: '加油吧！乡亲们',
      enm: 'Cheer Up,Folks',
      filmAlias: undefined,
      sc: 0,
      cat: '纪录片',
      star: undefined,
      dra: '该片真实记录了乡村振兴背景下，赣南水西坝村在乡村产业振兴发展中的艰难历程和不同角色坚韧奋进的感人故事，由此引发人们对乡村振兴深层次的思考。让观众不由自主地为他们鼓劲----加油！乡亲们！',
      ver: '2D',
      src: '中国大陆',
      dur: '92分钟',
      oriLang: '国语',
      pubDesc: '2023-05-20中国大陆上映'
    },
    {
      folder: '',
      id: 1411266,
      nm: '川流不“熄”',
      enm: 'A Summer Trip',
      filmAlias: 'A Summer Trip(英),A SUMMER TRIP～僕とじいじ、1300キロの旅(日)',
      sc: 0,
      cat: '剧情,家庭,公路,喜剧',
      star: '杨新鸣,胡昌霖,涂松岩',
      dra: '电影讲述了2008年北京奥运会前夕，与儿子一家生活在南方小镇的爷爷大川，在接到一通关于昔日老战友的电话后，决定独自前往北京完成一项重要的心愿之旅。但这一计划却被放暑假的孙子小松发现，为了跟爷爷大川一起去北京，孙子小松使出了身解数软磨硬泡，终于争得了爷爷大川的同意，从未一起出过远门的爷孙俩踏上了一段令人啼笑皆非的旅程......',
      ver: '2D',
      src: '中国大陆',
      dur: '135分钟',
      oriLang: '国语',
      pubDesc: '2023-05-26 09:00中国大陆上映'
    }
  ],
  otherMovieDetails: [
    {
      id: 1228,
      videoName: '宫崎骏《天空之城》终极预告，六一影院约定一场奇妙之旅',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/91d74ec43270835009247347429/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/94bb90e205b696957052e8651144b8dd.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/75e3f0725c74130d9e62d29d70a682e7.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/5ffc917234be2ea8ff121c69f819ab1c.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/fa1bfcbcc333b1c308655cd8dc85cfd3.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/19a48137cebaf32d96cc91f049041836.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1298450,
      videoName: '《蜘蛛侠：纵横宇宙》开预售 中国独家海报数百蜘蛛侠大闹天宫',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/6abcf3f13270835009233053421/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/41e24a420f8cf9575d0b0ca4784771d8.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/4cd9463d4d4b4a115e50a9d84e776f6b.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/6903b3297f4fb9dcd3e64972b329c07e.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/0745fa75d049973dbdeb3e91fde60e7a.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/9971445f5ab100457323b1f6cfa16dc6.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 343035,
      videoName: '《速度与激情10》首支预告震撼发布，众星云集全擎出击,飞车家族归来！',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/73ad7461243791579428854455/v.f42906.mp4',
      photos: [
        'https://p0.pipi.cn/mmdb/fb73868d71f51b300be19bea0c5bcbf484943.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73868751b2ff87a950c83a29245d2c6d7bc.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb738602c69dddb860501530a446a31bc72ee.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb738602c69dddb8605015f89b8ee9150ddef.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb738602c69dddb8605015c0f9a90d30be339.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1451323,
      videoName: '《人生路不熟》“笑出来！”预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/eaef5316243791581805819109/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/ceefe562fb30da7184cf2ea5c2511fc3.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/77888ec32c9dbdd3863e810a9aea5286.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/a9e480d35952a8c9c2b217cd15ef34e6.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/32d64a4024ecc27cebf1a393a228f1db.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/cab1660afb3f6a86d0a916be0cb6df6d.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1481984,
      videoName: '《哆啦A梦：大雄与天空的理想乡》六一冒险起航 友情不散感动升级',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/9e4d9d273270835009254666844/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/5ef4e1e8b2e158c551f5c0afb1517045.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/21251cf721f4456e53c255894265a0c9.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ab59c6db726fe66c498dd26bf9983c18.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/2c6e4e6079d3c86125a572f2cf69bd98.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/bcb9b515c5ac1cb828cde3b744294d5e.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 341224,
      videoName: '《银河护卫队3》“复联4后漫威最佳”告别 超前口碑',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/9e65fca6243791581923876778/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/mmdb/fb73860292392317899235ea82d5aa28f2c2f.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73868dc7eddd16bdb8607e310d3ad597fa0.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73868d87a5bfe5bc0e13bc7f1983ed775d7.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'http://p0.meituan.net/w.h/movie/a4c4a7d8d7f93862fd30f0c900935f1c61225.jpg@2500w_2500h_1l_0e',
        'https://p0.pipi.cn/basicdata/d2dad592c7e7e139dde19b3a27f7613a7bee4.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1300115,
      videoName: '冲破世俗的爱！《温柔壳》曝终极预告 王子文尹昉电击戏感染力拉满',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/df78a3313270835009160513007/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/13fb4d9709d7383676ebf18435ae4115.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/5fa2fbd5dae20a8bfb937c523a7b834f.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/555d373d84fcffd8df038e45c1f48e20.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/db9d626d5325ae65339f5d3c410dcc17.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/28cee80b2ae29d6d6616fe5c8a6116f1.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1446250,
      videoName: '《巧虎奇幻舞台历险记》终极预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/81e55e053270835009209662369/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/6e21fc9aa3bc407f770aec0921d41b6e.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/617b21c31ee4bc12b9f905577c048bfd.png?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1297465,
      videoName: '《小美人鱼》今日上映，一起踏上蔚蓝冒险',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/9e5d72bf3270835009254672416/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/mmdb/fb738602537ddd7df5e19b7375645402939da.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73869af2addd5015cf3e2ff42b5e6bc2c95.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73869a5bf339e19bb12da38a39d7dda502b.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'http://p0.meituan.net/w.h/movie/d6cc31eb486323dc3f08e9451fe1813f315491.jpg@2500w_2500h_1l_0e',
        'https://p0.pipi.cn/mmdb/fb738602b5351b0e13c7ed31d366b64588e93.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1383605,
      videoName: '电影《灌篮高手》热映曝“运动男孩”版预告 燃爆热血青春五一必看',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/510e91e6243791581797260989/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/ab77000cd542bb20ddc6d438dff342b2.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/9146064f50f66140a7a623a1e8714a21.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/f86784df430325c2c7b2994d30d81fb4.png?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/779549ddda989a4bc21f13b26186833b.png?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/a867347a9d7d43b310e67505104dbe59.png?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1461072,
      videoName: '电影《长空之王》发布“威”版预告 歼-20搏击长空尽显硬核美感',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/581624cc243791581603171715/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/ccd187004dd3e0a0b315669aff760203.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/8d8e2461cbc30d1d87627909f8e726d6.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/dabad771e1188109d18ec16c69c662e4.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/0eeec9045fb08bb192bcfb5256839670.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/acc6b446df2c27d68395f441d8c9d311.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1250896,
      videoName: '《超级马力欧兄弟大电影》首支片段',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/a7445696243791577025384482/v.f42906.mp4',
      photos: [
        'https://p0.pipi.cn/mmdb/25bfd6922c951b0e13ddd25d6efa7c2089c04.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb7386bee7addd2ff711e5b041b3d5022c2ad.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb7386be33851bf0ee537c9e7c9707861efca.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb7386be5bfddd2c9592351671730d34d428c.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb7386be5bfddd2c959235e0ae9e06921b5f4.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1433776,
      videoName: '《变形金刚：超能勇士崛起》发布“决战在即”预告！预售正式开启！',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/c98f2ed83270835009424970220/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/0986ed5dc725f3e79883848f22d88acb.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/9d75dca6e8d81e2c7d1057fe1915f369.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/d74538b048805207591e9c7a9e93ac38.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/281e9ca20e81f197b3f1d6c96604a37d.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/fa44ca5363cca119f19757a20e4199ab.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1466121,
      videoName: '《新猪猪侠大电影·超级赛车》发终极预正式开启预售',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/c52341a9243791581601475230/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/85914fedbf69238405c92033fdfabbca.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/d97e0cf17af9a5c39e4664a9ecdebf1f.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/dd6ac935aa8069c7dd9d66d6559d1360.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/763ad788ecbbab49041b37cdd153145f.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/bb9e5496727aacebe05c4adbb3b0c124.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1480580,
      videoName: '《刀剑神域》终极预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/d59526a33270835009187672091/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/4ebae3ed17f24229b32858d5790fc35e.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/75f338c05730956338fcd1823a38e349.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ffda8ab9422667c4d42cbbedf0a58411.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/12f85f3b7a1bf2b248945765ac695673.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/3c5eda8aa97088351db6676eb50d8722.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1410386,
      videoName: '《铃芽之旅》发布“我是铃芽的明天”片段 跨时空对话温暖感动',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/a172bd35243791581394654432/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/f59c608590cacde96c45e299fb167c9c.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/45b56e49e3aaa498132e512821535f7a.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ef224293f5274862488a7bdc8566352c.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/3fc72212ec69203f0a0f17a0ab27ed9b.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/865b036e9523c056f1e0252952686fc9.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1423417,
      videoName: '电影《余生那些年》看点抢先看 解锁5.20浪漫约会告白指南',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/518cf5f33270835009100355920/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/72423cb682e087535f49988a6299efb3.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/cd38fd138c8da6f964de7da55bc18972.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/7052d703cfb8c7de284332ac1a4e2877.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/cbe1a8efc90aa8d637def06e382a91ee.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ea19ae1d1e13e059df5bdcd222730338.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1455642,
      videoName: '《宇宙护卫队：风暴力量》终极预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/a32b7d78243791581764184391/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/d9aa48b2f220038941d8ab118df096b6.png?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/3d7a6a05b6cd5b145bc1a6e6480dff56.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/d4f95f7d6dd959984db619fb225d448e.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/9a253250b7d79a7776e81f9cd0ad1268.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/f5f0b4ff043b6729894a8dda951b0fcc.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1379055,
      videoName: '《请别相信她》高甜预警”版预告心动来袭 章若楠吴昱翰浪漫约定520',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/10b0863a3270835009004314893/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/3f402fe392b5a6175b2cd3f360b485ae.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ec701613f1a9061a0083c53ba1f82c2e.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/440f2614bca59ec950e2c907d4492ac2.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/37788c199e0bf44a304fc3725ba86a34.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/2fdba076946ed4eb03d463af746d174a.jpeg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1417368,
      videoName: '奥斯卡佳作《造梦之家》终极预告 与电影坠入爱河 ',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/65ee67843270835009094604973/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/f819f88be3415e14a2d6ec196e21faff.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/7a116517efb5376f819baae799c22717.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/c980bbb37e8e39ff19819c4b116231f3.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/531099338c463a19c70bbd6478a0bd2a.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/722ef9ce7577bb029df681a5eb3fa011.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1419058,
      videoName: '《乔治娅》发布终极预告，6月3日正式上映！',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/9923f61c3270835009349026190/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/0e23a497996f96fdd9d99864f460d6f4.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/65221acd660119466fbb4627351c57b7.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/d33841b1e5f62c9de7062afea94bb08f.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/147019d36c050b656ac64bfc86007b8e.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/546ed8f83250bf7fa97adbde78b42c85.jpeg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1443511,
      videoName: '《这么多年》终极预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/a8beea7a243791581716524668/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/a0f5b970fc4e890aec6b04bba34cb7ef.jpeg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/89fc3d60bf453ad371d07214657a86a6.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/b42e374fda59dec89a2f2f1278c766c9.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ee4d6ef1b8ff277dfb0d349b89366f46.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/30fde9cd21c285445b135f72305497fc.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1308844,
      videoName: '电影《复合吧！前任》曝终极预告海报 张一鸣于文文揭示爱情保久秘诀',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/3382d281243791582056788791/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/6e06dad9cef5b27316e172654f2b0925.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/bfd3d80c46934d0137f59e0e7a7b4335.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/00bc8d3fb6e12a5d5765f1fce6a37da1.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/d6dfe829b4bafa6acfb96466ad268e93.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/f01e64f32dab98351caa8951a7f89f03.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 341210,
      videoName: '《闪电侠》社恐超英闪电侠追爱帅不过三秒，神速力竟能这么用',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/a233a8e13270835009410649771/v.f42905.mp4',
      photos: [
        'http://p1.meituan.net/w.h/movie/251751aa8e8c8d6ea5965f877dcda5f641699.jpg@2500w_2500h_1l_0e',
        'http://p1.meituan.net/w.h/movie/1e157ed22be26c00d53b71cf015c7c4c104901.jpg@2500w_2500h_1l_0e',
        'http://p1.meituan.net/w.h/movie/eac3231aaf7ee94b4201312c96d0c72129791.jpg@2500w_2500h_1l_0e',
        'http://p0.meituan.net/w.h/movie/1b1d4069d0c1b1c19b3aa03a4ae3188d113540.jpg@2500w_2500h_1l_0e',
        'http://p0.meituan.net/w.h/movie/391a9d63d8374c9f9149568a73c88eda205042.jpg@2500w_2500h_1l_0e'
      ]
    },
    {
      id: 1435124,
      videoName: '《神兜兜和奶爸》2分钟预告片',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/eb7b7e9c243791581670353869/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/01af4d041638a38c967e660bee5c3d08.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/831c71c4d57d64fc72b7186561f6b749.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/52a431813321e47e89f3220e1c7dc185.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/8d10f117815a66b9669512d4f5b5b07d.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/9f9f8d03cd09d4abbcc54d309fbca53b.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1261245,
      videoName: '电影《极寒之城》起菜版预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/33d22cf4243791582022483865/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/08e0ee65fedc8a09c5243d551a2b03bb.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/264705ad0d837d39d04bcb722bfd31e9.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/a6ee93ee875b0f5173f43cdfc898ccd0.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/9082abbfcdb831a1907c90bb052c42f2.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/df46430a57a4dfcfa018d99ee5620b51.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1413255,
      videoName: '《疯狂小世界》极限冒险版预告',
      videoUrl: 'https://vod.pipi.cn/43903a81vodtransgzp1251246104/324845543270835009446514002/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/1dfe05aa9bcd918ac5cd9121ba913827.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/4d97700559426a9b0442fac3e96b623b.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/1bd860398e86b0f3c345b34c65a2f43b.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/20aaf43349d90db88a39d5f046b83128.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/5927bdbb46221070a7578fde82dbbef8.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1490684,
      videoName: '《煞面迷影》曝映前版预告片：6月2日尸妹索命 终极惊魂！',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/e887aac13270835009214452795/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/b8d4d27901935aed20ae16123fdf1ac5.png?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/18df4b53ea8d6450244a656ad1f1cc66.png?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/e633f59b442742c840228476aa20a3f0.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/cfb2c3124a296c1cb66ddc6fe41700f5.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/9309af67241ab316eebd55e1b54d6ba1.png?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1237938,
      videoName: '恐怖电影《凌晨两点半2》发“移魂幻视”版预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/b0dd3a5b243791581961680196/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/5598fe072edb4b98cfbf8c9b44c566b8.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/a09e8ff9125f37359ab9e260f5909276.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/e67497aad67daf7382434817c85ac547.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/5016761218ebb3f961bfe7d55a179afe.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/2f93de73986fe6ebf50924a931641258.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1336792,
      videoName: '京门烽火预告30秒',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/da7b3e3c3270835009194611606/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/715e001415a202c66ae7dded0264110e.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ccf83e9947b597883c1152cad96d5f0d.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/1c98d89b712cd5c5623a39ac7351074d.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/3e065a94da3bc3955367739131eca344.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/722a4d2eff680f0938cc8a59054af59c.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1353959,
      videoName: '电影《海门一号》预告片',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/ba64835b243791581985501477/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/2020e9337d72b954d24a210ad25fd419.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/2f4e17a70acfafd650251328bb849221.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/716723dc84180ac968a8e489962a4e47.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ddfb0878a627df3dfe23929879623eab.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/5318cd6894af55eef86d1d76ba8364b6.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1414090,
      videoName: '《醒来2》预告片：为什么非要失去了才懂得珍惜和拥有',
      videoUrl: 'https://vod.pipi.cn/43903a81vodtransgzp1251246104/9b0406db243791581757013599/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/d743172b6900ae8ade6a65d2bc1a5d75.png?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/85efac36fd589a8420baf1a8bb7d1e19.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1496581,
      videoName: '《不孤岛》5月26日全国温暖上映',
      videoUrl: 'https://vod.pipi.cn/43903a81vodtransgzp1251246104/48cdfe7b243791581885681433/v.f42906.mp4',
      photos: [
        'https://p0.pipi.cn/mmdb/fb7386027a3f2a2ff7807785a3f194df94724.jpeg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1470379,
      videoName: '上影节开幕片《我爱你！》曝首支长预告 倪大红惠英红勇敢谱写暮年恋曲浪漫不老',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/df0c0a073270835009367374357/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/c60e575b91bd428c516f9387160c6889.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ff949474cf6e0ce0509e7b3daa72a208.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/40c1174e6d425e3fc093fece579a5929.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/95f135494becea1fffe68153bfe4315a.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/fa24aac5aa8f8d402229d22a41ca36b8.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1384453,
      videoName: '《透明侠侣》“马上见笑”预告快乐加倍 630“皓史成双”陪你欢乐过暑假',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/f84430233270835009167454716/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/mmdb/fb73869a0fa51bf2aa8d33dc9989eac73aea0.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73869a0fa51bf2aa0e13f2013f4c66aa0ba.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73869a0fa51bf2aa0e1352388399b07add0.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73869a0fa51bf2aa0e13ecc7e76b97b427e.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73869a0fa51bf2aa0e13912dcb0e30a3dbb.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1396308,
      videoName: '《魔幻奇缘之宝石公主》终极版预告',
      videoUrl: 'https://vod.pipi.cn/43903a81vodtransgzp1251246104/4028aa18243791581820709836/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/33eeae4ade19ce0759ee7d00926a2ef8.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/81a203fa41da140be76341cd44437bdb.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/0b66e41249103fb13a87ba90889ca000.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/a90944a4f9131fcfce40b225a3c8f732.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/354a67d1913c18a444d3e8e6b794bafe.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1367022,
      videoName: '电影《生命中最特别的朋友》发布终极预告 温暖友情治愈孤独',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/5b5351663270835009158557283/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/4754461d11a79d7df338c676c8f4faa2.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/3c105128b677bfdce78db0b03deb5f6a.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/17a30c8f24f75460c6b1c4973aa72ab8.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/0c6036ed1bcdbb4c97d64c872adf21d3.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/44718d186177350a1a5d85b0479016fc.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1434052,
      videoName: '《保你平安》终极真相版预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/7fa0036d243791580244107852/v.f42906.mp4',
      photos: [
        'https://p0.pipi.cn/friday/d2dcfd29b1406951e519f21c460a9c89.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/1e4944325363d3f6962321420d958f81.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/29e9976a60c9ea1abb0f856b2a1d1f41.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/4bdf9b6c06313c5a1484849b3c36283d.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/78df17d382930b8fb562126a6865e6f8.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1499840,
      videoName: undefined,
      videoUrl: undefined,
      photos: []
    },
    {
      id: 1499841,
      videoName: undefined,
      videoUrl: undefined,
      photos: []
    },
    {
      id: 1433415,
      videoName: undefined,
      videoUrl: undefined,
      photos: []
    },
    {
      id: 1298429,
      videoName: '《检察风云》“罕见秘案”版后告片 案中案起底血腥盗墓往事',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/abd2946f243791581842430265/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/cd46a5d902d268d96e5110c54561906a.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/53f5313b0e4be1ab5fc263254093b696.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/ee1a9a22e2afe1886aabc77c901492ee.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/24b424ffa24442d3dbf4ae2f61aa3260.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/5c676fb9321fc4a3f57af0dbfbfaf805.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1364066,
      videoName: '《冥绝村》曝终极版预告片：纸人还魂 绝命诡村！2月17日有胆进村',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/690aae7c243791579143635693/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/942e8210ecc5d1c4405865b926a1fd08.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/4b3ec361d9b4b581bf96ae31959b4a83.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/6810015e0c9b7cc75d04c359d25a172f.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/f12006f31b8cf8a011beb83caef79f47.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/c031b013986233e621ffe278407a2c66.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1417411,
      videoName: '电影《暴风》发布国语版终极预告',
      videoUrl: 'https://vod.pipi.cn/43903a81vodtransgzp1251246104/085a3f38243791581280489570/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/bfad9b97c9ac48109723326de2094238.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/e7ed43f93251216f3c3bc72e32261b94.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/e73245778d2abaf2170fd68fc5ff82a2.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/a7c443a49437bbd09450c458d440cec6.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/d76a59dc881fad3cfa1298179bfa182e.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1352380,
      videoName: '《水边维纳斯》上车版',
      videoUrl: 'https://vod.pipi.cn/43903a81vodtransgzp1251246104/532ad55a243791581994270923/v.f42906.mp4',
      photos: [
        'https://p0.pipi.cn/mmdb/fb73868771f92357e2c7ed08e1aaacc8867f0.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73868771f92357e2338f51fb4f6f36bbad8.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73868771f92357e25bf1fc3cd5ef750f06f.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73868771f92357e20fafc0dae4ee404a6aa.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/mmdb/fb73868771f92357e29235002f1c6d1ce3389.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1319147,
      videoName: '母亲节必看电影《妈妈的礼物》曝终极预告及海报 观众泪洒现场口碑爆棚',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/509f5afc243791582012848986/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/8f33206cfef7d452990d52785849adb0.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/0ef2e48da963a9f08db13e12c86e04fb.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/6a78e801e3316a154db2f4d4afd9fa3d.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/da6d591fd0c5cdd9cd96a97ff1be8eb5.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/e1ad9f00961a5e8fba472b11cc39219b.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1443473,
      videoName: '《加油吧！乡亲们》发布第三支预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/bf190dd73270835009061831307/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/45fcebb91e92bfb2ea9fdad360ad1e84.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/06a77c59006315166a2c79ff3b2459c8.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/7db19d4d509c7fceb0b4b7932f11599d.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/e45ba153dfc5e8009c7bc80a89bdacad.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/70bc8c39a3ea858ebb5393e00cb630f8.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    },
    {
      id: 1411266,
      videoName: '《川流不“熄”》终极预告',
      videoUrl: 'https://vod.pipi.cn/fec9203cvodtransbj1251246104/7ba952f23270835009196948694/v.f42905.mp4',
      photos: [
        'https://p0.pipi.cn/friday/a00745980af72a869ea436af52dbee01.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/81ca0736c47c54bc7d38724de3c09799.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/5c530cd7b9e94f41ad191dc2677e596f.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/26ad665923e8901e80667d81e0149115.jpg?imageMogr2/thumbnail/2500x2500%3E',
        'https://p0.pipi.cn/friday/d7fc482a5830f2b9f2ce78ea406573b1.jpg?imageMogr2/thumbnail/2500x2500%3E'
      ]
    }
  ]

}
