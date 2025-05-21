# Authentication Feature

## Overview
The authentication feature provides user registration and login functionality, with data stored in the browser's localStorage. It includes modern, animated UI components built with React 19, Tailwind CSS v4, and shadcn/ui.

## Key Components

### AuthContext
- Located: `src/context/AuthContext.tsx`
- Purpose: Manages authentication state, user data, and provides authentication methods
- Methods:
  - `login(data: LoginFormData)`: Authenticates a user with email/password
  - `register(data: RegisterFormData)`: Creates a new user account
  - `logout()`: Logs out the current user

### AuthPage
- Located: `src/features/auth/components/AuthPage.tsx`
- Purpose: Main authentication page that toggles between login and registration forms
- Features:
  - Animated transitions between forms using Framer Motion
  - Redirects authenticated users to the homepage

### LoginForm
- Located: `src/features/auth/components/LoginForm.tsx`
- Purpose: User login form with validation
- Features:
  - Form validation using custom hooks
  - Error handling and display
  - Remember me functionality

### RegisterForm
- Located: `src/features/auth/components/RegisterForm.tsx`
- Purpose: User registration form with validation
- Features:
  - Username, email, and password validation
  - Password confirmation check
  - Terms of service checkbox

### UserNav
- Located: `src/features/auth/components/UserNav.tsx`
- Purpose: User navigation dropdown component shown after authentication
- Features:
  - Displays user avatar, name, and email
  - Provides navigation to user settings
  - Includes logout functionality

## State Management
- User authentication state is managed through the AuthContext
- User data is stored in localStorage for persistence between sessions
- Custom hooks (`useLoginForm`, `useRegisterForm`) manage form state and validation

## Authentication Flow
1. User visits the application and is redirected to `/auth` if not authenticated
2. User logs in or registers using the respective forms
3. On successful authentication, user data is stored in localStorage
4. User is redirected to the homepage
5. Protected routes check authentication status before rendering
6. User can log out via the UserNav dropdown

## Security Considerations
- Passwords are stored in plain text in localStorage (not recommended for production)
- For a production application, implement proper password hashing and server-side authentication
- Consider adding features like password reset and email verification

## Future Enhancements
- Implement server-side authentication
- Add social login options (Google, GitHub)
- Add two-factor authentication
- Add password reset functionality
- Add email verification 