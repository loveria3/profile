# 강지애 프로필 프로젝트 지침

## 프로젝트 개요
강지애 프로필 페이지를 관리하는 프로젝트.
최신 이력을 업데이트할 수 있는 구조를 유지하며, 기본 디자인 스타일을 반드시 지켜야 한다.
다른 스타일로의 변경은 사용자가 요청할 때만 진행한다.

---

## ⚠️ 필수 규칙 1 — 수정 파일 항상 명시
작업이 끝나면 **반드시** 수정한 파일 목록을 응답 마지막에 명시한다.

예시:
> **수정 파일:** `style.css`, `index.html`

파일이 하나여도, 여러 개여도 예외 없이 표기한다.
사용자가 GitHub 등에 직접 업로드해야 하기 때문에 누락하면 안 된다.

---

## ⚠️ 필수 규칙 2 — 기존 코드 최소 수정
기존 파일을 수정할 때는 **변경이 필요한 부분만 최소한으로 수정**한다.

- 전체 파일을 다시 쓰지 않는다. `Edit` 도구로 해당 부분만 교체한다.
- 기능 추가 시: 기존 로직은 건드리지 않고, 새 코드를 덧붙이는 방식을 우선한다.
- 기능 제거 시: 실제로 사용되는 부분(HTML·CSS·JS)만 정확히 삭제한다.
- 이 원칙은 디자인·스타일 변경 요청에도 동일하게 적용한다.

---

## ⚠️ 필수 규칙 3 — 모던 웹 가이드라인 준수
웹페이지를 생성하거나 수정할 때는 아래 모던 웹 표준을 반드시 지킨다.

### 반응형 (Responsive)
- 모든 페이지는 기본적으로 **반응형**으로 제작한다.
- `<meta name="viewport" content="width=device-width, initial-scale=1" />` 필수 포함.
- 모바일(≤640px), 태블릿(≤980px), 데스크탑 3단계 브레이크포인트 적용.
- 좌우 여백: 모바일 20px, 태블릿 24px, 데스크탑 40px 이상 확보.
- `padding` 단축형이 다른 클래스의 좌우 패딩을 덮어쓰지 않도록 주의 (`padding-left`/`padding-right` 분리 사용 권장).
- `overflow-x: hidden` 으로 가로 스크롤 방지.

### 접근성 (Accessibility)
- 이미지에 `alt` 속성 필수.
- 버튼/링크에 `aria-label` 또는 명확한 텍스트 제공.
- 색상 대비 WCAG AA 기준 이상 유지.
- 키보드 탐색 가능하도록 `focus` 스타일 유지.

### 성능 (Performance)
- 외부 폰트·라이브러리는 CDN 사용, `preconnect` 힌트 포함.
- 이미지는 `object-fit: cover` + 적절한 크기 지정.
- 불필요한 인라인 스타일 최소화, CSS 클래스로 관리.

### 시맨틱 HTML
- `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>` 등 시맨틱 태그 사용.
- 제목 계층 `h1 → h2 → h3` 순서 준수.
- 링크에 `href`, 폼에 `label` 연결 필수.

### CSS 품질
- CSS 변수(`--variable`) 활용으로 색상·간격 일관성 유지.
- 기존 `style.css`의 디자인 토큰(색상, 폰트, 간격) 그대로 사용.
- 미디어 쿼리는 모바일 퍼스트 또는 데스크탑 퍼스트 중 프로젝트 방향 통일.

---

## 디자인 스타일 토큰 (변경 금지)
```
--bg: #f4ede2          /* 따뜻한 베이지 배경 */
--paper: #fbf6ec       /* 카드 배경 */
--ink: #1b1a18         /* 주 텍스트 */
--accent: #2a3b2e      /* 포인트 딥 그린 */
--accent-warm: #b3753a /* 웜 카퍼 */
--gold: #c9a35b        /* 골드 */

폰트: Pretendard (본문) / Noto Serif KR (제목·포인트) / JetBrains Mono (코드·날짜)
```

---

