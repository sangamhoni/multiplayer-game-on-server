class GameConnection {
    constructor(url) {
        this.socket = new WebSocket('wss://codepath-mmorg.onrender.com');
        this.onGameStateUpdate = null; // New callback for all game state updates
        this.pressedKeys = new Set();
        this.currentPlayerId = null; // Store current player ID

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
                this.currentPlayerId = message.playerId;
                if (this.onGameStateUpdate) {
                    // Initial game state with all players and avatars
                    this.onGameStateUpdate({
                        players: message.players,
                        avatars: message.avatars
                    });
                }
            }
            else if (message.action === 'players_moved') {
                if (this.onGameStateUpdate) {
                    this.onGameStateUpdate({ players: message.players });
                }
            }
            else if (message.action === 'player_joined') {
                const newPlayer = { [message.player.id]: message.player };
                const newAvatar = { [message.avatar.name]: message.avatar };
                if (this.onGameStateUpdate) {
                    this.onGameStateUpdate({
                        players: newPlayer,
                        avatars: newAvatar
                    });
                }
            }
            else if (message.action === 'player_left') {
                if (this.onGameStateUpdate) {
                    this.onGameStateUpdate({ playerLeftId: message.playerId });
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
            direction: direction
        }));
    }

    handleKeyUp(event) {
        this.pressedKeys.delete(event.key);
        this.socket.send(JSON.stringify({ action: 'stop' }));
    }

    joinGame() {
        this.socket.send(JSON.stringify({
            action: 'join_game',
            username: 'Sangam'
        }));
    }
}
