import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search, Plus, Phone, MapPin, History, ChevronDown, ChevronUp, X, AlertCircle, Users } from 'lucide-react';
import { validateNombre, validateTelefono, filterNombre, filterTelefono } from '../../lib/validation';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastContext';

interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
  cli_telefono: string;
  cli_direccion: string;
}

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function ClientesCatalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ cli_nombre?: string; cli_apellido?: string; cli_telefono?: string; cli_direccion?: string; api?: string }>({});
  const [form, setForm] = useState({ cli_nombre: '', cli_apellido: '', cli_telefono: '', cli_direccion: '' });
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchClientes = async () => {
    setLoading(true);
    try { const params: any = { page, limit: 10 }; if (search) params.search = search; const res = await api.get('/api/clientes/', { params }); setClientes(res.data.data || []); setPages(res.data.pages || 1); setTotal(res.data.total || 0); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchClientes(); }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);

  // Auto-abrir formulario de crear cliente si vino desde redirect (ej. agendar cita)
  useEffect(() => {
    if (searchParams.get('redirect')) {
      openCreate();
    }
  }, []);

  const toggleExpand = async (c: Cliente) => {
    if (expandedId === c.cli_id) { setExpandedId(null); setHistorial([]); return; }
    setExpandedId(c.cli_id);
    try { const res = await api.get(`/api/clientes/${c.cli_id}/historial`); setHistorial(res.data || []); }
    catch { setHistorial([]); }
  };

  const openCreate = () => { setEditId(null); setForm({ cli_nombre: '', cli_apellido: '', cli_telefono: '', cli_direccion: '' }); setErrors({}); setShowForm(true); };
  const openEdit = (c: Cliente) => { setEditId(c.cli_id); setForm({ cli_nombre: c.cli_nombre, cli_apellido: c.cli_apellido, cli_telefono: c.cli_telefono, cli_direccion: c.cli_direccion }); setErrors({}); setShowForm(true); };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const nameErr = validateNombre(form.cli_nombre, 'Nombre');
    if (nameErr) newErrors.cli_nombre = nameErr;
    const apellidoErr = validateNombre(form.cli_apellido, 'Apellido');
    if (apellidoErr) newErrors.cli_apellido = apellidoErr;
    const phoneErr = validateTelefono(form.cli_telefono);
    if (phoneErr) newErrors.cli_telefono = phoneErr;
    if (!form.cli_direccion.trim()) {
      newErrors.cli_direccion = 'La dirección es requerida';
    } else if (form.cli_direccion.trim().length < 5) {
      newErrors.cli_direccion = 'La dirección debe tener al menos 5 caracteres';
    }
    // Validar que no exista otro cliente con el mismo nombre+apellido (solo en creación)
    if (!editId && form.cli_nombre.trim().length >= 2) {
      const nombreCompleto = `${form.cli_nombre.trim().toLowerCase()} ${form.cli_apellido.trim().toLowerCase()}`.replace(/\s+/g, ' ').trim();
      const duplicado = clientes.find(c => {
        const existente = `${c.cli_nombre} ${c.cli_apellido || ''}`.toLowerCase().replace(/\s+/g, ' ').trim();
        return existente === nombreCompleto;
      });
      if (duplicado) {
        newErrors.cli_nombre = `Ya existe un cliente con el nombre "${form.cli_nombre} ${form.cli_apellido}".`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setErrors({});
    if (!validateForm()) return;
    try {
      if (editId) {
        await api.put(`/api/clientes/${editId}`, form);
        addToast('Cliente actualizado correctamente');
        setShowForm(false);
        fetchClientes();
      } else {
        const res = await api.post('/api/clientes/', form);
        addToast('Cliente creado correctamente');
        setShowForm(false);
        // Si vino desde redirect (ej. desde agendar cita), volver con el nuevo cliente
        const redirect = searchParams.get('redirect');
        if (redirect) {
          const nuevoId = res.data?.cli_id;
          navigate(`/admin/${redirect}?nuevo_cliente_id=${nuevoId}`);
          return;
        }
        fetchClientes();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al guardar el cliente';
      setErrors(prev => ({ ...prev, api: msg }));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/clientes/${id}`);
      addToast('Cliente eliminado correctamente');
      fetchClientes();
    } catch (err) {
      console.error(err);
      addToast('Error al eliminar el cliente', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-white/30 text-sm mt-1">{clientes.length} registros · haz clic para ver historial</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(212,168,67,0.3)]">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input type="text" maxLength={50} value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50 placeholder-white/30" />
      </div>

      {loading ? (
        <div className="p-12 text-center text-white/30">Cargando...</div>
      ) : clientes.length === 0 ? (
        <div className={`${glassCard} p-12 text-center`}>
          <Users size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm">No hay clientes registrados</p>
          <p className="text-white/15 text-xs mt-1 mb-4">Agrega tu primer cliente para empezar</p>
          <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-salon-gold/10 border border-salon-gold/20 text-salon-gold text-xs font-medium hover:bg-salon-gold/20 transition-all">
            <Plus size={14} className="inline mr-1.5" />
            Registrar cliente
          </button>
        </div>
      ) : (
        /* ─── Directorio tipo agenda ─── */
        <div className="space-y-2">
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
          {clientes.map(c => (
            <div key={c.cli_id} className={`${glassCard} overflow-hidden transition-all`}>
              {/* Row principal - siempre visible */}
              <div
                onClick={() => toggleExpand(c)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(c); } }}
                role="button"
                tabIndex={0}
                className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar letra */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-salon-gold/20 to-salon-pink/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-salon-gold">{c.cli_nombre?.charAt(0)?.toUpperCase()}{c.cli_apellido?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.cli_nombre} {c.cli_apellido}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                      {c.cli_telefono && <span className="flex items-center gap-1"><Phone size={10} />{c.cli_telefono}</span>}
                      {c.cli_direccion && <span className="flex items-center gap-1"><MapPin size={10} />{c.cli_direccion}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); openEdit(c); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-salon-pink hover:bg-white/5 transition-all">
                    Editar
                  </button>
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(c.cli_id); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-white/5 transition-all">
                    Eliminar
                  </button>
                  <div className="text-white/20 ml-1">
                    {expandedId === c.cli_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Expandido: historial */}
              {expandedId === c.cli_id && (
                <div className="border-t border-white/5 px-4 lg:px-5 py-4 bg-white/[0.015]">
                  <div className="flex items-center gap-2 mb-3">
                    <History size={13} className="text-salon-gold" />
                    <span className="text-xs font-medium text-white/50">Historial de servicios</span>
                  </div>
                  {historial.length === 0 ? (
                    <p className="text-xs text-white/20 pl-5">Sin servicios realizados</p>
                  ) : (
                    <div className="space-y-2">
                      {historial.map((h: any) => (
                        <div key={h.cit_id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-white/50 text-xs">{h.cit_fecha}</span>
                            <span className="font-medium">{h.ser_nombre || 'Servicio'}</span>
                          </div>
                          <span className="text-salon-pink font-semibold text-xs">${h.dci_precio}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
        </div>
      )}

      {/* Confirmación de eliminación */}
      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar cliente"
        message="¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (confirmDelete !== null) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
        destructive
      />

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 modal-enter max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} Cliente</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-white/30" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white/40 text-xs mb-1">Nombre <span className="text-red-400">*</span></label>
                  <input type="text" maxLength={50} value={form.cli_nombre} onChange={e => { setForm(f => ({...f, cli_nombre: filterNombre(e.target.value)})); setErrors(prev => ({...prev, cli_nombre: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.cli_nombre ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.cli_nombre && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.cli_nombre}</p>}</div>
                <div><label className="block text-white/40 text-xs mb-1">Apellido <span className="text-red-400">*</span></label>
                  <input type="text" maxLength={50} value={form.cli_apellido} onChange={e => { setForm(f => ({...f, cli_apellido: filterNombre(e.target.value)})); setErrors(prev => ({...prev, cli_apellido: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.cli_apellido ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.cli_apellido && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.cli_apellido}</p>}</div>
              </div>
              <div><label className="block text-white/40 text-xs mb-1">Teléfono <span className="text-red-400">*</span></label>
                <input type="tel" maxLength={10} value={form.cli_telefono} onChange={e => { setForm(f => ({...f, cli_telefono: filterTelefono(e.target.value, 10)})); setErrors(prev => ({...prev, cli_telefono: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.cli_telefono ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.cli_telefono && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.cli_telefono}</p>}</div>
              <div><label className="block text-white/40 text-xs mb-1">Dirección <span className="text-red-400">*</span></label>
                <input type="text" maxLength={100} value={form.cli_direccion} onChange={e => { setForm(f => ({...f, cli_direccion: e.target.value})); setErrors(prev => ({...prev, cli_direccion: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.cli_direccion ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.cli_direccion && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.cli_direccion}</p>}</div>
              {errors.api && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errors.api}</span>
                  <button onClick={() => setErrors(prev => ({...prev, api: undefined}))} className="ml-auto text-red-300/50 hover:text-red-300"><X size={12} /></button>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-salon-pink text-white text-sm font-semibold hover:bg-salon-lavender disabled:opacity-40">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
