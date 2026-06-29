import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { login } from '../services/authService';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem('remembered_user') || '';
  const [username, setUsername] = useState(savedUser);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(!!savedUser);

  // ─── Validaciones ─────────────────────────────────────────────
  const [touched, setTouched] = useState({ username: false, password: false });

  const usernameError = touched.username && !username.trim()
    ? 'El usuario es requerido'
    : touched.username && username.length < 3
    ? 'Mínimo 3 caracteres'
    : '';

  const passwordError = touched.password && !password
    ? 'La contraseña es requerida'
    : touched.password && password.length < 4
    ? 'Mínimo 4 caracteres'
    : '';

  const isValid = username.trim().length >= 3 && password.length >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!isValid) return;

    setError('');
    setLoading(true);
    try {
      await login(username, password);
      if (remember) {
        localStorage.setItem('remembered_user', username);
      } else {
        localStorage.removeItem('remembered_user');
      }
      navigate('/admin');
    } catch {
      setError('Credenciales inválidas. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* ═══════════════════════════════════════════
          Fondo oscuro dinámico — tonos del proyecto
          ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08060d] via-[#0d0914] to-[#120c1a]" />

      {/* Blobs animados tipo LandingPage */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.25, 0.85, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-salon-lavender/20 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -60, 40, 0], y: [0, 50, -30, 0], scale: [1, 0.8, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 -right-40 w-[700px] h-[700px] rounded-full bg-salon-pink/15 blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, 50, -50, 0], y: [0, -30, 40, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] -left-20 w-[500px] h-[500px] rounded-full bg-salon-gold/8 blur-[110px]"
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, -50, 20, 0], scale: [1, 1.3, 0.85, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 -right-32 w-[650px] h-[650px] rounded-full bg-salon-lavender/15 blur-[120px]"
      />

      <div className="relative w-full max-w-md">
        {/* ─── Tarjeta glassmorphism con fade-in + flotación ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative bg-[#1a1025]/30 backdrop-blur-xl rounded-[2rem] px-8 sm:px-10 py-14 shadow-[0_25px_80px_rgba(0,0,0,0.5)] border border-salon-gold/10"
            >
              {/* ─── Círculo superior con ícono ─── */}
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 100 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-salon-gold to-salon-pink flex items-center justify-center -mt-20 mb-5 shadow-[0_0_35px_rgba(212,168,67,0.3)] ring-4 ring-white/5"
                >
                  <User size={28} className="text-white" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-2xl font-extralight tracking-[0.15em] text-white/80"
                >
                  Iniciar Sesión
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="text-xs text-white/25 mt-1 tracking-wider"
                >
                  Accede al panel administrativo
                </motion.p>
              </div>

              {/* Mensaje de error del servidor */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-red-500/10 text-red-300 p-3 rounded-xl text-sm mb-5 border border-red-500/20"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* ─── Campo Username ─── */}
              <div className="mb-5">
                <div className="relative group">
                  <User
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
                      usernameError ? 'text-red-400' : 'text-white/25 group-focus-within:text-salon-gold'
                    }`}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setTouched(t => ({ ...t, username: true }))}
                    className={`w-full pl-11 pr-4 py-4 rounded-2xl bg-white/15 text-white placeholder-white/40 text-sm border transition-all duration-300 focus:outline-none ${
                      usernameError
                        ? 'border-red-400/50 focus:ring-2 focus:ring-red-400/30'
                        : 'border-white/10 focus:border-salon-gold/50 focus:ring-2 focus:ring-salon-gold/15 focus:shadow-[0_0_25px_rgba(212,168,67,0.08)]'
                    }`}
                    placeholder="Usuario"
                    autoComplete="username"
                    aria-invalid={!!usernameError}
                    aria-describedby={usernameError ? 'username-error' : undefined}
                  />
                  {touched.username && !usernameError && (
                    <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400" />
                  )}
                </div>
                {usernameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="username-error"
                    className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {usernameError}
                  </motion.p>
                )}
              </div>

              {/* ─── Campo Password ─── */}
              <div className="mb-7">
                <div className="relative group">
                  <Lock
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
                      passwordError ? 'text-red-400' : 'text-white/25 group-focus-within:text-salon-gold'
                    }`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setTouched(t => ({ ...t, password: true }))}
                    className={`w-full pl-11 pr-11 py-4 rounded-2xl bg-white/15 text-white placeholder-white/40 text-sm border transition-all duration-300 focus:outline-none ${
                      passwordError
                        ? 'border-red-400/50 focus:ring-2 focus:ring-red-400/30'
                        : 'border-white/10 focus:border-salon-gold/50 focus:ring-2 focus:ring-salon-gold/15 focus:shadow-[0_0_25px_rgba(212,168,67,0.08)]'
                    }`}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="password-error"
                    className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    {passwordError}
                  </motion.p>
                )}
              </div>

              {/* ─── Botón Login ─── */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-salon-gold via-[#c49147] to-salon-pink text-black font-semibold text-sm tracking-wide shadow-[0_0_30px_rgba(212,168,67,0.2)] hover:shadow-[0_0_45px_rgba(212,168,67,0.35)] disabled:opacity-40 transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Efecto shimmer */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                {/* Brillo superior */}
                <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Ingresar
                    </>
                  )}
                </span>
              </motion.button>

              {/* ─── Remember me + Forgot Password ─── */}
              <div className="flex items-center justify-between mt-5">
                <label className="flex items-center gap-2 cursor-pointer group/remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-salon-gold focus:ring-salon-gold/40 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-white/30 group-hover/remember:text-white/50 transition-colors select-none">
                    Recordarme
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-white/30 hover:text-salon-pink/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>


            </form>
          </motion.div>
        </motion.div>


      </div>
    </div>
  );
}
