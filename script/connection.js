class GameConnection {
    constructor(url) {
        this.socket = new WebSocket('wss://codepath-mmorg.onrender.com');
        this.onPlayerUpdate = null;

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
                    
                    console.log('Processing join game:', {
                        playerId: message.playerId,
                        player: player,
                        avatarData: avatarData
                    });

                    this.onPlayerUpdate({
                        id: message.playerId,
                        x: player.x,
                        y: player.y,
                        username: player.username,
                        avatar: player.avatar,
                        frames: avatarData.frames
                    });
                }
            }
        };
    }

    joinGame() {
        this.socket.send(JSON.stringify({
            action: 'join_game',
            username: 'Sangam'
        }));
    }
}
