const STORAGE_KEYS = {
  courses: "uni_schedule_courses",
  exams: "uni_schedule_exams",
  notified: "uni_schedule_notified",
  lectureNotified: "uni_schedule_lecture_notified",
  theme: "uni_schedule_theme",
  reminderOffset: "uni_schedule_reminder_offset",
  examNotifyEnabled: "uni_schedule_exam_notify_enabled",
  tasks: "uni_schedule_tasks",
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
let tasks = loadData(STORAGE_KEYS.tasks, []);

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

function emptyIcon() {
  return `<svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.2"/><path d="M3.5 9.5h17"/><path d="M8 3v3.5"/><path d="M16 3v3.5"/></svg>`;
}


const navButtons = document.querySelectorAll(".nav-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const TAB_ORDER = [...tabPanels].map((p) => p.id);
let currentTabIndex = 0;

function switchTab(tabId) {
  const newIndex = TAB_ORDER.indexOf(tabId);
  const direction = newIndex > currentTabIndex ? "next" : "prev";
  currentTabIndex = newIndex;

  tabPanels.forEach((panel) => {
    const isTarget = panel.id === tabId;
    panel.classList.toggle("active", isTarget);
    if (isTarget) {
      panel.classList.remove("slide-next", "slide-prev");
      void panel.offsetWidth;
      panel.classList.add(direction === "next" ? "slide-next" : "slide-prev");
    }
  });
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabId));
  if (tabId === "tab-home") renderHome();
  if (tabId === "tab-schedule") renderTimeGrid();
}

navButtons.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

