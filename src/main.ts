// DOM Elements
const monitorBezel = document.getElementById('monitor-bezel') as HTMLDivElement;
const changePageButton = document.getElementById('changePageButton') as HTMLButtonElement;
const terminalContainer = document.getElementById('terminal-container') as HTMLDivElement;
const terminalOutput = document.getElementById('terminal-output') as HTMLPreElement;
const cursorElement = document.getElementById('cursor') as HTMLSpanElement;
const escapeButton = document.getElementById('escapeButton') as HTMLButtonElement;
const humSound = document.getElementById('humSound') as HTMLAudioElement;

// Web Audio API Context
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
const audioCtx = new AudioContextClass();

// Synthesize a mechanical key click sound
function playKeyClick(): void {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const t = audioCtx.currentTime;
    
    // 1. Noise Burst (Key impact)
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800; // Muffled impact

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(t);

    // 2. High frequency click (Switch mechanism - Blue switch style)
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.02);
    
    const clickGain = audioCtx.createGain();
    clickGain.gain.setValueAtTime(0.1, t);
    clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
    
    osc.connect(clickGain);
    clickGain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.03);

    // 3. Low Thud (Bottoming out)
    const thud = audioCtx.createOscillator();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(200, t);
    thud.frequency.exponentialRampToValueAtTime(50, t + 0.1);

    const thudGain = audioCtx.createGain();
    thudGain.gain.setValueAtTime(0.3, t);
    thudGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    thud.connect(thudGain);
    thudGain.connect(audioCtx.destination);
    thud.start(t);
    thud.stop(t + 0.1);
}

// Screen Content Data Store - Philippe Kung's Portfolio
const screenContents = {
    DIR: [
        "Starting MS-DOS...",
        "",
        "C:\\>DIR",
        "Volume in drive C is MS-DOS ver 1.0",
        "Volume Serial Number is 0867-5309",
        "Directory of C:\\",
        "",
        "1. ABOUT       <DIR>      02.21.63   9:09",
        "2. SKILLS      <DIR>      03.01.91   7:30",
        "3. HISTORY     <DIR>      25.06.24   8:90",
        "4. CONTACT     <DIR>      01.23.45   6:66",
        "",
        "SELECT ONE"
    ],
    ABOUT: [
        "[ ESC to return ]",
        "",
        "ABOUT PHILIPPE KUNG",
        "",
        "AI & Data Expert with a passion for building",
        "intelligent systems and data-driven solutions.",
        "",
        "Specializing in machine learning, data engineering,",
        "and full-stack development.",
        "",
        "Transforming complex data challenges into",
        "actionable insights and elegant solutions.",
        "",
        "[ Press ESC or any key to return ]"
    ],
    SKILLS: [
        "[ ESC to return ]",
        "",
        "PHILIPPE KUNG'S SKILLS",
        "",
        ". Python / Machine Learning",
        ". Data Engineering & Analytics",
        ". TypeScript / JavaScript",
        ". SQL & Database Design",
        ". Cloud Platforms (AWS/GCP)",
        ". API Development",
        ". Data Visualization",
        ". AI/ML Deployment",
        "",
        "[ Press ESC or any key to return ]"
    ],
    HISTORY: [
        "[ ESC to return ]",
        "",
        "WORK HISTORY",
        "",
        "AI & Data Professional",
        "Building data pipelines and ML systems",
        "",
        ". Developed AI solutions for business automation",
        ". Built scalable data processing pipelines",
        ". Created predictive models and analytics",
        ". Deployed ML models to production",
        "",
        "[ Press ESC or any key to return ]"
    ],
    CONTACT: [
        "[ ESC to return ]",
        "",
        "",
        "CONTACT",
        "",
        "Philippe Kung",
        "philippe@example.com",
        "",
        "LinkedIn: /in/philippekung",
        "GitHub: /philippekung",
        "",
        "",
        "[ Press ESC or any key to return ]"
    ]
};

