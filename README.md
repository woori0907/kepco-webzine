# KEPCO 웹진 리뉴얼 시안 (2026년 10월호 기준)

현행 웹진(2026년 10월호 vol.640)을 「KEPCO 웹진 디자인 분석 및 개선 방안」에 따라 다시 만든 시안입니다.
`index.html`을 브라우저로 열면 바로 보이고, 인터넷 연결 없이 동작합니다(외부 CDN 0개 — 라이브러리는 메인 캐러셀용 jQuery · slick만 `assets/vendor`에 함께 들어 있음).

- 메인 1면 + 기사 15면(원고 6 · 자리만 잡은 9) + EVENT 1면을 만들었고, 기사는 모두 **같은 기사 템플릿 하나**를 씁니다.
  목차는 2027 제안서의 섹션·코너 체계를 따릅니다.
  - SPOTLIGHT · INCEPTION ← 10월호 커버스토리
  - KEPCO NOW · ISSUE NOW ← 스페셜테마1 / NEXT WAVE ← TRANS : MISSION / ON SITE ← FOCUS
  - LIFE & CULTURE(임시 이름) · TRAVEL MATE ← LOCAL : RISING / REFRESH ← RE : CHARGE / EVENT ← 퀴즈(별도 페이지)
- 원고와 사진은 현행 10월호에서 가져와 새 코너에 배치했습니다. 원고가 없는 코너 9개(THEME FOCUS · PERSPECTIVE · INSIDE · RE:VIEW · SCENE · KEPCO NEWS · ART & CULTURE · SCIENCE LAB · GREEN LIFE)는 1월호 기획안 제목으로 페이지와 자리만 잡아 두었습니다(사진은 회색 박스, 본문은 회색 줄). 제안 시안에서는 샘플북 원고로 바꿔 넣으면 됩니다.
- ON/OFF 구분(포인트색·구역 나누기)은 쓰지 않았습니다. 컨셉이 바뀔 예정이어서 색은 월별 키워드색 하나만 씁니다.

## 개선안 반영 내용

| 개선 방안 | 시안에서 구현한 것 |
| --- | --- |
| 디자인 토큰 | `assets/css/tokens.css` — 서체 1종(Pretendard, 세리프체 없음), 자간 -0.02em, 타입 스케일 40/24/22/19/17/14, 흰색·검정·회색 3단계 + 키워드색 1개, 8px 배수 간격, 12·8·4단 그리드, 이미지 비율 16:9·4:5·1:1 |
| 메인: 이번 달 표지로 열기 | 키워드 ‘전환’ + 호수 + 표지 아트(40초 영상 자리) + 커버스토리. 슬라이더 없이 섹션별 편집형 그리드(큰 카드 16:9 · 작은 가로형 카드 4:5). 섹션마다 메인 컬러에서 나온 배경색이 있고 스크롤하면 페이지 배경이 그 색으로 바뀜. 썸네일은 섹션 색 모노톤 → 마우스가 들어온 방향에서 원래 색으로. KEPCO NOW는 캐러셀: 큰 기사 1개가 6초마다 바뀌고(slick fade), 아래 썸네일에 진행 막대 · 이전/멈춤/다음 버튼. 큰 기사에 마우스를 올리거나 화면 밖이면 멈춤 |
| 카드 | 코너명 · 제목 · 한 줄 요약 · 읽는 시간(본문 글자 수로 자동 계산) |
| 기사 히어로 | 빈 색면·워터마크 대신 대표 이미지(화면 너비 가득, 첫 화면 높이) + 제목, 사진 위 제목은 어두운 그라데이션 막. 아래 화살표 버튼을 누르면 본문으로 부드럽게 이동 |
| 기사 목차 | 1200px 이상: 왼쪽 사이드 메뉴로 스크롤을 따라오며 지금 읽는 소제목 표시 / 그보다 좁으면 본문 위 박스 |
| 본문 칼럼 | 720px · 17px · Regular(400) · 행간 1.75 · `word-break: keep-all` |
| 본문 부품 | 3줄 요약, 소제목 목차, 소제목, 풀쿼트, 데이터 박스, 용어 박스, 이미지 박스(1·2·3칸), 사진+캡션(도표), 미니 인터뷰(1:1), 정보 박스, 참여 안내, 필자 소개 |
| 사진 크게 보기 | 본문 사진을 누르면 레이어 팝업, 이전·다음 넘기기 · ESC 닫기 · 키보드 조작 |
| 모바일 | 플로팅 버튼 5개 → 하단 탭바 1개(목차 · 이번 호 · 참여 · 위로), 아래로 스크롤하면 숨김 |
| 리모컨 (데스크톱) | 오른쪽 아래 고정, 아이콘만: 다음 기사 · 이전 기사 · 지난 호 보기 · 맨 위로. 마우스·키보드 포커스 시 이름표. 순서는 목차 순 + 맨 끝 EVENT(끝에서 처음으로). 1024px 미만은 하단 탭바가 대신함 |
| 모션 | 0.2–0.4초만 사용. 투명하게 시작하는 효과 없음. `prefers-reduced-motion` 존중 |
| 참여 | 메인: 독자 설문 · 뉴스레터 / EVENT 페이지: 퀴즈(채점·힌트) → 응모 폼(이름·연락처·소속·한마디·개인정보 동의) → 응모 한마디(댓글) 목록 — 모두 동작 |
| 접근성 | 모든 이미지 alt, 페이지별 제목, h1 하나 + 순서대로 된 제목 구조, 키보드 조작, 텍스트 대비 AA(4.5:1) 이상 |
| 경량화 | 이미지 JPG + 800px 버전 `srcset` + 지연 로딩, 폰트는 글자 범위별 woff2 서브셋 |

