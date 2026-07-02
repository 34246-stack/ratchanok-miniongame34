//intro Canvas
/*const canvas  = document.getElementById('board');
const context = board.getContext('2d');

//console.log(context);
/*const myImage = new Image();
myImage.src = "Main/main.png";
myImage.onload  = function (){
    context.drawImage(myImage,10,30,110,120);
}  */

//เริ่มเกมโว้ย

//หน้าจอ
let board;
let boardWidth =800;
let boardHeight =300;
let context;

//ตั้งค่ามินเนี่ยน
let playerWidth = 60;
let playerHeight = 100;
let playerX =50;
let playerY  =  boardHeight - playerHeight;
let playerImg;
let player ={
    x:playerX,
    y:playerY,
    width:playerWidth,
    height:playerHeight,
}
let gameOver = false;
let gameStarted = false;
let score =0;
let bananasCollected = 0; 
let time =0;

let boxImg;
let boxWidth = 60;
let boxHeight = 70;
let boxX = 700;
let boxY = boardHeight - boxHeight;
let boxesArray = [];
let boxSpeed = -3; 

//  ระบบกล้วย 
let bananaImg;
let bananaWidth = 40;
let bananaHeight = 50;
let bananaArray = [];
let bananaSpeed = -3; 

//ระบบพื้นหลังเลื่อน 
let bgImg;
let bgX = 0;
let bgSpeed = -1; 

//เเรงโหทถ่วง เหยียบพื้น
let velocityY = 0;
let gravity = 0.28; 

//  ระบบชีวิต (บันทึกข้ามการล่วงลับ
if (!sessionStorage.getItem("playerLives")) {
    sessionStorage.setItem("playerLives", "3");
}
let lives = parseInt(sessionStorage.getItem("playerLives"));


//  เสียงประกอบ 
let bgMusic = new Audio("1-01. Main Menu.mp3"); 
bgMusic.loop = true;
bgMusic.preload = "auto";

let jumpSound = new Audio("minions-cry.mp3");   
jumpSound.preload = "auto";

let hitSound = new Audio("sound-effect-minions-what.mp3");     
hitSound.preload = "auto";
let spawnTimeout; // 
console.log(player);

window.onload  = function(){

// พรีโหลดทรัพยากรภาพไว้ก่อน แต่ยังไม่เริ่มเกมจนกว่าจะกดปุ่ม
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d');

    bgImg = new Image();
    bgImg.src = "Despicable_me_2013102544941.JPG.webp";

    playerImg = new Image();
    playerImg.src = "main.png";

    boxImg = new Image();
    boxImg.src = "wee.png";  
    
    bananaImg = new Image();
    bananaImg.src = "banana.png"; 
}
// ฟังก์ชันเปิดระบบเกมเมื่อกดปุ่ม Start Game
function startGame() {
    if (lives <= 0) {
        alert("คุณหมดสิทธิ์เล่นแล้ว! กรุณาเปิดไฟล์ใหม่ (ปิดแท็บแล้วเปิดใหม่) เพื่อรีเซ็ตชีวิต");
        return; 
    }

    gameStarted = true;
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    bgMusic.load();
    jumpSound.load();
    hitSound.load();

    // เล่นเพลงพื้นหลัง
    bgMusic.play().catch(error => console.log("Audio playback failed:", error));

    // เริ่มระบบทำงานเกม
    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
    spawnRandomObject();
}

function spawnRandomObject() {
    if (gameOver || !gameStarted) return;

    let isBanana = Math.random() <= 0.35; 
    if (isBanana) {
        createBanana();
    } else {
        createBox();
    }

    let minTime = isBanana ? 1800 : 1200;
    let maxTime = isBanana ? 3000 : 2500;

  let randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    spawnTimeout = setTimeout(spawnRandomObject, randomTime);
}
function createBanana() {
    if (gameOver) return;
    let bananaGroupSize = Math.floor(Math.random() * (5 - 3 + 1)) + 3; 

    let spacing = 60; 

    for (let i = 0; i < bananaGroupSize; i++) {
        let banana = {
            img: bananaImg,
            x: boxX + (i * spacing), 
            y: boardHeight - boxHeight - 90, 
            width: bananaWidth,
            height: bananaHeight
        };
    bananaArray.push(banana);
    }
}

