var g = 9.81;

(function() {

    var Player = function(x, y) {
        this.width = 32;
        this.height = 48;
        this.isOnGround = true;
        this.jump = false;
        this.jumpForce = -10;

        this.position = {
            x: (x - this.width / 2) || 0,
            y: (y - this.height / 2) || 0
        };
        this.size = 10;
        this.sprites = [];
        this.direction = 'down';
        this.current_mouvement = 0;
        this.sprites = {
            'url': 'javascripts/images/player.png',
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

    }
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
        this.player = new Player(this.width * this.tileSize / 2, this.height * this.tileSize / 2);
        this.enemies = [];
        this.initCanvas();
        this.initEvents();
        this.start();
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
// image.onerror = function() {
//     context.font = '50px "Vast Shadow"';
//     context.textBaseline = 'top';
//     context.fillText('Hello!', 20, 10);
// };

    }

    Canvex.prototype.initEvents = function() {
        window.addEventListener("keydown", function(e) {
            canvex.keys[e.keyCode] = true;
        }, false);

        window.addEventListener("keyup", function(e) {
            delete canvex.keys[e.keyCode];
        }, false);
    }

    Canvex.prototype.start = function() {
    }

    Canvex.prototype.update = function(modifier) {
        if (38 /*up*/ in canvex.keys) {
            this.player.position.y -= (this.tileSize * modifier);
            this.player.direction = 'up';
            if (this.player.position.y < 0) {
                this.player.position.y = 0;
            }
        }
        if (40 /*down*/ in canvex.keys) {
            this.player.position.y += (this.tileSize * modifier);
            this.player.direction = 'down';
            if (this.player.position.y > this.tileSize * this.height - this.player.height) {
                this.player.position.y = this.tileSize * this.height - this.player.height;
            }
        }
        if (37 /*left*/ in canvex.keys) {
            this.player.position.x -= (this.tileSize * modifier);
            this.player.direction = 'left';
            if (this.player.position.x < 0) {
                this.player.position.x = 0;
            }
        }
        if (39 /*right*/ in canvex.keys) {
            this.player.position.x += (this.tileSize * modifier);
            this.player.direction = 'right';
            if (this.player.position.x > this.tileSize * this.width - this.player.width) {
                this.player.position.x = this.tileSize * this.width - this.player.width;
            }
        }

        if (39 /*right*/ in canvex.keys) {
            this.player.position.x += (this.tileSize * modifier);
            this.player.direction = 'right';
            if (this.player.position.x > this.tileSize * this.width - this.player.width) {
                this.player.position.x = this.tileSize * this.width - this.player.width;
            }
        }

        if (32 /*space*/ in canvex.keys && !this.jump) {
            var self = this;
            self.jump = true;
            self.player.yBeforeJump = this.player.position.y;
            var t = 0, handle = setInterval(function() {
                t++;
                self.player.position.y = self.player.yBeforeJump - (((150) * t - (g / 2) * t * t)) / self.tileSize;
                if (self.player.position.y >= self.player.yBeforeJump) {
                    self.player.position.y = self.player.yBeforeJump;
                    self.jump = false;
                    clearInterval(handle);
                }
            }, 12);
        }

        var now = Date.now();
        this.lastEnemyDropped = this.lastEnemyDropped || now;
        if ((this.lastEnemyDropped - now) < -400) {
            this.lastEnemyDropped = now;
            var enemy = new Enemy();
            enemy.position.x = Math.random() * this.tileSize * this.width;
            enemy.position.y = -30;
            this.enemies.push(enemy);
        }
        this.lastMove = this.lastMove || now;
        if ((this.lastMove - now) < -5) {
            this.lastMove = now;
            this.moveEnemies();
        }
        this.detectCollision();
    }

    Canvex.prototype.drawScore = function() {
        this.context.font = '20px "silkscreennormal"';
        this.context.fillStyle = "black";
        this.context.fillText("Score : "+this.totalScore, 10, this.height * this.tileSize - 10);
    }

    Canvex.prototype.render = function() {
        this.canvas.width = this.canvas.width;
        this.drawBackground();
        this.drawPlayer();
        // this.drawEnemies();
        this.drawScore() ;

    };

    Canvex.prototype.detectCollision = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            if (
                this.player.position.x <= (this.enemies[i].position.x + this.enemies[i].size) &&
                this.enemies[i].position.x <= (this.player.position.x + this.player.x) &&
                this.player.position.y <= (this.enemies[i].position.y + this.enemies[i].size) &&
                this.enemies[i].position.y <= (this.player.position.y + this.player.size)
            ) {
                this.enemies.splice(i, 1);
                this.totalScore++;
            }
        }
    }

    Canvex.prototype.drawPlayer = function() {
        this.context.fillStyle = "orange";
        var current = (Object.keys(canvex.keys).length ? Math.floor(this.player.current_mouvement++/10)%3 : 1) ;
var row = this.player.sprites[this.player.direction][current][0] ;
var column =  this.player.sprites[this.player.direction][current][1] ;
this.context.drawImage(this.player.sprites.image,
(this.player.width + 4)*column, 6+(this.player.height*row), 32, 48,
this.player.position.x, this.player.position.y,
this.player.width, this.player.height);

}

Canvex.prototype.drawEnemies = function() {
this.context.fillStyle = "red";
for (var i = 0; i < this.enemies.length; i++) {
this.context.fillRect(this.enemies[i].position.x, this.enemies[i].position.y, this.enemies[i].size, this.enemies[i].size);
}
}

Canvex.prototype.moveEnemies = function(modifier) {
for (var i = 0; i < this.enemies.length; i++) {
this.enemies[i].position.x += ((2 * Math.random()) - 1) ;
this.enemies[i].position.y += 1;

if(this.enemies[i].position.y>this.height*this.tileSize){
delete this.enemies[i];
this.enemies.splice(i, 1) ;
}
}
}

Canvex.prototype.drawBackground = function() {
var dx = 0, dy = 0;
this.context.save();
this.context.translate(this.width*this.tileSize/2, this.height * this.tileSize / 16);
        this.context.scale(1, 0.5);
        this.context.rotate(45 * Math.PI / 180);
        for (var i = 0; i < this.width; i++) {
            for (var x = 0; x < this.height; x++) {
                this.context.strokeRect(dx, dy, 40, 40);
                this.context.fillStyle = "#DDDDDD";
                this.context.fillRect(dx, dy, 40, 40);
                dx += 40;
            }
            dx = 0;
            dy += 40;
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

    window.canvex = new Canvex();
    window.canvex.main();

})();