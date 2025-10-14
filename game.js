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
    [9,9,9,9,6,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,7,7,7,7,7,7,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7],
    // row15 -> start of centered small map
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,7,7,7,7,7,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,1,6,1,1,6,1,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,5,1,5,1,5,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1,3,3,3,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,5,1,5,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,4,1,4,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    // rows 31..44: continue centered smallMap rows
    [8,8,8,8,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,8,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,3,0,0,3,0,0,0,0,0,0,0],
    [8,8,8,8,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,3,0,0,0,3,0,0,0,0],
    [8,8,8,8,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [8,8,8,8,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,8,8,8,8,8,8,8,6,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
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
    let heightMap;
    let waterBodyMap;
    let largestWaterBodyId = -1;

    // --- Player ---
    const player = {
        x: Math.floor(MAP_COLS / 2), // map x
        y: Math.floor(MAP_ROWS / 2), // map y
        width: 16,
        height: 24, // Not used directly for player drawing anymore, but kept for reference
        color: '#FF69B4', // Hot Pink
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

    // --- Tractor Data ---
    const tractors = [];
    const NUM_TRACTORS = 3;

    // --- Camera ---
    const camera = {
        x: 0,
        y: 0
    };

    // --- Cloud Data ---
    const clouds = [];
    const NUM_CLOUDS = 15;

    function initClouds() {
        for (let i = 0; i < NUM_CLOUDS; i++) {
            clouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height * 0.4), // Keep clouds in the upper 40% of the sky
                size: 40 + Math.random() * 50,
                speed: 0.1 + Math.random() * 0.2
            });
        }
    }

    function initHeightMap() {
        heightMap = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
        const hilliness = 0.8; // How much height varies. 0 = flat, 1 = very hilly.

        for (let y = 1; y < MAP_ROWS; y++) {
            for (let x = 1; x < MAP_COLS; x++) {
                if (map[y][x] === 0) { // Only generate hills on grass tiles
                    // Average the height of neighbors and add a random amount
                    const avgHeight = (heightMap[y-1][x] + heightMap[y][x-1]) / 2;
                    let randomFactor = (Math.random() - 0.5) * hilliness;
                    
                    // Add a chance for a steeper change to create more distinct hills
                    if (Math.random() < 0.05) {
                        randomFactor *= 3;
                    }

                    heightMap[y][x] = Math.max(0, Math.min(2, avgHeight + randomFactor)); // Clamp height between 0 and 2
                }
            }
        }
    }

    function identifyWaterBodies() {
        waterBodyMap = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
        const visited = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false));
        let currentBodyId = 1;
        let largestSize = 0;

        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                if (map[y][x] === 2 && !visited[y][x]) {
                    let currentSize = 0;
                    const queue = [{x, y}];
                    visited[y][x] = true;

                    while (queue.length > 0) {
                        const tile = queue.shift();
                        waterBodyMap[tile.y][tile.x] = currentBodyId;
                        currentSize++;

                        const neighbors = [
                            {x: tile.x, y: tile.y - 1}, {x: tile.x, y: tile.y + 1},
                            {x: tile.x - 1, y: tile.y}, {x: tile.x + 1, y: tile.y}
                        ];

                        for (const n of neighbors) {
                            if (n.y >= 0 && n.y < MAP_ROWS && n.x >= 0 && n.x < MAP_COLS && map[n.y][n.x] === 2 && !visited[n.y][n.x]) {
                                visited[n.y][n.x] = true;
                                queue.push(n);
                            }
                        }
                    }

                    if (currentSize > largestSize) {
                        largestSize = currentSize;
                        largestWaterBodyId = currentBodyId;
                    }
                    currentBodyId++;
                }
            }
        }
    }

    function initTractors() {
        const cropTiles = [];
        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                if (map[y][x] === 7) {
                    cropTiles.push({ x, y });
                }
            }
        }

        if (cropTiles.length === 0) return;

        for (let i = 0; i < NUM_TRACTORS; i++) {
            const startTile = cropTiles[Math.floor(Math.random() * cropTiles.length)];
            const directions = [
                { dx: -1, dy: -1 }, // Up
                { dx: 1, dy: 1 },   // Down
                { dx: -1, dy: 1 },  // Left
                { dx: 1, dy: -1 }   // Right
            ];
            tractors.push({
                x: startTile.x,
                y: startTile.y,
                speed: 0.02 + Math.random() * 0.02,
                dir: directions[Math.floor(Math.random() * directions.length)],
                color: '#e65100' // Bright orange
            });
        }
    }

    function findNewTractorDirection(tractor) {
        const directions = [{ dx: -1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }];
        tractor.dir = directions[Math.floor(Math.random() * directions.length)];
    }

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

    // Draws an animated water tile
    function drawWater(isoX, isoY, mapX, mapY) {
        // Base water color
        const baseColor = '#40E0D0'; // Turquoise
        drawTile(isoX, isoY, baseColor);

        // Add animated "sparkles" or "bubbles" for a more gamelike feel
        ctx.save();
        ctx.translate(isoX, isoY);

        const time = Date.now();
        // Use a time-based seed that is unique for each tile to vary the animation
        const tileSeed = mapX * 13 + mapY * 31;
        const numBubbles = 3;

        for (let i = 0; i < numBubbles; i++) {
            // Use a sine wave to make bubbles fade in and out.
            // The animation is staggered for each bubble and tile.
            const anim = Math.sin(time / 600 + tileSeed + i * 2.1);

            if (anim > 0.3) { // Only draw the bubble when it's "active"
                // Deterministic, but pseudo-random, position within the tile's top face
                const bubbleX = (((tileSeed + i * 5) % 100) / 100 - 0.5) * TILE_WIDTH * 0.7;
                const bubbleY = ((((tileSeed + i * 17) % 100) / 100 - 0.5) * TILE_HEIGHT * 0.7) + TILE_HEIGHT / 2;

                // Opacity is based on the animation cycle
                ctx.fillStyle = `rgba(255, 255, 255, ${anim * 0.7})`;
                ctx.beginPath();
                ctx.arc(bubbleX, bubbleY, 1.5, 0, Math.PI * 2); // Small white circle
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // Draws a single fluffy cloud
    function drawCloud(x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; // Semi-transparent white
        ctx.beginPath();
        // A cloud is composed of several overlapping ellipses
        ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.ellipse(x + size * 0.6, y, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
        ctx.ellipse(x - size * 0.5, y, size * 0.7, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }




    // Draws a hut
    function drawHut(x, y) {
        const wallColor = '#F0E68C'; // Khaki (like a sugar wafer)
        const roofColor = '#FFB6C1'; // Light Pink (frosting)
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
        const boardWidth = 40;
        const boardHeight = 20;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE_HEIGHT, boardWidth / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Post
        ctx.fillStyle = '#C71585'; // MediumVioletRed
        ctx.fillRect(x - 3, y - 25, 6, 25 + TILE_HEIGHT);

        // Board
        ctx.fillStyle = '#FF69B4'; // HotPink
        ctx.fillRect(x - boardWidth / 2, y - 30, boardWidth, boardHeight);
        ctx.fillStyle = '#fff';
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", x, y - 18);
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
    
    // Draws a more detailed and realistic tree
    function drawTree(x, y) {
        const height = 60;
        const width = 35;
        const topY = y - height;
        const trunkColor = '#8B4513'; // SaddleBrown
        const leafColors = ['#2E7D32', '#388E3C', '#4CAF50']; // Dark, medium, and light green

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE_HEIGHT, width * 0.8, width * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trunk
        ctx.fillStyle = trunkColor;
        // A slightly tapered trunk for more realism
        ctx.beginPath();
        ctx.moveTo(x - 4, y + TILE_HEIGHT);
        ctx.lineTo(x + 4, y + TILE_HEIGHT);
        ctx.lineTo(x + 2, y - 10);
        ctx.lineTo(x - 2, y - 10);
        ctx.closePath();
        ctx.fill();

        // Leafy part - composed of several overlapping, semi-transparent ellipses
        // Base layer (darkest)
        ctx.fillStyle = 'rgba(46, 125, 50, 0.8)'; // leafColors[0] with alpha
        ctx.beginPath();
        ctx.ellipse(x, topY + 20, width, height * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mid and top layers for volume and highlights
        ctx.fillStyle = 'rgba(76, 175, 80, 0.85)'; // leafColors[2] with alpha
        ctx.beginPath();
        ctx.ellipse(x + 10, topY + 15, width * 0.7, height * 0.3, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 10, topY + 25, width * 0.8, height * 0.35, 0, 0, Math.PI * 2);
        ctx.ellipse(x, topY + 5, width * 0.6, height * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draws a bridge tile over water
    function drawBridge(x, y, mapX, mapY) {
        // First, draw the water underneath
        drawWater(x, y, mapX, mapY);

        ctx.save();
        ctx.translate(x, y);

        const plankColor = '#A0522D'; // Sienna
        const postColor = '#8B4513'; // SaddleBrown
        const plankWidth = TILE_WIDTH / 4;
        const bridgeElevation = -TILE_HEIGHT / 2; // Raise the bridge surface

        // Draw wooden planks
        for (let i = 0; i < 4; i++) {
            const px = -TILE_WIDTH / 2 + i * plankWidth;
            ctx.fillStyle = shadeColor(plankColor, (i % 2) * 10); // Alternate plank colors slightly
            ctx.beginPath();
            ctx.moveTo(px, bridgeElevation + TILE_HEIGHT / 2);
            ctx.lineTo(px + plankWidth, bridgeElevation + TILE_HEIGHT / 2);
            ctx.lineTo(px + plankWidth - TILE_HEIGHT / 2, bridgeElevation + TILE_HEIGHT);
            ctx.lineTo(px - TILE_HEIGHT / 2, bridgeElevation + TILE_HEIGHT);
            ctx.closePath();
            ctx.fill();
        }

        // Draw bridge posts/railings on the sides
        ctx.fillStyle = postColor;
        const postSize = 6;
        // Left post
        ctx.fillRect(
            -TILE_WIDTH / 2 - postSize / 2, 
            bridgeElevation - postSize, 
            postSize, 
            postSize * 2.5
        );
        // Right post
        ctx.fillRect(
            TILE_WIDTH / 2 - postSize / 2, 
            bridgeElevation - postSize, 
            postSize, 
            postSize * 2.5
        );
        ctx.restore();
    }

    // Draws a rich agricultural crop field with furrows and diverse crops
function drawCrops(x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Field base with textured tilled soil appearance
    const fieldW = TILE_WIDTH * 0.9;
    const fieldH = TILE_HEIGHT * 0.9;
    ctx.fillStyle = '#DEB887'; // BurlyWood (like cookie dough)

    // Draw the base shape of the field
    ctx.beginPath();
    ctx.moveTo(0, -fieldH / 2);
    ctx.lineTo(fieldW / 2, 0);
    ctx.lineTo(0, fieldH / 2);
    ctx.lineTo(-fieldW / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Draw furrows (lines in the soil)
    ctx.strokeStyle = '#CD853F'; // Peru (darker cookie)
    ctx.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) {
        const startX = -fieldW / 2 + Math.abs(i * 4);
        const endX = fieldW / 2 - Math.abs(i * 4);
        const yOffset = i * (fieldH / 7);

        ctx.beginPath();
        ctx.moveTo(startX, yOffset);
        ctx.lineTo(endX, yOffset);
        ctx.stroke();
    }

    // Draw rows of crops
    const cropColors = ['#32CD32', '#7CFC00', '#ADFF2F']; // LimeGreen, LawnGreen, GreenYellow
    for (let i = -2; i <= 2; i++) {
        const yOffset = i * (fieldH / 7);
        const rowColor = cropColors[Math.abs(i) % cropColors.length];
        ctx.fillStyle = rowColor;

        // Draw little tufts of crops along the furrow
        for (let j = -3; j <= 3; j++) {
            const xOffset = j * 8; // No random offset
            const cropSize = 3; // Fixed size
            
            // Simple circle for a tuft of plant
            ctx.beginPath();
            ctx.arc(xOffset, yOffset - cropSize / 2, cropSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

    // Draws a small factory/industry building
    function drawFactory(x, y) {
        ctx.save();
        ctx.translate(x, y);

        const stoneColors = ['#FF6347', '#FFD700', '#00BFFF', '#EE82EE']; // Tomato, Gold, DeepSkyBlue, Violet
        const numStones = 10;

        for (let i = 0; i < numStones; i++) {
            const stoneSizeX = 8 + (i % 5) * 2; // Deterministic size based on index
            const stoneSizeY = 4 + (i % 3) * 1.5; // Deterministic size based on index

            // Deterministic position within the tile bounds
            const px = (i * 5 % TILE_WIDTH / 2) - TILE_WIDTH / 4;
            const py = (i * 3 % TILE_HEIGHT / 2) - TILE_HEIGHT / 4;

            ctx.fillStyle = stoneColors[i % stoneColors.length];

            // Draw a small rhombus for each stone
            ctx.beginPath();
            ctx.moveTo(px, py - stoneSizeY / 2);
            ctx.lineTo(px + stoneSizeX / 2, py);
            ctx.lineTo(px, py + stoneSizeY / 2);
            ctx.lineTo(px - stoneSizeX / 2, py);
            ctx.closePath();
            ctx.fill();

            // Add a border for definition
            ctx.strokeStyle = shadeColor(ctx.fillStyle, -20);
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    // Draws a circus tent
    function drawCircus(x, y) {
        ctx.save();
        ctx.translate(x, y);

        const colors = ['#FF1493', '#00BFFF', '#FFD700', '#ADFF2F', '#FF4500']; // DeepPink, DeepSkyBlue, Gold, GreenYellow, OrangeRed
        const numChecksX = 6;
        const numChecksY = 6;

        const stepX = TILE_WIDTH / numChecksX;
        const stepY = TILE_HEIGHT / numChecksY;

        for (let i = 0; i < numChecksX; i++) {
            for (let j = 0; j < numChecksY; j++) {
                // Convert grid coordinates to isometric space
                const isoX = (i - j) * (stepX / 2);
                const isoY = (i + j) * (stepY / 2);

                // Center the pattern
                const centeredX = isoX - TILE_WIDTH / 2 + stepX / 2;
                const centeredY = isoY;

                ctx.fillStyle = colors[(i + j) % colors.length];

                ctx.beginPath();
                ctx.moveTo(centeredX, centeredY);
                ctx.lineTo(centeredX + stepX / 2, centeredY + stepY / 2);
                ctx.lineTo(centeredX, centeredY + stepY);
                ctx.lineTo(centeredX - stepX / 2, centeredY + stepY / 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        ctx.restore();
    }
    
    // Draws a simple tractor
    function drawTractor(x, y, color) {
        ctx.save();
        ctx.translate(x, y);

        const bodyWidth = 40;
        const bodyHeight = 24;
        const wheelRadius = 10;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, TILE_HEIGHT, bodyWidth * 0.8, bodyWidth * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wheels (draw first to be behind body)
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(-bodyWidth / 2 + 2, TILE_HEIGHT - wheelRadius / 2, wheelRadius, 0, Math.PI * 2); // Back wheel
        ctx.arc(bodyWidth / 2 - 2, TILE_HEIGHT - wheelRadius / 2, wheelRadius * 0.8, 0, Math.PI * 2); // Front wheel
        ctx.fill();

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(-bodyWidth / 2, TILE_HEIGHT - bodyHeight, bodyWidth, bodyHeight);
        ctx.restore();
    }

    // Draws the player character
    function drawPlayer(isoX, isoY) {
        // Player shadow
        ctx.fillStyle = player.shadowColor;
        ctx.beginPath();
        ctx.ellipse(isoX, isoY + TILE_HEIGHT + 8, player.width * 0.8, player.width * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        const playerTopY = isoY - player.height + TILE_HEIGHT;

        // --- Body and Dress ---
        const dressColor = player.color; // Pastel purple
        const skinColor = '#FFDBAC';

        // Dress (main body) - A-line shape
        ctx.fillStyle = dressColor;
        ctx.beginPath();
        ctx.moveTo(isoX - player.width / 2 + 2, playerTopY); // Top-left
        ctx.lineTo(isoX + player.width / 2 - 2, playerTopY); // Top-right
        ctx.lineTo(isoX + player.width, playerTopY + player.height + 10); // Bottom-right
        ctx.lineTo(isoX - player.width, playerTopY + player.height + 10); // Bottom-left
        ctx.closePath();
        ctx.fill();

        // Arms
        const armWidth = 5;
        ctx.fillStyle = skinColor;
        // Left arm
        ctx.fillRect(isoX - player.width / 2 - armWidth, playerTopY + 2, armWidth, 12);
        // Right arm
        ctx.fillRect(isoX + player.width / 2, playerTopY + 2, armWidth, 12);

        // Legs
        const legWidth = 6;
        // Left leg
        ctx.fillRect(isoX - legWidth, playerTopY + player.height + 10, legWidth, 10);
        // Right leg
        ctx.fillRect(isoX, playerTopY + player.height + 10, legWidth, 10);

        // Feet (shoes)
        ctx.fillStyle = '#8A2BE2'; // BlueViolet
        ctx.fillRect(isoX - legWidth - 1, playerTopY + player.height + 20, legWidth + 2, 4);
        ctx.fillRect(isoX - 1, playerTopY + player.height + 20, legWidth + 2, 4);

        // --- Head and Hair ---
        const hairColor = '#8B4513'; // SaddleBrown
        const hairTopY = playerTopY - 12;

        // Draw a mass of curly hair using overlapping circles
        ctx.fillStyle = hairColor;
        const curlSize = 8;
        // Back layer of curls
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(isoX - 15 + i * 7, hairTopY + 15, curlSize, 0, Math.PI * 2);
            ctx.fill();
        }
        // Mid layer
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(isoX - 18 + i * 7, hairTopY + 8, curlSize, 0, Math.PI * 2);
            ctx.fill();
        }
        // Top layer
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(isoX - 15 + i * 7, hairTopY + 2, curlSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Face
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(isoX, playerTopY + 4, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(isoX - 4, playerTopY + 2, 2, 3); // Left eye
        ctx.fillRect(isoX + 2, playerTopY + 2, 2, 3); // Right eye

        // Mouth
        ctx.beginPath();
        ctx.arc(isoX, playerTopY + 8, 2, 0, Math.PI, false);
        ctx.stroke();
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

        // Draw a sky-like background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#87CEFA'); // LightSkyBlue
        skyGradient.addColorStop(1, '#AFEEEE'); // PaleTurquoise
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- Draw and Update Clouds ---
        // Clouds are drawn in screen space, so we do this before the camera transform
        clouds.forEach(cloud => {
            // Move the cloud
            cloud.x += cloud.speed;
            // If cloud moves off-screen to the right, wrap it to the left
            if (cloud.x > canvas.width + cloud.size) {
                cloud.x = -cloud.size;
            }
            drawCloud(cloud.x, cloud.y, cloud.size);
        });

        // --- Update Tractors ---
        tractors.forEach(tractor => {
            let nextX = tractor.x + tractor.dir.dx * tractor.speed;
            let nextY = tractor.y + tractor.dir.dy * tractor.speed;

            // Check bounds and if the next tile is still a crop tile
            if (nextX >= 0 && nextX < MAP_COLS && nextY >= 0 && nextY < MAP_ROWS && map[Math.floor(nextY)][Math.floor(nextX)] === 7) {
                tractor.x = nextX;
                tractor.y = nextY;
            } else {
                // If it hits a boundary or non-crop tile, find a new direction
                findNewTractorDirection(tractor);
            }
        });


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
                let iso = toIsometric(x, y);
                const tileType = map[y][x];
                const height = heightMap[y][x] || 0;

                // Draw base tile
                switch (tileType) {
                    case 0: // Grass
                        iso.y -= height * (TILE_HEIGHT / 2); // Raise tile based on height
                        drawTile(iso.x, iso.y, shadeColor('#7CFC00', height * 5)); // LawnGreen
                        break;
                    case 1: // Path
                        // Check if path is over water to draw a bridge
                        const isOverWater = 
                            (y > 0 && map[y-1][x] === 2 && waterBodyMap[y-1][x] === largestWaterBodyId) ||
                            (y < MAP_ROWS - 1 && map[y+1][x] === 2 && waterBodyMap[y+1][x] === largestWaterBodyId) ||
                            (x > 0 && map[y][x-1] === 2 && waterBodyMap[y][x-1] === largestWaterBodyId) ||
                            (x < MAP_COLS - 1 && map[y][x+1] === 2 && waterBodyMap[y][x+1] === largestWaterBodyId);

                        if (isOverWater) {
                            drawBridge(iso.x, iso.y, x, y);
                        } else {
                            drawTile(iso.x, iso.y, '#FFFACD'); // LemonChiffon
                        }
                        break;
                    case 2: // Water
                        drawWater(iso.x, iso.y, x, y);
                        break;
                    case 7: // Crops
                        drawTile(iso.x, iso.y, '#DEB887'); // Draw base soil
                        drawCrops(iso.x, iso.y); // Draw the crop details on top
                        break;
                    case 8: // Industry
                        drawTile(iso.x, iso.y, '#B0C4DE'); // LightSteelBlue base
                        break;
                    case 9: // Circus
                        drawTile(iso.x, iso.y, '#FFDAB9'); // PeachPuff base
                        break;
                    case 3: // Tree placeholder
                    case 4: // Flower placeholder
                    case 5: // Hut placeholder
                    case 6: // Sign placeholder
                        iso.y -= height * (TILE_HEIGHT / 2); // Also raise grass under objects
                        drawTile(iso.x, iso.y, shadeColor('#7CFC00', height * 5)); // Draw grass underneath
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
        
        // Add tractors to draw queue
        for (const tractor of tractors) {
            const iso = toIsometric(tractor.x, tractor.y);
            objectsToDraw.push({type: 'tractor', iso, meta: tractor});
        }

        // --- Draw Objects and Player (sorted by Y for correct overlap) ---
        objectsToDraw.sort((a,b) => (a.iso.y) - (b.iso.y));

        objectsToDraw.forEach(obj => {
            switch(obj.type) {
                case 'player':
                     drawPlayer(obj.iso.x, obj.iso.y);
                     break;
                case 'tree':
                    drawTree(obj.iso.x, obj.iso.y);
                    break;
                case 'flower':
                    drawObject(obj.iso.x, obj.iso.y, '#FFD700', 10, 5); // Gold
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
                    ctx.fillStyle = '#FF1493'; // DeepPink
                    ctx.fillRect(-6, -6, 12, 12);
                    ctx.restore();
                    break;
                case 'factory':
                    drawFactory(obj.iso.x, obj.iso.y);
                    break;
                case 'circus':
                    drawCircus(obj.iso.x, obj.iso.y);
                    break;
                case 'tractor':
                    drawTractor(obj.iso.x, obj.iso.y, obj.meta.color);
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

        // Create the initial set of clouds
        initClouds();

        // Generate the terrain heightmap
        initHeightMap();

        // Identify and label all bodies of water
        identifyWaterBodies();

        // Create the tractors
        initTractors();

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