## ⚠️ 필수 규칙 4 — 푸터에 "Made with Claude" 표기
모든 신규 페이지의 `<footer>` 하단 `.foot-bottom` 영역에 반드시 아래 문구를 포함한다.

```html
<span class="mono">Made with Claude · v 1.0 · {페이지명}</span>
```

- 기존 페이지(index.html, all.html, edu.html)에는 이미 적용되어 있다.
- 신규 페이지 생성 시 예외 없이 동일하게 적용한다.

---

## ⚠️ 필수 규칙 5 — 작업 완료 전 최종 검수
작업을 마치기 **전에** 반드시 스스로 최종 검수를 수행하고, 결과를 응답 마지막에 명시한다.

### 검수 체크리스트
- [ ] HTML 태그 열고 닫힘 오류 없음
- [ ] JS 함수 호출 및 변수 참조 오류 없음
- [ ] 새로 추가한 함수/변수명 충돌 없음 (기존 코드와 중복 없음)
- [ ] 기존 기능(저장·수정·삭제·달력·목록)이 그대로 동작하는지 점검
- [ ] 디자인 토큰(색상 변수) 올바르게 사용했는지 확인
- [ ] 반응형: 모바일 미디어쿼리 영향 없음
- [ ] Apps Script 수정 시: 기존 doGet/doPost 라우팅 로직 보존 여부 확인

검수 완료 후 이상 없음을 확인한 뒤에만 작업 완료를 알린다.
검수 중 문제가 발견되면 사용자에게 알리기 전에 먼저 수정한다.

### 검수 결과 표기 형식 (응답 마지막에 반드시 포함)
```
✅ 검수 완료
- HTML 태그: 이상 없음
- JS 로직: 이상 없음
- 기존 기능: 보존 확인
- 디자인 토큰: 준수
```

---

## ⚠️ 필수 규칙 6 — 작업 완료 시 수정 파일 명시 (규칙 1 보강)
작업이 완료되면 응답 마지막에 수정된 파일을 반드시 명시한다.

- 규칙 1과 동일하나, **GitHub 업로드 대상 파일**임을 명확히 인식시킨다.
- 파일이 여러 개인 경우 각각 나열한다.
- 사용자가 직접 업로드해야 하므로 누락 시 작업이 반영되지 않는다.

예시:
> **수정 파일 (GitHub 업로드 필요):** `schedule.html`, `schedule-apps-script.txt`

---

## 사이트 구성도 (서브 페이지 포함)

```
강지애 프로필 사이트
│
├── index.html            # 메인 프로필 페이지 (공개)
│   ├── #about            소개 섹션
│   ├── #competency       핵심역량 섹션
│   ├── #certificates     자격·연수 섹션
│   └── #experience       강의 경력 섹션 (구글 시트 API 연동)
│
├── all.html              # 수업활용앱 모음 페이지 (페이지 공개 · 앱 추가/수정만 PIN)
│   ├── 구글 시트에서 앱 목록 로드 (카테고리: 퀴즈/시뮬레이션/게임/도구/수업)
│   └── 앱 추가·수정 (PIN 인증 후)
│
├── edu.html              # 실시간 교육 모니터링 페이지 (공개)
│   └── 구글 시트 공고목록 연동 + 카카오 알림
│
├── schedule.html         # 강의 스케쥴 관리 페이지 (PIN 보호 · 비공개)
│   ├── 달력 뷰 (월별 강의 일정)
│   ├── 강의 목록 뷰 (이달 강의 테이블)
│   ├── 강의 추가/수정/삭제
│   ├── 자격 · 연수 등록/수정/삭제 (자격증현황 시트)
│   ├── PDF 다운로드
│   └── 경력등록 완료 버튼 (지난 강의 → 경력사항 자동 입력)
│
└── high.html             # 고교학점제 진로설계 실습 앱 (수업용 · 독립 페이지)
```

---

