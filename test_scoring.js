// Run: node test_scoring.js   (Node 16+, no dependencies)
// Extracts the real scoring / stats / SQL functions from index.html and tests them.
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

function grab(startMarker, endMarker) {
  const a = html.indexOf(startMarker), b = html.indexOf(endMarker, a);
  if (a < 0 || b < 0) throw new Error('Marker not found: ' + startMarker);
  return html.slice(a, b + endMarker.length);
}
const code =
  grab('function sSpo2', 'window.__score=score;').replace('window.__score=score;', '') + '\n' +
  html.slice(html.indexOf('function erfc'), html.indexOf('\n', html.indexOf('function chi7'))) + '\n' +
  html.slice(html.indexOf('function likeOk'), html.indexOf('\n', html.indexOf('function likeOk'))) + '\n' +
  'return {score,sSpo2,sSbp,sHr,sTemp,sRr,sGlu,erfc,chi5,chi7,likeOk};';
const L = new Function(code)();
const sample = JSON.parse(fs.readFileSync(__dirname + '/sample_data.json', 'utf8'));

let pass = 0, fail = 0;
function t(name, cond) { cond ? pass++ : fail++; console.log((cond ? 'PASS ' : 'FAIL ') + name); }
const near = (a, b, e) => Math.abs(a - b) <= e;

// 1. NEWS2 band tests
t('SpO2 96 -> 0', L.sSpo2(96) === 0);
t('SpO2 94 -> 1', L.sSpo2(94) === 1);
t('SpO2 92 -> 2', L.sSpo2(92) === 2);
t('SpO2 91 -> 3', L.sSpo2(91) === 3);
t('SBP 120 -> 0', L.sSbp(120) === 0);
t('SBP 90 -> 3', L.sSbp(90) === 3);
t('HR 75 -> 0', L.sHr(75) === 0);
t('HR 131 -> 3', L.sHr(131) === 3);
t('Temp 36.8 -> 0', L.sTemp(36.8) === 0);
t('Temp 39.5 -> 2', L.sTemp(39.5) === 2);
t('RR 16 -> 0', L.sRr(16) === 0);
t('RR 25 -> 3', L.sRr(25) === 3);
t('Glucose 110 -> 0', L.sGlu(110) === 0);
t('Glucose 320 -> 3', L.sGlu(320) === 3);

// 2. Risk level logic
sample.sample_readings.forEach(r => {
  const s = L.score(r);
  t(`${r.label}: total ${s.total}, level ${s.level}`, s.total === r.expected_total && s.level === r.expected_level);
});
t('Single red parameter (any score 3) -> at least medium',
  L.score({hr:76,sbp:125,spo2:90,temp:36.8,glu:110,rr:16}).level !== 'stable');
t('Missing respiratory rate treated as 0', L.score({hr:76,sbp:125,spo2:97,temp:36.8,glu:110}).parts.rr === 0);

// 3. Every seeded patient at baseline must be low risk
sample.patients.forEach(p => {
  const s = L.score(p.baseline);
  t(`${p.name} baseline is not High risk`, s.level !== 'high');
});
// 4. Deteriorating profiles must escalate
['p3', 'p6'].forEach(id => {
  const p = sample.patients.find(x => x.id === id);
  t(`${p.name} deteriorating profile is not Stable`, L.score(p.deteriorating).level !== 'stable');
});

// 5. Statistics
t('erfc(0) = 1', near(L.erfc(0), 1, 1e-6));
t('erfc(1) ~ 0.1573', near(L.erfc(1), 0.1573, 1e-3));
t('chi-square p at x=0 is ~1 (5 df)', near(L.chi5(0), 1, 1e-3));
t('chi-square p at 11.07 (5 df) ~ 0.05', near(L.chi5(11.07), 0.05, 0.01));
t('chi-square p at 14.07 (7 df) ~ 0.05', near(L.chi7(14.07), 0.05, 0.01));

// 6. SQL LIKE helper
t("LIKE 'ram%' matches Ramesh", L.likeOk('Ramesh', 'ram%'));
t("LIKE '%devi' matches Savitri Devi", L.likeOk('Savitri Devi', '%devi'));
t("LIKE 'x%' rejects Ramesh", !L.likeOk('Ramesh', 'x%'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
