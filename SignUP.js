//Sign In JavaScript programmes...

//initializing input fields...
const inputs = document.querySelectorAll(".input-field");
const name = inputs[0];
const RegNo = inputs[2];
const level = inputs[3];
const checkBox = document.getElementById('check-box');
let timeState = document.getElementById('countdown').textContent;
const dialogBox = document.querySelector('.dialogBox');

//initializing database terms...
const db = window.localStorage;
const database = JSON.parse(db.getItem('database'))|| new Map();

function displayNAV(){
  const navBar = document.querySelector(".nav-bar");
  navBar.style.top= "0%"
}

function checkInputs(a,b,c,d){
  let states = [a,b,c];
  let worning;
  states.forEach((inputspace,i)=>{
    if(!inputspace.value){
      if(i == 0){
        worning = 'Pls...,make sure to enter full name ';
      }
      else if(i == 1){
        worning += '...,make sure to enter registration number! ';
      }
      else if(i == 2){
        worning += "...,make sure to enter course level";
      }
    }
    else if(inputspace.value){
      if(i == 2 &&(inputspace.value < 100 || inputspace.value > 500)){
        worning += "...,make sure to enter course level between 100-500";
      }
    }
    
  });
  if(worning && !d.checked){
    alert(worning+' and pls...,agree to our terms and condition by clicking the box!!!');
  }
  else if(!d.checked){
    alert('pls...,agree to our terms and condition by clicking the box!!!');
  }
  else if(worning){
    alert(worning);
  }
  else{
    displayDialogBox(a, inputs[1], b, c);
  }

}

function displayDialogBox(a,k,b,c){
  
  document.getElementById('studentcheck-list').innerHTML = `<div><p>${a.value}</p><p>${k.value}</p><p>${b.value}</p><p>${c.value}</p></div>`;
  dialogBox.style.display ='block';
  timeState = 3;
  interval(timeState);
}
  
function interval(a){
  const interState = setInterval(()=>{
    if(a <= 0){
      remove(dialogBox);
      a = 3;
      clearInterval(interState);
      getPromise().then((data)=>{
        alert(data);
      }).catch((error)=>{
        alert(error);
      });
    }
    else{
      a--
      document.getElementById('countdown').textContent = a;
    }
  },1000)
  document.querySelector('.dialog-cancleButton').addEventListener('click',()=>{
    clearInterval(interState);
    remove(dialogBox);
  })
}

//submitting function...
function getPromise(){
  return new Promise((res,rej)=>{
    alert('Submitting form...');
    let state = true
    
    setTimeout(()=>{
      if(state){
        res(storageProgrammes(name,inputs[1],RegNo,level,alert));
      }
      else{
        rej('error...')
      }
    },2000)
    
  })
}

//function that displays the attendance list in page.html
function disAttendancePage(a){
  let data = [];
  database.forEach((value,key)=>{
    document.getElementById('demo-space').innerHTML+= `<li>${value}</li>`;
    data.push(value);
  });
 a(data);
}

//section for database systems and storage...
function storageProgrammes(a,b,c,d,e){
  let i = database.length;
  database.set(i,[a.value,b.value,c.value,d.value]);
  db.setItem('database',JSON.stringify(Array.from(database.entries())));
  e('Submitted successfully ✅️');
  disAttendancePage(alert);
}

//removing function p
function remove(elem){
  elem.style.display = "none";
}


//initializing button...
document.querySelector('.sign-button').addEventListener('click',()=>{
  checkInputs(name,RegNo,level,checkBox);
  document.getElementById('countdown').textContent = 3;
  
})

document.querySelector('.list').addEventListener('click',()=>{
  document.querySelector('.slide-show').style.width ='300px';
})
document.querySelector('.cancle').addEventListener('click',()=>{
  document.querySelector('.slide-show').style.width ='0px';
})

const toggleElems = document.querySelectorAll('.toogle');
const contentTogElems = document.querySelectorAll('.content');

toggleElems.forEach((toggle, i) => {
  toggle.addEventListener('click', () => {
    if (contentTogElems[i].style.height === '0px' || contentTogElems[i].style.height === '') {
      contentTogElems[i].style.height =
      contentTogElems[i].scrollHeight + 'px'; // Expand
    } else {
      contentTogElems[i].style.height = '0px'; // Collapse
    }
  });
});