## 폴더 구조

```
index.html               메인 (생성됨)
articles/                기사 페이지 15개 (생성됨) — 파일 이름 = 코너 이름 (inception · issue-now · scene …)
                         + event.html (퀴즈)
guide/index.html         퍼블리셔용 컴포넌트 가이드 (생성됨, 목차에는 없음)
                         ※ 생성된 HTML은 직접 고치지 말고 src를 고친 뒤 다시 생성하세요.
src/
  lib/paths.mjs          페이지 위치에 맞는 상대경로(../assets 등)를 만드는 곳
  build.mjs              생성기: node src/build.mjs
  content/issue.mjs      호 정보 · 키워드 · 섹션/코너 목차 · 메인 배치 · 퀴즈 · 설문
  content/articles/*.mjs 기사 원고 (본문은 블록 목록)
  templates/             공통 틀 · 메인 · 기사 · 본문 부품 · 이벤트 · 가이드 · 아이콘
  lib/                   HTML · 이미지 헬퍼
assets/
  css/  tokens · base · components · layout(공통) / home(메인) / article(기사) / event / guide / fonts
  js/   공통: menu · scroll-ui · smooth-scroll · rise · participation
        메인: scene-bg(섹션 배경) · dir-hover(썸네일 방향 호버) · now-carousel(KEPCO NOW 캐러셀) · cover-video · newsletter
        기사: progress(읽기 진행) · toc-spy(목차 현재 위치) · lightbox(사진 크게 보기)
        EVENT: event-entry(응모 폼 · 한마디 목록, 저장 방식 local/sheets)
  images/2026-10/<기사>/  웹용 JPG
  fonts/  Pretendard — 제목·본문·UI 모두 (SIL OFL 1.1)
  vendor/ jQuery 3.7.1 · slick 1.8.1 (둘 다 MIT, 라이선스 파일 포함) — 메인 캐러셀에만 씀
tools/optimize-images.ps1  원본 이미지 → 웹용 JPG (Windows 기본 기능만 사용)
tools/apps-script/         구글 스프레드시트로 응모 받을 때 시트에 붙여 넣는 코드
```

## 다음 호 만드는 방법

1. 사진 원본을 기사별 폴더에 모아 줄입니다.
   `powershell -ExecutionPolicy Bypass -File tools/optimize-images.ps1 -Source <원본폴더> -Dest assets/images/2026-11`
2. `src/content/issue.mjs`에서 호 정보·키워드·퀴즈와 `sections`(섹션별 코너 목록과 메인 배치)를, `tokens.css`에서 키워드색 3줄(`--color-key*`)을 바꿉니다.
3. `src/content/articles/`에 기사 원고를 블록으로 넣습니다. 블록 종류는 `src/templates/blocks.mjs` 맨 위 표에 있습니다(인쇄본 모듈과 1:1).
   - 원고가 아직 없는 코너는 `draft: true`와 코너·성격·제목만 적으면 자리 잡힌 페이지가 만들어집니다. 원고가 들어오면 `draft`를 지우고 내용을 채웁니다. 원고 준비 중인 기사는 독자 설문 보기에서 빠집니다.
