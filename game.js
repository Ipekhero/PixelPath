document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    // --- Game Configuration ---
    const TILE_WIDTH = 64;
    const TILE_HEIGHT = TILE_WIDTH / 2;
    let zoom = 1.0;
    let messageVisible = false;

    // --- Map Data ---
    // 0: Grass, 1: Path, 2: Water, 3: Tree, 4: Flowers, 5: Hut, 6: Sign
    const map = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 3, 3, 3, 3, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 3, 4, 3, 4, 3, 0, 0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 4, 1, 0, 3, 4, 3, 4, 3, 3, 0, 0, 0, 0],
        [0, 3, 3, 4, 3, 3, 0, 0, 1, 0, 3, 3, 3, 0, 0, 3, 0, 0, 1, 0, 3, 3, 4, 3, 3, 3, 0, 0, 0, 0],
        [0, 3, 4, 3, 4, 3, 0, 6, 1, 0, 0, 4, 0, 0, 0, 3, 0, 0, 1, 0, 0, 3, 4, 3, 0, 0, 0, 0, 0, 0],
        [0, 3, 3, 3, 3, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 5, 0, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 2],
        [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 1, 2],
        [2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 4, 4, 1, 1, 2],
        [0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
        [0, 0, 4, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 3, 3, 3, 3, 3, 3, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 1, 4, 2, 2],
        [0, 0, 0, 5, 0, 2, 1, 1, 1, 0, 3, 4, 4, 4, 4, 3, 0, 0, 1, 0, 4, 0, 2, 0, 0, 2, 1, 1, 2, 2],
        [0, 3, 0, 3, 0, 2, 1, 1, 1, 0, 3, 4, 4, 4, 4, 3, 0, 0, 1, 0, 0, 0, 2, 0, 0, 2, 1, 1, 2, 2],
        [0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 3, 3, 3, 3, 3, 3, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 1, 4, 2, 2],
        [0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
        [2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 1, 1, 2],
        [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 1, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 6, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
        [0, 3, 3, 3, 3, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2],
        [0, 3, 4, 3, 4, 3, 0, 0, 1, 0, 0, 4, 0, 0, 0, 3, 0, 0, 1, 0, 0, 3, 4, 3, 0, 0, 0, 0, 0, 0],
        [0, 3, 3, 4, 3, 3, 0, 0, 1, 0, 3, 3, 3, 0, 0, 3, 0, 0, 1, 0, 3, 3, 4, 3, 3, 3, 0, 0, 0, 0],
        [0, 3, 4, 3, 4, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 3, 4, 3, 4, 3, 3, 0, 0, 0, 0],
        [0, 3, 3, 3, 3, 3, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const MAP_ROWS = map.length;
    const MAP_COLS = map[0].length;

    // --- Player ---
    const player = {
        x: 15, // map x
        y: 20, // map y
        width: 16,
        height: 24,
        color: '#ff6347', // Tomato color
        shadowColor: 'rgba(0,0,0,0.3)'
    };

    // --- Message Data ---
    const messages = {
        5: "A cozy-looking hut. The door is locked.",
        6: "The sign reads: 'Welcome to Pixel Valley!'"
    };

    // --- Camera ---
    const camera = {
        x: 0,
        y: 0
    };

    // --- Utility Functions ---

    // Convert 2D map coordinates to isometric screen coordinates
    function toIsometric(x, y) {
        const isoX = (x - y) * (TILE_WIDTH / 2);
        const isoY = (x + y) * (TILE_HEIGHT / 2);
        return { x: isoX, y: isoY };
    }

    // --- Drawing Functions ---

    // Draws a single isometric tile (a rhombus)
    function drawTile(x, y, color, highlight = '#ffffff') {
        ctx.save();
        ctx.translate(x, y);

        // Top face
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(TILE_WIDTH / 2, TILE_HEIGHT / 2);
        ctx.lineTo(0, TILE_HEIGHT);
        ctx.lineTo(-TILE_WIDTH / 2, TILE_HEIGHT / 2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Left face
        ctx.beginPath();
        ctx.moveTo(-TILE_WIDTH / 2, TILE_HEIGHT / 2);
        ctx.lineTo(0, TILE_HEIGHT);
        ctx.lineTo(0, TILE_HEIGHT + TILE_HEIGHT);
        ctx.lineTo(-TILE_WIDTH / 2, TILE_HEIGHT / 2 + TILE_HEIGHT);
        ctx.closePath();
        ctx.fillStyle = shadeColor(color, -20);
        ctx.fill();

        // Right face
        ctx.beginPath();
        ctx.moveTo(TILE_WIDTH / 2, TILE_HEIGHT / 2);
        ctx.lineTo(0, TILE_HEIGHT);
        ctx.lineTo(0, TILE_HEIGHT + TILE_HEIGHT);
        ctx.lineTo(TILE_WIDTH / 2, TILE_HEIGHT / 2 + TILE_HEIGHT);
        ctx.closePath();
        ctx.fillStyle = shadeColor(color, -40);
        ctx.fill();

        ctx.restore();
    }

    // Draws a hut
    function drawHut(x, y) {
        const wallColor = '#a87550';
        const roofColor = '#d46a6a';
        const height = 40;
        const width = 25;
        const topY = y - height;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE_HEIGHT, width * 1.5, width * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Walls
        ctx.fillStyle = shadeColor(wallColor, -20);
        ctx.fillRect(x - width, topY, width * 2, height + TILE_HEIGHT);
        
        // Roof
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(x, topY - height / 1.5);
        ctx.lineTo(x + width + 10, topY + 5);
        ctx.lineTo(x - width - 10, topY + 5);
        ctx.closePath();
        ctx.fill();
    }

    // Draws a sign
    function drawSign(x, y) {
         // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE_HEIGHT, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Post
        ctx.fillStyle = '#6b432a';
        ctx.fillRect(x - 2, y - 20, 4, 20 + TILE_HEIGHT);

        // Board
        ctx.fillStyle = '#a87550';
        ctx.fillRect(x-15, y - 22, 30, 15);
        ctx.fillStyle = '#fff';
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", x, y - 13);
    }

    // Draws scenery objects like trees or flowers
    function drawObject(x, y, color, height, width) {
        const topY = y - height;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE_HEIGHT, width * 1.2, width * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Trunk/Stem
        ctx.fillStyle = shadeColor(color, -50);
        ctx.fillRect(x - width/4, topY, width/2, height + TILE_HEIGHT);

        // Top part
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, topY - height / 2);
        ctx.lineTo(x + width, topY);
        ctx.lineTo(x, topY + height / 2);
        ctx.lineTo(x - width, topY);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draws the player character
    function drawPlayer(isoX, isoY) {
         // Player shadow
        ctx.fillStyle = player.shadowColor;
        ctx.beginPath();
        ctx.ellipse(isoX, isoY + TILE_HEIGHT, player.width * 0.6, player.width * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Player body
        const playerTopY = isoY - player.height + TILE_HEIGHT;
        ctx.fillStyle = player.color;
        ctx.fillRect(isoX - player.width / 2, playerTopY, player.width, player.height);

        // Draw voluminous hair
        const hairColor = '#8B4513'; // Brown hair color
        const hairTopY = playerTopY - 12; // Hair starts above the head

        // Main hair mass (top of head)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.ellipse(isoX, hairTopY + 2, player.width * 0.8, player.width * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left side hair
        ctx.beginPath();
        ctx.ellipse(isoX - 8, hairTopY + 4, player.width * 0.4, player.width * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right side hair
        ctx.beginPath();
        ctx.ellipse(isoX + 8, hairTopY + 4, player.width * 0.4, player.width * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Back hair (longer strands)
        ctx.beginPath();
        ctx.ellipse(isoX, hairTopY + 8, player.width * 0.7, player.width * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair texture/highlights
        ctx.fillStyle = shadeColor(hairColor, 20);
        ctx.beginPath();
        ctx.ellipse(isoX - 3, hairTopY + 1, player.width * 0.3, player.width * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(isoX + 4, hairTopY + 2, player.width * 0.25, player.width * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Simple face (moved down slightly to account for hair)
        ctx.fillStyle = '#fff';
        ctx.fillRect(isoX - 4, playerTopY + 8, 3, 3);
        ctx.fillRect(isoX + 1, playerTopY + 8, 3, 3);

        // Simple mouth
        ctx.fillStyle = '#000';
        ctx.fillRect(isoX - 2, playerTopY + 12, 4, 1);
    }

    // Utility to darken/lighten a color
    function shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;
        
        R = (R > 0) ? R : 0;
        G = (G > 0) ? G : 0;
        B = (B > 0) ? B : 0;

        const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    // --- Main Render Loop ---
    function render() {
        // Clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Center camera on player
        const playerIso = toIsometric(player.x, player.y);
        camera.x = canvas.width / 2 - playerIso.x * zoom;
        camera.y = canvas.height / 2 - playerIso.y * zoom;
        
        ctx.translate(camera.x, camera.y);
        ctx.scale(zoom, zoom);
        
        // --- Draw Map and Objects ---
        // We draw objects in a separate pass to handle Z-ordering correctly
        const objectsToDraw = [];

        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                const iso = toIsometric(x, y);
                const tileType = map[y][x];

                // Draw base tile
                switch (tileType) {
                    case 0: // Grass
                        drawTile(iso.x, iso.y, '#65C45B');
                        break;
                    case 1: // Path
                        drawTile(iso.x, iso.y, '#E7D6A3');
                        break;
                    case 2: // Water
                        drawTile(iso.x, iso.y, '#67D4E1');
                        break;
                    case 3: // Tree placeholder
                    case 4: // Flower placeholder
                    case 5: // Hut placeholder
                    case 6: // Sign placeholder
                        drawTile(iso.x, iso.y, '#65C45B'); // Draw grass underneath
                        break;
                }

                // Add objects to the draw queue
                if (y === Math.floor(player.y) && x === Math.floor(player.x)) {
                    objectsToDraw.push({type: 'player', iso});
                }
                
                if (tileType === 3) {
                    objectsToDraw.push({type: 'tree', iso});
                } else if (tileType === 4) {
                     objectsToDraw.push({type: 'flower', iso});
                } else if (tileType === 5) {
                    objectsToDraw.push({type: 'hut', iso});
                } else if (tileType === 6) {
                    objectsToDraw.push({type: 'sign', iso});
                }
            }
        }
        
        // --- Draw Objects and Player (sorted by Y for correct overlap) ---
        objectsToDraw.sort((a,b) => (a.iso.y) - (b.iso.y));

        objectsToDraw.forEach(obj => {
            switch(obj.type) {
                case 'player':
                     drawPlayer(obj.iso.x, obj.iso.y);
                     break;
                case 'tree':
                    drawObject(obj.iso.x, obj.iso.y, '#2a751a', 50, 25);
                    break;
                case 'flower':
                    drawObject(obj.iso.x, obj.iso.y, '#ff69b4', 10, 5);
                    break;
                case 'hut':
                    drawHut(obj.iso.x, obj.iso.y);
                    break;
                case 'sign':
                    drawSign(obj.iso.x, obj.iso.y);
                    break;
            }
        });


        ctx.restore();
        requestAnimationFrame(render);
    }

    // --- Interaction ---
    function showMessage(text) {
        messageText.textContent = text;
        messageBox.style.display = 'block';
        messageVisible = true;
    }

    function hideMessage() {
        messageBox.style.display = 'none';
        messageVisible = false;
    }

    function handleInteraction() {
        if (messageVisible) {
            hideMessage();
            return;
        }
        
        const checkCoords = [
            {x: player.x - 1, y: player.y - 1}, // Up
            {x: player.x + 1, y: player.y + 1}, // Down
            {x: player.x - 1, y: player.y + 1}, // Left
            {x: player.x + 1, y: player.y - 1}  // Right
        ];
        
        for (const coord of checkCoords) {
            if (coord.x >= 0 && coord.x < MAP_COLS && coord.y >= 0 && coord.y < MAP_ROWS) {
                const tileType = map[Math.floor(coord.y)][Math.floor(coord.x)];
                if (messages[tileType]) {
                    showMessage(messages[tileType]);
                    return; // Show first message found and exit
                }
            }
        }
    }


    // --- Controls ---
    function handleKeyDown(e) {
        if (e.key === ' ') { // Spacebar
            e.preventDefault();
            handleInteraction();
            return;
        }

        if (messageVisible) return; // Don't move if message is open

        let nextX = player.x;
        let nextY = player.y;

        switch (e.key) {
            case 'ArrowUp':
                nextX -= 1;
                nextY -= 1;
                break;
            case 'ArrowDown':
                nextX += 1;
                nextY += 1;
                break;
            case 'ArrowLeft':
                nextX -= 1;
                nextY += 1;
                break;
            case 'ArrowRight':
                nextX += 1;
                nextY -= 1;
                break;
            default:
                return;
        }
        
        // Collision Detection
        if (nextX >= 0 && nextX < MAP_COLS && nextY >= 0 && nextY < MAP_ROWS) {
            const targetTile = map[Math.floor(nextY)][Math.floor(nextX)];
            if (targetTile !== 2 && targetTile !== 3 && targetTile !== 5 && targetTile !== 6) { // Cannot walk on water, trees, huts, signs
                 player.x = nextX;
                 player.y = nextY;
            }
        }
    }
    
    // --- Resizing ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    // --- Initialization ---
    function init() {
        // Set initial canvas size
        resizeCanvas();
        
        // Add listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', resizeCanvas); // Resize canvas when window size changes


        // Start the game loop
        render();
    }

    init();
});
