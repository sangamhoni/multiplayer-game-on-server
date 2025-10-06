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

    async loadAvatar(avatarData) {
        if (!avatarData || !avatarData.frames || !avatarData.frames.south) {
            console.error('No frames data:', avatarData);
            return null;
        }
        // Using the first frame of the south direction for simplicity
        const frame = avatarData.frames.south[0];

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load avatar frame'));
            img.src = frame;
        });
    }

    render(gameState, myPlayer) {
        if (!this.mapLoaded || !myPlayer) {
            return;
        }

        const viewport = this.calculateViewport(myPlayer.x, myPlayer.y);

        // Clear and draw world
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.worldMap, -viewport.x, -viewport.y);

        // Draw all players
        for (const playerId in gameState.players) {
            const player = gameState.players[playerId];
            const avatarData = gameState.avatars[player.avatar];

            if (this.avatarCache.has(player.avatar)) {
                this.drawPlayer(player, this.avatarCache.get(player.avatar), viewport);
            } else if (avatarData) {
                this.loadAvatar(avatarData)
                    .then(img => {
                        if (img) {
                            this.avatarCache.set(player.avatar, img);
                        }
                    })
                    .catch(console.error);
            }
        }
    }

    drawPlayer(player, img, viewport) {
        const x = player.x - viewport.x;
        const y = player.y - viewport.y;

        this.ctx.drawImage(img, x, y);

        // Draw username
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(player.username, x + img.width / 2, y - 10);
        this.ctx.fillText(player.username, x + img.width / 2, y - 10);
    }
}
