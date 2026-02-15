## AI Copilot Instructions — Efficience Analytics

Dental practice management platform: Next.js 14 (App Router) + Flask backend + MongoDB + OpenAI.

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js (port 3000)              │  Flask (port 5001)         │
│  ├── app/api/* (REST endpoints)   │  ├── Chat/Ollama features  │
│  ├── app/* pages (React)          │  └── PDF export            │
│  └── middleware.ts (auth guard)   │                            │
└────────────────┬──────────────────┴────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  MongoDB Atlas  │  Collections: patients, cabinets, admins
        └─────────────────┘
```

### Dev Workflow
```bash
npm run dev                      # Next.js on :3000
python app.py                    # Flask on :5001 (for chat/PDF)
npm run init:admin:powershell    # Bootstrap admin user (Windows)
npm run test:admin               # Verify auth
```

### Critical Patterns

**Database (every API route):**
```typescript
import { initializeApp } from '@/lib/db';
import Patient from '@/models/Patient';

export async function GET() {
  await initializeApp();  // REQUIRED - uses global connection pool
  const data = await Patient.find().lean();
  return Response.json({ patients: data });
}
```

**Models (avoid duplicate registration):**
```typescript
// models/Patient.ts
const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema, 'patients');
export default Patient;
```

**Components:**
```tsx
"use client"  // REQUIRED for interactive components
import { useApp } from '@/context/AppContext';  // Global state
import { useAuth } from '@/hooks/use-auth';      // Auth state
import { useAI } from '@/hooks/use-ai';          // AI features
```

**API Response Shape:**
```typescript
return NextResponse.json({ success: true, data: result });
return NextResponse.json({ success: false, error: "message" }, { status: 400 });
```

### Key Files
| Purpose | File |
|---------|------|
| DB connection pooling | `lib/db.ts` → `initializeApp()` |
| Global state + fallback data | `context/AppContext.tsx` |
| Auth middleware | `middleware.ts` → checks `auth_token` cookie |
| OpenAI integration | `lib/openai-service.ts` → `gpt-4o-mini`, returns JSON |
| AI hook for components | `hooks/use-ai.ts` |
| Chat widget (needs Flask) | `components/chatbot/chat-widget.tsx` |

### Auth Flow
- Middleware guards: `/dashboard/*`, `/admin/*`, `/patients/*`, etc.
- Cookie: `auth_token` (JWT)
- Client: `useAuth()` stores token in `localStorage`, auto-refreshes on 401

### N8N Webhook Integration
```typescript
// app/api/admin/import/route.ts - validate Bearer token
const token = request.headers.get('authorization')?.replace('Bearer ', '');
if (token !== process.env.N8N_WEBHOOK_TOKEN) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Environment Variables
```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
JWT_SECRET=...
N8N_WEBHOOK_TOKEN=...
```

### Common Mistakes to Avoid
- ❌ Forget `await initializeApp()` before Mongoose operations
- ❌ Create models without `mongoose.models.X ||` guard
- ❌ Use Mongoose directly in client components (use API routes)
- ❌ Miss `"use client"` directive on interactive components
- ❌ Call OpenAI in components (use `useAI()` hook → `/api/ai/*`)

### Adding Features
| Task | Location |
|------|----------|
| New page | `app/[feature]/page.tsx`, add to `components/sidebar.tsx` |
| New API | `app/api/[route]/route.ts`, call `initializeApp()` first |
| New model | `models/[Name].ts`, use registration guard pattern |
| AI feature | Add to `lib/openai-service.ts`, expose via `hooks/use-ai.ts` |

### Testing
```bash
npm run test:admin    # Auth verification
# AppContext falls back to defaultPatients if MongoDB offline
```

### French UI
All user-facing strings are in French. Preserve existing terminology when editing UI.