function createBox() {
    if (gameOver) return;
    let box = {
        img: boxImg,
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
    }
    boxesArray.push(box);
}

function update() {
    if (gameOver) return; 

    requestAnimationFrame(update); 
    context.clearRect(0, 0, board.width, board.height); 
    
    velocityY += gravity;
    bgX += bgSpeed;
    if (bgX <= -boardWidth) bgX = 0;
    context.drawImage(bgImg, bgX, 0, boardWidth, boardHeight);
    context.drawImage(bgImg, bgX + boardWidth, 0, boardWidth, boardHeight);

    player.y = Math.min(player.y + velocityY, playerY);
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // วาดกล่องอุปสรรค
    for (let i = 0; i < boxesArray.length; i++) {
        let box = boxesArray[i];
        box.x += boxSpeed;
        context.drawImage(box.img, box.x, box.y, box.width, box.height);
        
        if (onCollision(player, box)) {
            endGameByHit(); 
            return;
        }
    }

    // วาดกล้วย
    for (let i = 0; i < bananaArray.length; i++) {
        let banana = bananaArray[i];
        banana.x += bananaSpeed;
        context.drawImage(banana.img, banana.x, banana.y, banana.width, banana.height);

        if (onCollision(player, banana)) {
            bananasCollected += 1; 
            score += 500; 
            bananaArray.splice(i, 1); 
            i--; 
        }
    }

    // นับคะแนนเวลาที่รอดชีวิต
    score++;

    // วาดกล่องฝั่งซ้าย (UI ข้อมูลผู้เล่น)
    context.fillStyle = "rgba(255, 255, 255, 0.75)"; 
    context.beginPath();
    context.roundRect(10, 10, 180, 85, 8); 
    context.fill();

    context.font = "normal bold 14px Arial";
    context.textAlign = "left";
    context.fillStyle = "#2c3e50"; 
    context.fillText("✨ Score: " + score, 20, 30);
    context.fillStyle = "#f39c12"; 
    context.fillText("🍌 Bananas: " + bananasCollected, 20, 52);
    context.fillStyle = "#e74c3c"; 
    context.fillText("❤️ Lives: " + lives, 20, 74);

    // (Time)
    time += 1/60; 
    context.fillStyle = "rgba(255, 255, 255, 0.75)";
    context.beginPath();
    context.roundRect(640, 10, 150, 40, 8);
    context.fill();

    context.font = "normal bold 14px Arial";
    context.textAlign = "right";
    context.fillStyle = "#2c3e50";
    context.fillText("⏱️ Time: " + (time.toFixed(2)) + "s", 775, 35);

    if (time >= 60) {
        endGameByTime();
    }
} 

function movePlayer(e) {
    if (gameOver) return;
    if (bgMusic.paused && gameStarted) {
        bgMusic.play().catch(error => console.log("Audio playback failed:", error));
    }
    if ((e.code == "Space" || e.code == "ArrowUp") && player.y == playerY) {
        velocityY = -11;
        jumpSound.play(); 
    }
}

function onCollision(obj1, obj2) {
    return obj1.x < (obj2.x + obj2.width) &&
           (obj1.x + obj1.width) > obj2.x &&
           obj1.y < (obj2.y + obj2.height) &&
           (obj1.y + obj1.height) > obj2.y;
}

