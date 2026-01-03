# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SilkRoad is a full-stack e-commerce platform with a Flask backend and React frontend, deployed at https://sajuna94.github.io/SilkRoad/.

**Monorepo Structure:**
- `silkroad-backend/`: Flask REST API with SQLAlchemy ORM
- `silkroad-frontend-react/`: React + TypeScript + Vite SPA
- `silkroad-shared/`: Shared utilities (currently image compression)

## Development Commands

### Backend (Flask)

Navigate to `silkroad-backend/` first:

```bash
# Install dependencies (with uv recommended)
uv sync

# Run development server
uv run src/app.py
# OR
python3 src/app.py

# Run all tests
pytest

# Run specific test file
pytest tests/api/test_user_api.py

# Run with coverage
pytest --cov=src --cov-report=html
```

See `silkroad-backend/CLAUDE.md` for detailed backend development guide.

### Frontend (React + Vite)

Navigate to `silkroad-frontend-react/` first:

```bash
# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Shared Utilities

Navigate to `silkroad-shared/` first:

```bash
# Install dependencies
npm install

# Run image compression (outputs to silkroad-frontend-react/public/images/compressed/)
node src/utils/compress.js
```

## Architecture Overview

### Monorepo Coordination

**Frontend-Backend Communication:**
- Development: Frontend proxy to `http://127.0.0.1:5000` (enabled in `vite.config.ts`)
- Production: Frontend calls `https://silkroad-lhyz.onrender.com`
- API client: `silkroad-frontend-react/src/api/instance.ts` (axios with credentials, 10s timeout)

