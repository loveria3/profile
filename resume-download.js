/* ============================================================
   resume-download.js — 강지애 프로필 경력서 PDF
   ============================================================ */

const RESUME_API_URL = 'https://script.google.com/macros/s/AKfycbzu3aLNJNMPlwmf1648mua6sED-94nHXEIdpJXoQl7mfFtyYxmMu9EJVjTrnZ2ine6nhA/exec';

/* ── 디자인 토큰 (웹사이트와 동일한 팔레트, 인쇄 친화적) ──
   --ink    : #1b1a18   주 텍스트
   --accent : #2a3b2e   딥 그린 (선·텍스트 전용, 배경 없음)
   --gold   : #c9a35b   골드 포인트
   --copper : #b3753a   웜 카퍼 서브
   배경은 항상 흰색(#fff) 또는 매우 연한 그린(#f4f7f4)       */

/* ── A4 상수 @96dpi ─────────────────────────────────────── */
const PDF_W  = 794;
const PDF_H  = 1123;
const PAD    = 44;
const INNER  = PDF_W - PAD * 2;   // 706 px
const USABLE = PDF_H - PAD * 2;   // 1035 px
const PX2MM  = 210 / PDF_W;

/* ── 초기화 ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('resumeDlBtn');
  if (!btn) { console.error('[경력서] 버튼 없음'); return; }
  console.log('[경력서] 초기화 완료');

  btn.addEventListener('click', async function () {
    setLoading(btn, true);
    try {
      console.log('[경력서] 데이터 요청...');
      const data = await fetchData();
      console.log('[경력서] PDF 생성 시작');
      await generatePDF(data);
      console.log('[경력서] 완료');
    } catch (e) {
      console.error('[경력서] 오류:', e);
      alert('경력서 생성 오류\n\n' + e.message + '\n\n콘솔(F12)에서 확인하세요.');
    } finally {
      setLoading(btn, false);
    }
  });
});

async function fetchData() {
  const res = await fetch(RESUME_API_URL);
  if (!res.ok) throw new Error('API 오류: ' + res.status);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

/* ══════════════════════════════════════════════════════════
   PDF 생성 메인
   ══════════════════════════════════════════════════════════ */
async function generatePDF(data) {
  const { basicInfo: bi, education, career, certificates } = data;
  const certs    = (certificates || []).filter(c => c.category === '자격증');
  const training = (certificates || []).filter(c => c.category === '연수/교육');

  /* ① 블록 생성 */
  const blocks = buildBlocks(bi, education || [], career || [], certs, training);

  /* ② 블록 높이 측정 */
  const measurer = mkDiv(`position:fixed;top:0;left:-9999px;width:${INNER}px;background:#fff;
    box-sizing:border-box;font-family:'Pretendard','Noto Sans KR',sans-serif;color:#1b1a18;`);
  document.body.appendChild(measurer);
  await document.fonts.ready;
  await wait(300);

  for (const blk of blocks) {
    measurer.innerHTML = blk.html;
    blk.h = measurer.offsetHeight;
  }
  document.body.removeChild(measurer);

  /* ③ 페이지 팩킹 */
  const pages = packPages(blocks);

  /* ④ 페이지 렌더링 → PDF */
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const renderer = mkDiv(`position:fixed;top:0;left:-9999px;width:${PDF_W}px;background:#fff;
    box-sizing:border-box;font-family:'Pretendard','Noto Sans KR',sans-serif;
    color:#1b1a18;padding:${PAD}px;`);
  document.body.appendChild(renderer);

  /* 이미지가 모두 로드될 때까지 대기하는 헬퍼 */
  async function waitForImages(el) {
    const imgs = Array.from(el.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load',  resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 4000); // 최대 4초 대기
      });
    }));
  }

  for (let pi = 0; pi < pages.length; pi++) {
    const pg = pages[pi];
    if (!pg.length) continue;

    renderer.innerHTML = pg.map(b => b.html).join('');
    await waitForImages(renderer); // ← 이미지 로드 완료 대기
    await wait(120);

    const canvas = await html2canvas(renderer, {
      scale: 2, useCORS: true, logging: false,
      backgroundColor: '#ffffff', width: PDF_W,
      allowTaint: false, imageTimeout: 15000
    });

    const hMM = Math.min((canvas.height / 2) * PX2MM, 297);
    if (pi > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, 210, hMM);
  }

  document.body.removeChild(renderer);
  pdf.save(`강지애_경력서_${today()}.pdf`);
}