// ---------- language ----------
const TRANSLATIONS = {
  ar: {
    home_greeting: "مرحبًا 👋",
    install_title: "ثبّت التطبيق على جهازك",
    install_sub: "افتحه من شاشتك الرئيسية زي أي تطبيق عادي",
    install_btn: "تثبيت",
    next_exam_label: "أقرب اختبار",
    next_class_label: "حصتك القادمة",
    no_courses_short: "لا توجد محاضرات مضافة",
    today_classes_title: "حصص اليوم",
    quick_overview_title: "نظرة سريعة",
    quick_courses_label: "مقررات",
    quick_exams_label: "اختبارات قادمة",
    quick_tasks_label: "مهام متبقية",
    schedule_title: "الجدول الدراسي",
    add_course_summary: "+ إضافة / تعديل مقرر",
    course_name_label: "اسم ورمز المقرر",
    instructor_label: "اسم المدرس",
    section_label: "الشعبة",
    location_label: "المبنى والقاعة",
    lecture_start_label: "وقت المحاضرة (من)",
    lecture_end_label: "وقت المحاضرة (إلى)",
    choose_type_title: "اختر النوع",
    choose_days_title: "اختر الأيام",
    final_exam_title: "الامتحان النهائي (اختياري)",
    exam_date_label: "تاريخ الاختبار",
    exam_start_label: "وقت البدء",
    exam_end_label: "وقت الانتهاء",
    save_course_btn: "حفظ المقرر",
    cancel_edit_btn: "إلغاء التعديل",
    my_courses_title: "مقرراتك",
    search_placeholder: "ابحث باسم المقرر أو المدرس أو الموقع...",
    th_course: "المقرر", th_section: "الشعبة", th_instructor: "الدكتور",
    th_days: "الأيام", th_time: "الوقت", th_type: "النوع", th_location: "الموقع", th_actions: "إجراءات",
    exams_title: "الاختبارات",
    add_exam_summary: "+ إضافة / تعديل موعد اختبار",
    exam_course_label: "اسم المقرر",
    exam_type_label: "نوع الاختبار",
    choose_type_option: "اختر النوع",
    midterm_option: "نصفي", final_option: "نهائي", quiz_option: "كويز",
    date_label: "التاريخ", time_from_label: "الوقت (من)", time_to_label: "الوقت (إلى)",
    save_exam_btn: "حفظ الاختبار",
    tasks_title: "قائمة المهام",
    task_placeholder: "مثال: تسليم واجب البرمجة",
    hide_done_label: "إخفاء المهام المنجزة",
    settings_title: "الإعدادات",
    dark_mode_label: "الوضع الداكن", dark_mode_sub: "تبديل مظهر التطبيق",
    reminder_label: "تذكير قبل المحاضرة", reminder_sub: "يرسل إشعار قبل بداية أي محاضرة",
    off_option: "إيقاف", min5_option: "قبل 5 دقائق", min10_option: "قبل 10 دقائق",
    min15_option: "قبل 15 دقيقة", min30_option: "قبل 30 دقيقة", min60_option: "قبل ساعة",
    exam_notify_label: "إشعارات الاختبارات", exam_notify_sub: "تذكير قبل يوم وقبل ساعتين من كل اختبار",
    language_label: "اللغة", language_sub: "لغة واجهة التطبيق",
    accent_title: "لون التطبيق",
    backup_title: "نسخة احتياطية من بياناتك",
    export_label: "تصدير نسخة احتياطية", export_sub: "يحفظ كل بياناتك بملف واحد على جهازك", export_btn: "تصدير",
    import_label: "استيراد نسخة احتياطية", import_sub: "يرجع بياناتك من ملف محفوظ سابقًا", import_btn: "استيراد",
    reset_label: "حذف كل البيانات", reset_sub: "يمسح كل شي نهائيًا من هذا الجهاز", reset_btn: "حذف",
    footnote: "جميع بياناتك محفوظة على جهازك فقط، ولا تُشارك مع أي طرف آخر.",
    nav_home: "الرئيسية", nav_schedule: "الجدول", nav_exams: "الاختبارات", nav_tasks: "المهام", nav_settings: "الإعدادات",
    no_lectures_today: "لا توجد محاضرات اليوم 🎉",
    no_upcoming_classes: "لا توجد محاضرات قادمة",
    no_upcoming_exam: "لا يوجد اختبار قادم",
    no_courses_yet: "لا توجد محاضرات مضافة بعد.",
    no_exams_yet: "لا توجد اختبارات مضافة بعد.",
    no_tasks_yet: "لا توجد مهام حالياً. أضف أول مهمة من الأعلى.",
    all_tasks_done: "كل مهامك منجزة 🎉",
    toast_course_saved: "تم حفظ المقرر ✓",
    toast_task_added: "تمت إضافة المهمة ✓",
    toast_course_deleted: "تم حذف المقرر",
    toast_exam_deleted: "تم حذف الاختبار",
    toast_task_deleted: "تم حذف المهمة",
    undo_label: "تراجع",
    choose_day_alert: "اختر يومًا واحدًا على الأقل للمحاضرة.",
    end_after_start_alert: "وقت النهاية يجب أن يكون بعد وقت البداية.",
    exam_end_after_start_alert: "وقت نهاية الاختبار يجب أن يكون بعد البداية.",
    no_notification_support: "المتصفح لا يدعم الإشعارات.",
    notification_denied: "لم يتم منح إذن الإشعارات.",
    notification_enabled: "مفعّل", notification_disabled: "تفعيل",
    exam_reminder_title: "تذكير اختبار",
    exam_reminder_day: (name, type) => `${name} (${type}) بعد أقل من يوم.`,
    exam_reminder_2h: (name, type) => `${name} (${type}) بعد أقل من ساعتين.`,
    lecture_reminder_title: "تذكير محاضرة",
    lecture_reminder_body: (name, time, loc) => `${name} تبدأ الساعة ${time} في ${loc}.`,
    reset_confirm: "متأكد تبي تحذف كل بياناتك نهائيًا؟ هذا الإجراء لا يمكن التراجع عنه.",
    import_success: "تم استيراد بياناتك بنجاح ✓",
    import_failed: "الملف غير صالح، تأكد إنه نفس ملف النسخة الاحتياطية.",
    countdown_next_exam: (name, type, d, h, m) => `أقرب اختبار (${name} - ${type}) بعد ${d} يوم ${h} ساعة ${m} دقيقة`,
  },
  en: {
    home_greeting: "Hello 👋",
    install_title: "Install the app",
    install_sub: "Open it from your home screen like a regular app",
    install_btn: "Install",
    next_exam_label: "Next Exam",
    next_class_label: "Next Class",
    no_courses_short: "No courses added yet",
    today_classes_title: "Today's Classes",
    quick_overview_title: "Quick Overview",
    quick_courses_label: "Courses",
    quick_exams_label: "Upcoming Exams",
    quick_tasks_label: "Tasks Left",
    schedule_title: "My Schedule",
    add_course_summary: "+ Add / Edit Course",
    course_name_label: "Course Name & Code",
    instructor_label: "Instructor Name",
    section_label: "Section",
    location_label: "Building & Room",
    lecture_start_label: "Lecture Start Time",
    lecture_end_label: "Lecture End Time",
    choose_type_title: "Choose Type",
    choose_days_title: "Choose Days",
    final_exam_title: "Final Exam (optional)",
    exam_date_label: "Exam Date",
    exam_start_label: "Start Time",
    exam_end_label: "End Time",
    save_course_btn: "Save Course",
    cancel_edit_btn: "Cancel Edit",
    my_courses_title: "Your Courses",
    search_placeholder: "Search by course, instructor, or location...",
    th_course: "Course", th_section: "Section", th_instructor: "Instructor",
    th_days: "Days", th_time: "Time", th_type: "Type", th_location: "Location", th_actions: "Actions",
    exams_title: "Exams",
    add_exam_summary: "+ Add / Edit Exam",
    exam_course_label: "Course Name",
    exam_type_label: "Exam Type",
    choose_type_option: "Choose type",
    midterm_option: "Midterm", final_option: "Final", quiz_option: "Quiz",
    date_label: "Date", time_from_label: "Start Time", time_to_label: "End Time",
    save_exam_btn: "Save Exam",
    tasks_title: "Task List",
    task_placeholder: "e.g. Submit programming assignment",
    hide_done_label: "Hide completed tasks",
    settings_title: "Settings",
    dark_mode_label: "Dark Mode", dark_mode_sub: "Toggle the app's appearance",
    reminder_label: "Lecture Reminder", reminder_sub: "Sends a notification before each lecture starts",
    off_option: "Off", min5_option: "5 minutes before", min10_option: "10 minutes before",
    min15_option: "15 minutes before", min30_option: "30 minutes before", min60_option: "1 hour before",
    exam_notify_label: "Exam Notifications", exam_notify_sub: "Reminds you a day and two hours before each exam",
    language_label: "Language", language_sub: "App interface language",
    accent_title: "App Color",
    backup_title: "Backup Your Data",
    export_label: "Export Backup", export_sub: "Saves all your data as one file on your device", export_btn: "Export",
    import_label: "Import Backup", import_sub: "Restores your data from a previously saved file", import_btn: "Import",
    reset_label: "Delete All Data", reset_sub: "Permanently erases everything on this device", reset_btn: "Delete",
    footnote: "All your data stays on this device only and is never shared with anyone.",
    nav_home: "Home", nav_schedule: "Schedule", nav_exams: "Exams", nav_tasks: "Tasks", nav_settings: "Settings",
    no_lectures_today: "No lectures today 🎉",
    no_upcoming_classes: "No upcoming classes",
    no_upcoming_exam: "No upcoming exam",
    no_courses_yet: "No courses added yet.",
    no_exams_yet: "No exams added yet.",
    no_tasks_yet: "No tasks yet. Add your first one above.",
    all_tasks_done: "All your tasks are done 🎉",
    toast_course_saved: "Course saved ✓",
    toast_task_added: "Task added ✓",
    toast_course_deleted: "Course deleted",
    toast_exam_deleted: "Exam deleted",
    toast_task_deleted: "Task deleted",
    undo_label: "Undo",
    choose_day_alert: "Please choose at least one lecture day.",
    end_after_start_alert: "End time must be after the start time.",
    exam_end_after_start_alert: "Exam end time must be after the start time.",
    no_notification_support: "Your browser does not support notifications.",
    notification_denied: "Notification permission was not granted.",
    notification_enabled: "Enabled", notification_disabled: "Enable",
    exam_reminder_title: "Exam Reminder",
    exam_reminder_day: (name, type) => `${name} (${type}) is less than a day away.`,
    exam_reminder_2h: (name, type) => `${name} (${type}) is less than two hours away.`,
    lecture_reminder_title: "Lecture Reminder",
    lecture_reminder_body: (name, time, loc) => `${name} starts at ${time} in ${loc}.`,
    reset_confirm: "Are you sure you want to permanently delete all your data? This cannot be undone.",
    import_success: "Your data was imported successfully ✓",
    import_failed: "Invalid file. Make sure it's the same backup file.",
    countdown_next_exam: (name, type, d, h, m) => `Next exam (${name} - ${type}) in ${d}d ${h}h ${m}m`,
  },
};

