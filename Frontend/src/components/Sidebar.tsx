import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Video, 
  Settings, 
  Users, 
  LogOut,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItemProps {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md glow-soft'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/videos', icon: Video, label: 'My Videos' },
  ];

  const adminItems = [
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center glow-soft">
            <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-xl font-display font-semibold text-gradient">
            VideoStream
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
            />
          ))}

          {role === 'admin' && (
            <>
              <Separator className="my-4" />
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
              {adminItems.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  isActive={location.pathname === item.to}
                />
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {role || 'User'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
