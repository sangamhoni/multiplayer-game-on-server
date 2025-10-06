class Renderer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.worldMap = new Image();
        this.worldMap.src = './assets/world.jpg';
        this.mapLoaded = false;
        this.avatarCache = new Map();

        this.worldMap.onload = () => {
            console.log('World map loaded');
            this.mapLoaded = true;
        };

        window.addEventListener('resize', this.resizeCanvas.bind(this));
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    calculateViewport(playerX, playerY) {
        return {
            x: Math.max(0, Math.min(playerX - this.canvas.width / 2, 2048 - this.canvas.width)),
            y: Math.max(0, Math.min(playerY - this.canvas.height / 2, 2048 - this.canvas.height))
        };
    }

    async loadAvatar(playerData) {
        if (!playerData.frames || !playerData.frames.south) {
            console.error('No frames data:', playerData);
            return null;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load avatar frame'));
            img.src = playerData.frames.south[0];
        });
    }

    render(gameState) {
        if (!this.mapLoaded || !gameState.player) {
            return;
        }

        const viewport = this.calculateViewport(gameState.player.x, gameState.player.y);

        // Clear and draw world
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.worldMap, -viewport.x, -viewport.y);

        // Handle player rendering
        if (this.avatarCache.has(gameState.player.id)) {
            this.drawPlayer(gameState.player, viewport);
        } else if (gameState.player.frames) {
            this.loadAvatar(gameState.player)
                .then(img => {
                    if (img) {
                        this.avatarCache.set(gameState.player.id, img);
                    }
                })
                .catch(console.error);
        }
    }

    drawPlayer(player, viewport) {
        const img = this.avatarCache.get(player.id);
        if (!img) return;

        const x = player.x - viewport.x;
        const y = player.y - viewport.y;

        this.ctx.drawImage(img, x, y);

        // Draw username
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(player.username, x + img.width/2, y - 10);
        this.ctx.fillText(player.username, x + img.width/2, y - 10);
    }
}
