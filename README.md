# KEPCO 웹진 리뉴얼 시안 (2026년 10월호 기준)

현행 웹진(2026년 10월호 vol.640)을 「KEPCO 웹진 디자인 분석 및 개선 방안」에 따라 다시 만든 시안입니다.
`index.html`을 브라우저로 열면 바로 보이고, 인터넷 연결 없이 동작합니다(외부 CDN·라이브러리 0개).

- 메인 1면 + 성격이 다른 기사 6면을 **같은 기사 템플릿 하나**로 만들었습니다.
  목차는 2027 제안서의 섹션·코너 체계를 따릅니다.
  - SPOTLIGHT · INCEPTION ← 10월호 커버스토리
  - KEPCO NOW · ISSUE NOW ← 스페셜테마1 / NEXT WAVE ← TRANS : MISSION / ON SITE ← FOCUS
  - LIFE & CULTURE(임시 이름) · TRAVEL MATE ← LOCAL : RISING / REFRESH ← RE : CHARGE / EVENT ← 퀴즈(별도 페이지)
- 원고와 사진은 현행 10월호에서 가져와 새 코너에 배치했습니다. 원고가 없는 코너 9개(THEME FOCUS · PERSPECTIVE · INSIDE · RE:VIEW · SCENE · KEPCO NEWS · ART & CULTURE · SCIENCE LAB · GREEN LIFE)는 1월호 기획안 제목으로 페이지와 자리만 잡아 두었습니다(사진은 회색 박스, 본문은 회색 줄). 제안 시안에서는 샘플북 원고로 바꿔 넣으면 됩니다.
- ON/OFF 구분(포인트색·구역 나누기)은 쓰지 않았습니다. 컨셉이 바뀔 예정이어서 색은 월별 키워드색 하나만 씁니다.

## 개선안 반영 내용

| 개선 방안 | 시안에서 구현한 것 |
| --- | --- |
| 디자인 토큰 | `assets/css/tokens.css` — 서체 2종, 타입 스케일 40/24/22/19/17/14, 흰색·검정·회색 3단계 + 키워드색 1개, 8px 배수 간격, 12·8·4단 그리드, 이미지 비율 16:9·4:5·1:1 |
| 메인: 이번 달 표지로 열기 | 키워드 ‘전환’ + 호수 + 표지 아트(40초 영상 자리) + 커버스토리. 슬라이더 없이 섹션별 편집형 그리드(큰 카드 16:9 · 작은 가로형 카드 4:5) |
| 카드 | 코너명 · 제목 · 한 줄 요약 · 읽는 시간(본문 글자 수로 자동 계산) |
| 기사 히어로 | 빈 색면·워터마크 대신 대표 이미지 + 제목을 첫 화면에, 사진 위 제목은 어두운 그라데이션 막 |
| 본문 칼럼 | 720px · 17px · Regular(400) · 행간 1.75 · `word-break: keep-all` |
| 본문 부품 | 3줄 요약, 소제목 목차, 소제목, 풀쿼트, 데이터 박스, 용어 박스, 사진+캡션, 사진 묶음, 미니 인터뷰(1:1), 정보 박스, 참여 안내, 필자 소개 |
| 기사 끝 | 공감 버튼 · 링크 복사 · 다음 기사 카드 · 같은 코너 지난 호 · 퀴즈 배너 (양옆 화살표 없음) |
| 모바일 | 플로팅 버튼 5개 → 하단 탭바 1개(목차 · 이번 호 · 참여 · 위로), 아래로 스크롤하면 숨김 |
| 모션 | 0.2–0.4초만 사용. 투명하게 시작하는 효과 없음. `prefers-reduced-motion` 존중 |
| 참여 | 메인: 독자 설문 · 뉴스레터 / 기사 끝: 공감 · 링크 복사 / EVENT 페이지: 퀴즈(채점·힌트·응모) — 모두 동작 |
| 접근성 | 모든 이미지 alt, 페이지별 제목, h1 하나 + 순서대로 된 제목 구조, 키보드 조작, 텍스트 대비 AA(4.5:1) 이상 |
| 경량화 | 이미지 JPG + 800px 버전 `srcset` + 지연 로딩, 폰트는 글자 범위별 woff2 서브셋 |

