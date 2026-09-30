import type { Messages } from "../types";

export const ko: Messages = {
  meta: {
    title: "초감 · 픽셀 스톱워치",
    description: "붉은 디지털 튜브, 픽셀 버튼. 감각으로 3·5·10초에 도전하고 딱 그 순간에 멈추세요.",
  },
  brand: { label: "초감 홈" },
  locale: {
    current: "현재 언어: {name}, 변경하려면 클릭",
    menu: "언어 목록",
  },
  sound: {
    labelOn: "소리 켜짐",
    labelOff: "소리 꺼짐",
    labelUnavailable: "소리 사용 불가",
    ariaOn: "소리가 켜져 있습니다. 누르면 무음",
    ariaOff: "소리가 꺼져 있습니다. 누르면 켜짐",
    ariaUnavailable: "이 브라우저는 소리를 지원하지 않습니다",
  },
  intro: { heading: "감각으로, 그 한 순간에 멈춰라." },
  target: { label: "목표 선택", groupLabel: "목표 초 선택", option: "{n}초" },
  status: {
    ready: "준비 완료",
    running: "시간 측정 중",
    done: "도전 완료",
    cheating: "자동 재생 중",
  },
  display: {
    labelTarget: "목표 시간",
    labelTargetSeconds: "목표 {n}초",
    labelActual: "실제 시간",
    seconds: "{value}초",
    ariaHidden: "측정 중, 시간은 숨김",
  },
  caption: {
    idle: "클릭하면 시작합니다.",
    running: "측정 중 · 감각으로 멈추세요.",
    finished: "이번 판은 끝났습니다.",
    cheat: "자동 재생: 화면은 실시간이고 목표 초에서 자동 정지.",
  },
  action: {
    glyphGo: "GO",
    glyphStop: "STOP",
    labelIdle: "도전 시작",
    labelStop: "측정 정지",
    labelAgain: "다시 도전",
  },
  keyboard: { hint: "스페이스로 시작 / 정지" },
  history: {
    title: "최근 5회 기록",
    empty: "기록 없음",
    target: "목표 {n}초",
    actual: "실제 {value}",
    diffExact: "딱 맞음",
    diffEarly: "{value}초 빠름",
    diffLate: "{value}초 늦음",
  },
  notice: { tooLong: "60초를 초과했습니다.", hidden: "화면이 전환되어 이번 판은 무효." },
  victory: { hint: "화면 탭 / 스페이스 / Esc 로 건너뛰기" },
  machine: { label: "스톱워치 게임" },
  easterEggs: {
    perfect: {
      title: "시간의 지배자",
      messages: [
        "몰래 시계를 본 거 아니야?",
        "이 한 순간, 우주도 너에게 듣는다.",
        "인간의 껍데기, 원자시계의 속.",
      ],
    },
    "near-one": {
      title: "한 끗 차이",
      messages: [
        "정확한 1초가 손끝에 있다.",
        "0.01초 차이, 스톱워치도 식은땀을 흘렸다.",
        "조금만 더, 시간도 너에게 져 주고 싶었을 거야.",
      ],
    },
    "near-two": {
      title: "스쳐 지나가다",
      messages: [
        "한 번만 더하면 네 것이다.",
        "0.02초 차이, 벌써 정확한 1초의 옷자락을 잡았다.",
        "정확한 1초가 손가락 사이로 빠져나갔다.",
      ],
    },
    "too-early": {
      title: "광속 퇴근",
      messages: [
        "시작하자마자 끝, 출근 도장만 찍으러 왔어?",
        "시작 버튼이 반응하기도 전에 퇴근해버렸다.",
        "줄인 건 시간이 아니라 게임 전체.",
        "이번 판은 손이 머리보다 먼저 퇴근했다.",
        "초침이 워밍업하기도 전에 결승선을 통과했다.",
        "목표가 힘을 모으는데 네가 먼저 불을 껐다.",
        "스톱워치에도 마음의 준비 시간이 필요해.",
        "출발선이 너무 달콤했나 봐, 먼저 뛴 것도 무리는 아냐.",
      ],
    },
    "too-late": {
      title: "초장기 대기",
      messages: [
        "초를 읽는 게 아니라 배달을 기다리는 중.",
        "스톱워치는 퇴근했고 너는 아직 자리를 지키는 중.",
        "목표를 두 번 지났는데 아직 엔딩 크레딧 기다려?",
        "스톱워치랑 누가 더 인내심 많은지 겨루는 것 같아.",
        "시간을 살짝 몰래 늘려 놨네.",
        "초침이 한 바퀴를 돌아도 아직 우물쭈물.",
        "이 이상 끌면 다음 판도 하품이 나와.",
        "목표는 이미 도착했고, 너는 의식을 기다리는 중.",
      ],
    },
    wild: {
      title: "초감 오프라인",
      messages: [
        "초감? 이건 운에 맡기는 거야.",
        "너와 목표 사이에는 한 시간대가 있다.",
        "초감은 공장 초기화를 권장해.",
        "너와 목표는 정확히 한 박자 차이.",
        "이 한 번, 초감은 확실히 쉬었다.",
        "누른 건 봐도 다른 목표 같은데.",
        "손안의 시간, 탄성이 정말 좋네.",
        "느낌으로 간다면, 이번 느낌은 살짝 떴어.",
      ],
    },
  },
};
