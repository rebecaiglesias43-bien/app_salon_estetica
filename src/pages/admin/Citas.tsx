import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Clock, Phone, User, RefreshCw, Plus, CalendarDays, Calendar, X, ChevronDown, ChevronUp, Package, AlertCircle, Timer, Scissors, Eye, Palette, Gem, Hand, Sparkles, Star, Heart, Zap, Leaf, Sun, Moon } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { useToast } from '../../components/ToastContext';

interface Cita {
  cit_id: number;
  cit_fecha: string;
  cit_hora: string;
  cit_estado: string;
  cli_nombre?: string;
  cli_apellido?: string;
  cli_telefono?: string;
  detalle?: { dci_servicio_id: number; dci_precio: number; ser_nombre?: string }[];
}

interface Servicio { ser_id: number; ser_nombre: string; ser_precio: number; ser_duracion?: number; ser_categoria?: string; }
interface Cliente { cli_id: number; cli_nombre: string; cli_apellido?: string; cli_telefono?: string; }

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

const columns = [
  { key: 'pendiente', label: 'Pendientes', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
  { key: 'aprobada', label: 'Aprobadas', color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/5' },
  { key: 'completada', label: 'Completadas', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
];

export default function Citas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Modal agendar
  const [showAgendar, setShowAgendar] = useState(false);
  const [nueva, setNueva] = useState<{ cli_id: number | null; cli_nombre: string; cli_apellido: string; cli_telefono: string; cit_fecha: string; cit_hora: string }>({ cli_id: null, cli_nombre: '', cli_apellido: '', cli_telefono: '', cit_fecha: '', cit_hora: '' });
  
  // Multi-servicio
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Set<number>>(new Set());
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [bloquesDisponibles, setBloquesDisponibles] = useState<string[] | null>(null);
  const [bloquesOcupados, setBloquesOcupados] = useState<{ cit_hora: string; cit_hora_fin: string; duracion_total: number }[]>([]);

  // Modal reprogramar
  const [showReprogramar, setShowReprogramar] = useState(false);
  const [reproId, setReproId] = useState<number | null>(null);
  const [reproFecha, setReproFecha] = useState('');
  const [reproHora, setReproHora] = useState('');
  const [reprogramarError, setReprogramarError] = useState<string | null>(null);

  // Historial de productos usados por cita completada
  const [expandedHistorial, setExpandedHistorial] = useState<Set<number>>(new Set());
  const [historialData, setHistorialData] = useState<Record<number, any[]>>({});

  // Drag & drop state
  const [dragCitaId, setDragCitaId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Horarios ocupados para validación
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [agendarOcupado, setAgendarOcupado] = useState(false);
  const [reproOcupado, setReproOcupado] = useState(false);
  const [reproEnviando, setReproEnviando] = useState(false);
  const [reproBloquesOcupados, setReproBloquesOcupados] = useState<{ cit_hora: string; cit_hora_fin: string; duracion_total: number }[]>([]);

  // Modal método de pago (soporta pagos divididos)
  const [showMetodoPago, setShowMetodoPago] = useState(false);
  const [metodoCitaId, setMetodoCitaId] = useState<number | null>(null);
  const [metodoPagoTotal, setMetodoPagoTotal] = useState(0);
  const [pagosLineas, setPagosLineas] = useState<{ metodo: string; monto: string }[]>([]);

  // ─── Helper: la cita es para una fecha futura? ──
  const esFechaFutura = (fecha: string) => {
    if (!fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const citaFecha = new Date(fecha + 'T00:00:00');
    return citaFecha > hoy;
  };

  // Fecha y hora mínimas para agendar
  const today = new Date().toISOString().split('T')[0];
  const nowH = new Date().getHours();

  // Horario del salón: Lun-Vie 9-20, Sáb 9-18, Dom cerrado
  const getDiaSemana = (fecha: string) => new Date(fecha + 'T00:00:00').getDay();

  // ─── Generar franjas horarias para rejilla ──────────────────────
  const normalizarHoraComp = (h: string) => {
    const [hh, mm] = h.split(':');
    return `${hh.padStart(2, '0')}:${(mm || '00').padStart(2, '0')}`;
  };
  const generateTimeSlots = (fecha: string, ocup: string[], minH: number, bloques?: { cit_hora: string; cit_hora_fin: string }[]) => {
    if (!fecha) return [];
    const dia = getDiaSemana(fecha);
    if (dia === 0) return [];
    const maxH = dia === 6 ? 18 : 20;
    const minMins = minH * 60;
    const slots: { hora: string; disponible: boolean; ocupado: boolean }[] = [];
    for (let m = 9 * 60; m < maxH * 60; m += 30) {
      const hora = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      let ocupado = ocup.some(o => normalizarHoraComp(o) === hora);
      // También marcar como ocupado si está dentro de un bloque ocupado con duración
      if (!ocupado && bloques && bloques.length > 0) {
        ocupado = bloques.some(b => {
          const [bhh, bmm] = b.cit_hora.split(':').map(Number);
          const [fhh, fmm] = b.cit_hora_fin.split(':').map(Number);
          return m >= (bhh * 60 + bmm) && m < (fhh * 60 + fmm);
        });
      }
      const disponible = m >= minMins && !ocupado;
      slots.push({ hora, disponible, ocupado });
    }
    return slots;
  };

  // ─── Duración total de servicios seleccionados (definido ANTES de agendarTimeSlots) ──
  const agendarDuracionTotal = useMemo(() => {
    let total = 0;
    for (const sid of serviciosSeleccionados) {
      const s = servicios.find(sv => sv.ser_id === sid);
      if (s) total += s.ser_duracion || 60;
    }
    return total;
  }, [serviciosSeleccionados, servicios]);

  const agendarPrecioTotal = useMemo(() => {
    let total = 0;
    for (const sid of serviciosSeleccionados) {
      const s = servicios.find(sv => sv.ser_id === sid);
      if (s) total += Number(s.ser_precio);
    }
    return total;
  }, [serviciosSeleccionados, servicios]);

  const agendarTimeSlots = useMemo(() => {
    if (!nueva.cit_fecha) return [];
    const dia = getDiaSemana(nueva.cit_fecha);
    if (dia === 0) return [];
    const maxH = dia === 6 ? 18 : 20;
    const minMins = nueva.cit_fecha === today ? (nowH + 1) * 60 : 9 * 60;
    const slots: { hora: string; disponible: boolean; ocupado: boolean; esBloque?: boolean }[] = [];
    for (let m = 9 * 60; m < maxH * 60; m += 30) {
      const hora = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      if (agendarDuracionTotal > 0 && bloquesDisponibles && bloquesDisponibles.length > 0) {
        const libre = bloquesDisponibles.includes(hora);
        const pasada = m < minMins;
        slots.push({ hora, disponible: !pasada && libre, ocupado: !libre, esBloque: true });
      } else if (agendarDuracionTotal > 0 && bloquesDisponibles && bloquesDisponibles.length === 0) {
        // No hay bloques disponibles — mostrar todos como ocupados
        slots.push({ hora, disponible: false, ocupado: true, esBloque: true });
      } else if (agendarDuracionTotal > 0 && bloquesDisponibles === null) {
        // Cargando disponibilidad — mostrar como no seleccionable
        slots.push({ hora, disponible: false, ocupado: false, esBloque: false });
      } else if (bloquesOcupados.length > 0) {
        // Usar bloques ocupados con duración para marcar rangos completos
        const enBloque = bloquesOcupados.some(b => {
          const [bhh, bmm] = b.cit_hora.split(':').map(Number);
          const [fhh, fmm] = b.cit_hora_fin.split(':').map(Number);
          const inicio = bhh * 60 + bmm;
          const fin = fhh * 60 + fmm;
          return m >= inicio && m < fin;
        });
        slots.push({ hora, disponible: m >= minMins && !enBloque, ocupado: enBloque, esBloque: true });
      } else {
        const ocupado = ocupados.some(o => normalizarHoraComp(o) === hora);
        slots.push({ hora, disponible: m >= minMins, ocupado });
      }
    }
    return slots;
  }, [nueva.cit_fecha, ocupados, bloquesDisponibles, bloquesOcupados, agendarDuracionTotal, today, nowH]);
  const reproTimeSlots = generateTimeSlots(reproFecha, ocupados, reproFecha === today ? nowH + 1 : 9, reproBloquesOcupados);

  const normalizarHora = (h: string) => {
    const [hh, mm] = h.split(':');
    return `${hh.padStart(2, '0')}:${(mm || '00').padStart(2, '0')}`;
  };
  const fetchOcupados = async (fecha: string) => {
    if (!fecha) { setOcupados([]); return; }
    try {
      const res = await api.get(`/api/citas/ocupados?fecha=${fecha}`);
      setOcupados((res.data?.ocupados || []).map((h: string) => normalizarHora(h).slice(0, 5)));
    } catch { setOcupados([]); }
  };

  // ─── Fetch rangos ocupados (bloques con duración) ──
  const fetchBloquesOcupados = useCallback(async (fecha: string) => {
    if (!fecha) { setBloquesOcupados([]); return; }
    try {
      const res = await api.get(`/api/citas/bloques-ocupados?fecha=${fecha}`);
      setBloquesOcupados(res.data?.bloques || []);
    } catch {
      setBloquesOcupados([]);
    }
  }, []);

  // ─── Fetch bloques disponibles cuando cambia fecha o duración ──
  const fetchBloquesDisponibles = useCallback(async (fecha: string, duracion: number) => {
    if (!fecha || duracion <= 0) { setBloquesDisponibles(null); return; }
    try {
      const res = await api.get(`/api/citas/bloques-disponibles?fecha=${fecha}&duracion=${duracion}`);
      const disponibles = (res.data?.disponibles || []).map((h: string) => normalizarHora(h).slice(0, 5));
      setBloquesDisponibles(disponibles.length > 0 ? disponibles : []);
    } catch {
      // Fallback: si el endpoint falla, marcar como null (cargando/error)
      setBloquesDisponibles(null);
      fetchOcupados(fecha);
    }
  }, []);

  // Auto-fetch bloques cuando cambian fecha/duración en modal abierto
  useEffect(() => {
    if (showAgendar) {
      if (nueva.cit_fecha) {
        fetchBloquesOcupados(nueva.cit_fecha);
        if (agendarDuracionTotal > 0) {
          fetchBloquesDisponibles(nueva.cit_fecha, agendarDuracionTotal);
        } else {
          fetchOcupados(nueva.cit_fecha);
        }
      }
    }
  }, [showAgendar, nueva.cit_fecha, agendarDuracionTotal, fetchBloquesDisponibles, fetchBloquesOcupados]);

  const fetchCitas = async (pagina?: number) => {
    setLoading(true);
    setCitasError(null);
    try {
      const p = pagina || 1;
      // Traer citas SIN filtro de fecha — usa paginación normal (10 por página)
      const res = await api.get(`/api/citas/?limit=10&page=${p}`);
      setCitas(res.data.data || []);
      setCitasPages(res.data.pages || 1);
      setCitasTotal(res.data.total || 0);
      setCitasPage(p);
      setCitasError(null);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error al cargar las citas';
      setCitasError(msg);
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCitas(); }, []);

  // Auto-seleccionar cliente cuando se regresa de Crear Nuevo Cliente
  useEffect(() => {
    const nuevoId = searchParams.get('nuevo_cliente_id');
    if (nuevoId && clientes.length > 0) {
      const cli = clientes.find(c => c.cli_id === Number(nuevoId));
      if (cli) {
        setNueva(n => ({ ...n, cli_id: cli.cli_id, cli_nombre: cli.cli_nombre, cli_apellido: cli.cli_apellido || '', cli_telefono: cli.cli_telefono || '' }));
        // Limpiar el query param sin recargar
        window.history.replaceState({}, '', '/admin/citas');
      }
    }
  }, [searchParams, clientes]);

  const [citasError, setCitasError] = useState<string | null>(null);
  const [citasPage, setCitasPage] = useState(1);
  const [citasPages, setCitasPages] = useState(1);
  const [citasTotal, setCitasTotal] = useState(0);
  const [cambiarError, setCambiarError] = useState<string | null>(null);
  const [cambiandoIds, setCambiandoIds] = useState<Set<number>>(new Set());

  const cambiarEstado = async (id: number, estado: string, pagosData?: { metodo: string; monto: number }[]): Promise<boolean> => {
    if (cambiandoIds.has(id)) return false; // evitar doble click
    setCambiarError(null);
    setCambiandoIds(prev => new Set(prev).add(id));
    const body: any = { estado };
    if (pagosData) body.pagos = pagosData;
    try { await api.put(`/api/citas/${id}/estado`, body); fetchCitas(); return true; }
    catch (err: any) {
      const msg = err.response?.data?.error || 'Error al cambiar estado';
      setCambiarError(msg);
      setTimeout(() => setCambiarError(null), 5000);
      return false;
    } finally {
      setCambiandoIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const openMetodoPago = (cita: Cita) => {
    const total = (cita.detalle || []).reduce((sum, d) => sum + Number(d.dci_precio), 0);
    setCambiarError(null);    // limpiar error previo
    setMetodoCitaId(cita.cit_id);
    setMetodoPagoTotal(total);
    setPagosLineas([{ metodo: 'efectivo', monto: String(total) }]);
    setShowMetodoPago(true);
  };

  const handleCompletarConMetodo = async () => {
    if (metodoCitaId === null) return;
    const pagosData = pagosLineas.map(p => ({ metodo: p.metodo, monto: parseFloat(p.monto) }));
    const ok = await cambiarEstado(metodoCitaId, 'completada', pagosData);
    setShowMetodoPago(false); // cerrar modal siempre (éxito o error)
    if (!ok) return;          // si falló, no mostrar toast verde
    addToast('Cita completada y cobrada exitosamente', 'success');
  };

  const openReprogramar = (cita: Cita) => {
    setReproId(cita.cit_id);
    setReproFecha(cita.cit_fecha || '');
    setReproHora(cita.cit_hora?.slice(0, 5) || '');
    setReproOcupado(false);
    setReproBloquesOcupados([]);
    if (cita.cit_fecha) {
      fetchOcupados(cita.cit_fecha);
      api.get(`/api/citas/bloques-ocupados?fecha=${cita.cit_fecha}`)
        .then(res => setReproBloquesOcupados(res.data?.bloques || []))
        .catch(() => setReproBloquesOcupados([]));
    }
    setShowReprogramar(true);
  };

  const handleReprogramar = async () => {
    if (reproEnviando) return;
    if (!reproId || !reproFecha || !reproHora) return;
    setReprogramarError(null);
    setReproEnviando(true);
    try {
      await api.put(`/api/citas/${reproId}/reprogramar`, { cit_fecha: reproFecha, cit_hora: reproHora + ':00' });
      setShowReprogramar(false);
      setReprogramarError(null);
      fetchCitas();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error al reprogramar la cita';
      setReprogramarError(msg);
      console.error(err);
    } finally {
      setReproEnviando(false);
    }
  };

  const toggleHistorial = async (citaId: number) => {
    const next = new Set(expandedHistorial);
    if (next.has(citaId)) {
      next.delete(citaId);
      setExpandedHistorial(next);
    } else {
      next.add(citaId);
      setExpandedHistorial(next);
      if (!historialData[citaId]) {
        try {
          const res = await api.get(`/api/historial-productos-usados/cita/${citaId}`);
          setHistorialData(prev => ({ ...prev, [citaId]: res.data || [] }));
        } catch { setHistorialData(prev => ({ ...prev, [citaId]: [] })); }
      }
    }
  };

  const [categorias, setCategorias] = useState<{ cat_id: number; cat_nombre: string; cat_slug: string; cat_icono?: string }[]>([]);

  // Mapa de nombres de íconos Lucide a componentes (desde la BD)
  const ICON_MAP: Record<string, any> = { Scissors, Eye, Palette, Gem, Hand, Sparkles, Star, Heart, Zap, Leaf, Sun, Moon };

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

  const getRestrictionGroup = (servicio: Servicio): string => {
    const cat = servicio.ser_categoria || '';
    if (cat === 'cejas') {
      const nombre = (servicio.ser_nombre || '').toLowerCase();
      if (nombre.includes('pestaña')) return 'cejas_pestanas';
      if (nombre.includes('ceja')) return 'cejas_cejas';
      return 'cejas_other';
    }
    return cat;
  };

  const toggleServicio = (id: number) => {
    setServiciosSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      // Verificar límite del grupo de restricción
      const srv = servicios.find(s => s.ser_id === id);
      if (srv) {
        const group = getRestrictionGroup(srv);
        const max = CATEGORY_LIMITS[group] ?? 1;
        if (max !== Infinity) {
          let count = 0;
          for (const sid of prev) {
            const s = servicios.find(sv => sv.ser_id === sid);
            if (s && getRestrictionGroup(s) === group) count++;
          }
          if (count >= max) return prev; // rechazar: ya se alcanzó el límite
        }
      }
      next.add(id);
      return next;
    });
    setNueva(n => ({ ...n, cit_hora: '' })); // reset hora al cambiar servicios
  };

  const openAgendar = async () => {
    try {
      const [sR, cR, catR] = await Promise.all([
        api.get('/api/servicios/public'),
        api.get('/api/clientes/'),
        api.get('/api/categorias/')
      ]);
      setServicios(sR.data || []);
      setClientes(cR.data.data || []);
      setCategorias(catR.data || []);
    } catch {}
    setNueva({ cli_id: null, cli_nombre: '', cli_apellido: '', cli_telefono: '', cit_fecha: '', cit_hora: '' });
    setServiciosSeleccionados(new Set());
    setCategoriaActiva(null);
    setBloquesDisponibles(null);
    setBloquesOcupados([]);
    setOcupados([]); setAgendarOcupado(false);
    setShowAgendar(true);
  };

  const validateAgendar = (): string | null => {
    if (!nueva.cli_id) return 'Debe seleccionar un cliente';
    if (serviciosSeleccionados.size === 0) return 'Debe seleccionar al menos un servicio';
    if (!nueva.cit_fecha) return 'Seleccione una fecha para la cita';
    // La validación por grupo ya se hace en toggleServicio al añadir cada servicio
    return null;
  };

  const handleAgendar = async () => {
    if (enviando) return; // evitar doble click
    const error = validateAgendar();
    if (error) {
      addToast(error, 'error');
      return;
    }
    // Verificar que la hora seleccionada esté disponible
    if (!nueva.cit_hora) {
      addToast('Seleccione una hora para la cita', 'error');
      return;
    }
    const slot = agendarTimeSlots.find(s => s.hora === nueva.cit_hora);
    if (slot && !slot.disponible) {
      addToast('La hora seleccionada ya está ocupada. Elige otra.', 'error');
      return;
    }
    setEnviando(true);
    try {
      const detalle = Array.from(serviciosSeleccionados).map(sid => ({
        servicio_id: sid,
        precio: servicios.find(s => s.ser_id === sid)?.ser_precio || 0
      }));
      const res = await api.post('/api/citas/admin', {
        cli_id: nueva.cli_id, cli_nombre: nueva.cli_nombre, cli_apellido: nueva.cli_apellido, cli_telefono: nueva.cli_telefono,
        cit_fecha: nueva.cit_fecha, cit_hora: nueva.cit_hora + ':00',
        detalle
      });
      setShowAgendar(false);
      setCitasPage(1);
      await fetchCitas(1);
      addToast(`Cita #${res.data?.cita_id || ''} agendada exitosamente`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al agendar la cita';
      addToast(msg, 'error');
    } finally {
      setEnviando(false);
    }
  };

  const getColumnCitas = (estado: string) => citas.filter(c => c.cit_estado === estado);

  // ─── Drag & drop handlers ───
  const handleDragStart = (citaId: number) => {
    setDragCitaId(citaId);
  };
  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(colKey);
  };
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };
  const handleDrop = async (colKey: string) => {
    setDragOverColumn(null);
    if (dragCitaId !== null) {
      const cita = citas.find(c => c.cit_id === dragCitaId);
      if (cita && cita.cit_estado !== colKey) {
        // No permitir soltar en "Completadas" si la cita es futura
        if (colKey === 'completada' && esFechaFutura(cita.cit_fecha)) {
          setCambiarError(`La cita de ${cita.cli_nombre} es para el ${new Date(cita.cit_fecha + 'T00:00:00').toLocaleDateString('es-MX')} — debe esperar a la fecha`);
          setTimeout(() => setCambiarError(null), 5000);
          setDragCitaId(null);
          return;
        }
        // Map drop target to valid estado
        const estadoMap: Record<string, string> = {
          'pendiente': 'pendiente',
          'aprobada': 'aprobada',
          'completada': 'completada',
        };
        const targetEstado = estadoMap[colKey];
        if (targetEstado && targetEstado !== cita.cit_estado) {
          // Si es completada, abrir modal de método de pago; si no, directo
          if (targetEstado === 'completada') {
            const cita = citas.find(c => c.cit_id === dragCitaId);
            if (cita) openMetodoPago(cita);
          } else {
            await cambiarEstado(dragCitaId, targetEstado);
          }
        }
      }
    }
    setDragCitaId(null);
  };
  const handleDragEnd = () => {
    setDragCitaId(null);
    setDragOverColumn(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
          <p className="text-white/30 text-sm mt-1">Tablero kanban · arrastra para cambiar estado</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchCitas()} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw size={16} />
          </button>
          <button onClick={openAgendar} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all">
            <Plus size={16} /> Agendar
          </button>
        </div>
      </div>

      {cambiarError && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{cambiarError}</span>
          <button onClick={() => setCambiarError(null)} className="ml-auto text-red-300/50 hover:text-red-300"><X size={12} /></button>
        </div>
      )}

      {citasError && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{citasError}</span>
          <button onClick={() => { setCitasError(null); fetchCitas(); }} className="ml-3 px-2.5 py-1 rounded-lg bg-white/10 text-red-300/80 hover:text-red-300 text-[10px]">Reintentar</button>
          <button onClick={() => setCitasError(null)} className="ml-auto text-red-300/50 hover:text-red-300"><X size={12} /></button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-white/30">Cargando...</div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {columns.map(col => {
            const colCitas = getColumnCitas(col.key);
            const isDragOver = dragOverColumn === col.key;
            return (
              <div
                key={col.key}
                className={`${glassCard} ${col.border} overflow-hidden transition-all duration-200 ${isDragOver ? 'ring-2 ring-salon-gold/50 scale-[1.02] shadow-[0_0_30px_rgba(212,168,67,0.15)]' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(col.key)}
              >
                {/* Column header */}
                <div className={`px-5 py-4 ${col.bg} border-b border-white/5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color.replace('text', 'bg')}`} />
                    <h3 className="font-semibold text-sm">{col.label}</h3>
                  </div>
                  <span className={`text-xs font-mono ${col.color}`}>{colCitas.length}</span>
                </div>

                {/* Cards */}
                <div className={`p-3 space-y-3 min-h-[200px] transition-colors duration-200 ${isDragOver ? 'bg-salon-gold/[0.03]' : ''}`}>
                  {colCitas.length === 0 ? (
                    <div className={`text-center py-8 text-xs transition-colors duration-200 ${isDragOver ? 'text-salon-gold/40' : 'text-white/20'}`}>
                      {isDragOver ? 'Soltar aquí' : 'Sin citas'}
                    </div>
                  ) : (
                    colCitas.map(cita => (
                      <div
                        key={cita.cit_id}
                        draggable
                        onDragStart={() => handleDragStart(cita.cit_id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all space-y-2 cursor-grab active:cursor-grabbing ${dragCitaId === cita.cit_id ? 'opacity-50 scale-95 ring-1 ring-salon-gold/30' : ''}`}
                      >
                        {/* Header row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                              <User size={12} className="text-salon-pink" />
                            </div>
                            <span className="text-sm font-medium">{cita.cli_nombre} {cita.cli_apellido}</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-3 text-xs text-white/30">
                          <span className="flex items-center gap-1"><CalendarDays size={10} />{cita.cit_fecha}</span>
                          <span className="flex items-center gap-1"><Clock size={10} />{cita.cit_hora?.slice(0,5)}</span>
                          {/* Duración del bloque si hay detalle */}
                          {cita.detalle && cita.detalle.length > 0 && (() => {
                            const dur = cita.detalle.reduce((acc: number, d: any) => acc + (d.ser_duracion || 60), 0);
                            const hFin = cita.cit_hora ? (() => {
                              const [hh, mm] = cita.cit_hora.slice(0, 5).split(':').map(Number);
                              const mins = hh * 60 + mm + dur;
                              return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
                            })() : '';
                            return <span className="flex items-center gap-1 text-salon-gold/60"><Timer size={10} />{dur} min · {cita.cit_hora?.slice(0,5)}–{hFin}</span>;
                          })()}
                        </div>
                        {cita.cli_telefono && (
                          <p className="text-xs text-white/20 flex items-center gap-1"><Phone size={10} />{cita.cli_telefono}</p>
                        )}

                        {/* Servicios contratados (visible en todas las tarjetas) */}
                        {cita.detalle && cita.detalle.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {cita.detalle.map((d, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                                {d.ser_nombre || `Servicio #${d.dci_servicio_id}`}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          {cita.cit_estado === 'pendiente' && (
                            <>
                              <button onClick={() => cambiarEstado(cita.cit_id, 'aprobada')} disabled={cambiandoIds.has(cita.cit_id)} className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-medium hover:bg-green-500/20 transition-colors disabled:opacity-30">Aprobar</button>
                              <button onClick={() => cambiarEstado(cita.cit_id, 'rechazada')} disabled={cambiandoIds.has(cita.cit_id)} className="flex-1 py-1.5 rounded-lg bg-gray-500/10 text-gray-400 text-[10px] font-medium hover:bg-gray-500/20 transition-colors disabled:opacity-30">Rechazar</button>
                              <button onClick={() => openReprogramar(cita)} className="py-1.5 px-2 rounded-lg bg-salon-gold/10 text-salon-gold text-[10px] font-medium hover:bg-salon-gold/20 transition-colors"><Calendar size={10} /></button>
                            </>
                          )}
                          {cita.cit_estado === 'aprobada' && (
                            <>
                              <button
                                onClick={() => openMetodoPago(cita)}
                                disabled={esFechaFutura(cita.cit_fecha) || cambiandoIds.has(cita.cit_id)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                                  esFechaFutura(cita.cit_fecha) || cambiandoIds.has(cita.cit_id)
                                    ? 'bg-gray-500/5 text-gray-500/40 cursor-not-allowed'
                                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                                }`}
                                title={esFechaFutura(cita.cit_fecha) ? `Cita programada para el ${new Date(cita.cit_fecha + 'T00:00:00').toLocaleDateString('es-MX')} — debe esperar a la fecha` : 'Completar cita'}
                              >{cambiandoIds.has(cita.cit_id) ? '...' : 'Completar'}</button>
                              <button onClick={() => cambiarEstado(cita.cit_id, 'cancelada')} disabled={cambiandoIds.has(cita.cit_id)} className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-medium hover:bg-red-500/20 transition-colors disabled:opacity-30">Cancelar</button>
                              <button onClick={() => openReprogramar(cita)} className="py-1.5 px-2 rounded-lg bg-salon-gold/10 text-salon-gold text-[10px] font-medium hover:bg-salon-gold/20 transition-colors"><Calendar size={10} /></button>
                            </>
                          )}
                          {cita.cit_estado === 'completada' && (
                            <button onClick={() => toggleHistorial(cita.cit_id)} className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-white/5 text-white/30 text-[10px] font-medium hover:bg-white/10 transition-colors w-full justify-center">
                              <Package size={10} /> {expandedHistorial.has(cita.cit_id) ? 'Ocultar insumos' : 'Ver insumos usados'}
                              {expandedHistorial.has(cita.cit_id) ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          )}
                        </div>

                        {/* Historial de productos usados (solo completadas) */}
                        {expandedHistorial.has(cita.cit_id) && (
                          <div className="mt-1 pt-2 border-t border-white/5">
                            {!historialData[cita.cit_id] ? (
                              <p className="text-xs text-white/20 text-center py-1">Cargando...</p>
                            ) : historialData[cita.cit_id].length === 0 ? (
                              <p className="text-xs text-white/20 text-center py-1">Sin insumos registrados</p>
                            ) : (
                              <div className="space-y-1">
                                {historialData[cita.cit_id].map((h: any) => (
                                  <div key={h.hpu_id} className="flex items-center justify-between text-xs bg-white/[0.03] rounded-lg px-2 py-1">
                                    <span className="text-white/50 flex items-center gap-1"><Package size={10} />{h.pro_nombre}</span>
                                    {h.hpu_notas && <span className="text-white/20 italic">{h.hpu_notas}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        {!loading && citasPages > 1 && (
          <Pagination
            page={citasPage}
            pages={citasPages}
            total={citasTotal}
            limit={10}
            onChange={(p) => fetchCitas(p)}
          />
        )}
      </>)}

      {/* Modal Reprogramar */}
      {showReprogramar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowReprogramar(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Reprogramar Cita</h2>
              <button onClick={() => setShowReprogramar(false)}><X size={18} className="text-white/30" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-white/40 text-xs mb-1">Nueva Fecha</label>
                <input type="date" value={reproFecha} min={today} onChange={e => {
                  const val = e.target.value;
                  if (val && new Date(val + 'T00:00:00').getDay() === 0) { setReproFecha(''); return; }
                  setReproFecha(val); fetchOcupados(val); setReproOcupado(false); setReproBloquesOcupados([]);
                  api.get(`/api/citas/bloques-ocupados?fecha=${val}`)
                    .then(res => setReproBloquesOcupados(res.data?.bloques || []))
                    .catch(() => setReproBloquesOcupados([]));
                }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50 [color-scheme:dark]" /></div>
              <div className="col-span-2"><label className="block text-white/40 text-xs mb-2">Nueva Hora</label>
                {!reproFecha ? (
                  <p className="text-white/20 text-sm py-2">Seleccione la fecha primero</p>
                ) : reproTimeSlots.length === 0 ? (
                  <p className="text-white/30 text-sm py-2">No hay horarios disponibles para este día</p>
                ) : (
                  <>
                    {/* Cuadrícula visual de horarios */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {reproTimeSlots.map(slot => {
                        const [hh, mm] = slot.hora.split(':');
                        const hNum = parseInt(hh, 10);
                        const ampm = hNum >= 12 ? 'PM' : 'AM';
                        const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
                        const hora12 = `${h12}:${mm} ${ampm}`;
                        const seleccionada = reproHora === slot.hora;

                        if (slot.disponible) {
                          return (
                            <button
                              key={slot.hora}
                              onClick={() => { setReproHora(slot.hora); setReproOcupado(false); }}
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
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400/60" /> Disponibles ({reproTimeSlots.filter(s => s.disponible).length})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/15" /> Ocupados ({reproTimeSlots.filter(s => !s.disponible).length})</span>
                    </div>
                  </>
                )}
              </div>

              {reprogramarError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400/90">{reprogramarError}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowReprogramar(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handleReprogramar} disabled={reproOcupado || reproEnviando} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold disabled:opacity-30">{reproEnviando ? 'Guardando...' : 'Reprogramar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agendar */}
      {showAgendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAgendar(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 modal-enter max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Agendar Cita</h2>
            <div className="space-y-3">
              {/* ─── Selector de Cliente ─── */}
              <div>
                <label className="block text-white/40 text-xs mb-1.5">
                  <User size={12} className="inline mr-1" /> Cliente
                </label>
                <select
                  value={nueva.cli_id ? String(nueva.cli_id) : ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (val) {
                      const cli = clientes.find(c => c.cli_id === Number(val));
                      if (cli) {
                        setNueva(n => ({ ...n, cli_id: cli.cli_id, cli_nombre: cli.cli_nombre, cli_apellido: cli.cli_apellido || '', cli_telefono: cli.cli_telefono || '' }));
                      }
                    } else {
                      setNueva(n => ({ ...n, cli_id: null, cli_nombre: '', cli_apellido: '', cli_telefono: '' }));
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50"
                >
                  <option value="" className="bg-[#120c1a]">Seleccionar cliente existente</option>
                  {clientes.map(c => (
                    <option key={c.cli_id} value={c.cli_id} className="bg-[#120c1a]">
                      {c.cli_nombre} {c.cli_apellido || ''} {c.cli_telefono ? `— ${c.cli_telefono}` : ''}
                    </option>
                  ))}
                </select>

                {/* Botón para crear nuevo cliente (redirige a /admin/clientes) */}
                <button
                  type="button"
                  onClick={() => navigate('/admin/clientes?redirect=citas')}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold hover:shadow-[0_0_15px_rgba(212,168,67,0.3)] transition-all"
                >
                  <Plus size={16} /> Crear Nuevo Cliente
                </button>
              </div>
              {/* ─── Multi-selector de Servicios con categorías estilo LandingPage ─── */}
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Servicios (puedes elegir varios)</label>

                {/* Tarjetas de categorías (desde API) */}
                {(() => {
                  const catsConServicios = categorias.filter(cat =>
                    servicios.some((s: any) => s.ser_categoria === cat.cat_slug)
                  );
                  return catsConServicios.length > 1 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {catsConServicios.map(cat => {
                        const activa = categoriaActiva === cat.cat_nombre;
                        const Icon = ICON_MAP[cat.cat_icono || ''] || Sparkles;
                        return (
                          <button
                            key={cat.cat_id}
                            type="button"
                            onClick={() => setCategoriaActiva(activa ? null : cat.cat_nombre)}
                            className={`group flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition-all duration-200 ${
                              activa
                                ? 'bg-salon-gold/12 border-salon-gold/40 text-salon-gold shadow-[0_0_15px_rgba(212,168,67,0.12)]'
                                : 'bg-white/[0.04] border-white/10 text-white/50 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                            }`}
                          >
                            <Icon size={18} className="text-salon-pink/60 group-hover:text-salon-pink transition-colors duration-200" />
                            <span className="text-[10px] font-medium text-center leading-tight">{cat.cat_nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null;
                })()}

                {/* Servicios de la categoría activa */}
                {categoriaActiva && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(() => {
                      const cat = categorias.find(c => c.cat_nombre === categoriaActiva);
                      if (!cat) return null;
                      const filtrados = servicios.filter((s: any) =>
                        s.ser_categoria === cat.cat_slug
                      );
                      return filtrados.map((s: any) => {
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
                            onClick={() => bloqueado ? null : toggleServicio(s.ser_id)}
                            title={bloqueado ? `Ya seleccionaste el máximo de ${s.ser_nombre}` : s.ser_nombre}
                            className={`text-left p-3 rounded-xl border text-xs transition-all ${
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
                      });
                    })()}
                    {(() => {
                      const catMap = [
                        { keywords: ['corte'], label: 'Cortes' },
                        { keywords: ['ceja', 'pestaña'], label: 'Cejas y Pestañas' },
                        { keywords: ['color', 'tinte', 'mecha', 'coloración'], label: 'Coloración' },
                        { keywords: ['uña', 'manicure', 'pedicure'], label: 'Uñas / Manicure' },
                        { keywords: ['masaje', 'facial', 'limp', 'punta'], label: 'Masajes y Facial' },
                      ];
                      const cat = catMap.find(c => c.label === categoriaActiva);
                      if (!cat) return null;
                      return servicios.filter((s: any) =>
                        cat.keywords.some(kw => s.ser_nombre?.toLowerCase().includes(kw))
                      ).length === 0 ? (
                        <div className="col-span-2 py-6 text-center text-white/30 text-xs">
                          No hay servicios disponibles en esta categoría
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Tags de servicios seleccionados */}
                {serviciosSeleccionados.size > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {Array.from(serviciosSeleccionados).map(sid => {
                      const s = servicios.find((sv: any) => sv.ser_id === sid);
                      if (!s) return null;
                      return (
                        <span
                          key={sid}
                          onClick={() => toggleServicio(sid)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-salon-gold/10 border border-salon-gold/20 text-salon-gold text-[10px] cursor-pointer hover:bg-salon-gold/20 transition-colors"
                        >
                          {s.ser_nombre}
                          <X size={10} className="text-salon-gold/60" />
                        </span>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* ─── Resumen de selección ─── */}
              {serviciosSeleccionados.size > 0 && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-salon-gold/5 border border-salon-gold/15 text-xs">
                  <span className="text-white/60">
                    {serviciosSeleccionados.size} servicio{serviciosSeleccionados.size > 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-white/50">
                      <Timer size={12} /> {agendarDuracionTotal}min
                    </span>
                    <span className="text-salon-gold font-semibold">${agendarPrecioTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-white/40 text-xs mb-1">Fecha</label>
                  <input type="date" value={nueva.cit_fecha} min={today} onChange={e => {
                    const val = e.target.value;
                    if (val && new Date(val + 'T00:00:00').getDay() === 0) {
                      addToast('El salón está cerrado los domingos', 'error');
                      return;
                    }
                    setNueva(n => ({...n, cit_fecha: val, cit_hora: ''}));
                    if (agendarDuracionTotal > 0) {
                      fetchBloquesDisponibles(val, agendarDuracionTotal);
                    } else {
                      fetchOcupados(val);
                    }
                    setAgendarOcupado(false);
                  }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50 [color-scheme:dark]" />
                </div>
                <div className="col-span-2"><label className="block text-white/40 text-xs mb-2">Hora</label>
                  {!nueva.cit_fecha ? (
                    <p className="text-white/20 text-sm py-2">Seleccione la fecha primero</p>
                  ) : agendarTimeSlots.length === 0 ? (
                    <p className="text-white/30 text-sm py-2">El salón está cerrado los domingos</p>
                  ) : (
                    <>
                      {/* Cuadrícula visual de horarios */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {agendarTimeSlots.map(slot => {
                          const [hh, mm] = slot.hora.split(':');
                          const hNum = parseInt(hh, 10);
                          const ampm = hNum >= 12 ? 'PM' : 'AM';
                          const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
                          const hora12 = `${h12}:${mm} ${ampm}`;
                          const seleccionada = nueva.cit_hora === slot.hora;

                          if (slot.disponible) {
                            return (
                              <button
                                key={slot.hora}
                                onClick={() => { setNueva(n => ({...n, cit_hora: slot.hora})); setAgendarOcupado(false); }}
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
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400/60" /> Disponibles ({agendarTimeSlots.filter(s => s.disponible).length})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/15" /> Ocupados ({agendarTimeSlots.filter(s => !s.disponible).length})</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Info de bloques (cuando hay servicios seleccionados) */}
              {nueva.cit_fecha && agendarDuracionTotal > 0 && (
                <div className="px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/15 text-[11px] text-blue-300/70">
                  <span className="flex items-center gap-1">
                    <Timer size={11} /> Bloque de <strong>{agendarDuracionTotal} minutos</strong> —{' '}
                    {bloquesDisponibles && bloquesDisponibles.length > 0
                      ? `${bloquesDisponibles.length} horario${bloquesDisponibles.length > 1 ? 's' : ''} disponible${bloquesDisponibles.length > 1 ? 's' : ''}`
                      : bloquesDisponibles && bloquesDisponibles.length === 0
                        ? 'No hay horarios disponibles para este día'
                        : 'Cargando disponibilidad...'}
                  </span>
                </div>
              )}

              {/* Errores de validación se muestran como toast en esquina superior derecha */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAgendar(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handleAgendar} disabled={!nueva.cit_hora || agendarOcupado || enviando} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold disabled:opacity-30">{enviando ? 'Guardando...' : 'Agendar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Método de Pago (soporta pagos divididos) */}
      {showMetodoPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowMetodoPago(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Completar Cita</h2>
              <button onClick={() => setShowMetodoPago(false)}><X size={18} className="text-white/30" /></button>
            </div>
            <div className="space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-salon-gold/10 border border-salon-gold/20">
                <span className="text-white/60 text-sm">Total a cobrar</span>
                <span className="text-salon-gold font-bold text-lg">${metodoPagoTotal.toLocaleString('es-CO')}</span>
              </div>

              {/* Líneas de pago */}
              <div className="space-y-2">
                {pagosLineas.map((linea, idx) => {
                  return (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select
                          value={linea.metodo}
                          onChange={e => {
                            const nuevas = [...pagosLineas];
                            nuevas[idx] = { ...nuevas[idx], metodo: e.target.value };
                            setPagosLineas(nuevas);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50"
                        >
                          <option value="efectivo" className="bg-[#120c1a]">Efectivo</option>
                          <option value="transferencia" className="bg-[#120c1a]">Transferencia</option>
                          <option value="tarjeta" className="bg-[#120c1a]">Tarjeta</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={linea.monto}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            const nuevas = [...pagosLineas];
                            nuevas[idx] = { ...nuevas[idx], monto: val };
                            setPagosLineas(nuevas);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50 text-right"
                          placeholder="Monto"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (pagosLineas.length <= 1) return;
                          setPagosLineas(pagosLineas.filter((_, i) => i !== idx));
                        }}
                        disabled={pagosLineas.length <= 1}
                        className="p-2 rounded-lg text-white/30 hover:text-red-400 disabled:opacity-20 mt-0.5"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Suma parcial */}
              {(() => {
                const sumaPagos = pagosLineas.reduce((s, l) => s + (parseFloat(l.monto) || 0), 0);
                const diferencia = metodoPagoTotal - sumaPagos;
                const exceso = sumaPagos - metodoPagoTotal;
                return (
                  <>
                    {exceso > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm bg-red-500/15 border border-red-500/30 text-red-300">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle size={14} /> Se pasaron del monto por ${exceso.toLocaleString('es-CO')}
                        </span>
                        <span className="font-bold">${sumaPagos.toLocaleString('es-CO')} / ${metodoPagoTotal.toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    {exceso <= 0 && (
                      <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
                        sumaPagos === metodoPagoTotal
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                          : sumaPagos > 0
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                            : 'bg-white/5 border border-white/10 text-white/40'
                      }`}>
                        <span>{sumaPagos === 0 ? 'Pendiente' : sumaPagos === metodoPagoTotal ? '✔ Cubierto' : `Faltan $${diferencia.toLocaleString('es-CO')}`}</span>
                        <span className="font-bold">${sumaPagos.toLocaleString('es-CO')} / ${metodoPagoTotal.toLocaleString('es-CO')}</span>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Botón agregar otro método */}
              {pagosLineas.length < 5 && (
                <button
                  onClick={() => setPagosLineas([...pagosLineas, { metodo: 'transferencia', monto: '0' }])}
                  className="w-full py-2 rounded-xl border border-dashed border-white/15 text-white/40 text-sm hover:border-white/30 hover:text-white/60 transition-all"
                >
                  + Agregar otro método de pago
                </button>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowMetodoPago(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button
                  onClick={handleCompletarConMetodo}
                  disabled={(() => { const s = pagosLineas.reduce((sum, l) => sum + (parseFloat(l.monto) || 0), 0); return s !== metodoPagoTotal; })()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold disabled:opacity-40"
                >
                  Completar y Cobrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