function currentLang() {
  return localStorage.getItem("uni_schedule_lang") || "ar";
}

function t(key, ...args) {
  const entry = TRANSLATIONS[currentLang()][key] ?? TRANSLATIONS.ar[key] ?? key;
  return typeof entry === "function" ? entry(...args) : entry;
}

function applyLanguage(lang) {
  localStorage.setItem("uni_schedule_lang", lang);
  const html = document.getElementById("htmlRoot");
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "en" ? "ltr" : "rtl");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });

  const langToggle = document.getElementById("langToggle");
  langToggle.textContent = lang === "ar" ? "العربية" : "English";

  renderAll();
}

document.getElementById("langToggle").addEventListener("click", () => {
  applyLanguage(currentLang() === "ar" ? "en" : "ar");
});

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

// ---------- accent color ----------
const accentRow = document.getElementById("accentRow");

function applyAccent(accent) {
  document.documentElement.setAttribute("data-accent", accent);
  accentRow.querySelectorAll(".accent-swatch").forEach((s) => s.classList.toggle("active", s.dataset.accent === accent));
}

function initAccent() {
  applyAccent(localStorage.getItem("uni_schedule_accent") || "green");
}

accentRow.querySelectorAll(".accent-swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    localStorage.setItem("uni_schedule_accent", swatch.dataset.accent);
    applyAccent(swatch.dataset.accent);
  });
});