// State variables
let isScreenOn = false;
let currentScreenKey: keyof typeof screenContents | null = null;
let isTyping = false;
let acceptingDirInput = false;

// Utility to introduce a delay
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Typing animation - deliberate, readable speed
async function typeLine(line: string, element: HTMLElement, isPromptInput = false, makeClickable = false): Promise<void> {
    if (!isPromptInput) {
        element.innerHTML += '\n';
    }

    // Type characters at readable speed
    for (let i = 0; i < line.length; i++) {
        element.innerHTML += line[i];

        // Play mechanical keyboard sound for each character (skip spaces sometimes)
        if (line[i] !== ' ' || Math.random() > 0.5) {
            playKeyClick();
        }

        // Typing speed: 20-40ms per char
        await sleep(Math.random() * 20 + 20);
    }

    // Make menu items clickable after typing completes
    if (makeClickable) {
        const lines = element.innerHTML.split('\n');
        const lastLine = lines[lines.length - 1];
        lines[lines.length - 1] = makeMenuItemClickable(lastLine);
        element.innerHTML = lines.join('\n');
    }

    // Auto-scroll to bottom
    element.scrollTop = element.scrollHeight;
}

// Main function to display screen content with typing animation
async function displayScreenContent(screenKey: keyof typeof screenContents): Promise<void> {
    if (isTyping) return;
    isTyping = true;
    acceptingDirInput = false;
    currentScreenKey = screenKey;
    terminalOutput.innerHTML = '';
    if (cursorElement) cursorElement.classList.add('hidden');

    const linesToDisplay = screenContents[screenKey];

    if (screenKey === 'DIR') {
        // Special handling for DIR screen sequence
        // 1. "Starting MS-DOS..."
        await typeLine(linesToDisplay[0], terminalOutput);
        await sleep(100);

        // 2. "C:\>DIR"
        terminalOutput.innerHTML += '\nC:\\>';
        await typeLine(linesToDisplay[2].substring(4), terminalOutput, true); // Type "DIR"
        await sleep(80);

        // 3. Rest of DIR output
        for (let i = 3; i < linesToDisplay.length; i++) {
            if (linesToDisplay[i] === "SELECT ONE") {
                await typeLine(linesToDisplay[i], terminalOutput);
                terminalOutput.innerHTML += '\nC:\\>';
                acceptingDirInput = true;
                if (cursorElement) cursorElement.classList.remove('hidden');
            } else {
                // Make menu items (1-4) clickable
                const isMenuItem = /^[1-4]\. (ABOUT|SKILLS|HISTORY|CONTACT)/.test(linesToDisplay[i]);
                await typeLine(linesToDisplay[i], terminalOutput, false, isMenuItem);
            }
        }
    } else {
        // For content screens (ABOUT, SKILLS, etc.)
        for (const line of linesToDisplay) {
            await typeLine(line, terminalOutput);
        }
        // Enable return on any key
        acceptingDirInput = true;
    }

    isTyping = false;
}

// Handle ESC / return to main menu
function handleEscape(): void {
    if (currentScreenKey !== 'DIR' && !isTyping) {
        displayScreenContent('DIR');
    }
}

// Power button click handler
async function handlePowerButtonClick(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (isTyping || isScreenOn) {
        // Toggle off if already on
        isTyping = false;
        isScreenOn = false;
        document.body.classList.remove('crt-active');
        if (terminalContainer) terminalContainer.classList.add('hidden');
        if (humSound) humSound.pause();
        return;
    }

    isScreenOn = true;

    // Start ambient sound
    if (humSound) {
        humSound.volume = 0.15;
        humSound.play().catch(() => {});
    }

    // Activate CRT effects
    document.body.classList.add('crt-active');

    // Show terminal
    if (terminalContainer) {
        terminalContainer.classList.remove('hidden');
    }

    // Start with DIR screen
    await displayScreenContent('DIR');
}

