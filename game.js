document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const overlay = document.getElementById('overlay');
    const signPopup = document.getElementById('signPopup');
    const signPopupText = document.getElementById('signPopupText');
    const closeSignPopupButton = document.getElementById('closeSignPopup');

    // Helper to set a sign's text programmatically
    function setSignText(x, y, text) {
        if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;
        // Ensure tile is a sign
        map[y][x] = 6;
        // Find existing interactive
        const idx = interactives.findIndex(it => Math.floor(it.x) === x && Math.floor(it.y) === y);
        if (idx !== -1) {
            interactives[idx].message = text;
        } else {
            interactives.push({ x, y, message: text });
        }
        return true;
    }

    // Expose helper to window for console editing
    window.setSignText = setSignText;

    // --- Game Configuration ---
    const TILE_WIDTH = 64;
    const TILE_HEIGHT = TILE_WIDTH / 2;
    let zoom = 1.0;
    let messageVisible = false;
    let cinematicFocus = null; // Stores {player, target} for cinematic zoom
    let targetZoom = 1.0;
    let initialView = true; // true at start: show entire map fitted to canvas

    // --- Map Data ---
    // Tile legend:
    // 0: Grass, 1: Path, 2: Water, 3: Tree, 4: Flowers, 5: Hut, 6: Sign,
    // 7: Crops, 8: Education, 9: Circus
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
    [9,9,9,9,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,7,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7],
    // row15 -> start of centered small map
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,7,7,7,7,7,1,6,1,1,6,1,7,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,5,1,5,1,5,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7],
    [9,9,9,9,9,9,9,9,1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1,3,3,3,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [9,9,9,9,9,9,9,9,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,5,1,5,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,2,2,2,8,1,1,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    // rows 31..44: continue centered smallMap rows
    [8,8,8,2,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,2],
    [8,8,8,2,2,2,2,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,3,0,0,3,0,0,0,0,0,0,0],
    [8,8,8,2,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,3,0,0,0,3,0,0,0,0],
    [8,8,8,2,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [8,8,8,2,8,8,8,8,1,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // rows 45..59 bottom padding (all zeros)
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0],
    [8,8,8,2,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3]
];

    // --- Overlay: central path and city ---
    // Adds a vertical and horizontal path crossing the map center and a 5x5 city block.
    // interactive objects list (pre-populated with persistent signs)
    const interactives = [
        // Persisted signs baked into source
        { x: 29, y: 31, message: 'EXPERIENCE' },
        { x: 4, y: 8, message: 'FUN' },
        { x: 7, y: 33, message: 'EDUCATION' }
    ];

    (function addCentralPathAndCity() {
        const rows = map.length;
        const cols = map[0].length;
        const centerX = Math.floor(cols / 2); // central column
        const centerY = Math.floor(rows / 2); // central row

        // NOTE: removed global center cross (vertical/horizontal paths) so the
        // map's literal content remains authoritative.

        // City layout parameters - increased radius for more space
        const cityRadius = 3; // creates a 7x7 block
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
            // Corners
            {x: cityMinX, y: cityMinY},
            {x: cityMaxX, y: cityMinY},
            {x: cityMinX, y: cityMaxY},
            {x: cityMaxX, y: cityMaxY},
            // Mid-points
            {x: cityMinX, y: centerY}, // This will be replaced by the path, so it's a placeholder for spacing
            {x: cityMaxX, y: centerY}, // This will be replaced by the path
            {x: centerX, y: cityMinY}, // This will be replaced by the path
            {x: centerX, y: cityMaxY}  // This will be replaced by the path
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

    // --- Update signs: remove [48,15], move PROJECTS from [45,15] to [46,13] ---
    (function updateProjectSigns() {
        const removeX = 48, removeY = 15;
        // Remove any interactive at [48,15]
        for (let i = interactives.length - 1; i >= 0; i--) {
            const it = interactives[i];
            if (Math.floor(it.x) === removeX && Math.floor(it.y) === removeY) {
                interactives.splice(i, 1);
            }
        }
        // If underlying map tile was a sign, reset it to grass (0)
        if (removeY >= 0 && removeY < map.length && removeX >= 0 && removeX < (map[0] || []).length) {
            if (map[removeY][removeX] === 6) map[removeY][removeX] = 0;
        }

        // Move PROJECTS sign from [45,15] -> [46,13]
        const oldX = 45, oldY = 15;
        const newX = 46, newY = 13;

        // Remove old interactive and clear old tile
        for (let i = interactives.length - 1; i >= 0; i--) {
            const it = interactives[i];
            if (Math.floor(it.x) === oldX && Math.floor(it.y) === oldY) {
                interactives.splice(i, 1);
            }
        }
        if (oldY >= 0 && oldY < map.length && oldX >= 0 && oldX < (map[0] || []).length) {
            if (map[oldY][oldX] === 6) map[oldY][oldX] = 0;
        }

        // Set new tile to sign and add/update interactive
        if (newY >= 0 && newY < map.length && newX >= 0 && newX < (map[0] || []).length) {
            map[newY][newX] = 6;
            const idx = interactives.findIndex(it => Math.floor(it.x) === newX && Math.floor(it.y) === newY);
            if (idx !== -1) {
                interactives[idx].message = 'PROJECTS';
            } else {
                interactives.push({ x: newX, y: newY, message: 'PROJECTS' });
            }
            console.log(`Updated signs: removed [${removeX},${removeY}], moved PROJECTS [${oldX},${oldY}] -> [${newX},${newY}]`);
        }
    })();

    // NOTE: circus sign at [8,4] is now baked into the map literal and
    // `interactives` array above; runtime patching removed.

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
    let messages = {
        5: "A cozy-looking hut. The door is locked.",
        6: "The sign reads: 'Welcome to Pixel Valley!'"
    };
    
    // Messages for new tile types
    messages[7] = "Fields of crops sway in the breeze.";
    messages[8] = "Education district: The quiet hum of learning fills the air.";
    messages[9] = "Circus: bright tents and lively music can be heard.";

    (function createSchoolCampus() {
        // Find the center of the education area to build the campus.
        const eduTiles = [];
        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                if (map[y][x] === 8) {
                    eduTiles.push({x, y});
                }
            }
        }

        if (eduTiles.length === 0) return; // No education area found.

        // Find the geometric center of the main education block.
        const centerX = Math.floor(eduTiles.reduce((sum, t) => sum + t.x, 0) / eduTiles.length);
        const centerY = Math.floor(eduTiles.reduce((sum, t) => sum + t.y, 0) / eduTiles.length);

        // Place a new sign for the university at the center.
        map[centerY][centerX] = 6; // Place a sign tile.
        interactives.push({x: centerX, y: centerY, message: "Pixel Valley University: Est. 2024"});

        // Define the campus area around the new sign.
        const radius = 4;
        const startX = centerX - radius;
        const startY = centerY - radius;
        const endX = centerX + radius;
        const endY = centerY + radius;

        // Replace surrounding tiles with grass and paths
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (y >= 0 && y < MAP_ROWS && x >= 0 && x < MAP_COLS) {
                    // Don't overwrite the sign we just placed.
                    if (x === centerX && y === centerY) continue;

                    // Create a circular path within the campus
                    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    if (dist > radius - 1.5 && dist < radius - 0.5) {
                        map[y][x] = 1; // Path
                    } else {
                        map[y][x] = 0; // Grass
                    }
                }
            }
        }

        // Place a few "school buildings" (huts) on the new campus grounds.
        map[centerY - 2][centerX - 2] = 5;
        map[centerY - 2][centerX + 2] = 5;
        map[centerY + 2][centerX - 2] = 5;
        map[centerY + 2][centerX + 2] = 5;
    })();

    // NOTE: Previously there was a runtime patch here to ensure a sign at [29,31].
    // That runtime patch was removed and the sign/message are now persisted in
    // the `map`/`interactives` data above so no IIFE patching is required at load.

    // --- Add SKILLS sign at [28,7] as requested ---
    (function addSkillsSign() {
        const sx = 28, sy = 7;
        if (sy >= 0 && sy < map.length && sx >= 0 && sx < map[0].length) {
            console.log(`ADDING: placing SKILLS sign at [${sx},${sy}]`);
            map[sy][sx] = 6; // sign tile
            // avoid duplicates
            const exists = interactives.find(it => Math.floor(it.x) === sx && Math.floor(it.y) === sy);
            if (!exists) {
                interactives.push({ x: sx, y: sy, message: 'SKILLS' });
            }
        } else {
            console.warn('ADD SKILLS: coords out of bounds');
        }
    })();

    // --- Wind Turbine Data ---
    const windTurbines = [];


    // --- Procedural Decoration Data ---
    const randomFlowers = [];
    const FLOWER_DENSITY = 0.025; // 2.5% chance for a flower on any given grass tile

    // --- Ferris Wheel Data ---
    let ferrisWheel = null;
    const industrialBuildings = [];

    // --- Flag Data ---
    const flags = [];



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

    function initFlags() {
        const centerX = Math.floor(MAP_COLS / 2);
        const centerY = Math.floor(MAP_ROWS / 2);
        const cityRadius = 3;
        // Place a flag at one of the city entrances
        // Place the flag in the top-left plaza of the city center.
        flags.push({ x: centerX - 2, y: centerY - 2, type: 'zurich' });
    }

    function initRandomFlowers() {
        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                // Only place on grass tiles
                if (map[y][x] === 0) {
                    if (Math.random() < FLOWER_DENSITY) {
                        randomFlowers.push({ x, y });
                    }
                }
            }
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

    function initFerrisWheel() {
        const circusTiles = [];
        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                if (map[y][x] === 9) {
                    circusTiles.push({ x, y });
                }
            }
        }

        if (circusTiles.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        circusTiles.forEach(tile => {
            if (tile.x < minX) minX = tile.x;
            if (tile.y < minY) minY = tile.y;
            if (tile.x > maxX) maxX = tile.x;
            if (tile.y > maxY) maxY = tile.y;
        });

        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;

        ferrisWheel = { x: centerX, y: centerY };
    }

    function drawFerrisWheel(x, y) {
        ctx.save();
        ctx.translate(x, y);

        const radius = 120;
        const numCabins = 10;
        const cabinColors = ['#FF1493', '#00BFFF', '#FFD700', '#ADFF2F', '#FF4500'];
        const structureColor = '#FFFACD';

        // Draw support structure
        ctx.strokeStyle = structureColor;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, TILE_HEIGHT);
        ctx.lineTo(-radius * 0.6, -radius * 0.8);
        ctx.moveTo(0, TILE_HEIGHT);
        ctx.lineTo(radius * 0.6, -radius * 0.8);
        ctx.stroke();

        // Draw the wheel spokes
        const time = Date.now();
        const angleOffset = (time / 10000) * Math.PI * 2;
        for (let i = 0; i < numCabins; i++) {
            const angle = (i / numCabins) * Math.PI * 2 + angleOffset;
            const cabinX = Math.cos(angle) * radius;
            const cabinY = Math.sin(angle) * radius - radius;
            ctx.fillStyle = cabinColors[i % cabinColors.length];
            ctx.fillRect(cabinX - 10, cabinY - 10, 20, 20);
        }
        ctx.restore();
    }

    function initWindTurbines() {
        const eduTiles = [];
        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                if (map[y][x] === 8) {
                    eduTiles.push({x, y});
                }
            }
        }

        if (eduTiles.length > 0) {
            let cornerTile = eduTiles[0];
            // Find the top-left most tile of the education area
            for (const tile of eduTiles) {
                if (tile.x < cornerTile.x) {
                    cornerTile = tile;
                } else if (tile.x === cornerTile.x && tile.y < cornerTile.y) {
                    cornerTile = tile;
                }
            }
            // Place multiple turbines along the corner edge, each with a random rotation offset.
            const numTurbines = 6;
            for (let i = 0; i < numTurbines; i++) {
                // Place turbines vertically along the corner, spaced out.
                windTurbines.push({
                    x: cornerTile.x + 1,
                    y: cornerTile.y + 1 + (i * 4), // Increased spacing
                    rotationOffset: Math.random() * Math.PI * 2
                });
            }
        }
    }

    function drawWindTurbine(x, y, turbineData) {
        ctx.save();
        ctx.translate(x, y);

        const poleHeight = 120; // Made slightly smaller
        const poleColor = '#E0E0E0';
        const bladeColor = '#FFFFFF';
        const bladeLength = 65; // Made slightly smaller

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, TILE_HEIGHT, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pole
        ctx.fillStyle = poleColor;
        ctx.fillRect(-5, -poleHeight + TILE_HEIGHT, 10, poleHeight);

        // Blades
        ctx.translate(0, -poleHeight + TILE_HEIGHT); // Move to top of pole
        const time = Date.now();
        const baseAngle = (time / 4000) * Math.PI * 2; // Slower, smoother rotation
        ctx.rotate(baseAngle + (turbineData.rotationOffset || 0));

        ctx.fillStyle = bladeColor;
        ctx.strokeStyle = '#BDBDBD';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) { // Draw 3 blades
            ctx.fillRect(0, -5, bladeLength, 10); // Draw the blade
            ctx.strokeRect(0, -5, bladeLength, 10);
            ctx.rotate((Math.PI * 2) / 3); // Rotate for the next blade
        }

        ctx.restore();
    }

    function drawEducationTile(x, y) {
        // Base color for the tile
        drawTile(x, y, '#CD853F'); // Peru - a reddish-brown for mortar

        ctx.save();
        ctx.translate(x, y);

        // Draw a brick pattern
        const brickColor = '#A0522D'; // Sienna
        const brickWidth = TILE_WIDTH / 4;
        const brickHeight = TILE_HEIGHT / 4;

        ctx.fillStyle = brickColor;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const offsetX = (j % 2) * (brickWidth / 2);
                const isoX = (i - j) * (brickWidth / 2) - TILE_WIDTH / 2 + offsetX;
                const isoY = (i + j) * (brickHeight / 2) - TILE_HEIGHT / 2;
                ctx.fillRect(isoX, isoY, brickWidth * 0.9, brickHeight * 0.8);
            }
        }
        ctx.restore();
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
    function drawSign(x, y, message = "?", part = 'full') {
        const boardWidth = 120; // Wider and more rectangular
        const boardHeight = 40;
        const postColor = '#778899'; // LightSlateGray for a metal look
        const boardColor = '#0052A5'; // A nice blue
        const textColor = '#FFFFFF';

        if (part === 'full' || part === 'post') {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(x, y + TILE_HEIGHT, boardWidth / 2, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Post
            ctx.fillStyle = postColor;
            ctx.fillRect(x - 4, y - 50, 8, 50 + TILE_HEIGHT);
        }

        if (part === 'full' || part === 'board') {
            // Board
            ctx.fillStyle = boardColor;
            ctx.fillRect(x - boardWidth / 2, y - 55, boardWidth, boardHeight);
            ctx.strokeStyle = textColor; // White border
            ctx.lineWidth = 3;
            ctx.strokeRect(x - boardWidth / 2, y - 55, boardWidth, boardHeight);

            ctx.fillStyle = textColor; // White text
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Start with a default font size and shrink if the message is too wide
            let fontSize = 18;
            ctx.font = `bold ${fontSize}px Arial`;
            const maxTextWidth = boardWidth - 12; // padding
            let measured = ctx.measureText(message).width;
            while (measured > maxTextWidth && fontSize > 8) {
                fontSize -= 1;
                ctx.font = `bold ${fontSize}px Arial`;
                measured = ctx.measureText(message).width;
            }
            ctx.fillText(message, x, y - 55 + boardHeight / 2);
        }
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

    function drawFlag(x, y, type) {
        ctx.save();
        ctx.translate(x, y);

        const poleHeight = 120;
        const poleColor = '#C0C0C0'; // Silver
        const flagWidth = 50;
        const flagHeight = 32;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, TILE_HEIGHT, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pole
        ctx.fillStyle = poleColor;
        ctx.fillRect(-2, -poleHeight + TILE_HEIGHT, 4, poleHeight);

        // Flag
        const flagY = -poleHeight + TILE_HEIGHT;
        if (type === 'zurich') {
            // Draw the full white rectangle first
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, flagY, flagWidth, flagHeight);

            // Then draw the blue top-left triangle over it
            ctx.fillStyle = '#0052A5'; // Zurich Blue
            ctx.beginPath();
            ctx.moveTo(0, flagY);
            ctx.lineTo(flagWidth, flagY);
            ctx.lineTo(0, flagY + flagHeight);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
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

    // Draws a patch of colorful flowers
    function drawFlowers(x, y) {
        ctx.save();
        ctx.translate(x, y);

        const flowerColors = ['#FF6347', '#4169E1', '#FFD700']; // Tomato, RoyalBlue, Gold
        const stemColor = '#2E8B57'; // SeaGreen
        const positions = [
            { dx: -8, dy: 0, size: 5 },
            { dx: 2, dy: 5, size: 6 },
            { dx: 10, dy: -2, size: 5.5 }
        ];

        // Shadow for the patch
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(0, TILE_HEIGHT, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        positions.forEach((pos, index) => {
            // Stem
            ctx.fillStyle = stemColor;
            ctx.fillRect(pos.dx - 1, pos.dy, 2, TILE_HEIGHT);

            // Petals (as a simple circle)
            ctx.fillStyle = flowerColors[index % flowerColors.length];
            ctx.beginPath();
            ctx.arc(pos.dx, pos.dy, pos.size, 0, Math.PI * 2);
            ctx.fill();
        });

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

        // Smoothly adjust zoom towards target
        const zoomSpeed = 0.05;
        zoom += (targetZoom - zoom) * zoomSpeed;

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

        ctx.save();

        // Center camera: if initialView is true, center on map and keep the fit zoom
        if (cinematicFocus) {
            // Center camera between player and the sign for cinematic effect
            const midX = (cinematicFocus.player.x + cinematicFocus.target.x) / 2;
            const midY = (cinematicFocus.player.y + cinematicFocus.target.y) / 2;
            const midIso = toIsometric(midX, midY);
            camera.x = canvas.width / 2 - midIso.x * zoom;
            camera.y = canvas.height / 2 - midIso.y * zoom;
        } else if (initialView) {
            // center on map midpoint
            const centerIso = toIsometric((MAP_COLS - 1) / 2, (MAP_ROWS - 1) / 2);
            camera.x = canvas.width / 2 - centerIso.x * zoom;
            camera.y = canvas.height / 2 - centerIso.y * zoom;
        } else {
            // Center on player
            const playerIso = toIsometric(player.x, player.y);
            camera.x = canvas.width / 2 - playerIso.x * zoom;
            camera.y = canvas.height / 2 - playerIso.y * zoom;
        }
        
        ctx.translate(camera.x, camera.y);
        ctx.scale(zoom, zoom);
        
        // --- Draw Map and Objects ---
        // We draw objects in a separate pass to handle Z-ordering correctly
        const objectsToDraw = [];
        let playerObject = null;

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
                    case 8: // Education
                        drawEducationTile(iso.x, iso.y);
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
                    playerObject = {type: 'player', iso};
                }
                
                if (tileType === 3) {
                    objectsToDraw.push({type: 'tree', iso});
                } else if (tileType === 4) {
                     objectsToDraw.push({type: 'flower', iso});
                } else if (tileType === 5) {
                    objectsToDraw.push({type: 'hut', iso});
                } else if (tileType === 6) {
                    let message = messages[6]; // Default message
                    const interactiveSign = interactives.find(it => Math.floor(it.x) === x && Math.floor(it.y) === y);
                    if (interactiveSign) {
                        message = interactiveSign.message;
                    }
                    objectsToDraw.push({type: 'sign', iso, meta: { message }});
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
        
        // Add the ferris wheel to the draw queue
        if (ferrisWheel) {
            const iso = toIsometric(ferrisWheel.x, ferrisWheel.y);
            objectsToDraw.push({type: 'ferrisWheel', iso});
        }

        // Add wind turbines to draw queue
        for (const turbine of windTurbines) {
            const iso = toIsometric(turbine.x, turbine.y);
            objectsToDraw.push({type: 'windTurbine', iso, meta: turbine});
        }

        // Add random flowers to draw queue
        for (const flower of randomFlowers) {
            const iso = toIsometric(flower.x, flower.y);
            // Adjust for hill height so flowers sit on top of hills
            const height = heightMap[flower.y] ? (heightMap[flower.y][flower.x] || 0) : 0;
            iso.y -= height * (TILE_HEIGHT / 2);
            objectsToDraw.push({type: 'flower', iso});
        }

        // Add flags to draw queue
        for (const flag of flags) {
            const iso = toIsometric(flag.x, flag.y);
            objectsToDraw.push({type: 'flag', iso, meta: flag});
        }

        // --- Draw Objects and Player (sorted by Y for correct overlap) ---
        objectsToDraw.sort((a,b) => (a.iso.y) - (b.iso.y));

        objectsToDraw.forEach(obj => {
            switch(obj.type) {
                case 'tree':
                    drawTree(obj.iso.x, obj.iso.y);
                    break;
                case 'flower':
                    drawFlowers(obj.iso.x, obj.iso.y);
                    break;
                case 'hut':
                    drawHut(obj.iso.x, obj.iso.y);
                    break;
                case 'sign':
                    drawSign(obj.iso.x, obj.iso.y, obj.meta.message, 'post');
                    break;
                case 'interactive':
                    // draw a small red square to represent the interactive object
                    ctx.save();
                    ctx.translate(obj.iso.x, obj.iso.y - 8); // slightly above ground
                    ctx.fillStyle = '#FF1493'; // DeepPink
                    ctx.fillRect(-6, -6, 12, 12);
                    ctx.restore();
                    break;
                case 'circus':
                    drawCircus(obj.iso.x, obj.iso.y);
                    break;
                case 'ferrisWheel':
                    drawFerrisWheel(obj.iso.x, obj.iso.y);
                    break;
                case 'windTurbine':
                    drawWindTurbine(obj.iso.x, obj.iso.y, obj.meta);
                    break;
                case 'flag':
                    drawFlag(obj.iso.x, obj.iso.y, obj.meta.type);
                    break;
            }
        });

        // --- Second Pass: Draw sign boards on top of everything ---
        objectsToDraw.forEach(obj => {
            if (obj.type === 'sign') {
                drawSign(obj.iso.x, obj.iso.y, obj.meta.message, 'board');
            }
        });

        // --- Final Pass: Draw Player on top ---
        if (playerObject) {
            drawPlayer(playerObject.iso.x, playerObject.iso.y);
        }


        ctx.restore();

        // If a message is visible, draw a semi-transparent cloud layer over the game world
        if (messageVisible) {
            // This is drawn in screen space, after the game world is rendered.
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // A white-ish overlay to make clouds pop
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            clouds.forEach(cloud => {
                drawCloud(cloud.x, cloud.y, cloud.size * 1.5); // Draw slightly larger clouds
            });
        }

        requestAnimationFrame(render);
    }

    // --- Interaction ---
    function showMessage(text) {
        messageText.textContent = text;
        messageBox.style.display = 'block';
        messageVisible = true;
    }

    function hideMessage() {
        if (cinematicFocus) {
            cinematicFocus = null;
            targetZoom = computeFitZoom(); // Or whatever the previous zoom was
        }
        messageBox.style.display = 'none';
        messageVisible = false;
    }

    function handleInteraction() {
        if (messageVisible) {
            hideMessage();
            return;
        }
        
        // Build a list of nearby integer tile coords (3x3 around player) ordered by distance
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                neighbors.push({ x: px + dx, y: py + dy, dist: Math.abs(dx) + Math.abs(dy) });
            }
        }
        neighbors.sort((a,b) => a.dist - b.dist);

        for (const coord of neighbors) {
            if (coord.x < 0 || coord.x >= MAP_COLS || coord.y < 0 || coord.y >= MAP_ROWS) continue;

            const tileX = coord.x;
            const tileY = coord.y;
            const tileType = map[tileY][tileX];

            // Prioritize signs
            if (tileType === 6) {
                const interactiveSign = interactives.find(it => Math.floor(it.x) === tileX && Math.floor(it.y) === tileY);
                const message = interactiveSign ? interactiveSign.message : messages[6];
                cinematicFocus = { player: { x: player.x, y: player.y }, target: { x: tileX, y: tileY } };
                targetZoom = 2.5;
                showMessage(message);
                return;
            }

            // Check for other interactives (red squares)
            const foundInteractive = interactives.find(it => Math.floor(it.x) === tileX && Math.floor(it.y) === tileY);
            if (foundInteractive) {
                showMessage(foundInteractive.message);
                return;
            }
        }
    }


    function getNextCoord(currentX, currentY, direction) {
        let nextX = currentX;
        let nextY = currentY;
        switch (direction) {
            case 'Up': nextX -= 1; nextY -= 1; break;
            case 'Down': nextX += 1; nextY += 1; break;
            case 'Left': nextX -= 1; nextY += 1; break;
            case 'Right': nextX += 1; nextY -= 1; break;
        }
        return { x: nextX, y: nextY };
    }

    // --- Controls ---
    function handleKeyDown(e) {
        if (e.key === ' ') { // Spacebar
            e.preventDefault();
            handleInteraction();
            return;
        }

        if (messageVisible) return; // Don't move if any message is open

        const directionMap = {
            'ArrowUp': 'Up', 'ArrowDown': 'Down',
            'ArrowLeft': 'Left', 'ArrowRight': 'Right'
        };
        const direction = directionMap[e.key];
        if (!direction) return;

        const { x: nextX, y: nextY } = getNextCoord(player.x, player.y, direction);
        
        // Collision Detection
        if (nextX >= 0 && nextX < MAP_COLS && nextY >= 0 && nextY < MAP_ROWS) {
            const targetTile = map[Math.floor(nextY)][Math.floor(nextX)];
            if (targetTile !== 2 && targetTile !== 3 && targetTile !== 5) { // Cannot walk on water, trees, or huts. Signs are not solid.
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
        targetZoom = zoom;
    }

    function zoomOut() {
        zoom = Math.max(zoom - 0.2, 0.1); // Min zoom 0.1 (allow fitting smaller maps)
        targetZoom = zoom;
    }

    // --- Initialization ---
    function init() {
        // Set initial canvas size
        resizeCanvas();

        // Compute and set initial fitted zoom so the whole map is visible on start
        targetZoom = computeFitZoom();
        zoom = targetZoom;

        // Create the initial set of clouds
        initClouds();

        // Generate the terrain heightmap
        initHeightMap();

        // Identify and label all bodies of water
        identifyWaterBodies();

        // Find circus area and create the ferris wheel
        initFerrisWheel();

        // Find education area and create a wind turbine
        initWindTurbines();

        // Sprinkle random flowers on grass
        initRandomFlowers();

        // Place flags
        initFlags();

        // Add listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', resizeCanvas); // Resize canvas when window size changes

        // Add zoom control listeners
        document.getElementById('zoomIn').addEventListener('click', zoomIn);
        document.getElementById('zoomOut').addEventListener('click', zoomOut);
        // Start the game loop
        render();

        // DEBUG: print info about the sign the user reported at [29,31]
        try {
            const dbgX = 29, dbgY = 31;
            if (dbgY >= 0 && dbgY < MAP_ROWS && dbgX >= 0 && dbgX < MAP_COLS) {
                console.log('DEBUG: map[' + dbgY + '][' + dbgX + '] =', map[dbgY][dbgX]);
                const it = interactives.find(o => Math.floor(o.x) === dbgX && Math.floor(o.y) === dbgY);
                console.log('DEBUG: interactive at [29,31]:', it || 'none');
            } else {
                console.log('DEBUG: [29,31] outside map bounds');
            }
        } catch (e) {
            console.error('DEBUG: error while checking tile', e);
        }

        // --- Mouse debug overlay (added helper) ---
        (function addMouseDebugOverlay() {
            // Helper: convert screen (client) coordinates -> map (tile) fractional coordinates
            function screenToMap(screenX, screenY) {
                const rect = canvas.getBoundingClientRect();
                const canvasX = screenX - rect.left;
                const canvasY = screenY - rect.top;

                // undo camera translation and zoom to get isometric world coords
                const worldIsoX = (canvasX - camera.x) / zoom;
                const worldIsoY = (canvasY - camera.y) / zoom;

                const a = TILE_WIDTH / 2;
                const b = TILE_HEIGHT / 2;

                const mapX = (worldIsoX / a + worldIsoY / b) / 2;
                const mapY = (worldIsoY / b - worldIsoX / a) / 2;

                return { x: mapX, y: mapY };
            }

            const dbg = document.createElement('div');
            dbg.id = 'debugTileCoords';
            dbg.style.position = 'fixed';
            dbg.style.right = '8px';
            dbg.style.bottom = '8px';
            dbg.style.padding = '6px 8px';
            dbg.style.background = 'rgba(0,0,0,0.6)';
            dbg.style.color = '#fff';
            dbg.style.font = '12px monospace';
            dbg.style.zIndex = 9999;
            dbg.style.pointerEvents = 'none';
            document.body.appendChild(dbg);

            canvas.addEventListener('mousemove', (ev) => {
                const m = screenToMap(ev.clientX, ev.clientY);
                const ix = Math.floor(m.x);
                const iy = Math.floor(m.y);
                dbg.textContent = `map: (${m.x.toFixed(2)}, ${m.y.toFixed(2)})  tile: [${ix}, ${iy}]`;
            });

            canvas.addEventListener('click', (ev) => {
                const m = screenToMap(ev.clientX, ev.clientY);
                const ix = Math.floor(m.x);
                const iy = Math.floor(m.y);
                if (ix < 0 || ix >= MAP_COLS || iy < 0 || iy >= MAP_ROWS) {
                    console.log('Clicked outside map');
                    return;
                }
                const tileType = map[iy][ix];
                console.log('Clicked tile coord:', ix, iy, 'tileType:', tileType);
                if (messages[tileType]) {
                    showMessage(messages[tileType]);
                } else {
                    const it = interactives.find(o => Math.floor(o.x) === ix && Math.floor(o.y) === iy);
                    if (it) showMessage(it.message);
                }
            });
        })();
    }

    init();
});


