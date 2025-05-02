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



//beginning of the new code i added
//......Time system for button...
let courseName;
let endTime = 0;
const DB = window.localStorage;
let butSt = JSON.parse(DB.getItem('butSt')) || [false,endTime];

function checkBut(){
  const Day = new Date().getDay();
  if(Day === 0 || Day === 6){
    return;
  }else{
    if(submitButton.disabled){
      const currtTime = new Date().getHours();
      const differenceTime = butSt[1] - currtTime;
      if(differenceTime <= 0){
        butSt = [false,0];
        buttonState(butSt[0]);
        DB.setItem('butSt',JSON.stringify(butSt));
        checkAttendanceState();
        alert('A class is now active!');
        return;
      }
    }
  }
}

function changeMyState(timend){
  butSt = [true,timend];
  buttonState(butSt[0]);
  alert('You have successfully marked Attendance and button has been disabled till next class..Thank You!');
  DB.setItem('butSt',JSON.stringify(butSt));
}

// --- DOM Elements ---
const submitButton = document.querySelector(".submit-button");
const indicator = document.getElementById("indicator");
const userInput = document.querySelectorAll(".input-field");
const userName = userInput[0];
const userReg = userInput[1];
const currentCourseDisplay = document.querySelector('.classDisplay');

buttonState(butSt[0]);
let interval = setInterval(()=>{
  checkBut();
  checkAttendanceState();
},1000);
//....end of it...

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


function sanitizeName(str) {
  return str.replace(/[^\w\d-_]/g, ''); // Keep only letters, digits, underscores, and hyphens
}

async function submitAttendance(name, regNumber, courseName) {
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  
  // Sanitize course name before using it in collection name
  const safeCourseName = sanitizeName(courseName);
  const collectionName = `${safeCourseName}_${formattedDate}`;
  const attendanceCollection = collection(db, collectionName);

  try {
    await addDoc(attendanceCollection, {
      name,
      regNumber,
      course: courseName,
      timestamp: now
    });
    alert(`Attendance successfully submitted for ${courseName}!`);
    changeMyState(endTime); // Make sure endTime is defined elsewhere
  } catch (error) {
    console.error(error);
    alert("Failed to submit attendance.");
  }
}

// --- Assign Course by Time ---
function changeCourse(startHour, endHour, course) {
  const currentHour = new Date().getHours();
  endTime = endHour;
  if (currentHour >= startHour && currentHour < endHour) {
    if (currentCourseDisplay) currentCourseDisplay.textContent = course;
    courseName = course;
    return ;
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

  checkAndAddUser(name, regNumber, courseName);
}

// --- Time-based Attendance Activation ---00p1
function checkAttendanceState() {
  const day = new Date().getDay();
  const hour = new Date().getHours();
  

  switch (day) {
    case 1: // Monday
      if (hour >= 1 && hour < 10) changeCourse(1, 10, "PHY111");
      else if (hour >= 10 && hour < 12) changeCourse(10, 12, "PHY117");
      else if (hour >= 13 && hour < 16) changeCourse(13, 16, "GST111");
      else if (hour >= 16 && hour < 18) changeCourse(16, 18, "MTH111");
      break;
    case 2: // Tuesday
      if (hour >= 7 && hour < 12) changeCourse(7, 12, "PHY117");
      else if (hour >= 14 && hour < 17) changeCourse(14, 17, "PHY117");
      break;
    case 3: // Wednesday
      if (hour >= 7 && hour < 10) changeCourse(7, 10, "PHY117");;
      break;
    case 4: // Thursday
      if (hour >= 10 && hour < 12) changeCourse(10, 12, "PHY111");
      else if (hour >= 12 && hour < 18) changeCourse(12, 18, 'CPE113');
      break;
    case 5: // Friday
      if (hour >= 0 && hour < 10) changeCourse(0, 10, "PHY111");
      else if (hour >= 10 && hour < 12) changeCourse(10, 12, "PHY117");
      else if (hour >= 12 && hour < 15) changeCourse(12, 15, "PHY112");
      break;
    default :
      buttonState(true);
      alert('No classes today')
      clearInterval(interval);
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
  const now = new Date();
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
  
  submitButton.onclick = function(){
    console.log('clicked!')
    this.disabled ? alert('No class now!'): checkInputs()
  }
});


