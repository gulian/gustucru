var g = 9.81;
var socket = io();


(function() {

    var Player = function(game, x, y, spriteSet) {

        this.uuid = Math.floor(Math.random()*1000);
        this.width = 32;
        this.height = 48;
        // this.jump = false;
        this.position = {
            x: (x - this.width / 2) || 0,
            y: (y - this.height / 2) || 0
        };
        this.size = 10;
        this.sprites = [];
        this.direction = 'down';
        this.current_mouvement = 0;
        this.sprites = {
            'url': spriteSet ?  'javascripts/images/'+spriteSet+'.png' : 'javascripts/images/player.png',
            'up': [
                [0, 0],
                [0, 1],
                [0, 2]
            ],
            'right': [
                [1, 0],
                [1, 1],
                [1, 2]
            ],
            'down': [
                [2, 0],
                [2, 1],
                [2, 2]
            ],
            'left': [
                [3, 0],
                [3, 1],
                [3, 2]
            ],
            'images': null
        }

        this.sprites.image = new Image();
        this.sprites.image.src = this.sprites.url;
        this.game = game;

    }
    Player.prototype.light = function() {
        return {
            position : this.position,
            uuid : this.uuid,
            direction: this.direction,
            current_mouvement: this.current_mouvement
        }
    };
    Player.prototype.speak = function(text) {
        var self = this;
        if (self.speech) {
            return false;
        }
        self.speech = text;
        setTimeout(function() {
            delete self.speech;
        }, 2000);
    };
    Player.prototype.update = function(player) {
        for(var attr in player){
            this[attr] = player[attr];
        }

    };

    Player.prototype.moveUp = function(modifier) {
        this.position.y -= (this.game.tileSize * modifier);
        this.direction = 'up';
        if (this.position.y < 0) {
            this.position.y = 0;
        }
    };

    Player.prototype.moveDown = function(modifier) {
        this.position.y += (this.game.tileSize * modifier);
        this.direction = 'down';
        if (this.position.y > this.game.tileSize * this.game.height - this.height) {
            this.position.y = this.game.tileSize * this.game.height - this.height;
        }
    };

    Player.prototype.moveLeft = function(modifier) {

        this.position.x -= (this.game.tileSize * modifier);
        this.direction = 'left';
        if (this.position.x < 0) {
            this.position.x = 0;
        }
    };

    Player.prototype.moveRight = function(modifier) {

        this.position.x += (this.game.tileSize * modifier);
        this.direction = 'right';
        if (this.position.x > this.game.tileSize * this.game.width - this.width) {
            this.position.x = this.game.tileSize * this.game.width - this.width;
        }
    };

    Player.prototype.idle = function(modifier) {
        this.current_mouvement = 1 ;
    };

    Player.prototype.jump = function() {
        if (this.isJumping) {
            return;
        }
        var self = this;
        self.isJumping = true;
        self.yBeforeJump = this.position.y;
        var t = 0,
            handle = setInterval(function() {
                t++;
                self.position.y = self.yBeforeJump - (((150) * t - (g / 2) * t * t)) / self.game.tileSize;
                if (self.position.y >= self.yBeforeJump) {
                    self.position.y = self.yBeforeJump;
                    self.isJumping = false;
                    clearInterval(handle);
                }
            }, 12);
    };

    window.Player = Player;
})();


(function() {
    var Enemy = function() {
        this.position = {
            x: 0,
            y: 0
        };
        this.size = 32;
    }
    Enemy.prototype.init = function() {}
    window.Enemy = Enemy;
})();

