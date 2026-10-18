'use strict';

// Semestra: a semester planner for students. All data stays in localStorage.
// No network requests, no innerHTML with user data: every node is built with h().

const KEY = 'semestra:v1';
const LIMIT = { text: 120, items: 500 };

const I18N = {
  ru: {
    tabToday: 'Сегодня', tabWeek: 'Неделя', tabDeadlines: 'Дедлайны', tabSubjects: 'Баллы', tabSettings: 'Настройки',
    week: 'Неделя', today: 'Сегодня', now: 'сейчас', classesToday: 'Пары сегодня', noClasses: 'Сегодня пар нет',
    nextDay: 'Ближайшие пары', upcoming: 'Ближайшие дедлайны', noDeadlines: 'Дедлайнов нет',
    atRisk: 'Где не хватает баллов', allGood: 'По всем предметам хватает баллов',
    thisWeek: 'Эта неделя', nextWeek: 'Следующая', addClass: 'Добавить пару', addDeadline: 'Добавить дедлайн',
    addSubject: 'Добавить предмет', save: 'Сохранить', cancel: 'Отмена', del: 'Удалить',
    name: 'Название', room: 'Аудитория', start: 'Начало', end: 'Конец', day: 'День недели',
    weekType: 'Неделя', both: 'Каждую', title: 'Что сдать', subject: 'Предмет', date: 'Срок',
    have: 'Набрано', need: 'Нужно для зачёта/автомата', max: 'Максимум', addPoints: 'Добавить баллы',
    left: 'осталось', passed: 'хватает', late: 'просрочено', inDays: 'через {n} дн.', todayDue: 'сегодня', tomorrow: 'завтра',
    anchor: 'Понедельник первой недели «{a}»', alternating: 'Расписание чередуется по неделям',
    weekNames: 'Названия недель', semEnd: 'Конец семестра', exportIcs: 'Экспорт в календарь (.ics)',
    exportJson: 'Скачать копию данных', importJson: 'Загрузить копию', demo: 'Заполнить примером',
    reset: 'Стереть все данные', resetConfirm: 'Стереть всё? Это нельзя отменить.', imported: 'Данные загружены',
    badFile: 'Файл не похож на копию Semestra', saved: 'Сохранено', privacy: 'Данные хранятся только в этом браузере. Сервера нет, ничего никуда не отправляется.',
    data: 'Данные', schedule: 'Расписание', heroEmpty: 'Добавь пары и дедлайны или заполни пример в настройках.',
    days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    daysLong: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
    months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    maxShort: 'макс.', done: 'Готово', showDone: 'Показать выполненные', chance: 'Готовность к сессии',
  },
  en: {
    tabToday: 'Today', tabWeek: 'Week', tabDeadlines: 'Deadlines', tabSubjects: 'Points', tabSettings: 'Settings',
    week: 'Week', today: 'Today', now: 'now', classesToday: 'Classes today', noClasses: 'No classes today',
    nextDay: 'Next classes', upcoming: 'Upcoming deadlines', noDeadlines: 'No deadlines',
    atRisk: 'Not enough points yet', allGood: 'Enough points in every subject',
    thisWeek: 'This week', nextWeek: 'Next', addClass: 'Add class', addDeadline: 'Add deadline',
    addSubject: 'Add subject', save: 'Save', cancel: 'Cancel', del: 'Delete',
    name: 'Name', room: 'Room', start: 'Start', end: 'End', day: 'Weekday',
    weekType: 'Week', both: 'Every', title: 'Task', subject: 'Subject', date: 'Due',
    have: 'Earned', need: 'Needed to pass', max: 'Maximum', addPoints: 'Add points',
    left: 'to go', passed: 'enough', late: 'overdue', inDays: 'in {n} d', todayDue: 'today', tomorrow: 'tomorrow',
    anchor: 'Monday of the first “{a}” week', alternating: 'Timetable alternates weekly',
    weekNames: 'Week names', semEnd: 'Semester ends', exportIcs: 'Export to calendar (.ics)',
    exportJson: 'Download backup', importJson: 'Restore backup', demo: 'Fill with example',
    reset: 'Erase all data', resetConfirm: 'Erase everything? This cannot be undone.', imported: 'Backup restored',
    badFile: 'This file is not a Semestra backup', saved: 'Saved', privacy: 'Your data lives only in this browser. There is no server and nothing is sent anywhere.',
    data: 'Data', schedule: 'Timetable', heroEmpty: 'Add classes and deadlines, or load the example in Settings.',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    maxShort: 'max', done: 'Done', showDone: 'Show completed', chance: 'Exam readiness',
  },
};

