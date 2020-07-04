var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let socket
io.on('connection', (sock) => {
    console.log('GUI INIT')
    socket = sock
    main()
});
http.listen(3000, () => {
    console.log('GUI Started!');
});
// setTimeout(()=>{
//     // 
// },1)

function main(){
    const memoryjs = require('memoryjs')
    const processName = 'Brawlhalla.exe'
    var child_process = require('child_process');
    var au = require('autoit');
    const { fstat } = require('fs');
    let direction = 'right'
    let inscript = false;
    au.Init();
    process = memoryjs.openProcess(processName);
    adobeModule = memoryjs.findModule("Adobe AIR.dll", process.th32ProcessID);
    baseModule = memoryjs.findModule("Brawlhalla.exe", process.th32ProcessID);
    function read(offset,type){
        return memoryjs.readMemory(process.handle,offset,type)
    }
    function hex(val){
        return val.toString('16')
    }
    function chain(args){
        let p1 = read(args[0],'pointer')
        let lp = undefined
        for(let i=1;i<args.length;i++){
            if(i==args.length-1){
                lp = p1+args[i]
            } else{
                p1 = read(p1+args[i],'pointer')
            }
        }
        return lp
    }
    function getThreadStack(){
        return chain([adobeModule.modBaseAddr+0x1331A74,0x4e0,0x4c,0x3c,0x698])
    }

    //Mathematics
    function distance(x1,y1,x2,y2){
        return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
    }
    function lindistance(x1,x2){
        return Math.abs(x2-x1)
    }
    function between(a,b,c){
        if(a>b&&a<c) return true; else return false;
    }
    function isAbout(a,b,accurracy,mode){
        switch(mode){
            case'middle':
                if(lindistance(a,b)<=accurracy){
                    return true;
                } else {
                    return false;
                }
                break;
            case'left':
                break;
            case'right':
                break;
        }

        
    }
    function execScript(script){
        if(!inscript){
            child_process.exec('python C:\\Users\\DimaXd\\Desktop\\brawbot\\brawbinder\\binder.py "' + require('fs').readFileSync(script,'utf8')+'" "'+player.direction+'"', function (err,data){
                inscript = false;
                console.log(data,err)
                au.ControlSend('Brawlhalla','','','{a UP}')
                au.ControlSend('Brawlhalla','','','{d UP}')
                au.ControlSend('Brawlhalla','','','{w UP}')
                au.ControlSend('Brawlhalla','','','{z UP}')
                au.ControlSend('Brawlhalla','','','{x UP}')
                au.ControlSend('Brawlhalla','','','{c UP}')
                au.ControlSend('Brawlhalla','','','{v UP}')
            });
        }
        
        inscript = true;
    }
    //Mathematics
    let keystate = require('asynckeystate')
    let otherplayer = {adress:undefined}
    function initEntities(){
        let divisor = 156327936
        let divisors = require('fs').readFileSync('divisors.txt','utf8').split(',').map(e=>parseInt(e))
        divisors.forEach((e,i)=>{
            if(read(player.adress+e+0x318,'double')==25){
                otherplayer.adress = player.adress+e
            } else if(read(player.adress-e+0x318,'double')==25) {
                otherplayer.adress = player.adress-e
            }
        })
        if(!otherplayer.adress){
            console.log('Unknown divisor, bruting...')
            var exec = require('child_process').execFile;
            exec('scrapper.exe',{maxBuffer: 4024 * 2500}, function(err, data) {
                entitiesDemo = data.toString().split(',').map((e)=>parseInt(e))   
                for(let i=0;i<entitiesDemo.length;i++){
    
                        if(read(entitiesDemo[i]+0x318,'double')==25){
                            if(entitiesDemo[i]!=player.adress){
                                otherplayer.adress = entitiesDemo[i]
                                break;
                            }
                        }

                }
                console.log('Registered divisor '+ Math.abs(player.adress-otherplayer.adress))
                divisors.push(Math.abs(player.adress-otherplayer.adress))
                require('fs').writeFileSync('divisors.txt',divisors.join(','))
                // console.log('OTHERPLAYER: '+hex(otherplayer.adress))
            })
        } else {
            console.log('OTHERPLAYER: '+hex(otherplayer.adress))
        }
    }

    let foundPlayer = false;
    let player = {adress:undefined,x:0,y:0,attack:0,inair:0,jumps:0,canAttack:true,return:false,gotodir:0,zed:false};
    let camera = {adress:undefined,x:0,y:0}
    let thread = undefined
    setInterval(()=>{
        if(keystate.getAsyncKeyState(0x12)){
            au.ControlSend('Brawlhalla','','','{a UP}')
            au.ControlSend('Brawlhalla','','','{d UP}')
            au.ControlSend('Brawlhalla','','','{w UP}')
            au.ControlSend('Brawlhalla','','','{z UP}')
            au.ControlSend('Brawlhalla','','','{x UP}')
            au.ControlSend('Brawlhalla','','','{c UP}')
            au.ControlSend('Brawlhalla','','','{v UP}')

            process.exit(0)
        }
        if(!foundPlayer){
            let threadtemp = getThreadStack()
            let playertemp = chain([threadtemp-0xD64,0xa4,0x84,0x230,0x284,0x90,0x4c,0])
            if(read(playertemp+0x318,'double')==25){
                console.log('THREADSTACK: '+hex(threadtemp))
                console.log('LOCALPLAYER: '+hex(playertemp))
                player.adress = playertemp
                thread = threadtemp;
                initEntities()
                foundPlayer = true;
                // socket.emit('log','THREADSTACK: '+hex(threadtemp))
                // socket.emit('log','LOCALPLAYER: '+hex(playertemp))
                
            }
        }

        if(otherplayer.adress&&foundPlayer){
            updatePlayer()
            updateOtherPlayer()
            updateMath()
            draw()
        }

    },5)

    // setInterval(()=>{
    //     socket.emit('player',player)
    //     socket.emit('otherplayer',otherplayer)
    //     socket.emit('world',world)

    // },25)
    function updatePlayer(){
        player['x'] = Math.round(read(player.adress+0x378,'double'))
        player['y'] = Math.round(read(player.adress+0x370,'double'))
        player['attack'] = Math.round(read(player.adress+0x88,'bool'))
        player['prepattack'] = Math.round(read(player.adress+0xa0,'bool'))
        player['hp'] = Math.round(read(player.adress+0x418,'double'))
        player['side'] = Math.round(read(player.adress+0x44,'bool'))
        player['inair'] = Math.round(read(player.adress+0xf4,'bool'))
        player['jumps'] = Math.round(read(player.adress+0x1A0,'int'))
        player['score'] = Math.round(read(player.adress+0x1F4,'int'))
        
    }
    function updateOtherPlayer(){
        otherplayer['x'] = Math.round(read(otherplayer.adress+0x378,'double'))
        otherplayer['y'] = Math.round(read(otherplayer.adress+0x370,'double'))
        otherplayer['hp'] = Math.round(read(otherplayer.adress+0x418,'double'))
        otherplayer['attack'] = Math.round(read(otherplayer.adress+0x88,'bool'))
        otherplayer['prepattack'] = Math.round(read(otherplayer.adress+0xa0,'bool'))
        otherplayer['inair'] = Math.round(read(otherplayer.adress+0xf4,'bool'))
        otherplayer['side'] = Math.round(read(otherplayer.adress+0x44,'bool'))
        otherplayer['jumps'] = Math.round(read(otherplayer.adress+0x1A0,'int'))
        otherplayer['score'] = Math.round(read(otherplayer.adress+0x1F4,'int'))
    }

    let world = {ground:{x:0,y:1000000}}
    var robot = require("robotjs");
    robot.setKeyboardDelay(1)
    let control = {
        send:(key,modifier)=>{
            // robot.keyToggle(key,modifier)
            au.ControlSend('Brawlhalla','','',`{${key} ${modifier}}`)
        } ,
        move:(state)=>{
            horizontalSend = 'none'
            switch(state){
                case 'left':
                    if(horizontalSend!='left'){
                        au.ControlSend('Brawlhalla','','','{a DOWN}')
                        au.ControlSend('Brawlhalla','','','{d UP}')
                        horizontalSend = 'left'
                    }   
                    
                    break;
                case 'right':
                    if(horizontalSend!='right'){
                        au.ControlSend('Brawlhalla','','','{d DOWN}')
                        au.ControlSend('Brawlhalla','','','{a UP}')
                        horizontalSend = 'right'
                    }   
                    break;
                case 'up':
                    break;
                case 'down':
                    break;
                case 'stop':
                    au.ControlSend('Brawlhalla','','','{a UP}')
                    au.ControlSend('Brawlhalla','','','{d UP}')
                    break;
            }
        }
    }
    let workerVelocities={playerX:0,playerY:0,otherplayerX:0,otherplayerY:0}

    function updateMath(){
        world['pDistanceX'] = lindistance(player.x,otherplayer.x) 
        world['pDistanceY'] = lindistance(player.y,otherplayer.y) 
        world['pAngle']= Math.round(Math.atan2(otherplayer.y-player.y,otherplayer.x-player.x)*(180/Math.PI))
        world['pDistance'] = Math.round(distance(player.x,player.y,otherplayer.x,otherplayer.y))
        if((player.x>otherplayer.x&&player.side==1)||(player.x<otherplayer.x&&player.side==0)){
            world['pSee'] = 1
        } else {
            world['pSee'] = 0
        }
        
        if(!player.inair){
            world['ground'] = {x:0,y:10000000}
            if(world.ground.y>player.y){
                world['ground']['y']=player.y
            }
            
            world['ground']['x']=player.x
        }
        player['velocityX'] = player.x-workerVelocities.playerX
        player.velocityX>0?player['direction'] = 'right':player.velocityX<0?player['direction']='left':0
        player['velocityY'] = player.y-workerVelocities.playerY
        player['velocity'] = Math.round(distance(workerVelocities.playerX,workerVelocities.playerY,player.x,player.y))
        otherplayer['velocityX'] = otherplayer.x-workerVelocities.otherplayerX
        otherplayer['velocityY'] = otherplayer.y-workerVelocities.otherplayerY
        otherplayer['velocity'] = Math.round(distance(workerVelocities.otherplayerX,workerVelocities.otherplayerY,otherplayer.x,otherplayer.y))
        workerVelocities={playerX:player.x,playerY:player.y,otherplayerX:otherplayer.x,otherplayerY:otherplayer.y}
    }

    let tick = 0;
    

    function endScript(name){

    }

    function draw(){
        tick++
        
        //Check if player is not outside bounds
        if(player.y>world.ground.y+10&&!player.return){

            if(player.x<world.ground.x){
                player.gotodir=0
            } else {
                player.gotodir=1
            }
            if(player.gotodir==0){
                // control.send('w','DOWN')
                control.send('d','DOWN')
                control.send('z','DOWN')
                control.send('z','UP')
                control.send('d','UP')
                // control.send('w','UP')
            } else {
                // control.send('w','DOWN')
                control.send('a','DOWN')
                control.send('z','DOWN')
                control.send('z','UP')
                control.send('a','UP')
                // control.send('w','UP')
            }
            player.return = true;
            player.canAttack = false;
            
        }
        if(!player.return&&!player.canAttack){
            control.send('d','up')
            control.send('a','up')
            player.canAttack=true;
        }
        if(player.return){
            // console.log(tick)
            if(player.gotodir==0&&world.ground.x+20>player.x){
                control.send('d','down')
            } else {
                if(world.ground.x+20>player.x){
                    player.return = false;
                    control.send('d','up')
                }
                
            }
            if(player.gotodir==1&&world.ground.x+20<player.x){
                control.send('a','down')
            } else {
                if(world.ground.x+20<player.x){
                    player.return = false;
                    control.send('a','up')
                }
                

            }
            if(tick%5==0){
                if(player.jumps<=1){
                    control.send('w','down')
                    control.send('w','up')
                } else if(player.jumps>=2){

                    control.send('w','down')
                    control.send('w','up')
                    if(lindistance(player.y,world.ground.y)>350&&player.y>world.ground.y){
                        control.send('x','down')
                        control.send('x','UP')
                    }
                }
            }
        }

        // console.log(player)
        // if(player.y>world.ground){
        //     if(tick%40==0){
        //         if(player.jumps!=2){
        //             control.send('w','DOWN')
        //             control.send('w','UP')
        //         } else {
        //             control.send('x','DOWN')
        //             control.send('x','UP')
        //         }
                
        //     }
        // } else {
            console.log(world.pAngle)
            if(!player.inair){
                player.z = false;
            }
            if(player.canAttack){
                if(between(world.pAngle,80,100)&&between(world.pDistance,200,450)){
                    if(otherplayer.y>player.y){
                        if(player.side==0){
                            control.send('d','down')
                        } else {
                            control.send('a','down')
                        }
                        if(!player.z){
                            control.send('w','DOWN')
                            control.send('z','DOWN')
                            control.send('z','UP')
                            control.send('w','UP') 
                            player.z = true;
                        } else if(player.jumps<2) {
                            control.send('w','DOWN')
                            control.send('w','UP') 
                        } else {

                            
                            control.send('x','DOWN')
                            control.send('x','UP')

                        }
                        control.send('d','up')
                        control.send('a','up')
                    }
                }
                if(between(world.pAngle,110,181)&&between(world.pDistance,500,700)){
                    // control.move('right')
                    // control.move('stop')
                    control.send('w','DOWN')
                     

                    control.send('d','down')
                    if(!player.z){
                        control.send('z','DOWN')
                        control.send('z','UP')
                        player.z = true;
                    } else {
                        control.send('w','DOWN')
                        control.send('w','UP')
                    }
                    
                    control.send('d','up')
                    control.send('w','UP')
                    control.send('a','up')
                }
                if(between(world.pAngle,-1,79)&&between(world.pDistance,500,700)){
                    // control.move('right')
                    // control.move('stop')
                    control.send('w','DOWN')
                     

                    control.send('a','down')
                    if(!player.z){
                        control.send('z','DOWN')
                        control.send('z','UP')
                        player.z = true;
                    } else {
                        control.send('w','DOWN')
                        control.send('w','UP')
                    }
                    control.send('a','up')
                    control.send('w','UP')
                    control.send('a','up')
                }
                if(between(world.pDistance,0,500)){
                    if(player.y<otherplayer.y){
                            control.send('s','down')
                        } else {
                                control.send('w','down')
                        }
                            if(player.x>otherplayer.x){
                                control.send('d','down')
                        } else {
                           control.send('a','down')
                        }
                        control.send('z','DOWN')
                        
                        control.send('z','UP')
                        control.send('w','up')
                        control.send('s','up')
                        control.send('a','up')
                        control.send('d','up')
                }
                // if(otherplayer.hp<20){
                //     if(world.pDistance<210&&world.pSee){
                //         execScript('./brawbinder/altscript.txt')
                //     }
                // }

        //         if((world.pDistance<600&&(otherplayer.prepattack||player.attack))||world.pDistance<300){
   
        //                 if(player.y<otherplayer.y){
        //                     control.send('s','down')
        //                 } else {
        //                     control.send('w','down')
        //                 }
        //                 if(player.x>otherplayer.x){
        //                     control.send('d','down')
        //                 } else {
        //                     control.send('a','down')
        //                 }
        //                 control.send('z','DOWN')
        
        //                 control.send('z','UP')
        //                 control.send('w','up')
        //                 control.send('s','up')
        //                 control.send('a','up')
        //                 control.send('d','up')


        //     }
        }
            // 
            // if(world.pDistanceX<100+Math.abs(player.velocityX)*4&&otherplayer.y == player.y){
            //     player.direction = 'left'
            //      execScript('./scripts/simplejump.txt')
            //  }
            //  console.log(Math.abs(player.y-world.ground)*3)
            //  if(world.pDistanceX<250&&player.y<otherplayer.y&&world.pDistanceY<500&&world.pDistanceY<250){
                 
            //      control.send('down','DOWN')
            //      control.send('x','DOWN')
            //      control.send('x','UP')
            //      control.send('down','UP')
            //  }
            //  if(world.pDistanceX>400&&player.x<otherplayer.x){
            //      control.move('right')
            //  }else{
            //      control.move('left')
            //  }
            //  // console.log(player.x)
            //  if(player.x>1413){
            //      control.move('left')
            //  } else{
            //      control.move('right')
                 
            //      if(otherplayer.x>player.x){
            //          control.send('d','DOWN')
     
            //      } else {
            //          control.send('a','DOWN')
            //      }
            //      control.send('v','DOWN')
            //      control.send('v','UP')
            //      control.send('a','UP')
            //      control.send('d','UP')
            //  }
            //  if(world.pDistance<600+otherplayer.velocityX*3&&otherplayer.attack){
            //      // control.move('right')
            //      if(!player.inair){
            //          control.send('w','DOWN')
      
            //          control.send('z','DOWN')
     
            //          control.send('z','UP')
            //          control.send('w','UP')
            //      } else {
            //          control.send('s','DOWN')
      
            //          control.send('z','DOWN')
     
            //          control.send('z','UP')
            //          control.send('s','UP')
            //      }
                 
     
            //  }
            //  if(world.pDistance<350&&!otherplayer.attack){
            //      if(otherplayer.x>player.x){
            //          control.send('d','DOWN')
     
            //      } else {
            //          control.send('a','DOWN')
            //      }
            //      control.send('c','DOWN')
            //      control.send('c','UP')
            //      if(Math.random()>0.5){
            //          control.send('c','DOWN')
            //          control.send('c','UP')
            //      }
            //      control.send('a','UP')
            //      control.send('d','UP')
            //  }
     
        // }
        // console.log(player.direction)
    
    }  
    // console.log('player')
    
    // execScript('./brawbinder/altscript.txt')


}
