import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { notificationsAPI } from '../api';
import {
  Home, Package, Warehouse, Users, FileText, ShoppingCart,
  TrendingUp, LogOut, ClipboardList, UserCircle, BarChart3, Bell, Settings
} from 'lucide-react';

export const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {}
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
    { icon: BarChart3, label: 'Relatorios', path: '/dashboard/reports', roles: ['dev', 'master'] },
    { icon: Bell, label: 'Alertas', path: '/dashboard/alerts', roles: ['dev', 'master', 'usuario'] },
    { icon: TrendingUp, label: 'Auditoria', path: '/dashboard/audit', roles: ['dev', 'master'] },
    { icon: Users, label: 'Usuarios', path: '/dashboard/users', roles: ['dev', 'master'] },
  ];

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-zinc-200 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-200">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/497729d9-514c-4803-80ed-8a3ab244b06b/images/458af5ac6c2ba33b5f4d33a8680f7a6b75c879b0b4f7c72992f0f5d5019b7edc.png"
            alt="Logo" className="h-8 w-8"
          />
          <span className="text-xl font-semibold font-primary text-zinc-900">Gestao TJ</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isAlerts = item.label === 'Alertas';
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-zinc-100 text-blue-600 border-r-2 border-blue-600' : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {isAlerts && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 uppercase">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" /><span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
