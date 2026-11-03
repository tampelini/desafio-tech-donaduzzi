import { lazy, Suspense, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { AppDataProvider, useAppData } from './store/AppDataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameApp } from './screens/GameApp';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function Router() {
  const { ready } = useAppData();
  const hash = useHashRoute();
  const isAdmin = hash.startsWith('#/admin');

  useEffect(() => {
    document.documentElement.classList.toggle('kiosk', !isAdmin);
  }, [isAdmin]);

  if (!ready) return <div className="stage" aria-busy="true" />;
  if (isAdmin) {
    return (
      <Suspense fallback={<div className="admin-root p-6">Carregando…</div>}>
        <AdminApp />
      </Suspense>
    );
  }
  return <GameApp />;
}

export default function App() {
  return (
    // reducedMotion="user": respeita a preferência de movimento reduzido do sistema.
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <AppDataProvider>
          <Router />
        </AppDataProvider>
      </ErrorBoundary>
    </MotionConfig>
  );
}