// ---------- course form pills ----------
const typeRow = document.getElementById("typeRow");
const courseTypeInput = document.getElementById("courseType");
const daysRow = document.getElementById("daysRow");

typeRow.querySelectorAll(".pill-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    typeRow.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    courseTypeInput.value = btn.dataset.type;
  });
});

function setActiveType(type) {
  typeRow.querySelectorAll(".pill-btn").forEach((b) => b.classList.toggle("active", b.dataset.type === type));
  courseTypeInput.value = type;
}

daysRow.querySelectorAll(".pill-btn").forEach((btn) => {
  btn.addEventListener("click", () => btn.classList.toggle("active"));
});

function getSelectedDays() {
  return [...daysRow.querySelectorAll(".pill-btn.active")].map((b) => b.dataset.day);
}

function setSelectedDays(days) {
  daysRow.querySelectorAll(".pill-btn").forEach((b) => b.classList.toggle("active", days.includes(b.dataset.day)));
}

// ---------- top day-pills (quick nav on the schedule tab) ----------
const dayPills = document.querySelectorAll("#dayPills .day-pill");

function highlightToday() {
  const jsToday = new Date().getDay();
  const todayKey = (DAYS.find((d) => d.jsDay === jsToday) || {}).key;
  dayPills.forEach((pill) => pill.classList.toggle("active", pill.dataset.day === todayKey));
}

dayPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    dayPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    const col = timeGrid.querySelector(`.tg-day-col[data-day="${pill.dataset.day}"]`);
    if (col) col.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });
});

highlightToday();

