const backgroundDiv = document.getElementById('background') as HTMLDivElement;
const changePageButton = document.getElementById('changePageButton') as HTMLButtonElement;
const terminalContainer = document.getElementById('terminal-container') as HTMLDivElement;
const terminalOutput = document.getElementById('terminal-output') as HTMLPreElement;
const cursorElement = document.getElementById('cursor') as HTMLSpanElement;
const humSound = document.getElementById('humSound') as HTMLAudioElement;
const keySound = document.getElementById('keySound') as HTMLAudioElement;

// Screen Content Data Store
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
        "                                          ABOUT J. GRAVELLE",
        "Seasoned Full Stack Developer with nearly 30 years of I.T. experience and a strong",
        "background in AI, supply-chain logistics, and retail store management systems.",
        "",
        "Passionate about programming with proven expertise in managing full project lifecycles, from",
        "system setup and configuration to development, testing, and deployment.",
        "",
        "Recently leveraged AI to exponentially increase productivity.",
        "",
        "Recipient of the Xerox 'Excellence in Customer Service' award.",
        "",
        "Adept in a variety of programming languages, frameworks, and tools.",
        "",
        "[ ESC to return ]"
    ],
    SKILLS: [
        "[ ESC to return ]",
        "",
        "                                       J. GRAVELLE'S MAD SKILLS",
        "",
        "                                       . C#",
        "                                       . VB.NET",
        "                                       . VB (legacy)",
        "                                       . SQL",
        "                                       . HTML",
        "                                       . Javascript",
        "                                       . Python",
        "                                       . Perl/BASH",
        "                                       . Java",
        "                                       . PowerBuilder",
        "                                       . HyperTalk",
        "                                       . COBOL",
        "",
        "COMPETENCIES:",
        "Artificial Intelligence & Machine Learning: Leveraging AI to enhance productivity and",
        "efficiency in various business processes.",
        "",
        "Programming Languages: C#, VB.NET, Java, Python, Perl/Bash, SQL, HTML, JavaScript,",
        "PowerBuilder, HyperTalk, COBOL"
    ],
    HISTORY: [
        "[ ESC to return ]",
        "",
        "                                             THIS GUY'S HISTORY",
        "",
        "Senior Programmer",
        "C&S Wholesale / Piggly Wiggly Midwest, LLC 2015 - Present",
        "",
        ". Implemented AI solutions to streamline wholesale ordering, inventory management, product",
        "  management, and sales management systems, resulting in significant productivity gains.",
        ". Developed full-stack applications for Android, Windows, and iOS clients, with IIS/WebAPI",
        "  middle-tier and MS-SQL data layer.",
        ". Automated daily Cobol-to-SQL data migration with *.CSV report generation.",
        ". Consolidated thousands of Crystal Reports programs into a single, generic, parameter-",
        "  driven solution, saving hundreds of man-hours annually.",
        ". Created a web-based bulk ordering system that flawlessly handled over $6 million in sales",
        "  on its first day of use.",
        "",
        "Senior Programmer/Analyst"
    ],
    CONTACT: [
        "[ ESC to return ]",
        "",
        "",
        "",
        "                                          J. Gravelle",
        "                                          j@gravelle.us",
        "                                          414.379.0623",
        "",
        "",
        "",
        "",
        "                                                          [ ESC to return ]"
    ]
};

let isScreenOn = false; // Tracks the computer screen state (bg_on.png + terminal vs bg_off.png)
let currentScreenKey: keyof typeof screenContents | null = null;
let isTyping = false;
// removed unused userInput

let acceptingDirInput = false; // Controls when 1-4 keys are processed for DIR menu

// Utility to introduce a delay
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Modified - Make typing even faster
async function typeLine(line: string, element: HTMLElement, isPromptInput = false) {
    if (!isPromptInput) {
        element.innerHTML += '\n'; // Start on a new line unless it's input to a prompt
    }
    for (const char of line) {
        element.innerHTML += char;
        if (keySound) {
            keySound.currentTime = 0;
            keySound.play().catch(() => {});
        }
        await sleep((Math.random() * 10 + 3) * 1.3); // 30% slower typing
    }
}

