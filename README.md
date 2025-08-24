# FitCoach - AI-Powered Fitness Coaching Platform

A modern, responsive fitness coaching platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first responsive design with custom design system
- **Component Library**: Shadcn/ui components with custom styling
- **Type Safety**: Comprehensive TypeScript definitions for all entities
- **AI-Ready**: Foundation prepared for AI-powered features
- **Scalable Architecture**: Clean folder structure and separation of concerns

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom design system
- **Components**: Shadcn/ui component library
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier
- **Font**: Inter font family

## 📁 Project Structure

```
├── app/                  # Next.js App Router
│   ├── globals.css      # Global styles with CSS variables
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── components/           # Reusable components
│   ├── ui/              # Shadcn/ui components
│   ├── layout/          # Layout components
│   └── dashboard/       # Dashboard-specific components
├── lib/                 # Utility libraries
│   ├── auth/            # Authentication utilities
│   ├── database/        # Database utilities
│   └── utils.ts         # General utilities
├── types/               # TypeScript type definitions
│   └── index.ts         # Core type definitions
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## 🎨 Design System

### Colors
- **Primary**: Purple/blue gradient (#667eea to #764ba2)
- **Secondary**: White cards with subtle shadows
- **Accent**: Green for AI features (#10b981)

### Typography
- **Font Family**: Inter
- **Font Weights**: 100-900

### Spacing
- **Base Unit**: 4px
- **Border Radius**: 8px default, 12px for cards

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Core Types

The platform includes comprehensive TypeScript definitions for:

- **User**: Coach and client user profiles
- **Client**: Detailed client information with goals and preferences
- **Workout**: Comprehensive workout structure with exercises and sets
- **Exercise**: Exercise library with instructions and media
- **Progress Tracking**: Measurements, photos, and analytics
- **AI Recommendations**: AI-powered insights and suggestions

## 🎯 Next Steps

This foundation provides a clean starting point for building:

1. **Authentication System**: User registration and login
2. **Dashboard**: Coach and client dashboards
3. **Client Management**: Client profiles and onboarding
4. **Workout Builder**: Drag-and-drop workout creation
5. **Progress Tracking**: Charts and analytics
6. **AI Integration**: Workout and nutrition recommendations
7. **Mobile App**: React Native companion app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.