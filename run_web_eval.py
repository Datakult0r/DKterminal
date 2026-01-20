import os
import subprocess
import sys
import json
from pathlib import Path

def setup_environment():
    # Set the API key
    os.environ['OPERATIVE_API_KEY'] = 'vop-OCB8DTe3SUPaJUB9rLTH1yhiSG0Ng76jtFBJGUPXiYA'
    
    # Ensure the .cursor directory exists
    cursor_dir = Path.home() / '.cursor'
    cursor_dir.mkdir(exist_ok=True)
    
    # Create or update mcp.json
    mcp_config = {
        "mcpServers": {
            "web-eval-agent": {
                "command": "uvx",
                "args": [
                    "--from",
                    "git+https://github.com/Operative-Sh/web-eval-agent.git",
                    "webEvalAgent"
                ],
                "env": {
                    "OPERATIVE_API_KEY": os.environ['OPERATIVE_API_KEY']
                }
            }
        }
    }
    
    mcp_file = cursor_dir / 'mcp.json'
    with open(mcp_file, 'w') as f:
        json.dump(mcp_config, f, indent=2)

def run_web_eval():
    try:
        # Run the web-eval-agent with the configured command
        result = subprocess.run([
            'uvx',
            '--from',
            'git+https://github.com/Operative-Sh/web-eval-agent.git',
            'webEvalAgent',
            'http://localhost:5174',
            'Test the MS-DOS terminal interface'
        ], capture_output=True, text=True)
        
        print("Output:", result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
            
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print("Output:", e.output.decode() if e.output else "No output")
        print("Error:", e.stderr.decode() if e.stderr else "No error output")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == '__main__':
    setup_environment()
    run_web_eval() 