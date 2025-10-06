class Game {
    constructor() {
        this.renderer = new Renderer();
        this.connection = new GameConnection();
        this.gameState = {
            player: null
        };

        // Set up connection callback
        this.connection.onPlayerUpdate = (playerData) => {
            console.log('Game received player update:', playerData);
            this.gameState.player = playerData;
        };

        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop() {
        this.renderer.render(this.gameState);
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Initialize game when window loads
window.onload = () => new Game();
