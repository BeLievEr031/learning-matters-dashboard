import { useNavigate } from 'react-router-dom';
import { UserCircle, BookOpen, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/auth.store.ts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card.tsx';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
          Student Portal
        </span>
        <h2 className="text-xl font-bold text-foreground mt-2">
          Welcome, {user?.firstName || user?.email}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Access your enrolled curriculum courses and personal academic profile.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-primary" />
              Student Information
            </CardTitle>
            <CardDescription className="text-xs">Your registered account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Account Email</span>
              <span className="font-semibold">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Status</span>
              <span className="text-emerald-500 font-semibold uppercase">Enrolled Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Academic Courses
            </CardTitle>
            <CardDescription className="text-xs">Curriculum and syllabus access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Review syllabus outlines, assigned subjects, and teaching faculty details.
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-semibold transition-colors"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
