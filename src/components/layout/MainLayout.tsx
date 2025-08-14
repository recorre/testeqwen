import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Home, User, LogOut, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { useFavoritesStore } from '@/stores/favorites';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuthStore();
  const { favorites } = useFavoritesStore();

  const handleLogout = () => {
    logout();
    toast.success('Até logo! 👋');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-destructive" />
              <div>
                <h1 className="font-bold text-lg text-gradient-rio">Banco de Tempo</h1>
                <p className="text-xs text-muted-foreground">Casa Corre - RJ</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Time Balance */}
              <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{profile?.time_balance || 0}h</span>
              </div>

              {/* User Avatar - Modified to be clickable */}
              <Link to="/profile" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-rio text-white text-sm">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{profile?.name || user?.email}</span>
              </Link>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link
              to="/"
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                location.pathname === '/'
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Início</span>
            </Link>

            <div className="relative">
              <Link
                to="/profile"
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  location.pathname === '/profile'
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <User className="h-5 w-5" />
                <span className="text-xs font-medium">Perfil</span>
              </Link>

              {/* Favorites Counter */}
              {favorites.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}