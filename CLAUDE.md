# Pre-Legal Project
## Overview
This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory. The user enquires an AI chat in order to establish what document they want and how to fill in the fields. The available documents are covered in catalog.json file in the project root, included here:

@catalog.json

The current implementation has the V1 foundation in place (see Implementation Status below) but only supports the Mutual NDA document with no AI chat yet.

## Development processs

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. do not skip any step from the feature-dev 7 step process
3. Thouroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

    When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

    There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design 

The entire project is packaged into a Docker container.
The database uses SQLite and is created from scratch each time the Docker container is brought up, with a users table for sign up and sign in.
The backend is in backend/ and is a uv project, using FastAPI.
The frontend is in frontend/ and is statically built and served by FastAPI.
Scripts in scripts/ start and stop the container:
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend (and frontend) available at http://localhost:8000

## Color Scheme
- Accent Yellow: #ecad0a
- Blue Primary: #209dd7
- Purple Secondary: #753991 (submit buttons)
- Dark Navy: #032147 (headings)
- Gray Text: #888888

## Implementation Status

### Completed

**PL-3 – Mutual NDA prototype**
- Next.js frontend with live form + document preview for the Mutual NDA
- Client-side PDF generation via jsPDF
- FastAPI backend serving template JSON from `data/templates/`

**PL-4 – V1 foundation**
- Multi-stage Dockerfile + docker-compose.yml; single container on port 8000
- Backend migrated to uv project (`pyproject.toml`); SQLite DB with `users` table (recreated fresh on each container start)
- JWT auth: `POST /auth/signup` and `POST /auth/signin` (bcrypt + python-jose)
- Next.js static export served by FastAPI; `/signup` and `/signin` pages added
- Backend test suite: 16 tests covering auth and templates

### Not yet implemented
- AI chat for document field population
- Auth enforcement (routes are currently unprotected)
- Support for documents beyond Mutual NDA