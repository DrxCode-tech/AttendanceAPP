import { db } from "./firebaseConfig.js";
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Function to add a user to Firestore
async function addUser(name, regNumber, department) {
  try {
    await addDoc(collection(db, "users"), {
      name,
      regNumber,
      department,
      timestamp: new Date()
    });
    alert("User added successfully!");
    window.location.href = 'Attendance.html';
  } catch (error) {
    alert("Error adding user: " + error.message);
  }
}

// Function to check if a user exists before adding
async function checkAndAddUser(name, regNumber, department) {
  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where("regNumber", "==", regNumber));
    const querySnapshot = await getDocs(q);

    let userExists = false;
    querySnapshot.forEach((doc) => {
      if (doc.data().regNumber === regNumber) {
        userExists = true;
      }
    });

    if (userExists) {
      alert("User has already signed in!");
      window.location.href = 'Attendance.html';
    } else {
      displayDialogBox(name, regNumber, department);
    }
  } catch (error) {
    alert("Error checking user: " + error);
  }
}

// Input Fields
const inputs = document.querySelectorAll(".input-field");
const nameInput = inputs[0];
const departmentInput = inputs[1];
const regNoInput = inputs[2];
const levelInput = inputs[3];
const checkBox = document.getElementById('check-box');
const dialogBox = document.querySelector('.dialogBox');

// Display Navigation Bar
function displayNAV() {
  const navBar = document.querySelector(".nav-bar");
  if (navBar) {
    navBar.style.top = "0%";
  } else {
    console.error("Navbar element not found!");
  }
}

// Ensure the navigation loads properly
document.addEventListener("DOMContentLoaded", () => {
  displayNAV();
});

// Validate Inputs
async function checkInputs() {
  let warning = "";

  if (!nameInput.value) warning += "Enter full name.\n";
  if (!regNoInput.value) warning += "Enter registration number.\n";
  if (!levelInput.value || levelInput.value < 100 || levelInput.value > 500) warning += "Enter course level (100-500).\n";
  if (!checkBox.checked) warning += "Agree to terms and conditions.\n";

  if (warning) {
    alert(warning);
  } else {
    await checkAndAddUser(nameInput.value, regNoInput.value, departmentInput.value);
  }
}

// Display Confirmation Dialog
function displayDialogBox(name, regNo, department) {
  document.getElementById('studentcheck-list').innerHTML = `
    <div>
      <p>Name: ${name}</p>
      <p>Reg No: ${regNo}</p>
      <p>Department: ${department}</p>
    </div>`;
  
  dialogBox.style.display = 'block';
  let timeLeft = 3;
  countdownInterval(timeLeft);
}

// Countdown Timer
function countdownInterval(timeLeft) {
  const countdownElem = document.getElementById('countdown');
  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      remove(dialogBox);
      submitUser();
    } else {
      timeLeft--;
      countdownElem.textContent = timeLeft;
    }
  }, 1000);

  document.querySelector('.dialog-cancleButton').addEventListener('click', () => {
    clearInterval(timer);
    remove(dialogBox);
  });
}

// Submit User Data
async function submitUser() {
  alert("Submitting form...");
  try {
    await addUser(nameInput.value, regNoInput.value, departmentInput.value);
  } catch (error) {
    alert("Error submitting user: " + error);
  }
}

// Remove Element
function remove(elem) {
  elem.style.display = "none";
}

// Sign In Button Click Event
document.querySelector('.sign-button').addEventListener('click', checkInputs);

// Side Navigation Controls
const listButton = document.querySelector('.list');
const cancelButton = document.querySelector('.cancle');

if (listButton && cancelButton) {
  listButton.addEventListener('click', () => {
    document.querySelector('.slide-show').style.width = '300px';
  });
  cancelButton.addEventListener('click', () => {
    document.querySelector('.slide-show').style.width = '0px';
  });
} else {
  console.error("Slide show elements not found!");
}

// Toggle FAQ Sections
const toggles = document.querySelectorAll('.toogle');
const contents = document.querySelectorAll('.content');

toggles.forEach((toggle, i) => {
  toggle.addEventListener('click', () => {
    contents[i].style.height = contents[i].style.height === '0px' ? contents[i].scrollHeight + 'px' : '0px';
  });
});