**Deployment:**
- Backend: Render (https://silkroad-lhyz.onrender.com)
- Frontend: GitHub Pages (https://sajuna94.github.io/SilkRoad/)
- Base path: `/SilkRoad` (configured in `vite.config.ts` and `App.tsx`)

### Backend Architecture (Flask + SQLAlchemy)

**Three-Layer MVC:**
- Routes (`src/routes/`): Blueprint endpoints with docstrings
- Controllers (`src/controllers/`): Business logic
- Models (`src/models/`): SQLAlchemy ORM with polymorphic User hierarchy

**Blueprint Structure:**
- `/api/user`: User authentication and profile (user_routes)
- `/api/cart`: Shopping cart operations (cart_routes)
- `/api/order`: Order management (order_routes)
- `/api/admin`: Admin operations (admin_routes)
- `/api/vendor`: Vendor operations (vendor_routes)
- `/api/customer`: Customer operations (customer_routes)
- `/api/test`: Testing utilities (test_routes)

**Authentication:**
- Session-based (Flask sessions with `withCredentials: true`)
- `@require_login(role)` decorator in `src/utils/login_verify.py`
- Session keys: `user_id`, `role`
- Session lifetime: 24 hours (configurable in `app.py`)
- Session cookie: `flask_session` (HttpOnly, SameSite=Lax for dev)

**API Response Format:**
```python
{
    "message": str,
    "success": bool,
    "data": dict  # optional
}
```

**Database:**
- MySQL with PyMySQL adapter
- Polymorphic User model (Admin, Customer, Vendor)
- Models use `register()` classmethod pattern
- Reference schema: `silkroad-backend/sql/main.sql`

**File Uploads:**
- Upload endpoint: `/uploads/<filename>` serves files from `silkroad-backend/uploads/`
- Static file serving configured in `app.py`

### Frontend Architecture (React + TypeScript)

**State Management:**
- TanStack Query (React Query) for server state
- Custom hooks in `src/hooks/` organized by domain:
  - `hooks/auth/`: Authentication (login, register, logout, current user)
  - `hooks/order/`: Cart and order operations
  - `hooks/utils/`: Cloudinary integration
  - `hooks/test/`: Development utilities

**Component Structure (Atomic Design):**
- `components/atoms/`: Smallest UI units (buttons, inputs)
- `components/molecules/`: Composed components (ProductCard, VendorCard, LabeledInput)
- `components/organisms/`: Complex components (ProductGallery)
- `components/ui/`: Shared UI components (Dialog)

**Routing (React Router v7):**
- Routes defined in `src/router/index.tsx`
- Main routes: `/`, `/about`, `/login`, `/register`, `/cart`, `/home`
- User routes: `/user/profile`, `/user/orders`
- Vendor routes: `/vendor`, `/vendor/dashboard`, `/vendor/reviews`
- Admin routes: `/admin`
- Base path: `/SilkRoad` (GitHub Pages deployment)

**TypeScript Types:**
- Organized in `src/types/`:
  - `user.ts`: User, Admin, Customer, Vendor types
  - `order.ts`: Cart, Order, CartItem types
  - `store.ts`: Product, Review types
  - `data/`: Additional data types

**Styling:**
- SCSS modules (e.g., `ReviewPage.module.scss`)
- Global styles in `index.css`
- Component-scoped styles

**Build Configuration:**
- React Compiler enabled via `babel-plugin-react-compiler` for performance optimization
- Path alias `@/` maps to `src/` directory
- Production base path: `/SilkRoad` for GitHub Pages deployment

### Shared Utilities

**Image Compression (`silkroad-shared/src/utils/compress.js`):**
- Uses Sharp library to compress images
- Converts JPG/PNG to WebP format
- Generates responsive images (250px, quality 60)
- Outputs `srcset.json` mapping for frontend use
- Input: `silkroad-frontend-react/public/images/`
- Output: `silkroad-frontend-react/public/images/compressed/`

## Key Patterns

### Backend Patterns

**User Registration:**
```python
user = User.register(email, phone, password, role, **kwargs)
db.session.add(user)
db.session.commit()
```

**Authentication Decorator:**
```python
@user_routes.route('/profile')
@require_login(role='customer')  # or 'admin', 'vendor'
def get_profile():
    user_id = session['user_id']
    # ...
```

**API Response:**
```python
return jsonify({
    "success": True,
    "message": "Operation successful",
    "data": {"key": "value"}
}), 200
```

### Frontend Patterns

**API Calls with React Query:**
```typescript
// In hooks/auth/user.ts
export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation<User, ApiErrorBody, LoginReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/user/login", payload);
      return res.data.data[0];
    },
    onSuccess: (res) => {
      qc.setQueryData(["user"], res);
    },
  });
};

// In components
const login = useLogin();
login.mutate({ email, password });
```

**Current User Check:**
```typescript
const currentUser = useCurrentUser();
if (currentUser.isSuccess) {
  const user = currentUser.data;
  console.log(`[${user.role}] Current user loaded:`, user);
}
```

**Environment-Aware API Base URL:**
```typescript
const apiBaseURL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://silkroad-lhyz.onrender.com";
```

**Error Handling with Axios Interceptor:**
```typescript
// Interceptor automatically logs errors by status code
// 400: Bad Request, 401: Unauthorized, 403: Forbidden
// 404: Not Found, 500: Server Error, 501: Not Implemented
// Errors are re-thrown for React Query to handle
```

## Testing

### Backend Tests

Located in `silkroad-backend/tests/`:
- `tests/unit/`: Database schema validation
- `tests/api/`: API integration tests
- Fixtures in `conftest.py` (test users, products, authenticated clients)

Run from `silkroad-backend/`:
```bash
pytest -v                                          # All tests
pytest tests/api/test_user_api.py                  # Specific file
pytest -k "test_login"                             # Pattern matching
pytest --cov=src --cov-report=html                 # With coverage
```

### Frontend Testing

Currently no automated tests configured. Manual testing via:
- Development server (`npm run dev`)
- Backend test endpoints (`/api/test/*`)

## Important Files

**Root:**
- `package.json`: Root-level shared dependencies (axios, react-router-dom)

**Backend (`silkroad-backend/`):**
- `src/app.py`: Flask app initialization, CORS, route registration
- `src/config/database.py`: Database connection
- `src/utils/login_verify.py`: Session authentication
- `src/models/auth/user.py`: Polymorphic User model
- `CLAUDE.md`: Detailed backend development guide

**Frontend (`silkroad-frontend-react/`):**
- `src/App.tsx`: Root component with BrowserRouter
- `src/router/index.tsx`: Route definitions
- `src/api/instance.ts`: Axios instance with interceptors
- `src/hooks/auth/user.ts`: Authentication hooks
- `vite.config.ts`: Vite configuration (base path, aliases)

**Shared (`silkroad-shared/`):**
- `src/utils/compress.js`: Image compression utility

## Development Workflow

### Starting Development

1. **Backend setup:**
   ```bash
   cd silkroad-backend
   uv sync

   # Create .env file with required variables:
   # DATABASE_URL=mysql://<username>:<password>@<host>:<port>/<db_name>
   # SESSION_KEY=<random-secret-key>

   uv run src/app.py
   ```

2. **Frontend setup:**
   ```bash
   cd silkroad-frontend-react
   npm install
   npm run dev
   ```

3. **Development proxy:** Vite proxy is already enabled in `vite.config.ts`, routing `/api` requests to `http://127.0.0.1:5000`.

### Making Changes

**Adding a new API endpoint:**
1. Define route in `silkroad-backend/src/routes/`
2. Implement controller in `silkroad-backend/src/controllers/`
3. Add model if needed in `silkroad-backend/src/models/`
4. Write tests in `silkroad-backend/tests/api/`
5. Create frontend hook in `silkroad-frontend-react/src/hooks/`
6. Use hook in component

**Adding a new page:**
1. Create page component in `silkroad-frontend-react/src/pages/`
2. Add route in `silkroad-frontend-react/src/router/index.tsx`
3. Create necessary hooks/API calls
4. Build UI with atomic components

### Database Changes

Backend database is auto-initialized via `db.create_all()` in `src/app.py`. When adding models:
1. Create model in `silkroad-backend/src/models/`
2. Import in `silkroad-backend/src/models/__init__.py`
3. Restart backend to create tables
4. Update `silkroad-backend/sql/main.sql` reference schema
5. Add unit tests in `tests/unit/test_models.py`

## Environment Configuration

### Backend Environment Variables (`.env`)

Required variables in `silkroad-backend/.env`:
```bash
DATABASE_URL=mysql://<username>:<password>@<host>:<port>/<db_name>
SESSION_KEY=<random-secret-key>  # Use a long random string
```

### CORS Configuration

Backend CORS enabled for:
- `https://sajuna94.github.io` (production frontend)
- `http://localhost:5173` (development frontend)

Configured in `silkroad-backend/src/app.py` with:
- `supports_credentials=True` for session cookies
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Allowed headers: Content-Type, Authorization

### Deployment

**Frontend (GitHub Pages):**
- Built files deployed to `gh-pages` branch
- Accessible at https://sajuna94.github.io/SilkRoad/
- Base path `/SilkRoad` configured in `vite.config.ts`

**Backend (Render):**
- Deployed at https://silkroad-lhyz.onrender.com
- Environment variables set in Render dashboard
- Session cookie configured for production (Secure=True for HTTPS)

## TypeScript Path Aliases

Frontend uses `@/` alias for `src/`:
```typescript
import { api } from "@/api/instance";
import { useLogin } from "@/hooks/auth/user";
import Header from "@/layout/Header";
```

Configured in `vite.config.ts` and `tsconfig.app.json`.

## Common Issues

**CORS errors during development:**
- Ensure backend is running on `http://localhost:5000` or `http://127.0.0.1:5000`
- Check CORS config in `silkroad-backend/src/app.py`
- Vite proxy should route `/api` requests automatically

**Session authentication not working:**
- Verify `withCredentials: true` in API client (`src/api/instance.ts`)
- Check `SESSION_KEY` is set in backend `.env`
- Ensure cookies are not blocked (same-site, secure settings)

**Database connection errors:**
- Verify `DATABASE_URL` in `silkroad-backend/.env`
- Check MySQL server is running
- Confirm database exists

**Build errors (frontend):**
- Run `npm install` to ensure dependencies are updated
- Check TypeScript errors with `npm run build`
- Verify all imports use correct paths with `@/` alias
