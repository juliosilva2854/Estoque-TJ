import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { notificationsAPI } from '../api';
import {
  Home, Package, Warehouse, Users, FileText, ShoppingCart,
  TrendingUp, LogOut, ClipboardList, UserCircle, BarChart3, Bell,
  FileBox, Menu, X, HelpCircle
} from 'lucide-react';

export const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnread = useCallback(async () => {
    try { const res = await notificationsAPI.getUnreadCount(); setUnreadCount(res.data.count); } catch {}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { navigate('/login'); return; }
    setUser(JSON.parse(userData));
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [navigate, fetchUnread]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['dev', 'master', 'usuario'] },
    { icon: Package, label: 'Produtos', path: '/dashboard/products', roles: ['dev', 'master', 'usuario'] },
    { icon: Warehouse, label: 'Depositos', path: '/dashboard/warehouses', roles: ['dev', 'master', 'usuario'] },
    { icon: ClipboardList, label: 'Estoque', path: '/dashboard/inventory', roles: ['dev', 'master', 'usuario'] },
    { icon: UserCircle, label: 'Fornecedores', path: '/dashboard/suppliers', roles: ['dev', 'master', 'usuario'] },
    { icon: FileText, label: 'Notas Fiscais', path: '/dashboard/invoices', roles: ['dev', 'master', 'usuario'] },
    { icon: ShoppingCart, label: 'Vendas', path: '/dashboard/sales', roles: ['dev', 'master', 'usuario'] },
    { icon: FileBox, label: 'Pedidos', path: '/dashboard/orders', roles: ['dev', 'master', 'usuario'] },
    { icon: BarChart3, label: 'Relatorios', path: '/dashboard/reports', roles: ['dev', 'master'] },
    { icon: Bell, label: 'Alertas', path: '/dashboard/alerts', roles: ['dev', 'master', 'usuario'] },
    { icon: TrendingUp, label: 'Auditoria', path: '/dashboard/audit', roles: ['dev', 'master'] },
    { icon: Users, label: 'Usuarios', path: '/dashboard/users', roles: ['dev', 'master'] },
    { icon: HelpCircle, label: 'Guia', path: '/dashboard/guide', roles: ['dev', 'master', 'usuario'] },
  ];

  if (!user) return null;
  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <img src="https://static.prod-images.emergentagent.com/jobs/497729d9-514c-4803-80ed-8a3ab244b06b/images/458af5ac6c2ba33b5f4d33a8680f7a6b75c879b0b4f7c72992f0f5d5019b7edc.png" alt="Logo" className="h-7 w-7" />
            <span className="text-lg font-semibold font-primary text-zinc-900">Gestao TJ</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-zinc-600 hover:bg-zinc-100 rounded" data-testid="close-sidebar-button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 mx-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-zinc-700 hover:bg-zinc-100'}`}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Alertas' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">{unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <UserCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 uppercase">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} data-testid="logout-button"
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors">
            <LogOut className="h-4 w-4" /><span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden h-14 flex items-center justify-between px-4 bg-white border-b border-zinc-200">
          <button onClick={() => setSidebarOpen(true)} data-testid="open-sidebar-button" className="p-2 text-zinc-700 hover:bg-zinc-100 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="https://static.prod-images.emergentagent.com/jobs/497729d9-514c-4803-80ed-8a3ab244b06b/images/458af5ac6c2ba33b5f4d33a8680f7a6b75c879b0b4f7c72992f0f5d5019b7edc.png" alt="Logo" className="h-6 w-6" />
            <span className="text-base font-semibold font-primary text-zinc-900">Gestao TJ</span>
          </div>
          <Link to="/dashboard/alerts" className="p-2 relative">
            <Bell className="h-5 w-5 text-zinc-700" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{unreadCount}</span>}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
