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
    let initialView = true; // true at start: show entire map fitted to canvas

    // --- Map Data ---
    // Tile legend:
    // 0: Grass, 1: Path, 2: Water, 3: Tree, 4: Flowers, 5: Hut, 6: Sign,
    // 7: Crops, 8: Industry, 9: Circus
                                // Single explicit 60x60 map with the small map centered at offsets (15, 15)
                                const map = [
    // rows 0..14: top padding (60 zeros each)
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    // row15 -> start of centered small map
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,8,8,8,8,8,0,0,0,1,1,1,0,9,9,9,9,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,8,3,3,3,3,0,0,0,1,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,8,3,4,3,3,0,0,0,1,0,3,3,3,5,5,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,8,3,3,4,3,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,4,1,4,1,1,1,1,1,0,0,0,0,7,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,5,5,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,5,1,5,1,1,5,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,5,1,1,5,1,1,5,5,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    // rows 31..44: continue centered smallMap rows
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,3,0,0,3,0,0,0,0,0,0,0],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,3,0,0,0,3,0,0,0,0],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // rows 45..59 bottom padding (all zeros)
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3]
];

    // --- Overlay: central path and city ---
    // Adds a vertical and horizontal path crossing the map center and a 5x5 city block.
    // interactive objects list (will be filled by overlay)
    const interactives = [];

    (function addCentralPathAndCity() {
        const rows = map.length;
        const cols = map[0].length;
        const centerX = Math.floor(cols / 2); // central column
        const centerY = Math.floor(rows / 2); // central row

        // NOTE: removed global center cross (vertical/horizontal paths) so the
        // map's literal content remains authoritative.

        // City layout parameters
        const cityRadius = 2; // creates a 5x5 block
        const cityMinX = centerX - cityRadius;
        const cityMaxX = centerX + cityRadius;
        const cityMinY = centerY - cityRadius;
        const cityMaxY = centerY + cityRadius;

        // Carve inner roads inside the 5x5 city: a plus-shaped street
        for (let x = cityMinX; x <= cityMaxX; x++) {
            if (x >= 0 && x < cols) {
                map[centerY][x] = 1; // central horizontal within city
            }
        }
        for (let y = cityMinY; y <= cityMaxY; y++) {
            if (y >= 0 && y < rows) {
                map[y][centerX] = 1; // central vertical within city
            }
        }

        // Place buildings in the four corners of the 5x5 block and small plazas
        const buildingCoords = [
            {x: cityMinX, y: cityMinY},
            {x: cityMaxX, y: cityMinY},
            {x: cityMinX, y: cityMaxY},
            {x: cityMaxX, y: cityMaxY}
        ];

        for (const b of buildingCoords) {
            if (b.y >= 0 && b.y < rows && b.x >= 0 && b.x < cols) {
                map[b.y][b.x] = 5; // building
            }
        }

        // Fill remaining city tiles with paved squares (to represent plaza or pavement)
        for (let y = cityMinY; y <= cityMaxY; y++) {
            for (let x = cityMinX; x <= cityMaxX; x++) {
                if (y >= 0 && y < rows && x >= 0 && x < cols) {
                    // skip if a building or road already
                    if (map[y][x] !== 1 && map[y][x] !== 5) {
                        map[y][x] = 1; // paved plaza
                    }
                }
            }
        }

        // Add a few interactive red-square objects inside the city (e.g., shop, info, fountain)
        const interactivePositions = [
            {x: centerX - 1, y: centerY - 1, msg: "Town Hall: Open 9-5."},
            {x: centerX + 1, y: centerY - 1, msg: "Bakery: Fresh bread inside."},
            {x: centerX - 1, y: centerY + 1, msg: "Fountain: Throw a coin."},
            {x: centerX + 1, y: centerY + 1, msg: "Notice Board: Events posted here."}
        ];

        for (const ip of interactivePositions) {
            if (ip.y >= 0 && ip.y < rows && ip.x >= 0 && ip.x < cols) {
                // record interactive; we leave underlying tile as-is (paved)
                interactives.push({x: ip.x, y: ip.y, message: ip.msg});
            }
        }
    })();

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

    // Messages for new tile types
    messages[7] = "Fields of crops sway in the breeze.";
    messages[8] = "Industrial area: factories hum with activity.";
    messages[9] = "Circus: bright tents and lively music can be heard.";

    // --- Camera ---
    const camera = {
        x: 0,
        y: 0
    };

    // --- Utility Functions ---

    // Compute a zoom level that fits the whole map into the canvas with a small margin
    function computeFitZoom() {
        const cols = MAP_COLS;
        const rows = MAP_ROWS;
        // isometric extents
        const isoMinX = -(rows - 1) * (TILE_WIDTH / 2);
        const isoMaxX = (cols - 1) * (TILE_WIDTH / 2);
        const mapWidth = isoMaxX - isoMinX + TILE_WIDTH; // add tile width margin

        const isoMaxY = (cols - 1 + rows - 1) * (TILE_HEIGHT / 2);
        const mapHeight = isoMaxY + TILE_HEIGHT; // add vertical margin

        const margin = 80; // pixels
        const fitX = (canvas.width - margin) / mapWidth;
        const fitY = (canvas.height - margin) / mapHeight;
        const fit = Math.min(fitX, fitY);
        // Clamp to reasonable range
        return Math.max(0.1, Math.min(fit, 3.0));
    }

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
    
    // Draws a rich agricultural crop field with furrows, diverse crops, and detailed farm equipment
    function drawCrops(x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Enhanced shadow with more realistic depth
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, TILE_HEIGHT, 42, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Field base with textured tilled soil appearance
        const fieldW = 52;
        const fieldH = 26;
        ctx.fillStyle = '#6d3f1f'; // Base soil color
        ctx.beginPath();
        ctx.rect(-fieldW / 2, -14, fieldW, fieldH);
        ctx.fill();

        // Add soil texture with subtle horizontal lines
        ctx.strokeStyle = '#5a3317';
        ctx.lineWidth = 0.8;
        for (let i = -12; i <= 12; i += 2) {
            ctx.beginPath();
            ctx.moveTo(-fieldW / 2, i);
            ctx.lineTo(fieldW / 2, i);
            ctx.stroke();
        }

        // Multiple furrow rows with realistic curved plowing patterns
        for (let i = -3; i <= 3; i++) {
            const yy = -10 + i * 4.5;
            ctx.beginPath();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = (i % 2 === 0) ? '#5d2e0a' : '#7d4f1f';

            // Create more realistic S-curved furrows
            const segments = 8;
            const segmentWidth = fieldW / segments;
            ctx.moveTo(-fieldW / 2, yy);

            for (let s = 0; s < segments; s++) {
                const sx = -fieldW / 2 + s * segmentWidth;
                const nextX = -fieldW / 2 + (s + 1) * segmentWidth;
                const controlOffset = (Math.sin(s * 0.5) * 3) + ((i % 2 === 0) ? 4 : -3);
                ctx.quadraticCurveTo(sx + segmentWidth / 2, yy + controlOffset, nextX, yy);
            }
            ctx.stroke();
        }

        // Diverse crop rows with varying plant types and growth stages
        const cropRows = [
            { y: -12, type: 'corn', color: '#2d5016', height: 8, width: 4 },
            { y: -6, type: 'wheat', color: '#4a7c2a', height: 6, width: 3 },
            { y: 0, type: 'mixed', color: '#1f3f0f', height: 7, width: 3.5 },
            { y: 6, type: 'vegetables', color: '#3e6b1e', height: 5, width: 2.5 }
        ];

        cropRows.forEach(row => {
            ctx.fillStyle = row.color;
            for (let px = -fieldW / 2 + 8; px <= fieldW / 2 - 8; px += 12) {
                // Vary plant heights for more natural appearance
                const plantHeight = row.height + (Math.sin(px * 0.3) * 2);
                const plantWidth = row.width + (Math.cos(px * 0.2) * 1);

                // Main plant stem/body
                ctx.beginPath();
                ctx.moveTo(px, row.y);
                ctx.lineTo(px - plantWidth, row.y + plantHeight);
                ctx.lineTo(px + plantWidth, row.y + plantHeight);
                ctx.closePath();
                ctx.fill();

                // Add leaves or grain heads based on crop type
                if (row.type === 'corn') {
                    // Corn husks
                    ctx.fillStyle = '#4a7c2a';
                    ctx.fillRect(px - 1, row.y + 2, 2, 4);
                    ctx.fillRect(px - 2, row.y + 1, 4, 2);
                } else if (row.type === 'wheat') {
                    // Wheat grain heads
                    ctx.fillStyle = '#d4b896';
                    ctx.beginPath();
                    ctx.ellipse(px, row.y - 2, 2, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Mixed vegetables - occasional flowers
                    if (Math.random() > 0.7) {
                        ctx.fillStyle = '#ff6b35';
                        ctx.beginPath();
                        ctx.ellipse(px, row.y - 1, 1.5, 1.5, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.fillStyle = row.color; // Reset color
            }
        });

        // Advanced irrigation system with sprinklers
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1976d2';
        ctx.fillStyle = '#42a5f5';

        // Main irrigation pipes
        for (let i = -2; i <= 2; i++) {
            const iy = -8 + i * 6;
            ctx.beginPath();
            ctx.moveTo(-fieldW / 2 + 4, iy);
            ctx.lineTo(fieldW / 2 - 4, iy);
            ctx.stroke();

            // Add sprinkler heads
            if (i % 2 === 0) {
                ctx.beginPath();
                ctx.ellipse(-fieldW / 2 + 8, iy, 3, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.ellipse(fieldW / 2 - 8, iy, 3, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        // Enhanced detailed tractor with more realistic features
        const tx = -fieldW / 2 + 12;
        const ty = 8;

        // Tractor shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(tx + 5, ty + 8, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main tractor body
        ctx.fillStyle = '#e65100';
        ctx.fillRect(tx, ty - 8, 16, 8);

        // Tractor cabin with windows
        ctx.fillStyle = '#bf360c';
        ctx.fillRect(tx + 6, ty - 14, 8, 7);

        // Cabin windows
        ctx.fillStyle = '#81c784';
        ctx.fillRect(tx + 7, ty - 12, 3, 3);
        ctx.fillRect(tx + 11, ty - 12, 3, 3);

        // Tractor exhaust pipe
        ctx.fillStyle = '#424242';
        ctx.fillRect(tx + 14, ty - 10, 2, 6);

        // Smoke from exhaust
        ctx.fillStyle = 'rgba(100,100,100,0.4)';
        ctx.beginPath();
        ctx.ellipse(tx + 16, ty - 12, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Large rear wheels with treads
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.ellipse(tx + 3, ty + 1, 4, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wheel treads
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 1;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const treadX = tx + 3 + Math.cos(angle) * 3;
            const treadY = ty + 1 + Math.sin(angle) * 3;
            ctx.beginPath();
            ctx.moveTo(treadX, treadY);
            ctx.lineTo(treadX + Math.cos(angle) * 2, treadY + Math.sin(angle) * 2);
            ctx.stroke();
        }

        // Front wheels
        ctx.beginPath();
        ctx.ellipse(tx + 12, ty + 1, 3, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tractor attachment (plow or harrow)
        ctx.fillStyle = '#616161';
        ctx.fillRect(tx - 4, ty - 2, 8, 4);

        // Plow tines
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2;
        for (let tine = 0; tine < 3; tine++) {
            ctx.beginPath();
            ctx.moveTo(tx + tine * 2, ty - 2);
            ctx.lineTo(tx + tine * 2, ty + 6);
            ctx.stroke();
        }

        // Farm worker figure near tractor
        const wx = tx + 20;
        const wy = ty - 4;

        // Worker body
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(wx, wy, 4, 8);

        // Worker head
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.ellipse(wx + 2, wy - 2, 3, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Worker hat
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(wx - 1, wy - 4, 6, 2);

        // Enhanced barn with more detail
        const bx = fieldW / 2 + 15;
        const by = 2;

        // Barn shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(bx + 6, by + 12, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Barn foundation
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(bx, by - 12, 18, 12);

        // Barn walls with texture
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(bx + 2, by - 10, 14, 8);

        // Barn roof
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.moveTo(bx - 2, by - 10);
        ctx.lineTo(bx + 9, by - 20);
        ctx.lineTo(bx + 20, by - 10);
        ctx.closePath();
        ctx.fill();

        // Roof shingles texture
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 1;
        for (let shingle = 0; shingle < 4; shingle++) {
            ctx.beginPath();
            ctx.moveTo(bx + shingle * 4, by - 10);
            ctx.lineTo(bx + 2 + shingle * 4, by - 18);
            ctx.lineTo(bx + 4 + shingle * 4, by - 10);
            ctx.stroke();
        }

        // Barn door
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(bx + 6, by - 5, 6, 7);

        // Door handle
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.ellipse(bx + 10, by - 2, 1, 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Silo next to barn
        const sx = bx + 22;
        const sy = by - 6;

        ctx.fillStyle = '#78909c';
        ctx.beginPath();
        ctx.ellipse(sx + 3, sy + 8, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Silo roof
        ctx.fillStyle = '#546e7a';
        ctx.beginPath();
        ctx.ellipse(sx + 3, sy - 2, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Weather vane on silo
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx + 3, sy - 2);
        ctx.lineTo(sx + 3, sy - 8);
        ctx.stroke();

        ctx.fillStyle = '#ff5722';
        ctx.beginPath();
        ctx.moveTo(sx + 3, sy - 8);
        ctx.lineTo(sx + 6, sy - 6);
        ctx.lineTo(sx + 3, sy - 7);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Draws a small factory/industry building
    function drawFactory(x, y) {
        // foundation shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE_HEIGHT, 36, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // main building body
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(x - 28, y - 38, 56, 28);

        // roof and detail
        ctx.fillStyle = '#707070';
        ctx.fillRect(x - 28, y - 44, 56, 6);

        // smoke stack
        ctx.fillStyle = '#5d5d5d';
        ctx.fillRect(x + 12, y - 60, 8, 24);
        // smoke
        ctx.fillStyle = 'rgba(120,120,120,0.5)';
        ctx.beginPath();
        ctx.ellipse(x + 18, y - 68, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draws a circus tent
    function drawCircus(x, y) {
        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE_HEIGHT, 34, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // tent base (circle-ish)
        ctx.fillStyle = '#F06292';
        ctx.beginPath();
        ctx.moveTo(x, y - 36);
        ctx.lineTo(x + 26, y - 6);
        ctx.lineTo(x - 26, y - 6);
        ctx.closePath();
        ctx.fill();

        // tent stripes
        ctx.fillStyle = '#FFF176';
        ctx.beginPath();
        ctx.moveTo(x, y - 36);
        ctx.lineTo(x + 12, y - 6);
        ctx.lineTo(x + 6, y - 6);
        ctx.closePath();
        ctx.fill();

        // flag pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 2, y - 36, 4, 18);
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 36);
        ctx.lineTo(x + 14, y - 30);
        ctx.lineTo(x + 2, y - 28);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draws the player character
    function drawPlayer(isoX, isoY) {
         // Player shadow (larger for full body)
        ctx.fillStyle = player.shadowColor;
        ctx.beginPath();
        ctx.ellipse(isoX, isoY + TILE_HEIGHT + 8, player.width * 0.8, player.width * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        const playerTopY = isoY - player.height + TILE_HEIGHT;

        // Draw legs first (behind body)
        const legHeight = 12;
        const legWidth = 6;

        // Left leg
        ctx.fillStyle = '#0066cc'; // Blue overalls
        ctx.fillRect(isoX - 6, playerTopY + player.height, legWidth, legHeight);

        // Right leg
        ctx.fillRect(isoX + 2, playerTopY + player.height, legWidth, legHeight);

        // Feet (shoes)
        ctx.fillStyle = '#8B4513'; // Brown shoes
        ctx.fillRect(isoX - 7, playerTopY + player.height + legHeight, legWidth + 2, 4);
        ctx.fillRect(isoX + 1, playerTopY + player.height + legHeight, legWidth + 2, 4);

        // Main body (overalls)
        ctx.fillStyle = player.color; // Red shirt
        ctx.fillRect(isoX - player.width / 2, playerTopY, player.width, player.height);

        // Overall straps
        ctx.fillStyle = '#0066cc'; // Blue overalls
        ctx.fillRect(isoX - player.width / 2 + 2, playerTopY, 4, player.height);
        ctx.fillRect(isoX + player.width / 2 - 6, playerTopY, 4, player.height);

        // Arms
        const armHeight = 16;
        const armWidth = 5;

        // Left arm
        ctx.fillStyle = player.color; // Red shirt
        ctx.fillRect(isoX - player.width / 2 - armWidth - 2, playerTopY + 6, armWidth, armHeight);

        // Right arm
        ctx.fillRect(isoX + player.width / 2 + 2, playerTopY + 6, armWidth, armHeight);

        // Hands
        ctx.fillStyle = '#FFDBAC'; // Skin color
        ctx.fillRect(isoX - player.width / 2 - armWidth - 2, playerTopY + armHeight + 4, armWidth + 1, 6);
        ctx.fillRect(isoX + player.width / 2 + 2, playerTopY + armHeight + 4, armWidth + 1, 6);

        // Draw voluminous hair (Mario-style)
        const hairColor = '#8B4513'; // Brown hair color
        const hairTopY = playerTopY - 10;

        // Main hair mass (top of head)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.ellipse(isoX, hairTopY + 2, player.width * 0.9, player.width * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left side hair
        ctx.beginPath();
        ctx.ellipse(isoX - 10, hairTopY + 4, player.width * 0.45, player.width * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right side hair
        ctx.beginPath();
        ctx.ellipse(isoX + 10, hairTopY + 4, player.width * 0.45, player.width * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Back hair (longer strands)
        ctx.beginPath();
        ctx.ellipse(isoX, hairTopY + 9, player.width * 0.8, player.width * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair texture/highlights
        ctx.fillStyle = shadeColor(hairColor, 30);
        ctx.beginPath();
        ctx.ellipse(isoX - 4, hairTopY + 1, player.width * 0.35, player.width * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(isoX + 5, hairTopY + 2, player.width * 0.3, player.width * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mario-style face
        ctx.fillStyle = '#FFDBAC'; // Skin color
        ctx.fillRect(isoX - 6, playerTopY + 4, 12, 14);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(isoX - 4, playerTopY + 6, 3, 3);
        ctx.fillRect(isoX + 1, playerTopY + 6, 3, 3);

        // Eye whites
        ctx.fillStyle = '#fff';
        ctx.fillRect(isoX - 3, playerTopY + 7, 1, 1);
        ctx.fillRect(isoX + 2, playerTopY + 7, 1, 1);

        // Mario mustache
        ctx.fillStyle = '#000';
        ctx.fillRect(isoX - 4, playerTopY + 10, 8, 2);

        // Nose
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(isoX - 1, playerTopY + 8, 2, 3);

        // Mouth
        ctx.fillStyle = '#000';
        ctx.fillRect(isoX - 2, playerTopY + 13, 4, 1);

        // Hat (Mario's iconic cap)
        ctx.fillStyle = '#ff0000'; // Red hat
        ctx.fillRect(isoX - 10, hairTopY - 2, 20, 6);

        // Hat brim
        ctx.fillRect(isoX - 12, hairTopY + 4, 24, 2);

        // Hat logo (M)
        ctx.fillStyle = '#fff';
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("M", isoX, hairTopY + 2);
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

        // Center camera: if initialView is true, center on map and keep the fit zoom
        const playerIso = toIsometric(player.x, player.y);
        if (initialView) {
            // center on map midpoint
            const centerIso = toIsometric((MAP_COLS - 1) / 2, (MAP_ROWS - 1) / 2);
            camera.x = canvas.width / 2 - centerIso.x * zoom;
            camera.y = canvas.height / 2 - centerIso.y * zoom;
        } else {
            camera.x = canvas.width / 2 - playerIso.x * zoom;
            camera.y = canvas.height / 2 - playerIso.y * zoom;
        }
        
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
                    case 7: // Crops
                        drawTile(iso.x, iso.y, '#7CC576');
                        break;
                    case 8: // Industry
                        drawTile(iso.x, iso.y, '#CFCFCF');
                        break;
                    case 9: // Circus
                        drawTile(iso.x, iso.y, '#F8BBD0');
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
                } else if (tileType === 7) {
                    objectsToDraw.push({type: 'crops', iso});
                } else if (tileType === 8) {
                    objectsToDraw.push({type: 'factory', iso});
                } else if (tileType === 9) {
                    objectsToDraw.push({type: 'circus', iso});
                }
            }
        }

        // Add interactive objects (red squares) to draw queue
        for (const it of interactives) {
            const iso = toIsometric(it.x, it.y);
            objectsToDraw.push({type: 'interactive', iso, meta: it});
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
                case 'interactive':
                    // draw a small red square to represent the interactive object
                    ctx.save();
                    ctx.translate(obj.iso.x, obj.iso.y - 8); // slightly above ground
                    ctx.fillStyle = '#ff4500';
                    ctx.fillRect(-6, -6, 12, 12);
                    ctx.restore();
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
                // First check interactives at this coordinate
                const foundInteractive = interactives.find(it => Math.floor(it.x) === Math.floor(coord.x) && Math.floor(it.y) === Math.floor(coord.y));
                if (foundInteractive) {
                    showMessage(foundInteractive.message);
                    return;
                }

                // Fallback to tile-based messages
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
                 // user moved — switch from initial full-map view to player-centered
                 initialView = false;
            }
        }
    }
    
    // --- Resizing ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    // --- Zoom Controls ---
    function zoomIn() {
        zoom = Math.min(zoom + 0.2, 3.0); // Max zoom 3.0x
    }

    function zoomOut() {
        zoom = Math.max(zoom - 0.2, 0.1); // Min zoom 0.1 (allow fitting smaller maps)
    }

    // --- Initialization ---
    function init() {
        // Set initial canvas size
        resizeCanvas();

        // Compute and set initial fitted zoom so the whole map is visible on start
        zoom = computeFitZoom();

        // Add listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', resizeCanvas); // Resize canvas when window size changes

        // Add zoom control listeners
        document.getElementById('zoomIn').addEventListener('click', zoomIn);
        document.getElementById('zoomOut').addEventListener('click', zoomOut);

        // Start the game loop
        render();
    }

    init();
});