// ---------- toast ----------
function showToast(message, actionLabel, actionFn) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${message}</span>`;
  if (actionLabel && actionFn) {
    const btn = document.createElement("button");
    btn.className = "toast-action";
    btn.textContent = actionLabel;
    btn.addEventListener("click", () => {
      actionFn();
      toast.classList.remove("show");
    });
    toast.appendChild(btn);
  }
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), actionLabel ? 4000 : 1800);
}


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
    timeGrid.innerHTML = `<div class="empty-state">${emptyIcon()}${t("no_courses_yet")}</div>`;
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
    col.dataset.day = day.key;

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
        <span class="tg-time">${course.start} - ${course.end}</span>
        <span class="tg-loc">${course.location}</span>
        <span class="tg-loc">${course.type || "LEC"}</span>
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
      <td>${course.type || "LEC"}</td>
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
    examsList.innerHTML = `<div class="empty-state">${emptyIcon()}${t("no_exams_yet")}</div>`;
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
  if (!next) { countdown.textContent = t("no_upcoming_exam"); return; }
  const diffMs = next.dateTime - new Date();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  countdown.textContent = t("countdown_next_exam", next.courseName, next.type, days, hours, mins);
}

// ---------- render all ----------
function renderAll() {
  renderTimeGrid();
  renderCoursesTable();
  renderExams();
  updateCountdown();
  renderHome();
  renderTasks();
}

function resetCourseForm() {
  document.getElementById("courseForm").reset();
  document.getElementById("courseId").value = "";
  setSelectedDays([]);
  setActiveType("LEC");
}

function resetExamForm() {
  document.getElementById("examForm").reset();
  document.getElementById("examId").value = "";
}

document.getElementById("courseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("courseId").value || generateId();
  const days = getSelectedDays();

  if (!days.length) { alert(t("choose_day_alert")); return; }

  const start = document.getElementById("courseStart").value;
  const end = document.getElementById("courseEnd").value;
  if (timeToMinutes(end) <= timeToMinutes(start)) { alert(t("end_after_start_alert")); return; }

  const idx = courses.findIndex((c) => c.id === id);
  const existingColor = idx >= 0 ? courses[idx].colorClass : null;
  const existingLinkedExamId = idx >= 0 ? courses[idx].linkedExamId : null;

  const course = {
    id,
    name: document.getElementById("courseName").value.trim(),
    section: document.getElementById("section").value.trim(),
    instructor: document.getElementById("instructor").value.trim(),
    days, start, end,
    location: document.getElementById("location").value.trim(),
    type: courseTypeInput.value || "LEC",
    colorClass: existingColor || CARD_COLORS[courses.length % CARD_COLORS.length],
    linkedExamId: existingLinkedExamId || null,
  };

  if (idx >= 0) courses[idx] = course; else courses.push(course);

  // sync the embedded final-exam fields with the exams list
  const examDate = document.getElementById("courseExamDate").value;
  const examStart = document.getElementById("courseExamStart").value;
  const examEnd = document.getElementById("courseExamEnd").value;

  if (examDate && examStart && examEnd) {
    const examEntry = {
      id: course.linkedExamId || generateId(),
      courseName: course.name,
      type: "نهائي",
      date: examDate,
      start: examStart,
      end: examEnd,
    };
    const examIdx = exams.findIndex((x) => x.id === examEntry.id);
    if (examIdx >= 0) exams[examIdx] = examEntry; else exams.push(examEntry);
    course.linkedExamId = examEntry.id;
    saveData(STORAGE_KEYS.exams, exams);
  } else if (course.linkedExamId) {
    exams = exams.filter((x) => x.id !== course.linkedExamId);
    course.linkedExamId = null;
    saveData(STORAGE_KEYS.exams, exams);
  }

  saveData(STORAGE_KEYS.courses, courses);
  resetCourseForm();
  renderAll();
  showToast(t("toast_course_saved"));
});

document.getElementById("examForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("examId").value || generateId();
  const start = document.getElementById("examStart").value;
  const end = document.getElementById("examEnd").value;
  if (timeToMinutes(end) <= timeToMinutes(start)) { alert(t("exam_end_after_start_alert")); return; }

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
    setSelectedDays(course.days);
    setActiveType(course.type || "LEC");

    const linkedExam = course.linkedExamId ? exams.find((x) => x.id === course.linkedExamId) : null;
    document.getElementById("courseExamDate").value = linkedExam ? linkedExam.date : "";
    document.getElementById("courseExamStart").value = linkedExam ? linkedExam.start : "";
    document.getElementById("courseExamEnd").value = linkedExam ? linkedExam.end : "";
  }

  if (target.matches("button[data-type='course'].delete")) {
    const course = courses.find((c) => c.id === target.dataset.id);
    if (!course) return;
    let removedExam = null;
    if (course.linkedExamId) {
      removedExam = exams.find((x) => x.id === course.linkedExamId) || null;
      exams = exams.filter((x) => x.id !== course.linkedExamId);
      saveData(STORAGE_KEYS.exams, exams);
    }
    courses = courses.filter((c) => c.id !== target.dataset.id);
    saveData(STORAGE_KEYS.courses, courses);
    renderAll();
    showToast(t("toast_course_deleted"), t("undo_label"), () => {
      courses.push(course);
      if (removedExam) exams.push(removedExam);
      saveData(STORAGE_KEYS.courses, courses);
      saveData(STORAGE_KEYS.exams, exams);
      renderAll();
    });
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
    const exam = exams.find((x) => x.id === target.dataset.id);
    const affectedCourses = courses.filter((c) => c.linkedExamId === target.dataset.id);
    exams = exams.filter((x) => x.id !== target.dataset.id);
    affectedCourses.forEach((c) => { c.linkedExamId = null; });
    saveData(STORAGE_KEYS.exams, exams);
    saveData(STORAGE_KEYS.courses, courses);
    renderAll();
    showToast(t("toast_exam_deleted"), t("undo_label"), () => {
      if (exam) exams.push(exam);
      affectedCourses.forEach((c) => { c.linkedExamId = exam ? exam.id : c.linkedExamId; });
      saveData(STORAGE_KEYS.exams, exams);
      saveData(STORAGE_KEYS.courses, courses);
      renderAll();
    });
  }
});

document.getElementById("courseReset").addEventListener("click", resetCourseForm);
document.getElementById("examReset").addEventListener("click", resetExamForm);
document.getElementById("exportBtn").addEventListener("click", () => window.print());

// ---------- home dashboard ----------
function getNextUpcomingClass() {
  if (!courses.length) return null;
  const now = new Date();
  const candidates = [];

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const jsDay = d.getDay();
    const dayKey = (DAYS.find((x) => x.jsDay === jsDay) || {}).key;
    if (!dayKey) continue;

    courses.filter((c) => c.days.includes(dayKey)).forEach((c) => {
      const dt = new Date(d);
      const [h, m] = c.start.split(":").map(Number);
      dt.setHours(h, m, 0, 0);
      if (dt > now) candidates.push({ course: c, dateTime: dt });
    });
  }

  candidates.sort((a, b) => a.dateTime - b.dateTime);
  return candidates[0] || null;
}

function renderHome() {
  const todayEl = document.getElementById("todayClasses");
  const homeCountdown = document.getElementById("homeCountdown");
  const nextClassWidget = document.getElementById("nextClassWidget");

  const jsToday = new Date().getDay();
  const todayKey = (DAYS.find((d) => d.jsDay === jsToday) || {}).key;

  const todays = courses
    .filter((c) => todayKey && c.days.includes(todayKey))
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  if (!todays.length) {
    todayEl.innerHTML = `<div class="empty-state">${emptyIcon()}${t("no_lectures_today")}</div>`;
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
    : t("no_upcoming_exam");

  const nextClass = getNextUpcomingClass();
  if (nextClass) {
    const dayLabel = DAYS.find((d) => d.jsDay === nextClass.dateTime.getDay())?.label || "";
    nextClassWidget.textContent = `${nextClass.course.name.split(" - ")[0]} — ${dayLabel} ${nextClass.course.start}`;
  } else {
    nextClassWidget.textContent = t("no_upcoming_classes");
  }

  document.getElementById("quickCourseCount").textContent = courses.length;
  document.getElementById("quickExamCount").textContent = exams.filter((e) => toDateTime(e.date, e.start) > new Date()).length;
  document.getElementById("quickTaskCount").textContent = tasks.filter((t) => !t.done).length;
}

// ---------- tasks ----------
const taskForm = document.getElementById("taskForm");
const tasksList = document.getElementById("tasksList");

const hideDoneCheckbox = document.getElementById("hideDoneCheckbox");

function renderTasks() {
  const hideDone = hideDoneCheckbox.checked;
  const visible = hideDone ? tasks.filter((t) => !t.done) : tasks;

  if (!visible.length) {
    tasksList.innerHTML = `<div class="empty-state">${emptyIcon()}${tasks.length ? t("all_tasks_done") : t("no_tasks_yet")}</div>`;
    return;
  }

  const sorted = visible.slice().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  tasksList.innerHTML = sorted.map((t) => `
    <div class="task-item ${t.done ? "done" : ""}">
      <button class="task-check" data-id="${t.id}" aria-label="إتمام المهمة">${t.done ? "✓" : ""}</button>
      <div class="task-body">
        <div class="task-text">${t.text}</div>
        ${t.dueDate ? `<div class="task-due">${formatDate(t.dueDate)}</div>` : ""}
      </div>
      <button class="task-delete" data-id="${t.id}" aria-label="حذف">×</button>
    </div>
  `).join("");
}

hideDoneCheckbox.addEventListener("change", renderTasks);

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("taskText").value.trim();
  const dueDate = document.getElementById("taskDate").value;
  if (!text) return;
  tasks.push({ id: generateId(), text, dueDate, done: false });
  saveData(STORAGE_KEYS.tasks, tasks);
  taskForm.reset();
  renderTasks();
  showToast(t("toast_task_added"));
});

tasksList.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.matches(".task-check")) {
    const task = tasks.find((t) => t.id === target.dataset.id);
    if (!task) return;
    task.done = !task.done;
    saveData(STORAGE_KEYS.tasks, tasks);
    renderTasks();
  }

  if (target.matches(".task-delete")) {
    const removed = tasks.find((task) => task.id === target.dataset.id);
    tasks = tasks.filter((task) => task.id !== target.dataset.id);
    saveData(STORAGE_KEYS.tasks, tasks);
    renderTasks();
    showToast(t("toast_task_deleted"), t("undo_label"), () => {
      if (removed) tasks.push(removed);
      saveData(STORAGE_KEYS.tasks, tasks);
      renderTasks();
    });
  }
});


// ---------- backup / restore / reset ----------
const ALL_DATA_KEYS = Object.values(STORAGE_KEYS);

document.getElementById("exportDataBtn").addEventListener("click", () => {
  const payload = {};
  ALL_DATA_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) payload[key] = JSON.parse(value);
  });
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `uni-schedule-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

