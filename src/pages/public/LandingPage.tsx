import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Instagram,
  Facebook,
  Menu,
  Sparkles,
  ArrowRight,
  Scissors,
  Palette,
  Heart,
  Hand,
  ShieldCheck,
  Leaf,
  Smile,
  X,
  Gem,
  Zap,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logoImg from '../../image/logo_salon-removebg-preview2.png';
import imgCorte from '../../image/corte de pelo.jpeg';
import imgColoracion from '../../image/coloracion.jpeg';
import imgManicure from '../../image/manicure.jpeg';
import imgMasajes from '../../image/masajes.jpeg';
import imgCarrucel1 from '../../image/Carrucel/carrucel.jpeg';
import imgCarrucel2 from '../../image/Carrucel/carrucel2.jpeg';
import imgCarrucel3 from '../../image/Carrucel/carrucel3.jpeg';
import imgCarrucel4 from '../../image/Carrucel/carrucel4.jpeg';
import imgCarrucelHero from '../../image/Carrucel/image-hero.jpeg';
import imgADCortes from '../../image/antes-despues/cortes.jpeg';
import imgADCabello from '../../image/antes-despues/cabello.jpeg';
import imgADUnas from '../../image/antes-despues/uñas.jpeg';
import imgCortePixie from '../../image/cotes_de_cabello/corte pixie.jpeg';
import imgCorteBob from '../../image/cotes_de_cabello/corte bob.jpeg';
import imgCorteEnV from '../../image/cotes_de_cabello/corte en v.jpeg';
import imgCorteDegradado from '../../image/cotes_de_cabello/corte degradado.jpeg';
import imgCorteEnCapas from '../../image/cotes_de_cabello/corte en capas.jpeg';
import imgCorteRecto from '../../image/cotes_de_cabello/corte recto.jpeg';
import imgCejasCurvas from '../../image/cejas_pestañas/cejas_curvas.jpeg';
import imgCejasArqueadas from '../../image/cejas_pestañas/cejas_arqueadas.jpeg';
import imgCejasRectas from '../../image/cejas_pestañas/cejas_rectas.jpeg';
import imgPestanasVolumen from '../../image/cejas_pestañas/pestañas_volumen.jpeg';
import imgPestanasEfectoRimel from '../../image/cejas_pestañas/pestañas_efecto_rimel.jpeg';
import imgPestanasClasicas from '../../image/cejas_pestañas/pestañas_clasicas.jpeg';
// ── Coloración ──
import imgColoracionBalayage from '../../image/coloracion/coloracion_balayage.jpeg';
import imgColoracionFantasia from '../../image/coloracion/coloracion_fantasia.jpeg';
import imgColoracionOmbre from '../../image/coloracion/coloracion_ombré.jpeg';
import imgColoracionPermanente from '../../image/coloracion/coloracion_permanente.jpeg';
import imgColoracionSemipermanente from '../../image/coloracion/coloracion_semipermanente.jpeg';
import imgColoracionTemporal from '../../image/coloracion/coloracion_temporal.jpeg';
// ── Uñas ──
import imgUnasAcrilicas from '../../image/uñas/uñas_acrilicas.jpeg';
import imgUnasEnGel from '../../image/uñas/uñas_en_gel.jpeg';
import imgUnasNaturales from '../../image/uñas/uñas_naturales.jpeg';
import imgUnasPersonalisadas from '../../image/uñas/uñas_personalisadas.jpeg';
import imgUnasPolygel from '../../image/uñas/uñas_polygel.jpeg';
import imgUnasPressOn from '../../image/uñas/uñas_press_on.jpeg';
// ── Masajes ──
import imgMasajesPiedraCaliente from '../../image/masajes/masajes_piedra_caliente.jpeg';
import imgMasajesRelajantes from '../../image/masajes/masajes_relajantes.jpeg';
import imgMasajesTerapeuticos from '../../image/masajes/masajes_terapeuticos.jpeg';

// ─── Constantes a nivel módulo (evitan recreación en cada render) ──
const AD_ITEMS = [
  { name: 'Corte & Peinado', img: imgADCortes },
  { name: 'Coloración', img: imgADCabello },
  { name: 'Manicure Spa', img: imgADUnas },
];

const VALORES_ITEMS = [
  { icon: ShieldCheck, title: 'Profesionales Certificados', desc: 'Equipo con formación continua y años de experiencia en las últimas técnicas de belleza.' },
  { icon: Leaf, title: 'Productos Premium', desc: 'Trabajamos con marcas de alta calidad, veganas y libres de crueldad animal.' },
  { icon: Smile, title: 'Atención Personalizada', desc: 'Cada clienta es única. Escuchamos tus necesidades y adaptamos cada servicio a vos.' },
  { icon: Sparkles, title: 'Resultados que Brillan', desc: 'Nos obsesiona verte salir feliz. Tu satisfacción es nuestra mejor carta de presentación.' },
];

