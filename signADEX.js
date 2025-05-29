import { db , auth } from "./firebaseConfig.js";
import {
  query,
  getDocs,
  addDoc,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Initialization of inputs
const signUpButton = document.getElementById('signupForm');
const Name = document.getElementById('name');
const RegNM = document.getElementById('regNumber');
const Department = document.getElementById('department');
const Level = document.getElementById('level');
const Email = document.getElementById('email');
const Password = document.getElementById('password');

// Messaging route
const message = document.getElementById('statusMessage');
const spinner = document.querySelector('.spinner-container');

// Status function
let inter;
function statusDisplay(state, txt) {
  clearTimeout(inter);
  message.innerHTML = txt;
  message.style.color = state ? 'green' : 'red';
  inter = setTimeout(() => {
    message.innerHTML = '';
  }, 7000);
}

// Ensure DB and store exist, then check if user exists
function initAndCheckUser(callback) {
  const request = indexedDB.open("adexDBusers", 1);

  request.onupgradeneeded = function(event) {
    const db = event.target.result;

    // Create "users" store if it doesn't exist
    if (!db.objectStoreNames.contains("users")) {
      db.createObjectStore("users"); // Manual key needed
    }
  };

  request.onsuccess = function(event) {
    const db = event.target.result;

    // Now safe to check if user exists
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");

    const getRequest = store.get("currentUser");
    getRequest.onsuccess = function() {
      if (getRequest.result) {
        console.log("User found in IndexedDB.");
        callback(true);
      } else {
        console.log("No user found.");
        callback(false);
      }
      db.close();
    };

    getRequest.onerror = function() {
      console.error("Error reading from IndexedDB.");
      callback(false);
      db.close();
    };
  };

  request.onerror = function(event) {
    console.error("IndexedDB open error:", event.target.error);
    callback(false);
  };
}

// Store user data under key "currentUser"
function storeUser(user) {
  const request = indexedDB.open("adexDBusers", 1);

  request.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("users")) {
      db.createObjectStore("users");
    }
  };

  request.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");

    store.put(user, "currentUser");

    tx.oncomplete = function () {
      console.log("User stored successfully.");
      db.close();
    };

    tx.onerror = function() {
      console.error("Failed to store user.");
      db.close();
    };
  };

  request.onerror = function(event) {
    console.error("IndexedDB error while storing:", event.target.error);
  };
}

// Checking regNum - standardize format
function standardizeRegNumber(regNumber) {
  // Prioritize longer separators first to avoid partial matches
  const separators = [
      '),', ')-', ')(', '].[',  // Multi-character separators first
      ',', '-', ':', '_', ' ', ';', '|', ')', '(', '[', ']',  // Single-character
      '..'  // Only treat double-dots as separator, not single dots
  ];
  
  // Create regex pattern that matches any separator
  const separatorPattern = new RegExp(
      separators.map(sep => escapeRegExp(sep)).join('|'),
      'g'
  );
  
  // First pass: replace known separators
  let result = regNumber.replace(separatorPattern, '/');
  
  // Second pass: clean up any resulting duplicate slashes
  result = result.replace(/\/+/g, '/');
  
  return result;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check level validity
function checkLevel(value) {
  const validValues = ['100', '200', '300', '400', '500'];
  return validValues.includes(value);
}

// Check strong password criteria
function isStrongPassword(password) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSymbol;
}

// Checking if user exists on DB
async function checkUser(regNm, level, dept) {
  const collect = collection(db, `user_${level}`, 'department', dept);
  const snapUserData = await getDocs(collect);
  return snapUserData.docs.some(doc => {
    const docm = doc.data();
    return standardizeRegNumber(docm.regNm).trim().toLowerCase() === regNm.trim().toLowerCase();
  });
}

// Verify existing user and redirect
async function verifyAndOpen(regNm, level, dept) {
  const collect = collection(db, `user_${level}`, 'department', dept);
  try {
    const snapUserData = await getDocs(collect);
    const docum = snapUserData.docs.find(doc => standardizeRegNumber(doc.data().regNm) === regNm);
    if (docum) {
      const userDt = docum.data();
      const newUser = {
        uid: userDt.uid,
        name: userDt.name,
        regNm: userDt.regNm,
        email: userDt.email,
        dept: userDt.dept,
        date: userDt.date,
      };
      storeUser(newUser);
      spinner.style.display = 'none';
      statusDisplay(true, "Welcome back!");
      window.location.href = "V2ADEX.html";
    }
  } catch (err) {
    console.log('Error message: ' + err);
    spinner.style.display = 'none';
  }
}

// Sign up new user and store in Firebase & IndexedDB
async function signUpUser(fullName, email, password, level, dept, regNm) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const newUser = {
      uid: user.uid,
      name: fullName,
      regNm: regNm,
      email: email,
      dept: dept,
      date: new Date().toISOString(),
    };
    const collect = collection(db, `user_${level}`, 'department', dept);
    await addDoc(collect, newUser);
    storeUser(newUser);
    spinner.style.display = 'none';
    statusDisplay(true, 'User signed up successfully');
    window.location.href = "V2ADEX.html";
  } catch (error) {
    spinner.style.display = 'none';
    if (error.code === "auth/email-already-in-use") {
      statusDisplay(false, "Email already registered.");
    } else {
      statusDisplay(false, "Sign-up failed: " + error.message);
      console.error("Signup failed:", error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAndCheckUser(function(userExists) {
    if (userExists) {
      document.querySelector('.spinner-container1').style.display = 'flex';
      console.log("User already logged in.");
      setTimeout(() => {
        window.location.href = "V2ADEX.html"; // redirect after 1.5 sec
      }, 1500);
    } else {
      console.log("No user found.");
    }
  });
  
  //toogle eye password
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const eyeOpen = document.getElementById('eyeOpen');
  const eyeClosed = document.getElementById('eyeClosed');
  eyeOpen.style.display = 'none';
  togglePassword.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    eyeOpen.style.display = isHidden ? 'inline' : 'none';
    eyeClosed.style.display = isHidden ? 'none' : 'inline';
  });
});

// Form submission mechanism
signUpButton.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if(!navigator.onLine) return statusDisplay(false,'You are currently offline');
  
  const name = Name.value.trim();
  const regNm = standardizeRegNumber(RegNM.value.trim());
  const department = Department.value.trim();
  const email = Email.value.trim();
  const levelInput = Level.value.trim();
  const passwordInput = Password.value.trim();

  // Basic empty field check
  if (!name || !regNm || !department || !email || !levelInput || !passwordInput) {
    return statusDisplay(false, "All fields are required.");
  }

  if (!checkLevel(levelInput)) {
    return statusDisplay(false, 'Level value is not valid');
  }

  if (!isStrongPassword(passwordInput)) {
    let text = `
      <p>Password must have:</p>
      <ul>
        <li>at least one Uppercase</li>
        <li>at least one Lowercase</li>
        <li>at least one Number</li>
        <li>at least one Symbol</li>
      </ul>
    `;
    return statusDisplay(false, text);
  }

  spinner.style.display = 'block';

  // Check if user already exists
  const userPresence = await checkUser(regNm, levelInput, department);
  if (userPresence) {
    await verifyAndOpen(regNm, levelInput, department);
    return;
  }

  await signUpUser(name, email, passwordInput, levelInput, department, regNm);
})
