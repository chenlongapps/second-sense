import type { Messages } from "../types";

export const ja: Messages = {
  meta: {
    title: "秒感 · ピクセルストップウォッチ",
    description:
      "赤いデジタル管、ピクセルボタン。勘を信じて 3・5・10 秒に挑戦し、ちょうどの瞬間に止めよう。",
  },
  brand: { label: "秒感のホーム" },
  locale: {
    current: "現在の言語：{name}、クリックで切り替え",
    menu: "言語リスト",
  },
  sound: {
    labelOn: "サウンド オン",
    labelOff: "サウンド オフ",
    labelUnavailable: "サウンドは利用できません",
    ariaOn: "サウンドはオン、クリックでミュート",
    ariaOff: "サウンドはオフ、クリックでオン",
    ariaUnavailable: "このブラウザはサウンドに未対応です",
  },
  intro: { heading: "勘を信じて、あの一秒で止める。" },
  target: { label: "目標を選択", groupLabel: "目標秒数を選択", option: "{n}秒" },
  status: {
    ready: "準備完了",
    running: "計測中",
    done: "挑戦完了",
    cheating: "オートプレイ計測中",
  },
  display: {
    labelTarget: "目標時間",
    labelTargetSeconds: "目標 {n}秒",
    labelActual: "実際の時間",
    seconds: "{value}秒",
    ariaHidden: "計測中、時間は非表示",
  },
  caption: {
    idle: "クリックで開始。",
    running: "計測中 · 勘で止めよう。",
    finished: "このラウンドは終了。",
    cheat: "オートプレイ：表示はリアルタイム、目標秒で自動停止。",
  },
  action: {
    glyphGo: "GO",
    glyphStop: "STOP",
    labelIdle: "挑戦開始",
    labelStop: "計測停止",
    labelAgain: "もう一度挑戦",
  },
  keyboard: { hint: "スペースで開始 / 停止" },
  history: {
    title: "直近5回の記録",
    empty: "記録なし",
    target: "目標 {n}秒",
    actual: "実際 {value}",
    diffExact: "ちょうど",
    diffEarly: "{value}秒早い",
    diffLate: "{value}秒遅い",
  },
  notice: { tooLong: "60秒を超えました。", hidden: "画面が切り替わったため、このラウンドは無効。" },
  victory: { hint: "画面タップ / スペース / Esc でスキップ" },
  machine: { label: "読秒ゲーム" },
  easterEggs: {
    perfect: {
      title: "時間の支配者",
      messages: [
        "こっそり時計を見てたでしょ？",
        "この一秒、宇宙も君に従う。",
        "人間の皮をかぶった原子時計。",
      ],
    },
    "near-one": {
      title: "あと一息",
      messages: [
        "ちょうど一秒が指先にある。",
        "0.01秒差、ストップウォッチもハラハラした。",
        "あと少し、時間だってもう少し譲ってあげたかった。",
      ],
    },
    "near-two": {
      title: "すれ違い",
      messages: [
        "もう一回で取れる。",
        "0.02秒差、もう一秒の裾に触れてた。",
        "ちょうど一秒が指の間からすべり落ちた。",
      ],
    },
    "too-early": {
      title: "光速退勤",
      messages: [
        "始まった瞬間に終わり、勤怠を打つだけ？",
        "スタートボタンが反応する前に退勤してしまった。",
        "省略したのは時間じゃなく、ゲーム全体。",
        "この一戦、手が脳より先に退勤した。",
        "秒針が準備運動する前にゴールした。",
        "目標が力をためてるのに、先に電気を消した。",
        "ストップウォッチにも心の準備が必要。",
        "スタートラインが美味しすぎた、先に走るのも無理ない。",
      ],
    },
    "too-late": {
      title: "超ロング待機",
      messages: [
        "秒を読んでるんじゃなく、出前を待ってる。",
        "ストップウォッチはもう退勤、まだ持ち場を守ってる。",
        "目標は二周したのに、まだエンドロール待ち？",
        "ストップウォッチと我慢比べしてるみたい。",
        "時間をそっと少し引き伸ばしたね。",
        "秒針が一周回ってもまだ構えてる。",
        "このままじゃ次の一戦もあくびが出る。",
        "目標はとっくに着いた、君は儀式感を待ってる。",
      ],
    },
    wild: {
      title: "秒感オフライン",
      messages: [
        "秒感？ これは運まかせ。",
        "君と目標の間には、ひとつの時差がある。",
        "秒感は工場出荷時に戻すのがおすすめ。",
        "君と目標はまるまる一拍ずれてる。",
        "この一押し、秒感は確かに休んだ。",
        "押したのはどう見ても別の目標。",
        "手の中の時間、伸び縮みがすごいね。",
        "感覚で行くなら、今回は少しふわふわ。",
      ],
    },
  },
};