/* ══════════════════════════════════════════════════════════
   블록 생성
   ══════════════════════════════════════════════════════════ */
function buildBlocks(bi, education, career, certs, training) {
  const list = [];

  /* ── 이력서 헤더 ─────────────────────────────────────────
     배경 없음 / 딥 그린 왼쪽 액센트 바 / 골드 구분선       */
  list.push({
    type: 'header',
    html: `
      <!-- 상단 레이블 바 -->
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding-bottom:8px;margin-bottom:16px;
                  border-bottom:1px solid #c9a35b;">
        <span style="font-size:10px;color:#c9a35b;font-family:'JetBrains Mono',monospace;
                     letter-spacing:.2em;text-transform:uppercase;">
          CURRICULUM VITAE
        </span>
        <span style="font-size:10px;color:#aaa;font-family:'JetBrains Mono',monospace;">
          ${today()}
        </span>
      </div>

      <!-- 이름 + 정보 -->
      <div style="display:flex;gap:14px;align-items:flex-start;">
        <div style="width:3px;background:#2a3b2e;border-radius:2px;min-height:90px;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="font-family:'Noto Serif KR',serif;font-size:28px;font-weight:700;
                      color:#1b1a18;letter-spacing:.05em;line-height:1.15;margin-bottom:5px;">
            ${bi.name}
          </div>
          <div style="font-size:12.5px;color:#2a3b2e;font-weight:600;letter-spacing:.1em;
                      text-transform:uppercase;margin-bottom:14px;">
            ${bi.title}
          </div>
          <div style="font-size:11px;color:#555;font-family:'JetBrains Mono',monospace;
                      line-height:2;letter-spacing:.03em;">
            <div>EMAIL &nbsp; ${bi.email}</div>
            <div>JEJU · KR</div>
          </div>
          <div style="font-size:10.5px;color:#999;margin-top:10px;
                      font-family:'JetBrains Mono',monospace;line-height:1.6;">
            ${bi.intro}
          </div>
        </div>
      </div>

      <!-- 하단 구분선 -->
      <div style="margin-top:18px;display:flex;gap:0;">
        <div style="flex:2;height:2px;background:#2a3b2e;border-radius:1px 0 0 1px;"></div>
        <div style="flex:1;height:2px;background:#c9a35b;"></div>
        <div style="flex:1;height:2px;background:#e8ede9;border-radius:0 1px 1px 0;"></div>
      </div>
    `
  });

  /* ── 섹션 추가 헬퍼 ──────────────────────────────────── */
  function addSection(ko, en, headers, widths, rows, getRow) {
    list.push({ type: 'section', ko, en, html: htmlSection(ko, en) });
    list.push({ type: 'thead',   ko, en, headers, widths, html: htmlThead(headers, widths) });
    rows.forEach((row, i) => {
      list.push({ type: 'trow', ko, html: htmlTrow(getRow(row), widths, i % 2 === 0) });
    });
  }

  addSection('학력사항', 'Education',
    ['재학기간', '학교명', '전공', '학위'], [26, 26, 26, 22],
    education, e => [e.period, e.school, e.major, e.degree]);

  addSection('경력사항', 'Career',
    ['근무기간', '기관/직장명', '직위·역할', '주요업무', '비고'], [20, 22, 13, 33, 12],
    career, c => [c.period, c.org, c.position, c.work, c.note]);

  addSection('자격증', 'Certificates',
    ['취득일', '자격명', '발급기관'], [18, 46, 36],
    certs, c => [c.date, c.name, c.issuer]);

  addSection('연수 및 교육', 'Training',
    ['일자', '연수명', '기관', '결과'], [16, 44, 28, 12],
    training, c => [c.date, c.name, c.issuer, c.note]);

  /* ── 푸터 ──────────────────────────────────────────────── */
  list.push({
    type: 'footer',
    html: `
      <div style="margin-top:28px;padding-top:10px;
                  border-top:1px solid #c9a35b;
                  display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:10px;color:#c9a35b;font-family:'JetBrains Mono',monospace;
                     letter-spacing:.15em;">KANG JI-AE · DIGITAL INSTRUCTOR · JEJU</span>
        <span style="font-size:10px;color:#bbb;font-family:'JetBrains Mono',monospace;">
          작성일 ${today()}
        </span>
      </div>`
  });

  return list;
}

/* ══════════════════════════════════════════════════════════
   페이지 팩킹
   ══════════════════════════════════════════════════════════ */