// ---------- state ----------

function blank() {
  const mon = mondayOf(new Date());
  return {
    v: 1,
    lang: (navigator.language || 'ru').toLowerCase().startsWith('ru') ? 'ru' : 'en',
    anchor: iso(mon),
    alternating: true,
    weekNames: ['A', 'B'],
    semEnd: iso(addDays(mon, 7 * 16)),
    classes: [],
    deadlines: [],
    subjects: [],
  };
}

// Accept only known fields with the right types; anything else is dropped.
function normalize(raw) {
  const s = blank();
  if (!raw || typeof raw !== 'object') return null;
  const str = (x, d = '') => (typeof x === 'string' ? x.slice(0, LIMIT.text) : d);
  const num = (x, d = 0) => (Number.isFinite(+x) ? Math.max(0, Math.min(10000, +x)) : d);
  const date = (x, d) => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : d);
  const time = (x, d) => (typeof x === 'string' && /^\d{2}:\d{2}$/.test(x) ? x : d);
  const arr = (x) => (Array.isArray(x) ? x.slice(0, LIMIT.items) : []);
  s.lang = raw.lang === 'en' ? 'en' : raw.lang === 'ru' ? 'ru' : s.lang;
  s.anchor = date(raw.anchor, s.anchor);
  s.alternating = raw.alternating !== false;
  if (Array.isArray(raw.weekNames)) s.weekNames = [str(raw.weekNames[0], 'A') || 'A', str(raw.weekNames[1], 'B') || 'B'];
  s.semEnd = date(raw.semEnd, s.semEnd);
  s.classes = arr(raw.classes).map((c) => ({
    id: uid(),
    day: Math.min(6, Math.max(1, Math.round(num(c.day, 1)))),
    start: time(c.start, '09:00'),
    end: time(c.end, '10:30'),
    name: str(c.name),
    room: str(c.room),
    week: ['A', 'B'].includes(c.week) ? c.week : 'both',
  })).filter((c) => c.name);
  s.deadlines = arr(raw.deadlines).map((d) => ({
    id: uid(), title: str(d.title), subject: str(d.subject), date: date(d.date, iso(new Date())), done: d.done === true,
  })).filter((d) => d.title);
  s.subjects = arr(raw.subjects).map((x) => ({
    id: uid(), name: str(x.name), have: num(x.have), need: num(x.need, 60), max: num(x.max, 100),
  })).filter((x) => x.name);
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw)) || blank();
  } catch (e) { /* storage blocked or corrupted: start clean */ }
  return blank();
}

function hasSaved() {
  try { return localStorage.getItem(KEY) !== null; } catch (e) { return false; }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ }
}

let S = load();
let tab = 'today';
let weekOffset = 0;
let showDone = false;

// ---------- helpers ----------

function t(k, vars) {
  let v = (I18N[S.lang] || I18N.ru)[k] ?? k;
  if (vars) for (const [a, b] of Object.entries(vars)) v = v.replace(`{${a}}`, b);
  return v;
}

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

function uid() {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return a[0].toString(36) + a[1].toString(36);
}

