import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while rendering this view.';
  let details = '';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = (error.data as { message?: string })?.message || error.statusText || message;
    details = JSON.stringify(error.data, null, 2);
  } else if (error instanceof Error) {
    message = error.message;
    details = error.stack || '';
  } else if (typeof error === 'string') {
    message = error;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background text-foreground">
      <Card className="max-w-md w-full border-destructive/30 shadow-lg">
        <CardContent className="p-6 space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-1.5 text-xs h-9"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Page
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-1.5 text-xs h-9"
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </Button>
          </div>

          {details && (
            <div className="pt-2 border-t border-border/60 text-left">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="flex items-center justify-between w-full text-[11px] text-muted-foreground hover:text-foreground font-medium py-1"
              >
                <span>Technical details</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
              </button>
              {showDetails && (
                <pre className="mt-2 p-2.5 rounded-lg bg-muted text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-40">
                  {details}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