## 파일 구조
```
profile/
├── index.html                  # 메인 프로필 페이지
├── all.html                    # 수업활용앱 모음 페이지
├── edu.html                    # 실시간 교육 모니터링 페이지
├── schedule.html               # 강의 스케쥴 관리 페이지 (PIN 보호)
├── high.html                   # 고교학점제 진로설계 실습 앱 (수업용)
├── style.css                   # 공유 스타일시트 (index + edu 공통)
├── stats.json                  # 통계 데이터
├── resume-download.js          # 경력서 PDF 생성 스크립트 (jsPDF + html2canvas)
├── resume-apps-script.txt      # 경력서용 구글 시트 Apps Script (참고용)
├── schedule-apps-script.txt    # 강의 스케쥴용 구글 시트 Apps Script (참고용)
├── apps-gallery-script.txt     # 수업앱 목록용 구글 시트 Apps Script (참고용)
└── assets/
    ├── portrait.png      # 프로필 사진
    ├── daisy.png         # 데이지 로고 (네비게이션 · PIN화면 공통)
    └── flower-bar.png    # 하단 플라워 바 이미지
```

---

## 페이지별 기술 명세

### index.html — 메인 프로필 페이지
- **공개 여부**: 공개
- **외부 의존**: `style.css`, `resume-download.js`, `stats.json`
- **stats.json**: 통계 카운터 데이터. 카드에 `source` 필드가 있으면 시트 연동(아래).
- **주요 버튼**: 명함 다운로드 (html2canvas 캡처), 경력서 다운로드 (resume-download.js 호출)
- **시트 자동 연동 (페이지 하단 인라인 스크립트, `RESUME_API_URL` 전역 재사용)**:
  - **강의 경력 학교 칩**: `.schools[data-org-prefix]` (에듀인플랫폼 / 제주대학교 찾아가는) — 시트 경력의 `주요업무`에서 학교명을 추출해 **기존 칩은 유지하고 새 학교만 중복 없이 추가** (학교 접미사 정규화로 중복 판정).
  - **통계 숫자**: `.num[data-source]` (schools/certs)에 **5단위 내림** 표시 (예: 23→20+). schools=학교 칩 distinct 수, certs=시트 자격증 수. stats.json 카드의 `source` 필드로 연결, `.numval`/`.plus`/`.unit` 구조.
  - **자격·연수 카드**: 시트 `certificates`를 자격 섹션 카드로 **새 항목만 중복 없이 추가**. 분류는 `group`(edtech/national) → 비었으면 발급기관 자동분류, `연수/교육`→연수 탭. 급수(`extra`)·이수시간 표시.

### resume-download.js — 경력서 PDF 생성 스크립트
- **RESUME_API_URL**: `https://script.google.com/macros/s/AKfycbzu3aLNJNMPlwmf1648mua6sED-94nHXEIdpJXoQl7mfFtyYxmMu9EJVjTrnZ2ine6nhA/exec`
- ⚠️ **schedule.html의 SCHEDULE_API_URL과 완전히 동일한 URL** — 같은 Apps Script 웹앱 사용
- 연결 시트: `학력사항`, `경력사항`, `자격증현황`
- PDF 출력 순서: 학력사항 → 경력사항(+에듀인/찾아가는 그룹) → 자격증 → 연수 및 교육
- **경력 가공 (`processCareer`)**:
  - **통합 계약 (`MERGE_CONTRACTS`)**: 대정중학교(2026.03.09~2026.12.31·디지털튜터)·남원중학교(2026.04.01~2026.11.30·강사)는 여러 강의를 **한 줄로 통합**하고 비고에 "현재 진행중" 표기. `start`/`end`/`work`는 코드 상단에서 한 줄로 수정. 정렬은 종료일 기준 → 진행중 계약이 상단.
  - **별도 그룹 (`GROUP_BLOCKS`)**: `에듀인플랫폼`, `제주대학교 찾아가는`(학교컨설팅)은 경력사항 하단에 소제목 달고 따로 묶고 **비고를 비움**.
  - **정렬**: 경력 최신순(내림차순) + **완전중복 행 제거**.