function packPages(blocks) {
  const pages = [[]];
  let usedH = 0;

  const cur = () => pages[pages.length - 1];
  function newPage() { pages.push([]); usedH = 0; }
  function add(blk)  { cur().push(blk); usedH += blk.h; }

  /* 섹션 제목 + 테이블 헤더 높이만 계산 (데이터 행 제외)
     → 이 최소 높이가 안 들어갈 때만 새 페이지 시작            */
  function sectionMinHeight(startIdx) {
    let h = 0;
    for (let j = startIdx; j < blocks.length; j++) {
      const t = blocks[j].type;
      if (t === 'trow' || t === 'footer') break;
      if (j !== startIdx && t === 'section') break;
      h += blocks[j].h;
    }
    return h;
  }

  for (let i = 0; i < blocks.length; i++) {
    const blk = blocks[i];

    if (blk.type === 'header') { add(blk); continue; }

    if (blk.type === 'section') {
      const minH = sectionMinHeight(i);
      if (usedH > 0 && usedH + minH > USABLE) newPage();
      add(blk);
      continue;
    }

    if (blk.type === 'thead') {
      if (usedH + blk.h > USABLE) newPage();
      add(blk);
      continue;
    }

    if (blk.type === 'trow') {
      if (usedH + blk.h > USABLE) {
        newPage();
        const secBlk = [...blocks].slice(0, i).reverse().find(b => b.type === 'section' && b.ko === blk.ko);
        const thBlk  = [...blocks].slice(0, i).reverse().find(b => b.type === 'thead'   && b.ko === blk.ko);
        if (secBlk) add(secBlk);
        if (thBlk)  add(thBlk);
      }
      add(blk);
      continue;
    }

    if (blk.type === 'footer') {
      if (usedH + blk.h > USABLE) newPage();
      add(blk);
      continue;
    }
  }

  return pages;
}

/* ══════════════════════════════════════════════════════════
   HTML 조각 — 인쇄 친화적 + 웹사이트 연결 디자인
   ══════════════════════════════════════════════════════════ */

/* 섹션 제목 */
function htmlSection(ko, en) {
  return `
    <div style="display:flex;align-items:center;gap:10px;
                padding-top:20px;padding-bottom:7px;
                border-bottom:1.5px solid #2a3b2e;">
      <div style="width:4px;height:15px;background:#c9a35b;border-radius:2px;flex-shrink:0;"></div>
      <span style="font-family:'Noto Serif KR',serif;font-size:15px;
                   font-weight:700;color:#2a3b2e;letter-spacing:.02em;">${ko}</span>
      <span style="font-size:10.5px;color:#b3753a;
                   font-family:'JetBrains Mono',monospace;letter-spacing:.14em;">${en}</span>
    </div>`;
}

/* 테이블 헤더 — 연한 그린 배경, 진한 그린 텍스트 (인쇄 OK) */
function htmlThead(headers, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cols  = widths.map(w => `<col style="width:${(w / total * 100).toFixed(1)}%">`).join('');
  const cells = headers.map(h =>
    `<th style="background:#eef2ee;color:#2a3b2e;font-size:11px;font-weight:700;
                padding:8px 10px;text-align:left;
                border:1px solid #ccd5cc;letter-spacing:.04em;">${h}</th>`
  ).join('');
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:2px;">
      <colgroup>${cols}</colgroup>
      <thead><tr>${cells}</tr></thead>
    </table>`;
}

/* 테이블 행 — 흰/연회색 교대, 연한 경계선 */
function htmlTrow(cells, widths, even) {
  const total = widths.reduce((a, b) => a + b, 0);
  const bg    = even ? '#ffffff' : '#f7faf7';
  const cols  = widths.map(w => `<col style="width:${(w / total * 100).toFixed(1)}%">`).join('');
  const tds   = cells.map(c =>
    `<td style="font-size:11px;padding:6px 10px;
                border:1px solid #d5dcd5;border-top:none;
                background:${bg};vertical-align:top;
                line-height:1.55;color:#2a2a2a;">${esc(String(c ?? ''))}</td>`
  ).join('');
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:-1px;">
      <colgroup>${cols}</colgroup>
      <tbody><tr>${tds}</tr></tbody>
    </table>`;
}

/* ══════════════════════════════════════════════════════════
   유틸
   ══════════════════════════════════════════════════════════ */
function mkDiv(css) {
  const el = document.createElement('div');
  el.style.cssText = css;
  return el;
}
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function setLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" style="animation:spin 1s linear infinite" aria-hidden="true">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
                 M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg> 생성 중…`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.origText || '경력서 다운로드';
  }
}
