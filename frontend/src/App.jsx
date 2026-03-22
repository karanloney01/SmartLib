import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, KeySquare, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/books', icon: BookOpen, label: 'Books' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/issues', icon: KeySquare, label: 'Issues' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">SL</div>
        <div className="logo-text">SmartLib</div>
      </div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <Link to="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};

const Topbar = ({ title }) => (
  <header className="topbar">
    <h2 className="page-title">{title}</h2>
    <div className="user-profile">
      <div className="avatar"></div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Admin</span>
    </div>
  </header>
);

const Dashboard = () => (
  <div className="content-area animate-fade-in">
    <div className="grid">
      <div className="glass-panel stat-card">
        <span className="stat-title">Total Books</span>
        <span className="stat-value">1,248</span>
      </div>
      <div className="glass-panel stat-card">
        <span className="stat-title">Active Students</span>
        <span className="stat-value">856</span>
      </div>
      <div className="glass-panel stat-card">
        <span className="stat-title">Books Issued</span>
        <span className="stat-value">142</span>
      </div>
    </div>
    
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Recent Activity</h3>
      <p style={{ color: 'var(--text-secondary)' }}>Connect the backend to see real-time library transactions.</p>
    </div>
  </div>
);

const PlaceholderPage = ({ title }) => (
  <div className="content-area animate-fade-in">
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
      <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>{title} Management</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        This module is under construction. It will integrate with the Express API to fetch {title.toLowerCase()} data.
      </p>
      <button className="btn-primary">Add New {title.slice(0, -1)}</button>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const titles = {
    '/': 'Dashboard Overview',
    '/books': 'Book Catalog',
    '/students': 'Student Directory',
    '/issues': 'Issue Tracking'
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-wrapper">
        <Topbar title={titles[location.pathname] || 'SmartLib'} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<PlaceholderPage title="Books" />} />
          <Route path="/students" element={<PlaceholderPage title="Students" />} />
          <Route path="/issues" element={<PlaceholderPage title="Issues" />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