function endGameByHit() {
    gameOver = true;
    clearTimeout(spawnTimeout); 
    bgMusic.pause();
    hitSound.play(); 

    lives -= 1;
    sessionStorage.setItem("playerLives", lives.toString());

    context.fillStyle = "rgba(0, 0, 0, 0.65)"; 
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.beginPath();
    context.roundRect(boardWidth / 2 - 250, boardHeight / 2 - 120, 500, 240, 15); 
    context.fill();

    context.font = "normal bold 32px Arial";
    context.textAlign = "center";
    context.fillStyle = "#e74c3c";
    context.fillText("💥 GAME OVER BRO 💥", boardWidth / 2, boardHeight / 2 - 70);
    
    context.font = "normal bold 18px Arial";
    context.fillStyle = "#2c3e50"; 
    context.fillText("📊 Score: " + score, boardWidth / 2, boardHeight / 2 - 25);
    context.fillText("🍌 Bananas Collected: " + bananasCollected, boardWidth / 2, boardHeight / 2);
    
    context.fillStyle = "#206eff"; 
    context.fillText("❤️ Remaining Lives: " + lives, boardWidth / 2, boardHeight / 2 + 30);

    if (lives <= 0) {
        context.font = "normal bold 15px Arial";
        context.fillStyle = "#c0392b"; 
        context.fillText("❌ คุณหมดชีวิตแล้วเสียใจด้วย โปรดเปิดแท็บใหม่เพื่อรีเซ็ต", boardWidth / 2, boardHeight / 2 + 75);
    } else {
        context.font = "normal bold 15px Arial";
        context.fillStyle = "#27ae60"; 
        context.fillText("🔄 กดปุ่ม Restart ด้านล่างเพื่อเล่นต่อ!", boardWidth / 2, boardHeight / 2 + 75);
    }
}

function endGameByTime() {
    gameOver = true;
    clearTimeout(spawnTimeout); 
    bgMusic.pause();

    context.fillStyle = "rgba(255, 255, 255, 0.4)";
    context.fillRect(0, 0, 800, 300);

    context.fillStyle = "rgba(46, 204, 113, 0.95)";
    context.beginPath();
    context.roundRect(170, 30, 460, 240, 15);
    context.fill();

    context.textAlign = "center";
    context.font = "normal bold 30px Arial";
    context.fillStyle = "#ffffff";
    context.fillText("🎉 VICTORY! 🎉", 400, 85);
    
    context.font = "normal bold 18px Arial";
    context.fillText("Total Score: " + score, 400, 130);
    context.fillText("🍌 Bananas Collected: " + bananasCollected, 400, 160);
    
    context.font = "normal 15px Arial";
    context.fillText("คุณรอดชีวิตและพามินเนี่ยนชนะเกมสำเร็จ!", 400, 210);
}

function restartGame() {
    if (lives <= 0) {
        alert("คุณไม่เหลือชีวิตในการเล่นแล้ว! กรุณาเปิดแท็บใหม่เพื่อเริ่มเล่น");
        return;
    }
    location.reload();
} 

//  ฟังก์ชันสร้างมินเนี่ยนวิ่งไขว้กัน 2 ตัวที่พื้นหลังสีน้ำเงิน
function createBlueBgMinions() {
    const container = document.getElementById("blue-bg-minions");
    if (!container) return;

    const minionCount = 2; 

    for (let i = 0; i < minionCount; i++) {
        const minion = document.createElement("div");
        minion.classList.add("outer-minion");

        if (i === 0) {
            minion.classList.add("minion-type-1");
        } else {
            minion.classList.add("minion-type-2");
        }

        // กำหนดทิศทาง
        const direction = i === 0 ? "run-right" : "run-left";
        minion.classList.add(direction);

        // ตัวแรกอยู่โซนบนจอ ตัวที่สองอยู่โซนล่างจอ
        const randomTop = i === 0 
            ? Math.floor(Math.random() * 10) + 15   
            : Math.floor(Math.random() * 15) + 65; 
        minion.style.top = randomTop + "vh";

        // สุ่มความเร็วในการวิ่ง 
        const randomDuration = Math.random() * 2 + 5;
        minion.style.animationDuration = randomDuration + "s";

        // สุ่มดีเลย์เพื่อให้ตำแหน่งเริ่มต้นกระจายตัวอย่างเป็นธรรมชาติ
        const randomDelay = Math.random() * 10;
        minion.style.animationDelay = "-" + randomDelay + "s"; 

        container.appendChild(minion);
    }
}

window.addEventListener("DOMContentLoaded", createBlueBgMinions);