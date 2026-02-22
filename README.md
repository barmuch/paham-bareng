# Paham Bareng 🚀

Platform roadmap pembelajaran kolaboratif yang membantu tim dan individu merencanakan, melacak, dan mencapai tujuan pembelajaran mereka bersama-sama.

## 🌟 Fitur Utama

- **Roadmap Interaktif**: Visualisasi roadmap pembelajaran dengan graph interaktif
- **Kolaborasi Tim**: Bekerja sama dengan tim dalam mencapai target pembelajaran
- **Tracking Progress**: Pantau perkembangan pembelajaran secara real-time
- **AI Chat Assistant**: Asisten AI untuk membantu perencanaan pembelajaran (opsional)
- **Project Management**: Kelola proyek-proyek pembelajaran
- **Admin Dashboard**: Dashboard comprehensive untuk manajemen sistem

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB dengan Mongoose
- **Authentication**: JWT
- **Visualization**: Cytoscape.js untuk graph
- **State Management**: Zustand
- **UI Components**: React Icons, React Hot Toast
- **AI Integration**: OpenAI API (opsional)

## 📋 Prerequisites

- Node.js 18+ dan npm
- MongoDB database (local atau MongoDB Atlas)
- Git

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/barmuch/pahambareng.git
cd pahambareng
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` dari template:

```bash
copy .env.local.example .env.local
```

Edit `.env.local` dengan konfigurasi Anda:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pahambareng
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
OPENAI_API_KEY=sk-your-openai-api-key-here-optional
NEXT_PUBLIC_API_URL=/api
```

### 4. Seed Database

Buat admin user dan data sample:

```bash
npm run seed:reset
```

Default admin credentials:
- Email: `admin@roadmap.com`
- Password: `Admin123!`

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database dengan data sample
npm run seed:reset   # Reset database & create admin user
```

## 🌐 Deployment

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap deployment ke Vercel.

### Quick Deploy ke Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/barmuch/pahambareng)

Jangan lupa set environment variables di Vercel Dashboard!

## 📁 Struktur Project

```
paham-bareng/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin pages
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── roadmaps/     # Roadmap pages
│   │   ├── projects/     # Project pages
│   │   └── teams/        # Team pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & helpers
│   └── models/           # MongoDB models
├── public/               # Static assets
├── scripts/              # Utility scripts
└── ...config files
```

## 🔐 Authentication

Aplikasi menggunakan JWT untuk authentication:
- Token disimpan di localStorage
- Protected routes menggunakan middleware
- Admin routes memerlukan role `admin`

## 🗄️ Database Models

- **User**: User accounts dengan roles
- **Roadmap**: Learning roadmaps dengan nodes dan edges
- **Progress**: Tracking user progress
- **Team**: Team collaboration
- **Project**: Project management

## 🎨 UI/UX Features

- Responsive design untuk mobile dan desktop
- Dark mode ready
- Drag & drop untuk roadmap editor
- Toast notifications
- Loading states
- Error boundaries

## 🔧 Development

### Code Style

Project menggunakan:
- TypeScript untuk type safety
- ESLint untuk code quality
- Prettier untuk code formatting (optional)

### API Routes

API routes mengikuti REST conventions:
- `GET /api/roadmaps` - List roadmaps
- `POST /api/roadmaps` - Create roadmap
- `GET /api/roadmaps/[id]` - Get roadmap
- `PUT /api/roadmaps/[id]` - Update roadmap
- `DELETE /api/roadmaps/[id]` - Delete roadmap

## 🤝 Contributing

Contributions welcome! Silakan:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is private and proprietary.

## 📧 Contact

Untuk pertanyaan atau feedback, silakan hubungi:
- GitHub: [@barmuch](https://github.com/barmuch)
- Email: admin@roadmap.com

## 🙏 Acknowledgments

- Next.js team untuk amazing framework
- MongoDB team untuk database yang powerful
- Vercel untuk hosting platform yang excellent
- OpenAI untuk AI capabilities

---

**Made with ❤️ by Barmuch**
