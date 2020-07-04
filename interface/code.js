let client = io.connect('http://localhost:3000')
let log = ''
let player = ''
let otherplayer = ''
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
    try{
        circle(player.x/3+260,player.y/3-150,25)
    } catch(err){

    }
    
}