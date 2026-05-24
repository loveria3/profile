/* ============================================================
   resume-download.js
   강지애 프로필 — 경력서 PDF 다운로드

   ⚠️ Apps Script 배포 후 아래 URL을 반드시 교체하세요
   ============================================================ */

const RESUME_API_URL = 'https://script.google.com/macros/s/AKfycbw-5MqFl6f8LnyU7BBOkmGo3N5hVRLKhIDbcLqJubAB8yxhA4U2HZymVyikEu3TIIaG8A/exec';

/* ── 버튼 초기화 ────────────────────────────────────────── */
(function () {
  const btn = document.getElementById('resumeDlBtn');
  if (!btn) return;

  btn.addEventListener('click', async function () {
    setLoading(btn, true);
    try {
      const data = await fetchResumeData();
      await generatePDF(data);
    } catch (e) {
      console.error('경력서 생성 오류:', e);
      alert('경력서를 불러오는 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(btn, false);
    }
  });
})();

/* ── 1. 데이터 fetch ─────────────────────────────────────── */
async function fetchResumeData() {
  const res = await fetch(RESUME_API_URL);
  if (!res.ok) throw new Error('API 응답 오류: ' + res.status);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

/* ── 2. PDF 생성 (html2canvas → jsPDF) ──────────────────── */
async function generatePDF(data) {
  // 숨겨진 렌더링 컨테이너 생성
  const container = buildResumeHTML(data);
  document.body.appendChild(container);

  // 폰트 로드 대기
  await document.fonts.ready;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const A4_W = 794;   // px (96dpi 기준 A4 너비)
  const A4_H = 1123;  // px (96dpi 기준 A4 높이)
  const MM_W = 210;   // mm
  const MM_H = 297;   // mm

  // 전체 컨텐츠를 페이지 단위로 분할하여 캡처
  const totalH = container.scrollHeight;
  let yOffset = 0;
  let pageIndex = 0;

  while (yOffset < totalH) {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      y: yOffset,
      height: Math.min(A4_H, totalH - yOffset),
      width: A4_W,
      windowWidth: A4_W,
      backgroundColor: '#fbf6ec'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const capturedH = Math.min(A4_H, totalH - yOffset);
    const mmH = (capturedH / A4_H) * MM_H;

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, MM_W, mmH);

    yOffset += A4_H;
    pageIndex++;
  }

  document.body.removeChild(container);
  pdf.save('강지애_경력서_' + today() + '.pdf');
}

/* ── 3. 경력서 HTML 빌드 ─────────────────────────────────── */
function buildResumeHTML(data) {
  const { basicInfo: b, education, career, certificates } = data;

  // 자격증 / 연수 분리
  const certs    = (certificates || []).filter(c => c.category === '자격증');
  const training = (certificates || []).filter(c => c.category === '연수/교육');

  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'position:fixed', 'top:0', 'left:-9999px',
    'width:794px', 'background:#fbf6ec',
    'font-family:"Pretendard","Noto Sans KR",sans-serif',
    'color:#1b1a18', 'box-sizing:border-box',
    'padding:48px 52px'
  ].join(';');

  wrap.innerHTML = `
    <!-- ── 헤더 ── -->
    <div style="background:#2a3b2e;color:#fff;border-radius:8px;padding:28px 32px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <div style="font-family:'Noto Serif KR',serif;font-size:32px;font-weight:700;letter-spacing:.04em;margin-bottom:6px;">${b.name}</div>
        <div style="font-size:13px;opacity:.85;letter-spacing:.05em;">${b.title}</div>
        <div style="font-size:11px;opacity:.65;margin-top:12px;font-family:'JetBrains Mono',monospace;">${b.intro}</div>
      </div>
      <div style="text-align:right;font-size:11px;opacity:.75;font-family:'JetBrains Mono',monospace;line-height:1.8;">
        <div>${b.phone}</div>
        <div>${b.email}</div>
        <div>JEJU · KR</div>
      </div>
    </div>

    <!-- ── 학력사항 ── -->
    ${sectionHTML('학력사항', 'Education')}
    ${tableHTML(
      ['재학기간', '학교명', '전공', '학위'],
      (education || []).map(e => [e.period, e.school, e.major, e.degree]),
      [28, 26, 26, 20]
    )}

    <!-- ── 경력사항 ── -->
    ${sectionHTML('경력사항', 'Career')}
    ${tableHTML(
      ['근무기간', '기관/직장명', '직위·역할', '주요업무', '비고'],
      (career || []).map(c => [c.period, c.org, c.position, c.work, c.note]),
      [22, 22, 14, 30, 12]
    )}

    <!-- ── 자격증 ── -->
    ${sectionHTML('자격증', 'Certificates')}
    ${tableHTML(
      ['취득일', '자격명', '발급기관'],
      certs.map(c => [c.date, c.name, c.issuer]),
      [18, 46, 36]
    )}

    <!-- ── 연수·교육 ── -->
    ${sectionHTML('연수 및 교육', 'Training')}
    ${tableHTML(
      ['일자', '연수명', '기관', '결과'],
      training.map(c => [c.date, c.name, c.issuer, c.note]),
      [18, 42, 28, 12]
    )}

    <!-- ── 푸터 ── -->
    <div style="margin-top:32px;padding-top:14px;border-top:1px solid #d0c4b0;display:flex;justify-content:space-between;font-size:10px;color:#7a6e5a;font-family:'JetBrains Mono',monospace;">
      <span>작성일: ${today()}</span>
      <span>강지애 · Kang Ji-ae</span>
    </div>
  `;

  return wrap;
}

/* ── 섹션 헤더 ──────────────────────────────────────────── */
function sectionHTML(ko, en) {
  return `
    <div style="display:flex;align-items:baseline;gap:10px;margin:24px 0 10px;padding-bottom:6px;border-bottom:2px solid #2a3b2e;">
      <span style="font-family:'Noto Serif KR',serif;font-size:16px;font-weight:700;color:#2a3b2e;">${ko}</span>
      <span style="font-size:10px;color:#b3753a;font-family:'JetBrains Mono',monospace;letter-spacing:.1em;">${en}</span>
    </div>`;
}

/* ── 테이블 ──────────────────────────────────────────────── */
function tableHTML(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cols = widths.map(w => `<col style="width:${(w/total*100).toFixed(1)}%">`).join('');

  const head = headers.map((h, i) =>
    `<th style="background:#2a3b2e;color:#fff;font-size:10px;font-weight:600;
               padding:7px 9px;text-align:left;border:1px solid #1b2e20;">${h}</th>`
  ).join('');

  const body = (rows || []).map((row, ri) => {
    const bg = ri % 2 === 0 ? '#fbf6ec' : '#f4ede2';
    const cells = headers.map((_, ci) =>
      `<td style="font-size:10px;padding:6px 9px;border:1px solid #d0c4b0;
                  background:${bg};vertical-align:top;line-height:1.55;">
         ${escHtml(String(row[ci] ?? ''))}
       </td>`
    ).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
      <colgroup>${cols}</colgroup>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

/* ── 유틸 ────────────────────────────────────────────────── */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function setLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           style="animation:spin 1s linear infinite" aria-hidden="true">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg> 생성 중…`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.origText || '경력서 다운로드';
  }
}
