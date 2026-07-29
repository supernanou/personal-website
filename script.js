const windows = [...document.querySelectorAll(".app-window")];
const openButtons = [...document.querySelectorAll("[data-open]")];
const taskItems = document.getElementById("task-items");
const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const toast = document.getElementById("toast");
const clock = document.getElementById("clock");
const startup = document.getElementById("startup");
const soundToggle = document.getElementById("sound-toggle");
let topZ = 100;
let soundEnabled = false;

window.addEventListener("load", () => {
  setTimeout(() => startup.classList.add("hidden"), 1700);
  updateClock();
  setInterval(updateClock, 1000);
});

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getWindow(id) {
  return document.getElementById(id);
}

function bringToFront(win) {
  topZ += 1;
  windows.forEach(item => item.classList.remove("active"));
  document.querySelectorAll(".task-item").forEach(item => item.classList.remove("active"));

  win.style.zIndex = topZ;
  win.classList.add("active");

  const task = document.querySelector(`.task-item[data-window="${win.id}"]`);
  if (task) task.classList.add("active");
}

function openWindow(id) {
  const win = getWindow(id);
  if (!win) return;

  win.classList.add("open");
  win.classList.remove("minimized");
  bringToFront(win);
  createTaskItem(win);
  closeStartMenu();
  playClick();
}

function closeWindow(win) {
  win.classList.remove("open", "active", "maximized");
  const task = document.querySelector(`.task-item[data-window="${win.id}"]`);
  if (task) task.remove();
  playClick();
}

function minimizeWindow(win) {
  win.classList.remove("open", "active");
  const task = document.querySelector(`.task-item[data-window="${win.id}"]`);
  if (task) task.classList.remove("active");
  playClick();
}

function toggleMaximize(win) {
  win.classList.toggle("maximized");
  bringToFront(win);
  playClick();
}

function createTaskItem(win) {
  if (document.querySelector(`.task-item[data-window="${win.id}"]`)) return;

  const button = document.createElement("button");
  button.className = "task-item active";
  button.dataset.window = win.id;
  button.textContent = win.dataset.title || win.id;

  button.addEventListener("click", () => {
    if (win.classList.contains("open") && win.classList.contains("active")) {
      minimizeWindow(win);
    } else {
      win.classList.add("open");
      bringToFront(win);
    }
  });

  taskItems.appendChild(button);
}

openButtons.forEach(button => {
  button.addEventListener("click", () => openWindow(button.dataset.open));
});

windows.forEach(win => {
  const header = win.querySelector(".window-header");
  const close = win.querySelector(".close");
  const minimize = win.querySelector(".minimize");
  const maximize = win.querySelector(".maximize");

  close.addEventListener("click", () => closeWindow(win));
  minimize.addEventListener("click", () => minimizeWindow(win));
  maximize.addEventListener("click", () => toggleMaximize(win));

  win.addEventListener("mousedown", () => bringToFront(win));

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", event => {
    if (event.target.closest("button") || win.classList.contains("maximized") || window.innerWidth <= 760) return;

    dragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    bringToFront(win);
  });

  document.addEventListener("mousemove", event => {
    if (!dragging) return;

    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight - 42;

    win.style.left = `${Math.max(0, Math.min(event.clientX - offsetX, maxX))}px`;
    win.style.top = `${Math.max(38, Math.min(event.clientY - offsetY, maxY))}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
});

function toggleStartMenu() {
  const isOpen = startMenu.classList.toggle("open");
  startMenu.setAttribute("aria-hidden", String(!isOpen));
  startButton.setAttribute("aria-expanded", String(isOpen));
  startButton.classList.toggle("active", isOpen);
  playClick();
}

function closeStartMenu() {
  startMenu.classList.remove("open");
  startMenu.setAttribute("aria-hidden", "true");
  startButton.setAttribute("aria-expanded", "false");
  startButton.classList.remove("active");
}

startButton.addEventListener("click", event => {
  event.stopPropagation();
  toggleStartMenu();
});

document.addEventListener("click", event => {
  if (!event.target.closest("#start-menu") && !event.target.closest("#start-button")) {
    closeStartMenu();
  }
});

document.getElementById("restart-button").addEventListener("click", () => {
  closeStartMenu();
  windows.forEach(closeWindow);
  startup.classList.remove("hidden");
  setTimeout(() => startup.classList.add("hidden"), 1700);
  showToast("Antonia OS restarted successfully.");
});

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "♫" : "♩";
  showToast(soundEnabled ? "Interface sounds enabled." : "Interface sounds muted.");
  if (soundEnabled) playTone(520, 0.07);
});

function playClick() {
  if (soundEnabled) playTone(420, 0.035);
}

function playTone(frequency, duration) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = "square";
  gain.gain.value = 0.025;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

document.getElementById("confetti-button").addEventListener("click", () => {
  const container = document.getElementById("confetti");
  container.innerHTML = "";

  for (let i = 0; i < 75; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--hue", Math.floor(Math.random() * 360));
    piece.style.setProperty("--duration", `${2.2 + Math.random() * 2.2}s`);
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    piece.style.animationDelay = `${Math.random() * 0.7}s`;
    container.appendChild(piece);
  }

  showToast("Achievement saved to your desktop!");
  setTimeout(() => { container.innerHTML = ""; }, 5200);
});

document.querySelectorAll(".desktop-icon").forEach(icon => {
  icon.addEventListener("click", () => {
    document.querySelectorAll(".desktop-icon").forEach(item => item.classList.remove("selected"));
    icon.classList.add("selected");
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const active = document.querySelector(".app-window.active");
    if (active) closeWindow(active);
    closeStartMenu();
  }
});
