import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export const ProtectedRoute = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; requireAdmin?: boolean }
>(function ProtectedRoute({ children, requireAdmin }, ref) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <main ref={ref} className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua conta não tem permissão de administrador.
        </p>
      </main>
    );
  }

  return (
    <div ref={ref}>
      {children}
    </div>
  );
});