function pad(n) { return String(n).padStart(2, '0'); }
function iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); }
function daysBetween(a, b) { return Math.round((mondayless(b) - mondayless(a)) / 864e5); }
function mondayless(d) { return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
function minutes(hm) { const [a, b] = hm.split(':').map(Number); return a * 60 + b; }

function weekType(date) {
  if (!S.alternating) return 'A';
  const w = Math.floor(daysBetween(mondayOf(parse(S.anchor)), mondayOf(date)) / 7);
  return ((w % 2) + 2) % 2 === 0 ? 'A' : 'B';
}
// On Sunday the useful week is the one starting tomorrow.
function planningMonday() { const d = new Date(); return mondayOf(d.getDay() === 0 ? addDays(d, 1) : d); }
function weekName(type) { return type === 'B' ? S.weekNames[1] : S.weekNames[0]; }

function classesOn(date) {
  const wt = weekType(date);
  return S.classes
    .filter((c) => c.day === date.getDay() && (c.week === 'both' || !S.alternating || c.week === wt))
    .sort((a, b) => minutes(a.start) - minutes(b.start));
}

function fmtDate(d) { return `${t('daysLong')[d.getDay()]}, ${d.getDate()} ${t('months')[d.getMonth()]}`; }

function dueBadge(dateStr) {
  const n = daysBetween(new Date(), parse(dateStr));
  if (n < 0) return h('span', { class: 'due late' }, t('late'));
  if (n === 0) return h('span', { class: 'due soon' }, t('todayDue'));
  if (n === 1) return h('span', { class: 'due soon' }, t('tomorrow'));
  return h('span', { class: n <= 3 ? 'due soon' : 'due later' }, t('inDays', { n }));
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 1800);
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- views ----------

function classRow(c, date, onClick) {
  const tag = S.alternating && c.week !== 'both' ? h('span', { class: `tag ${c.week.toLowerCase()}` }, weekName(c.week)) : null;
  const row = h('div', { class: 'cls', onclick: onClick, dataset: { now: t('now') } },
    h('div', { class: 'time' }, `${c.start}–${c.end}`),
    h('div', {}, h('div', { class: 'name' }, c.name, tag), c.room ? h('div', { class: 'muted small' }, c.room) : null));
  if (date && iso(date) === iso(new Date())) {
    const m = new Date().getHours() * 60 + new Date().getMinutes();
    if (m >= minutes(c.start) && m < minutes(c.end)) row.classList.add('now');
    else if (m >= minutes(c.end)) row.classList.add('past');
  }
  return row;
}

function subjectProgress(x) {
  const pct = x.need > 0 ? Math.min(100, Math.round((x.have / x.need) * 100)) : 100;
  return { pct, ok: x.have >= x.need };
}

function viewToday() {
  const now = new Date();
  const wt = weekType(planningMonday());
  const list = classesOn(now);
  let nextBlock = null;
  if (!list.length) {
    for (let i = 1; i <= 14; i++) {
      const d = addDays(now, i);
      const l = classesOn(d);
      if (l.length) { nextBlock = { d, l }; break; }
    }
  }
  const dls = S.deadlines.filter((d) => !d.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const risk = S.subjects.filter((x) => !subjectProgress(x).ok).sort((a, b) => subjectProgress(a).pct - subjectProgress(b).pct);
  const ready = S.subjects.length ? Math.round(S.subjects.reduce((s, x) => s + subjectProgress(x).pct, 0) / S.subjects.length) : null;
  const empty = !S.classes.length && !S.deadlines.length && !S.subjects.length;

  return h('div', { class: 'grid today-grid' },
    h('div', { class: 'card hero' },
      h('h1', {}, fmtDate(now)),
      h('p', {}, S.alternating ? `${t('week')} ${weekName(wt)}` : '', empty ? ` ${t('heroEmpty')}` : '')),
    h('div', { class: 'card' },
      h('h2', {}, list.length || !nextBlock ? t('classesToday') : `${t('nextDay')} · ${fmtDate(nextBlock.d)}`),
      list.length ? list.map((c) => classRow(c, now, () => editClass(c)))
        : nextBlock ? nextBlock.l.map((c) => classRow(c, nextBlock.d, () => editClass(c)))
          : h('div', { class: 'empty' }, t('noClasses'))),
    h('div', { class: 'card' },
      h('h2', {}, t('upcoming')),
      dls.length ? dls.map(deadlineRow) : h('div', { class: 'empty' }, t('noDeadlines'))),
    S.subjects.length ? h('div', { class: 'card full' },
      h('h2', {}, t('atRisk')),
      ready != null ? subjectBar(t('chance'), ready, ready >= 100) : null,
      risk.length ? risk.map((x) => subjectBar(x.name, subjectProgress(x).pct, false, `${x.have}/${x.need}`))
        : h('div', { class: 'empty' }, t('allGood'))) : null);
}

function subjectBar(label, pct, ok, right) {
  return h('div', { class: 'subj' },
    h('div', { class: 'row' }, h('span', {}, label), h('span', { class: 'spacer' }), h('span', { class: 'score' }, right || `${pct}%`)),
    h('div', { class: `bar ${ok ? 'ok' : pct < 50 ? 'risk' : ''}` }, h('i', { style: null, dataset: { w: pct } })));
}

function viewWeek() {
  const mon = addDays(planningMonday(), 7 * weekOffset);
  const wt = weekType(mon);
  const days = [];
  for (let i = 0; i < 6; i++) {
    const d = addDays(mon, i);
    const l = classesOn(d);
    days.push(h('div', { class: `card day${iso(d) === iso(new Date()) ? ' today' : ''}` },
      h('h3', {}, t('days')[d.getDay()], h('span', { class: 'muted small' }, `${d.getDate()} ${t('months')[d.getMonth()]}`)),
      l.length ? l.map((c) => classRow(c, d, () => editClass(c))) : h('div', { class: 'empty small' }, '—')));
  }
  return h('div', {},
    h('div', { class: 'row', style: null },
      h('button', { class: weekOffset === 0 ? 'btn' : 'btn secondary', type: 'button', onclick: () => { weekOffset = 0; render(); } }, t('thisWeek')),
      h('button', { class: weekOffset === 1 ? 'btn' : 'btn secondary', type: 'button', onclick: () => { weekOffset = 1; render(); } }, t('nextWeek')),
      S.alternating ? h('span', { class: `tag ${wt.toLowerCase()}` }, `${t('week')} ${weekName(wt)}`) : null,
      h('span', { class: 'spacer' }),
      h('button', { class: 'btn', type: 'button', onclick: () => editClass(null) }, `+ ${t('addClass')}`)),
    h('div', { class: 'week', style: null }, days));
}

function deadlineRow(d) {
  return h('div', { class: `dl${d.done ? ' done' : ''}` },
    h('input', {
      type: 'checkbox', checked: d.done, 'aria-label': t('done'),
      onchange: (e) => { d.done = e.target.checked; save(); render(); },
    }),
    h('div', {}, h('div', { class: 'title' }, d.title), h('div', { class: 'muted small' }, [d.subject, fmtDate(parse(d.date))].filter(Boolean).join(' · '))),
    h('span', { class: 'spacer' }),
    d.done ? null : dueBadge(d.date),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': t('save'), onclick: () => editDeadline(d) }, '✎'));
}

function viewDeadlines() {
  const list = S.deadlines.filter((d) => showDone || !d.done).sort((a, b) => a.date.localeCompare(b.date));
  return h('div', { class: 'card' },
    h('div', { class: 'row' },
      h('label', { class: 'row small muted' },
        h('input', { type: 'checkbox', checked: showDone, onchange: (e) => { showDone = e.target.checked; render(); } }), t('showDone')),
      h('span', { class: 'spacer' }),
      h('button', { class: 'btn', type: 'button', onclick: () => editDeadline(null) }, `+ ${t('addDeadline')}`)),
    h('div', { class: 'list' }, list.length ? list.map(deadlineRow) : h('div', { class: 'empty' }, t('noDeadlines'))));
}

function viewSubjects() {
  return h('div', {},
    h('div', { class: 'row' }, h('span', { class: 'spacer' }),
      h('button', { class: 'btn', type: 'button', onclick: () => editSubject(null) }, `+ ${t('addSubject')}`)),
    h('div', { class: 'grid', style: null }, S.subjects.map((x) => {
      const p = subjectProgress(x);
      return h('div', { class: 'card subj' },
        h('div', { class: 'row' }, h('strong', {}, x.name), h('span', { class: 'spacer' }),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': t('save'), onclick: () => editSubject(x) }, '✎')),
        h('div', { class: `bar ${p.ok ? 'ok' : p.pct < 50 ? 'risk' : ''}` }, h('i', { dataset: { w: p.pct } })),
        h('div', { class: 'row small' },
          h('span', { class: 'score' }, `${x.have} / ${x.need}`), h('span', { class: 'muted' }, `${t('maxShort')} ${x.max}`), h('span', { class: 'spacer' }),
          h('span', { class: p.ok ? 'muted' : '' }, p.ok ? t('passed') : `${t('left')} ${+(x.need - x.have).toFixed(2)}`)),
        h('div', { class: 'actions' }, [1, 5, 10].map((n) => h('button', {
          class: 'btn secondary', type: 'button', onclick: () => { x.have = Math.min(x.max, +(x.have + n).toFixed(2)); save(); render(); },
        }, `+${n}`))));
    })));
}

function viewSettings() {
  const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: importJson });
  return h('div', { class: 'grid' },
    h('div', { class: 'card' },
      h('h2', {}, t('schedule')),
      h('label', { class: 'row' }, h('input', {
        type: 'checkbox', checked: S.alternating, onchange: (e) => { S.alternating = e.target.checked; save(); render(); },
      }), t('alternating')),
      h('div', { style: null, class: 'two', }, ...[0, 1].map((i) => field(`${t('weekNames')} ${i + 1}`, h('input', {
        type: 'text', maxlength: 20, value: S.weekNames[i], onchange: (e) => { S.weekNames[i] = e.target.value.trim().slice(0, 20) || (i ? 'B' : 'A'); save(); render(); },
      })))),
      field(t('anchor', { a: S.weekNames[0] }), h('input', {
        type: 'date', value: S.anchor, onchange: (e) => { if (e.target.value) { S.anchor = iso(mondayOf(parse(e.target.value))); save(); render(); } },
      })),
      field(t('semEnd'), h('input', {
        type: 'date', value: S.semEnd, onchange: (e) => { if (e.target.value) { S.semEnd = e.target.value; save(); } },
      }))),
    h('div', { class: 'card' },
      h('h2', {}, t('data')),
      h('p', { class: 'muted small' }, t('privacy')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: exportIcs }, t('exportIcs')),
        h('button', { class: 'btn secondary', type: 'button', onclick: () => download('semestra-backup.json', JSON.stringify(S, null, 2), 'application/json') }, t('exportJson')),
        h('button', { class: 'btn secondary', type: 'button', onclick: () => file.click() }, t('importJson')), file,
        h('button', { class: 'btn secondary', type: 'button', onclick: loadDemo }, t('demo')),
        h('button', { class: 'btn danger', type: 'button', onclick: confirmReset }, t('reset')))));
}

