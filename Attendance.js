
function displayNAV(){
  const navBar = document.querySelector(".nav-bar");
  navBar.style.top= "0%"
}

document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size
  canvas.width = 300;
  canvas.height = 100;

  // Set drawing style
  ctx.strokeStyle = "black"; // Pen color
  ctx.lineWidth = 3; // Pen thickness
  ctx.lineJoin = "round"; 
  ctx.lineCap = "round";

  let drawing = false;

  // Get touch position
  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }

  // Start drawing
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent page scrolling
    drawing = true;
    const pos = getTouchPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  // Continue drawing
  canvas.addEventListener("touchmove", (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });

  // Stop drawing
  canvas.addEventListener("touchend", () => {
    drawing = false;
  });

  // Clear canvas function
  document.getElementById("clearCanvasBtn").addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});

function toogleRealTimePage(){
  document.querySelector('.class-attendance').style.transform = 'translateY(-100%)';''
}
