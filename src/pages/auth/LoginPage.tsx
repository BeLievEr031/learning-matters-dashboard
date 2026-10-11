import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { loginSchema, type LoginFormValues } from '../../schemas/auth.schema.ts';
import { authApi } from '../../api/auth.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { getApiErrorMessage } from '../../api/client.ts';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.tsx';

const REMEMBERED_EMAIL_KEY = 'lm_remembered_email';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'superadmin@learningmatters.internal', pass: 'Admin@123456' },
  { role: 'School Admin', email: 'admin@abcschool.internal', pass: 'Admin@123456' },
  { role: 'Teacher', email: 'john.smith@abcschool.internal', pass: 'Teacher@123456' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      rememberMe: Boolean(rememberedEmail),
    },
  });

  useEffect(() => {
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [rememberedEmail, setValue]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      if (values.rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      const tokens = response.tokens ?? {
        accessToken: response.accessToken ?? '',
        refreshToken: response.refreshToken ?? '',
      };

      setAuth(tokens, response.user);

      toast.success(`Welcome back, ${response.user.firstName || response.user.email}!`);

      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error);
      setServerError(message);
      toast.error('Authentication failed', { description: message });
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black text-foreground relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Card className="border-border/40 bg-card/85 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
            <CardDescription className="text-xs">
              Learning Matters Multi-Tenant School Management
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2 animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@school.com"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="pl-9 pr-9"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-muted-foreground/70 hover:text-foreground transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  {...register('rememberMe')}
                />
                <Label htmlFor="rememberMe" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  Remember this email on this device
                </Label>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 mt-2 font-semibold shadow-md gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Console'
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-6 pt-5 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Quick Fill Test Accounts:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc.email, acc.pass)}
                    className="px-2 py-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-xs font-medium text-foreground/80 hover:text-foreground transition-colors text-center"
                  >
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
