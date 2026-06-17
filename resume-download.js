/* ============================================================
   resume-download.js — 강지애 프로필 경력서 PDF
   ============================================================ */

const RESUME_API_URL = 'https://script.google.com/macros/s/AKfycbzu3aLNJNMPlwmf1648mua6sED-94nHXEIdpJXoQl7mfFtyYxmMu9EJVjTrnZ2ine6nhA/exec';

/* ── 통합 계약 설정 ────────────────────────────────────────
   여러 일정이 등록돼도 경력서에서는 "시작일 ~ 종료일" 한 줄로 통합.
   start 미지정 시 등록된 첫 강의일로 자동. 통합 계약은 비고에 "현재 진행중" 고정.
   계약 갱신 시 start · end · work 값만 수정하면 됩니다.        */
const MERGE_CONTRACTS = {
  '대정중학교': { start: '2026.03.09', end: '2026.12.31', work: '디지털튜터 정규 계약 출강' },
  '남원중학교': { start: '2026.04.01', end: '2026.11.30', work: '방과후학교 디지털 강의 정규 계약' },
};

/* ── 별도 블럭으로 묶을 기관 (접두사 매칭) ── */
const GROUP_BLOCKS = [
  { prefix: '에듀인플랫폼',        label: '에듀인플랫폼 출강 내역',        en: 'EduInPlatform' },
  { prefix: '제주대학교 찾아가는', label: '제주대학교 찾아가는 학교컨설팅', en: 'School Consulting' },
];

/* ── 디자인 토큰 (웹사이트 팔레트, 인쇄 친화적) ──
   ink #1b1a18 · accent(딥그린) #2a3b2e · gold #c9a35b · copper #b3753a
   배경은 흰색 또는 매우 연한 웜그레이(#faf7f1)                  */

/* ── A4 레이아웃 상수 @96dpi ─────────────────────────────── */
const PDF_W      = 794;
const PDF_H      = 1123;
const MARGIN_X   = 52;                              // 좌우 여백
const MARGIN_TOP = 48;                              // 상단 여백
const MARGIN_BOT = 60;                              // 하단(푸터) 여백
const CONTENT_W  = PDF_W - MARGIN_X * 2;            // 690 px
const USABLE_H   = PDF_H - MARGIN_TOP - MARGIN_BOT; // 1015 px
const SAFETY     = 18;                              // 측정 오차 대비 여유
const LIMIT_H    = USABLE_H - SAFETY;

/* ── 초기화 ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('resumeDlBtn');
  if (!btn) { console.error('[경력서] 버튼 없음'); return; }
  console.log('[경력서] 초기화 완료');

  btn.addEventListener('click', async function () {
    setLoading(btn, true);
    try {
      const data = await fetchData();
      await generatePDF(data);
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
   PDF 생성 메인 — 고정 A4 페이지(잘림 방지) + 페이지 푸터
   ══════════════════════════════════════════════════════════ */
async function generatePDF(data) {
  const { basicInfo: bi, education, career, certificates } = data;
  const certs    = (certificates || []).filter(c => c.category === '자격증');
  const training = (certificates || []).filter(c => c.category === '연수/교육');

  const blocks = buildBlocks(bi || {}, education || [], career || [], certs, training);

  /* ① 블록 높이 측정 (margin 없는 padding 기반 → offsetHeight 정확) */
  const measurer = mkDiv(`position:fixed;top:0;left:-9999px;width:${CONTENT_W}px;background:#fff;
    box-sizing:border-box;font-family:'Pretendard','Noto Sans KR',sans-serif;color:#1b1a18;`);
  document.body.appendChild(measurer);
  await document.fonts.ready;
  await wait(300);
  for (const blk of blocks) { measurer.innerHTML = blk.html; blk.h = measurer.offsetHeight; }
  document.body.removeChild(measurer);

  /* ② 페이지 팩킹 (행 단위 — 절대 잘리지 않음) */
  const pages = packPages(blocks);

  /* ③ 페이지 렌더링 → PDF (각 페이지 = 정확히 A4) */
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const renderer = mkDiv(`position:fixed;top:0;left:-9999px;width:${PDF_W}px;height:${PDF_H}px;
    background:#fff;box-sizing:border-box;overflow:hidden;
    font-family:'Pretendard','Noto Sans KR',sans-serif;color:#1b1a18;`);
  document.body.appendChild(renderer);

  async function waitForImages(el) {
    const imgs = Array.from(el.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load',  resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 4000);
      });
    }));
  }

  for (let pi = 0; pi < pages.length; pi++) {
    const pg = pages[pi];
    renderer.innerHTML =
      `<div style="position:absolute;top:${MARGIN_TOP}px;left:${MARGIN_X}px;width:${CONTENT_W}px;">
         ${pg.map(b => b.html).join('')}
       </div>
       ${pageFooterHtml(pi + 1, pages.length)}`;
    await waitForImages(renderer);
    await wait(120);

    const canvas = await html2canvas(renderer, {
      scale: 2, useCORS: true, logging: false,
      backgroundColor: '#ffffff', width: PDF_W, height: PDF_H,
      allowTaint: false, imageTimeout: 15000
    });

    if (pi > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
  }

  document.body.removeChild(renderer);
  pdf.save(`강지애_경력서_${today()}.pdf`);
}

