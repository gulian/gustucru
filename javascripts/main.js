var g = 9.81;
var socket = io();

(function() {

    var Player = function(game, x, y, spriteSet) {

        this.uuid = Math.floor(Math.random() * 1000);
        this.width = 32;
        this.height = 48;
        // this.jump = false;
        this.position = {
            x: x || 0,
            y: y || 0
        };
        this.size = 10;
        this.speed = 7;
        this.sprites = [];
        this.direction = 'down';
        this.current_mouvement = 0;
        this.spriteSet = spriteSet || 'javascripts/images/enemies4.png';
        this.sprites = {
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
        this.sprites.image.src = this.spriteSet;
        this.game = game;

    }

    Player.prototype.light = function() {
        return {
            position: this.position,
            uuid: this.uuid,
            direction: this.direction,
            spriteSet: this.spriteSet,
            // current_mouvement: this.current_mouvement
        }
    };

    Player.prototype.superlightupdate = function(moves) {
        return {
            position: this.position,
            uuid: this.uuid,
            moves: moves
        }
    };

    Player.prototype.update = function(player) {
        for (var attr in player) {
            this[attr] = player[attr];
        }

    };

    Player.prototype.freshRate = 20;

    Player.prototype.moveup = function() {
        if (this.isMoving) {
            return false;
        } else {
            this.isMoving = true;
        }
            player = this,
            t = 0,
            handle = setInterval(function() {
                t++;
                player.direction = 'up';
                player.current_mouvement++;
                player.position.y -= player.speed;
                if (player.position.y < 0) {
                    player.position.y = 0;
                }
                if (t > 5) {
                    player.isMoving = false;
                    clearInterval(handle);
                }
            }, this.freshRate);
        return true;
    };

    Player.prototype.movedown = function() {
        if (this.isMoving) {
            return false;
        } else {
            this.isMoving = true;
        }
        var player = this;
        var t = 0,
            handle = setInterval(function() {
                t++;
                player.direction = 'down';
                player.current_mouvement++;
                player.position.y += player.speed;
                if (player.position.y > player.game.height - player.height) {
                    player.position.y = player.game.height - player.height;
                }
                if (t > 5) {
                    player.isMoving = false;
                    clearInterval(handle);
                }
            }, this.freshRate);
        return true;
    };

    Player.prototype.moveleft = function() {
        if (this.isMoving) {
            return false;
        } else {
            this.isMoving = true;
        }
        var player = this;
        var t = 0,
            handle = setInterval(function() {
                t++;
                player.direction = 'left';
                player.current_mouvement++;
                player.position.x -= player.speed;
                if (player.position.x < 0) {
                    player.position.x = 0;
                }
                if (t > 5) {
                    player.isMoving = false;
                    clearInterval(handle);
                }
            }, this.freshRate);
        return true;

    };

    Player.prototype.moveright = function() {
        if (this.isMoving) {
            return false;
        } else {
            this.isMoving = true;
        }
        var player = this;
        var t = 0,
            handle = setInterval(function() {
                t++;
                player.direction = 'right';
                player.current_mouvement++;
                player.position.x += player.speed;
                if (player.position.x > player.game.width - player.width) {
                    player.position.x = player.game.width - player.width;
                }
                if (t > 5) {
                    player.isMoving = false;
                    clearInterval(handle);
                }
            }, this.freshRate);
        return true;

    };

    Player.prototype.movejump = function() {
        if (this.isJumping) {
            return false ;
        }
        var player = this;
        player.isJumping = true;
        player.yBeforeJump = this.position.y;
        var t = 0,
            handle = setInterval(function() {
                t++;
                player.position.y = player.yBeforeJump - (((150) * t - (g / 2) * t * t)) / 32;
                if (player.position.y >= player.yBeforeJump) {
                    player.position.y = player.yBeforeJump;
                    player.isJumping = false;
                    clearInterval(handle);
                }
            }, 12);
            return true;
    };

    window.Player = Player;
})();

(function() {

    var Gustucru = function() {
        this.width = 440;
        this.height = 440;
        this.keys = {};
        this.totalScore = 0; 
        this.player = new Player(this, this.width  / 2, this.height  / 2, 'javascripts/images/enemies' + Math.floor(Math.random() * 5) + ".png");
        this.enemies = [];
        this.players = {};

        var self = this;

        socket.emit('newplayer', this.player.light());

        socket.on('players', function(players) {
            for (var i in players) {
                if (gustucru.players[i]) {
                    gustucru.players[i].update(players[i]);
                } else {
                    var myPlayer = new Player(gustucru, players[i].position.x, players[i].position.y, players[i].spriteSet);
                    myPlayer.uuid = players[i].uuid;
                    gustucru.players[i] = myPlayer;
                }
            }
        });

        socket.on('newplayer', function(player) {
            if (player.uuid == gustucru.player.uuid || gustucru.players[player.uuid]) {
                return;
            }
            var myPlayer = new Player(gustucru, player.position.x, player.position.y, player.spriteSet);
            myPlayer.uuid = player.uuid;
            gustucru.players[player.uuid] = myPlayer;
        });

        socket.on('deleteplayer', function(player) {
            if (gustucru.players[player.uuid]) {
                delete gustucru.players[player.uuid];
            }
        });

        socket.on('playerupdate', function(player) {
            if (!gustucru.players[player.uuid]) {
                return;
            }
            for (var i = 0; i < player.moves.length; i++) {
                gustucru.players[player.uuid]["move" + player.moves[i]]();

            };
        });

        this.initCanvas();
        this.initEvents();
    }

    Gustucru.prototype.initCanvas = function() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = this.width ;
        this.canvas.height = this.height ;
        document.body.appendChild(this.canvas);

        this.background = new Image();
        this.background.src = "javascripts/images/background.jpg";

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'fonts/slkscr.css';
        document.getElementsByTagName('head')[0].appendChild(link);
        var context = this.context;
        var image = new Image;
        image.src = link.href;
    }

    Gustucru.prototype.initEvents = function() {
        window.addEventListener("keydown", function(e) {
            gustucru.keys[e.keyCode] = true;
        }, false);

        window.addEventListener("keyup", function(e) {
            delete gustucru.keys[e.keyCode];
        }, false);
    }

    Gustucru.prototype.update = function() {
        var moves = [];
        if (38 /*up*/ in gustucru.keys) {
            if (this.player.moveup()) {
                moves.push('up');
            }
        }
        if (40 /*down*/ in gustucru.keys) {
            if (this.player.movedown()) {
                moves.push('down');
            }
        }
        if (37 /*left*/ in gustucru.keys) {
            if (this.player.moveleft()) {
                moves.push('left');
            }
        }
        if (39 /*right*/ in gustucru.keys) {
            if (this.player.moveright()) {
                moves.push('right');
            }
        }
        if (32 /*space*/ in gustucru.keys) {
            if (this.player.movejump()) {
                moves.push('jump');
            }
        }
        if (moves.length) {
            socket.emit('playerupdate', this.player.superlightupdate(moves));
        }
    }

    Gustucru.prototype.drawScore = function() {
        this.context.font = '20px "silkscreennormal"';
        this.context.fillStyle = "black";
        this.context.fillText("Score : " + this.totalScore, 10, this.height  - 10);
    }

    Gustucru.prototype.render = function() {
        this.canvas.width = this.canvas.width;
        this.drawBackground();
        this.drawPlayer();
        this.drawPlayers();
    };

    Gustucru.prototype.drawPlayer = function() {
        var current = (37 in gustucru.keys || 38 in gustucru.keys || 39 in gustucru.keys || 40 in gustucru.keys ? Math.floor(this.player.current_mouvement/5)%3 : 1) ;
        var row = this.player.sprites[this.player.direction][current][0];
        var column = this.player.sprites[this.player.direction][current][1];

        this.context.drawImage(this.player.sprites.image, (this.player.width + 4) * column, 6 + (this.player.height * row), 32, 48,
            this.player.position.x, this.player.position.y,
            this.player.width, this.player.height);
    }

    Gustucru.prototype.drawPlayers = function() {
        for (var i in this.players) {
            var player = this.players[i];
            var current = Math.floor(player.current_mouvement/5) % 3;
            var row = player.sprites[player.direction][current][0];
            var column = player.sprites[player.direction][current][1];

            this.context.drawImage(player.sprites.image, (player.width + 4) * column, 6 + (player.height * row), 32, 48,
                player.position.x, player.position.y,
                player.width, player.height);
        }
    }

    Gustucru.prototype.drawBackground = function() {
        this.context.drawImage(this.background, -25, -70);
    }

    Gustucru.prototype.main = function() {
        gustucru.update();
        gustucru.render();
        window.requestAnimationFrame(gustucru.main, this.canvas);
    };

    window.gustucru = new Gustucru();
    window.gustucru.main();

})();
