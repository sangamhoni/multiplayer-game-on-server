class Game {
    constructor() {
        this.renderer = new Renderer();
        this.connection = new GameConnection();
        this.gameState = {
            players: {},
            avatars: {}
        };

        // Set up connection callback
        this.connection.onGameStateUpdate = (update) => {
            console.log('Game received state update:', update);
            if (update.players) {
                this.gameState.players = { ...this.gameState.players, ...update.players };
            }
            if (update.avatars) {
                this.gameState.avatars = { ...this.gameState.avatars, ...update.avatars };
            }
            if (update.playerLeftId) {
                delete this.gameState.players[update.playerLeftId];
            }
        };

        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop() {
        const currentPlayerId = this.connection.currentPlayerId;
        const myPlayer = this.gameState.players[currentPlayerId];
        this.renderer.render(this.gameState, myPlayer);
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Initialize game when window loads
window.onload = () => new Game();