/* ══════════════════════════════════════════════════════════
   경력 데이터 가공 — 통합 · 정렬(최신순) · 중복제거 · 그룹 분리
   ══════════════════════════════════════════════════════════ */
function parseDateKey(str) {
  if (!str) return 0;
  const m = String(str).match(/(\d{4})[.\-\/\s]\s*(\d{1,2})(?:[.\-\/\s]\s*(\d{1,2}))?/);
  if (!m) return 0;
  const y = +m[1], mo = +m[2], d = m[3] ? +m[3] : 1;
  return y * 10000 + mo * 100 + d;
}
function fmtDateKey(n) {
  const y = Math.floor(n / 10000), mo = Math.floor((n % 10000) / 100), d = n % 100;
  return `${y}.${String(mo).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
}
const careerSortKey = r => (r._sortKey != null ? r._sortKey : parseDateKey(r.period));

function cleanNote(note) {
  return String(note || '')
    .replace(/현재\s*진행\s*중/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.·\-/]+|[\s,.·\-/]+$/g, '')
    .trim();
}

function processCareer(career) {
  const seen = new Set();
  const rows = (career || []).filter(r => {
    const key = [r.period, r.org, r.position, r.work, r.note].map(x => (x || '').trim()).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const mainRows = [], buckets = {};
  const groupRows = GROUP_BLOCKS.map(() => []);   // 그룹별 행 배열

  rows.forEach(r => {
    const org = (r.org || '').trim();
    const gi = GROUP_BLOCKS.findIndex(g => g.prefix && org.startsWith(g.prefix));
    if (gi >= 0) { groupRows[gi].push({ ...r, note: '' }); return; }   // 그룹은 비고 비움
    if (MERGE_CONTRACTS[org]) { (buckets[org] = buckets[org] || []).push(r); return; }
    mainRows.push({ ...r, note: cleanNote(r.note) });
  });

  Object.keys(buckets).forEach(org => {
    const bucket = buckets[org], cfg = MERGE_CONTRACTS[org];
    const autoStart = bucket.map(r => parseDateKey(r.period)).filter(Boolean).sort((a, b) => a - b)[0] || 0;
    const startStr  = cfg.start || (autoStart ? fmtDateKey(autoStart) : '');
    mainRows.push({
      period:   startStr ? `${startStr} ~ ${cfg.end}` : cfg.end,
      org, position: bucket[0].position || '', work: cfg.work,
      note: '현재 진행중',
      _sortKey: parseDateKey(cfg.end) || autoStart,
    });
  });

  mainRows.sort((a, b) => careerSortKey(b) - careerSortKey(a));
  groupRows.forEach(g => g.sort((a, b) => careerSortKey(b) - careerSortKey(a)));
  return { mainRows, groupRows };
}

/* ══════════════════════════════════════════════════════════
   블록 생성
   ══════════════════════════════════════════════════════════ */
function buildBlocks(bi, education, career, certs, training) {
  const list = [];

  /* ── 헤더 (1페이지 상단) ── */
  list.push({ type: 'header', html: `
    <div style="display:flex;justify-content:space-between;align-items:flex-end;
                padding-bottom:9px;border-bottom:1px solid #c9a35b;">
      <span style="font-family:'Noto Serif KR',serif;font-size:13px;font-weight:600;
                   color:#2a3b2e;letter-spacing:.45em;">경력 사항서</span>
      <span style="font-size:9px;color:#b3753a;font-family:'JetBrains Mono',monospace;
                   letter-spacing:.12em;">CURRICULUM VITAE · ${today()}</span>
    </div>
    <div style="padding-top:20px;display:flex;align-items:stretch;gap:16px;">
      <div style="width:3px;background:#2a3b2e;border-radius:2px;flex-shrink:0;"></div>
      <div style="flex:1;">
        <div style="font-family:'Noto Serif KR',serif;font-size:30px;font-weight:700;
                    color:#1b1a18;letter-spacing:.04em;line-height:1.1;">${esc(bi.name || '강지애')}</div>
        <div style="font-size:11.5px;color:#2a3b2e;font-weight:600;letter-spacing:.13em;
                    text-transform:uppercase;padding-top:9px;">${esc(bi.title || 'Digital Tutor · EduTech')}</div>
        <div style="font-size:10.5px;color:#6b6258;font-family:'JetBrains Mono',monospace;
                    letter-spacing:.02em;padding-top:11px;">
          <span>${esc(bi.email || '')}</span>
          <span style="color:#c9a35b;padding:0 9px;">|</span><span>Jeju, Korea</span>
        </div>
        ${bi.intro ? `<div style="font-size:10.5px;color:#8a8073;padding-top:10px;
                      line-height:1.65;">${esc(bi.intro)}</div>` : ''}
      </div>
    </div>
    <div style="padding-top:18px;">
      <div style="display:flex;height:2px;">
        <div style="width:120px;background:#2a3b2e;"></div>
        <div style="width:40px;background:#c9a35b;"></div>
        <div style="flex:1;background:#ece4d6;"></div>
      </div>
    </div>` });

  function addSection(ko, en, headers, widths, rows, getRow, emptyMsg) {
    list.push({ type: 'section', ko, en, html: htmlSection(ko, en) });
    list.push({ type: 'thead', ko, en, headers, widths, html: htmlThead(headers, widths) });
    if (!rows.length) {
      list.push({ type: 'trow', ko, html: htmlEmptyRow(emptyMsg || '등록된 내용이 없습니다.', widths.length) });
    } else {
      rows.forEach((row, i) => {
        list.push({ type: 'trow', ko, html: htmlTrow(getRow(row), widths, i % 2 === 0) });
      });
    }
  }

  addSection('학력사항', 'Education',
    ['재학기간', '학교명', '전공', '학위'], [24, 30, 26, 20],
    education, e => [e.period, e.school, e.major, e.degree]);

  const careerHeaders = ['근무기간', '기관/직장명', '직위·역할', '주요업무', '비고'];
  const careerWidths  = [24, 20, 13, 31, 12];
  const { mainRows, groupRows } = processCareer(career);

  addSection('경력사항', 'Career', careerHeaders, careerWidths,
    mainRows, c => [c.period, c.org, c.position, c.work, c.note]);

  GROUP_BLOCKS.forEach((g, gi) => {
    const grows = groupRows[gi];
    if (!grows.length) return;
    list.push({ type: 'subhead', ko: '경력사항', html: htmlSubhead(g.label, g.en) });
    list.push({ type: 'thead', ko: '경력사항', headers: careerHeaders, widths: careerWidths,
      html: htmlThead(careerHeaders, careerWidths) });
    grows.forEach((c, i) => {
      list.push({ type: 'trow', ko: '경력사항',
        html: htmlTrow([c.period, c.org, c.position, c.work, c.note], careerWidths, i % 2 === 0) });
    });
  });

  addSection('자격증', 'Certificates',
    ['취득일', '자격명', '발급기관'], [18, 48, 34],
    certs, c => [c.date, c.name, c.issuer]);

  addSection('연수 및 교육', 'Training',
    ['일자', '연수명', '기관', '결과'], [16, 46, 26, 12],
    training, c => [c.date, c.name, c.issuer, c.note]);

  return list;
}

/* ══════════════════════════════════════════════════════════
   페이지 팩킹 — 행/제목이 페이지 경계에서 잘리지 않도록
   ══════════════════════════════════════════════════════════ */
function packPages(blocks) {
  const pages = [[]];
  let usedH = 0;
  const cur = () => pages[pages.length - 1];
  const newPage = () => { pages.push([]); usedH = 0; };
  const add = (blk) => { cur().push(blk); usedH += blk.h; };

  /* 제목/소제목이 단독으로 페이지 끝에 남지 않도록
     제목 + 헤더 + 첫 행 높이까지 함께 확인 */
  function groupMinHeight(startIdx) {
    let h = 0;
    for (let j = startIdx; j < blocks.length; j++) {
      const t = blocks[j].type;
      if (j !== startIdx && (t === 'section' || t === 'subhead')) break;
      h += blocks[j].h;
      if (t === 'trow') break;
    }
    return h;
  }
  function lastBefore(i, type, ko) {
    for (let j = i - 1; j >= 0; j--) {
      if (blocks[j].type === type && blocks[j].ko === ko) return blocks[j];
    }
    return null;
  }

  for (let i = 0; i < blocks.length; i++) {
    const blk = blocks[i];

    if (blk.type === 'header') { add(blk); continue; }

    if (blk.type === 'section' || blk.type === 'subhead') {
      const minH = groupMinHeight(i);
      if (usedH > 0 && usedH + minH > LIMIT_H) newPage();
      add(blk);
      continue;
    }

    if (blk.type === 'thead') {
      if (usedH + blk.h > LIMIT_H) newPage();
      add(blk);
      continue;
    }

    if (blk.type === 'trow') {
      if (usedH + blk.h > LIMIT_H) {
        newPage();
        const sec = lastBefore(i, 'section', blk.ko);
        const th  = lastBefore(i, 'thead', blk.ko);
        if (sec) add(sec);
        if (th)  add(th);
      }
      add(blk);
      continue;
    }
  }
  return pages;
}

/* ══════════════════════════════════════════════════════════
   HTML 조각 — 가로줄 테이블 (세로 격자선 없음) · 여유 밀도
   ══════════════════════════════════════════════════════════ */
function htmlSection(ko, en) {
  return `
    <div style="padding-top:24px;padding-bottom:11px;">
      <div style="display:flex;align-items:baseline;gap:11px;padding-bottom:7px;">
        <span style="font-family:'Noto Serif KR',serif;font-size:16px;font-weight:700;
                     color:#2a3b2e;letter-spacing:.03em;">${esc(ko)}</span>
        <span style="font-size:9px;color:#b3753a;font-family:'JetBrains Mono',monospace;
                     letter-spacing:.16em;text-transform:uppercase;">${esc(en)}</span>
      </div>
      <div style="display:flex;height:2px;">
        <div style="width:64px;background:#2a3b2e;"></div>
        <div style="width:26px;background:#c9a35b;"></div>
        <div style="flex:1;background:#ece4d6;"></div>
      </div>
    </div>`;
}

function htmlSubhead(label, en) {
  return `
    <div style="padding-top:17px;padding-bottom:8px;display:flex;align-items:baseline;gap:9px;">
      <span style="display:inline-block;width:5px;height:5px;background:#b3753a;
                   border-radius:50%;align-self:center;"></span>
      <span style="font-size:11.5px;font-weight:700;color:#2a3b2e;letter-spacing:.03em;">${esc(label)}</span>
      <span style="font-size:8.5px;color:#b3753a;font-family:'JetBrains Mono',monospace;
                   letter-spacing:.13em;">${esc(en)}</span>
    </div>`;
}

function htmlThead(headers, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cols  = widths.map(w => `<col style="width:${(w / total * 100).toFixed(2)}%">`).join('');
  const cells = headers.map(h =>
    `<th style="font-size:10px;font-weight:700;color:#2a3b2e;letter-spacing:.05em;
                text-align:left;padding:8px 12px 9px;border-bottom:1.5px solid #2a3b2e;
                white-space:nowrap;">${esc(h)}</th>`
  ).join('');
  return `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <colgroup>${cols}</colgroup>
      <thead><tr>${cells}</tr></thead>
    </table>`;
}

