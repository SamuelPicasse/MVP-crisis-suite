# Crisis Suite MVP

A crisis management platform built with Next.js, Supabase, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 10+
- Supabase account (free tier works)

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings → API in your Supabase dashboard
   - Copy your project URL and anon key

3. **Set environment variables:**
   ```bash
   cd apps/web
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── apps/
│   ├── web/              # Next.js frontend application
│   └── supabase/         # Supabase backend configuration
├── packages/
│   ├── db/              # Database client and types
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configuration
│   ├── eslint-config/   # ESLint configuration
│   └── tsconfig/        # TypeScript configuration
└── docs/                # Documentation and stories
```

## 🧪 Testing

Run tests:
```bash
npm run test --workspace=@crisis-suite/web
```

Run linting:
```bash
npm run lint --workspace=@crisis-suite/web
```

Run type checking:
```bash
npm run typecheck --workspace=@crisis-suite/web
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript 5
- **Styling:** Tailwind CSS, Headless UI
- **Backend:** Supabase (PostgreSQL, Auth)
- **Testing:** Vitest, React Testing Library
- **Monorepo:** Turborepo

## 📝 Current Features

- ✅ User authentication (login/logout)
- ✅ Protected dashboard route
- ✅ Monorepo structure
- ✅ Unit testing setup

## 🔒 Security Note

Never commit `.env.local` files. Keep your Supabase keys secure!