// In-page confirmation: native confirm() is blocked in sandboxed frames and previews.
function confirmReset() {
  const dlg = document.getElementById('dlg');
  const form = document.getElementById('dlgForm');
  form.replaceChildren(
    h('h3', {}, t('reset')),
    h('p', {}, t('resetConfirm')),
    h('div', { class: 'actions' },
      h('button', { class: 'btn danger', type: 'submit' }, t('reset')),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => dlg.close() }, t('cancel'))));
  form.onsubmit = (e) => {
    e.preventDefault();
    const lang = S.lang;
    S = blank();
    S.lang = lang;
    save();
    dlg.close();
    render();
  };
  dlg.showModal();
}

function field(label, input) { return h('label', { class: 'field' }, h('span', {}, label), input); }

// ---------- editing ----------

function openDialog(title, fields, onSave, onDelete) {
  const dlg = document.getElementById('dlg');
  const form = document.getElementById('dlgForm');
  form.replaceChildren(
    h('h3', {}, title),
    ...fields,
    h('div', { class: 'actions' },
      h('button', { class: 'btn', type: 'submit' }, t('save')),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => dlg.close() }, t('cancel')),
      onDelete ? h('span', { class: 'spacer' }) : null,
      onDelete ? h('button', { class: 'btn danger', type: 'button', onclick: () => { onDelete(); dlg.close(); save(); render(); } }, t('del')) : null));
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    onSave(new FormData(form));
    dlg.close();
    save();
    render();
    toast(t('saved'));
  };
  dlg.showModal();
}

