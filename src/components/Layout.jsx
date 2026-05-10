import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Tag, ClipboardList, 
  LogOut, User as UserIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: '/liquidacion', icon: <LayoutDashboard size={20} />, label: 'Liquidaciones' },
    { path: '/empleados', icon: <Users size={20} />, label: 'Empleados' },
    { path: '/categorias', icon: <Tag size={20} />, label: 'Categorías' },
    { path: '/novedades', icon: <ClipboardList size={20} />, label: 'Novedades' },
  ];

  return (
    <div className={`layout-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo-container">
            <img 
              src={isCollapsed ? "/minilogo.png" : "/logo.png"} 
              alt="Riojanita" 
              className="brand-logo" 
            />
          </div>
          <button 
            className="collapse-toggle" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expandir" : "Contraer"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="icon-wrapper">
                {item.icon}
              </div>
              {!isCollapsed && <span className="nav-text">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" title={user?.name}>
            <div className="user-avatar">
              {isCollapsed ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </span>
              ) : (
                <UserIcon size={16} />
              )}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={logout} title="Cerrar Sesión">
            <LogOut size={20} />
            {!isCollapsed && <span className="nav-text">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