- **PDF 렌더링 (재설계)**: 각 페이지를 **고정 A4 크기**로 렌더(297mm 캡 제거 → 잘림 방지) + margin 없는 padding 기반 높이 측정 + 안전여백. 가로줄 테이블, 페이지마다 푸터+페이지번호, 페이지 넘김 시 섹션 제목·컬럼헤더 반복(제목/행이 경계에서 잘리지 않음).

### all.html — 수업활용앱 모음
- **공개 여부**: **페이지는 공개**(누구나 앱 목록 열람). 단 **"앱 추가"·각 카드 "수정" 버튼은 PIN 인증**으로 보호.
- **PIN 게이트**: `_allPin` 모듈 (XOR 인코딩 + SHA-256 + 5회 실패 잠금, SALT `kja-all-2026`, **schedule.html과 동일 PIN**). 세션: `sessionStorage.getItem('kja_all_v1') === '1'`. 인증 성공 시에만 추가/수정 모달이 열림. (예전의 평문 `PASSWORD`/`allAuth` 방식은 폐기됨)
- **APPS_API_URL**: `https://script.google.com/macros/s/AKfycbw0vDZEh7uVvHFq8Y_H60VIoyi6exVjkMYZ9PSMHI3foTLlol9PLyl7BroQPDx8i6lKfA/exec`
- **Apps Script 파일**: `apps-gallery-script.txt` (schedule/edu와 **별개 배포**)
- **연결 시트**: `앱목록` (컬럼: 앱이름A | 설명B | URL C | 카테고리D | 등록일E | **ID F**)
- **카테고리**: 퀴즈 / 시뮬레이션 / 게임 / 도구 / **수업** (필터 버튼 + 추가/수정 폼 옵션, `catClass` 매핑 `cat-class`)
- **앱 추가/수정**: 추가 모달을 추가·수정 공용으로 사용. 수정은 카드 "수정" 버튼 → PIN → 제목·설명·URL·카테고리 변경 → `action:'update'`로 ID(F열) 기준 갱신(등록일 유지).
- URL이 비어 있으면 `DEFAULT_APPS` 하드코딩 폴백 (폴백 항목은 ID가 없어 수정 불가)

### edu.html — 실시간 교육 모니터링
- **공개 여부**: 공개 (PIN 없음)
- **APPS_SCRIPT_URL**: `https://script.google.com/macros/s/AKfycbxZsgsakUwZJES61mpJNK7amyIFI7IYOpxwrHgAGeD0LkYqQ3Tb3ak1DLO-8ygF3no/exec`
- ⚠️ **schedule/resume URL과 다른 별도 Apps Script 배포**
- **연결 시트**: `수집기관` (GET `?sheet=수집기관`), `공고목록` (GET `?sheet=공고목록`)
- **카카오 알림**: `data.sheet === '알림요청'` POST 액션으로 처리 (스크립트 내장)
- **로컬 캐시**: `localStorage` 사용 (수집기관 목록, 공고 데이터 보존)
- 기관 추가/공고 수동 등록 기능 포함

### schedule.html — 강의 스케쥴 관리
- **공개 여부**: PIN 보호 (XOR 인코딩 + SHA-256 + 5회 실패 시 잠금)
- **SCHEDULE_API_URL**: `https://script.google.com/macros/s/AKfycbzu3aLNJNMPlwmf1648mua6sED-94nHXEIdpJXoQl7mfFtyYxmMu9EJVjTrnZ2ine6nhA/exec`
- ⚠️ **resume-download.js의 RESUME_API_URL과 완전히 동일** — 하나의 Apps Script로 통합 관리
- **Apps Script 파일**: `schedule-apps-script.txt` (resume + schedule + 카카오 통합)
- **연결 시트**: `강의스케쥴` (11컬럼), `경력사항` (경력등록), **`자격증현황` (자격·연수 관리)**
- **시간 형식**: `HH:MM-HH:MM` 또는 `HH:MM~HH:MM` 둘 다 허용 (정규식 `/[~\-]/`)
- **회사 색상**: `PRESET_COMPANIES` 객체에 하드코딩 + `AUTO_PALETTE` 자동 배정, `localStorage`에 저장
- **달력 셀 클릭**: 날짜 칸의 빈 영역 클릭 시 해당 날짜로 강의 추가 모달이 열림(하루 2건 이상 등록 가능). 뱃지 클릭은 수정.
- **자격 · 연수 관리(신규)**: "자격 · 연수" 섹션에서 자격증/연수를 **분리 폼**으로 등록·수정·삭제. `loadCerts()`가 base GET(`certificates`)으로 로드, 카테고리로 자격증/연수 테이블 분리. 액션 `certAdd`/`certUpdate`/`certDelete`. 등록 데이터는 인덱스 자격 섹션·경력서 PDF에 자동 반영.