const txt = (name, value, req) => h('input', { type: 'text', name, value: value || '', maxlength: LIMIT.text, required: req });

function editClass(c) {
  const isNew = !c;
  c = c || { day: Math.min(6, Math.max(1, new Date().getDay() || 1)), start: '09:00', end: '10:30', name: '', room: '', week: 'both' };
  const fields = [
    field(t('name'), txt('name', c.name, true)),
    h('div', { class: 'two' },
      field(t('day'), h('select', { name: 'day' }, [1, 2, 3, 4, 5, 6].map((d) => h('option', { value: d, selected: c.day === d }, t('daysLong')[d])))),
      field(t('weekType'), h('select', { name: 'week' },
        h('option', { value: 'both', selected: c.week === 'both' }, t('both')),
        h('option', { value: 'A', selected: c.week === 'A' }, weekName('A')),
        h('option', { value: 'B', selected: c.week === 'B' }, weekName('B'))))),
    h('div', { class: 'two' },
      field(t('start'), h('input', { type: 'time', name: 'start', value: c.start, required: true })),
      field(t('end'), h('input', { type: 'time', name: 'end', value: c.end, required: true }))),
    field(t('room'), txt('room', c.room)),
  ];
  openDialog(isNew ? t('addClass') : c.name, fields, (f) => {
    const v = normalize({ classes: [{ name: f.get('name'), room: f.get('room'), day: f.get('day'), start: f.get('start'), end: f.get('end'), week: f.get('week') }] }).classes[0];
    if (!v) return;
    if (isNew) S.classes.push(v); else Object.assign(c, { ...v, id: c.id });
  }, isNew ? null : () => { S.classes = S.classes.filter((x) => x !== c); });
}

