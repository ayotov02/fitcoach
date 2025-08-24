# FitCoach Authentication Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be fully initialized
4. Navigate to Settings > API to get your keys

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 3. Set Up Database Schema

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `lib/database/schema.sql`
4. Click "Run" to execute the schema

### 4. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Set up your site URL:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

3. Configure email templates (optional):
   - Go to Authentication > Email Templates
   - Customize the confirmation and recovery email templates

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

## 🔐 Authentication Features

### ✅ Completed Features

- **User Registration**: Email/password signup with role selection
- **User Login**: Secure authentication with Supabase
- **Email Verification**: Automatic email verification flow
- **Password Reset**: Secure password recovery
- **Role-Based Access**: Coach and Client role separation
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic session refresh and persistence
- **Logout**: Secure session termination

### 🏗️ Database Schema

The authentication system includes the following tables:

- **users**: Extended user profiles with roles
- **coaches**: Coach-specific information and settings
- **clients**: Client profiles and fitness data
- **subscriptions**: Coach subscription management
- **coach_client_relationships**: Many-to-many coach-client connections
- **profile_completion**: Progress tracking for profile setup

### 🛡️ Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Permissions**: Different access levels for coaches and clients
- **Input Validation**: Zod schema validation on forms
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Secure Cookies**: HttpOnly cookies for session management

## 📱 User Flows

### Registration Flow

1. User visits `/auth/signup`
2. Selects role (Coach or Client)
3. Fills in registration form
4. Account created with email verification
5. User redirected to email verification page
6. After email confirmation, user can log in

### Login Flow

1. User visits `/auth/login`
2. Enters email and password
3. Successfully authenticated users redirected to role-specific dashboard:
   - Coaches → `/coach/dashboard`
   - Clients → `/client/dashboard`

### Password Reset Flow

1. User visits `/auth/reset-password`
2. Enters email address
3. Reset link sent via email
4. User follows link to set new password

## 🎯 Dashboard Features

### Coach Dashboard
- Client overview and stats
- AI-powered recommendations
- Quick actions for workout creation
- Client management tools

### Client Dashboard
- Personal fitness metrics
- Today's workout preview
- Progress tracking
- Achievement milestones

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXTAUTH_URL` | Your app URL | Development only |
| `NEXTAUTH_SECRET` | JWT secret | Production only |

### Customization

#### 1. Modify User Roles
Edit `lib/auth/auth-helpers.ts` to add or modify user roles:
```typescript
export type UserRole = 'coach' | 'client' | 'admin' | 'your-new-role';
```

#### 2. Customize Signup Flow
Modify `components/auth/signup-form.tsx` to add additional fields or steps.

#### 3. Add Social Login
Configure OAuth providers in your Supabase dashboard under Authentication > Providers.

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check if email is verified
   - Verify environment variables are correct

2. **Database connection errors**
   - Ensure RLS policies are properly set up
   - Check if schema was executed successfully

3. **Redirect loops**
   - Verify middleware configuration
   - Check protected route setup

4. **Email not sending**
   - Configure SMTP settings in Supabase
   - Check email templates are enabled

### Development Tips

1. **Test with different roles**: Create test accounts for both coach and client roles
2. **Monitor database**: Use Supabase dashboard to monitor user creation and data
3. **Check browser console**: Authentication errors are logged to the console
4. **Verify middleware**: Test protected routes work correctly

## 📚 API Reference

### Authentication Helpers

```typescript
// Get current user (server-side)
const user = await getUser();

// Require authentication
const user = await requireAuth();

// Require specific role
const user = await requireRole(['coach']);

// Check profile completion
const isComplete = await hasCompletedProfile(userId);
```

### Supabase Client Usage

```typescript
// Client-side
const supabase = createClient();

// Server-side
const supabase = createServerSupabaseClient();

// Middleware
const { supabase, response } = createMiddlewareSupabaseClient(request);
```

## 🔄 Next Steps

1. **Profile Completion**: Build onboarding flows for coaches and clients
2. **Email Customization**: Customize email templates in Supabase
3. **Social Login**: Add OAuth providers (Google, Facebook, etc.)
4. **Mobile App**: Extend authentication to React Native app
5. **Admin Panel**: Create admin dashboard for user management

## 📞 Support

If you encounter issues:

1. Check this documentation first
2. Review Supabase logs in the dashboard
3. Check browser console for client-side errors
4. Review middleware logs for routing issues

The authentication system is now ready for development and can be extended based on your specific needs!