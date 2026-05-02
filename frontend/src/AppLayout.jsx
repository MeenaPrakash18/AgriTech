import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

function AppLayout() {
  const location = useLocation();
  const noNavRoutes = ['/login', '/register', '/onboarding'];
  const showNav = !noNavRoutes.includes(location.pathname);

  return (
    <>
      <div style={{ flex: '1 0 auto' }}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </>
  );
}

export default AppLayout;