// ─── Animated background blobs ─────────────────────────────────────
function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Blob 1 — Lavanda — esquina sup-izq → centro-derecha */}
      <motion.div
        animate={{ x: [0, 300, 0], y: [0, 200, 0], scale: [1, 1.3, 0.9, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-salon-lavender/28 blur-[90px]"
      />
      {/* Blob 2 — Rosa — sup-derecha → centro-izquierda */}
      <motion.div
        animate={{ x: [0, -350, 0], y: [0, 180, -50, 0], scale: [1, 0.8, 1.2, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
        className="absolute top-20 -right-40 w-[550px] h-[550px] rounded-full bg-salon-pink/25 blur-[100px]"
      />
      {/* Blob 3 — Dorado — centro-izquierda → extremo derecho */}
      <motion.div
        animate={{ x: [0, 500, 200, 0], y: [0, -120, 100, 0], scale: [1, 1.2, 0.85, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
        className="absolute top-[35%] -left-20 w-[400px] h-[400px] rounded-full bg-salon-gold/20 blur-[80px]"
      />
      {/* Blob 4 — Lavanda — inf-der → sup-izquierda */}
      <motion.div
        animate={{ x: [0, -400, -100, 0], y: [0, -250, 50, 0], scale: [1, 0.85, 1.25, 1] }}
        transition={{ duration: 3.25, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
        className="absolute bottom-20 -right-32 w-[500px] h-[500px] rounded-full bg-salon-lavender/25 blur-[90px]"
      />
    </div>
  );
}

const paquetes = [
  { id: 'completo', name: 'Pack Completo', tagline: 'Renovación total', services: ['Corte personalizado', 'Coloración completa', 'Peinado profesional'], originalPrice: 78000, price: 65000, badge: 'Más popular', gradient: 'from-salon-gold to-salon-pink', discount: 17, Icon: Gem },
  { id: 'novia', name: 'Pack Novia', tagline: 'Brillá en tu gran día', services: ['Maquillaje profesional', 'Peinado de novia', 'Manicure gel', 'Pedicure spa'], originalPrice: 120000, price: 95000, badge: 'Premium', gradient: 'from-salon-pink to-salon-lavender', discount: 21, Icon: Heart },
  { id: 'spa', name: 'Pack Relax', tagline: 'Desconectate por un día', services: ['Masaje descontracturante', 'Manicure spa', 'Pedicure spa', 'Mascarilla facial'], originalPrice: 90000, price: 72000, badge: 'Mejor valorado', gradient: 'from-salon-lavender to-salon-cream', discount: 20, Icon: Sparkles },
  { id: 'express', name: 'Pack Express', tagline: 'Rápido y perfecto', services: ['Corte', 'Blower', 'Cejas', 'Café + Lunch incluido'], originalPrice: 45000, price: 38000, badge: 'Económico', gradient: 'from-salon-cream to-salon-gold', discount: 16, Icon: Zap },
];

// Mapa nombre → imagen para servicios dinámicos
const nameToImage: Record<string, string> = {
  'Corte Pixie': imgCortePixie,
  'Corte Bob': imgCorteBob,
  'Corte en V': imgCorteEnV,
  'Corte Degradado': imgCorteDegradado,
  'Corte en Capas': imgCorteEnCapas,
  'Corte Recto': imgCorteRecto,
  'Cejas Curvas': imgCejasCurvas,
  'Cejas Arqueadas': imgCejasArqueadas,
  'Cejas Rectas': imgCejasRectas,
  'Pestañas Clásicas': imgPestanasClasicas,
  'Pestañas Volumen': imgPestanasVolumen,
  'Pestañas Efecto Rímel': imgPestanasEfectoRimel,
  'Coloración Permanente': imgColoracionPermanente,
  'Coloración Semipermanente': imgColoracionSemipermanente,
  'Coloración Temporal': imgColoracionTemporal,
  'Balayage': imgColoracionBalayage,
  'Ombré': imgColoracionOmbre,
  'Fantasía': imgColoracionFantasia,
  'Uñas Acrílicas': imgUnasAcrilicas,
  'Uñas en Gel': imgUnasEnGel,
  'Uñas Naturales': imgUnasNaturales,
  'Uñas Personalizadas': imgUnasPersonalisadas,
  'Uñas Polygel': imgUnasPolygel,
  'Uñas Press On': imgUnasPressOn,
  'Manicure Clásico': imgUnasAcrilicas,
  'Masajes Relajantes': imgMasajesRelajantes,
  'Masajes Terapéuticos': imgMasajesTerapeuticos,
  'Masajes Piedra Caliente': imgMasajesPiedraCaliente,
};

/** Imagen de respaldo según categoría (cuando el servicio no tiene foto propia) */
const categoryFallback: Record<string, string> = {
  'cortes': imgCorte,
  'cejas': imgCejasCurvas,
  'coloracion': imgColoracion,
  'uñas': imgManicure,
  'masajes': imgMasajes,
};

/** Obtiene la imagen para un servicio: foto propia → imagen de categoría → genérica */
function getServicioImagen(nombre: string, categoria: string): string {
  if (nameToImage[nombre]) return nameToImage[nombre];
  if (categoryFallback[categoria]) return categoryFallback[categoria];
  return imgMasajes; // fallback genérico (spa/belleza)
}

const heroSlides = [
  { img: imgCarrucel1, title: 'Herramientas Profesionales', subtitle: 'Equipamiento premium para resultados impecables' },
  { img: imgCarrucel2, title: 'Confianza Natural', subtitle: 'Realzamos tu belleza única con estilo propio' },
  { img: imgCarrucel3, title: 'Estilizado Creativo', subtitle: 'Peinados que expresan tu personalidad' },
  { img: imgCarrucel4, title: 'Color & Estilo', subtitle: 'Tendencias que marcan la diferencia' },
  { img: imgCarrucelHero, title: 'Brillo & Movimiento', subtitle: 'Cabello radiante con cuidado profesional' },
];

const heroIcons = [Scissors, Eye, Palette, Gem, Hand, Heart];
const iconLabels = ['Cortes', 'Cejas y Pestañas', 'Coloración', 'Uñas', 'Masaje', 'Cuidado'];

// ─── Contador animado de precios ────────────────────────────
function PriceCounter({ value, isActive, className }: { value: number; isActive: boolean; className?: string }) {
  const [display, setDisplay] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!isActive) { setDisplay(0); return; }
    let current = 0;
    const step = Math.max(1, Math.floor(value / 50));
    intervalRef.current = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplay(value);
        clearInterval(intervalRef.current);
      } else {
        setDisplay(current);
      }
    }, 16);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, value]);

  return <span className={className}>{display.toLocaleString('es-CO')}</span>;
}

// ─── Hero card con tilt magnético 3D ────────────────────────
function HeroPackCard({ sectionVisible, onSelect }: { sectionVisible: boolean; onSelect: (name: string) => void }) {
  const hero = paquetes[0];
  const heroMouseX = useMotionValue(0.5);
  const heroMouseY = useMotionValue(0.5);
  const rotX = useSpring(useTransform(heroMouseY, [0, 1], [4, -4]), { stiffness: 100, damping: 20 });
  const rotY = useSpring(useTransform(heroMouseX, [0, 1], [-4, 4]), { stiffness: 100, damping: 20 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        heroMouseX.set((e.clientX - r.left) / r.width);
        heroMouseY.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { heroMouseX.set(0.5); heroMouseY.set(0.5); }}
      style={{ perspective: 1200, rotateX: rotX, rotateY: rotY }}
      className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.07] hover:border-salon-gold/50 hover:shadow-[0_0_25px_rgba(212,168,67,0.3)] transition-all duration-300"
    >
      {/* Brillo magnético que sigue al mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [heroMouseX, heroMouseY],
            ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(212,168,67,0.08) 0%, transparent 60%)`
          )
        }}
      />

      <div className="relative z-10 p-6 lg:p-8">
        {/* Badge + título */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="inline-block mb-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full bg-gradient-to-r from-salon-gold to-salon-pink text-black shadow-lg">
              {hero.badge}
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold inline-flex items-center gap-2"><hero.Icon size={26} strokeWidth={1.5} /> {hero.name}</h3>
            <p className="text-sm italic mt-0.5">{hero.tagline}</p>
          </div>
        </div>

        {/* Servicios en fila visual */}
        <div className="flex flex-wrap gap-3 mb-6">
          {hero.services.map((svc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-salon-gold" />
              <span className="text-xs text-white/80 font-medium">{svc}</span>
            </motion.div>
          ))}
        </div>

        {/* Precio comparativo */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-1">Precio individual</p>
            <span className="text-sm text-white/70 line-through">${hero.originalPrice.toLocaleString('es-CO')}</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-widest mb-1">Precio pack</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-salon-gold to-salon-pink bg-clip-text text-transparent leading-none">
                $<PriceCounter value={hero.price} isActive={sectionVisible} />
              </span>
              <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
                -{Math.round((1 - hero.price / hero.originalPrice) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Barra visual de ahorro */}
        <div className="mt-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(1 - hero.price / hero.originalPrice) * 100}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-salon-gold to-salon-pink"
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/70 mt-1">
          <span>$0</span>
          <span>Ahorras ${(hero.originalPrice - hero.price).toLocaleString('es-CO')}</span>
          <span>${hero.originalPrice.toLocaleString('es-CO')}</span>
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelect(hero.name)}
          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(212,168,67,0.4)] transition-all duration-300 active:scale-[0.98]"
        >
          <span className="inline-flex items-center justify-center gap-2"><ArrowRight size={14} /> Lo quiero</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [heroSlide, setHeroSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const secRef = useRef<HTMLDivElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setSectionVisible(true);
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── Auto-advance hero carousel ──────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Glow principal — más suave, con inercia
  const springX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18 });
  // Glow secundario — más rápido, sigue de cerca al cursor
  const fastX = useSpring(mouseX, { stiffness: 200, damping: 25 });
  const fastY = useSpring(mouseY, { stiffness: 200, damping: 25 });
  // Pulsación del glow
  const glowPulse = useSpring(1, { stiffness: 80, damping: 20 });

  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
    // Pulsación — limpia el timer anterior para no acumular
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    glowPulse.set(1.25);
    pulseTimer.current = setTimeout(() => glowPulse.set(1), 200);
  }, [mouseX, mouseY, glowPulse]);


  // ─── Formulario de citas (modal) ────────────────────────────────
  const [servicios, setServicios] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<{ cat_id: number; cat_nombre: string; cat_slug: string; cat_icono?: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    cli_nombre: '', cli_telefono: '', cit_fecha: '', cit_hora: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  
  // Multi-servicio público
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Set<number>>(new Set());
  const [bloquesDisponibles, setBloquesDisponibles] = useState<string[] | null>(null);
  const [bloquesOcupados, setBloquesOcupados] = useState<{ cit_hora: string; cit_hora_fin: string; duracion_total: number }[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [clientSearchResults, setClientSearchResults] = useState<any[]>([]);
  const [clientSearching, setClientSearching] = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [phoneAutoFilled, setPhoneAutoFilled] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const nowH = new Date().getHours();

  // Horario del salón: Lun-Vie 9-20, Sáb 9-18, Dom cerrado
  const getDiaSemana = (fecha: string) => new Date(fecha + 'T00:00:00').getDay(); // 0=Dom



  // ─── Duración y precio total de servicios seleccionados ──
  const agendarDuracionTotal = useMemo(() => {
    let total = 0;
    for (const sid of serviciosSeleccionados) {
      const s = servicios.find((sv: any) => sv.ser_id === sid);
      if (s) total += s.ser_duracion || 60;
    }
    return total;
  }, [serviciosSeleccionados, servicios]);

  const agendarPrecioTotal = useMemo(() => {
    let total = 0;
    for (const sid of serviciosSeleccionados) {
      const s = servicios.find((sv: any) => sv.ser_id === sid);
      if (s) total += Number(s.ser_precio);
    }
    return total;
  }, [serviciosSeleccionados, servicios]);

  // ─── Helpers para restricción por categoría ──
  // Reglas: cuántos servicios se pueden elegir por grupo de restricción.
  // 'cejas' se subdivide en 'ceja' y 'pestaña' (1 cada uno) porque
  // están en una misma categoría pero es lógico agendar 1 de cada tipo.
  const CATEGORY_LIMITS: Record<string, number> = {
    'cortes': 1,
    'coloracion': 1,
    'uñas': 1,
    'packs': 1,
    'tratamientos_capilares': 1,
    'masajes': Infinity,
  };

  const getRestrictionGroup = (servicio: any): string => {
    const cat = servicio.ser_categoria || '';
    if (cat === 'cejas') {
      const nombre = (servicio.ser_nombre || '').toLowerCase();
      if (nombre.includes('pestaña')) return 'cejas_pestanas';
      if (nombre.includes('ceja')) return 'cejas_cejas';
      return 'cejas_other';
    }
    return cat;
  };

  const toggleServicioPublic = (id: number) => {
    setServiciosSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      // Verificar límite del grupo de restricción
      const srv = servicios.find((s: any) => s.ser_id === id);
      if (srv) {
        const group = getRestrictionGroup(srv);
        const max = CATEGORY_LIMITS[group] ?? 1;
        if (max !== Infinity) {
          let count = 0;
          for (const sid of prev) {
            const s = servicios.find((sv: any) => sv.ser_id === sid);
            if (s && getRestrictionGroup(s) === group) count++;
          }
          if (count >= max) return prev;
        }
      }
      next.add(id);
      return next;
    });
    setFormData(f => ({ ...f, cit_hora: '' }));
  };

  const timeSlots = useMemo(() => {
    if (!formData.cit_fecha) return [];
    const dia = getDiaSemana(formData.cit_fecha);
    if (dia === 0) return [];
    const maxH = dia === 6 ? 18 : 20;
    const minMins = formData.cit_fecha === today ? (nowH + 1) * 60 : 9 * 60;
    const slots: { hora: string; disponible: boolean; ocupado: boolean }[] = [];
    for (let m = 9 * 60; m < maxH * 60; m += 30) {
      const hora = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      if (agendarDuracionTotal > 0 && bloquesDisponibles && bloquesDisponibles.length > 0) {
        const libre = bloquesDisponibles.includes(hora);
        slots.push({ hora, disponible: m >= minMins && libre, ocupado: !libre });
      } else if (agendarDuracionTotal > 0 && bloquesDisponibles && bloquesDisponibles.length === 0) {
        // No hay bloques disponibles para esta duración
        slots.push({ hora, disponible: false, ocupado: true });
      } else if (agendarDuracionTotal > 0 && bloquesDisponibles === null) {
        // Cargando disponibilidad — no mostrar como seleccionable
        slots.push({ hora, disponible: false, ocupado: false });
      } else if (bloquesOcupados.length > 0) {
        const enBloque = bloquesOcupados.some((b: any) => {
          const [bhh, bmm] = b.cit_hora.split(':').map(Number);
          const [fhh, fmm] = b.cit_hora_fin.split(':').map(Number);
          const inicio = bhh * 60 + bmm;
          const fin = fhh * 60 + fmm;
          return m >= inicio && m < fin;
        });
        slots.push({ hora, disponible: m >= minMins && !enBloque, ocupado: enBloque });
      } else {
        const ocupado = ocupados.some(o => {
          const [hh, mm] = o.split(':');
          return `${hh.padStart(2, '0')}:${(mm || '00').padStart(2, '0')}` === hora;
        });
        slots.push({ hora, disponible: m >= minMins, ocupado });
      }
    }
    return slots;
  }, [formData.cit_fecha, ocupados, bloquesDisponibles, bloquesOcupados, agendarDuracionTotal, today, nowH]);

  const normalizarHora = (h: string) => {
    const [hh, mm] = h.split(':');
    return `${hh.padStart(2, '0')}:${(mm || '00').padStart(2, '0')}`;
  };

  // ─── Cargar horas ocupadas o bloques disponibles según selección ──
  useEffect(() => {
    if (!formData.cit_fecha) { setOcupados([]); setBloquesDisponibles(null); setBloquesOcupados([]); return; }
    // Siempre cargar bloques ocupados para mostrar rangos ocupados en la cuadrícula
    api.get(`/api/citas/bloques-ocupados?fecha=${formData.cit_fecha}`)
      .then(res => setBloquesOcupados(res.data?.bloques || []))
      .catch(() => setBloquesOcupados([]));
    if (agendarDuracionTotal > 0) {
      api.get(`/api/citas/bloques-disponibles?fecha=${formData.cit_fecha}&duracion=${agendarDuracionTotal}`)
        .then(res => {
          const disponibles = (res.data?.disponibles || []).map((h: string) => normalizarHora(h).slice(0, 5));
          setBloquesDisponibles(disponibles.length > 0 ? disponibles : []);
        })
        .catch(() => {
          // Fallback: si el endpoint falla, marcar como null (cargando/error)
          setBloquesDisponibles(null);
        });
    } else {
      setBloquesDisponibles(null);
      api.get(`/api/citas/ocupados?fecha=${formData.cit_fecha}`)
        .then(res => setOcupados((res.data.ocupados || []).map((h: string) => normalizarHora(h).slice(0, 5))))
        .catch(() => setOcupados([]));
    }
  }, [formData.cit_fecha, agendarDuracionTotal]);

  // ─── Abrir modal con pack pre-seleccionado ──────────────────────
  const openModalWithPack = (packName: string) => {
    const packService = servicios.find((s: any) =>
      s.ser_nombre.toLowerCase().includes(packName.toLowerCase())
    );
    if (packService) {
      // Para packs, seleccionamos ese único servicio (reset previa selección)
      setServiciosSeleccionados(new Set([packService.ser_id]));
    }
    setModalOpen(true);
  };

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // ─── Servicios agrupados por categoría desde la API ──
  const serviciosPorCategoria = useMemo(() => {
    const grouped: Record<string, { name: string; image: string; price: number; desc: string }[]> = {};
    for (const s of servicios) {
      const cat: string = s.ser_categoria || 'otros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        name: s.ser_nombre,
        image: getServicioImagen(s.ser_nombre, cat),
        price: s.ser_precio,
        desc: s.ser_descripcion || '',
      });
    }
    return grouped;
  }, [servicios]);

  useEffect(() => {
    api.get('/api/servicios/public').then(res => setServicios(res.data)).catch(() => {});
    api.get('/api/categorias/').then(res => setCategorias(res.data || [])).catch(() => {});
  }, []);

  // ─── Categorías para filtrar servicios ────────────────────────
  const categoryMap = [
    { keywords: ['corte'], label: 'Cortes', section: 'servicios', image: imgCorte },
    { keywords: ['ceja', 'pestaña'], label: 'Cejas y Pestañas', section: 'servicios', image: imgCejasCurvas },
    { keywords: ['color', 'tinte', 'mecha', 'coloración'], label: 'Coloración', section: 'servicios', image: imgColoracion },
    { keywords: ['uña', 'manicure'], label: 'Uñas / Manicure', section: 'servicios', image: imgManicure },
    { keywords: ['masaje'], label: 'Masajes', section: 'servicios', image: imgMasajes },
    { keywords: [], label: 'Cuidado', section: 'banners', image: null as string | null },
  ];

  // ─── Bloquear scroll del body/html cuando cualquier modal está abierto ──
  useEffect(() => {
    const serviciosOpen = selectedCategory !== null && categoryMap[selectedCategory].keywords.length > 0;
    if (modalOpen || serviciosOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (!modalOpen) setFormStatus('idle');
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [modalOpen, selectedCategory]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStatus === 'loading') return; // evitar doble envío
    setFormError('');
    setFormStatus('loading');

    // ── Validación: nombre requerido ──
    if (!formData.cli_nombre.trim()) {
      setFormError('El nombre es requerido');
      setFormStatus('idle');
      return;
    }

    // ── Validación: teléfono 10 dígitos ──
    if (formData.cli_telefono.length !== 10) {
      setFormError('El teléfono debe tener exactamente 10 dígitos');
      setFormStatus('idle');
      return;
    }

    // ── Validación: al menos un servicio seleccionado ──
    if (serviciosSeleccionados.size === 0) {
      setFormError('Debe seleccionar al menos un servicio');
      setFormStatus('idle');
      return;
    }

    // ── Validación: no exceder límites por grupo (ya se valida en toggleServicioPublic) ──

    // ── Validación: fecha requerida ──
    if (!formData.cit_fecha) {
      setFormError('Debe seleccionar una fecha');
      setFormStatus('idle');
      return;
    }

    // ── Validación: hora requerida ──
    if (!formData.cit_hora) {
      setFormError('Debe seleccionar una hora');
      setFormStatus('idle');
      return;
    }



    try {
      const detalle = Array.from(serviciosSeleccionados).map(sid => ({
        servicio_id: sid,
        precio: servicios.find((s: any) => s.ser_id === sid)?.ser_precio || 0
      }));
      await api.post('/api/citas/public', {
        cli_nombre: formData.cli_nombre,
        cli_telefono: formData.cli_telefono,
        cit_fecha: formData.cit_fecha,
        cit_hora: formData.cit_hora + ':00',
        detalle
      });
      setFormStatus('success');
      setFormData({ cli_nombre: '', cli_telefono: '', cit_fecha: '', cit_hora: '' });
      setServiciosSeleccionados(new Set());
      setCategoriaActiva(null);
    } catch (err: any) {
      const status = err?.response?.status;
      const backendError = err?.response?.data?.error;
      if (status === 429) {
        setFormError('Has superado el límite de solicitudes. Intenta más tarde.');
      } else if (backendError) {
        setFormError(backendError);
      } else {
        setFormError('Error al enviar la solicitud. Intente de nuevo.');
      }
      setFormStatus('error');
    }
  };

  // ─── Parallax del hero ──────────────────────────────────────────
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.08]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0610] via-black to-[#10071a] text-white overflow-x-hidden relative" onMouseMove={handleMouseMove}>

      {/* ─── Animated border keyframes ─── */}
      <style>{`
        @property --border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-rotate {
          to { --border-angle: 360deg; }
        }
        .animate-border-glow {
          background: conic-gradient(from var(--border-angle), #d4a843, #e8a0bf, #b8a0dc, #e8a0bf, #d4a843);
          animation: border-rotate 3s linear infinite;
        }
        .modal-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
        }
      `}</style>

      <BackgroundBlobs />

      {/* Cursor glow — capa dorada grande con inercia */}
      <motion.div
        style={{ x: springX, y: springY, scale: glowPulse, willChange: 'transform' }}
        className="fixed pointer-events-none w-[350px] h-[350px] rounded-full bg-salon-gold/8 blur-[80px] -translate-x-1/2 -translate-y-1/2 z-0"
        aria-hidden="true"
      />
      {/* Cursor glow — capa rosa rápida */}
      <motion.div
        style={{ x: fastX, y: fastY, willChange: 'transform' }}
        className="fixed pointer-events-none w-[120px] h-[120px] rounded-full bg-salon-rose/15 blur-[35px] -translate-x-1/2 -translate-y-1/2 z-0"
        aria-hidden="true"
      />

      {/* ════════════════════════════════════════
          Navbar
          ════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-lg border-b border-salon-gold/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 h-14 lg:h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 shrink-0"
          >
            <img src={logoImg} alt="Eliza Style" className="w-11 h-11 lg:w-14 lg:h-14 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm lg:text-base tracking-tight">
                Eliza <span className="bg-gradient-to-r from-salon-gold via-salon-cream to-salon-gold bg-clip-text text-transparent">Style</span>
              </span>
              <span className="text-[9px] lg:text-[10px] text-salon-gold/60 tracking-[0.25em] uppercase mt-0.5">
                Belleza & Spa
              </span>
            </div>
          </motion.div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest text-white/50">
            <a href="#servicios" className="relative hover:text-salon-gold transition-colors pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-salon-gold after:transition-all hover:after:w-full">Servicios</a>
            <a href="#destacados" className="relative hover:text-salon-gold transition-colors pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-salon-gold after:transition-all hover:after:w-full">Galería</a>
            <a href="#banners" className="relative hover:text-salon-gold transition-colors pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-salon-gold after:transition-all hover:after:w-full">Filosofía</a>
          </div>

          {/* Right side: CTA button + mobile hamburger */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Agenda tu cita — botón destacado */}
            <button
              onClick={() => setModalOpen(true)}
              className="relative text-[10px] md:text-xs px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-salon-pink via-salon-gold to-salon-pink bg-[length:200%_100%] animate-gradient-x text-black font-bold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(212,168,67,0.5)] hover:scale-[1.05] active:scale-[0.97] transition-all duration-300 overflow-hidden group/btn hidden md:inline-flex"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
              <span className="relative z-10 whitespace-nowrap">
                <span className="hidden lg:inline">AGENDA TU CITA YA!</span>
                <span className="lg:hidden">AGENDAR</span>
              </span>
            </button>

            <Link
              to="/login"
              className="relative text-xs px-4 py-2 rounded-full bg-salon-gold text-black font-bold hover:shadow-[0_0_20px_rgba(212,168,67,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 overflow-hidden group/btn hidden lg:inline-flex"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
              <span className="relative z-10">Iniciar Sesión</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="lg:hidden overflow-hidden border-t border-salon-gold/10 bg-black/80 backdrop-blur-lg"
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            <a
              href="#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-white/60 hover:text-salon-gold transition-colors py-2.5"
            >
              Servicios
            </a>
            <a
              href="#destacados"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-white/60 hover:text-salon-gold transition-colors py-2.5"
            >
              Galería
            </a>
            <a
              href="#banners"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-white/60 hover:text-salon-gold transition-colors py-2.5"
            >
              Filosofía
            </a>
            {/* Separador */}
            <div className="h-px bg-gradient-to-r from-transparent via-salon-gold/30 to-transparent my-3" />

            {/* Botón agendar en mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTimeout(() => setModalOpen(true), 200);
              }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-salon-pink via-salon-gold to-salon-pink bg-[length:200%_100%] animate-gradient-x text-black font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(212,168,67,0.3)]"
            >
              AGENDA TU CITA YA!
            </button>

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-full bg-salon-gold text-black font-bold text-sm text-center hover:shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ════════════════════════════════════════
          Hero — Carrusel de imágenes
          ════════════════════════════════════════ */}
      <section className="relative h-[55vh] min-h-[380px] max-h-[550px] overflow-hidden mt-12 lg:mt-16">
        <div className="relative h-full overflow-hidden bg-black">
          {/* Slides del carrusel */}
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === heroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="w-full h-full object-cover scale-110"
                />
              </motion.div>
            </div>
          ))}

          {/* Overlay gradiente común para todas las slides */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-20 pointer-events-none" />

          {/* Partículas doradas flotantes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{ y: [-20, 20, -20], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4 + i * 1.5, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
              className="absolute w-1 h-1 rounded-full bg-salon-gold/60 shadow-[0_0_6px_rgba(212,168,67,0.5)] z-20"
              style={{ top: `${15 + i * 10}%`, left: `${55 + i * 12}%` }}
            />
          ))}

          {/* Orbes decorativos animados */}
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -25, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            style={{ willChange: 'transform' }}
            className="absolute top-20 left-20 w-80 h-80 bg-salon-pink/30 rounded-full blur-2xl z-20"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            style={{ willChange: 'transform' }}
            className="absolute bottom-10 right-20 w-60 h-60 bg-salon-lavender/25 rounded-full blur-2xl z-20"
          />
          <motion.div
            animate={{ x: [0, 25, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{ willChange: 'transform' }}
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-salon-gold/12 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 z-20"
          />

          {/* Contenido del hero — cambia con cada slide */}
          <div className="absolute inset-0 flex items-center z-30">
            <div className="max-w-7xl mx-auto px-6 lg:px-20 w-full">
              <div className="max-w-xl">
                <motion.h2
                  key={`title-${heroSlide}`}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl lg:text-5xl font-bold leading-tight tracking-tight"
                >
                  {heroSlides[heroSlide].title.split(' ').map((word, i, arr) => (
                    <span key={i}>
                      {i < arr.length - 1 ? (
                        <span>{word} </span>
                      ) : (
                        <span className="bg-gradient-to-r from-salon-gold via-salon-cream to-salon-gold bg-clip-text text-transparent">{word}</span>
                      )}
                    </span>
                  ))}
                </motion.h2>

                <motion.p
                  key={`sub-${heroSlide}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="text-white/60 text-sm max-w-md leading-relaxed mt-3"
                >
                  {heroSlides[heroSlide].subtitle}
                </motion.p>

                <div className="flex items-center gap-3 mt-6">
                  <a
                    href="#destacados"
                    className="relative flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-salon-gold via-salon-gold to-salon-pink text-black text-sm font-semibold hover:shadow-[0_0_30px_rgba(212,168,67,0.4)] transition-all overflow-hidden group/cta"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10 flex items-center gap-2">
                      Explorar servicios
                      <ArrowRight size={14} />
                    </span>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Flechas de navegación */}
          <button
            onClick={() => setHeroSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/60 hover:border-white/20 transition-all"
          >
            <ChevronLeft size={20} className="text-white/80" />
          </button>
          <button
            onClick={() => setHeroSlide(prev => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/60 hover:border-white/20 transition-all"
          >
            <ChevronRight size={20} className="text-white/80" />
          </button>

          {/* Dots indicadores */}
          <div className="absolute bottom-10 left-0 right-0 z-40 flex justify-center gap-2.5">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroSlide(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === heroSlide ? 'bg-salon-gold w-6 h-2' : 'bg-white/30 w-2 h-2 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Indicador de scroll */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30"
          >
            <span className="text-[9px] text-white/30 uppercase tracking-widest">Scroll</span>
            <div className="w-4 h-6 rounded-full border border-white/20 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-white/60"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Hero Icons — Servicios rápidos
          ════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="py-10 px-6 lg:px-20 relative"
      >
        {/* Separador gradiente inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-salon-gold/30 to-transparent" />
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
          {heroIcons.map((Icon, idx) => {
            const cat = categoryMap[idx];
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (cat.keywords.length > 0) {
                    setSelectedCategory(idx);
                  } else {
                    scrollToSection(cat.section);
                  }
                }}
                style={{ willChange: 'transform' }}
                className="flex flex-col items-center gap-3 cursor-pointer group bg-white/[0.03] rounded-2xl border border-white/[0.06] py-6 px-4 hover:bg-white/[0.06] hover:border-salon-pink/20 transition-all duration-300"
              >
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.1] flex items-center justify-center shadow-[0_0_12px_rgba(186,113,162,0.04)] group-hover:bg-salon-pink/20 group-hover:shadow-[0_0_30px_rgba(186,113,162,0.35)] group-hover:border-salon-pink/40 transition-[background,box-shadow,border-color] duration-200">
                  <Icon size={22} className="text-salon-pink/60 group-hover:text-salon-pink transition-colors duration-200" />
                </div>
                <span className="text-xs text-white/50 uppercase tracking-[0.2em] font-medium group-hover:text-white/80 transition-colors duration-200 text-center leading-tight">
                  {iconLabels[idx]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ════════════════════════════════════════
          Paquetes & Combos
          ════════════════════════════════════════ */}
      <motion.section
        id="servicios"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-16 px-6 lg:px-20 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-salon-pink/20 to-transparent" />
        <div ref={secRef} className="max-w-7xl mx-auto">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-salon-gold/10 border border-salon-gold/20 text-salon-gold text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
              <Sparkles size={12} /> Ofertas por tiempo limitado
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-2 leading-tight">
              Paquetes que <span className="bg-gradient-to-r from-salon-gold via-salon-pink to-salon-lavender bg-clip-text text-transparent">brillan</span>
            </h2>
            <p className="text-white/80 text-sm mt-3 max-w-lg mx-auto leading-relaxed font-light">
              Agrupamos nuestros servicios para que disfrutes más por menos
            </p>
          </motion.div>

          {/* ── HERO CARD: Pack Completo ── */}
          <HeroPackCard sectionVisible={sectionVisible} onSelect={openModalWithPack} />

          {/* ── CARDS COMPACTAS: Novia, Relax, Express ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paquetes.slice(1).map((pack, idx) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] hover:border-salon-gold/50 hover:shadow-[0_0_20px_rgba(212,168,67,0.25)] transition-all duration-300"
              >
                {/* Barra superior de color */}
                <div className={`h-1 w-full bg-gradient-to-r ${pack.gradient}`} />

                <div className="p-5">
                  {/* Header compacto */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <pack.Icon size={22} strokeWidth={1.5} className="text-white/80" />
                      <h3 className="text-base font-bold mt-1">{pack.name}</h3>
                      <p className="text-[10px] font-medium uppercase tracking-widest">{pack.badge}</p>
                    </div>
                  </div>

                  {/* Precio grande */}
                  <div className="mb-4">
                    <span className="text-[10px] text-white/70 line-through">${pack.originalPrice.toLocaleString('es-CO')}</span>
                    <div className="text-2xl font-bold">
                      $<PriceCounter value={pack.price} isActive={sectionVisible} />
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      -{Math.round((1 - pack.price / pack.originalPrice) * 100)}%
                    </span>
                  </div>

                  {/* Servicios en pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4 min-h-[2.5rem]">
                    {pack.services.map((svc, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-white/[0.05] rounded-md border border-white/[0.06]">
                        {svc}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => openModalWithPack(pack.name)}
                    className="w-full py-2.5 rounded-xl border border-white/[0.08] text-white/80 text-[11px] font-semibold uppercase tracking-wider hover:bg-white/[0.04] hover:text-white hover:border-white/30 transition-all duration-300 active:scale-95"
                  >
                    Lo quiero
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════
          Antes & Después — Galería
          ════════════════════════════════════════ */}
      <motion.section
        id="destacados"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-16 px-6 lg:px-20 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-salon-gold/20 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-10"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-salon-pink/10 border border-salon-pink/20 text-salon-pink text-[10px] font-bold uppercase tracking-widest mb-3">Resultados Reales</span>
            <h3 className="text-2xl lg:text-3xl font-bold mt-1">Antes & <span className="bg-gradient-to-r from-salon-gold via-salon-pink to-salon-cream bg-clip-text text-transparent">Después</span></h3>
            <p className="text-white/40 text-sm mt-3 max-w-lg mx-auto leading-relaxed font-light">
              Transformaciones que hablan por sí solas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AD_ITEMS.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
              >
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/[0.06] hover:border-salon-rose/20 transition-all duration-300">
                  <div className="overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white/70 text-[9px] uppercase tracking-[0.2em] font-medium px-2.5 py-1 rounded-full">
                      Antes
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-salon-rose/80 backdrop-blur-sm text-white text-[9px] uppercase tracking-[0.2em] font-medium px-2.5 py-1 rounded-full">
                      Después
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <h4 className="font-medium text-sm text-white/80 text-center">{item.name}</h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════
          Valores / Por qué elegirnos
          ════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        id="banners"
        className="py-16 px-6 lg:px-20 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-salon-pink/20 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-salon-pink/10 border border-salon-pink/20 text-salon-pink text-[10px] font-bold uppercase tracking-widest mb-4">
              Nuestra Filosofía
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2">
              Por qué <span className="bg-gradient-to-r from-salon-gold via-salon-pink to-salon-cream bg-clip-text text-transparent">elegirnos</span>
            </h2>
            <p className="text-white/40 text-sm mt-3 max-w-lg mx-auto leading-relaxed font-light">
              Cada detalle pensado para que tu experiencia sea única
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALORES_ITEMS.map((val, idx) => {
              const Icon = val.icon;
              const themes = [
                { bar: 'from-salon-gold/40 via-salon-gold/20 to-transparent', h3: 'text-salon-gold', iconText: 'text-salon-gold', iconBox: 'bg-salon-gold/10 border-salon-gold/20 group-hover:bg-salon-gold/20 group-hover:border-salon-gold/40' },
                { bar: 'from-salon-cream/40 via-salon-cream/20 to-transparent', h3: 'text-salon-cream', iconText: 'text-salon-cream', iconBox: 'bg-salon-cream/10 border-salon-cream/20 group-hover:bg-salon-cream/20 group-hover:border-salon-cream/40' },
                { bar: 'from-[#e09ac8]/40 via-[#e09ac8]/20 to-transparent', h3: 'text-[#e09ac8]', iconText: 'text-[#e09ac8]', iconBox: 'bg-[#e09ac8]/10 border-[#e09ac8]/20 group-hover:bg-[#e09ac8]/20 group-hover:border-[#e09ac8]/40' },
                { bar: 'from-[#e8c86a]/40 via-[#e8c86a]/20 to-transparent', h3: 'text-[#e8c86a]', iconText: 'text-[#e8c86a]', iconBox: 'bg-[#e8c86a]/10 border-[#e8c86a]/20 group-hover:bg-[#e8c86a]/20 group-hover:border-[#e8c86a]/40' },
              ];
              const t = themes[idx];
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="group bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] hover:border-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.04)] p-0 transition-all duration-300"
                >
                  {/* Barra superior de color */}
                  <div className={`h-1 w-full bg-gradient-to-r ${t.bar} rounded-t-2xl`} />

                  <div className="p-6 lg:p-7">
                    <div className={`w-12 h-12 rounded-xl ${t.iconBox} flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300`}>
                      <Icon size={22} className={t.iconText} />
                    </div>
                    <h3 className={`font-semibold ${t.h3} text-base mb-2`}>{val.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed font-light">{val.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>





      {/* ════════════════════════════════════════
          Modal — Formulario de Citas
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Animated gradient border wrapper */}
            <div className="relative w-full max-w-lg rounded-3xl p-[2px] shadow-[0_0_80px_rgba(212,168,67,0.25),0_0_120px_rgba(180,130,220,0.12)] animate-border-glow">

              {/* Modal card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-h-[90vh] overflow-y-auto modal-scroll bg-gradient-to-b from-[#1e1335] via-[#180f2a] to-[#110b1f] rounded-[22px] p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              >
              {/* Decorative glows */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-salon-gold/40 to-transparent" />
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-24 bg-salon-gold/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.07] border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
              >
                <X size={14} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-1 rounded-full bg-salon-gold/15 border border-salon-gold/30 text-salon-gold text-[10px] font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(212,168,67,0.1)]">
                  Agenda tu Cita
                </span>
                <h2 className="text-2xl font-bold">
                  Solicita tu{' '}
                  <span className="bg-gradient-to-r from-salon-gold via-salon-pink to-salon-lavender bg-clip-text text-transparent">cita ahora</span>
                </h2>
                <p className="text-white/50 text-xs mt-2">
                  Déjanos tus datos y te confirmaremos la disponibilidad
                </p>
              </div>

              {formStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-salon-gold/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-salon-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">¡Solicitud enviada!</h3>
                  <p className="text-white/50 text-sm">Te contactaremos pronto para confirmar tu cita.</p>
                  <button
                    onClick={() => { setFormStatus('idle'); setModalOpen(false); }}
                    className="mt-6 px-6 py-2 rounded-full bg-salon-gold text-black text-sm font-semibold hover:bg-salon-gold/90 transition-all"
                  >
                    Cerrar
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {formStatus === 'error' && formError && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {formError}
                    </div>
                  )}
                  {formStatus === 'error' && !formError && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      Error al enviar la solicitud. Intenta de nuevo.
                    </div>
                  )}

                  {/* ── Promociones destacadas ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={13} className="text-salon-gold" />
                      <span className="text-white/70 text-xs font-medium">Promociones destacadas</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {paquetes.map(pack => {
                        const packSvc = servicios.find((s: any) =>
                          s.ser_nombre.toLowerCase().includes(pack.name.toLowerCase())
                        );
                        const isSelected = packSvc && serviciosSeleccionados.has(packSvc.ser_id);
                        return (
                          <button
                            key={pack.id}
                            type="button"
                            onClick={() => {
                              if (packSvc) {
                                setServiciosSeleccionados(new Set([packSvc.ser_id]));
                              }
                              setModalOpen(true);
                            }}
                            className={`text-left p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'border-salon-gold/60 bg-salon-gold/10 shadow-[0_0_15px_rgba(212,168,67,0.2)]'
                                : 'border-white/[0.08] bg-white/[0.03] hover:border-salon-gold/40 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-white text-xs font-bold leading-tight">{pack.name}</span>
                              <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                                -{Math.round((1 - pack.price / pack.originalPrice) * 100)}%
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-white/70 text-xs line-through text-[10px]">
                                ${pack.originalPrice.toLocaleString('es-CO')}
                              </span>
                              <span className="text-salon-gold text-sm font-bold">
                                ${pack.price.toLocaleString('es-CO')}
                              </span>
                            </div>
                            <p className="text-white/40 text-[10px] mt-1">{pack.tagline}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <span className="text-white/40 text-[10px] uppercase tracking-wider">o elige individual</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  </div>

                  {/* ─── ¿Ya eres un cliente? ─── */}
                  <div className="px-3 py-2 rounded-xl bg-salon-gold/5 border border-salon-gold/15">
                    <p className="text-xs text-salon-gold/80 font-medium">👋 ¿Ya eres un cliente?</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Escribe tu nombre para buscar tus datos</p>
                  </div>

                  {/* Nombre con búsqueda */}
                  <div className="relative">
                    <label className="block text-white/70 text-xs mb-1.5 font-medium">Nombre completo</label>
                    <input
                      type="text"
                      required
                      value={formData.cli_nombre}
                      onChange={e => {
                        const val = e.target.value.replace(/[0-9]/g, '');
                        setFormData(f => ({ ...f, cli_nombre: val }));
                        setShowPhoneEdit(false);
                        setPhoneAutoFilled(false);
                        // Búsqueda con debounce
                        if (searchTimer.current) clearTimeout(searchTimer.current);
                        if (val.trim().length >= 2) {
                          setClientSearching(true);
                          searchTimer.current = setTimeout(async () => {
                            try {
                              const res = await api.get(`/api/clientes/public/search?q=${encodeURIComponent(val.trim())}`);
                              setClientSearchResults(res.data || []);
                            } catch (err) { console.error('Error buscando cliente:', err); setClientSearchResults([]); }
                            setClientSearching(false);
                          }, 400);
                        } else {
                          setClientSearchResults([]);
                          setClientSearching(false);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-salon-gold/60 focus:shadow-[0_0_20px_rgba(212,168,67,0.1)] transition-all text-sm"
                      placeholder="Ej: María Pérez"
                      autoComplete="off"
                    />
                    {clientSearching && (
                      <div className="absolute right-3 top-9">
                        <div className="w-4 h-4 border-2 border-salon-gold/40 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {clientSearchResults.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1a1230] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                        {clientSearchResults.map(cli => (
                          <button
                            key={cli.cli_id}
                            type="button"
                            onClick={() => {
                              setFormData(f => ({ ...f, cli_nombre: cli.cli_nombre + (cli.cli_apellido ? ` ${cli.cli_apellido}` : ''), cli_telefono: cli.cli_telefono }));
                              setClientSearchResults([]);
                              setShowPhoneEdit(false);
                              setPhoneAutoFilled(true);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <span className="font-medium">{cli.cli_nombre} {cli.cli_apellido}</span>
                            <span className="text-white/30 ml-2">{cli.cli_telefono}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-white/70 text-xs mb-1.5 font-medium">Teléfono</label>
                      {formData.cli_telefono && !showPhoneEdit && (
                        <button
                          type="button"
                          onClick={() => { setShowPhoneEdit(true); setPhoneAutoFilled(false); }}
                          className="text-[10px] text-salon-gold/60 hover:text-salon-gold transition-colors"
                        >
                          ¿Cambiaste de número?
                        </button>
                      )}
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      value={formData.cli_telefono}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(f => ({ ...f, cli_telefono: val }));
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-salon-gold/60 focus:shadow-[0_0_20px_rgba(212,168,67,0.1)] transition-all text-sm"
                      placeholder="300 123 4567"
                      readOnly={phoneAutoFilled && !showPhoneEdit}
                    />
                  </div>

                  {/* ─── Selector por categorías ─── */}
                  <div>
                    <label className="block text-white/70 text-xs mb-2 font-medium">Servicios</label>

                    {/* Tarjetas de categorías (desde API) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {(() => {
                        const ICON_MAP: Record<string, any> = { Scissors, Eye, Palette, Gem, Hand, Sparkles, Star, Heart, Zap, Leaf, Sun, Moon };
                        return categorias.filter(c =>
                          servicios.some((s: any) => s.ser_categoria === c.cat_slug)
                        ).map(cat => {
                          const activa = categoriaActiva === cat.cat_nombre;
                          const Icon = ICON_MAP[cat.cat_icono || ''] || Sparkles;
                          return (
                            <button
                              key={cat.cat_id}
                              type="button"
                              onClick={() => setCategoriaActiva(activa ? null : cat.cat_nombre)}
                              className={`group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                                activa
                                  ? 'bg-salon-gold/12 border-salon-gold/40 text-salon-gold shadow-[0_0_15px_rgba(212,168,67,0.12)]'
                                  : 'bg-white/[0.04] border-white/10 text-white/50 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                              }`}
                            >
                              <Icon size={22} className="text-salon-pink/60 group-hover:text-salon-pink transition-colors duration-200" />
                              <span className="text-[11px] font-medium text-center leading-tight">{cat.cat_nombre}</span>
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* Servicios de la categoría activa */}
                    {categoriaActiva && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {servicios
                          .filter((s: any) => {
                            const cat = categorias.find(c => c.cat_nombre === categoriaActiva);
                            if (!cat) return false;
                            return s.ser_categoria === cat.cat_slug;
                          })
                          .map((s: any) => {
                            const selected = serviciosSeleccionados.has(s.ser_id);
                            const group = getRestrictionGroup(s);
                            const max = CATEGORY_LIMITS[group] ?? 1;
                            let countEnGrupo = 0;
                            for (const sid of serviciosSeleccionados) {
                              const sv = servicios.find((sv2: any) => sv2.ser_id === sid);
                              if (sv && getRestrictionGroup(sv) === group) countEnGrupo++;
                            }
                            const bloqueado = !selected && max !== Infinity && countEnGrupo >= max;
                            return (
                              <button
                                key={s.ser_id}
                                type="button"
                                onClick={() => bloqueado ? null : toggleServicioPublic(s.ser_id)}
                                title={bloqueado ? `Ya seleccionaste el máximo de ${s.ser_nombre}` : s.ser_nombre}
                                className={`text-left p-3 rounded-xl border text-sm transition-all ${
                                  selected
                                    ? 'border-salon-gold/60 bg-salon-gold/10 text-salon-gold shadow-[0_0_10px_rgba(212,168,67,0.15)]'
                                    : bloqueado
                                      ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed'
                                      : 'border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30 hover:text-white/80'
                                }`}
                              >
                                <div className="font-medium text-[13px] leading-tight">{s.ser_nombre}</div>
                                <div className="flex justify-between mt-1.5 text-[11px] opacity-70">
                                  <span>{s.ser_duracion || 60}min</span>
                                  <span>${Number(s.ser_precio).toLocaleString('es-CO')}</span>
                                </div>
                                {bloqueado && (
                                  <div className="mt-1 text-[10px] text-white/20">Ya seleccionaste un servicio de esta categoría</div>
                                )}
                              </button>
                            );
                          })}
                        {servicios.filter((s: any) => {
                          const cat = categoryMap.find(c => c.label === categoriaActiva);
                          if (!cat) return false;
                          return cat.keywords.some(kw => s.ser_nombre?.toLowerCase().includes(kw));
                        }).length === 0 && (
                          <div className="col-span-2 py-6 text-center text-white/30 text-xs">
                            No hay servicios disponibles en esta categoría
                          </div>
                        )}
                      </div>
                    )}

                    {/* Servicios seleccionados como tags */}
                    {serviciosSeleccionados.size > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Array.from(serviciosSeleccionados).map(sid => {
                          const s = servicios.find((sv: any) => sv.ser_id === sid);
                          if (!s) return null;
                          return (
                            <span
                              key={sid}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-salon-gold/10 border border-salon-gold/20 text-salon-gold text-[10px] font-medium"
                            >
                              {s.ser_nombre}
                              <button
                                type="button"
                                onClick={() => toggleServicioPublic(sid)}
                                className="hover:text-white transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Resumen */}
                    {serviciosSeleccionados.size > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-salon-gold/5 border border-salon-gold/15 text-xs">
                        <span className="text-white/60">
                          {serviciosSeleccionados.size} servicio{serviciosSeleccionados.size > 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/50">{agendarDuracionTotal}min</span>
                          <span className="text-salon-gold font-semibold">${agendarPrecioTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Info de bloques */}
                    {formData.cit_fecha && agendarDuracionTotal > 0 && (
                      <div className="mt-2 px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/15 text-[11px] text-blue-300/70">
                        Bloque de <strong>{agendarDuracionTotal} min</strong> —{' '}
                        {bloquesDisponibles && bloquesDisponibles.length > 0
                          ? `${bloquesDisponibles.length} horario${bloquesDisponibles.length > 1 ? 's' : ''} disponible${bloquesDisponibles.length > 1 ? 's' : ''}`
                          : bloquesDisponibles && bloquesDisponibles.length === 0
                            ? 'No hay horarios disponibles para este día'
                            : 'Cargando disponibilidad...'}
                      </div>
                    )}
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-white/70 text-xs mb-1.5 font-medium">Fecha</label>
                      <input
                        type="date"
                        required
                        min={today}
                        value={formData.cit_fecha}
                        onChange={e => {
                          const val = e.target.value;
                          if (val && new Date(val + 'T00:00:00').getDay() === 0) {
                            setFormError('El salón está cerrado los domingos');
                            return;
                          }
                          setFormError('');
                          setFormData(f => ({ ...f, cit_fecha: val, cit_hora: '' }));
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white focus:outline-none focus:border-salon-gold/60 focus:shadow-[0_0_20px_rgba(212,168,67,0.1)] transition-all text-sm [color-scheme:dark]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-white/70 text-xs mb-1.5 font-medium">Hora</label>
                      {!formData.cit_fecha ? (
                        <p className="text-white/30 text-sm py-2">Seleccione la fecha primero</p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-white/30 text-sm py-2">El salón está cerrado los domingos</p>
                      ) : (
                        <>
                          {/* Cuadrícula visual de horarios */}
                          <div className="grid grid-cols-4 gap-1.5">
                            {timeSlots.map(slot => {
                              const [hh, mm] = slot.hora.split(':');
                              const hNum = parseInt(hh, 10);
                              const ampm = hNum >= 12 ? 'PM' : 'AM';
                              const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
                              const hora12 = `${h12}:${mm} ${ampm}`;
                              const seleccionada = formData.cit_hora === slot.hora;

                              if (slot.disponible) {
                                return (
                                  <button
                                    key={slot.hora}
                                    type="button"
                                    onClick={() => setFormData(f => ({ ...f, cit_hora: slot.hora }))}
                                    className={`relative px-2 py-2.5 rounded-lg text-[11px] font-medium transition-all ${
                                      seleccionada
                                        ? 'bg-gradient-to-r from-salon-gold to-salon-pink text-black shadow-[0_0_12px_rgba(212,168,67,0.3)] scale-105'
                                        : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/30'
                                    }`}
                                  >
                                    {hora12}
                                  </button>
                                );
                              }

                              // Ocupado o no disponible
                              return (
                                <div
                                  key={slot.hora}
                                  className="px-2 py-2.5 rounded-lg text-[11px] bg-white/[0.03] border border-white/5 text-white/15 line-through cursor-not-allowed"
                                >
                                  {hora12}
                                </div>
                              );
                            })}
                          </div>
                          {/* Leyenda */}
                          <div className="flex items-center gap-3 mt-2 text-[10px]">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400/60" /> Disponibles ({timeSlots.filter(s => s.disponible).length})</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/15" /> Ocupados ({timeSlots.filter(s => !s.disponible).length})</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Error message */}
                  {formError && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {formError}
                    </div>
                  )}

                  {/* Botón enviar */}
                  <button
                    type="submit"
                    disabled={formStatus === 'loading'}
                    className="w-full relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-salon-gold to-salon-pink text-black font-bold hover:shadow-[0_0_30px_rgba(212,168,67,0.4)] transition-all overflow-hidden group/sub disabled:opacity-50 mt-2"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/sub:translate-x-full transition-transform duration-500" />
                    <span className="relative z-10">
                      {formStatus === 'loading' ? 'Enviando...' : 'Solicitar Cita'}
                    </span>
                  </button>
                </form>
              )}
            </motion.div>
            </div>{/* /animated border wrapper */}
          </motion.div>
        )}
      </AnimatePresence>


      {/* ════════════════════════════════════════
          Footer
          ════════════════════════════════════════ */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative py-16 lg:py-20 px-6 lg:px-20 bg-gradient-to-t from-[#0a0610] via-[#0d0815] to-transparent"
      >
        {/* Top separator with glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-salon-gold/50 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-salon-gold/20 rounded-full blur-sm" />

        {/* Background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-salon-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* ── Logo & descripción ── */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-4 mb-5">
                <img src={logoImg} alt="Eliza Styles" className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(212,168,67,0.3)]" />
                <span className="text-xl font-bold tracking-tight">
                  Eliza <span className="bg-gradient-to-r from-salon-gold via-salon-pink to-salon-lavender bg-clip-text text-transparent">Styles</span>
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Belleza y spa · Expertos en estilo desde 2018. Transformamos tu look con los mejores profesionales.
              </p>
            </div>

            {/* ── Servicios ── */}
            <div>
              <h4 className="text-white/70 font-semibold text-xs mb-5 uppercase tracking-[0.15em]">Servicios</h4>
              <ul className="space-y-2.5">
                {['Cortes', 'Coloración', 'Peinados', 'Manicure', 'Masajes'].map((s) => (
                  <li key={s}>
                    <a href="#servicios" className="text-white/50 text-sm hover:text-salon-gold transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-salon-gold/0 group-hover:bg-salon-gold/60 transition-all duration-200" />
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Horario ── */}
            <div>
              <h4 className="text-white/70 font-semibold text-xs mb-5 uppercase tracking-[0.15em] flex items-center gap-2">
                <Clock size={13} className="text-salon-gold" />
                Horario
              </h4>
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 space-y-0">
                <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 shadow-[0_0_6px_rgba(74,222,128,0.4)]" />
                    <span className="text-white/60 text-sm">Lun - Vie</span>
                  </div>
                  <span className="text-white/85 font-semibold text-sm tabular-nums">9:00 — 20:00</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 shadow-[0_0_6px_rgba(74,222,128,0.4)]" />
                    <span className="text-white/60 text-sm">Sábados</span>
                  </div>
                  <span className="text-white/85 font-semibold text-sm tabular-nums">9:00 — 18:00</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 shadow-[0_0_6px_rgba(248,113,113,0.3)]" />
                    <span className="text-white/40 text-sm">Domingos</span>
                  </div>
                  <span className="text-white/30 text-sm font-medium">Cerrado</span>
                </div>
              </div>
            </div>

            {/* ── Síguenos ── */}
            <div>
              <h4 className="text-white/70 font-semibold text-xs mb-5 uppercase tracking-[0.15em]">Síguenos</h4>
              <div className="flex gap-3">
                {/* Instagram */}
                <a
                  href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-salon-gold/15 hover:border-salon-gold/40 hover:shadow-[0_0_20px_rgba(212,168,67,0.25)] hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <Instagram size={16} className="text-white/50 group-hover:text-salon-gold transition-colors duration-200" />
                </a>
                {/* Facebook */}
                <a
                  href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-salon-gold/15 hover:border-salon-gold/40 hover:shadow-[0_0_20px_rgba(212,168,67,0.25)] hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <Facebook size={16} className="text-white/50 group-hover:text-salon-gold transition-colors duration-200" />
                </a>
                {/* WhatsApp */}
                <a
                  href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-salon-gold/15 hover:border-salon-gold/40 hover:shadow-[0_0_20px_rgba(212,168,67,0.25)] hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/50 group-hover:text-salon-gold transition-colors duration-200">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/35 text-xs">© 2026 Eliza Styles. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-xs">
              <span className="text-white/40 hover:text-salon-gold transition-colors cursor-pointer">Privacidad</span>
              <span className="text-white/40 hover:text-salon-gold transition-colors cursor-pointer">Términos</span>
              <span className="text-white/40 hover:text-salon-gold transition-colors cursor-pointer">Contacto</span>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* ════════════════════════════════════════
          Modal — Servicios filtrados por categoría
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedCategory !== null && categoryMap[selectedCategory].keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedCategory(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-lg"
          >
            {/* Animated border wrapper */}
            <div className="relative w-full max-w-3xl rounded-[2rem] p-[2px] shadow-[0_0_100px_rgba(186,113,162,0.25),0_25px_60px_rgba(0,0,0,0.5)] animate-border-glow">
              {/* Tarjeta del modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-h-[88vh] overflow-hidden rounded-[30px] bg-[#0d0814] flex flex-col"
              >
              {/* ── Hero banner — Gradiente animado con partículas ── */}
              <div className="relative shrink-0 overflow-hidden">
                {/* Fondo gradiente animado */}
                <motion.div
                  animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-br from-salon-gold/20 via-salon-pink/15 to-salon-lavender/20"
                  style={{ backgroundSize: '200% 200%' }}
                />
                {/* Overlay para oscurecer y conectar con el fondo */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d0814]/60 via-[#0d0814]/20 to-[#0d0814]" />

                {/* Partículas doradas */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    animate={{
                      y: [-8, -20, -8],
                      opacity: [0.15, 0.4, 0.15],
                    }}
                    transition={{
                      duration: 3.5 + (i % 3) * 1.5,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: 'easeInOut',
                    }}
                    className="absolute w-1 h-1 rounded-full bg-salon-gold/60"
                    style={{
                      top: `${15 + (i % 5) * 16}%`,
                      left: `${8 + i * 10}%`,
                    }}
                  />
                ))}
                {/* Partículas rosa */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`particle-pink-${i}`}
                    animate={{
                      y: [-4, -14, -4],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 3 + i * 1.8,
                      repeat: Infinity,
                      delay: i * 0.8 + 1.5,
                      ease: 'easeInOut',
                    }}
                    className="absolute w-0.5 h-0.5 rounded-full bg-salon-pink/50"
                    style={{
                      top: `${25 + (i % 4) * 18}%`,
                      left: `${15 + i * 14}%`,
                    }}
                  />
                ))}

                {/* Contenido del hero */}
                <div className="relative z-10 flex items-center justify-between px-6 lg:px-8 py-6">
                  <div className="flex items-center gap-4">
                    {/* Ícono grande con glow */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-salon-pink/15 border border-salon-pink/30 flex items-center justify-center shadow-[0_0_25px_rgba(186,113,162,0.25)]"
                    >
                      {(() => {
                        const Icon = heroIcons[selectedCategory];
                        return <Icon size={28} className="text-salon-pink" />;
                      })()}
                    </motion.div>
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight tracking-tight">
                        {categoryMap[selectedCategory].label}
                      </h2>
                      <p className="text-white/50 text-xs mt-0.5">
                        {(() => {
                          const n = serviciosPorCategoria[['cortes','cejas','coloracion','uñas','masajes'][selectedCategory]]?.length || 0;
                          return `${n} servicio${n !== 1 ? 's' : ''} disponible${n !== 1 ? 's' : ''}`;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Botón cerrar */}
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCategory(null)}
                    className="shrink-0 w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              {/* ── Contenido scrolleable ── */}
              <div className="overflow-y-auto modal-scroll px-6 lg:px-8 pb-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                {/* ── Galería de estilos de corte ── */}
                {selectedCategory === 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-salon-pink/15 border border-salon-pink/25 flex items-center justify-center">
                        <Scissors size={14} className="text-salon-pink" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Estilos de Corte{' '}
                        <span className="text-white/35 font-normal">disponibles</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(serviciosPorCategoria['cortes'] || []).map((style, i) => (
                        <motion.div
                          key={style.name}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                          whileHover={{ y: -4, scale: 1.03 }}
                          className="group/style relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-salon-pink/30 hover:shadow-[0_0_20px_rgba(186,113,162,0.15)] transition-all duration-300"
                        >
                          <div className="aspect-[4/5] overflow-hidden">
                            <img
                              src={style.image}
                              alt={style.name}
                              className="w-full h-full object-cover group-hover/style:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-salon-gold text-[11px] font-bold shadow-lg">
                            ${style.price.toLocaleString('es-CO')}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h4 className="text-white text-xs font-semibold leading-tight mb-1">
                              {style.name}
                            </h4>
                            <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2">
                              {style.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Galería de cejas y pestañas ── */}
                {selectedCategory === 1 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-salon-pink/15 border border-salon-pink/25 flex items-center justify-center">
                        <Eye size={14} className="text-salon-pink" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Cejas y Pestañas{' '}
                        <span className="text-white/35 font-normal">disponibles</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(serviciosPorCategoria['cejas'] || []).map((style, i) => (
                        <motion.div
                          key={style.name}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                          whileHover={{ y: -4, scale: 1.03 }}
                          className="group/style relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-salon-pink/30 hover:shadow-[0_0_20px_rgba(186,113,162,0.15)] transition-all duration-300"
                        >
                          <div className="aspect-[4/5] overflow-hidden">
                            <img
                              src={style.image}
                              alt={style.name}
                              className="w-full h-full object-cover group-hover/style:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-salon-gold text-[11px] font-bold shadow-lg">
                            ${style.price.toLocaleString('es-CO')}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h4 className="text-white text-xs font-semibold leading-tight mb-1">
                              {style.name}
                            </h4>
                            <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2">
                              {style.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Galería de coloración ── */}
                {selectedCategory === 2 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-salon-pink/15 border border-salon-pink/25 flex items-center justify-center">
                        <Palette size={14} className="text-salon-pink" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Coloración{' '}
                        <span className="text-white/35 font-normal">disponible</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(serviciosPorCategoria['coloracion'] || []).map((style, i) => (
                        <motion.div
                          key={style.name}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                          whileHover={{ y: -4, scale: 1.03 }}
                          className="group/style relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-salon-pink/30 hover:shadow-[0_0_20px_rgba(186,113,162,0.15)] transition-all duration-300"
                        >
                          <div className="aspect-[4/5] overflow-hidden">
                            <img
                              src={style.image}
                              alt={style.name}
                              className="w-full h-full object-cover group-hover/style:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-salon-gold text-[11px] font-bold shadow-lg">
                            ${style.price.toLocaleString('es-CO')}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h4 className="text-white text-xs font-semibold leading-tight mb-1">
                              {style.name}
                            </h4>
                            <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2">
                              {style.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Galería de uñas ── */}
                {selectedCategory === 3 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-salon-pink/15 border border-salon-pink/25 flex items-center justify-center">
                        <Gem size={14} className="text-salon-pink" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Uñas{' '}
                        <span className="text-white/35 font-normal">disponibles</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(serviciosPorCategoria['uñas'] || []).map((style, i) => (
                        <motion.div
                          key={style.name}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                          whileHover={{ y: -4, scale: 1.03 }}
                          className="group/style relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-salon-pink/30 hover:shadow-[0_0_20px_rgba(186,113,162,0.15)] transition-all duration-300"
                        >
                          <div className="aspect-[4/5] overflow-hidden">
                            <img
                              src={style.image}
                              alt={style.name}
                              className="w-full h-full object-cover group-hover/style:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-salon-gold text-[11px] font-bold shadow-lg">
                            ${style.price.toLocaleString('es-CO')}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h4 className="text-white text-xs font-semibold leading-tight mb-1">
                              {style.name}
                            </h4>
                            <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2">
                              {style.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Galería de masajes ── */}
                {selectedCategory === 4 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-salon-pink/15 border border-salon-pink/25 flex items-center justify-center">
                        <Hand size={14} className="text-salon-pink" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Masajes{' '}
                        <span className="text-white/35 font-normal">disponibles</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(serviciosPorCategoria['masajes'] || []).map((style, i) => (
                        <motion.div
                          key={style.name}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                          whileHover={{ y: -4, scale: 1.03 }}
                          className="group/style relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-salon-pink/30 hover:shadow-[0_0_20px_rgba(186,113,162,0.15)] transition-all duration-300"
                        >
                          <div className="aspect-[4/5] overflow-hidden">
                            <img
                              src={style.image}
                              alt={style.name}
                              className="w-full h-full object-cover group-hover/style:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-salon-gold text-[11px] font-bold shadow-lg">
                            ${style.price.toLocaleString('es-CO')}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h4 className="text-white text-xs font-semibold leading-tight mb-1">
                              {style.name}
                            </h4>
                            <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2">
                              {style.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </div>{/* /animated border wrapper */}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
