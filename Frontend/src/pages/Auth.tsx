import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, displayName);

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: isLogin ? 'Welcome back!' : 'Account created!',
          description: isLogin ? 'Successfully signed in.' : 'You can now start uploading videos.',
        });
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center glow-soft">
            <Play className="h-5 w-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-2xl font-display font-semibold text-gradient">VideoStream</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-display font-bold leading-tight">
            Upload, analyze, and stream your videos with{' '}
            <span className="text-gradient">confidence</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered content sensitivity analysis ensures your videos meet platform guidelines before publishing.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2024 VideoStream. All rights reserved.
        </p>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center lg:hidden mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center glow-soft">
                <Play className="h-5 w-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-2xl font-display font-semibold text-gradient">VideoStream</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-display font-semibold">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Sign in to continue to your dashboard' : 'Start uploading and analyzing videos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 bg-secondary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-secondary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-secondary"
                />
              </div>
            </div>

            <Button type="submit" className="w-full glow-soft" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
