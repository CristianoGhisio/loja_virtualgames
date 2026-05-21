'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gamepad2, Lock, AlertCircle, ArrowLeft, UserCircle, Loader2, Shield, Eye, EyeOff, CheckCircle, Server, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<LoginUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const passwordErrors = useMemo(() => {
    if (!touched || !password) return [];
    const errors: string[] = [];
    if (password.length < 3) errors.push('Mínimo de 3 caracteres');
    return errors;
  }, [password, touched]);

  const isValid = password.length >= 3;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/login/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('API returned non-array data:', data);
        setUsers([]);
        setError('Erro ao carregar lista de usuários.');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Erro ao carregar usuários. Tente recarregar a página.');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !password) return;

    setError('');
    setIsLoading(true);

    try {
      await login(selectedUser.email, password);
    } catch {
      setError('Senha incorreta ou erro no login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex bg-background text-foreground overflow-hidden">
      <div className="hidden lg:flex w-[55%] relative bg-[#08080d] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2670&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-radial from-neon-blue/5 via-transparent to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center p-12 max-w-xl"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl shadow-[0_0_25px_rgba(0,212,255,0.3)]">
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <span className="font-orbitron text-2xl sm:text-3xl font-bold tracking-widest text-white">
              VIRTUAL<span className="text-neon-blue">GAMES</span>
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
            Sistema Interno de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
              Gestão Integrada
            </span>
          </h1>

          <div className="border-l-2 border-neon-blue pl-5 sm:pl-6 text-left mx-auto max-w-md bg-white/[0.02] p-4 sm:p-5 rounded-r-xl border border-l-0 border-white/5">
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Acesso restrito a colaboradores autorizados. Monitoramento em tempo real de vendas, estoque e logística.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">HTTPS</span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-neon-blue" />
              <span>SERVER:</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500">ONLINE</span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-neon-blue" />
              <span>v2.4.0</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background relative min-h-dvh">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8"
        >
          <Link
            href="/"
            className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors text-xs sm:text-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Loja
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div
            variants={itemVariants}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue" />

            <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
                <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-neon-blue" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-orbitron">Acesso ao Sistema</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Selecione seu perfil para entrar</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <motion.div variants={itemVariants}>
                {loadingUsers ? (
                  <div className="flex justify-center py-8 sm:py-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-neon-blue" />
                      <span className="text-xs text-gray-400">Carregando usuários...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider ml-1">
                      USUÁRIOS DISPONÍVEIS
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                      {users.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setPassword('');
                            setError('');
                            setTouched(false);
                          }}
                          className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-300 text-left ${
                            selectedUser?.id === user.id
                              ? 'bg-neon-blue/10 border-neon-blue/50 text-white shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                              : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${
                              selectedUser?.id === user.id ? 'bg-neon-blue/20 border border-neon-blue/30' : 'bg-white/10 border border-white/5'
                            }`}
                          >
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <UserCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-white truncate">{user.name}</div>
                            <div className="text-[10px] sm:text-xs opacity-70 uppercase tracking-wide truncate">{user.role}</div>
                          </div>
                          {selectedUser?.id === user.id && (
                            <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.6)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {selectedUser && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 pt-4 sm:pt-5 border-t border-white/5"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider ml-1">
                      SENHA DE ACESSO
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setTouched(true);
                          setError('');
                        }}
                        placeholder="Digite sua senha..."
                        className={`bg-black/20 border ${
                          touched && passwordErrors.length > 0
                            ? 'border-red-500/50 focus-visible:ring-red-500'
                            : touched && isValid
                            ? 'border-green-500/50 focus-visible:ring-green-500'
                            : 'border-white/10 focus-visible:border-neon-blue'
                        } pr-10 text-sm sm:text-base`}
                        autoFocus
                        icon={<Lock className="w-4 h-4 text-gray-400" />}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {touched && passwordErrors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-red-400 text-xs ml-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {passwordErrors[0]}
                      </motion.div>
                    )}

                    {touched && isValid && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-green-400 text-xs ml-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Senha válida
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 flex items-start gap-3 text-red-400 text-xs sm:text-sm"
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-neon-blue hover:bg-neon-blue-dark text-black font-bold h-11 sm:h-12 text-sm sm:text-base shadow-[0_0_25px_rgba(0,212,255,0.2)] hover:shadow-[0_0_35px_rgba(0,212,255,0.4)] transition-all duration-300 rounded-xl"
                  disabled={isLoading || !selectedUser || !password || (touched && !isValid)}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      VALIDANDO ACESSO...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      ENTRAR NO SISTEMA
                    </div>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-600">
                  <Shield className="w-3 h-3" />
                  <span>Conexão segura via HTTPS</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>Acesso monitorado</span>
                </div>

                <p className="text-center text-[10px] sm:text-xs text-gray-700">
                  &copy; {new Date().getFullYear()} Virtual Games Inc.
                </p>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
