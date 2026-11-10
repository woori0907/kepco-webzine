// 호 정보 — 매달 이 파일과 articles/ 폴더만 바꾸면 됩니다.
// 키워드색은 assets/css/tokens.css 의 --color-key · --color-key-ink · --color-key-tint 3줄입니다.

const ARCHIVE_BASE = 'https://www.kepco.co.kr/KEPCO_FILE/html/';
// 실제 서버에서는 지난 호가 같은 서버의 형제 폴더이므로 '../' 로 바꿔도 됩니다.

export const issue = {
  year: 2026,
  month: 10,
  vol: 640,
  titleKo: '2026년 10월호',
  titleEn: '2026 October',
  dateLabel: '2026.10',
  imageFolder: '2026-10',

  keyword: '전환',
  keywordEn: 'Transition',
  intro: '기억을, 지식을, 이제는 판단까지 기술에 맡기는 시대. 10월호는 ‘전환’ 앞에서 사람이 지켜야 할 자리와 고객·현장·지역에서 이미 시작된 변화를 담았습니다.',

  coverArt: {
    src: 'inception/hero',
    alt: '0과 1이 세로로 흘러내리는 10월호 표지 아트',
    caption: '10월호 표지 아트 · 이 자리에서 40초 홍보영상이 재생됩니다',
    art: 'matrix',
  },
  // 영상 파일이 있으면 표지 자리에서 소리 없이 반복 재생됩니다. 없으면 표지 아트가 그대로 보입니다.
  promoVideo: 'assets/video/promo-2026-10.mp4',

  // 공유 미리보기(OG)용 절대주소
  siteUrl: 'https://www.kepco.co.kr/KEPCO_FILE/html/2026_10/',
  archive: {
    base: ARCHIVE_BASE,
    main: `${ARCHIVE_BASE}2026_09/main.html`,
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
        { slug: 'theme-focus', size: 'lg', span: 8, rows: 2 },
        { slug: 'perspective', size: 'sm', span: 4 },
        { slug: 'inside', size: 'sm', span: 4 },
        { slug: 'review', size: 'lg', span: 6 },
        { slug: 'scene', size: 'lg', span: 6 },
      ],
    },
    {
      id: 'kepco-now',
      name: 'KEPCO NOW',
      desc: '지금 한전에서 일어나는 이슈 · 기술 · 현장',
      items: [
        { slug: 'issue-now', size: 'lg', span: 8, rows: 3 },
        { slug: 'next-wave', size: 'sm', span: 4 },
        { slug: 'on-site', size: 'sm', span: 4 },
        { slug: 'kepco-news', size: 'sm', span: 4 },
      ],
    },
    {
      id: 'life',
      name: 'LIFE & CULTURE', // 임시 이름
      desc: '일상을 넓히는 문화 · 과학 · 여행 · 체험',
      items: [
        { slug: 'art-culture', size: 'lg', span: 4 },
        { slug: 'science-lab', size: 'lg', span: 4 },
        { slug: 'green-life', size: 'lg', span: 4 },
        { slug: 'travel-mate', size: 'lg', span: 6 },
        { slug: 'refresh', size: 'lg', span: 6 },
      ],
      // 기사 템플릿이 아닌 별도 페이지 (articles/event.html)
      event: true,
    },
  ],

  // EVENT — 콘텐츠 연계 퀴즈 (메인에는 넣지 않고 목차·기사 끝에서 연결)
  quiz: {
    id: '2026-10',
    corner: 'EVENT',
    title: '10월호 읽고 푸는 퀴즈',
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

  // EVENT 응모 폼 + 응모 한마디(댓글)
  // store: 'local' = 이 브라우저에만 저장(오프라인 시연용)
  //        'sheets' = 구글 스프레드시트(Apps Script 웹 앱) — endpoint에 웹 앱 주소를 넣습니다. README 참고
  // 기간·발표·경품·샘플 댓글은 시안용 예시입니다. 실제 내용으로 바꿔 주세요.
  entry: {
    store: 'local',
    endpoint: '',
    period: '2026. 10. 1.(목) ~ 10. 31.(토)',
    announce: '2026. 11. 10.(화) 11월호 EVENT 페이지',
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

  poll: {
    id: '2026-10',
    title: '이번 호에서 가장 좋았던 기사는?',
    desc: '한 사람이 한 번 투표할 수 있어요. 결과는 다음 호에서 공개하고 기획에 반영해요.',
    // 보기는 목차 순서대로 모든 기사가 자동으로 들어갑니다.
  },
};
