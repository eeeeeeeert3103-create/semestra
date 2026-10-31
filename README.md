# Semestra

[Русский](#русский) · [English](#english)

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![No dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Offline](https://img.shields.io/badge/works-offline-3b5bfd)
![Privacy](https://img.shields.io/badge/data-stays%20in%20your%20browser-1f9d55)

**[▶ Try it online](https://eeeeeeeert3103-create.github.io/semestra/)** · no install, no sign-up

Free, open-source **semester planner and university timetable app** for students: odd/even (A/B) week schedules, assignment deadlines and a points-to-pass tracker. Offline PWA for phone and desktop, no account, no tracking.

> ⭐ If Semestra saves you time, star the repo: it helps other students find it.

**Semester planner for university students.** Alternating weeks (odd/even, «числитель/знаменатель»), deadlines and the points you still need to pass, in one page that works offline. No account, no server, no tracking.

![Semestra: today view](docs/today.png)

## English

### Why
University timetables often alternate every other week, grades are counted in points, and deadlines live in five different chats. Calendar apps handle none of that well. Semestra does exactly three things:

- **Timetable with alternating weeks.** Mark a class as every week, week A or week B; the app always knows which week it is.
- **Deadlines** with "overdue / today / in N days" badges.
- **Points to pass.** For each subject: earned, needed, maximum, and how many are left. Quick +1/+5/+10 buttons.

Plus: export to any calendar (`.ics`, recurring events), JSON backup and restore, RU/EN interface, dark mode, mobile layout, installable as a PWA.

### Use it
[Open the online version](https://eeeeeeeert3103-create.github.io/semestra/), or download the repo and open `index.html` in a browser. That's it: no build step, no `npm install`.
To host your own copy, fork the repo and enable **GitHub Pages** (Settings → Pages → Deploy from branch → `main` / root).

### Privacy and security
- Timetable, deadline and points data is stored in this browser's `localStorage`; the app does not send it to an app server. The hosted version still requests site files from its hosting provider, which may process ordinary connection metadata. Data stays on this browser/device and does not sync automatically; use the JSON backup or calendar export to transfer it. “Erase all data” clears the app data from this browser.
- Strict Content-Security-Policy: no inline scripts, no third-party code, no `eval`.
- User text is never inserted as HTML (DOM is built with `textContent`), so pasted `<script>` stays plain text.
- Imported backups are validated field by field; unknown fields are dropped.

### FAQ
- **Does it work on my phone?** Yes. Open the link and choose "Add to Home Screen": it installs like an app and opens without internet.
- **Can I move my timetable to Google Calendar?** Yes. Settings → Export to calendar (`.ics`). Classes become recurring events, A/B weeks repeat every two weeks.
- **Where is my data?** Only in your browser. Use "Download backup" to move it to another device.
- **My university has no alternating weeks.** Turn alternation off in Settings and it becomes a regular weekly timetable.

### Contributing
New here? Pick an issue labelled [`good first issue`](https://github.com/eeeeeeeert3103-create/semestra/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22): translations, small UI features. Bigger ideas are labelled [`help wanted`](https://github.com/eeeeeeeert3103-create/semestra/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22). The whole app is three files of plain HTML/CSS/JS, so you can start without any setup.

## Русский

**Бесплатный планировщик семестра для студентов.** Расписание пар по числителю и знаменателю (чётная и нечётная неделя), дедлайны и баллы до зачёта или автомата на одной странице. Работает без интернета, без регистрации и без сервера.

- **Расписание с чередованием недель.** Пара бывает каждую неделю, только по числителю или только по знаменателю, а приложение само знает, какая сейчас неделя.
- **Дедлайны** с метками «просрочено», «сегодня», «через N дн.».
- **Баллы.** По каждому предмету видно, сколько набрано, сколько нужно и сколько осталось. Кнопки +1/+5/+10.
- Экспорт в Google/Яндекс/Apple Календарь (`.ics`), резервная копия в JSON, тёмная тема, мобильная версия.

**Как запустить:** [открыть онлайн](https://eeeeeeeert3103-create.github.io/semestra/) или скачать и открыть `index.html` в браузере. Чтобы получить свою ссылку, сделай форк и включи GitHub Pages.

**Расписание, дедлайны и баллы** хранятся в `localStorage` этого браузера и не отправляются приложением на сервер. При открытии онлайн-версии хостинг получает обычные запросы к файлам сайта и может обрабатывать технические данные соединения. Данные не синхронизируются между устройствами; для переноса используй JSON-копию или экспорт календаря. Кнопка «Стереть все данные» удаляет их из этого браузера.

**На телефоне:** открой ссылку и выбери «На главный экран», приложение будет открываться и без интернета.

**Хочешь помочь?** Посмотри задачи с меткой [`good first issue`](https://github.com/eeeeeeeert3103-create/semestra/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22). Если планировщик пригодился, поставь ⭐, так его найдут другие студенты.

<p>
  <img src="docs/week.png" width="49%" alt="Week view">
  <img src="docs/points.png" width="49%" alt="Points view">
</p>
<p align="center"><img src="docs/mobile-dark.png" width="300" alt="Mobile, dark mode"></p>

## License
[MIT](LICENSE)
