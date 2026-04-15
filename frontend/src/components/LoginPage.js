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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/497729d9-514c-4803-80ed-8a3ab244b06b/images/2ffc36ea4ce1c2315d3534be85f9d91bb6629f3c60b0dc6cd812df4c6552ff3f.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/497729d9-514c-4803-80ed-8a3ab244b06b/images/458af5ac6c2ba33b5f4d33a8680f7a6b75c879b0b4f7c72992f0f5d5019b7edc.png"
            alt="Gestão TJ Logo"
            className="h-12 w-12"
          />
          <span className="text-2xl font-semibold text-zinc-900">Gestão TJ</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden mb-8">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/497729d9-514c-4803-80ed-8a3ab244b06b/images/458af5ac6c2ba33b5f4d33a8680f7a6b75c879b0b4f7c72992f0f5d5019b7edc.png"
              alt="Gestão TJ Logo"
              className="h-16 w-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-semibold font-primary text-zinc-900">Gestão TJ</h1>
          </div>

          <div>
            <h2 className="text-3xl font-semibold font-primary text-zinc-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Faça login para acessar o sistema de gestão
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6" data-testid="login-form">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Email
                </label>
                <Input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Senha
                </label>
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Credenciais de teste
            </p>
            <div className="space-y-1 text-xs text-zinc-600">
              <p><strong>Admin:</strong> admin@gestaotj.com / Admin@123456</p>
              <p><strong>Gerente:</strong> gerente@gestaotj.com / Gerente@123</p>
              <p><strong>Usuário:</strong> usuario@gestaotj.com / Usuario@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};