// Keyboard event listener
document.addEventListener('keydown', async (event: KeyboardEvent) => {
    if (!isScreenOn || isTyping) return;

    const key = event.key;

    // ESC key always returns to DIR from content screens
    if (key === 'Escape') {
        handleEscape();
        return;
    }

    // Navigation in DIR screen
    if (currentScreenKey === 'DIR' && acceptingDirInput) {
        if (['1', '2', '3', '4'].includes(key)) {
            terminalOutput.innerHTML += key;
            acceptingDirInput = false;
            if (cursorElement) cursorElement.classList.add('hidden');
            await sleep(150);

            const nextScreenMap: Record<string, keyof typeof screenContents> = {
                '1': 'ABOUT',
                '2': 'SKILLS',
                '3': 'HISTORY',
                '4': 'CONTACT'
            };

            await displayScreenContent(nextScreenMap[key]);
        } else if (key.length === 1 && !['1', '2', '3', '4'].includes(key)) {
            // Invalid key - show DOS-style error
            terminalOutput.innerHTML += key;
            acceptingDirInput = false;
            if (cursorElement) cursorElement.classList.add('hidden');
            await sleep(100);
            terminalOutput.innerHTML += '\nBad command or file name';
            await sleep(800);
            // Clear error and restore prompt
            const lines = terminalOutput.innerHTML.split('\n');
            lines.pop(); // Remove error line
            lines[lines.length - 1] = 'C:\\>'; // Reset prompt
            terminalOutput.innerHTML = lines.join('\n');
            acceptingDirInput = true;
            if (cursorElement) cursorElement.classList.remove('hidden');
        }
    }
    // In content screens, any key returns to DIR
    else if (currentScreenKey !== 'DIR' && currentScreenKey !== null && acceptingDirInput) {
        acceptingDirInput = false;
        if (cursorElement) cursorElement.classList.add('hidden');
        await sleep(100);
        await displayScreenContent('DIR');
    }
});

// Click handler for menu items - delegated event handling
terminalOutput?.addEventListener('click', async (event: MouseEvent) => {
    if (!isScreenOn || isTyping) return;

    const target = event.target as HTMLElement;

    // Check if clicked on a menu-item span
    if (target.classList.contains('menu-item') && currentScreenKey === 'DIR' && acceptingDirInput) {
        const screenKey = target.dataset.screen as keyof typeof screenContents;
        const key = target.dataset.key;
        if (screenKey && key) {
            terminalOutput.innerHTML = terminalOutput.innerHTML.replace(/<span class="menu-item[^"]*"[^>]*>([^<]+)<\/span>/g, '$1');
            terminalOutput.innerHTML += key;
            acceptingDirInput = false;
            if (cursorElement) cursorElement.classList.add('hidden');
            await sleep(150);
            await displayScreenContent(screenKey);
        }
    }
});

// Helper to make menu items clickable
function makeMenuItemClickable(line: string): string {
    const menuPatterns: Array<{pattern: RegExp, screen: string, key: string}> = [
        { pattern: /(1\. ABOUT)/, screen: 'ABOUT', key: '1' },
        { pattern: /(2\. SKILLS)/, screen: 'SKILLS', key: '2' },
        { pattern: /(3\. HISTORY)/, screen: 'HISTORY', key: '3' },
        { pattern: /(4\. CONTACT)/, screen: 'CONTACT', key: '4' }
    ];

    for (const {pattern, screen, key} of menuPatterns) {
        if (pattern.test(line)) {
            return line.replace(pattern, `<span class="menu-item" data-screen="${screen}" data-key="${key}">$1</span>`);
        }
    }
    return line;
}

// Initialize event listeners
if (changePageButton) {
    changePageButton.addEventListener('click', handlePowerButtonClick);
}

if (escapeButton) {
    escapeButton.addEventListener('click', () => {
        handleEscape();
    });
}

// Optional: Click anywhere on screen to activate (better UX)
if (monitorBezel) {
    monitorBezel.addEventListener('click', (event) => {
        // Only trigger if clicking on the bezel area (not controls)
        if (!isScreenOn && event.target === monitorBezel) {
            handlePowerButtonClick(event);
        }
    });
}