function htmlTrow(cells, widths, even) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cols  = widths.map(w => `<col style="width:${(w / total * 100).toFixed(2)}%">`).join('');
  const bg    = even ? '#ffffff' : '#faf7f1';
  const tds = cells.map((c, i) => {
    const v = String(c ?? '');
    const ongoing = v.trim() === '현재 진행중';
    let style = `font-size:10.5px;line-height:1.65;padding:10px 12px;border-bottom:1px solid #ede4d4;
                 vertical-align:top;word-break:keep-all;background:${bg};`;
    if (i === 0) {
      style += `font-family:'JetBrains Mono',monospace;font-size:9px;color:#2a3b2e;
                font-weight:600;white-space:nowrap;letter-spacing:-0.02em;
                padding-left:10px;padding-right:6px;`;
    } else {
      style += `color:#34322e;`;
    }
    if (ongoing) {
      return `<td style="${style}"><span style="display:inline-block;font-size:9px;font-weight:700;
              color:#2a3b2e;background:#e7efe7;border:1px solid #b9ccb9;border-radius:3px;
              padding:2px 7px;letter-spacing:.02em;white-space:nowrap;">현재 진행중</span></td>`;
    }
    return `<td style="${style}">${esc(v)}</td>`;
  }).join('');
  return `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <colgroup>${cols}</colgroup>
      <tbody><tr>${tds}</tr></tbody>
    </table>`;
}

function htmlEmptyRow(msg, colCount) {
  return `
    <table style="width:100%;border-collapse:collapse;">
      <tbody><tr><td colspan="${colCount}"
        style="font-size:10px;color:#a89f92;padding:11px 12px;border-bottom:1px solid #ede4d4;
               text-align:center;font-style:italic;">${esc(msg)}</td></tr></tbody>
    </table>`;
}

function pageFooterHtml(pageNo, total) {
  return `
    <div style="position:absolute;left:${MARGIN_X}px;right:${MARGIN_X}px;bottom:26px;">
      <div style="height:1px;background:#e7ded0;"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;
                  font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.1em;">
        <span style="color:#b3753a;">KANG JI-AE · DIGITAL INSTRUCTOR · JEJU</span>
        <span style="color:#9a917f;">${pageNo} / ${total}</span>
      </div>
    </div>`;
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
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
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
