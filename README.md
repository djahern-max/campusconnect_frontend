# CampusConnect Frontend

A modern web application for connecting students with institutions and scholarships, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form
- **File Upload**: react-dropzone
- **HTTP Client**: Axios

### Project Structure
```
src/
├── app/                          # Next.js 14 App Router
│   ├── admin/                    # Admin portal routes
│   │   ├── gallery/             # Gallery manager
│   │   ├── login/               # Admin authentication
│   │   └── layout.tsx           # Admin layout wrapper
│   ├── institutions/            # Institution listings
│   ├── scholarships/            # Scholarship search
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Navbar.tsx
│   └── [feature]/               # Feature-specific components
├── hooks/                       # Custom React hooks
│   ├── useGallery.ts           # Gallery CRUD operations
│   ├── useInstitutions.ts      # Institution data fetching
│   └── useAuth.ts              # Authentication
├── stores/                      # Zustand state stores
│   └── authStore.ts            # Authentication state
├── lib/                        # Utilities and configurations
│   ├── api.ts                  # Axios instance
│   └── queryClient.ts          # React Query setup
└── types/                      # TypeScript type definitions
    └── index.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see campusconnect-backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/djahern-max/campusconnect_frontend.git
cd campusconnect_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Key Features

### Admin Portal
- **Authentication**: JWT-based admin login
- **Gallery Manager**: Upload, manage, and delete institution images
- **Dashboard**: Overview of institution data

### Public Features
- **Institution Search**: Browse and filter universities
- **Scholarship Discovery**: Search available scholarships
- **Responsive Design**: Mobile-first approach

## 🔧 Configuration

### Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

### Image Handling
Images are configured to load from DigitalOcean Spaces CDN:
- Domain: `magicscholar-images.nyc3.cdn.digitaloceanspaces.com`
- Domain: `magicscholar-images.nyc3.digitaloceanspaces.com`

Configured in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'magicscholar-images.nyc3.cdn.digitaloceanspaces.com',
    },
  ],
}
```

## 🎨 Design System

### Colors (Tailwind)
- **Primary**: Blue (`primary-*` classes)
- **Danger**: Red (`danger-*` classes)
- **Neutral**: Gray shades

### Components
All UI components follow a consistent API:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}
```

## 📡 API Integration

### Authentication
```typescript
// Login
POST /api/v1/admin/login
Body: { email: string, password: string }
Response: { access_token: string }

// Protected routes use Bearer token
Authorization: Bearer {access_token}
```

### Gallery Endpoints
```typescript
// Get all gallery images
GET /api/v1/admin/gallery
Response: InstitutionImage[]

// Upload image
POST /api/v1/admin/gallery
Body: FormData { file, caption?, image_type? }
Response: InstitutionImage

// Delete image
DELETE /api/v1/admin/gallery/{id}
Response: { message: string }
```

### Type Definitions
```typescript
interface InstitutionImage {
  id: number;
  institution_id: number;
  image_url: string;
  cdn_url: string;
  filename: string;
  caption?: string;
  display_order: number;
  is_featured: boolean;
  image_type: string;
  created_at: string;
}
```

## 🧪 Development

### Code Style
- **ESLint**: Configured with Next.js defaults
- **TypeScript**: Strict mode enabled
- **Prettier**: (Add if using)

### File Naming Conventions
- Components: PascalCase (`Button.tsx`)
- Hooks: camelCase with `use` prefix (`useGallery.ts`)
- Utilities: camelCase (`api.ts`)
- Pages: lowercase (`gallery/page.tsx`)

## 🚢 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**

### Environment Variables (Production)
Ensure `NEXT_PUBLIC_API_URL` points to your production backend.

## 📝 Common Tasks

### Adding a New Page
1. Create `src/app/[route]/page.tsx`
2. Add route to navigation if needed
3. Update types if using API data

### Adding a New Component
1. Create `src/components/[name].tsx`
2. Export from component
3. Import where needed

### Adding API Integration
1. Define types in `src/types/`
2. Create hook in `src/hooks/`
3. Use TanStack Query for data fetching

## 🐛 Troubleshooting

### Images Not Loading
- Check Next.js image configuration in `next.config.ts`
- Verify CORS settings on DigitalOcean Spaces
- Check browser console for errors

### API Connection Issues
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings on backend

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contributing

(Add contribution guidelines if applicable)

## 📄 License

(Add license information)

## 🔗 Related Repositories

- [Backend API](https://github.com/djahern-max/campusconnect-backend)
