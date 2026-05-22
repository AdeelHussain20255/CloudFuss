# CloudFuse - Shared Student Cloud Storage

## 1. Concept & Vision

CloudFuse is a real-time collaborative cloud storage app for students, powered by a shared Mega account. It feels like a premium, modern dashboard where files uploaded by any student instantly appear on everyone's screens. The aesthetic is sleek cyberpunk-meets-professional: dark glassmorphism panels, subtle neon accents, and buttery smooth animations. This isn't just file storage—it's a communal digital backpack.

## 2. Design Language

### Aesthetic Direction
Cyberpunk dashboard with glassmorphism—think Bloomberg Terminal meets Discord's dark mode. Professional but with personality.

### Color Palette
- **Background**: `#0a0a0f` (deep void)
- **Surface**: `rgba(255, 255, 255, 0.05)` (glass panels)
- **Surface Hover**: `rgba(255, 255, 255, 0.08)`
- **Primary Accent**: `#6366f1` (indigo)
- **Secondary Accent**: `#8b5cf6` (violet)
- **Success**: `#22c55e`
- **Text Primary**: `#f8fafc`
- **Text Secondary**: `#94a3b8`
- **Border**: `rgba(255, 255, 255, 0.1)`

### Typography
- **Headings**: Inter (700 weight)
- **Body**: Inter (400/500 weight)
- **Monospace accents**: JetBrains Mono (file sizes, counts)

### Spatial System
- Base unit: 4px
- Content padding: 24px
- Card gaps: 16px
- Section spacing: 32px

### Motion Philosophy
- Page transitions: 200ms ease-out
- Hover states: 150ms ease
- Real-time updates: 300ms spring animation when new files appear
- Staggered list rendering: 50ms delay between items

### Visual Assets
- Icons: Lucide React
- File type icons based on category
- Glow effects on interactive elements

## 3. Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────────────┐ │
│ │          │ │ Header: Category Name + Search Bar     │ │
│ │ Sidebar  │ ├────────────────────────────────────────┤ │
│ │          │ │                                        │ │
│ │ - Logo   │ │  File Grid / List                      │ │
│ │ - Storage│ │  (Real-time updates)                   │ │
│ │ - Cats   │ │                                        │ │
│ │          │ │                                        │ │
│ │          │ ├────────────────────────────────────────┤ │
│ │          │ │ Upload Zone (drag & drop)              │ │
│ └──────────┘ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop (1024px+): Full sidebar + main content
- Tablet (768px-1023px): Collapsible sidebar
- Mobile (<768px): Bottom nav, full-width content

## 4. Features & Interactions

### Core Features

#### File Upload
- Drag-and-drop zone with visual feedback (border glow on dragover)
- Click to open file picker
- Progress indicator during upload
- File goes: Frontend → Backend API → Mega → Supabase (metadata) → Realtime broadcast
- Max file size: 500MB per file

#### Real-time Sync
- Supabase Realtime subscription on `files` table
- New files animate in with scale + fade
- Toast notification: "🎉 New file from [username]: [filename]"

#### Category Management
- Default categories: Notes, Certificates, Past Papers, CS Stuff
- Add custom category (saves to Supabase `categories` table)
- Click category to filter files
- Category icons from Lucide set

#### File Cards
- Display: filename, size (formatted), upload date
- Download button → opens mega_url in new tab
- Hover: subtle lift + glow effect

#### Quick Note
- Modal with textarea
- Saves as .txt file to Mega
- Automatically categorizes as "Notes"

### Edge Cases
- Empty category: Show illustration + "No files yet" message
- Upload failure: Toast error + retry button
- Offline: Show "Reconnecting..." banner, queue uploads
- Mega quota exceeded: Alert user

## 5. Component Inventory

### Sidebar
- **Logo**: "CloudFuse ☁️" with subtle glow
- **Storage Bar**: Progress bar with GB used/total, color shifts as storage fills (green→yellow→red)
- **Category List**: Icon + name, active state with accent background
- **Add Category Button**: Opens modal, validates unique name

### File Card
- **Default**: Glass panel, file icon based on extension, name (truncated), size, date, download button
- **Hover**: Scale 1.02, border glow, elevated shadow
- **New (just added)**: Entrance animation with scale from 0.9 + fade

### Upload Zone
- **Default**: Dashed border, cloud icon, "Drop files here or click to upload"
- **Dragover**: Solid border, pulsing glow, "Release to upload"
- **Uploading**: Progress bar, file name, cancel button
- **Error**: Red border, error message, retry button

### Quick Note Modal
- **Overlay**: Dark blur backdrop
- **Content**: Glass panel, textarea, Save/Cancel buttons
- **Saving**: Spinner on save button

### Toast Notifications
- Slide in from top-right
- Auto-dismiss after 4 seconds
- Types: success (green), error (red), info (indigo)

## 6. Technical Approach

### Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Database**: Supabase PostgreSQL
- **Realtime**: Supabase Realtime subscriptions
- **Storage**: Mega.nz API

### API Design

#### POST /api/upload
```
Request: FormData { file, categoryId, userName }
Response: { success: true, file: { id, name, size, mega_url, created_at } }
```

#### POST /api/quick-note
```
Request: { content: string, categoryId: string, userName: string }
Response: { success: true, file: { id, name, size, mega_url, created_at } }
```

#### GET /api/files?categoryId=xxx
```
Response: { files: [...] }
```

### Data Model

#### files table
```sql
id: uuid PRIMARY KEY
name: text NOT NULL
size: bigint NOT NULL
category_id: uuid REFERENCES categories(id)
mega_url: text NOT NULL
user_name: text NOT NULL
created_at: timestamptz DEFAULT now()
```

#### categories table
```sql
id: uuid PRIMARY KEY
name: text NOT NULL UNIQUE
icon: text NOT NULL
created_at: timestamptz DEFAULT now()
```

### Environment Variables
```
MEGA_EMAIL=xxx
MEGA_PASSWORD=xxx
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Security
- Mega credentials server-side only
- Supabase Row Level Security: public read, authenticated write
- File validation: check file type and size client + server side