## 폴더 구조

```
index.html               메인 (생성됨)
articles/                기사 페이지 (생성됨) — 코너 이름으로: inception · issue-now · next-wave · on-site · travel-mate · refresh
                         + event.html (퀴즈)
                         ※ 생성된 HTML은 직접 고치지 말고 src를 고친 뒤 다시 생성하세요.
src/
  lib/paths.mjs          페이지 위치에 맞는 상대경로(../assets 등)를 만드는 곳
  build.mjs              생성기: node src/build.mjs
  content/issue.mjs      호 정보 · 키워드 · 섹션/코너 목차 · 메인 배치 · 퀴즈 · 설문
  content/articles/*.mjs 기사 원고 (본문은 블록 목록)
  templates/             공통 틀 · 메인 · 기사 · 본문 부품 · 아이콘
  lib/                   HTML · 이미지 헬퍼
assets/
  css/  tokens · base · components · layout(공통) / home(메인) / article(기사) / fonts
  js/   menu · scroll-ui · smooth-scroll · rise · progress · participation · cover-video · newsletter
  images/2026-10/<기사>/  웹용 JPG
  fonts/  Pretendard(본문) · Noto Serif KR Bold(제목) — 둘 다 SIL OFL 1.1
tools/optimize-images.ps1  원본 이미지 → 웹용 JPG (Windows 기본 기능만 사용)
```

## 다음 호 만드는 방법

1. 사진 원본을 기사별 폴더에 모아 줄입니다.
   `powershell -ExecutionPolicy Bypass -File tools/optimize-images.ps1 -Source <원본폴더> -Dest assets/images/2026-11`
2. `src/content/issue.mjs`에서 호 정보·키워드·퀴즈와 `sections`(섹션별 코너 목록과 메인 배치)를, `tokens.css`에서 키워드색 3줄(`--color-key*`)을 바꿉니다.
3. `src/content/articles/`에 기사 원고를 블록으로 넣습니다. 블록 종류는 `src/templates/blocks.mjs` 맨 위 표에 있습니다(인쇄본 모듈과 1:1).
   - 원고가 아직 없는 코너는 `draft: true`와 코너·성격·제목만 적으면 자리 잡힌 페이지가 만들어집니다. 원고가 들어오면 `draft`를 지우고 내용을 채웁니다. 원고 준비 중인 기사는 독자 설문 보기에서 빠집니다.
4. `node src/build.mjs` → `index.html`과 `articles/` 폴더에 HTML이 생성됩니다(기사 폴더는 매번 비우고 새로 만듭니다). 생성기는 alt가 빠진 이미지, 3줄이 아닌 요약 등을 오류로 알려 줍니다.

Node.js(18 이상)만 있으면 되고 설치할 패키지는 없습니다.

## 운영 때 바꿀 곳

- **40초 홍보영상**: `assets/video/promo-2026-10.mp4`를 넣으면 메인 표지 자리에서 소리 없이 반복 재생됩니다(일시정지 버튼 포함). 파일이 없으면 표지 아트가 보입니다.
- **퀴즈·설문·공감 저장**: 지금은 이 브라우저(localStorage)에만 저장됩니다. `assets/js/participation.js`의 `save()` 한 곳을 인트라넷 게시판/집계 API로 바꾸면 됩니다.
- **뉴스레터 신청**: `assets/js/newsletter.js`의 `submitSubscription()`을 실제 발송 시스템 API로 바꿉니다.
- **지난 호 링크**: `src/content/issue.mjs`의 `ARCHIVE_BASE`. 지금은 현행 사이트 주소이고, 같은 서버에 올릴 때는 `'../'`로 바꿔도 됩니다.
- **공유 미리보기(OG)**: `issue.siteUrl` 기준의 절대주소로 들어갑니다.
- **제목 서체**: 인쇄본 제목 서체로 맞추려면 `tokens.css`의 `--font-display`와 `fonts.css`만 바꾸면 됩니다.
