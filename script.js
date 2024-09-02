window.onload = function () {
    const canvas = document.getElementById("snowflakeCanvas");
    const ctx = canvas.getContext("2d");

    // Get the controls and their output elements
    const layerSlider = document.getElementById("layerSlider");
    const speedSlider = document.getElementById("speedSlider");
    const depthSlider = document.getElementById("depthSlider");
    const angleSlider = document.getElementById("angleSlider");
    const layerCountDisplay = document.getElementById("layerCount");
    const speedValueDisplay = document.getElementById("speedValue");
    const depthValueDisplay = document.getElementById("depthValue");
    const angleValueDisplay = document.getElementById("angleValue");
    const toggleControlsButton = document.getElementById("toggleControls");
    const controlsPanel = document.getElementById("controlsPanel");
    const notification = document.getElementById("notification");
    const changeShapeButton = document.getElementById("changeShape");
    const changeColorButton = document.getElementById("changeColor");

    // Set the canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Number of layers for parallax effect
    let numLayers = parseInt(layerSlider.value);
    const layers = [];
    const numSnowflakesPerLayer = 30; // Number of snowflakes per layer
    let speedMultiplier = parseFloat(speedSlider.value); // Speed multiplier from slider
    let recursionDepth = parseInt(depthSlider.value); // Recursion depth from slider
    let fractalAngle = parseInt(angleSlider.value) * (Math.PI / 180); // Fractal angle in radians from slider
    let currentFractalIndex = 0; // Index of the current fractal shape
    let currentColorSchemeIndex = 0; // Index of the current color scheme

    const fractalShapes = ["koch", "sierpinski", "fractalTree", "fractalStar"]; // Available fractal shapes
    const colorSchemes = [
        { name: "Cool Blue", colors: ["#00BFFF", "#1E90FF", "#87CEFA", "#4682B4"] },
        {
            name: "Winter Wonderland",
            colors: ["#FFFFFF", "#F0F8FF", "#E0FFFF", "#AFEEEE"]
        },
        {
            name: "Rainbow",
            colors: [
                "#FF0000",
                "#FF7F00",
                "#FFFF00",
                "#00FF00",
                "#0000FF",
                "#4B0082",
                "#8B00FF"
            ]
        }
    ];

    let currentFractal = fractalShapes[currentFractalIndex];
    let currentColorScheme = colorSchemes[currentColorSchemeIndex];
    let currentColorIndex = 0; // Index for cycling through colors in the current scheme

    // Initialize snowflakes for each layer
    function initializeSnowflakes() {
        layers.length = 0; // Clear existing layers

        for (let i = 0; i < numLayers; i++) {
            const layer = {
                snowflakes: [],
                speedFactor: (i + 1) / numLayers // Speed factor increases for each layer
            };

            for (let j = 0; j < numSnowflakesPerLayer; j++) {
                layer.snowflakes.push(createSnowflake());
            }

            layers.push(layer);
        }
    }

    function createSnowflake() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height, // Start above the canvas
            size: Math.random() * 20 + 10, // Random size
            rotation: Math.random() * 360, // Random initial rotation
            speed: Math.random() * 1.5 + 0.5, // Random fall speed
            depth: recursionDepth, // Depth set by slider
            driftSpeed: 0 // Additional drift speed due to mouse interaction
        };
    }

    // Function to draw Koch snowflake
    function drawKochSnowflake(snowflake) {
        const { x, y, size, depth } = snowflake;

        for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3;
            const xEnd = x + size * Math.cos(angle);
            const yEnd = y + size * Math.sin(angle);
            drawSnowflakeLine(x, y, xEnd, yEnd, depth);
        }
    }

    // Function to draw Sierpinski triangle
    function drawSierpinskiTriangle(snowflake) {
        const { x, y, size, depth } = snowflake;

        ctx.save();
        ctx.translate(x, y);

        function sierpinski(x, y, size, depth) {
            if (depth === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x + size / 2, y - (Math.sqrt(3) * size) / 2);
                ctx.closePath();
                ctx.strokeStyle = currentColorScheme.colors[currentColorIndex];
                ctx.stroke();
            } else {
                size /= 2;
                sierpinski(x, y, size, depth - 1);
                sierpinski(x + size, y, size, depth - 1);
                sierpinski(x + size / 2, y - (Math.sqrt(3) * size) / 2, size, depth - 1);
            }
        }

        sierpinski(0, size / 2, size, depth);

        ctx.restore();
    }

    // Function to draw fractal tree
    function drawFractalTree(snowflake) {
        const { x, y, size, depth } = snowflake;

        ctx.save();
        ctx.translate(x, y);

        function branch(len, depth) {
            if (depth === 0) return;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -len);
            ctx.strokeStyle = currentColorScheme.colors[currentColorIndex];
            ctx.stroke();

            ctx.translate(0, -len);
            ctx.save();
            ctx.rotate(fractalAngle); // Use fractal angle from slider
            branch(len * 0.7, depth - 1);
            ctx.restore();
            ctx.save();
            ctx.rotate(-fractalAngle); // Use fractal angle from slider
            branch(len * 0.7, depth - 1);
            ctx.restore();
        }

        branch(size, depth);

        ctx.restore();
    }

    // Function to draw fractal star
    function drawFractalStar(snowflake) {
        const { x, y, size, depth } = snowflake;

        ctx.save();
        ctx.translate(x, y);

        function star(x, y, size, depth) {
            if (depth === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                for (let i = 1; i < 5; i++) {
                    ctx.lineTo(
                        x + size * Math.cos((Math.PI * 2 * i) / 5 - Math.PI / 2),
                        y - size * Math.sin((Math.PI * 2 * i) / 5 - Math.PI / 2)
                    );
                }
                ctx.closePath();
                ctx.strokeStyle = currentColorScheme.colors[currentColorIndex];
                ctx.stroke();
            } else {
                size /= 2;
                for (let i = 0; i < 5; i++) {
                    const newX = x + size * Math.cos((Math.PI * 2 * i) / 5 - Math.PI / 2);
                    const newY = y - size * Math.sin((Math.PI * 2 * i) / 5 - Math.PI / 2);
                    star(newX, newY, size, depth - 1);
                }
            }
        }

        star(0, 0, size, depth);

        ctx.restore();
    }

    // Function to draw fractal shapes based on the current fractal
    function drawFractalShape(snowflake) {
        if (currentFractal === "koch") {
            drawKochSnowflake(snowflake);
        } else if (currentFractal === "sierpinski") {
            drawSierpinskiTriangle(snowflake);
        } else if (currentFractal === "fractalTree") {
            drawFractalTree(snowflake);
        } else if (currentFractal === "fractalStar") {
            drawFractalStar(snowflake);
        }
    }

    // Recursive function to draw a line segment
    function drawSnowflakeLine(x1, y1, x2, y2, depth) {
        if (depth === 0) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = currentColorScheme.colors[currentColorIndex]; // Use current color
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            const dx = x2 - x1;
            const dy = y2 - y1;

            const xA = x1 + dx / 3;
            const yA = y1 + dy / 3;

            const xB = x2 - dx / 3;
            const yB = y2 - dy / 3;

            const xC =
                xA + (dx / 3) * Math.cos(Math.PI / 3) - (dy / 3) * Math.sin(Math.PI / 3);
            const yC =
                yA + (dx / 3) * Math.sin(Math.PI / 3) + (dy / 3) * Math.cos(Math.PI / 3);

            drawSnowflakeLine(x1, y1, xA, yA, depth - 1);
            drawSnowflakeLine(xA, yA, xC, yC, depth - 1);
            drawSnowflakeLine(xC, yC, xB, yB, depth - 1);
            drawSnowflakeLine(xB, yB, x2, y2, depth - 1);
        }
    }

    // Function to animate snowflakes falling
    function animateSnowflakes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        layers.forEach((layer) => {
            layer.snowflakes.forEach((snowflake) => {
                // Update position based on speed and layer's speed factor and slider value
                snowflake.y += snowflake.speed * layer.speedFactor * speedMultiplier;
                snowflake.x += snowflake.driftSpeed * layer.speedFactor * speedMultiplier;
                snowflake.rotation += snowflake.speed * layer.speedFactor; // Update rotation for effect

                // Reset snowflake when it goes off screen
                if (snowflake.y > canvas.height) {
                    snowflake.x = Math.random() * canvas.width;
                    snowflake.y = Math.random() * -50;
                    snowflake.size = Math.random() * 20 + 10;
                    snowflake.speed = Math.random() * 1.5 + 0.5;
                    snowflake.depth = recursionDepth; // Update depth based on user input
                    snowflake.driftSpeed = 0;
                }

                drawFractalShape(snowflake);
            });
        });

        // Cycle through colors within the current scheme
        currentColorIndex =
            (currentColorIndex + 1) % currentColorScheme.colors.length;
    }

    // Event listener for layer slider change
    layerSlider.addEventListener("input", (event) => {
        numLayers = parseInt(event.target.value);
        layerCountDisplay.textContent = numLayers;
        initializeSnowflakes(); // Reinitialize snowflakes with the new number of layers
    });

    // Event listener for speed slider change
    speedSlider.addEventListener("input", (event) => {
        speedMultiplier = parseFloat(event.target.value);
        speedValueDisplay.textContent = speedMultiplier.toFixed(1);
    });

    // Event listener for depth slider change
    depthSlider.addEventListener("input", (event) => {
        recursionDepth = parseInt(event.target.value);
        depthValueDisplay.textContent = recursionDepth;
        initializeSnowflakes(); // Reinitialize snowflakes with the new recursion depth
    });

    // Event listener for angle slider change
    angleSlider.addEventListener("input", (event) => {
        fractalAngle = parseInt(event.target.value) * (Math.PI / 180); // Convert degrees to radians
        angleValueDisplay.textContent = event.target.value;
        initializeSnowflakes(); // Reinitialize snowflakes with the new angle
    });

    // Event listener for shape change button
    changeShapeButton.addEventListener("click", () => {
        // Cycle through available fractal shapes
        currentFractalIndex = (currentFractalIndex + 1) % fractalShapes.length;
        currentFractal = fractalShapes[currentFractalIndex];
        showNotification(
            `Changed to ${
                currentFractal.charAt(0).toUpperCase() + currentFractal.slice(1)
            } Fractal`
        );
        initializeSnowflakes(); // Reinitialize snowflakes with the new shape
    });

    // Event listener for color scheme change button
    changeColorButton.addEventListener("click", () => {
        // Cycle through available color schemes
        currentColorSchemeIndex = (currentColorSchemeIndex + 1) % colorSchemes.length;
        currentColorScheme = colorSchemes[currentColorSchemeIndex];
        showNotification(`Changed to ${currentColorScheme.name} Scheme`);
        currentColorIndex = 0; // Reset color index when changing schemes
    });

    // Toggle controls panel visibility
    toggleControlsButton.addEventListener("click", toggleControls);

    function toggleControls() {
        if (controlsPanel.style.display === "none") {
            controlsPanel.style.display = "block";
            toggleControlsButton.textContent = "Hide Controls";
            showNotification("Controls Shown");
        } else {
            controlsPanel.style.display = "none";
            toggleControlsButton.textContent = "Show Controls";
            showNotification("Controls Hidden");
        }
    }

    // Reset snowflakes animation
    function resetAnimation() {
        initializeSnowflakes();
        showNotification("Animation Reset");
    }

    // Keyboard shortcuts handler
    document.addEventListener("keydown", (event) => {
        if (event.key === "c" || event.key === "C") {
            toggleControls(); // Toggle control panel visibility
        } else if (event.key === "r" || event.key === "R") {
            resetAnimation(); // Reset the snowflake animation
        }
    });

    // Function to show a notification
    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = "block";
        notification.style.opacity = "1";
        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                notification.style.display = "none";
            }, 300);
        }, 1000);
    }

    // Initialize snowflakes and start animation
    initializeSnowflakes();
    gsap.ticker.add(animateSnowflakes);
};
