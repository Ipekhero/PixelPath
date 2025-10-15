document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    // Ensure canvas fills the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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

    // Cancel autopilot helper
    function cancelAutopilot() {
        if (player.path && player.path.length > 0) {
            console.log('Autopilot cancelled');
        }
        player.path = null;
        player.autoTarget = null;
        player.moveTimer = 0;
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

    // --- Overlay: central path and city ---
    // Adds a vertical and horizontal path crossing the map center and a 5x5 city block.
    // interactive objects list (pre-populated with persistent signs)
    const interactives = [
        // Sign interactions with rich content support
        { 
            x: 29, y: 31, 
            message: 'EXPERIENCE',
            content: `
                <h3>Professional Experience</h3>
                <p>Welcome to my Experience section!</p>
                <p>Here you can find information about my professional journey, roles, and accomplishments.</p>
                <p><a href="https://linkedin.com" target="_blank">View my LinkedIn Profile</a></p>
            `
        },
        { 
            x: 4, y: 8, 
            message: 'FUN',
            content: `
                <h3>Fun & Hobbies</h3>
                <p>This is the Fun Zone! 🎉</p>
                <p>Discover my hobbies, interests, and side projects.</p>
                <p>When I'm not coding, you'll find me exploring new technologies, playing games, or working on creative projects.</p>
            `
        },
        { 
            x: 7, y: 33, 
            message: 'EDUCATION',
            content: `
                <h3>Education & Learning</h3>
                <p>My academic background and continuous learning journey.</p>
                <p>I believe in lifelong learning and constantly expanding my knowledge through courses, books, and hands-on projects.</p>
            `
        },
        { 
            x: 46, y: 13, 
            message: 'PROJECTS',
            content: `
                <h3>Featured Projects</h3>
                <p>Check out my portfolio of completed and ongoing projects.</p>
                <p>From web applications to creative experiments, each project represents a learning journey and problem-solving adventure.</p>
                <p><a href="#" target="_blank">View Projects Gallery</a></p>
            `
        },
        { 
            x: 28, y: 7, 
            message: 'SKILLS',
            content: `
                <h3>Technical Skills & Expertise</h3>
                <p>Programming languages, frameworks, and tools I work with.</p>
                <p>I'm proficient in modern web technologies and constantly exploring new tools and techniques to improve my craft.</p>
            `
        },
        { 
            x: 46, y: 23, 
            message: 'CERTIFICATES',
            content: `
                <h3>Certifications & Awards</h3>
                <p>Professional certifications and recognitions.</p>
                <p>View my collection of certificates from various online platforms and institutions.</p>
            `
        }
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

        // ...removed non-sign interactives...
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

    // autopilot path and movement timing
    player.path = null; // array of {x,y} to follow
    player.moveTimer = 0;
    player.moveInterval = 120; // ms per tile
    player.autoTarget = null;

    // --- Message Data ---
    let messages = {
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
    // --- Add random colorful objects around SKILLS sign ---
    (function addSkillsObjects() {
        const centerX = 28, centerY = 7;
        const objects = [
            { dx: -1, dy: 0, type: 'computer', color: '#00BFFF' },
            { dx: 1, dy: 0, type: 'paint', color: '#FF6347' },
            { dx: 0, dy: -1, type: 'guitar', color: '#FFD700' },
            { dx: -1, dy: -1, type: 'book', color: '#8A2BE2' },
            { dx: 1, dy: 1, type: 'camera', color: '#4CAF50' }
        ];
        window.skillsDecorObjects = [];
        for (const obj of objects) {
            const x = centerX + obj.dx;
            const y = centerY + obj.dy;
            if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                window.skillsDecorObjects.push({ x, y, type: obj.type, color: obj.color });
            }
        }
    })();
    // --- Add CERTIFICATES sign at [46,23] ---
    (function addCertificatesSign() {
        const sx = 46, sy = 23;
        if (sy >= 0 && sy < map.length && sx >= 0 && sx < map[0].length) {
            map[sy][sx] = 6; // sign tile
            // avoid duplicates
            const exists = interactives.find(it => Math.floor(it.x) === sx && Math.floor(it.y) === sy);
            if (!exists) {
                interactives.push({ x: sx, y: sy, message: 'CERTIFICATES' });
            }
        } else {
            console.warn('ADD CERTIFICATES: coords out of bounds');
        }
    })();
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

    // Remove stroke logic entirely to prevent grid lines

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
    const boardColor = '#0052A5'; // Blue
    const textColor = '#FFFFFF'; // White

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
    const trunkColor = '#A67C52'; // Light Brown
    const leafColors = ['#7ED957', '#4CAF50', '#388E3C']; // Harmonized greens

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

    // Create a static player image for the popup
    function createPlayerImage(graduationHat = false) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set canvas size to fit the player
        tempCanvas.width = 200;
        tempCanvas.height = 200;
        
        // Fill background with grass green
        tempCtx.fillStyle = '#7CBA5A';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Center the player in the canvas
        const scale = 2; // Make character 2x larger
        const centerX = 100;
        const centerY = 120;
        
        // Draw the player using the temp context (scaled up)
        const playerTopY = centerY - (player.height * scale) + TILE_HEIGHT;
        const dressColor = player.color;
        const skinColor = '#FFDBAC';
        
        // Dress (main body) - A-line shape
        tempCtx.fillStyle = dressColor;
        tempCtx.beginPath();
        tempCtx.moveTo(centerX - (player.width / 2 + 2) * scale, playerTopY);
        tempCtx.lineTo(centerX + (player.width / 2 - 2) * scale, playerTopY);
        tempCtx.lineTo(centerX + player.width * scale, playerTopY + (player.height + 10) * scale);
        tempCtx.lineTo(centerX - player.width * scale, playerTopY + (player.height + 10) * scale);
        tempCtx.closePath();
        tempCtx.fill();
        
        // Arms
        const armWidth = 5 * scale;
        tempCtx.fillStyle = skinColor;
        tempCtx.fillRect(centerX - (player.width / 2) * scale - armWidth, playerTopY + 2 * scale, armWidth, 12 * scale);
        tempCtx.fillRect(centerX + (player.width / 2) * scale, playerTopY + 2 * scale, armWidth, 12 * scale);
        
        // Legs
        const legWidth = 6 * scale;
        tempCtx.fillRect(centerX - legWidth, playerTopY + (player.height + 10) * scale, legWidth, 10 * scale);
        tempCtx.fillRect(centerX, playerTopY + (player.height + 10) * scale, legWidth, 10 * scale);
        
        // Feet
        tempCtx.fillStyle = '#8A2BE2';
        tempCtx.fillRect(centerX - legWidth - scale, playerTopY + (player.height + 20) * scale, legWidth + 2 * scale, 4 * scale);
        tempCtx.fillRect(centerX - scale, playerTopY + (player.height + 20) * scale, legWidth + 2 * scale, 4 * scale);
        
        // Hair
        const hairColor = '#8B4513';
        const hairTopY = playerTopY - 12 * scale;
        tempCtx.fillStyle = hairColor;
        const curlSize = 8 * scale;
        
        for (let i = 0; i < 5; i++) {
            tempCtx.beginPath();
            tempCtx.arc(centerX - 15 * scale + i * 7 * scale, hairTopY + 15 * scale, curlSize, 0, Math.PI * 2);
            tempCtx.fill();
        }
        for (let i = 0; i < 6; i++) {
            tempCtx.beginPath();
            tempCtx.arc(centerX - 18 * scale + i * 7 * scale, hairTopY + 8 * scale, curlSize, 0, Math.PI * 2);
            tempCtx.fill();
        }
        for (let i = 0; i < 5; i++) {
            tempCtx.beginPath();
            tempCtx.arc(centerX - 15 * scale + i * 7 * scale, hairTopY + 2 * scale, curlSize, 0, Math.PI * 2);
            tempCtx.fill();
        }
        
        // Face
        tempCtx.fillStyle = skinColor;
        tempCtx.beginPath();
        tempCtx.arc(centerX, playerTopY + 4 * scale, 8 * scale, 0, Math.PI * 2);
        tempCtx.fill();
        
        // Eyes
        tempCtx.fillStyle = '#000';
        tempCtx.fillRect(centerX - 4 * scale, playerTopY + 2 * scale, 2 * scale, 3 * scale);
        tempCtx.fillRect(centerX + 2 * scale, playerTopY + 2 * scale, 2 * scale, 3 * scale);
        
        // Mouth
        tempCtx.beginPath();
        tempCtx.arc(centerX, playerTopY + 8 * scale, 2 * scale, 0, Math.PI, false);
        tempCtx.stroke();

        // Graduation hat (for education popup)
        if (graduationHat) {
            // Hat base (black square)
            tempCtx.fillStyle = '#222';
            tempCtx.fillRect(centerX - 10 * scale, playerTopY - 14 * scale, 20 * scale, 6 * scale);
            // Hat top (black parallelogram)
            tempCtx.beginPath();
            tempCtx.moveTo(centerX - 14 * scale, playerTopY - 14 * scale);
            tempCtx.lineTo(centerX + 14 * scale, playerTopY - 14 * scale);
            tempCtx.lineTo(centerX + 10 * scale, playerTopY - 22 * scale);
            tempCtx.lineTo(centerX - 10 * scale, playerTopY - 22 * scale);
            tempCtx.closePath();
            tempCtx.fillStyle = '#222';
            tempCtx.fill();
            // Tassel (yellow line)
            tempCtx.strokeStyle = '#FFD700';
            tempCtx.lineWidth = 2 * scale;
            tempCtx.beginPath();
            tempCtx.moveTo(centerX + 8 * scale, playerTopY - 22 * scale);
            tempCtx.lineTo(centerX + 8 * scale, playerTopY - 10 * scale);
            tempCtx.stroke();
            // Tassel ball
            tempCtx.beginPath();
            tempCtx.arc(centerX + 8 * scale, playerTopY - 10 * scale, 2 * scale, 0, Math.PI * 2);
            tempCtx.fillStyle = '#FFD700';
            tempCtx.fill();
        }

        // Return the canvas as an img element
        const img = document.createElement('img');
        img.src = tempCanvas.toDataURL();
        img.style.imageRendering = 'pixelated';
        img.style.width = '100%';
        img.style.height = 'auto';
        return img.outerHTML;
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
    let lastTimestamp = 0;
    function render(timestamp) {
        if (!timestamp) timestamp = performance.now();
        const dt = timestamp - (lastTimestamp || timestamp);
        lastTimestamp = timestamp;
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

        // --- Auto-move handling: step along path at fixed intervals ---
        if (player.path && player.path.length > 0 && !messageVisible && !cinematicFocus) {
            player.moveTimer += dt;
            // Only advance at most one tile per frame to avoid "skipping" many tiles during slow frames
            if (player.moveTimer >= player.moveInterval && player.path && player.path.length > 0) {
                player.moveTimer -= player.moveInterval;
                const next = player.path.shift();
                player.x = next.x;
                player.y = next.y;
                // arrived at destination
                if (player.path.length === 0) {
                    // clear autopilot target then trigger interaction
                    player.autoTarget = null;
                    // small delay before opening to allow camera to settle
                    setTimeout(() => {
                        handleInteraction();
                    }, 120);
                }
            }
        }

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
                        drawTile(iso.x, iso.y, shadeColor('#99F266', height * 5)); // Fresh green
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
                            drawTile(iso.x, iso.y, '#F5F5DC'); // Beige
                        }
                        break;
                    case 2: // Water
                        drawWater(iso.x, iso.y, x, y, '#A7EFFF'); // Light Aqua
                        break;
                    case 7: // Crops
                        drawTile(iso.x, iso.y, '#E2C290'); // Light Brown
                        drawCrops(iso.x, iso.y); // Draw the crop details on top
                        break;
                    case 8: // Education
                        drawEducationTile(iso.x, iso.y, '#D6F5FF'); // Pale Blue
                        break;
                    case 9: // Circus
                        drawTile(iso.x, iso.y, '#FFD6E0'); // Light Pink
                        break;
                    case 3: // Tree placeholder
                    case 4: // Flower placeholder
                    case 5: // Hut placeholder
                    case 6: // Sign placeholder
                        iso.y -= height * (TILE_HEIGHT / 2); // Also raise grass under objects
                        drawTile(iso.x, iso.y, shadeColor('#99F266', height * 5)); // Draw grass underneath
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
        // Sort objects so huts are drawn after the player (in front)
        objectsToDraw.sort((a, b) => {
            // If one is hut and the other is player, hut comes after
            if (a.type === 'player' && b.type === 'hut') return -1;
            if (a.type === 'hut' && b.type === 'player') return 1;
            return a.iso.y - b.iso.y;
        });

        objectsToDraw.forEach(obj => {
        // Draw skills decor objects
        if (window.skillsDecorObjects) {
            // Position objects in a ring around the sign for visibility
            const centerIso = toIsometric(28, 7);
            const radius = 60; // distance from sign
            const angleStep = (Math.PI * 2) / window.skillsDecorObjects.length;
            window.skillsDecorObjects.forEach((deco, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const objX = centerIso.x + Math.cos(angle) * radius;
                const objY = centerIso.y + Math.sin(angle) * radius - 10;
                ctx.save();
                ctx.translate(objX, objY);
                ctx.globalAlpha = 0.98;
                ctx.fillStyle = deco.color;
                switch (deco.type) {
                    case 'computer':
                        ctx.fillRect(-20, -12, 40, 24); // monitor
                        ctx.fillStyle = '#222';
                        ctx.fillRect(-16, -8, 32, 16); // screen
                        break;
                    case 'paint':
                        ctx.beginPath();
                        ctx.arc(0, 0, 16, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(-4, -16, 8, 32); // brush
                        break;
                    case 'guitar':
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#A0522D';
                        ctx.fillRect(-2, -20, 4, 40); // neck
                        break;
                    case 'book':
                        ctx.fillRect(-16, -12, 32, 24);
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(-12, -8, 24, 16);
                        break;
                    case 'camera':
                        ctx.fillRect(-14, -10, 28, 20);
                        ctx.fillStyle = '#222';
                        ctx.beginPath();
                        ctx.arc(0, 0, 8, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
                ctx.restore();
            });
        }
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

            // Draw a small jumping blue arrow above every sign to indicate click-to-move
            function drawSignArrow(x, y) {
                ctx.save();
                ctx.translate(x, y - 70); // above the sign board
                // simple vertical bob using time
                const t = Date.now();
                const bob = Math.sin(t / 300) * 6; // +/-6 px
                ctx.translate(0, bob);

                ctx.fillStyle = '#0052A5'; // same blue as sign boards
                ctx.beginPath();
                // apex downwards, bigger arrow
                ctx.moveTo(0, 12);
                ctx.lineTo(16, -12);
                ctx.lineTo(-16, -12);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // render arrows
            objectsToDraw.forEach(obj => {
                if (obj.type === 'sign') {
                    drawSignArrow(obj.iso.x, obj.iso.y);
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

    // Default SVG character for signs (8-bit style with blue and white)
    // Colors: #0052A5 (blue), #FFFFFF (white)
    const defaultCharacterSVG = `
        <svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="15" width="30" height="30" fill="#0052A5"/>
            <rect x="40" y="20" width="20" height="20" fill="#FFFFFF"/>
            <rect x="35" y="50" width="30" height="40" fill="#0052A5"/>
            <rect x="30" y="60" width="10" height="30" fill="#0052A5"/>
            <rect x="60" y="60" width="10" height="30" fill="#0052A5"/>
        </svg>
    `;

    // Show sign popup with rich content using new detailed popup
    function showSignPopup(signData) {
        // signData should have: title/message, content (HTML), characterSVG (optional)
        const title = signData.message || signData.title || 'Sign';
        const content = signData.content || `<p>${signData.message || ''}</p>`;
        
        // Use player image, with graduation hat for education sign
        let characterHTML;
        const isEducation = (signData.title || signData.message || '').toLowerCase().includes('education');
        if (isEducation) {
            characterHTML = createPlayerImage(true); // pass true for graduation hat
        } else {
            characterHTML = signData.characterSVG || createPlayerImage();
        }
        
        // Get the new popup elements
        const detailPopup = document.getElementById('signDetailPopup');
        const detailHeader = document.getElementById('signDetailHeader');
        const detailCharacter = document.getElementById('signDetailCharacter');
        const detailText = document.getElementById('signDetailText');
        
        // Set the content
        if (isEducation) {
            detailHeader.textContent = 'Academic background';
            detailCharacter.innerHTML = characterHTML;
            detailText.innerHTML = `
                <ul style="font-size:1.2em;line-height:1.8;margin-bottom:16px;">
                    <li style="margin-bottom:12px;"><strong>Delft University of Technology</strong><br>MSc. in Urban design</li>
                    <li style="margin-bottom:12px;"><strong>Middle East Technical University</strong><br>BSc. in City and Regional Planning</li>
                    <li style="margin-bottom:12px;"><strong>Technical University of Dortmund</strong><br>BSc. City Planning</li>
                    <li style="margin-bottom:12px;"><strong>Google UX Design Professional Certificate</strong></li>
                </ul>
                <a href="https://ipekkahraman.figma.site/about" target="_blank" style="color:#0052A5;font-weight:bold;text-decoration:underline;">Learn more</a>
            `;
        } else {
            detailHeader.textContent = title;
            detailCharacter.innerHTML = characterHTML;
            detailText.innerHTML = content;
        }
        
        // Show the popup with animation
        detailPopup.style.display = 'flex';
        setTimeout(() => {
            detailPopup.classList.add('active');
        }, 10);
        
        messageVisible = true;
    }

    function hideSignPopup() {
        if (cinematicFocus) {
            cinematicFocus = null;
            targetZoom = computeFitZoom();
        }
        
        // Hide the new detailed popup
        const detailPopup = document.getElementById('signDetailPopup');
        detailPopup.classList.remove('active');
        setTimeout(() => {
            detailPopup.style.display = 'none';
        }, 300);
        
        // Also hide old popup if it was visible
        overlay.style.display = 'none';
        signPopup.style.display = 'none';
        messageVisible = false;
    }

    // Add event listener for the new close button
    const signDetailCloseBtn = document.getElementById('signDetailClose');
    signDetailCloseBtn.addEventListener('click', hideSignPopup);
    
    // Close on clicking outside the popup content
    document.getElementById('signDetailPopup').addEventListener('click', (e) => {
        if (e.target.id === 'signDetailPopup') {
            hideSignPopup();
        }
    });

    closeSignPopupButton.addEventListener('click', hideSignPopup);
    overlay.addEventListener('click', hideSignPopup);

    function handleInteraction() {
        if (messageVisible) {
            hideMessage();
            hideSignPopup();
            return;
        }
        
        // Only allow interaction with sign tiles
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const tileX = px + dx;
                const tileY = py + dy;
                if (tileX < 0 || tileX >= MAP_COLS || tileY < 0 || tileY >= MAP_ROWS) continue;
                const tileType = map[tileY][tileX];
                if (tileType === 6) {
                    const interactiveSign = interactives.find(it => Math.floor(it.x) === tileX && Math.floor(it.y) === tileY);
                    const signData = interactiveSign || { message: messages[6] };
                    cinematicFocus = { player: { x: player.x, y: player.y }, target: { x: tileX, y: tileY } };
                    targetZoom = 2.5;
                    showSignPopup(signData);
                    return;
                }
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

    // --- Pathfinding (BFS on the game's movement lattice) ---
    // Movement allowed: the same four directions as player controls:
    // Up: (-1,-1), Down: (+1,+1), Left: (-1,+1), Right: (+1,-1)
    function computePath(startX, startY, goalX, goalY) {
        const sX = Math.floor(startX);
        const sY = Math.floor(startY);
        const gX = Math.floor(goalX);
        const gY = Math.floor(goalY);

        // Quick short-circuit
        if (sX === gX && sY === gY) return [];

        const deltas = [
            // 8-directional movement (cardinals + diagonals)
            {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1},
            {dx: -1, dy: -1}, {dx: 1, dy: 1}, {dx: -1, dy: 1}, {dx: 1, dy: -1}
        ];

        function inBounds(x, y) {
            return x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS;
        }

        function isWalkable(x, y) {
            if (!inBounds(x, y)) return false;
            const t = map[y][x];
            // Block water(2), tree(3), hut(5)
            return !(t === 2 || t === 3 || t === 5);
        }

        const startKey = `${sX},${sY}`;
        const goalKey = `${gX},${gY}`;

        const queue = [{x: sX, y: sY}];
        const cameFrom = {};
        const visited = new Set([startKey]);

        while (queue.length > 0) {
            const cur = queue.shift();
            const curKey = `${cur.x},${cur.y}`;

            for (const d of deltas) {
                const nx = cur.x + d.dx;
                const ny = cur.y + d.dy;
                const nKey = `${nx},${ny}`;

                if (!inBounds(nx, ny)) continue;

                // Allow stepping onto the goal even if normally non-walkable
                if (nx === gX && ny === gY) {
                    cameFrom[nKey] = curKey;
                    // reconstruct path
                    const path = [];
                    let curTrace = nKey;
                    while (curTrace && curTrace !== startKey) {
                        const [cx, cy] = curTrace.split(',').map(Number);
                        path.push({x: cx, y: cy});
                        curTrace = cameFrom[curTrace];
                    }
                    path.reverse();
                    return path;
                }

                if (visited.has(nKey)) continue;
                if (!isWalkable(nx, ny)) continue;

                visited.add(nKey);
                cameFrom[nKey] = curKey;
                queue.push({x: nx, y: ny});
            }
        }

        // No path found
        return null;
    }

    // Find a reachable path to the nearest walkable tile around (goalX,goalY)
    function findNearestAccessiblePath(startX, startY, goalX, goalY, maxRadius = 8) {
        const sX = Math.floor(startX);
        const sY = Math.floor(startY);
        const gX = Math.floor(goalX);
        const gY = Math.floor(goalY);

        function inBounds(x, y) {
            return x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS;
        }
        function isWalkableLocal(x, y) {
            if (!inBounds(x, y)) return false;
            const t = map[y][x];
            return !(t === 2 || t === 3 || t === 5);
        }

        let bestPath = null;
        let bestLen = Infinity;

        for (let r = 0; r <= maxRadius; r++) {
            // iterate square ring of radius r
            for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                    const x = gX + dx;
                    const y = gY + dy;
                    if (!inBounds(x, y)) continue;
                    // only consider positions on the current ring
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;

                    if (!isWalkableLocal(x, y)) continue;

                    const path = computePath(sX, sY, x, y);
                    if (path && path.length >= 0 && path.length < bestLen) {
                        bestLen = path.length;
                        bestPath = path;
                    }
                }
            }
            if (bestPath) return bestPath;
        }

        return null;
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
                 // Cancel any autopilot/path following when the player manually moves
                 player.path = null;
                 player.autoTarget = null;
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

        // Escape key cancels autopilot
        window.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
                cancelAutopilot();
            }
        });
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

                // Helper function to check if click is near a sign (within 1.5 tiles)
                const isNearSign = (signX, signY) => {
                    const dx = m.x - signX;
                    const dy = m.y - signY;
                    return Math.sqrt(dx * dx + dy * dy) <= 1.5;
                };

                // If user clicked a sign or an interactive, start autopilot to it
                // Check for nearby interactive objects (expanded clickable area)
                let interactive = interactives.find(o => isNearSign(o.x, o.y));
                const isSignTile = tileType === 6;

                // If no interactive found nearby but current tile is a sign, find the exact sign
                if (!interactive && isSignTile) {
                    interactive = interactives.find(o => Math.floor(o.x) === ix && Math.floor(o.y) === iy);
                }

                if (isSignTile || interactive) {
                    // Use the interactive's position if found, otherwise use clicked position
                    const targetX = interactive ? Math.floor(interactive.x) : ix;
                    const targetY = interactive ? Math.floor(interactive.y) : iy;
                    
                    // Try direct path first
                    let path = computePath(player.x, player.y, targetX, targetY);
                    if (path === null) {
                        // Try to find nearest accessible approach tile
                        path = findNearestAccessiblePath(player.x, player.y, targetX, targetY, 10);
                    }
                    if (path === null) {
                        showMessage("No path to destination.");
                        return;
                    }
                    if (path.length === 0) {
                        // Already standing on the tile - open immediately
                        handleInteraction();
                        return;
                    }
                    // Start autopilot
                    player.path = path;
                    player.autoTarget = { x: targetX, y: targetY };
                    player.moveTimer = 0;
                    // Switch view to player-centered follow
                    initialView = false;
                    console.log('Autopilot started to', targetX, targetY, 'steps:', path.length);
                    return;
                }

                // Fallback: show general messages for other tile types
                if (messages[tileType]) {
                    showMessage(messages[tileType]);
                } else {
                    if (interactive) showMessage(interactive.message);
                }
            });
        })();
    }

    init();
});


