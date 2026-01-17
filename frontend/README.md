# MeetUp Frontend

Mobile-first social planning app built with Next.js 14, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies (requires Node.js 18+)
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query) v5
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Features

- 🎯 **Event Creation**: Create shareable event links
- ⏰ **Time Grid Selector**: Visual hour selection interface
- 📍 **Location Input**: Specify your starting location
- 🔮 **Smart Results**: View calculated time overlap and geographic centroid
- 📱 **Mobile-First**: Responsive design optimized for mobile devices
- 🔗 **No Login Required**: Share links via WhatsApp, SMS, etc.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (create event)
│   ├── e/[slug]/
│   │   ├── page.tsx       # Guest portal (join event)
│   │   └── results/
│   │       └── page.tsx   # Results dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   └── time-grid-selector.tsx  # Custom time selector
├── lib/
│   ├── api.ts             # API client
│   ├── utils.ts           # Utility functions
│   └── query-provider.tsx # React Query setup
└── types/
    └── index.ts           # TypeScript types
```

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000` by default. Configure via `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Building for Production

```bash
npm run build
npm run start
```

## Development Notes

- **TimeGridSelector**: The most complex component, handles hourly slot selection and conversion to availability ranges
- **localStorage**: Used to track participant submissions (prevent duplicates)
- **React Query**: Manages API state with automatic caching and refetching
- **Mobile-first**: All components designed for mobile, enhanced for desktop

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Note: requires Node.js 18+ for local development