(function() {

        var Canvex = function() {
            this.tileSize = 32;
            this.width = 10;
            this.height = 10;
            this.difficulty = 1;
            this.keys = {};
            this.totalScore = 0;
            this.player = new Player(this, this.width * this.tileSize / 2, this.height * this.tileSize / 2);
            this.enemies = [];
            this.players = {};
            this.initCanvas();
            this.initEvents();
            this.start();
            var self = this;

            socket.emit('newplayer', this.player.light());

            socket.on('players', function(players){
                for (var i in players) {
                    if(self.players[i]){
                        self.players[i].update(players[i]);
                    } else {
                        var myPlayer = new Player(self, players[i].position.x, players[i].position.y, 'enemies'+ Math.floor(Math.random()*4))  ;
                        myPlayer.uuid =  players[i].uuid ;
                        self.players[i] = myPlayer ;
                    }
                }
            });

            socket.on('newplayer', function(player){
                if(player.uuid == self.player.uuid || self.players[player.uuid]){
                    return ;
                }
                var myPlayer = new Player(self, player.position.x, player.position.y, 'enemies'+ Math.floor(Math.random()*4))  ;
                myPlayer.uuid =  player.uuid ;
                self.players[player.uuid] = myPlayer ;
            });

            socket.on('deleteplayer', function(player){
                if(self.players[player.uuid]){
                    delete self.players[player.uuid];
                }
            });

            socket.on('playerupdate', function(player){
                if(!self.players[player.uuid]){
                    return ;
                }
                self.players[player.uuid].update(player);
            });

        }

        Canvex.prototype.initCanvas = function() {
            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext("2d");
            this.canvas.width = this.width * this.tileSize;
            this.canvas.height = this.height * this.tileSize;
            document.body.appendChild(this.canvas);

            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = 'fonts/slkscr.css';
            document.getElementsByTagName('head')[0].appendChild(link);
            var context = this.context;
            var image = new Image;
            image.src = link.href;

        }

        Canvex.prototype.initEvents = function() {
            window.addEventListener("keydown", function(e) {
                canvex.keys[e.keyCode] = true;
            }, false);

            window.addEventListener("keyup", function(e) {
                delete canvex.keys[e.keyCode];
            }, false);
        }

        Canvex.prototype.start = function() {}

        Canvex.prototype.update = function(modifier) {
            var sendUpdate = false ;
            if (38 /*up*/ in canvex.keys) {
                this.player.moveUp(modifier);
                sendUpdate = true ;
            }
            if (40 /*down*/ in canvex.keys) {
                this.player.moveDown(modifier);
                sendUpdate = true ;
            }
            if (37 /*left*/ in canvex.keys) {
                this.player.moveLeft(modifier);
                sendUpdate = true ;
            }
            if (39 /*right*/ in canvex.keys) {
                this.player.moveRight(modifier);
                sendUpdate = true ;
            }
            if (32 /*space*/ in canvex.keys) {
                this.player.jump();
                sendUpdate = true ;
            }

            if(!Object.keys(canvex.keys).length){
                this.player.idle();
            } else {
                this.current_mouvement++;
            }

            // if (83 /*'s'*/ in canvex.keys) {
            //     this.player.speak("LOL ca va ?");
            // }

            var now = Date.now();

            this.lastSentMove = this.lastSentMove || now;
            if ((this.lastSentMove - now) < -20) {
                socket.emit('playerupdate', this.player.light());
                this.lastSentMove = now;
            }

            // var now = Date.now();
            // this.lastEnemyDropped = this.lastEnemyDropped || now;
            // if ((this.lastEnemyDropped - now) < -1500) {
            //     this.lastEnemyDropped = now;
            //     var enemy = new Player(this, Math.random() * this.tileSize * this.width, -30, 'enemies'+ Math.floor(Math.random()*4));
            //     this.enemies.push(enemy);
            // }
            // this.lastMove = this.lastMove || now;
            // if ((this.lastMove - now) < -5) {
            //     this.lastMove = now;
            //     this.moveEnemies();
            // }
            // this.detectCollision();
        }

        Canvex.prototype.drawScore = function() {
            this.context.font = '20px "silkscreennormal"';
            this.context.fillStyle = "black";
            this.context.fillText("Score : " + this.totalScore, 10, this.height * this.tileSize - 10);
        }

        Canvex.prototype.roundRect = function(x, y, width, height, radius, fill, stroke) {
            this.context.strokeStyle = "gray";
            this.context.fillStyle = "white";
            if (typeof stroke == "undefined") {
                stroke = true;
            }
            if (typeof radius === "undefined") {
                radius = 5;
            }
            this.context.beginPath();
            this.context.moveTo(x + radius, y);
            this.context.lineTo(x + width - radius, y);
            this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.context.lineTo(x + width, y - height - radius);
            this.context.quadraticCurveTo(x + width, y - height, x + width - radius, y - height);
            this.context.lineTo(x + radius, y - height);
            this.context.quadraticCurveTo(x, y - height, x, y - height - radius);
            this.context.lineTo(x, y + radius);
            this.context.quadraticCurveTo(x, y, x + radius, y);
            this.context.closePath();
            if (stroke) {
                this.context.stroke();
            }
            if (fill) {
                this.context.fill();
            }
        }

        Canvex.prototype.drawSpeech = function() {
            if (!this.player.speech) {
                return false;
            }
            var fontSize = 15,
                charPerLine = 10,
                w = this.player.speech.length * fontSize,
                h = (this.player.speech.length / charPerLine) * (fontSize * 5),
                l = 30,
                t = 5,
                pad = 3,
                pos = 'rt'; // pos in ['rt', 'rb', 'lt', 'lb']

            this.roundRect(this.player.position.x + l, this.player.position.y - t, w * 0.75, fontSize, null, true);
            this.context.font = fontSize + 'px "silkscreennormal"';
            this.context.fillStyle = "black";
            this.context.fillText(this.player.speech, this.player.position.x + l + pad, this.player.position.y - fontSize * 0.75);
        }

        Canvex.prototype.render = function() {
            this.canvas.width = this.canvas.width;
            this.drawBackground();
            this.drawPlayer();
            this.drawPlayers();
            // this.drawSpeech();
            this.drawEnemies();
            this.drawScore();

        };

        Canvex.prototype.detectCollision = function() {
            var margin = -10;
            for (var i = 0; i < this.enemies.length; i++) {
                if (
                    this.player.position.x <= (this.enemies[i].position.x + this.enemies[i].width + margin )
                    &&
                    this.enemies[i].position.x <= (this.player.position.x + this.player.width + margin )
                    &&
                    this.player.position.y <= (this.enemies[i].position.y + this.enemies[i].height + margin )
                    &&
                    this.enemies[i].position.y <= (this.player.position.y + this.player.height + margin )
                ) {
                    this.enemies.splice(i, 1);
                    this.totalScore++;
                }
            }
        } ;

        Canvex.prototype.drawPlayer = function() {
            var current = (37 in canvex.keys || 38 in canvex.keys || 39 in canvex.keys || 40 in canvex.keys ? Math.floor(this.player.current_mouvement++/10)%3 : 1) ;
        var row = this.player.sprites[this.player.direction][current][0];
        var column = this.player.sprites[this.player.direction][current][1];

        this.context.drawImage(this.player.sprites.image, (this.player.width + 4) * column, 6 + (this.player.height * row), 32, 48,
            this.player.position.x, this.player.position.y,
            this.player.width, this.player.height);

    }

    Canvex.prototype.drawEnemies = function() {
        this.context.fillStyle = "red";
        for (var i = 0; i < this.enemies.length; i++) {

        var current = Math.floor(this.enemies[i].current_mouvement/10) % 3;
            var row = this.enemies[i].sprites[this.enemies[i].direction][current][0];
            var column = this.enemies[i].sprites[this.enemies[i].direction][current][1];

            this.context.drawImage(this.enemies[i].sprites.image, (this.enemies[i].width + 4) * column, 6 + (this.enemies[i].height * row), 32, 48,
                this.enemies[i].position.x, this.enemies[i].position.y,
                this.enemies[i].width, this.enemies[i].height);
        }
    }

    Canvex.prototype.drawPlayers = function() {
        this.context.fillStyle = "red";
        for (var i in this.players) {

        var player =  this.players[i];
        var current = Math.floor(player.current_mouvement/10) % 3;
            var row = player.sprites[player.direction][current][0];
            var column = player.sprites[player.direction][current][1];

            this.context.drawImage(player.sprites.image, (player.width + 4) * column, 6 + (player.height * row), 32, 48,
                player.position.x, player.position.y,
                player.width, player.height);
        }
    }

    Canvex.prototype.moveEnemies = function(modifier) {
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].position.y += 1;
            if (this.enemies[i].position.y > this.height * this.tileSize) {
                delete this.enemies[i];
                this.enemies.splice(i, 1);
                this.totalScore--;
            }
        }
    }

    Canvex.prototype.drawBackground = function() {
        var dx = 0,
            dy = 0;
        this.context.save();
        this.context.translate(this.width * this.tileSize /
            2, this.height * this.tileSize / 16);
        this.context.scale(1, 0.5);
        this.context.rotate(45 * Math.PI / 180);
        for (var i = 0; i < this.width; i++) {
            for (var x = 0; x < this.height; x++) {
                this.context.strokeRect(dx, dy, this.tileSize, this.tileSize);
                this.context.fillStyle = "#DDDDDD";
                this.context.fillRect(dx, dy, this.tileSize, this.tileSize);
                dx += this.tileSize;
            }
            dx = 0;
            dy += this.tileSize;
        }
        this.context.restore();
    }

    Canvex.prototype.main = function() {
        this.then = this.then || 0;
        var now = Date.now();
        var delta = now - this.then;
        canvex.update(delta / 200);
        canvex.render();
        this.then = now;
        window.requestAnimationFrame(canvex.main);
    };

    window.canvex = new Canvex(); window.canvex.main();

})();