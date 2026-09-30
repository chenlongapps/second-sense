import type { Messages } from "../types";

export const zhCN: Messages = {
  meta: {
    title: "秒感 · 像素读秒挑战",
    description: "红色数码管、像素按钮。凭感觉挑战 3、5、10 秒，在恰好的那一刻停止。",
  },
  brand: { label: "秒感首页" },
  locale: {
    current: "当前语言：{name}，点击切换",
    menu: "语言列表",
  },
  sound: {
    labelOn: "音效 开",
    labelOff: "音效 关",
    labelUnavailable: "音效不可用",
    ariaOn: "音效已开启，点击静音",
    ariaOff: "音效已关闭，点击开启",
    ariaUnavailable: "当前浏览器不支持音效",
  },
  intro: { heading: "凭感觉，停在那一秒。" },
  target: { label: "选择目标", groupLabel: "选择目标秒数", option: "{n} 秒" },
  status: {
    ready: "准备就绪",
    running: "计时进行中",
    done: "挑战完成",
    cheating: "外挂计时中",
  },
  display: {
    labelTarget: "目标时间",
    labelTargetSeconds: "目标 {n} 秒",
    labelActual: "实际用时",
    seconds: "{value} 秒",
    ariaHidden: "计时中，时间已隐藏",
  },
  caption: {
    idle: "点击开始。",
    running: "计时中 · 凭感觉停止。",
    finished: "本轮结束。",
    cheat: "外挂：数码管实时可见，到点自动停。",
  },
  action: {
    glyphGo: "GO",
    glyphStop: "STOP",
    labelIdle: "开始挑战",
    labelStop: "停止计时",
    labelAgain: "再挑战一次",
  },
  keyboard: { hint: "空格开始 / 停止" },
  history: {
    title: "近五次记录",
    empty: "暂无记录",
    target: "目标 {n} 秒",
    actual: "实际 {value}",
    diffExact: "刚刚好",
    diffEarly: "提前 {value} 秒",
    diffLate: "超出 {value} 秒",
  },
  notice: { tooLong: "已超过 60 秒。", hidden: "页面切换，本轮不计。" },
  victory: { hint: "点击画面 / 空格 / Esc 跳过" },
  machine: { label: "读秒游戏" },
  easterEggs: {
    perfect: {
      title: "时间掌控者",
      messages: ["你是不是偷偷看表了？", "这一秒，宇宙都听你的。", "人类的外壳，原子钟的内核。"],
    },
    "near-one": {
      title: "只差一丝",
      messages: [
        "整秒就在指尖。",
        "差 0.01 秒，秒表都替你捏了把汗。",
        "就差这一点点，时间都想给你放水。",
      ],
    },
    "near-two": {
      title: "擦肩而过",
      messages: [
        "再来一次就拿下。",
        "差 0.02 秒，你已经摸到整秒的衣角了。",
        "整秒刚从你指缝里溜走。",
      ],
    },
    "too-early": {
      title: "光速下班",
      messages: [
        "刚开始就结束，你是来打卡的？",
        "开始键还没反应过来，你就下班了。",
        "你省略的不是时间，是整个游戏。",
        "这一局，你的手比脑子先下班了。",
        "秒针还没热身，你就已经冲线。",
        "目标正在蓄力，你先把灯关了。",
        "秒表需要一点心理准备时间。",
        "起跑线太香，怪不得你先冲。",
      ],
    },
    "too-late": {
      title: "超长待机",
      messages: [
        "你不是在读秒，你是在等外卖。",
        "秒表都下班了，你还在坚守岗位。",
        "目标都过了两遍，你还在等片尾彩蛋？",
        "你好像在和秒表比谁更有耐心。",
        "时间被你悄悄地拉长了一点点。",
        "秒针都绕完一圈了，你还在酝酿。",
        "再拖下去，下一局都要打哈欠了。",
        "目标早到了，你在等一个仪式感。",
      ],
    },
    wild: {
      title: "秒感已离线",
      messages: [
        "秒感？你这是随缘。",
        "你和目标之间，隔着一个时区。",
        "你的秒感建议恢复出厂设置。",
        "你和目标之间，差了整整一个节拍。",
        "这一下，秒感确实放假了。",
        "你按下的很像另一个目标。",
        "时间在你手里，弹性真好啊。",
        "凭感觉的话，这次感觉有点飘。",
      ],
    },
  },
};
