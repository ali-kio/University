const STORAGE_KEYS = {
  courses: "uni_schedule_courses",
  exams: "uni_schedule_exams",
  notified: "uni_schedule_notified",
  lectureNotified: "uni_schedule_lecture_notified",
  theme: "uni_schedule_theme",
  reminderOffset: "uni_schedule_reminder_offset",
  examNotifyEnabled: "uni_schedule_exam_notify_enabled",
};

const DAYS = [
  { key: "U", label: "الأحد", jsDay: 0 },
  { key: "M", label: "الاثنين", jsDay: 1 },
  { key: "T", label: "الثلاثاء", jsDay: 2 },
  { key: "W", label: "الأربعاء", jsDay: 3 },
  { key: "H", label: "الخميس", jsDay: 4 },
];

const CARD_COLORS = ["c-blue", "c-orange", "c-green", "c-purple", "c-pink"];

let courses = loadData(STORAGE_KEYS.courses, []);
let exams = loadData(STORAGE_KEYS.exams, []);
let notifiedMap = loadData(STORAGE_KEYS.notified, {});
let lectureNotifiedMap = loadData(STORAGE_KEYS.lectureNotified, {});

// ---------- helpers ----------
function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toDateTime(date, time) {
  return new Date(`${date}T${time}:00`);
}

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("ar", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

// ---------- tabs ----------
const navButtons = document.querySelectorAll(".nav-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

function switchTab(tabId) {
  tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabId));
  if (tabId === "tab-home") renderHome();
  if (tabId === "tab-schedule") renderTimeGrid();
}

navButtons.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

// ---------- theme ----------
const themeToggle = document.getElementById("themeToggle");
const themeToggleHome = document.getElementById("themeToggleHome");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  themeToggle.textContent = isDark ? "مفعّل" : "إيقاف";
  themeToggle.classList.toggle("on", isDark);
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEYS.theme, next);
  applyTheme(next);
}

themeToggle.addEventListener("click", toggleTheme);
themeToggleHome.addEventListener("click", toggleTheme);

// ---------- schedule: time grid ----------
const timeGrid = document.getElementById("timeGrid");
const coursesTableBody = document.getElementById("coursesTableBody");

function colorForCourse(course) {
  if (!course.colorClass) {
    const idx = courses.findIndex((c) => c.id === course.id);
    course.colorClass = CARD_COLORS[idx % CARD_COLORS.length];
  }
  return course.colorClass;
}

const ROW_MIN = 30; // minutes per grid row
const ROW_HEIGHT = 26; // px per row

function renderTimeGrid() {
  timeGrid.innerHTML = "";

  if (!courses.length) {
    timeGrid.innerHTML = `<div class="empty-state">لا توجد محاضرات مضافة بعد.</div>`;
    return;
  }

  let minStart = Math.min(...courses.map((c) => timeToMinutes(c.start)));
  let maxEnd = Math.max(...courses.map((c) => timeToMinutes(c.end)));
  const dayStart = Math.floor(minStart / 60) * 60;
  const dayEnd = Math.ceil(maxEnd / 60) * 60;
  const totalRows = Math.max(1, Math.round((dayEnd - dayStart) / ROW_MIN));

  timeGrid.style.setProperty("--tg-cols", `44px repeat(${DAYS.length}, 1fr)`);

  const header = document.createElement("div");
  header.className = "tg-header";
  header.innerHTML = `<div class="tg-header-cell"></div>` +
    DAYS.map((d) => `<div class="tg-header-cell">${d.key}<br>${d.label}</div>`).join("");
  timeGrid.appendChild(header);

  const body = document.createElement("div");
  body.className = "tg-body";
  body.style.height = `${totalRows * ROW_HEIGHT}px`;

  const timeCol = document.createElement("div");
  timeCol.className = "tg-time-col";
  for (let m = dayStart; m <= dayEnd; m += 60) {
    const top = ((m - dayStart) / ROW_MIN) * ROW_HEIGHT;
    const label = document.createElement("div");
    label.className = "tg-time-label";
    label.style.top = `${top}px`;
    const hour = Math.floor(m / 60);
    const suffix = hour < 12 ? "ص" : "م";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    label.textContent = `${displayHour} ${suffix}`;
    timeCol.appendChild(label);
  }
  body.appendChild(timeCol);

  const byDay = Object.fromEntries(DAYS.map((d) => [d.key, []]));
  courses.forEach((course) => {
    course.days.forEach((day) => { if (byDay[day]) byDay[day].push(course); });
  });

  DAYS.forEach((day) => {
    const col = document.createElement("div");
    col.className = "tg-day-col";

    for (let m = dayStart; m <= dayEnd; m += 60) {
      const top = ((m - dayStart) / ROW_MIN) * ROW_HEIGHT;
      const line = document.createElement("div");
      line.className = "tg-hour-line";
      line.style.top = `${top}px`;
      col.appendChild(line);
    }

    byDay[day.key].forEach((course) => {
      const startMin = timeToMinutes(course.start);
      const endMin = timeToMinutes(course.end);
      const top = ((startMin - dayStart) / ROW_MIN) * ROW_HEIGHT;
      const height = Math.max(((endMin - startMin) / ROW_MIN) * ROW_HEIGHT, 20);

      const block = document.createElement("div");
      block.className = `tg-block ${colorForCourse(course)}`;
      block.style.top = `${top}px`;
      block.style.height = `${height}px`;
      block.innerHTML = `
        <span class="tg-code">${course.name.split(" - ")[0] || course.name}</span>
        <span class="tg-time">${course.start}</span>
        <span class="tg-loc">${course.location}</span>
      `;
      col.appendChild(block);
    });

    body.appendChild(col);
  });

  timeGrid.appendChild(body);
}