// Main function to display screen content with typing animation
async function displayScreenContent(screenKey: keyof typeof screenContents) {
    if (isTyping) return;
    isTyping = true;
    acceptingDirInput = false; // Disable DIR input by default
    currentScreenKey = screenKey;
    terminalOutput.innerHTML = ''; // Clear screen
    if (cursorElement) cursorElement.classList.add('hidden');

    const linesToDisplay = screenContents[screenKey];

    if (screenKey === 'DIR') {
        // Special handling for DIR screen sequence
        // 1. "Starting MS-DOS..."
        await typeLine(linesToDisplay[0], terminalOutput); // "Starting MS-DOS..."
        await sleep(150); // Shorter pause

        // 2. "C:\>DIR"
        terminalOutput.innerHTML += '\nC:\\>'; // Display prompt part
        await typeLine(linesToDisplay[2].substring(3), terminalOutput, true); // Type "DIR" part
        await sleep(100); // Shorter pause

        // 3. Rest of DIR output (Volume info, files, etc.)
        for (let i = 3; i < linesToDisplay.length; i++) {
            if (linesToDisplay[i] === "SELECT ONE") {
                 await typeLine(linesToDisplay[i], terminalOutput); // Type "SELECT ONE"
                 terminalOutput.innerHTML += ' '; // Add space for user input
                 acceptingDirInput = true; // Enable 1-4 input after "SELECT ONE"
                 if (cursorElement) cursorElement.classList.remove('hidden'); // Show cursor for input
            } else {
                await typeLine(linesToDisplay[i], terminalOutput);
            }
        }
    } else {
        // For other screens (ABOUT, SKILLS, etc.)
        for (const line of linesToDisplay) {
            await typeLine(line, terminalOutput);
        }
        if (cursorElement) cursorElement.classList.add('hidden'); // Usually no cursor on content screens
    }

    isTyping = false;
    if (screenKey !== 'DIR' || !acceptingDirInput) { // If not DIR or DIR not awaiting input
       if (cursorElement) cursorElement.classList.add('hidden');
    }
}

if (backgroundDiv && changePageButton && terminalContainer && terminalOutput && cursorElement) {
    changePageButton.addEventListener('click', async () => {
        if (isTyping || isScreenOn) return; // Ignore if typing or already on

        isScreenOn = true; // Turn on once
        if (humSound) humSound.play().catch(() => {});
        terminalContainer.classList.remove('hidden');
        changePageButton.style.display = 'none'; // Hide power button once activated
        await displayScreenContent('DIR'); // Start with DIR screen
    });

    // Keyboard Event Listener
    document.addEventListener('keydown', async (event) => {
        if (!isScreenOn || isTyping) return; // Only process keys if screen is on and not typing

        const key = event.key;

        if (currentScreenKey === 'DIR' && acceptingDirInput) {
            if (['1', '2', '3', '4'].includes(key)) {
                terminalOutput.innerHTML += key; // Echo the key
                acceptingDirInput = false; // Stop accepting more DIR input for now
                if (cursorElement) cursorElement.classList.add('hidden');
                await sleep(250); // Shorter pause before switching screen

                let nextScreen: keyof typeof screenContents | null = null;
                if (key === '1') nextScreen = 'ABOUT';
                else if (key === '2') nextScreen = 'SKILLS';
                else if (key === '3') nextScreen = 'HISTORY';
                else if (key === '4') nextScreen = 'CONTACT';

                if (nextScreen) {
                    await displayScreenContent(nextScreen);
                }
            } else if (key === '5') {
                // Handle '5' as invalid option
                terminalOutput.innerHTML += key;
                acceptingDirInput = false;
                if (cursorElement) cursorElement.classList.add('hidden');
                await typeLine("Invalid option", terminalOutput, true);
                await sleep(500); // Shorter pause for "Invalid option" message
                // Remove the "Invalid option" and the '5'
                const currentText = terminalOutput.innerHTML;
                terminalOutput.innerHTML = currentText.substring(0, currentText.lastIndexOf('\n') + 1); // Go to start of 'SELECT ONE ...'
                terminalOutput.innerHTML = terminalOutput.innerHTML.substring(0, terminalOutput.innerHTML.lastIndexOf(' ') +1 ); // Remove the '5'
                acceptingDirInput = true; // Re-enable input
                if (cursorElement) cursorElement.classList.remove('hidden');

            } // Escape does nothing on DIR screen
        } else if (currentScreenKey !== 'DIR' && currentScreenKey !== null) {
            // If on a sub-screen (ABOUT, SKILLS, etc.)
            if (key === 'Escape') {
                await displayScreenContent('DIR'); // Go back to DIR screen
            }
        }
    });

} else {
    console.error('Required DOM elements not found. Check IDs.');
}
