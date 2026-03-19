# Insurance Claims Processing Frontend

A clean and simple Next.js frontend for managing insurance claim processing with a modern, minimalist design.

## Features

- **Claims Submission**: Submit new insurance claims with all required information
- **Claims Management**: View and manage claims organized by status (Submitted, Processing, Human Review, Approved, Rejected)
- **Processing Flow**: Visual representation of the claim processing pipeline with agent stages
- **Dashboard**: High-level overview with statistics and searchable claims table
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **API Integration**: Fully integrated with the BPX backend API using Axios

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with navbar
│   │   ├── page.tsx            # Home page with claims view
│   │   └── dashboard/
│   │       └── page.tsx        # Dashboard page
│   ├── components/
│   │   ├── ui/                 # shadcn UI components
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── ClaimForm.tsx       # Claim submission form
│   │   ├── ClaimsList.tsx      # Claims view with status tabs
│   │   ├── ProcessingFlow.tsx  # Agent processing visualization
│   │   ├── HomePage.tsx        # Home page component
│   │   └── DashboardPage.tsx   # Dashboard component
│   ├── lib/
│   │   ├── api.ts             # API client with Axios
│   │   ├── utils.ts           # Utility functions
│   │   └── cn.ts              # Class name merging utility
│   ├── types/
│   │   └── claims.ts          # TypeScript interfaces
│   └── styles/
│       └── globals.css        # Global styles
├── .env.local                  # Environment variables
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Setup and Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd frontend
npm install --legacy-peer-deps
```

2. The `.env.local` file is already configured with the backend URL:
```
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000/
```

Update this if your backend is running on a different URL.

## Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Usage

### Home Page (Claims)
- **Submit a Claim**: Use the form on the right side to fill in claim details and submit a new claim
- **View Claims**: Claims are displayed in tabs organized by status:
  - **Submitted**: New claims waiting for processing
  - **Processing**: Claims currently being processed by agents
  - **Human Review**: Claims requiring manual review
  - **Approved**: Successfully approved claims
  - **Rejected**: Rejected claims
- **Process a Claim**: Click on a claim and click the "Process" button to start the processing pipeline

### Processing View
When processing a claim, you see:
- Claim details at the top
- A visual pipeline showing all agent stages
- Real-time progress as each agent stage completes:
  - Intake Agent
  - Document Validation
  - Fraud Detection
  - Medical Review
  - Policy Verification
  - Settlement Agent
  - Confidence Score

### Dashboard Page
High-level overview with:
- **Statistics Cards**: Total, Active, Pending, Approved, Rejected, and Human Review claim counts
- **Searchable Table**: Find claims by Claim ID, Policy Number, or Claimant Name
- **Claim Details**: Click any row to see full details
- **Quick Actions**: Process claims directly from the dashboard

## API Integration

The frontend communicates with the backend using Axios. All API calls are in `src/lib/api.ts`:

### Available Endpoints
- `POST /claims/` - Submit a new claim
- `GET /claims/{claim_id}` - Get claim details
- `GET /admin/claims` - Get all claims
- `POST /admin/process/{claim_id}` - Process a claim
- `POST /admin/approve/{claim_id}` - Approve a claim
- `POST /admin/reject/{claim_id}` - Reject a claim

## Technology Stack

- **Frontend Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Design Principles

- **Clean & Simple**: Minimal, professional design without unnecessary animations
- **Single Page Application**: Smooth navigation without full page reloads
- **Responsive**: Works on all screen sizes
- **Accessible**: Semantic HTML and keyboard navigation support
- **User-Focused**: Clear information hierarchy and intuitive workflows

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Backend Connection Issues
- Verify the backend is running on `http://127.0.0.1:8000/`
- Check the `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Ensure CORS is enabled on the backend

### Build Issues
If you encounter build issues, try:
```bash
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

## Notes

- The application uses `--legacy-peer-deps` flag due to peer dependency compatibility between Next.js and lucide-react
- All API calls are fully typed with TypeScript for better development experience
- The processing flow visualization uses simple animations (CSS-based only, no animation libraries)