function renderCoursesTable() {
  coursesTableBody.innerHTML = "";
  courses.slice().sort((a, b) => a.name.localeCompare(b.name, "ar")).forEach((course) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${course.name}</td>
      <td>${course.section}</td>
      <td>${course.instructor}</td>
      <td>${course.days.join(" - ")}</td>
      <td>${course.start} - ${course.end}</td>
      <td>${course.location}</td>
      <td><div class="actions">
        <button class="edit" data-id="${course.id}" data-type="course">تعديل</button>
        <button class="delete" data-id="${course.id}" data-type="course">حذف</button>
      </div></td>
    `;
    coursesTableBody.appendChild(tr);
  });
}

// ---------- exams ----------
const examsList = document.getElementById("examsList");
const countdown = document.getElementById("countdown");

function renderExams() {
  examsList.innerHTML = "";
  const sorted = exams.slice().sort((a, b) => toDateTime(a.date, a.start) - toDateTime(b.date, b.start));

  if (!sorted.length) {
    examsList.innerHTML = `<div class="empty-state">لا توجد اختبارات مضافة بعد.</div>`;
    return;
  }

  const now = new Date();
  sorted.forEach((exam) => {
    const examDateTime = toDateTime(exam.date, exam.start);
    const diff = examDateTime - now;
    const isNear = diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;

    const item = document.createElement("div");
    item.className = `exam-item ${isNear ? "near" : ""}`;
    item.innerHTML = `
      <div>
        <div><strong>${exam.courseName}</strong> - ${exam.type}</div>
        <div class="exam-meta">${formatDate(exam.date)} | ${exam.start} - ${exam.end}</div>
      </div>
      <div class="actions">
        <button class="edit" data-id="${exam.id}" data-type="exam">تعديل</button>
        <button class="delete" data-id="${exam.id}" data-type="exam">حذف</button>
      </div>
    `;
    examsList.appendChild(item);
  });
}

function getNextUpcomingExam() {
  const now = new Date();
  return exams
    .map((e) => ({ ...e, dateTime: toDateTime(e.date, e.start) }))
    .filter((e) => e.dateTime > now)
    .sort((a, b) => a.dateTime - b.dateTime)[0];
}

function updateCountdown() {
  const next = getNextUpcomingExam();
  if (!next) { countdown.textContent = "لا يوجد اختبار قادم"; return; }
  const diffMs = next.dateTime - new Date();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  countdown.textContent = `أقرب اختبار (${next.courseName} - ${next.type}) بعد ${days} يوم ${hours} ساعة ${mins} دقيقة`;
}

// ---------- render all ----------
function renderAll() {
  renderTimeGrid();
  renderCoursesTable();
  renderExams();
  updateCountdown();
  renderHome();
}

function resetCourseForm() {
  document.getElementById("courseForm").reset();
  document.getElementById("courseId").value = "";
}

function resetExamForm() {
  document.getElementById("examForm").reset();
  document.getElementById("examId").value = "";
}

document.getElementById("courseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("courseId").value || generateId();
  const days = [...document.querySelectorAll('input[name="days"]:checked')].map((d) => d.value);

  if (!days.length) { alert("اختر يومًا واحدًا على الأقل للمحاضرة."); return; }

  const start = document.getElementById("courseStart").value;
  const end = document.getElementById("courseEnd").value;
  if (timeToMinutes(end) <= timeToMinutes(start)) { alert("وقت النهاية يجب أن يكون بعد وقت البداية."); return; }

  const idx = courses.findIndex((c) => c.id === id);
  const existingColor = idx >= 0 ? courses[idx].colorClass : null;

  const course = {
    id,
    name: document.getElementById("courseName").value.trim(),
    section: document.getElementById("section").value.trim(),
    instructor: document.getElementById("instructor").value.trim(),
    days, start, end,
    location: document.getElementById("location").value.trim(),
    colorClass: existingColor || CARD_COLORS[courses.length % CARD_COLORS.length],
  };

  if (idx >= 0) courses[idx] = course; else courses.push(course);

  saveData(STORAGE_KEYS.courses, courses);
  resetCourseForm();
  renderAll();
});

document.getElementById("examForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("examId").value || generateId();
  const start = document.getElementById("examStart").value;
  const end = document.getElementById("examEnd").value;
  if (timeToMinutes(end) <= timeToMinutes(start)) { alert("وقت نهاية الاختبار يجب أن يكون بعد البداية."); return; }

  const exam = {
    id,
    courseName: document.getElementById("examCourseName").value.trim(),
    type: document.getElementById("examType").value,
    date: document.getElementById("examDate").value,
    start, end,
  };

  const idx = exams.findIndex((x) => x.id === id);
  if (idx >= 0) exams[idx] = exam; else exams.push(exam);

  saveData(STORAGE_KEYS.exams, exams);
  resetExamForm();
  renderAll();
});

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.matches("button[data-type='course'].edit")) {
    const course = courses.find((c) => c.id === target.dataset.id);
    if (!course) return;
    document.getElementById("courseId").value = course.id;
    document.getElementById("courseName").value = course.name;
    document.getElementById("section").value = course.section;
    document.getElementById("instructor").value = course.instructor;
    document.getElementById("courseStart").value = course.start;
    document.getElementById("courseEnd").value = course.end;
    document.getElementById("location").value = course.location;
    document.querySelectorAll('input[name="days"]').forEach((cb) => { cb.checked = course.days.includes(cb.value); });
  }

  if (target.matches("button[data-type='course'].delete")) {
    courses = courses.filter((c) => c.id !== target.dataset.id);
    saveData(STORAGE_KEYS.courses, courses);
    renderAll();
  }

  if (target.matches("button[data-type='exam'].edit")) {
    const exam = exams.find((x) => x.id === target.dataset.id);
    if (!exam) return;
    document.getElementById("examId").value = exam.id;
    document.getElementById("examCourseName").value = exam.courseName;
    document.getElementById("examType").value = exam.type;
    document.getElementById("examDate").value = exam.date;
    document.getElementById("examStart").value = exam.start;
    document.getElementById("examEnd").value = exam.end;
  }

  if (target.matches("button[data-type='exam'].delete")) {
    exams = exams.filter((x) => x.id !== target.dataset.id);
    saveData(STORAGE_KEYS.exams, exams);
    renderAll();
  }
});

document.getElementById("courseReset").addEventListener("click", resetCourseForm);
document.getElementById("examReset").addEventListener("click", resetExamForm);
document.getElementById("exportBtn").addEventListener("click", () => window.print());

// ---------- home dashboard ----------
function renderHome() {
  const todayEl = document.getElementById("todayClasses");
  const homeCountdown = document.getElementById("homeCountdown");

  const jsToday = new Date().getDay();
  const todayKey = (DAYS.find((d) => d.jsDay === jsToday) || {}).key;

  const todays = courses
    .filter((c) => todayKey && c.days.includes(todayKey))
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  if (!todays.length) {
    todayEl.innerHTML = `<div class="empty-state">لا توجد محاضرات اليوم 🎉</div>`;
  } else {
    todayEl.innerHTML = todays.map((c) => `
      <div class="class-item">
        <div>
          <div><strong>${c.name}</strong></div>
          <div class="meta">${c.location}</div>
        </div>
        <div class="time">${c.start} - ${c.end}</div>
      </div>
    `).join("");
  }

  const next = getNextUpcomingExam();
  homeCountdown.textContent = next
    ? `${next.courseName} (${next.type}) — ${formatDate(next.date)}`
    : "لا يوجد اختبار قادم";

  document.getElementById("quickCourseCount").textContent = courses.length;
  document.getElementById("quickExamCount").textContent = exams.filter((e) => toDateTime(e.date, e.start) > new Date()).length;
}

// ---------- settings: reminders & notifications ----------
const reminderOffsetSelect = document.getElementById("reminderOffset");
const notifyBtn = document.getElementById("notifyBtn");

function initSettings() {
  const savedOffset = localStorage.getItem(STORAGE_KEYS.reminderOffset);
  if (savedOffset !== null) reminderOffsetSelect.value = savedOffset;

  const examNotifyEnabled = localStorage.getItem(STORAGE_KEYS.examNotifyEnabled) === "true";
  notifyBtn.textContent = examNotifyEnabled ? "مفعّل" : "تفعيل";
  notifyBtn.classList.toggle("on", examNotifyEnabled);
}

reminderOffsetSelect.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.reminderOffset, reminderOffsetSelect.value);
});

function requestNotifications() {
  if (!("Notification" in window)) { alert("المتصفح لا يدعم الإشعارات."); return; }
  Notification.requestPermission().then((permission) => {
    const granted = permission === "granted";
    localStorage.setItem(STORAGE_KEYS.examNotifyEnabled, String(granted));
    notifyBtn.textContent = granted ? "مفعّل" : "تفعيل";
    notifyBtn.classList.toggle("on", granted);
    if (!granted) alert("لم يتم منح إذن الإشعارات.");
  });
}

notifyBtn.addEventListener("click", requestNotifications);

function sendNotification(title, body) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "SHOW_NOTIFICATION", title, body });
  } else if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function checkExamNotifications() {
  if (localStorage.getItem(STORAGE_KEYS.examNotifyEnabled) !== "true") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  exams.forEach((exam) => {
    const startDate = toDateTime(exam.date, exam.start);
    if (startDate <= now) return;

    const oneDayBefore = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const twoHoursBefore = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
    const dayKey = `${exam.id}_day`;
    const twoHourKey = `${exam.id}_2h`;

    if (now >= oneDayBefore && !notifiedMap[dayKey]) {
      sendNotification("تذكير اختبار", `${exam.courseName} (${exam.type}) بعد أقل من يوم.`);
      notifiedMap[dayKey] = true;
    }
    if (now >= twoHoursBefore && !notifiedMap[twoHourKey]) {
      sendNotification("تذكير اختبار", `${exam.courseName} (${exam.type}) بعد أقل من ساعتين.`);
      notifiedMap[twoHourKey] = true;
    }
  });
  saveData(STORAGE_KEYS.notified, notifiedMap);
}

function checkLectureNotifications() {
  const offsetMin = Number(localStorage.getItem(STORAGE_KEYS.reminderOffset) ?? "10");
  if (!offsetMin) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const jsToday = now.getDay();
  const todayKey = (DAYS.find((d) => d.jsDay === jsToday) || {}).key;
  if (!todayKey) return;

  courses.forEach((course) => {
    if (!course.days.includes(todayKey)) return;
    const startDate = toDateTime(todayStr, course.start);
    const notifyAt = new Date(startDate.getTime() - offsetMin * 60 * 1000);
    const key = `${course.id}_${todayStr}`;

    if (now >= notifyAt && now < startDate && !lectureNotifiedMap[key]) {
      sendNotification("تذكير محاضرة", `${course.name} تبدأ الساعة ${course.start} في ${course.location}.`);
      lectureNotifiedMap[key] = true;
      saveData(STORAGE_KEYS.lectureNotified, lectureNotifiedMap);
    }
  });
}

setInterval(() => {
  updateCountdown();
  checkExamNotifications();
  checkLectureNotifications();
  if (document.getElementById("tab-home").classList.contains("active")) renderHome();
}, 60 * 1000);

// ---------- init ----------
initTheme();
initSettings();
renderAll();
checkExamNotifications();
checkLectureNotifications();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => console.warn("SW registration failed:", err));
  });
}
