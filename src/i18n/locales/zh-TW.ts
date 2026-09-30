import type { Messages } from "../types";

export const zhTW: Messages = {
  meta: {
    title: "秒感 · 像素讀秒挑戰",
    description: "紅色數位管、像素按鈕。憑感覺挑戰 3、5、10 秒，在剛好的那一刻停下來。",
  },
  brand: { label: "秒感首頁" },
  locale: {
    current: "目前語言：{name}，點擊切換",
    menu: "語言清單",
  },
  sound: {
    labelOn: "音效 開",
    labelOff: "音效 關",
    labelUnavailable: "音效不可用",
    ariaOn: "音效已開啟，點擊靜音",
    ariaOff: "音效已關閉，點擊開啟",
    ariaUnavailable: "目前瀏覽器不支援音效",
  },
  intro: { heading: "憑感覺，停在那一秒。" },
  target: { label: "選擇目標", groupLabel: "選擇目標秒數", option: "{n} 秒" },
  status: {
    ready: "準備就緒",
    running: "計時進行中",
    done: "挑戰完成",
    cheating: "外掛計時中",
  },
  display: {
    labelTarget: "目標時間",
    labelTargetSeconds: "目標 {n} 秒",
    labelActual: "實際用時",
    seconds: "{value} 秒",
    ariaHidden: "計時中，時間已隱藏",
  },
  caption: {
    idle: "點擊開始。",
    running: "計時中 · 憑感覺停止。",
    finished: "本輪結束。",
    cheat: "外掛：數位管即時可見，到點自動停。",
  },
  action: {
    glyphGo: "GO",
    glyphStop: "STOP",
    labelIdle: "開始挑戰",
    labelStop: "停止計時",
    labelAgain: "再挑戰一次",
  },
  keyboard: { hint: "空白鍵開始 / 停止" },
  history: {
    title: "近五次紀錄",
    empty: "暫無紀錄",
    target: "目標 {n} 秒",
    actual: "實際 {value}",
    diffExact: "剛剛好",
    diffEarly: "提前 {value} 秒",
    diffLate: "超出 {value} 秒",
  },
  notice: { tooLong: "已超過 60 秒。", hidden: "畫面切換，本輪不計。" },
  victory: { hint: "點擊畫面 / 空白鍵 / Esc 略過" },
  machine: { label: "讀秒遊戲" },
  easterEggs: {
    perfect: {
      title: "時間掌控者",
      messages: ["你是不是偷偷看錶了？", "這一秒，宇宙都聽你的。", "人類的外殼，原子鐘的內核。"],
    },
    "near-one": {
      title: "只差一絲",
      messages: [
        "整秒就在指尖。",
        "差 0.01 秒，碼錶都替你捏把冷汗。",
        "就差這一點點，時間都想給你放水。",
      ],
    },
    "near-two": {
      title: "擦身而過",
      messages: [
        "再來一次就拿下。",
        "差 0.02 秒，你已經摸到整秒的衣角了。",
        "整秒剛從你指縫裡溜走。",
      ],
    },
    "too-early": {
      title: "光速下班",
      messages: [
        "剛開始就結束，你是來打卡的？",
        "開始鍵還沒反應過來，你就下班了。",
        "你省略的不是時間，是整個遊戲。",
        "這一局，你的手比腦子先下班了。",
        "秒針還沒熱身，你就已經衝線。",
        "目標正在蓄力，你先把燈關了。",
        "碼錶需要一點心理準備時間。",
        "起跑線太香，難怪你先衝。",
      ],
    },
    "too-late": {
      title: "超長待機",
      messages: [
        "你不是在讀秒，你是在等外賣。",
        "碼錶都下班了，你還堅守崗位。",
        "目標都過了兩遍，你還在等片尾彩蛋？",
        "你好像在和碼錶比誰更有耐心。",
        "時間被你悄悄地拉長了一點點。",
        "秒針都繞完一圈了，你還在醞釀。",
        "再拖下去，下一局都要打哈欠了。",
        "目標早到了，你在等一個儀式感。",
      ],
    },
    wild: {
      title: "秒感已離線",
      messages: [
        "秒感？你這是隨緣。",
        "你和目標之間，隔著一個時區。",
        "你的秒感建議恢復出廠設定。",
        "你和目標之間，差了整整一個節拍。",
        "這一下，秒感確實放假了。",
        "你按下的很像另一個目標。",
        "時間在你手裡，彈性真好啊。",
        "憑感覺的話，這次感覺有點飄。",
      ],
    },
  },
};