function editDeadline(d) {
  const isNew = !d;
  d = d || { title: '', subject: '', date: iso(addDays(new Date(), 7)), done: false };
  const subjects = [...new Set([...S.subjects.map((x) => x.name), ...S.classes.map((x) => x.name)])];
  const list = h('datalist', { id: 'subjList' }, subjects.map((s) => h('option', { value: s })));
  const subj = txt('subject', d.subject);
  subj.setAttribute('list', 'subjList');
  openDialog(isNew ? t('addDeadline') : d.title, [
    field(t('title'), txt('title', d.title, true)),
    field(t('subject'), subj), list,
    field(t('date'), h('input', { type: 'date', name: 'date', value: d.date, required: true })),
  ], (f) => {
    const v = normalize({ deadlines: [{ title: f.get('title'), subject: f.get('subject'), date: f.get('date'), done: d.done }] }).deadlines[0];
    if (!v) return;
    if (isNew) S.deadlines.push(v); else Object.assign(d, { ...v, id: d.id });
  }, isNew ? null : () => { S.deadlines = S.deadlines.filter((x) => x !== d); });
}

function editSubject(x) {
  const isNew = !x;
  x = x || { name: '', have: 0, need: 60, max: 100 };
  const n = (name, value) => h('input', { type: 'number', name, value, min: 0, max: 10000, step: 'any', required: true });
  openDialog(isNew ? t('addSubject') : x.name, [
    field(t('name'), txt('name', x.name, true)),
    h('div', { class: 'two' }, field(t('have'), n('have', x.have)), field(t('max'), n('max', x.max))),
    field(t('need'), n('need', x.need)),
  ], (f) => {
    const v = normalize({ subjects: [{ name: f.get('name'), have: f.get('have'), need: f.get('need'), max: f.get('max') }] }).subjects[0];
    if (!v) return;
    if (isNew) S.subjects.push(v); else Object.assign(x, { ...v, id: x.id });
  }, isNew ? null : () => { S.subjects = S.subjects.filter((y) => y !== x); });
}

