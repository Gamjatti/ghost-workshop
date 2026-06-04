# 유령제작소 — 콘텐츠 허브 홈페이지

AI 디자인의 마지막 20%를 기록하고, 그 문제를 함께 실험할 초기 사용자를 모집하는 콘텐츠 허브형 사이트.
`Home | Blog | About [베타 신청]` 구조이며, 서비스명은 전면 노출하지 않습니다.

## 페이지

| 파일 | 설명 |
| --- | --- |
| `index.html` | Home (Hero / Problem / Core Thesis / Blog Preview / Category / Beta CTA / About Preview) |
| `blog.html` | Blog 리스트 + 카테고리 탭 필터 (전체 / 마지막 20% / Fix Lab / Worknote) |
| `about.html` | About (소개 / 문제 / 만드는 것 / 기술 방향 / 역량 / 레퍼런스 / CTA) |
| `beta.html` | AI 디자인 후처리 베타 신청 폼 |
| `post-why-ai-design-stops-at-80.html` | 글 템플릿 (마지막 20%) |
| `post-fix-ai-landing-page.html` | 글 템플릿 (Fix Lab · Before/After) |
| `post-click-is-coordinate.html` | 글 템플릿 (Worknote) |
| `styles.css` | 공유 디자인 시스템 |
| `script.js` | 네비게이션 / 스크롤 리빌 / 블로그 필터 / 베타 폼 |

## 미리보기

빌드 도구 없이 `index.html`을 열면 됩니다. 카테고리 필터의 `?category=` 동작 확인은 로컬 서버 권장.

```powershell
python -m http.server 5173   # → http://localhost:5173
```

## 베타 폼 연결

`script.js` 맨 위 `FORM_ENDPOINT`에 Formspree 주소를 넣으면 바로 전송됩니다. 비워두면 안내 메시지만 표시됩니다.

```js
const FORM_ENDPOINT = "https://formspree.io/f/xxxxxx";
```

## 디자인 시스템

- 배경 `#06080B` / 본문 `#F4F6F9` / 보조 `#9AA3AF`
- 단일 액센트 민트 `#44F0CE`. 카테고리 기능색: Fix Lab `#5AA6FF`, Worknote `#C9A6FF`
- 폰트: Pretendard(국문) · Inter(영문)
- 시그니처: "80% / 20%" 비율 바, Before/After, 그리드 모티프
- [taste-skill](https://github.com/Leonxlnx/taste-skill) anti-slop 룰 반영 (단일 액센트 / em-dash 0 / eyebrow 절제 / 레이아웃 반복 회피)

## 배포

정적 사이트. Vercel · Netlify · Cloudflare Pages · GitHub Pages 어디든 폴더째 업로드.