### high.html — 고교학점제 진로설계 실습 앱
- **공개 여부**: 공개 (수업용 독립 페이지)
- **외부 API 없음**: 모든 과목 데이터가 JS 내 하드코딩
- **PIN/비밀번호 없음**: 완전 공개
- **기능**: 진로 유형별 과목 추천, 이수 계획 시뮬레이션, PDF 출력

---

## Apps Script 웹앱 URL 정리

| 파일 | 변수명 | 용도 |
|---|---|---|
| `schedule-apps-script.txt` | `SCHEDULE_API_URL` / `RESUME_API_URL` | schedule.html + resume-download.js **공용** |
| `apps-gallery-script.txt` | `APPS_API_URL` | all.html 전용 |
| (별도 스크립트) | `APPS_SCRIPT_URL` | edu.html 전용 |

> ⚠️ schedule.html과 index.html(경력서)은 같은 Apps Script URL을 공유한다.  
> Apps Script를 재배포하면 두 기능 모두 새 URL로 업데이트해야 한다.  
> 업데이트 위치: `schedule.html` 상단 `SCHEDULE_API_URL`, `resume-download.js` 상단 `RESUME_API_URL`

---

## 경력 데이터 관리 방식

### 데이터 흐름
```
구글 스프레드시트 → Google Apps Script (웹앱) → index.html
```

- 경력 데이터는 구글 스프레드시트에서 관리한다.
- 스프레드시트에는 3개의 시트가 있다: `학력사항`, `경력사항`, `자격증현황`
- Google Apps Script 웹앱 URL이 `resume-download.js` 상단 `RESUME_API_URL` 변수에 설정되어 있다.

### 경력 업데이트 방법 (사용자 직접 관리)
- **일상적인 경력 추가**: 구글 스프레드시트에 직접 행을 추가한다.
- **여러 건 한꺼번에 정리**: Claude에게 내용을 주고 표 형식으로 정리 요청 후 복붙한다.
- 시트를 저장하면 다음 경력서 다운로드 시 자동 반영된다. 별도 배포 불필요.

### 다운로드 기능 (index.html 버튼)
- **명함 다운로드**: index.html 내 카드 디자인을 html2canvas로 캡처해 이미지로 저장
- **경력서 다운로드**: 구글 시트 데이터를 API로 가져와 jsPDF + html2canvas로 A4 PDF 생성
  - 학력사항 → 경력사항 → 자격증 → 연수 및 교육 순서로 출력
  - 경력사항은 학력사항 바로 아래에 이어서 시작 (행이 많아 페이지 넘김 자동 처리)
  - 테이블이 페이지를 넘어갈 때 섹션 제목과 컬럼 헤더가 다음 페이지 상단에 반복됨
  - 인쇄 친화적 디자인 (흰 배경, 연한 색상만 사용)

---

## 스케쥴 → 경력 자동 등록 기능

### 기능 개요
schedule.html 달력에서 **지난 날짜의 강의**에 "경력등록" 버튼이 나타나며, 클릭 시 구글 시트 `경력사항` 탭에 자동으로 행이 추가된다.

