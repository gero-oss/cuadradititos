/*global console, process, require */
(function () {
    'use strict';
    const Audic = require("audic");
    var serverPort = process.env.PORT || 5000,
        server = null,
        fs = require('fs'),
        
        contentTypes = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".ico": "image/x-icon",
            ".m4a": "audio/mp4",
            ".oga": "audio/ogg"
        },


        io = null,
        nSight = 0,
        nCuadrado = 0,
        gameEnd = 0,
        canvasWidth = 500,
        canvasHeight = 500,
        totalPlayers = 0,
        players = [],
        stack = [],
        target = null,
        start = false,
        score=0,
        KEY_ENTER=13,
        KEY_SPACE=31,
        KEY_LEFT=37,
        KEY_UP=38,
        KEY_RIGHT=39,
        KEY_DOWN=40,
        KEY_C=67,
        lastPressCuadradito=null,
        ultimadireccion=null,
        anteultimadireccion=null,
        penultimadireccion=null,
        diagonal=false,
        pressing=[],
        pause=0,
        gameover=true,
        scoreCuadradito=0,
        multishot=1,
        powerups=[],
        messages=[],
        jugadorCuadradito=[],
        yoId = 0,
        playerCuadradito=new Rectangle(250,250,10,10,0,3),
        shots=[],
        enemies=[],
        enemiesX=[],
        invenemies=[],
        invenemiesX=[],
        shotsArribaDerecha=[],
        shotsArribaIzquierda=[],
        shotsAbajoDerecha=[],
        shotsAbajoIzquierda=[],
        shotsArriba=[],
        shotsDerecha=[],
        shotsAbajo=[],
        shotsIzkierda=[],
        direArriba = false,
        direAbajo = false,
        direDerecha = false,
        direIzkierda = false,
        direArribaDerecha = false,
        direArribaIzquierda = false,
        direAbajoDerecha = false,
        direAbajoIzquierda = false,
        dir = 0,
        changeDir = 0,
        fintiro = false,
        fintiroArribaDerecha = false,
        fintiroArribaIzquierda = false,
        fintiroAbajoDerecha = false,
        fintiroAbajoIzquierda = false,
        fintiroArriba = false,
        fintiroDerecha = false,
        fintiroAbajo = false,
        fintiroIzkierda = false,
        dirAnterior = 0;

        //new Audic("estruendo.mp3").play()


    function Rectangle(x,y,width,height,type,health){
        this.x=(x==null)?0:x;
        this.y=(y==null)?0:y;
        this.width=(width==null)?0:width;
        this.height=(height==null)?this.width:height;
        this.type=(type==null)?1:type;
        this.health=(health==null)?1:health;
        this.timer=0;
    }
    
    Rectangle.prototype.intersects=function(rect){
        if(rect!=null){
            return(this.x<rect.x+rect.width&&
                this.x+this.width>rect.x&&
                this.y<rect.y+rect.height&&
                this.y+this.height>rect.y);
        }
    }
    
    Rectangle.prototype.fill=function(ctx){

        ctx.fillRect(this.x,this.y,this.width,this.height);
    }

    function Circle(x, y, radius) {
        this.x = (x === undefined) ? 0 : x;
        this.y = (y === undefined) ? 0 : y;
        this.radius = (radius === undefined) ? 0 : radius;
    }

    Circle.prototype = {
        constructor: Circle,

        distance: function (circle) {
            if (circle !== undefined) {
                var dx = this.x - circle.x,
                    dy = this.y - circle.y;
                return (Math.sqrt(dx * dx + dy * dy) - (this.radius + circle.radius));
            }
        }
    };

    function random(max) {

        return ~~(Math.random() * max);
    }

    function dirArribaDerecha(dire) {
        if(direArribaDerecha==true){
//            setInterval(() => {
            for(var i=0,l=shotsArribaDerecha.length;i<l;i++){
                fintiroArribaDerecha=false    
                shotsArribaDerecha[i].y-=20;
                shotsArribaDerecha[i].x+=20;
                io.sockets.emit('shotsArribaDerecha', {x: shotsArribaDerecha[i].x, y: shotsArribaDerecha[i].y, l: shotsArribaDerecha.length, i: i});
                //io.sockets.emit('shotsArribaDerecha', {id: yoId, x: shotsArribaDerecha[i].x, y: shotsArribaDerecha[i].y});
                if(shotsArribaDerecha[i].y<0 || shotsArribaDerecha[i].x>500){
                    shotsArribaDerecha.splice(i--,1);
                    l--;
                    fintiroArribaDerecha=true
                }
            }//ArribaDerecha
//            }, 250)
        }
    }
    function dirArribaIzquierda(dire) {
        if(direArribaIzquierda==true){
//            setInterval(() => {
            for(var i=0,l=shotsArribaIzquierda.length;i<l;i++){
                fintiroArribaIzquierda=false
                shotsArribaIzquierda[i].y-=20;
                shotsArribaIzquierda[i].x-=20;
                io.sockets.emit('shotsArribaIzquierda', {x: shotsArribaIzquierda[i].x, y: shotsArribaIzquierda[i].y, l: shotsArribaIzquierda.length, i: i});
                //io.sockets.emit('shotsArribaIzquierda', {id: yoId, x: shotsArribaIzquierda[i].x, y: shotsArribaIzquierda[i].y});
                if(shotsArribaIzquierda[i].y<0 || shotsArribaIzquierda[i].x<0){
                    shotsArribaIzquierda.splice(i--,1);
                    l--;
                    fintiroArribaIzquierda=true
                }
            }//ArribaIzquierda
//            }, 250)
        }
    }
    function dirAbajoDerecha(dire) {
        if(direAbajoDerecha==true){
//            setInterval(() => {
            for(var i=0,l=shotsAbajoDerecha.length;i<l;i++){
                fintiroAbajoDerecha=false
                shotsAbajoDerecha[i].y+=20;
                shotsAbajoDerecha[i].x+=20;
                io.sockets.emit('shotsAbajoDerecha', {x: shotsAbajoDerecha[i].x, y: shotsAbajoDerecha[i].y, l: shotsAbajoDerecha.length, i: i});
                //io.sockets.emit('shotsAbajoDerecha', {id: yoId, x: shotsAbajoDerecha[i].x, y: shotsAbajoDerecha[i].y});
                if(shotsAbajoDerecha[i].y>500 || shotsAbajoDerecha[i].x>400){
                    shotsAbajoDerecha.splice(i--,1);
                    l--;
                    fintiroAbajoDerecha=true
                }
            }//AbajoDerecha
//            }, 250)
        }
    }
    function dirAbajoIzquierda(dire) {
        if(direAbajoIzquierda==true){
//            setInterval(() => {
            for(var i=0,l=shotsAbajoIzquierda.length;i<l;i++){
                fintiroAbajoIzquierda=false
                shotsAbajoIzquierda[i].y+=20;
                //io.sockets.emit('shotsAbajoIzquierda', {id: yoId, y: shotsAbajoIzquierda[i].y});
                shotsAbajoIzquierda[i].x-=20;
                //io.sockets.emit('shotsAbajoIzquierda', {id: yoId, x: shotsAbajoIzquierda[i].x});
                //////////////////////////////////////////////////////////////////////
                io.sockets.emit('shotsAbajoIzquierda', {x: shotsAbajoIzquierda[i].x, y: shotsAbajoIzquierda[i].y, l: shotsAbajoIzquierda.length, i: i});
                //io.sockets.emit('shotsAbajoIzquierda', {id: yoId, x: shotsAbajoIzquierda[i].x, y: shotsAbajoIzquierda[i].y});
                if(shotsAbajoIzquierda[i].y>500 || shotsAbajoIzquierda[i].x<0){
                    shotsAbajoIzquierda.splice(i--,1);
                    l--;                    
                    fintiroAbajoIzquierda=true   
                }                           
            }//AbajoIzquierda 
//            }, 250)
        }
    }
    function dirArriba(dire) {
        if(direArriba==true){
//            setInterval(() => {
            for(var i=0,l=shotsArriba.length;i<l;i++){
                fintiroArriba=false
                shotsArriba[i].y-=20;
                //console.log("esto es shotsArriba[i].y "+shotsArriba[i].y)
                io.sockets.emit('shotsArriba', {x: shotsArriba[i].x, y: shotsArriba[i].y, l: shotsArriba.length, i: i});
                //io.sockets.emit('shotsArriba', {id: yoId, x: shotsArriba[i].x, y: shotsArriba[i].y});
                if(shotsArriba[i].y<0){
                    shotsArriba.splice(i--,1);
                    l--;
                    fintiroArriba=true
                }
                //io.sockets.emit('shotsArriba', {id: yoId, x: shotsArriba[i].x, y: shotsArriba[i].y});
            }//arriba
//            }, 250)
        }
    }
    function dirAbajo(dire) {
        if(direAbajo==true){
//            setInterval(() => {
            for(var i=0,l=shotsAbajo.length;i<l;i++){
                fintiroAbajo=false
                shotsAbajo[i].y+=20;
                io.sockets.emit('shotsAbajo', {x: shotsAbajo[i].x, y: shotsAbajo[i].y, l: shotsAbajo.length, i: i});
                //io.sockets.emit('shotsAbajo', {id: yoId, x: shotsAbajo[i].x, y: shotsAbajo[i].y});
                if(shotsAbajo[i].y>500){
                    shotsAbajo.splice(i--,1);
                    l--;
                    fintiroAbajo=true
                }
            }//abajo
//            }, 250)
        }
    }
    function dirDerecha(dire) {
        if(direDerecha==true){
//            setInterval(() => {
            for(var i=0,l=shotsDerecha.length;i<l;i++){
                fintiroDerecha=false
                shotsDerecha[i].x+=20;
                io.sockets.emit('shotsDerecha', {x: shotsDerecha[i].x, y: shotsDerecha[i].y, l: shotsDerecha.length, i: i});
                //io.sockets.emit('shotsDerecha', {id: yoId, x: shotsDerecha[i].x, y: shotsDerecha[i].y});
                if(shotsDerecha[i].x>500){
                    shotsDerecha.splice(i--,1);
                    l--;
                    fintiroDerecha=true
                }
            }//derecha
//            }, 250)
        }
    }
    function dirIzkierda(dire) {
        if(direIzkierda==true){
//            setInterval(() => {
            for(var i=0,l=shotsIzkierda.length;i<l;i++){
                fintiroIzkierda=false
                shotsIzkierda[i].x-=20;
                io.sockets.emit('shotsIzkierda', {x: shotsIzkierda[i].x, y: shotsIzkierda[i].y, l: shotsIzkierda.length, i: i});
                //io.sockets.emit('shotsIzkierda', {id: yoId, x: shotsIzkierda[i].x, y: shotsIzkierda[i].y});
                if(shotsIzkierda[i].x<0){
                    shotsIzkierda.splice(i--,1);
                    l--;
                    fintiroIzkierda=true
                }
            }//izkierda
//            }, 250)
        }
    }

    function reset(){
        playerCuadradito.x=50;
        playerCuadradito.y=50;
        playerCuadradito.health=3;
        playerCuadradito.timer=0;
        gameover=false;
    }
///////////////////////////////////////////////
//cada vez ke disparo se acelera             //
//porke lo acelera cada vez ke toke una tecla//
///////////////////////////////////////////////
//RESUELTO//
////////////


//tengo borrar las balas
//cuando impactan en los enemigos
//no se borran hasta ke vuelvo a disparar en esa direccion
    function act3(socketId, lastPressCuadradito, penultimadireccion, anteultimadireccion, ultimadireccion, pressing){
        //pause=!pause;
        pause=false
        if(!pause){
            if(pressing[KEY_UP]){
                playerCuadradito[socketId].y-=10;
            }
            if(pressing[KEY_RIGHT]){
                playerCuadradito[socketId].x+=10;
            }
            if(pressing[KEY_DOWN]){
                playerCuadradito[socketId].y+=10;
            }
            if(pressing[KEY_LEFT]){
                playerCuadradito[socketId].x-=10;
            }

            // Out Screen
            if(playerCuadradito[socketId].x>canvasWidth-playerCuadradito[socketId].width){
                playerCuadradito[socketId].x=canvasWidth-playerCuadradito[socketId].width;}
            if(playerCuadradito[socketId].x<0){
                playerCuadradito[socketId].x=0;}
            if(playerCuadradito[socketId].y>canvasHeight-playerCuadradito[socketId].height){
                playerCuadradito[socketId].y=canvasHeight-playerCuadradito[socketId].height;}
            if(playerCuadradito[socketId].y<0){
                playerCuadradito[socketId].y=0;}
                    
            // New Shot //setInterval(() => {}, 500)
            if((lastPressCuadradito==67 || lastPressCuadradito==67) && pressing[lastPressCuadradito]==true){
            //if((lastPressCuadradito==67 || lastPressCuadradito==67) && pressing[lastPressCuadradito]==false){
//                new Audic("estruendo.mp3").play()
                /*estruendo.pause();
                estruendo.currentTime = 1;
                estruendo.play();*/
                diagonal=false;
                
                //disparosDiagonales
                //arriba38derecha39                
                if ((ultimadireccion==38 && anteultimadireccion==39)||(ultimadireccion==39 && anteultimadireccion==38)){
                    shotsArribaDerecha.push(new Rectangle(playerCuadradito[socketId].x+5,playerCuadradito[socketId].y+3,5,5));
                    lastPressCuadradito=null;
                    direArribaDerecha = true
                    diagonal=true;
                    
                }
                //arriba38izquierda37                
                if ((ultimadireccion==38 && anteultimadireccion==37)||(ultimadireccion==37 && anteultimadireccion==38)){
                   shotsArribaIzquierda.push(new Rectangle(playerCuadradito[socketId].x+3,playerCuadradito[socketId].y+3,5,5));
                   lastPressCuadradito=null;
                   direArribaIzquierda = true
                   diagonal=true;

                }
                //abajo40derecha39                
                if ((ultimadireccion==40 && anteultimadireccion==39)||(ultimadireccion==39 && anteultimadireccion==40)){
                    shotsAbajoDerecha.push(new Rectangle(playerCuadradito[socketId].x+5,playerCuadradito[socketId].y+3,5,5));
                    lastPressCuadradito=null;
                    direAbajoDerecha = true
                    diagonal=true;
                }
                //abajo40izquierda37                                
                if ((ultimadireccion==40 && anteultimadireccion==37)||(ultimadireccion==37 && anteultimadireccion==40)){
                   shotsAbajoIzquierda.push(new Rectangle(playerCuadradito[socketId].x+3,playerCuadradito[socketId].y+3,5,5));
                   lastPressCuadradito=null;
                   direAbajoIzquierda = true
                   diagonal=true;
                }
                // Change Direction
                if(diagonal==false){
                    if(ultimadireccion == 38){                    
                        shotsArriba.push(new Rectangle(playerCuadradito[socketId].x+3,playerCuadradito[socketId].y,5,5));
                        lastPressCuadradito=null;
                        direArriba = true
                    }
                    if(ultimadireccion == 39){
                        shotsDerecha.push(new Rectangle(playerCuadradito[socketId].x+5,playerCuadradito[socketId].y+3,5,5));
                        lastPressCuadradito=null;
                        direDerecha = true
                    }
                    if(ultimadireccion == 40){
                        shotsAbajo.push(new Rectangle(playerCuadradito[socketId].x+3,playerCuadradito[socketId].y+5,5,5));
                        lastPressCuadradito=null;
                        direAbajo = true
                    }
                    if(ultimadireccion == 37){
                        shotsIzkierda.push(new Rectangle(playerCuadradito[socketId].x,playerCuadradito[socketId].y+3,5,5));
                        lastPressCuadradito=null;
                        direIzkierda = true
                    }
                }
            }
            /*
            dirArribaDerecha(direArribaDerecha)
            dirArribaIzquierda(direArribaIzquierda)
            dirAbajoDerecha(direAbajoDerecha)
            dirAbajoIzquierda(direAbajoIzquierda)
            dirArriba(direArriba)
            dirDerecha(direDerecha)
            dirAbajo(direAbajo)
            dirIzkierda(direIzkierda)
            */           
        }
        //setInterval(() => {}, 500)
        
        /*
        function dirArribaDerecha(dire) {
            if(direArribaDerecha==true){
                setInterval(() => {
                    for(var i=0,l=shotsArribaDerecha.length;i<l;i++){
                        fintiroArribaDerecha=false    
                        shotsArribaDerecha[i].y-=20;
                        shotsArribaDerecha[i].x+=20;
                        io.sockets.emit('shotsArribaDerecha', {x: shotsArribaDerecha[i].x, y: shotsArribaDerecha[i].y, l: shotsArribaDerecha.length, i: i});
                        //io.sockets.emit('shotsArribaDerecha', {id: yoId, x: shotsArribaDerecha[i].x, y: shotsArribaDerecha[i].y});
                        if(shotsArribaDerecha[i].y<0 || shotsArribaDerecha[i].x>500){
                            shotsArribaDerecha.splice(i--,1);
                            l--;
                            fintiroArribaDerecha=true
                        }
                    }//ArribaDerecha
                }, 250)
            }
        }
        function dirArribaIzquierda(dire) {
            if(direArribaIzquierda==true){
                setInterval(() => {
                    for(var i=0,l=shotsArribaIzquierda.length;i<l;i++){
                        fintiroArribaIzquierda=false
                        shotsArribaIzquierda[i].y-=20;
                        shotsArribaIzquierda[i].x-=20;
                        io.sockets.emit('shotsArribaIzquierda', {x: shotsArribaIzquierda[i].x, y: shotsArribaIzquierda[i].y, l: shotsArribaIzquierda.length, i: i});
                        //io.sockets.emit('shotsArribaIzquierda', {id: yoId, x: shotsArribaIzquierda[i].x, y: shotsArribaIzquierda[i].y});
                        if(shotsArribaIzquierda[i].y<0 || shotsArribaIzquierda[i].x<0){
                            shotsArribaIzquierda.splice(i--,1);
                            l--;
                            fintiroArribaIzquierda=true
                        }
                    }//ArribaIzquierda
                }, 250)
            }
        }
        function dirAbajoDerecha(dire) {
            if(direAbajoDerecha==true){
                setInterval(() => {
                    for(var i=0,l=shotsAbajoDerecha.length;i<l;i++){
                        fintiroAbajoDerecha=false
                        shotsAbajoDerecha[i].y+=20;
                        shotsAbajoDerecha[i].x+=20;
                        io.sockets.emit('shotsAbajoDerecha', {x: shotsAbajoDerecha[i].x, y: shotsAbajoDerecha[i].y, l: shotsAbajoDerecha.length, i: i});
                        //io.sockets.emit('shotsAbajoDerecha', {id: yoId, x: shotsAbajoDerecha[i].x, y: shotsAbajoDerecha[i].y});
                        if(shotsAbajoDerecha[i].y>500 || shotsAbajoDerecha[i].x>400){
                            shotsAbajoDerecha.splice(i--,1);
                            l--;
                            fintiroAbajoDerecha=true
                        }
                    }//AbajoDerecha
                }, 250)
            }
        }
        function dirAbajoIzquierda(dire) {
            if(direAbajoIzquierda==true){
                setInterval(() => {
                    for(var i=0,l=shotsAbajoIzquierda.length;i<l;i++){
                        fintiroAbajoIzquierda=false
                        shotsAbajoIzquierda[i].y+=20;
                        //io.sockets.emit('shotsAbajoIzquierda', {id: yoId, y: shotsAbajoIzquierda[i].y});
                        shotsAbajoIzquierda[i].x-=20;
                        //io.sockets.emit('shotsAbajoIzquierda', {id: yoId, x: shotsAbajoIzquierda[i].x});
                        //////////////////////////////////////////////////////////////////////
                        io.sockets.emit('shotsAbajoIzquierda', {x: shotsAbajoIzquierda[i].x, y: shotsAbajoIzquierda[i].y, l: shotsAbajoIzquierda.length, i: i});
                        //io.sockets.emit('shotsAbajoIzquierda', {id: yoId, x: shotsAbajoIzquierda[i].x, y: shotsAbajoIzquierda[i].y});
                        if(shotsAbajoIzquierda[i].y>500 || shotsAbajoIzquierda[i].x<0){
                            shotsAbajoIzquierda.splice(i--,1);
                            l--;                    
                            fintiroAbajoIzquierda=true   
                        }                           
                    }//AbajoIzquierda 
                }, 250)
            }
        }
        function dirArriba(dire) {
            if(direArriba==true){
                setInterval(() => {
                    for(var i=0,l=shotsArriba.length;i<l;i++){
                        fintiroArriba=false
                        shotsArriba[i].y-=20;
                        //console.log("esto es shotsArriba[i].y "+shotsArriba[i].y)
                        io.sockets.emit('shotsArriba', {x: shotsArriba[i].x, y: shotsArriba[i].y, l: shotsArriba.length, i: i});
                        //io.sockets.emit('shotsArriba', {id: yoId, x: shotsArriba[i].x, y: shotsArriba[i].y});
                        if(shotsArriba[i].y<0){
                            shotsArriba.splice(i--,1);
                            l--;
                            fintiroArriba=true
                        }
                        //io.sockets.emit('shotsArriba', {id: yoId, x: shotsArriba[i].x, y: shotsArriba[i].y});
                    }//arriba
                }, 250)
            }
        }
        function dirAbajo(dire) {
            if(direAbajo==true){
                setInterval(() => {
                    for(var i=0,l=shotsAbajo.length;i<l;i++){
                        fintiroAbajo=false
                        shotsAbajo[i].y+=20;
                        io.sockets.emit('shotsAbajo', {x: shotsAbajo[i].x, y: shotsAbajo[i].y, l: shotsAbajo.length, i: i});
                        //io.sockets.emit('shotsAbajo', {id: yoId, x: shotsAbajo[i].x, y: shotsAbajo[i].y});
                        if(shotsAbajo[i].y>500){
                            shotsAbajo.splice(i--,1);
                            l--;
                            fintiroAbajo=true
                        }
                    }//abajo
                }, 250)
            }
        }
        function dirDerecha(dire) {
            if(direDerecha==true){
                setInterval(() => {
                    for(var i=0,l=shotsDerecha.length;i<l;i++){
                        fintiroDerecha=false
                        shotsDerecha[i].x+=20;
                        io.sockets.emit('shotsDerecha', {x: shotsDerecha[i].x, y: shotsDerecha[i].y, l: shotsDerecha.length, i: i});
                        //io.sockets.emit('shotsDerecha', {id: yoId, x: shotsDerecha[i].x, y: shotsDerecha[i].y});
                        if(shotsDerecha[i].x>500){
                            shotsDerecha.splice(i--,1);
                            l--;
                            fintiroDerecha=true
                        }
                    }//derecha
                }, 250)
            }
        }
        function dirIzkierda(dire) {
            if(direIzkierda==true){
                setInterval(() => {
                    for(var i=0,l=shotsIzkierda.length;i<l;i++){
                        fintiroIzkierda=false
                        shotsIzkierda[i].x-=20;
                        io.sockets.emit('shotsIzkierda', {x: shotsIzkierda[i].x, y: shotsIzkierda[i].y, l: shotsIzkierda.length, i: i});
                        //io.sockets.emit('shotsIzkierda', {id: yoId, x: shotsIzkierda[i].x, y: shotsIzkierda[i].y});
                        if(shotsIzkierda[i].x<0){
                            shotsIzkierda.splice(i--,1);
                            l--;
                            fintiroIzkierda=true
                        }
                    }//izkierda
                }, 250)
            }
        }
        */
    }

    function act2(socketId) {

        setInterval(() => {

            dirArribaDerecha(direArribaDerecha)
            dirArribaIzquierda(direArribaIzquierda)
            dirAbajoDerecha(direAbajoDerecha)
            dirAbajoIzquierda(direAbajoIzquierda)
            dirArriba(direArriba)
            dirDerecha(direDerecha)
            dirAbajo(direAbajo)
            dirIzkierda(direIzkierda)

            //este es el de enemies 
            for(var i=0,l=enemies.length;i<l;i++){
                if(enemies[i].timer>0)
                    enemies[i].timer--;
                enemies[i].y+=random(canvasHeight/50);
                //console.log("esto es enemies[i].y "+enemies[i].y)
                if(enemies[i].y>canvasHeight){
                    enemies[i].x=random(canvasWidth/10)*10;
                    enemies[i].y=0;
                    enemies[i].health=2;
                }
                // Shot Intersects Enemy
                for(var j=0,ll=shotsArriba.length;j<ll;j++){
                    if(shotsArriba[j].intersects(enemies[i])){
                        //console.log("esto es shotsArriba[i].y "+shotsArriba[i].y)
                        //console.log("esto es enemies[i].y "+enemies[i].y)
                        //console.log("******************intersects******************")
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsArriba.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajo.length;j<ll;j++){
                    if(shotsAbajo[j].intersects(enemies[i])){
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsAbajo.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsIzkierda.length;j<ll;j++){
                    if(shotsIzkierda[j].intersects(enemies[i])){
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsIzkierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsDerecha.length;j<ll;j++){
                    if(shotsDerecha[j].intersects(enemies[i])){
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaDerecha.length;j<ll;j++){
                    if(shotsArribaDerecha[j].intersects(enemies[i])){
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsArribaDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaIzquierda.length;j<ll;j++){
                    if(shotsArribaIzquierda[j].intersects(enemies[i])){
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsArribaIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoIzquierda.length;j<ll;j++){
                    if(shotsAbajoIzquierda[j].intersects(enemies[i])){
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsAbajoIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoDerecha.length;j<ll;j++){
                    if(shotsAbajoDerecha[j].intersects(enemies[i])){
                        //score++;
                        enemies[i].health--;
                        if(enemies[i].health<1){
                            enemies[i].x=random(canvasWidth/10)*10;
                            enemies[i].y=0;
                            enemies[i].health=2;
                            enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemies[i].timer=1;
                        }
                        shotsAbajoDerecha.splice(j--,1);
                        ll--;
                    }
                }
                // Player Intersects Enemy
                if(playerCuadradito[socketId].intersects(enemies[i])&&playerCuadradito[socketId].timer<1){
                    //playerCuadradito[socketId].health--;
                    //playerCuadradito[socketId].timer=20;
                    playerCuadradito[socketId].x=500;
                    playerCuadradito[socketId].y=500;
                    //io.sockets.emit('playerCuadradito', {id: yoId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
                }/*
                // Shot Intersects Enemy
                for(var j=0,ll=shots.length;j<ll;j++){
                    if(shots[j].intersects(enemies[i])){
                    //score++;
                    enemies[i].health--;
                    if(enemies[i].health<1){
                        // Add PowerUp
                        var r=random(20);
                        if(r<5){
                            if(r==0)    // New MultiShot
                                powerups.push(new Rectangle(enemies[i].x,enemies[i].y,10,10,1));
                            else        // New ExtraPoints
                                powerups.push(new Rectangle(enemies[i].x,enemies[i].y,10,10,0));
                        }
                        enemies[i].x=random(canvasWidth/10)*10;
                        enemies[i].y=0;
                        enemies[i].health=2;
                        enemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                    }
                    else{
                        enemies[i].timer=1;
                    }
                    shots.splice(j--,1);
                    ll--;
                    }
                }*/
                io.sockets.emit('enemies', {x: enemies[i].x, y: enemies[i].y, l: enemies.length, i: i});
                //io.sockets.emit('enemies', {x: enemies[i].x, y: enemies[i].y});
                //io.sockets.emit('playerCuadradito', {id: socketId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
            }
            
            //este es el de enemiesX
            for(var i=0,l=enemiesX.length;i<l;i++){
                if(enemiesX[i].timer>0)
                    enemiesX[i].timer--;
                enemiesX[i].x+=random(canvasWidth/50);
                if(enemiesX[i].x>canvasWidth){
                    enemiesX[i].y=random(canvasWidth/10)*10;
                    enemiesX[i].x=0;
                    enemiesX[i].health=2;
                }
                // Shot Intersects Enemy
                for(var j=0,ll=shotsArriba.length;j<ll;j++){
                    if(shotsArriba[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsArriba.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajo.length;j<ll;j++){
                    if(shotsAbajo[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsAbajo.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsIzkierda.length;j<ll;j++){
                    if(shotsIzkierda[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsIzkierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsDerecha.length;j<ll;j++){
                    if(shotsDerecha[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaDerecha.length;j<ll;j++){
                    if(shotsArribaDerecha[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsArribaDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaIzquierda.length;j<ll;j++){
                    if(shotsArribaIzquierda[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsArribaIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoIzquierda.length;j<ll;j++){
                    if(shotsAbajoIzquierda[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsAbajoIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoDerecha.length;j<ll;j++){
                    if(shotsAbajoDerecha[j].intersects(enemiesX[i])){
                        //score++;
                        enemiesX[i].health--;
                        if(enemiesX[i].health<1){
                            enemiesX[i].x=random(canvasWidth/10)*10;
                            enemiesX[i].y=0;
                            enemiesX[i].health=2;
                            enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                        }
                        else{
                            enemiesX[i].timer=1;
                        }
                        shotsAbajoDerecha.splice(j--,1);
                        ll--;
                    }
                }
                // Player Intersects Enemy
                if(playerCuadradito[socketId].intersects(enemiesX[i])&&playerCuadradito[socketId].timer<1){
                    //playerCuadradito[socketId].health--;
                    //playerCuadradito[socketId].timer=20;
                    playerCuadradito[socketId].x=500;
                    playerCuadradito[socketId].y=500;
                    //io.sockets.emit('playerCuadradito', {id: yoId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
                }/*
                // Shot Intersects Enemy
                for(var j=0,ll=shots.length;j<ll;j++){
                    if(shots[j].intersects(enemiesX[i])){
                    //score++;
                    enemiesX[i].health--;
                    if(enemiesX[i].health<1){
                        // Add PowerUp
                        var r=random(20);
                        if(r<5){
                            if(r==0)    // New MultiShot
                                powerups.push(new Rectangle(enemiesX[i].x,enemiesX[i].y,10,10,1));
                            else        // New ExtraPoints
                                powerups.push(new Rectangle(enemiesX[i].x,enemiesX[i].y,10,10,0));
                        }
                        enemiesX[i].x=random(canvasWidth/10)*10;
                        enemiesX[i].y=0;
                        enemiesX[i].health=2;
                        enemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                    }
                    else{
                        enemiesX[i].timer=1;
                    }
                    shots.splice(j--,1);
                    ll--;
                    }
                }*/
                io.sockets.emit('enemiesX', {x: enemiesX[i].x, y: enemiesX[i].y, l: enemiesX.length, i: i});
                //io.sockets.emit('enemiesX', {x: enemiesX[i].x, y: enemiesX[i].y});
                //io.sockets.emit('playerCuadradito', {id: socketId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
            }
            
            //este es el de invenemies
            for(var i=0,l=invenemies.length;i<l;i++){
                if(invenemies[i].timer>0)
                    invenemies[i].timer--;
                invenemies[i].y-=random(canvasHeight/50);
                if(invenemies[i].y<0){
                    invenemies[i].x=random(canvasWidth/10)*10;
                    invenemies[i].y=500;
                    invenemies[i].health=2;
                }
                // Shot Intersects Enemy
                for(var j=0,ll=shotsArriba.length;j<ll;j++){
                    if(shotsArriba[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{
                            invenemies[i].timer=1;
                        }
                        shotsArriba.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajo.length;j<ll;j++){
                    if(shotsAbajo[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{
                            invenemies[i].timer=1;
                        }
                        shotsAbajo.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsIzkierda.length;j<ll;j++){
                    if(shotsIzkierda[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{
                            invenemies[i].timer=1;
                        }
                        shotsIzkierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsDerecha.length;j<ll;j++){
                    if(shotsDerecha[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{
                            invenemies[i].timer=1;
                        }
                        shotsDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaDerecha.length;j<ll;j++){
                    if(shotsArribaDerecha[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{invenemies[i].timer=1;
                        }

                        shotsArribaDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaIzquierda.length;j<ll;j++){
                    if(shotsArribaIzquierda[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{
                            invenemies[i].timer=1;
                        }
                        shotsArribaIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoIzquierda.length;j<ll;j++){
                    if(shotsAbajoIzquierda[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{
                            invenemies[i].timer=1;
                        }
                        shotsAbajoIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoDerecha.length;j<ll;j++){
                    if(shotsAbajoDerecha[j].intersects(invenemies[i])){
                        //score++;
                        invenemies[i].health--;
                        if(invenemies[i].health<1){
                            invenemies[i].x=random(canvasWidth/10)*10;
                            invenemies[i].y=0;
                            invenemies[i].health=2;
                            invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                        }
                        else{
                            invenemies[i].timer=1;
                        }
                        shotsAbajoDerecha.splice(j--,1);
                        ll--;
                    }
                }
                // Player Intersects Enemy
                if(playerCuadradito[socketId].intersects(invenemies[i])&&playerCuadradito[socketId].timer<1){
                    //playerCuadradito[socketId].health--;
                    //playerCuadradito[socketId].timer=20;
                    playerCuadradito[socketId].x=500;
                    playerCuadradito[socketId].y=500;
                    //io.sockets.emit('playerCuadradito', {id: yoId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
                }/*
                // Shot Intersects Enemy
                for(var j=0,ll=shots.length;j<ll;j++){
                    if(shots[j].intersects(invenemies[i])){
                    //score++;
                    invenemies[i].health--;
                    if(invenemies[i].health<1){
                        // Add PowerUp
                        var r=random(20);
                        if(r<5){
                            if(r==0)    // New MultiShot
                                powerups.push(new Rectangle(invenemies[i].x,invenemies[i].y,10,10,1));
                            else        // New ExtraPoints
                                powerups.push(new Rectangle(invenemies[i].x,invenemies[i].y,10,10,0));
                        }
                        invenemies[i].x=random(canvasWidth/10)*10;
                        invenemies[i].y=0;
                        invenemies[i].health=2;
                        invenemies.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                    }
                    else{
                        invenemies[i].timer=1;
                    }
                    shots.splice(j--,1);
                    ll--;
                    }
                }*/
                io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y, l: invenemies.length, i: i});
                //io.sockets.emit('invenemies', {x: invenemies[i].x, y: invenemies[i].y});
                //io.sockets.emit('playerCuadradito', {id: socketId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
            }
            
            //este es el de invenemiesX
            for(var i=0,l=invenemiesX.length;i<l;i++){
                if(invenemiesX[i].timer>0)
                    invenemiesX[i].timer--;
                invenemiesX[i].x-=random(canvasWidth/50);
                if(invenemiesX[i].x<0){
                    invenemiesX[i].x=500;
                    invenemiesX[i].y=random(canvasWidth/10)*10;
                    invenemiesX[i].health=2;
                }
                // Shot Intersects Enemy
                for(var j=0,ll=shotsArriba.length;j<ll;j++){
                    if(shotsArriba[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsArriba.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajo.length;j<ll;j++){
                    if(shotsAbajo[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsAbajo.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsIzkierda.length;j<ll;j++){
                    if(shotsIzkierda[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsIzkierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsDerecha.length;j<ll;j++){
                    if(shotsDerecha[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaDerecha.length;j<ll;j++){
                    if(shotsArribaDerecha[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsArribaDerecha.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsArribaIzquierda.length;j<ll;j++){
                    if(shotsArribaIzquierda[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsArribaIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoIzquierda.length;j<ll;j++){
                    if(shotsAbajoIzquierda[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsAbajoIzquierda.splice(j--,1);
                        ll--;
                    }
                }
                for(var j=0,ll=shotsAbajoDerecha.length;j<ll;j++){
                    if(shotsAbajoDerecha[j].intersects(invenemiesX[i])){
                        //score++;
                        invenemiesX[i].health--;
                        if(invenemiesX[i].health<1){
                            invenemiesX[i].x=random(canvasWidth/10)*10;
                            invenemiesX[i].y=0;
                            invenemiesX[i].health=2;
                            invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                            //io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y});
                        }
                        else{
                            invenemiesX[i].timer=1;
                        }
                        shotsAbajoDerecha.splice(j--,1);
                        ll--;
                    }
                }
                // Player Intersects Enemy
                if(playerCuadradito[socketId].intersects(invenemiesX[i])&&playerCuadradito[socketId].timer<1){
                    //playerCuadradito[socketId].health--;
                    //playerCuadradito[socketId].timer=20;
                    playerCuadradito[socketId].x=500;
                    playerCuadradito[socketId].y=500;
                    //io.sockets.emit('playerCuadradito', {id: yoId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
                }/*
                // Shot Intersects Enemy
                for(var j=0,ll=shots.length;j<ll;j++){
                    if(shots[j].intersects(invenemiesX[i])){
                    //score++;
                    invenemiesX[i].health--;
                    if(invenemiesX[i].health<1){
                        // Add PowerUp
                        var r=random(20);
                        if(r<5){
                            if(r==0)    // New MultiShot
                                powerups.push(new Rectangle(invenemiesX[i].x,invenemiesX[i].y,10,10,1));
                            else        // New ExtraPoints
                                powerups.push(new Rectangle(invenemiesX[i].x,invenemiesX[i].y,10,10,0));
                        }
                        invenemiesX[i].x=random(canvasWidth/10)*10;
                        invenemiesX[i].y=0;
                        invenemiesX[i].health=2;
                        invenemiesX.push(new Rectangle(random(canvasWidth/10)*10,0,10,10,0,2));
                    }
                    else{
                        invenemiesX[i].timer=1;
                    }
                    shots.splice(j--,1);
                    ll--;
                    }
                }*/
                io.sockets.emit('invenemiesX', {x: invenemiesX[i].x, y: invenemiesX[i].y, l: invenemiesX.length, i: i});
                //io.sockets.emit('playerCuadradito', {id: socketId, x: playerCuadradito[socketId].x, y: playerCuadradito[socketId].y});
            }
        }, 150)
    }

    function act(player) {
        var now = Date.now();
        if (gameEnd - now < -1000) {
            gameEnd = now + 1000000;
            io.sockets.emit('gameEnd', {time: gameEnd});
            target.x = random(canvasWidth / 10 - 1) * 10 + target.radius;
            target.y = random(canvasHeight / 10 - 1) * 10 + target.radius;
            io.sockets.emit('target', {x: target.x, y: target.y});
        } else if (gameEnd - now > 0) {
            if (players[player].distance(target) < 0) {
                io.sockets.emit('score', {id: player, score: 1});
                target.x = random(canvasWidth / 10 - 1) * 10 + target.radius;
                target.y = random(canvasHeight / 10 - 1) * 10 + target.radius;
                io.sockets.emit('target', {x: target.x, y: target.y});
            }
        }
    }


    function MyServer(request, response) {
        var filePath = '.' + request.url,
            extname = '',
            contentType = '';
        if (filePath === './') {
            filePath = './index.html';
        }

        extname = filePath.substr(filePath.lastIndexOf('.'));
        contentType = contentTypes[extname];
        if (!contentType) {
            contentType = 'application/octet-stream';
        }
        console.log((new Date()) + ' Serving ' + filePath + ' as ' + contentType);

        fs.exists(filePath, function (exists) {
            if (exists) {
                fs.readFile(filePath, function (error, content) {
                    if (error) {
                        response.writeHead(500, { 'Content-Type': 'text/html' });
                        response.end('<h1>500 Internal Server Error</h1>');
                    } else {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    }
                });
            } else {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('<h1>404 Not Found</h1>');
            }
        });
    }

    enemies=[];
    enemiesX=[];
    invenemies=[];
    invenemiesX=[];
    enemies.push(new Rectangle(10,0,10,10,0,2));
    enemiesX.push(new Rectangle(10,0,10,10,0,2));
    invenemies.push(new Rectangle(10,0,10,10,0,2));
    invenemiesX.push(new Rectangle(10,0,10,10,0,2));

    target = new Circle(100, 100, 10);
    server = require('http').createServer(MyServer);
    server.listen(parseInt(serverPort, 10), function () {
        console.log('Server is listening on port ' + serverPort);
    });
    

    io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {//estoEscuchaCualkierConexion
        if (stack.length) {
            socket.playerId = stack.pop();
        } else {
            socket.playerId = nSight;
            nSight += 1;
        }
        totalPlayers += 1;
        players[socket.playerId] = new Circle(0, 0, 5);

        playerCuadradito[socket.playerId] = new Rectangle(250,250,10,10,0,3);//este no es es el de arriba
        act2(socket.playerId);
        //act2
        //aca pasa las intersecciones


        socket.emit('me', {id: socket.playerId});

        io.sockets.emit('sight', {id: socket.playerId, x: 0, y: 0});
        io.sockets.emit('playerCuadradito', {id: socket.playerId, x: 250, y: 250});

        console.log(socket.id  + ' connected as player' + socket.playerId);
        socket.on('mySight', function (sight) {
            players[socket.playerId].x = sight.x;
            players[socket.playerId].y = sight.y;
            if (sight.lastPress === 1) {
                act(socket.playerId);
            }
            io.sockets.emit('sight', {id: socket.playerId, x: sight.x, y: sight.y, lastPress: sight.lastPress});
        });

        socket.emit('yo', {id: socket.playerId});
        socket.on('miCuadradito', function(cuadraditos){

            yoId=socket.playerId
            playerCuadradito[yoId].lastPressCuadradito=cuadraditos.lastPressCuadradito
            playerCuadradito[yoId].penultimadireccion=cuadraditos.penultimadireccion
            playerCuadradito[yoId].anteultimadireccion=cuadraditos.anteultimadireccion
            playerCuadradito[yoId].ultimadireccion=cuadraditos.ultimadireccion
            playerCuadradito[yoId].pressing=cuadraditos.pressingEvtKeyCode
            act3(yoId, playerCuadradito[yoId].lastPressCuadradito, playerCuadradito[yoId].penultimadireccion, playerCuadradito[yoId].anteultimadireccion, playerCuadradito[yoId].ultimadireccion, playerCuadradito[yoId].pressing);
            io.sockets.emit('playerCuadradito', {id: yoId, x: playerCuadradito[yoId].x, y: playerCuadradito[yoId].y});

            //io.sockets.emit('shotsArriba', {id: yoId, x: shotsArriba.x, y: shotsArriba.y});
            //console.log(shotsArriba)//esto da undefined

            //io.sockets.emit('shotsArriba', {id: yoId, x: shotsArriba.x, y: shotsArriba.y});
            //esto no da error sobre x pero no imprime na

            //cada uno ke agrega lo agrega usando la direccion de
            //playerCuadradito pero con un int de cada push
            //no seria asi shotsArribaDerecha[yoId] seria al asi shotsArribaDerecha[0...n] 
            //asi es shotsArribaDerecha[(shotsArribaDerecha.lenght-1)]
            /////////////////////////////////////////////////
            //y tambien tendria ke ir en un intervalo i no?//
            /////////////////////////////////////////////////
            /*
            io.sockets.emit('shotsArribaDerecha', {id: yoId, x: shotsArribaDerecha[yoId].x, y: shotsArribaDerecha[yoId].y});
            io.sockets.emit('shotsArribaIzquierda', {id: yoId, x: shotsArribaIzquierda[yoId].x, y: shotsArribaIzquierda[yoId].y});
            io.sockets.emit('shotsAbajoDerecha', {id: yoId, x: shotsAbajoDerecha[yoId].x, y: shotsAbajoDerecha[yoId].y});
            io.sockets.emit('shotsAbajoIzquierda', {id: yoId, x: shotsAbajoIzquierda[yoId].x, y: shotsAbajoIzquierda[yoId].y});
            io.sockets.emit('shotsArriba', {id: yoId, x: shotsArriba[yoId].x, y: shotsArriba[yoId].y});
            io.sockets.emit('shotsDerecha', {id: yoId, x: shotsDerecha[yoId].x, y: shotsDerecha[yoId].y});
            io.sockets.emit('shotsAbajo', {id: yoId, x: shotsAbajo[yoId].x, y: shotsAbajo[yoId].y});
            io.sockets.emit('shotsIzkierda', {id: yoId, x: shotsIzkierda[yoId].x, y: shotsIzkierda[yoId].y});
            */
            /*
            shotsArribaDerecha
            shotsArribaIzquierda
            shotsAbajoDerecha
            shotsAbajoIzquierda
            shotsArriba
            shotsDerecha
            shotsAbajo
            shotsIzkierda
            */
        });
        socket.on('disconnect', function () {
            io.sockets.emit('sight', {id: socket.playerId, x: null, y: null});//io.sockets.emit => Envía una emisión a todos los sockets conectados, incluido aquel desde el cual fue llamada esta función. Ejemplo: io.sockets.emit('message', 'Hello everyone!');
            console.log('Player' + socket.playerId + ' disconnected.');
            totalPlayers -= 1;
            if (totalPlayers < 1) {
                stack.length = 0;
                nSight = 0;

                console.log('Sights were reset to zero.');
            } else {
                stack.push(socket.playerId);
            }
        });
    });
}());