class GameConnection {
    constructor(url) {
        this.socket = new WebSocket('wss://codepath-mmorg.onrender.com');
        this.onPlayerUpdate = null;
        this.pressedKeys = new Set();
        this.currentPlayer = null;  // Store current player data

        // Add keyboard listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        this.socket.onopen = () => {
            console.log('Connected to game server');
            this.joinGame();
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);

            if (message.action === 'join_game' && message.success) {
                if (this.onPlayerUpdate) {
                    const player = message.players[message.playerId];
                    const avatarData = message.avatars[player.avatar];
                    
                    // Store initial player state
                    this.currentPlayer = {
                        id: message.playerId,
                        x: player.x,
                        y: player.y,
                        username: player.username,
                        avatar: player.avatar,
                        frames: avatarData.frames
                    };

                    this.onPlayerUpdate(this.currentPlayer);
                }
            } 
            else if (message.action === 'players_moved') {
                if (this.onPlayerUpdate && this.currentPlayer) {
                    // Get updated position for current player
                    const updatedPlayer = message.players[this.currentPlayer.id];
                    if (updatedPlayer) {
                        // Update position while keeping other data
                        this.currentPlayer = {
                            ...this.currentPlayer,
                            x: updatedPlayer.x,
                            y: updatedPlayer.y
                        };
                        
                        console.log('Player moved to:', this.currentPlayer.x, this.currentPlayer.y);
                        this.onPlayerUpdate(this.currentPlayer);
                    }
                }
            }
        };
    }

    handleKeyDown(event) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }

        if (this.pressedKeys.has(event.key)) {
            return;
        }

        this.pressedKeys.add(event.key);

        // Map arrow keys to exact direction strings the server expects
        switch (event.key) {
            case 'ArrowUp':
                this.movePlayer('up');
                break;
            case 'ArrowDown':
                this.movePlayer('down');
                break;
            case 'ArrowLeft':
                this.movePlayer('left');
                break;
            case 'ArrowRight':
                this.movePlayer('right');
                break;
        }
    }

    movePlayer(direction) {
        console.log('Sending move command:', direction);
        this.socket.send(JSON.stringify({
            action: 'move',
            direction: direction  // Using single letters: N, S, E, W
        }));
    }

    handleKeyUp(event) {
        this.pressedKeys.delete(event.key);
    }

    joinGame() {
        this.socket.send(JSON.stringify({
            action: 'join_game',
            username: 'Sangam'
        }));
    }
}
