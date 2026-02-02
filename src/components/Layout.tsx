import { Link, useLocation } from 'react-router-dom';
import {
  ClerkLoading,
  ClerkLoaded,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/attendance', label: 'Attendance' },
    { path: '/assessment', label: 'Assessment' },
  ];

  return (
    <div className="min-h-screen bg-apple-lightgray">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Cohort FRSP
            </h1>
            <div className="flex items-center gap-4">
              <SignedIn>
                <nav className="flex gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        location.pathname === item.path
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ClerkLoading>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            {children}
          </SignedIn>
          <SignedOut>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Welcome to Cohort FRSP
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                Sign in to access the student analytics dashboard.
              </p>
              <SignInButton mode="modal">
                <button className="px-6 py-3 rounded-full text-base font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </ClerkLoaded>
      </main>
    </div>
  );
}
