# SilkRoad Project Context

## Project Overview

SilkRoad is a full-stack e-commerce platform implemented as a monorepo. It features a Python Flask backend serving a REST API and a React (TypeScript) frontend for the user interface.

- **Backend:** Flask (Python 3.13+) with SQLAlchemy ORM and MySQL.
- **Frontend:** React 19, TypeScript, Vite, TanStack Query, and React Router v7.
- **Shared:** Node.js utilities for asset processing.

## Architecture

### Directory Structure

```text
/
├── silkroad-backend/          # Flask API Server
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # SQLAlchemy ORM models (Polymorphic User)
│   │   ├── routes/            # Blueprint definitions
│   │   ├── utils/             # Helpers (Auth, Login Verify)
│   │   └── app.py             # Application factory & entry point
│   ├── tests/                 # Pytest suite
│   ├── sql/                   # SQL schemas and scripts
│   └── pyproject.toml         # Python dependencies
│
├── silkroad-frontend-react/   # React SPA
│   ├── src/
│   │   ├── api/               # Axios instance configuration
│   │   ├── components/        # Atomic design components (atoms, molecules, organisms)
│   │   ├── hooks/             # Custom hooks (TanStack Query integration)
│   │   ├── pages/             # Route components
│   │   ├── router/            # React Router v7 definitions
│   │   └── types/             # TypeScript definitions
│   ├── vite.config.ts         # Vite config (Proxy, Aliases)
│   └── package.json           # Frontend dependencies
│
└── silkroad-shared/           # Shared Utilities
    └── src/utils/compress.js  # Image compression script
```

## Building and Running

### Backend (`silkroad-backend`)

The backend uses `uv` for dependency management, but standard `pip` works if dependencies are installed from `pyproject.toml`.

**Setup & Run:**
```bash
cd silkroad-backend
# Install dependencies
uv sync  # or pip install -r requirements.txt (if available) or from pyproject.toml

# Run Development Server
# Ensure .env is configured with DATABASE_URL and SESSION_KEY
uv run src/app.py
# OR
python3 src/app.py
```

**Testing:**
```bash
pytest
pytest tests/api/test_user_api.py
```

### Frontend (`silkroad-frontend-react`)

**Setup & Run:**
```bash
cd silkroad-frontend-react
npm install
npm run dev
```
The frontend runs at `http://localhost:5173` and proxies `/api` requests to `http://127.0.0.1:5000`.

**Build:**
```bash
npm run build
```

## Development Conventions

### Backend
*   **MVC Pattern:** Logic is separated into Routes (endpoints), Controllers (business logic), and Models (data).
*   **Blueprints:** Routes are organized by domain (e.g., `user_routes`, `cart_routes`) in `src/routes/` and registered in `src/app.py` with `/api/<domain>` prefixes.
*   **Authentication:** Session-based using Flask sessions. Decorator `@require_login` in `src/utils/login_verify.py` handles role-based access.
*   **Response Format:** Standard JSON envelope: `{"success": bool, "message": str, "data": dict}`.

### Frontend
*   **Path Alias:** Use `@/` to import from `src/`.
*   **State Management:** TanStack Query (`useQuery`, `useMutation`) for server state; Context/Props for local state.
*   **Component Structure:** Follows Atomic Design principles (`atoms`, `molecules`, `organisms`).
*   **API Client:** Use the configured Axios instance in `src/api/instance.ts` which handles credentials and base URLs.

## Key Files

*   **Backend Entry:** `silkroad-backend/src/app.py`
*   **Database Config:** `silkroad-backend/src/config/database.py`
*   **Frontend Entry:** `silkroad-frontend-react/src/main.tsx`
*   **Frontend Routing:** `silkroad-frontend-react/src/router/index.tsx`
*   **Frontend API Config:** `silkroad-frontend-react/src/api/instance.ts`