const importDataInput = document.getElementById("importDataInput");
document.getElementById("importDataBtn").addEventListener("click", () => importDataInput.click());

importDataInput.addEventListener("change", () => {
  const file = importDataInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      ALL_DATA_KEYS.forEach((key) => {
        if (key in data) localStorage.setItem(key, JSON.stringify(data[key]));
      });
      showToast(t("import_success"));
      setTimeout(() => location.reload(), 900);
    } catch {
      alert(t("import_failed"));
    }
  };
  reader.readAsText(file);
  importDataInput.value = "";
});

document.getElementById("resetDataBtn").addEventListener("click", () => {
  if (!confirm(t("reset_confirm"))) return;
  ALL_DATA_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("uni_schedule_theme");
  localStorage.removeItem("uni_schedule_accent");
  localStorage.removeItem("uni_schedule_lang");
  location.reload();
});

// ---------- install prompt ----------
let deferredInstallPrompt = null;
const installBanner = document.getElementById("installBanner");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (localStorage.getItem("uni_schedule_install_dismissed") !== "true") {
    installBanner.classList.remove("hidden");
  }
});

document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installBanner.classList.add("hidden");
});

document.getElementById("dismissInstallBtn").addEventListener("click", () => {
  installBanner.classList.add("hidden");
  localStorage.setItem("uni_schedule_install_dismissed", "true");
});

