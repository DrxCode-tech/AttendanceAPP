import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// DOM elements
const loginButton = document.getElementById('loginForm');
const RegNM = document.getElementById('regNm');
const Department = document.getElementById('department');
const Email = document.getElementById('email');
const Password = document.getElementById('passwordInput');
const spin = document.querySelector('.spinner-container');
const messager = document.querySelector('.messager');

let inter;
function statusDisplay(state, txt) {
  clearTimeout(inter);
  messager.innerHTML = '';
  messager.style.top = '10px';
  messager.style.color = state ? 'lightgreen' : 'red';
  messager.innerHTML = txt;
  inter = setTimeout(() => {
    messager.style.top = '-100%';
  }, 5000);
}

document.addEventListener('DOMContentLoaded',()=>{
  const passwordInput = document.getElementById('passwordInput');
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
})

// Format reg number
function standardizeRegNumber(regNumber) {
  const separators = [',', '-', ':', '_', ' ', ';', '|', ')', '(', '[', ']', '..'];
  const pattern = new RegExp(separators.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return regNumber.replace(pattern, '/').replace(/\/+/g, '/');
}

// IndexedDB storage
/*function storeUser(user) {
  const request = indexedDB.open("adexDB", 1);

  request.onupgradeneeded = event => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("users")) {
      db.createObjectStore("users");
    }
  };

  request.onsuccess = event => {
    const db = event.target.result;
    const tx = db.transaction("users", "readwrite");
    tx.objectStore("users").put(user, "currentUser");

    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      statusDisplay(false, "Failed to store user.");
      db.close();
    };
  };

  request.onerror = event => {
    statusDisplay(false, `IndexedDB error: ${event.target.error}`);
  };
}*/

// Correct user lookup
async function findUserInFirestore(uid, dept) {
  const levels = ['user_100', 'user_200', 'user_300', 'user_400', 'user_500'];

  for (const level of levels) {
    try {
      const q = collection(db, level, 'department', dept);
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.uid === uid) {
          return { ...data, level, Dept: dept };
        }
      }
    } catch (err) {
      statusDisplay(false, `Error checking ${level}: ${err.message}`);
    }
  }

  return false;
}

function clearUserData() {
  const request = indexedDB.open('adexDBusers', 1);
  request.onsuccess = function (event) {
    const db = event.target.result;
    if (db.objectStoreNames.contains('users')) {
      const tx = db.transaction('users', 'readwrite');
      tx.objectStore('users').clear();
      tx.oncomplete = () => db.close();
      console.log('Old user cleared');
    }
  };
}
//function for adding current user to database...
function addUserToIndexedDB(userObj) {
  const request = indexedDB.open('adexDBusers', 1);
  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('users')) {
      db.createObjectStore('users');
    }
  };
  request.onsuccess = function (event) {
    const db = event.target.result;
    const tx = db.transaction('users', 'readwrite');
    tx.objectStore('users').put(userObj,'currentUser');
    tx.oncomplete = () => db.close();
    console.log('New user added');
  };
}

//network function
async function isReallyOnline() {
  try {
    const response = await fetch("https://www.gstatic.com/generate_204", {
      method: "GET",
      cache: "no-cache",
      mode: "no-cors"
    });
    // If fetch does not throw, assume online
    return true;
  } catch (err) {
    return false;
  }
}

// Form submission
loginButton.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  //checking connection to internet
  const connection = await isReallyOnline();
  if(!connection) return statusDisplay(false,'You don\'t have an internet connection!');
  
  spin.style.display = 'block';
  const department = Department.value.trim();
  const regNm = standardizeRegNumber(RegNM.value.trim());
  const email = Email.value.trim();
  const password = Password.value.trim();

  if (!regNm || !department || !email || !password) {
    spin.style.display = 'none';
    return statusDisplay(false, "All fields are required.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = await findUserInFirestore(user.uid, department);

    if (!userData) {
      spin.style.display = 'none';
      statusDisplay(false, 'User not found. Please sign up.');
      return window.location.href = 'index.html';
    }

    if (userData.email === email && userData.regNm === regNm) {
      clearUserData(); // clear previous user
      addUserToIndexedDB(userData); // add current user
      //storeUser(userData) your existing backup store (if needed)

      spin.style.display = 'none';
      statusDisplay(true, 'Login successful!');
      setTimeout(() => window.location.href = 'V2ADEX.html', 1000);
    }else {
      spin.style.display = 'none';
      statusDisplay(false, 'Credentials do not match our records.');
      setTimeout(() => window.location.href = 'index.html', 1500);
    }
  } catch (err) {
    spin.style.display = 'none';
    statusDisplay(false, `Login failed: ${err.message}`);
  }
});

const footer = document.querySelector('.footer');
footer.addEventListener('click',()=>{
  clearUserData();
  window.location.href = 'index.html';
})
