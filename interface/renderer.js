let client = io.connect('http://localhost:3000')
let log = ''
let player = {x:0,y:0}
let otherplayer = {x:0,y:0}
let virtualplayer = {x:0,y:0} 
function setup(){
    createCanvas(windowWidth, windowHeight)
}

function draw(){
    clear()
    drawlogo()

    drawPlayers()
}

function drawlogo(){
    push()
    fill(255)
    textSize(25)
    textAlign(LEFT, TOP)
    stroke(0)
    strokeWeight(2)
    text('BRAWBOT DEMO' +player.x,25,75)
    fill('red')
    strokeWeight(1)
    textStyle(BOLD)
    textSize(15)
    text(log,25,105)
    pop()
}

client.on('connect',()=>{
    log = ''
})
client.on('log',(data)=>{
    log+=data+'\n'
})
client.on('player',(data)=>{
    player = data
})
client.on('otherplayer',(data)=>{
    otherplayer = data
})


function drawPlayers(){

    fill('rgba(0,255,0,0.2)')
    circle(player.x/3+260,player.y/3-140,65)
    fill('rgba(255,0,0,0.2)')
    circle(otherplayer.x/3+260,otherplayer.y/3-140,65)

    
    fill('rgba(0,255,0,1)')
    circle(player.x/3+260+player.velocityX*3,player.y/3-140,35)
}