### 데이터 매핑 규칙 (스케쥴 → 경력사항)
| 스케쥴 필드 | 경력사항 필드 | 변환 방식 |
|---|---|---|
| `date` | `근무기간` | `2026-05-26` → `2026.05.26` |
| `company` | `기관/직장명` | 그대로 사용 |
| `type` | `직위/역할` | 교육수강→수강 / 디지털튜터→디지털튜터 / 나머지→강사 |
| `school`+`hours`+`topic` | `주요업무` | `{school} ({hours}h) — {topic}` 형식 조합 |
| (없음) | `퇴직/종료사유` | "완료" 고정 |

### 완료 상태 추적
- 구글 시트 `강의스케쥴` 탭의 11번째 컬럼 `경력등록` 에 `Y` 저장
- 달력에서 이미 등록된 강의는 "✓ 경력등록됨" 뱃지로 표시 (버튼 없음)

### 버튼 표시 조건
- 달력 뷰에서만 표시 (목록 테이블에는 없음)
- 이벤트 날짜 < 오늘 인 경우에만 표시
- `교육수강` 타입도 포함 (수강 이력으로 등록)

### Apps Script 액션 목록 (`schedule-apps-script.txt`, POST `action`)
| action | 기능 |
|---|---|
| `add` | 스케쥴 추가 |
| `update` | 스케쥴 수정 |
| `delete` | 스케쥴 삭제 |
| `complete` | 경력사항 등록 + 완료 플래그 저장 |
| `certAdd` | 자격증/연수 추가 (자격증현황 시트) |
| `certUpdate` | 자격증/연수 수정 (ID 기준) |
| `certDelete` | 자격증/연수 삭제 (ID 기준) |

> `apps-gallery-script.txt`(별도 배포)는 앱 추가(기본 POST) + `action:'update'`(앱 수정)을 지원하며, `앱목록` 시트의 ID 컬럼(F)을 사용한다.

---

## 자격 · 연수 관리 (자격증현황 시트)

### 시트 스키마 (컬럼 8개)
```
A 카테고리 | B 명칭 | C 날짜 | D 발급/주관기관 | E 비고/결과 | F 급수/시간 | G 분류 | H ID
```
- **카테고리**: `자격증` 또는 `연수/교육`
- **F 급수/시간**: 자격증=급수(예 1급)·연수=이수시간(h)
- **G 분류**: 자격증 탭 `edtech`(에듀테크&SW·AI) / `national`(국가공인&전문자격). 비었으면 인덱스가 발급기관으로 자동 분류
- **H ID**: `readCertificates`가 비어 있으면 자동 부여(백필) — 수정/삭제에 필요

### 데이터 흐름
```
schedule.html 자격·연수 폼 → 자격증현황 시트 → (index 자격 섹션 카드 · 경력서 PDF) 자동 반영
```

---

## ⚠️ 배포(재배포) 주의
- `schedule-apps-script.txt`는 **schedule.html + resume-download.js 공용**. 자격·연수 액션 추가 등 스크립트 변경 시 **재배포 필요**.
- `apps-gallery-script.txt`는 **all.html 전용 별개 배포**. 앱 수정(update)·ID 컬럼 추가 등 변경 시 이 스크립트를 **따로 재배포**.
- 재배포는 **"배포 관리 → 기존 배포 편집 → 버전: 새 버전"**으로 하면 **URL이 유지**되어 코드 내 URL을 바꿀 필요가 없다. (새 배포를 만들면 URL이 바뀌어 해당 파일들의 URL을 모두 갱신해야 함)

---

## 개발 환경 주의 (Claude 작업용)
- 이 폴더는 **OneDrive 동기화** 폴더라, 셸(bash) 마운트가 **지연되어 옛/잘린 사본**을 읽을 수 있다. `node -c`가 파일 끝에서 "Unexpected end of input"을 내면 대개 동기화 지연이지 실제 오류가 아니다.
- **Read/Edit 도구가 authoritative**(사용자가 업로드할 실제 파일). 큰 JS/HTML 검증은 사본을 outputs 폴더(비-OneDrive)에 만들어 `node -c`로 확인.