// ---------- import / export ----------

function importJson(e) {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (f.size > 1e6) { toast(t('badFile')); return; }
  f.text().then((text) => {
    const v = normalize(JSON.parse(text));
    if (!v) throw new Error('bad');
    S = v;
    save();
    render();
    toast(t('imported'));
  }).catch(() => toast(t('badFile')));
}

function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
function icsFold(line) {
  const out = [];
  let cur = '';
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > 73) { out.push(cur); cur = ' ' + ch; } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n');
}
function icsDate(d) { return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`; }

function exportIcs() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const until = `${S.semEnd.replace(/-/g, '')}T235959`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Semestra//EN', 'CALSCALE:GREGORIAN'];
  const anchor = mondayOf(parse(S.anchor));
  const startMon = mondayOf(new Date()) > anchor ? mondayOf(new Date()) : anchor;
  for (const c of S.classes) {
    let first = addDays(startMon, c.day - 1);
    if (S.alternating && c.week !== 'both' && weekType(first) !== c.week) first = addDays(first, 7);
    const interval = S.alternating && c.week !== 'both' ? 2 : 1;
    lines.push('BEGIN:VEVENT', `UID:${c.id}@semestra`, `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(first)}T${c.start.replace(':', '')}00`, `DTEND:${icsDate(first)}T${c.end.replace(':', '')}00`,
      `RRULE:FREQ=WEEKLY;INTERVAL=${interval};UNTIL=${until}`, `SUMMARY:${icsText(c.name)}`);
    if (c.room) lines.push(`LOCATION:${icsText(c.room)}`);
    lines.push('END:VEVENT');
  }
  for (const d of S.deadlines.filter((x) => !x.done)) {
    const day = parse(d.date);
    lines.push('BEGIN:VEVENT', `UID:${d.id}@semestra`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(day)}`, `DTEND;VALUE=DATE:${icsDate(addDays(day, 1))}`,
      `SUMMARY:${icsText(d.subject ? `${d.title} (${d.subject})` : d.title)}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  download('semestra.ics', lines.map(icsFold).join('\r\n') + '\r\n', 'text/calendar');
}

function loadDemo() {
  const ru = S.lang === 'ru';
  const today = new Date();
  const d = (n) => iso(addDays(today, n));
  const names = ru
    ? ['Математический анализ', 'Программирование', 'Микроэкономика', 'Иностранный язык', 'Теория вероятностей']
    : ['Calculus', 'Programming', 'Microeconomics', 'Foreign language', 'Probability theory'];
  const v = normalize({
    lang: S.lang,
    anchor: iso(mondayOf(today)),
    alternating: true,
    weekNames: ru ? ['Числитель', 'Знаменатель'] : ['Odd', 'Even'],
    semEnd: d(90),
    classes: [
      { day: 1, start: '08:30', end: '10:00', name: names[0], room: '101', week: 'both' },
      { day: 1, start: '10:10', end: '11:40', name: names[1], room: '305', week: 'A' },
      { day: 1, start: '10:10', end: '11:40', name: names[4], room: '214', week: 'B' },
      { day: 2, start: '11:50', end: '13:20', name: names[2], room: '402', week: 'both' },
      { day: 3, start: '08:30', end: '10:00', name: names[3], room: '118', week: 'both' },
      { day: 3, start: '10:10', end: '11:40', name: names[1], room: ru ? 'Комп. класс 2' : 'Lab 2', week: 'both' },
      { day: 4, start: '13:30', end: '15:00', name: names[4], room: '214', week: 'A' },
      { day: 5, start: '10:10', end: '11:40', name: names[0], room: '101', week: 'B' },
      { day: 5, start: '11:50', end: '13:20', name: names[2], room: '402', week: 'both' },
      { day: 6, start: '10:10', end: '11:40', name: names[3], room: '118', week: 'A' },
    ],
    deadlines: [
      { title: ru ? 'Контрольная: пределы' : 'Test: limits', subject: names[0], date: d(2) },
      { title: ru ? 'Лабораторная №3' : 'Lab #3', subject: names[1], date: d(5) },
      { title: ru ? 'Эссе о рынке труда' : 'Labour market essay', subject: names[2], date: d(9) },
      { title: ru ? 'Презентация' : 'Presentation', subject: names[3], date: d(-1) },
      { title: ru ? 'ИДЗ 1' : 'Homework 1', subject: names[4], date: d(12) },
    ],
    subjects: [
      { name: names[0], have: 34, need: 60, max: 100 },
      { name: names[1], have: 58, need: 50, max: 100 },
      { name: names[2], have: 25, need: 100, max: 160 },
      { name: names[3], have: 41, need: 50, max: 100 },
      { name: names[4], have: 12, need: 40, max: 100 },
    ],
  });
  S = v;
  save();
  render();
}

// ---------- render ----------

const VIEWS = { today: viewToday, week: viewWeek, deadlines: viewDeadlines, subjects: viewSubjects, settings: viewSettings };

function render() {
  document.documentElement.lang = S.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('#tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.getElementById('langBtn').textContent = S.lang === 'ru' ? 'EN' : 'RU';
  const pill = document.getElementById('weekPill');
  const wt = weekType(planningMonday());
  pill.textContent = S.alternating ? `${t('week')} ${weekName(wt)}` : '';
  pill.hidden = !S.alternating;
  pill.className = `week-pill${wt === 'B' ? ' b' : ''}`;
  document.getElementById('main').replaceChildren(VIEWS[tab]());
  // Bar widths come from data-w; set via CSSOM so the CSP needs no 'unsafe-inline'.
  document.querySelectorAll('.bar > i[data-w]').forEach((i) => { i.style.width = `${i.dataset.w}%`; });
}

// GitHub Pages cannot send a frame-ancestors header, so refuse to run inside someone else's frame.
// A preview build opts out with <meta name="semestra-preview">; the published page never has it.
function embedded() {
  if (document.querySelector('meta[name="semestra-preview"]')) return false;
  try { return window.top !== window.self; } catch (e) { return true; }
}

function showEmbedded() {
  const ru = S.lang === 'ru';
  document.body.replaceChildren(h('main', { class: 'card hero' },
    h('h1', {}, 'Semestra'),
    h('p', {}, ru ? 'Эту страницу нельзя открывать внутри другого сайта.' : 'This page cannot run inside another site.'),
    h('div', { class: 'actions' }, h('a', { class: 'btn', href: location.href, target: '_blank', rel: 'noopener noreferrer' },
      ru ? 'Открыть в новой вкладке' : 'Open in a new tab'))));
}

if (embedded()) showEmbedded(); else start();

function start() {
  document.getElementById('tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    try { history.replaceState(null, '', `#${tab}`); } catch (err) { /* sandboxed */ }
    render();
  });
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey
      || document.querySelector('dialog[open]')
      || document.activeElement.matches('input, textarea, select, [contenteditable="true"]')) return;
    const nextTab = ['today', 'week', 'deadlines', 'subjects', 'settings'][Number(e.key) - 1];
    if (!nextTab) return;
    tab = nextTab;
    try { history.replaceState(null, '', `#${tab}`); } catch (err) { /* sandboxed */ }
    render();
  });
  document.getElementById('langBtn').addEventListener('click', () => { S.lang = S.lang === 'ru' ? 'en' : 'ru'; save(); render(); });
  window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });
  if (VIEWS[location.hash.slice(1)]) tab = location.hash.slice(1);
  // Offline support where the browser allows it (https or localhost; not in previews).
  if ('serviceWorker' in navigator && !document.querySelector('meta[name="semestra-preview"]') && window.isSecureContext && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode is optional */ });
  }
  // The preview build opens with the example filled in, so there is something to try.
  if (document.querySelector('meta[name="semestra-preview"]') && !hasSaved()) loadDemo();
  setInterval(() => { if (tab === 'today' && !document.getElementById('dlg').open) render(); }, 60000);
  render();
}
