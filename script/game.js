class Game {
    constructor() {
        this.renderer = new Renderer();
        this.connection = new GameConnection();
        this.gameState = {
            player: null
        };

        // Set up connection callback
        this.connection.onPlayerUpdate = (playerData) => {
            console.log('Updating game state with player data:', playerData);
            this.gameState.player = playerData;
        };

        // Start game loop
        this.gameLoop();
    }

    gameLoop = () => {
        this.renderer.render(this.gameState);
        requestAnimationFrame(this.gameLoop);
    }
}

// Start the game when the window loads
window.onload = () => {
    new Game();
};
