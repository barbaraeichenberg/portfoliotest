const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

let player = {
x:80,
y:220,
size:25,
vy:0,
jumping:false
}

let gravity = 0.6
let obstacles = []
let score = 0

function spawnObstacle(){

obstacles.push({
x:canvas.width,
size:40
})

}

setInterval(spawnObstacle,1500)

let jumpHeld = false

document.addEventListener("keydown",e=>{

if(e.code==="Space") jumpHeld=true

})

document.addEventListener("keyup",e=>{

if(e.code==="Space") jumpHeld=false

})

function update(){

score += 0.016

player.vy += gravity
player.y += player.vy

if(player.y>220){
player.y=220
player.vy=0
player.jumping=false
}

if(jumpHeld && !player.jumping){
player.vy = -12
player.jumping=true
}

for(let i=0;i<obstacles.length;i++){

obstacles[i].x -= 6

if(
player.x < obstacles[i].x + obstacles[i].size &&
player.x + player.size > obstacles[i].x &&
player.y < 260 &&
player.y + player.size > 260 - obstacles[i].size
){
alert("Game Over\nScore: "+Math.floor(score))
location.reload()
}

}

obstacles = obstacles.filter(o=>o.x>-50)

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="white"
ctx.fillRect(player.x,player.y,player.size,player.size)

ctx.fillStyle="white"

obstacles.forEach(o=>{
ctx.save()

ctx.translate(o.x,260-o.size/2)
ctx.rotate(Math.PI/4)

ctx.fillRect(-o.size/2,-o.size/2,o.size,o.size)

ctx.restore()

})

document.getElementById("score").innerText=Math.floor(score)

}

function gameLoop(){

update()
draw()

requestAnimationFrame(gameLoop)

}

gameLoop()
