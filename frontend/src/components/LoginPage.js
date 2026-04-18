import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">TJ</div>
          <h1 className="text-3xl font-semibold font-primary text-zinc-900 tracking-tight">Gestao TJ</h1>
          <p className="mt-2 text-sm text-zinc-600">Sistema de Controle de Estoque</p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">Entrar no sistema</h2>
          <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <Input id="email" data-testid="login-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">Senha</label>
              <Input id="password" data-testid="login-password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="********" />
            </div>
            <Button type="submit" data-testid="login-submit-button" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <div className="mt-4 p-4 bg-zinc-100 rounded-lg border border-zinc-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Credenciais de teste</p>
          <div className="space-y-1 text-xs text-zinc-600">
            <p><strong>Admin:</strong> admin@gestaotj.com / Admin@123456</p>
            <p><strong>Gerente:</strong> gerente@gestaotj.com / Gerente@123</p>
            <p><strong>Usuario:</strong> usuario@gestaotj.com / Usuario@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
