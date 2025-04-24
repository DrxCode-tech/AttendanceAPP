// --- Firebase Setup ---
import { db } from "./firebaseConfig.js";
import {
  query,
  where,
  getDocs,
  addDoc,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const userRef = collection(db, "users");

// --- DOM Elements ---
const submitButton = document.querySelector(".submit-button");
const indicator = document.getElementById("indicator");
const userInput = document.querySelectorAll(".input-field");
const userName = userInput[0];
const userReg = userInput[1];
const currentCourseDisplay = document.querySelector('.classDisplay');

buttonState(false);

// --- Button State Control ---
function buttonState(disabled) {
  submitButton.disabled = disabled;
  submitButton.style.background = disabled ? "gray" : "green";
  indicator.style.background = disabled ? "white" : "green";
}

// --- User Verification ---
async function checkAndAddUser(name, regNumber, courseName) {
  try {
    const q = query(userRef, where("regNumber", "==", regNumber));
    const querySnapshot = await getDocs(q);
    const userExists = !querySnapshot.empty;

    if (userExists) {
      submitAttendance(name, regNumber, courseName);
    } else {
      alert(`${name}, you have not signed in!`);
      window.location.href = 'signUP.html';
    }
  } catch (error) {
    alert("Error checking user: " + error);
  }
}

// --- Submit Attendance ---
const now = new Date();

async function submitAttendance(name, regNumber, courseName) {
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const collectionName = `${courseName}_${formattedDate}`;
  const attendanceCollection = collection(db, collectionName);

  try {
    await addDoc(attendanceCollection, {
      name,
      regNumber,
      course: courseName,
      timestamp: now
    });
    alert(`Attendance successfully submitted for ${courseName}!`);
  } catch (error) {
    alert("Failed to submit attendance.");
  }
}

// --- Assign Course by Time ---
function changeCourse(startHour, endHour, courseName) {
  const currentHour = new Date().getHours();
  if (currentHour >= startHour && currentHour < endHour) {
    if (currentCourseDisplay) currentCourseDisplay.textContent = courseName;
    buttonState(false)
    return courseName;
  } else {
    buttonState(true);
    return;
  }
}

// --- Validate & Submit ---
function checkInputs() {
  if (!navigator.onLine) return alert('You are offline!');
  if (submitButton.disabled) return alert("Attendance submission is not allowed at this time.");
  if (!userName.value.trim() || !userReg.value.trim()) return alert("Please enter name and registration number.");
  if (!currentCourseDisplay || !currentCourseDisplay.textContent) return alert("Course not found.");

  const name = userName.value.trim();
  const regNumber = userReg.value.trim();
  const courseName = currentCourseDisplay.textContent;

  checkAndAddUser(name, regNumber, courseName);
}

// --- Time-based Attendance Activation ---
function checkAttendanceState() {
  const day = new Date().getDay();
  const hour = new Date().getHours();
  buttonState(true);

  switch (day) {
    case 1: // Monday
      if (hour >= 1 && hour < 10) changeCourse(1, 10, "PHY111");
      else if (hour >= 10 && hour < 12) changeCourse(10, 12, "PHY117");
      else if (hour >= 13 && hour < 24) changeCourse(13, 24, "GST111");
      break;
    case 2: // Tuesday
      if (hour >= 10 && hour < 12) changeCourse(10, 12, "PHY117");
      else if (hour >= 15 && hour < 17) changeCourse(15, 17, "PHY117");
      break;
    case 3: // Wednesday
      if (hour >= 8 && hour < 10) return;
      break;
    case 4: // Thursday
      if (hour >= 10 && hour < 17) changeCourse(10, 17, "PHY111");
      else if (hour >= 17 && hour < 20) return;
      break;
    case 5: // Friday
      if (hour >= 0 && hour < 10) changeCourse(0, 10, "PHY111");
      else if (hour >= 10 && hour < 12) changeCourse(10, 12, "PHY117");
      else if (hour >= 12 && hour < 24) changeCourse(12, 24, "PHY117");
      break;
  }
}

// --- Signature Canvas ---
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 300;
  canvas.height = 100;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  let drawing = false;

  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    drawing = true;
    const pos = getTouchPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  canvas.addEventListener("touchmove", (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });

  canvas.addEventListener("touchend", () => drawing = false);

  const clearBtn = document.getElementById("clearCanvasBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));
  }
});

// --- Real-time Attendance Toggle ---
let toggleState = true;

function toggleRealTimePage(state) {
  const attendanceDiv = document.querySelector('.class-attendance');
  if (attendanceDiv) {
    attendanceDiv.style.transform = state ? 'translateY(-100%)' : 'translateY(0%)';
  }
}

document.querySelector('.profile').addEventListener('click', () => {
  toggleRealTimePage(toggleState);
  toggleState = !toggleState;
});

// --- Real-time Attendance Display ---
function updateAttendanceDisplay() {
  const attdDisplay = document.querySelector('.class-attendance');
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const courseName = currentCourseDisplay.textContent;
  const collectionName = `${courseName}_${formattedDate}`;
  const attendanceCollection = collection(db, collectionName);

  if (!attdDisplay) {
    console.error("classDisplay element not found!");
    return;
  }

  onSnapshot(attendanceCollection, (snapshot) => {
    let html = `<h2>Current Attendance for ${courseName}</h2><ul>`;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const time = new Date(data.timestamp.seconds * 1000).toLocaleString();
      html += `<li>${data.name} (${data.regNumber}) - ${data.course} at ${time}</li>`;
    });
    html += '</ul>';
    attdDisplay.innerHTML = html;
  }, (error) => {
    console.error("Error fetching attendance records:", error);
    document.querySelector('.list-title').innerHTML = "<p>Error loading attendance data.</p>";
  });
}

// --- Initialize on Load ---
document.addEventListener("DOMContentLoaded", () => {
  checkAttendanceState();
  updateAttendanceDisplay();
  const navBar = document.querySelector(".nav-bar");
  if (navBar) navBar.style.top = "0%";
});

submitButton.addEventListener("pointerdown", checkInputs);
