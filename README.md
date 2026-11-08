# KEPCO Web Magazine

Figma `Home` 페이지(Desktop 1440 · Tablet 768 · Mobile 375)를 HTML/CSS/JS로 구현한 웹진입니다. 빌드 도구 없이 `index.html`을 브라우저로 열면 바로 볼 수 있습니다.

## 폴더 구조

```
index.html
assets/
  css/
    tokens.css       Figma 변수(색상·간격·타이포·레이아웃)와 반응형 값
    base.css         리셋, 공통 요소
    components.css   Button · Card · Input(Field)
    layout.css       Header · 메뉴 · Hero · 카드 그리드 · 뉴스레터 · Footer · 등장 효과
  js/
    menu.js          전체 메뉴 열기/닫기 (ESC, 배경 클릭, 포커스 가두기, 스크롤 잠금)
    header.js        스크롤 시 헤더 그림자, 아래로 내리면 숨기고 올리면 표시
    smooth-scroll.js 페이지 안 앵커 링크 부드러운 스크롤
    newsletter.js    이메일 검사, 오류/완료 상태 표시 (전송은 임시 처리)
    reveal.js        스크롤하면 섹션·카드가 차례로 나타나는 효과
  images/
    logo-kepco.svg
```

## 반응형 기준

| 구간 | 너비 | 좌우 여백 | 섹션 여백 | 카드 간격 |
| --- | --- | --- | --- | --- |
| Desktop | 1024px 이상 | 120px | 120px | 24px |
| Tablet | 768–1023px | 40px | 88px | 20px |
| Mobile | 767px 이하 | 20px | 64px | 16px |

글자 크기와 간격은 모두 `assets/css/tokens.css`의 변수로 바꿀 수 있습니다.

## 남은 작업

- 뉴스레터 구독은 서버가 없어 `newsletter.js`의 `submitSubscription()`에서 임시로 처리합니다. API가 준비되면 이 함수만 바꾸면 됩니다.
- 카드 링크(`href="#"`)와 이미지는 실제 기사 데이터로 교체해야 합니다.