4. `node src/build.mjs` → `index.html`, `articles/`, `guide/`에 HTML이 생성됩니다(기사 폴더는 매번 비우고 새로 만듭니다). 생성기는 alt가 빠진 이미지, 3줄이 아닌 요약 등을 오류로 알려 줍니다.

Node.js(18 이상)만 있으면 되고 설치할 패키지는 없습니다.

## 퍼블리셔 작업 안내

- **컴포넌트 가이드**: `guide/index.html`을 열면 이미지 박스(1칸 · 2칸 · 3칸)의 실제 모양과, 원고 파일에 붙여 넣을 코드를 함께 볼 수 있습니다. 목차에는 나오지 않는 작업용 페이지입니다.
- **이미지 박스**: 본문 블록 `{ type: 'images', cols: 1|2|3, ratio, wide, items, caption }`. 사진이 없으면 칸 수만큼 회색 박스로 자리가 잡힙니다. 옵션 설명은 `src/templates/blocks.mjs`의 images 주석과 가이드 페이지에 있습니다.
- **사진 크게 보기**: 기사 본문 사진을 누르면 레이어 팝업으로 크게 보입니다(`assets/js/lightbox.js`). 따로 설정할 것은 없습니다.

## 운영 때 바꿀 곳

- **40초 홍보영상**: `assets/video/promo-2026-10.mp4`를 넣으면 메인 표지 자리에서 소리 없이 반복 재생됩니다(일시정지 버튼 포함). 파일이 없으면 표지 아트가 보입니다.
- **EVENT 응모·한마디**: `src/content/issue.mjs`의 `entry`에서 기간·발표·경품·개인정보 문구·샘플 한마디와 저장 방식(`store`)을 정합니다.
  - `store: 'local'` (지금): 이 브라우저에만 저장. 인터넷 없이 시연할 수 있고, 새로고침해도 남아 있습니다. 같은 연락처는 한 번만 응모됩니다.
  - **시연 초기화**: `articles/event.html?reset` 으로 한 번 열면 이 브라우저의 퀴즈 답·응모 기록이 지워집니다.
- **구글 스프레드시트로 응모 받기** (운영):
  1. 응모용 스프레드시트 → 확장 프로그램 → Apps Script에 `tools/apps-script/event-entry.gs`를 붙여 넣고 저장합니다.
  2. 배포 → 새 배포 → 웹 앱(실행 계정: 나, 액세스: 모든 사용자) → 나온 `…/exec` 주소를 복사합니다.
  3. `issue.mjs`에서 `entry.store: 'sheets'`, `entry.endpoint: '<웹 앱 주소>'`로 바꾸고 다시 빌드합니다.
  4. 응모는 이벤트 id 이름의 시트에 한 줄씩 쌓입니다. ‘공개’ 칸에 N을 적으면 그 한마디는 사이트에서 숨겨집니다(승인한 글만 보이게 하려면 스크립트의 `APPROVAL_REQUIRED = true`).
  5. 운영 전 확인: 이름·연락처를 구글(해외 서버)에 저장해도 되는지 개인정보·보안 담당 부서 확인, 사내망에서 `script.google.com` 접속 가능 여부. 안 되면 `event-entry.js`의 `STORES`에 사내 서버용 저장 방식을 하나 더 만들면 됩니다.
- **퀴즈·설문 저장**: 지금은 이 브라우저(localStorage)에만 저장됩니다. `assets/js/participation.js`의 `save()` 한 곳을 인트라넷 게시판/집계 API로 바꾸면 됩니다.
- **뉴스레터 신청**: `assets/js/newsletter.js`의 `submitSubscription()`을 실제 발송 시스템 API로 바꿉니다.
- **지난 호 링크**: `src/content/issue.mjs`의 `ARCHIVE_BASE`. 지금은 현행 사이트 주소이고, 같은 서버에 올릴 때는 `'../'`로 바꿔도 됩니다.
- **공유 미리보기(OG)**: `issue.siteUrl` 기준의 절대주소로 들어갑니다.
- **KEPCO NOW 캐러셀**: 섹션에 `layout: 'carousel'`을 적으면 그 섹션이 캐러셀이 됩니다(`issue.mjs`). 넘김 간격은 `home.css`의 `--now-delay`.
- **섹션 배경색 · 썸네일 모노톤 색**: `tokens.css`의 `--color-scene-*` · `--color-tone-*`. 색 강도는 `home.css`의 `--tone-strength`.
