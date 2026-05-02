import React from 'react';
import { NavLink } from 'react-router-dom';

function BottomNav() {
  const navItems = [
    { to: '/dashboard', icon: 'bi-house-door', label: 'Home' },
    { to: '/scan', icon: 'bi-camera', label: 'Scan' },
    { to: '/crops', icon: 'bi-graph-up-arrow', label: 'Crops' },
    { to: '/schemes', icon: 'bi-bank', label: 'Schemes' },
  ];

  return (
    <nav className="fixed-bottom mx-auto d-flex justify-content-around py-2 px-1"
         style={{
           maxWidth: '480px', zIndex: 1030,
           backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
           backgroundColor: 'rgba(9, 9, 11, 0.92)',
           borderTop: '1px solid rgba(57, 255, 20, 0.08)',
           boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
         }}>
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to}
          className="text-center text-decoration-none px-3 py-1 d-flex flex-column align-items-center position-relative"
          style={({isActive}) => ({ color: isActive ? '#39ff14' : '#71717a', transition: 'all 0.3s ease' })}>
          {({isActive}) => (
            <>
              {isActive && (
                <div style={{
                  position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)',
                  width: '24px', height: '3px', borderRadius: '0 0 4px 4px',
                  background: 'linear-gradient(90deg, #22c55e, #39ff14)',
                  boxShadow: '0 2px 8px rgba(57, 255, 20, 0.4)'
                }} />
              )}
              <i className={`bi ${item.icon} fs-4 d-block mb-1`}></i>
              <small style={{fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.02em'}}>{item.label}</small>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
