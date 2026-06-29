import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Send, Copy, ExternalLink, Clock, Key } from 'lucide-react';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetData, setResetData] = useState<{ reset_url: string; username: string; expires_in_minutes: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const emailError = touched && !email.trim()
    ? 'Ingresa tu correo o usuario'
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email.trim()) return;

    setError('');
    setResetData(null);
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password', { username: email.trim() });
      setResetData({
        reset_url: res.data.reset_url,
        username: res.data.username,
        expires_in_minutes: res.data.expires_in_minutes,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resetData) return;
    try {
      await navigator.clipboard.writeText(resetData.reset_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: seleccionar texto manualmente
      const input = document.createElement('input');
      input.value = resetData.reset_url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenLink = () => {
    if (!resetData) return;
    navigate(`/reset-password?token=${resetData.reset_url.split('token=')[1]}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* ─── Fondo oscuro dinámico ─── */}
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
      <motion.div
        animate={{ x: [0, 50, -50, 0], y: [0, -30, 40, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] -left-20 w-[500px] h-[500px] rounded-full bg-salon-gold/8 blur-[110px]"
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
                  {resetData ? <Key size={28} className="text-white" /> : <Send size={28} className="text-white" />}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-2xl font-extralight tracking-[0.15em] text-white/80"
                >
                  {resetData ? 'Enlace Generado' : 'Recuperar Contraseña'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="text-xs text-white/30 mt-2 text-center leading-relaxed max-w-xs"
                >
                  {resetData
                    ? 'Usa el enlace de abajo para restablecer tu contraseña.'
                    : 'Ingresa tu correo electrónico o nombre de usuario para recuperar el acceso.'}
                </motion.p>
              </div>

              {/* ─── Resultado: enlace de recuperación ─── */}
              {resetData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mb-6"
                >
                  {/* Info */}
                  <div className="flex items-center gap-2 bg-salon-gold/10 text-salon-gold p-3 rounded-xl text-xs border border-salon-gold/20">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Enlace generado para <strong>{resetData.username}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <Clock size={12} />
                    <span>Válido por {resetData.expires_in_minutes} minutos</span>
                  </div>

                  {/* Enlace (recortado visualmente) */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 break-all">
                    <p className="text-xs text-white/50 font-mono leading-relaxed">{resetData.reset_url}</p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={handleCopy}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                        copied
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={14} />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copiar enlace
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleOpenLink}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-xs font-semibold cursor-pointer hover:shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all duration-300"
                    >
                      <ExternalLink size={14} />
                      Abrir enlace
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Mensaje de error */}
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

              {!resetData && (
                <>
                  {/* ─── Campo Email / Usuario ─── */}
                  <div className="mb-7">
                    <div className="relative group">
                      <Mail
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
                          emailError ? 'text-red-400' : 'text-white/25 group-focus-within:text-salon-gold'
                        }`}
                      />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setTouched(true)}
                        className={`w-full pl-11 pr-4 py-4 rounded-2xl bg-white/15 text-white placeholder-white/40 text-sm border transition-all duration-300 focus:outline-none ${
                          emailError
                            ? 'border-red-400/50 focus:ring-2 focus:ring-red-400/30'
                            : 'border-white/10 focus:border-salon-gold/50 focus:ring-2 focus:ring-salon-gold/15 focus:shadow-[0_0_25px_rgba(212,168,67,0.08)]'
                        }`}
                        placeholder="Correo o usuario"
                        autoComplete="email"
                      />
                    </div>
                    {emailError && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {emailError}
                      </motion.p>
                    )}
                  </div>

                  {/* ─── Botón Enviar ─── */}
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
                          Generando enlace...
                        </>
                      ) : (
                        <>
                          <Key size={16} />
                          Generar enlace de recuperación
                        </>
                      )}
                    </span>
                  </motion.button>
                </>
              )}

              {/* ─── Volver al login ─── */}
              <div className={`${resetData ? 'mt-2' : 'mt-6'} text-center`}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-salon-gold/70 hover:text-salon-gold transition-colors"
                >
                  <ArrowLeft size={14} />
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </form>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
