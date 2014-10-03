var g = 9.81;
var socket = io();

(function() {

    var Player = function(game, x, y, spriteSet) {

        this.uuid = Math.floor(Math.random() * 1000);
        this.width = 32;
        this.height = 48;
        // this.jump = false;
        this.position = {
            x: (x - this.width / 2) || 0,
            y: (y - this.height / 2) || 0
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
            current_mouvement: this.current_mouvement
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

    Player.prototype.HZ60 = 16;

    Player.prototype.moveup = function(modifier) {
        if (this.isMovingUp) {
            return false;
        } else {
            this.isMovingUp = true;
        }
        var before = this.position.y,
            self = this,
            t = 0,
            handle = setInterval(function() {
                t++;
                self.direction = 'up';
                self.position.y -= self.speed;
                if (self.position.y < 0) {
                    self.position.y = 0;
                }
                if (t > 4) {
                    self.isMovingUp = false;
                    clearInterval(handle);
                }
            }, this.HZ60);
        return true;
    };

    Player.prototype.movedown = function(modifier) {
        if (this.isMovingDown) {
            return false;
        } else {
            this.isMovingDown = true;
        }
        var before = this.position.y;
        var self = this;
        var t = 0,
            handle = setInterval(function() {
                t++;
                self.direction = 'down';
                self.position.y += self.speed;
                if (self.position.y > self.game.tileSize * self.game.height - self.height) {
                    self.position.y = self.game.tileSize * self.game.height - self.height;
                }
                if (t > 4) {
                    self.isMovingDown = false;
                    clearInterval(handle);
                }
            }, this.HZ60);
        return true;
    };

    Player.prototype.moveleft = function(modifier) {
        if (this.isMovingLeft) {
            return false;
        } else {
            this.isMovingLeft = true;
        }
        var before = this.position.x;
        var self = this;
        var t = 0,
            handle = setInterval(function() {
                t++;
                self.direction = 'left';
                self.position.x -= self.speed;
                if (self.position.x < 0) {
                    self.position.x = 0;
                }
                if (t > 4) {
                    self.isMovingLeft = false;
                    clearInterval(handle);
                }
            }, this.HZ60);
        return true;

    };

    Player.prototype.moveright = function(modifier) {
        if (this.isMovingRight) {
            return false;
        } else {
            this.isMovingRight = true;
        }
        var before = this.position.x;
        var self = this;
        var t = 0,
            handle = setInterval(function() {
                t++;
                self.direction = 'right';
                self.position.x += self.speed;
                if (self.position.x > self.game.tileSize * self.game.width - self.width) {
                    self.position.x = self.game.tileSize * self.game.width - self.width;
                }
                if (t > 4) {
                    self.isMovingRight = false;
                    clearInterval(handle);
                }
            }, this.HZ60);
        return true;

    };

    Player.prototype.idle = function(modifier) {
        this.current_mouvement = 1;
    };

    Player.prototype.movejump = function() {
        if (this.isJumping) {
            return false ;
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
            return true;
    };

    window.Player = Player;
})();

(function() {

    var Gustucru = function() {
        this.tileSize = 32;
        this.width = 15;
        this.height = 15;
        this.keys = {};
        this.totalScore = 0;
        this.player = new Player(this, this.width * this.tileSize / 2, this.height * this.tileSize / 2, 'javascripts/images/enemies' + Math.floor(Math.random() * 5) + ".png");
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
        this.canvas.width = this.width * this.tileSize;
        this.canvas.height = this.height * this.tileSize;
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

    Gustucru.prototype.update = function(modifier) {
        var moves = [];
        if (38 /*up*/ in gustucru.keys) {
            if (this.player.moveup(modifier)) {
                moves.push('up');
            }
        }
        if (40 /*down*/ in gustucru.keys) {
            if (this.player.movedown(modifier)) {
                moves.push('down');
            }
        }
        if (37 /*left*/ in gustucru.keys) {
            if (this.player.moveleft(modifier)) {
                moves.push('left');
            }
        }
        if (39 /*right*/ in gustucru.keys) {
            if (this.player.moveright(modifier)) {
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
        this.context.fillText("Score : " + this.totalScore, 10, this.height * this.tileSize - 10);
    }

    Gustucru.prototype.render = function() {
        this.canvas.width = this.canvas.width;
        this.drawBackground();
        this.drawPlayer();
        this.drawPlayers();
    };

    Gustucru.prototype.drawPlayer = function() {
        var current = (37 in gustucru.keys || 38 in gustucru.keys || 39 in gustucru.keys || 40 in gustucru.keys ? Math.floor(this.player.current_mouvement++/10)%3 : 1) ;
        var row = this.player.sprites[this.player.direction][current][0];
        var column = this.player.sprites[this.player.direction][current][1];

        this.context.drawImage(this.player.sprites.image, (this.player.width + 4) * column, 6 + (this.player.height * row), 32, 48,
            this.player.position.x, this.player.position.y,
            this.player.width, this.player.height);

    }

    Gustucru.prototype.drawPlayers = function() {
        for (var i in this.players) {
            var player = this.players[i];
            var current = Math.floor(player.current_mouvement /
                10) % 3;
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
