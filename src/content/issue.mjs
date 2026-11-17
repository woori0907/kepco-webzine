// 호 정보 — 매달 이 파일과 articles/ 폴더만 바꾸면 됩니다.
// 키워드색은 assets/css/tokens.css 의 --color-key · --color-key-ink · --color-key-tint 3줄입니다.

const ARCHIVE_BASE = 'https://www.kepco.co.kr/KEPCO_FILE/html/';
// 실제 서버에서는 지난 호가 같은 서버의 형제 폴더이므로 '../' 로 바꿔도 됩니다.

export const issue = {
  year: 2027,
  month: 1,
  vol: 643,
  titleKo: '2027년 1월호',
  titleEn: '2027 January',
  dateLabel: '2027.01',
  imageFolder: '2026-10', // 사진 폴더 이름은 그대로 (assets/images/2026-10)

  keyword: '새로운 장면',
  keywordEn: 'New Scene',
  intro: '같은 풍경도 다른 각도에서 바라보면 새로운 장면이 됩니다. 1월호는 익숙한 화면에 새로운 질문을 입력해 보는 2027년의 첫 장면, 그리고 현장과 일상에서 이미 시작된 새로운 장면들을 담았습니다.',

  // 표지 이미지 — 영상을 불러오기 전·재생할 수 없을 때 배경, 공유 미리보기(OG) 이미지
  coverArt: {
    src: 'perspective/00_hero_SHIFT_16x9',
    alt: '',
  },
  // 메인 표지 배경 영상 (소리 없이 반복 재생, 일시정지 버튼 있음) — 화면 폭에 따라 하나만 불러옴 (767px 이하 mobile)
  promoVideo: {
    desktop: 'assets/video/2027-01/main/hero_desktop.mp4',
    mobile: 'assets/video/2027-01/main/hero_mobile.mp4',
  },

  // 공유 미리보기(OG)용 절대주소
  siteUrl: 'https://www.kepco.co.kr/KEPCO_FILE/html/2027_01/',
  // e북 (사이드 리모컨 · 메인 원형 버튼, 새 창) — 실제 e북 주소가 정해지면 바꿔 주세요
  ebook: `${ARCHIVE_BASE}2027_01/ebook/index.html`,
  archive: {
    base: ARCHIVE_BASE,
    main: `${ARCHIVE_BASE}2026_12/main.html`,
  },

  // ---- 목차 구성 ----------------------------------------------------------
  // 섹션 순서 · 기사 순서 = 목차 순서 = ‘다음 기사’ 순서 (2027 제안서 1월호 기획안 기준)
  // 메인 배치  size  lg = 사진 16:9 큰 카드 · sm = 작은 가로형 카드
  //           span  12단 그리드에서 차지하는 칸 수
  //           rows  큰 카드 옆에 작은 카드를 세로로 쌓을 때, 큰 카드가 차지할 줄 수
  // 원고가 없는 코너는 기사 파일에 draft: true 를 두면 회색 박스로 자리만 잡힙니다.
  coverStory: 'inception',
  sections: [
    {
      id: 'spotlight',
      name: 'SPOTLIGHT',
      desc: '이달의 키워드를 여러 시선으로 깊게 들여다봅니다.',
      items: [
        { slug: 'inception' }, // 메인에서는 표지 자리에 들어감
        // 원고가 없는 THEME FOCUS · INSIDE · SCENE은 이번 호에서 뺌 (기사 파일은 남겨 둠)
        { slug: 'perspective', size: 'lg', span: 6 },
        { slug: 'review', size: 'lg', span: 6 },
      ],
    },
    {
      id: 'kepco-now',
      name: 'KEPCO NOW',
      desc: '지금 한전에서 일어나는 이슈 · 기술 · 현장',
      layout: 'carousel', // 큰 기사 1개 + 아래 썸네일, 자동으로 넘어감 (size·span은 쓰지 않음)
      items: [
        { slug: 'issue-now' },
        { slug: 'next-wave' },
        { slug: 'on-site' },
        { slug: 'kepco-news' },
      ],
    },
    {
      id: 'life',
      name: 'LIFE & CULTURE', // 임시 이름
      desc: '일상을 넓히는 문화 · 환경 · 여행 · 체험',
      // 분위기 전환: TRAVEL MATE를 화면 폭 가득 크게, 나머지 셋은 한 줄에 썸네일 | 설명 (size·span은 쓰지 않음)
      layout: 'feature',
      items: [
        // 원고가 없는 SCIENCE LAB은 이번 호에서 뺌
        { slug: 'travel-mate', feature: true },
        { slug: 'art-culture' },
        { slug: 'green-life' },
        { slug: 'refresh' },
      ],
      // 기사 템플릿이 아닌 별도 페이지 (articles/event.html)
      event: true,
    },
  ],

  // EVENT — 콘텐츠 연계 퀴즈 (메인에는 넣지 않고 목차·기사 끝에서 연결)
  quiz: {
    id: '2027-01',
    corner: 'EVENT',
    title: '1월호 읽고 푸는 퀴즈',
    desc: '세 문제를 모두 맞히면 응모할 수 있어요. 틀리면 힌트가 있는 기사를 알려드려요.',
    questions: [
      {
        ask: '한전이 자체 기술로 개발해 전국 15개 본부에 구축한 배전망 통합운영 플랫폼은?',
        options: ['SCADA', 'ADMS', 'MDMS', 'VPP'],
        answer: 1,
        from: 'next-wave',
      },
      {
        ask: '성송면 주민들이 주목한 변전소의 ‘3無’에 들어가지 않는 것은?',
        options: ['무취', '무소음', '무비산먼지', '무전자파'],
        answer: 3,
        from: 'on-site',
      },
      {
        ask: '횡성지사 5인방이 래프팅을 즐긴 곳은?',
        options: ['인제 내린천', '철원 한탄강', '영월 동강', '안동 낙동강'],
        answer: 2,
        from: 'refresh',
      },
    ],
  },

  // 기사 반응 버튼 (본문 끝) — 기사마다 브라우저당 한 번, 취소 없음
  // store: 'local' = 이 브라우저에만 저장(오프라인 시연용)
  //        'sheets' = 구글 스프레드시트 — tools/apps-script/reactions.gs를 배포한 주소를 endpoint에. README 참고
  // items: [id, 버튼 글자, 아이콘]  — id는 시트에 기록되는 값이라 운영 중에는 바꾸지 마세요.
  reactions: {
    store: 'local',
    endpoint: '',
    title: '이 기사, 어떠셨나요?',
    items: [
      ['like', '좋아요', 'heart'],
      ['useful', '유용해요', 'bulb'],
      ['fun', '재밌어요', 'smile'],
    ],
  },

  // EVENT 응모 폼 + 응모 한마디(댓글)
  // store: 'local' = 이 브라우저에만 저장(오프라인 시연용)
  //        'sheets' = 구글 스프레드시트(Apps Script 웹 앱) — endpoint에 웹 앱 주소를 넣습니다. README 참고
  // 기간·발표·경품·샘플 댓글은 시안용 예시입니다. 실제 내용으로 바꿔 주세요.
  entry: {
    store: 'local',
    endpoint: '',
    period: '2027. 1. 1.(금) ~ 1. 31.(일)',
    announce: '2027. 2. 10.(수) 2월호 EVENT 페이지',
    prize: '정답자 중 추첨 30명 · 모바일 커피 쿠폰',
    privacy: {
      purpose: '이벤트 당첨자 선정 및 경품 발송',
      items: '이름, 연락처, 소속(선택)',
      retention: '당첨자 발표 후 1개월 이내 파기',
    },
    samples: [
      { name: '김하진', org: '서울본부', text: '배전망 통합운영 플랫폼 기사 덕분에 ADMS가 뭔지 처음 제대로 알았어요. 다음 호도 기대합니다!', date: '2026-10-28T09:12:00+09:00' },
      { name: '박서윤', org: '', text: '성송변전소 이야기가 인상적이었어요. 주민과 함께하는 변전소라니 멋집니다.', date: '2026-10-21T13:40:00+09:00' },
      { name: '이도현', org: '강원본부', text: '횡성지사 5인방 래프팅 사진 보고 저도 한탄강 가 보고 싶어졌어요.', date: '2026-10-15T18:05:00+09:00' },
    ],
  },

  // 츄르를 찾아라 — 기사 3곳에 숨긴 츄르를 모두 찾으면 열리는 숨은 이벤트 (articles/find-churu-…html)
  //   어느 기사에 숨길지는 읽는 사람마다 무작위로 정해져 그 브라우저에 기억됩니다 (assets/js/churu.js)
  //   목차·메인·리모컨에는 넣지 않습니다.
  churu: {
    id: '2027-01-churu',
    slug: 'find-churu', // 실제 파일은 articles/find-churu-<key로 만든 글자>.html — 목차에 없고 HTML에도 그대로 적지 않음
    key: 'powercat-loves-churu-2027-01', // 바꾸면 응모 페이지 주소가 바뀜
    total: 3,
    image: 'find-churu/churu.png',
    sprite: 'find-churu/powercat-sprite.png', // 가로로 3칸 — 찾은 개수번째 칸을 팝업에 씀
    corner: 'HIDDEN EVENT',
    title: '츄르를 찾아라',
    desc: '이번 호 기사 곳곳에 숨은 츄르 3개를 모두 찾은 분만 응모할 수 있는 파워캣의 비밀 이벤트예요.',
    // 응모 폼 설정은 entry를 그대로 쓰고, 아래 값만 바꿈 — 경품·기간은 확정되면 고쳐 주세요.
    entry: {
      prize: '츄르를 모두 찾은 분 중 추첨 · 경품 미정',
    },
  },

  poll: {
    id: '2027-01',
    title: '이번 호에서 가장 좋았던 기사는?',
    desc: '한 사람이 한 번 투표할 수 있어요. 결과는 다음 호에서 공개하고 기획에 반영해요.',
    // 보기는 목차 순서대로 모든 기사가 자동으로 들어갑니다.
  },
};