window.addEventListener("appinstalled", () => {
  installBanner.classList.add("hidden");
});

const reminderOffsetSelect = document.getElementById("reminderOffset");
const notifyBtn = document.getElementById("notifyBtn");

function initSettings() {
  const savedOffset = localStorage.getItem(STORAGE_KEYS.reminderOffset);
  if (savedOffset !== null) reminderOffsetSelect.value = savedOffset;

  const examNotifyEnabled = localStorage.getItem(STORAGE_KEYS.examNotifyEnabled) === "true";
  notifyBtn.textContent = examNotifyEnabled ? t("notification_enabled") : t("notification_disabled");
  notifyBtn.classList.toggle("on", examNotifyEnabled);
}

reminderOffsetSelect.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.reminderOffset, reminderOffsetSelect.value);
});

function requestNotifications() {
  if (!("Notification" in window)) { alert(t("no_notification_support")); return; }
  Notification.requestPermission().then((permission) => {
    const granted = permission === "granted";
    localStorage.setItem(STORAGE_KEYS.examNotifyEnabled, String(granted));
    notifyBtn.textContent = granted ? t("notification_enabled") : t("notification_disabled");
    notifyBtn.classList.toggle("on", granted);
    if (!granted) alert(t("notification_denied"));
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
      sendNotification(t("exam_reminder_title"), t("exam_reminder_day", exam.courseName, exam.type));
      notifiedMap[dayKey] = true;
    }
    if (now >= twoHoursBefore && !notifiedMap[twoHourKey]) {
      sendNotification(t("exam_reminder_title"), t("exam_reminder_2h", exam.courseName, exam.type));
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
      sendNotification(t("lecture_reminder_title"), t("lecture_reminder_body", course.name, course.start, course.location));
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
initAccent();
initSettings();
applyLanguage(currentLang());
checkExamNotifications();
checkLectureNotifications();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => console.warn("SW registration failed:", err));
  });
}
