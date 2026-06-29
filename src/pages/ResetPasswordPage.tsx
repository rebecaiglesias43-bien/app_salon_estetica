import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const passwordError = touched && !newPassword
    ? 'La nueva contraseña es requerida'
    : touched && newPassword.length < 4
    ? 'Mínimo 4 caracteres'
    : '';

  const confirmError = touched && newPassword !== confirmPassword
    ? 'Las contraseñas no coinciden'
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!newPassword || newPassword.length < 4) return;
    if (newPassword !== confirmPassword) return;

    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Si no hay token, mostrar error
  if (!token) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#08060d] via-[#0d0914] to-[#120c1a]" />
        <div className="relative w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1025]/30 backdrop-blur-xl rounded-[2rem] px-8 sm:px-10 py-12 shadow-[0_25px_80px_rgba(0,0,0,0.5)] border border-red-500/10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <h1 className="text-xl font-extralight tracking-[0.1em] text-white/70 mb-3">Enlace no válido</h1>
            <p className="text-xs text-white/30 mb-6">No se encontró un token de recuperación. Es posible que el enlace haya expirado o esté incompleto.</p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-sm text-salon-gold hover:text-salon-gold/80 transition-colors"
            >
              <ArrowLeft size={14} />
              Solicitar nuevo enlace
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#08060d] via-[#0d0914] to-[#120c1a]" />

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

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative bg-[#1a1025]/30 backdrop-blur-xl rounded-[2rem] px-8 sm:px-10 py-12 shadow-[0_25px_80px_rgba(0,0,0,0.5)] border border-salon-gold/10"
            >
              {/* ─── Círculo superior ─── */}
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 100 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-salon-gold to-salon-pink flex items-center justify-center -mt-20 mb-5 shadow-[0_0_35px_rgba(212,168,67,0.3)] ring-4 ring-white/5"
                >
                  {success ? <ShieldCheck size={28} className="text-white" /> : <Lock size={28} className="text-white" />}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-2xl font-extralight tracking-[0.15em] text-white/80"
                >
                  {success ? '¡Contraseña Actualizada!' : 'Nueva Contraseña'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="text-xs text-white/30 mt-2 text-center leading-relaxed max-w-xs"
                >
                  {success
                    ? 'Serás redirigido al inicio de sesión en unos segundos...'
                    : 'Elige una nueva contraseña para tu cuenta.'}
                </motion.p>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 mb-4"
                >
                  <div className="flex items-center gap-2 bg-green-500/10 text-green-300 p-4 rounded-xl text-sm border border-green-500/20 w-full">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Contraseña restablecida exitosamente.</span>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-salon-gold hover:text-salon-gold/80 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Ir a Iniciar Sesión
                  </Link>
                </motion.div>
              ) : (
                <>
                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center gap-2 bg-red-500/10 text-red-300 p-3 rounded-xl text-sm mb-5 border border-red-500/20"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* ─── Nueva contraseña ─── */}
                  <div className="mb-4">
                    <div className="relative group">
                      <Lock
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
                          passwordError ? 'text-red-400' : 'text-white/25 group-focus-within:text-salon-gold'
                        }`}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onFocus={() => setTouched(true)}
                        className={`w-full pl-11 pr-12 py-4 rounded-2xl bg-white/15 text-white placeholder-white/40 text-sm border transition-all duration-300 focus:outline-none ${
                          passwordError
                            ? 'border-red-400/50 focus:ring-2 focus:ring-red-400/30'
                            : 'border-white/10 focus:border-salon-gold/50 focus:ring-2 focus:ring-salon-gold/15'
                        }`}
                        placeholder="Nueva contraseña"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordError && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {passwordError}
                      </motion.p>
                    )}
                  </div>

                  {/* ─── Confirmar contraseña ─── */}
                  <div className="mb-7">
                    <div className="relative group">
                      <Lock
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
                          confirmError ? 'text-red-400' : 'text-white/25 group-focus-within:text-salon-gold'
                        }`}
                      />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setTouched(true)}
                        className={`w-full pl-11 pr-12 py-4 rounded-2xl bg-white/15 text-white placeholder-white/40 text-sm border transition-all duration-300 focus:outline-none ${
                          confirmError
                            ? 'border-red-400/50 focus:ring-2 focus:ring-red-400/30'
                            : 'border-white/10 focus:border-salon-gold/50 focus:ring-2 focus:ring-salon-gold/15'
                        }`}
                        placeholder="Confirmar contraseña"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmError && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {confirmError}
                      </motion.p>
                    )}
                  </div>

                  {/* ─── Botón ─── */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-salon-gold via-[#c49147] to-salon-pink text-black font-semibold text-sm tracking-wide shadow-[0_0_30px_rgba(212,168,67,0.2)] hover:shadow-[0_0_45px_rgba(212,168,67,0.35)] disabled:opacity-40 transition-all duration-300 overflow-hidden group cursor-pointer"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                          />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          Restablecer Contraseña
                        </>
                      )}
                    </span>
                  </motion.button>
                </>
              )}

              {/* ─── Volver al login (si no está en success) ─── */}
              {!success && (
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-salon-gold/70 hover:text-salon-gold transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
