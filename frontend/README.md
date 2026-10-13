# 💻 TripMax Frontend Application

Modern React 19 + TypeScript + Tailwind CSS v4 single-page application and interactive travel operating studio for TripMax.

For full project documentation, architecture diagrams, and system overview, please see the [Root README](../README.md).

---

## ⚡ Quick Start

### 1. Requirements
- Node.js 18+
- npm (or pnpm/yarn)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in this directory:
```ini
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Run Development Server
```bash
npm run dev
```
Accessible at `http://localhost:5173`. Requests to `/api/*` are automatically reverse-proxied to `http://127.0.0.1:8000`.

### 5. Build for Production
```bash
npm run build
```
Build output is saved to the `dist/` directory.

---

## 🎨 Key Features & Components (`src/components/`)
- `ChatStudio.tsx`: Interactive conversational discovery with suggested replies, quick buttons, and custom input.
- `ItineraryTab.tsx`: Day-by-day morning, afternoon, evening cards, high-res photography, transit tips, and lunch/dinner recommendations.
- `TransitTab.tsx`: Side-by-side flight vs rail cards with deep booking URLs, regional mobility guide, and **Auto-Book** triggers.
- `StaysTab.tsx`: Verified hotels (rating >= 9.0/10) with room rates, reviews, amenities, direct booking links, and **Auto-Book** triggers.
- `AutoBookingModal.tsx`: Autonomous Playwright booking modal featuring live execution audit logs, step ticker, cart reservation status, and expandable proof screenshot.
- `ResearchSourcesTab.tsx`: Dedicated registry of all live web portals crawled by Playwright and Firecrawl with live status badges, category filters, and deep links.
- `BudgetTab.tsx`: Interactive categorical financial breakdown with 10-currency converter.
- `BookingChecklistTab.tsx`: Milestone-based pre-trip checklist (4 weeks, 2 weeks, 3 days out) and categorized packing list.
- `SavedTripsTab.tsx`: Cloud-synchronized trip gallery for authenticated users.
- `ExportModal.tsx`: Generates formatted Word (`.docx`) and vector PDF files.
- `CurrencyDropdown.tsx`: Real-time exchange rate conversions across 10 global currencies.
