import os
import subprocess

# Set the API key
os.environ['OPERATIVE_API_KEY'] = 'vop-OCB8DTe3SUPaJUB9rLTH1yhiSG0Ng76jtFBJGUPXiYA'

# Run the web-eval-agent
cmd = [
    'uvx',
    'webEvalAgent',
    '--url', 'http://localhost:5174',
    '--task', 'Test the MS-DOS terminal interface: 1) Click the power button to start, 2) Verify the terminal appears with typing animation, 3) Test navigation between different sections (ABOUT, SKILLS, HISTORY, CONTACT), 4) Check if the ESC button works to return to main menu'
]

subprocess.run(cmd) 