# Quick Start Guide for Insurance Claims Processing Frontend

## What's Been Built

A complete Next.js frontend application for insurance claim processing with:

### Pages
1. **Home Page (/)** - Claims management with status-based tabs and submission form
2. **Dashboard (/dashboard)** - Statistics overview and searchable claims table

### Components
- **ClaimForm** - Submit new claims with all required fields
- **ClaimsList** - View claims organized by status (Submitted, Processing, Human Review, Approved, Rejected)
- **ProcessingFlow** - Visual pipeline of agent stages during claim processing
- **DashboardPage** - Statistics cards and searchable table of all claims
- **Navbar** - Navigation between pages

### Features
✅ Fully integrated with backend API (Axios)
✅ TypeScript for type safety
✅ shadcn UI components (Radix UI primitives)
✅ Tailwind CSS styling
✅ Responsive design
✅ No external animation libraries (clean, professional look)
✅ Environment configuration (.env.local)

## Getting Started

### 1. Start the Backend
```bash
cd /workspaces/BPX_ins/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
```bash
cd /workspaces/BPX_ins/frontend
npm run dev
```

The application will be available at: **http://localhost:3000**

## API Reference

The frontend is configured to communicate with:
- Backend URL: `http://127.0.0.1:8000/`
- (Modify in `/frontend/.env.local` if needed)

### Endpoints Used
```
POST   /claims/                    - Submit new claim
GET    /claims/{claim_id}          - Get claim details with agent status
GET    /admin/claims               - Get all claims
POST   /admin/process/{claim_id}   - Process a claim
POST   /admin/approve/{claim_id}   - Approve a claim
POST   /admin/reject/{claim_id}    - Reject a claim
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── layout.tsx         # Root layout with Navbar
│   │   ├── page.tsx           # Home page
│   │   └── dashboard/
│   │       └── page.tsx       # Dashboard page
│   ├── components/             # React components
│   │   ├── ui/                # shadcn UI components
│   │   ├── ClaimForm.tsx
│   │   ├── ClaimsList.tsx
│   │   ├── ProcessingFlow.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── api.ts            # Axios API client
│   │   ├── utils.ts          # Helper functions
│   │   └── cn.ts             # Classname utility
│   ├── types/
│   │   └── claims.ts         # TypeScript interfaces
│   └── styles/
│       └── globals.css
├── .env.local                 # Backend URL configuration
├── tailwind.config.ts        # Tailwind CSS config
├── tsconfig.json            # TypeScript config
├── next.config.js           # Next.js config
├── postcss.config.mjs       # PostCSS config
└── package.json             # Dependencies
```

## Usage Examples

### Submitting a Claim
1. Go to Home page (/)
2. Fill out the form on the right:
   - Policy Number
   - Claimant Name
   - Incident Type
   - Claiming Amount
   - Incident Description
3. Click "Submit Claim"

### Processing a Claim
1. On Home page, find a "Submitted" claim
2. Click "Process" button
3. See the agent pipeline animation showing processing stages:
   - Intake Agent → Document Validation → Fraud Detection → Medical Review → Policy Verification → Settlement → Confidence Score
4. Each stage completes progressively

### Viewing Dashboard
1. Click "Dashboard" in navbar
2. See statistics for all claim statuses
3. Search claims by ID, policy number, or claimant name
4. Click any row to see full details

## Environment Configuration

The `.env.local` file contains:
```
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000/
```

Change this if your backend is on a different URL.

## Dependencies

Key packages:
- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **axios** - HTTP client
- **tailwindcss** - CSS framework
- **@radix-ui** - UI primitives
- **lucide-react** - Icons

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

**Backend not found?**
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Build errors?**
```bash
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

## Notes for Development

- All API calls are in `src/lib/api.ts`
- Component types are in `src/types/claims.ts`
- Utility functions are in `src/lib/utils.ts`
- UI components are composable and reusable
- Uses simple CSS animations (no animation libraries per requirements)

## Next Steps

To customize the application:
1. Modify colors in `tailwind.config.ts`
2. Add/remove UI components in `src/components/ui/`
3. Update API endpoints in `src/lib/api.ts`
4. Customize claim form fields in `src/components/ClaimForm.tsx`
5. Modify agent stages in `src/components/ProcessingFlow.tsx`

