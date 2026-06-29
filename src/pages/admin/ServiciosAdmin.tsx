import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit3, Trash2, X, Clock, Star, AlertCircle, Package, Tags, Scissors, Eye, Palette, Gem, Hand, Sparkles, Heart, Zap, Leaf, Sun, Moon } from 'lucide-react';
import { validateNombre, validatePositiveNumber, validatePositiveInt, validateMax, filterNombre, filterLetras, validateCategoriaNombre } from '../../lib/validation';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastContext';

interface Servicio { ser_id: number; ser_nombre: string; ser_descripcion: string; ser_precio: number; ser_duracion: number; ser_categoria?: string; }
const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function ServiciosAdmin() {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ ser_nombre?: string; ser_precio?: string; ser_duracion?: string; ser_categoria?: string; api?: string }>({});
  const [form, setForm] = useState({ ser_nombre: '', ser_descripcion: '', ser_precio: '', ser_duracion: '', ser_categoria: '' });
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [categorias, setCategorias] = useState<{ cat_id: number; cat_nombre: string; cat_slug: string; cat_icono?: string }[]>([]);

  const CATEGORY_ICON_OPTIONS = [
    { name: 'Scissors', component: Scissors, label: 'Cortes' },
    { name: 'Eye', component: Eye, label: 'Ojos' },
    { name: 'Palette', component: Palette, label: 'Coloración' },
    { name: 'Gem', component: Gem, label: 'Uñas' },
    { name: 'Hand', component: Hand, label: 'Masajes' },
    { name: 'Sparkles', component: Sparkles, label: 'Destellos' },
    { name: 'Star', component: Star, label: 'Estrella' },
    { name: 'Heart', component: Heart, label: 'Corazón' },
    { name: 'Zap', component: Zap, label: 'Rayo' },
    { name: 'Leaf', component: Leaf, label: 'Hoja' },
    { name: 'Sun', component: Sun, label: 'Sol' },
    { name: 'Moon', component: Moon, label: 'Luna' },
  ];
  const [showNewCategoria, setShowNewCategoria] = useState(false);
  const [newCategoriaNombre, setNewCategoriaNombre] = useState('');
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);
  const [editCategoriaNombre, setEditCategoriaNombre] = useState('');
  const [creandoCategoriaModal, setCreandoCategoriaModal] = useState(false);
  const [nuevaCategoriaModal, setNuevaCategoriaModal] = useState('');
  const [nuevoIconoCategoria, setNuevoIconoCategoria] = useState('Sparkles');
  const [editCategoriaIcono, setEditCategoriaIcono] = useState('');
  const [confirmDeleteCategoria, setConfirmDeleteCategoria] = useState<number | null>(null);

  const getCategoriaNombre = (slug: string): string => categorias.find(c => c.cat_slug === slug)?.cat_nombre || slug;

  const fetch = async () => { try { const params: any = { page, limit: 10 }; if (search) params.search = search; if (filtroCategoria) params.categoria = filtroCategoria; const res = await api.get('/api/servicios/', { params }); setServicios(res.data.data || []); setPages(res.data.pages || 1); setTotal(res.data.total || 0); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const fetchCategorias = async () => { try { const res = await api.get('/api/categorias/'); setCategorias(res.data || []); } catch (err) { console.error(err); } };
  useEffect(() => { setPage(1); }, [search, filtroCategoria]);
  useEffect(() => { fetch(); fetchCategorias(); }, [page, search, filtroCategoria]);
  const openCreate = () => { setEditId(null); setForm({ ser_nombre: '', ser_descripcion: '', ser_precio: '', ser_duracion: '', ser_categoria: '' }); setErrors({}); setShowForm(true); };
  const openEdit = (s: Servicio) => { setEditId(s.ser_id); setForm({ ser_nombre: s.ser_nombre, ser_descripcion: s.ser_descripcion || '', ser_precio: String(s.ser_precio), ser_duracion: String(s.ser_duracion || ''), ser_categoria: s.ser_categoria || '' }); setErrors({}); setShowForm(true); };
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const nameErr = validateNombre(form.ser_nombre, 'Nombre del servicio');
    if (nameErr) newErrors.ser_nombre = nameErr;
    const priceErr = validatePositiveNumber(form.ser_precio, 'Precio');
    if (priceErr) newErrors.ser_precio = priceErr;
    const priceMaxErr = validateMax(form.ser_precio, 'Precio', 300000, 'moneda');
    if (priceMaxErr) newErrors.ser_precio = priceMaxErr;
    // Duración requerida
    if (!form.ser_duracion) {
      newErrors.ser_duracion = 'La duración es requerida';
    } else {
      const durErr = validatePositiveInt(form.ser_duracion, 'Duración');
      if (durErr) newErrors.ser_duracion = durErr;
      const durMaxErr = validateMax(form.ser_duracion, 'Duración', 360);
      if (durMaxErr) newErrors.ser_duracion = durMaxErr;
    }
    // Categoría requerida
    if (!form.ser_categoria) {
      newErrors.ser_categoria = 'Debe seleccionar una categoría';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setErrors({});
    if (!validateForm()) return;
    try {
      const data = { ...form, ser_precio: parseFloat(form.ser_precio), ser_duracion: parseInt(form.ser_duracion), ser_categoria: form.ser_categoria };
      if (editId) {
        await api.put(`/api/servicios/${editId}`, data);
        addToast('Servicio actualizado correctamente');
      } else {
        await api.post('/api/servicios/', data);
        addToast('Servicio creado correctamente');
      }
      setShowForm(false);
      fetch();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al guardar';
      setErrors(prev => ({ ...prev, api: msg }));
      addToast(msg, 'error');
    }
  };
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/servicios/${id}`);
      addToast('Servicio eliminado correctamente');
      fetch();
    } catch (err) { console.error(err); addToast('Error al eliminar el servicio', 'error'); }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-white/30 text-sm mt-1">{total} servicios {(search || filtroCategoria) && '(filtrados)'} · precios y duración</p>
        </div>
        <div className="flex gap-2">
        <button onClick={() => { fetchCategorias(); setShowCategoriasModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm hover:bg-white/5 hover:text-white transition-all">
          <Tags size={16} /> Categorías
        </button>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(212,168,67,0.3)]">
          <Plus size={16} /> Nuevo servicio
        </button>
        </div>
      </div>

      {/* ─── Filtros ─── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <input type="text" maxLength={50} placeholder="Buscar servicio..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50">
          <option value="" className="bg-[#120c1a]">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.cat_id} value={c.cat_slug} className="bg-[#120c1a]">{c.cat_nombre}</option>
          ))}
        </select>
      </div>

      {loading ? <div className="p-12 text-center text-white/30">Cargando...</div> : (
        /* ─── Carta tipo menú ─── */
        <div className="max-w-3xl mx-auto">
          <div className="space-y-2">
            <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
            {servicios.map((s, i) => (
              <div key={s.ser_id} className={`${glassCard} p-0 overflow-hidden hover:border-salon-gold/20 transition-all`}>
                <div className="flex items-stretch">
                  {/* Decoración izquierda */}
                  <div className="w-1.5 bg-gradient-to-b from-salon-gold to-salon-pink flex-shrink-0" />

                  <div className="flex-1 flex items-center justify-between p-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{s.ser_nombre}</h3>
                        {s.ser_categoria && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                            s.ser_categoria === 'cortes' ? 'bg-salon-pink/15 text-salon-pink border border-salon-pink/20' :
                            s.ser_categoria === 'cejas' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' :
                            s.ser_categoria === 'coloracion' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' :
                            s.ser_categoria === 'uñas' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                            s.ser_categoria === 'masajes' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20' :
                            'bg-white/5 text-white/40 border border-white/10'
                          }`}>{getCategoriaNombre(s.ser_categoria)}</span>
                        )}
                        {i === 0 && <Star size={12} className="text-salon-gold fill-salon-gold" />}
                      </div>
                      {s.ser_descripcion && <p className="text-xs text-white/30 mt-0.5">{s.ser_descripcion}</p>}
                      {s.ser_duracion && (
                        <p className="text-[10px] text-white/20 flex items-center gap-1 mt-1.5">
                          <Clock size={10} /> {s.ser_duracion} min
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-xl font-bold text-salon-pink">${s.ser_precio}</span>
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/admin/servicio-productos?servicio_id=${s.ser_id}`)} className="p-2 rounded-lg text-white/30 hover:text-salon-gold hover:bg-white/5 transition-all" title="Ver productos asociados"><Package size={14} /></button>
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-white/30 hover:text-salon-pink hover:bg-white/5 transition-all"><Edit3 size={14} /></button>
                        <button onClick={() => setConfirmDelete(s.ser_id)} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar servicio"
        message="¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer."
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
              <h2 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} Servicio</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-white/30" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-white/40 text-xs mb-1">Nombre <span className="text-red-400">*</span></label>
                <input type="text" maxLength={80} value={form.ser_nombre} onChange={e => { setForm(f => ({...f, ser_nombre: filterNombre(e.target.value)})); setErrors(prev => ({...prev, ser_nombre: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.ser_nombre ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.ser_nombre && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.ser_nombre}</p>}</div>
              <div><label className="block text-white/40 text-xs mb-1">Descripción</label>
                <textarea maxLength={200} value={form.ser_descripcion} onChange={e => setForm(f => ({...f, ser_descripcion: e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white/40 text-xs mb-1">Precio ($) <span className="text-red-400">*</span></label>
                  <input type="number" inputMode="decimal" maxLength={10} value={form.ser_precio} onChange={e => { setForm(f => ({...f, ser_precio: e.target.value.replace(/[^0-9.]/g, '')})); setErrors(prev => ({...prev, ser_precio: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.ser_precio ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.ser_precio && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.ser_precio}</p>}</div>
                <div><label className="block text-white/40 text-xs mb-1">Duración (min) <span className="text-red-400">*</span></label>
                  <input type="number" inputMode="numeric" maxLength={3} value={form.ser_duracion} onChange={e => { setForm(f => ({...f, ser_duracion: e.target.value.replace(/\D/g, '')})); setErrors(prev => ({...prev, ser_duracion: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.ser_duracion ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.ser_duracion && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.ser_duracion}</p>}</div>
              </div>
              <div><label className="block text-white/40 text-xs mb-1">Categoría <span className="text-red-400">*</span></label>
                {showNewCategoria ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de la nueva categoría"
                      value={filterLetras(newCategoriaNombre)}
                      onChange={e => setNewCategoriaNombre(filterLetras(e.target.value))}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50"
                      autoFocus
                    />
                    <button
                      onClick={async () => {
                        const nombre = newCategoriaNombre.trim();
                        if (!nombre) return;
                        setCreandoCategoria(true);
                        try {
                          const res = await api.post('/api/categorias/', { cat_nombre: nombre });
                          const nueva = res.data.categoria;
                          await fetchCategorias();
                          setForm(f => ({...f, ser_categoria: nueva.cat_slug}));
                          setShowNewCategoria(false);
                          setNewCategoriaNombre('');
                        } catch (err: any) {
                          const msg = err.response?.data?.error || 'Error al crear categoría';
                          setErrors(prev => ({...prev, api: msg}));
                        } finally {
                          setCreandoCategoria(false);
                        }
                      }}
                      disabled={creandoCategoria || !newCategoriaNombre.trim()}
                      className="px-4 py-2.5 rounded-xl bg-salon-gold text-black text-sm font-semibold hover:bg-salon-gold/80 disabled:opacity-40 whitespace-nowrap"
                    >
                      {creandoCategoria ? '...' : 'Crear'}
                    </button>
                    <button
                      onClick={() => { setShowNewCategoria(false); setNewCategoriaNombre(''); }}
                      className="px-3 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <select value={form.ser_categoria} onChange={e => {
                      if (e.target.value === '__new__') {
                        setShowNewCategoria(true);
                        setNewCategoriaNombre('');
                      } else {
                        setForm(f => ({...f, ser_categoria: e.target.value}));
                      }
                    }}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.ser_categoria ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`}>
                      <option value="" className="bg-[#120c1a]">Seleccionar categoría</option>
                      {categorias.map(c => (
                        <option key={c.cat_id} value={c.cat_slug} className="bg-[#120c1a]">{c.cat_nombre}</option>
                      ))}
                      <option value="__new__" className="bg-[#120c1a] text-salon-gold">➕ Nueva categoría</option>
                    </select>
                    {errors.ser_categoria && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.ser_categoria}</p>}
                  </>
                )}</div>
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

      {/* ─── Modal de gestión de categorías ─── */}
      {showCategoriasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCategoriasModal(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 modal-enter max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Categorías</h2>
              <button onClick={() => setShowCategoriasModal(false)}><X size={18} className="text-white/30" /></button>
            </div>

            {/* Crear nueva categoría */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <input
                  type="text" placeholder="Nombre de la nueva categoría..."
                  value={filterLetras(nuevaCategoriaModal)}
                  onChange={e => setNuevaCategoriaModal(filterLetras(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50"
                />
                {nuevaCategoriaModal && validateCategoriaNombre(nuevaCategoriaModal) && (
                  <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />{validateCategoriaNombre(nuevaCategoriaModal)}
                  </p>
                )}
              </div>
              <button
                onClick={async () => {
                  const nombre = nuevaCategoriaModal.trim();
                  if (!nombre) return;
                  const err = validateCategoriaNombre(nombre);
                  if (err) { addToast(err, 'error'); return; }
                  setCreandoCategoriaModal(true);
                  try {
                    await api.post('/api/categorias/', { cat_nombre: nombre, cat_icono: nuevoIconoCategoria });
                    await fetchCategorias();
                    setNuevaCategoriaModal('');
                    setNuevoIconoCategoria('Sparkles');
                    addToast(`Categoría "${nombre}" creada`);
                  } catch (err: any) {
                    addToast(err.response?.data?.error || 'Error al crear', 'error');
                  } finally {
                    setCreandoCategoriaModal(false);
                  }
                }}
                disabled={creandoCategoriaModal || !nuevaCategoriaModal.trim() || !!validateCategoriaNombre(nuevaCategoriaModal)}
                className="px-4 py-2.5 rounded-xl bg-salon-gold text-black text-sm font-semibold hover:bg-salon-gold/80 disabled:opacity-40 whitespace-nowrap"
              >
                {creandoCategoriaModal ? '...' : 'Crear'}
              </button>
            </div>

            {/* Selector de ícono para nueva categoría */}
            <div className="mb-4">
              <label className="block text-white/40 text-xs mb-2">Ícono</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICON_OPTIONS.map(opt => {
                  const Icon = opt.component;
                  const selected = nuevoIconoCategoria === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setNuevoIconoCategoria(opt.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        selected
                          ? 'bg-salon-gold/20 border border-salon-gold/50 text-salon-gold'
                          : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                      }`}
                      title={opt.label}
                    >
                      <Icon size={14} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de categorías */}
            <div className="space-y-1.5">
              {categorias.map(cat => {
                const editando = editCategoriaId === cat.cat_id;
                return (
                  <div
                    key={cat.cat_id}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
                  >
                    {editando ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={filterLetras(editCategoriaNombre)}
                            onChange={e => setEditCategoriaNombre(filterLetras(e.target.value))}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-salon-gold/50"
                            autoFocus
                          />
                          {editCategoriaNombre && validateCategoriaNombre(editCategoriaNombre) && (
                            <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                              <AlertCircle size={10} />{validateCategoriaNombre(editCategoriaNombre)}
                            </p>
                          )}
                          <button
                            onClick={async () => {
                              const nombre = editCategoriaNombre.trim();
                              if (!nombre) return;
                              const err = validateCategoriaNombre(nombre);
                              if (err) { addToast(err, 'error'); return; }
                              try {
                                await api.put(`/api/categorias/${cat.cat_id}`, { cat_nombre: nombre, cat_icono: editCategoriaIcono });
                                await fetchCategorias();
                                setEditCategoriaId(null);
                                addToast('Categoría actualizada');
                              } catch (err: any) {
                                addToast(err.response?.data?.error || 'Error al actualizar', 'error');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-salon-gold text-black text-xs font-semibold"
                          >
                            Guardar
                          </button>
                          <button onClick={() => setEditCategoriaId(null)} className="text-white/30 hover:text-white">
                            <X size={14} />
                          </button>
                        </div>
                        {/* Selector de ícono en edición */}
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORY_ICON_OPTIONS.map(opt => {
                            const Icon = opt.component;
                            const selected = editCategoriaIcono === opt.name;
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => setEditCategoriaIcono(opt.name)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  selected
                                    ? 'bg-salon-gold/20 border border-salon-gold/50 text-salon-gold'
                                    : 'bg-white/5 border border-white/10 text-white/30 hover:bg-white/10 hover:text-white/60'
                                }`}
                                title={opt.label}
                              >
                                <Icon size={14} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-white/80 flex items-center gap-2">
                          {(() => {
                            const icono = cat.cat_icono || 'Sparkles';
                            const opt = CATEGORY_ICON_OPTIONS.find(o => o.name === icono);
                            if (opt) {
                              const Icon = opt.component;
                              return <Icon size={14} className="text-salon-gold" />;
                            }
                            return null;
                          })()}
                          {cat.cat_nombre}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditCategoriaId(cat.cat_id); setEditCategoriaNombre(cat.cat_nombre); setEditCategoriaIcono(cat.cat_icono || 'Sparkles'); }}
                            className="p-1.5 rounded-lg text-white/30 hover:text-salon-pink hover:bg-white/5 transition-all"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteCategoria(cat.cat_id)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmación eliminar categoría */}
      <ConfirmModal
        open={confirmDeleteCategoria !== null}
        title="Eliminar categoría"
        message="¿Estás seguro de eliminar esta categoría? No se eliminarán los servicios asociados, solo la categoría."
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (confirmDeleteCategoria !== null) {
            try {
              await api.delete(`/api/categorias/${confirmDeleteCategoria}`);
              await fetchCategorias();
              addToast('Categoría eliminada');
            } catch (err: any) {
              addToast(err.response?.data?.error || 'Error al eliminar', 'error');
            }
          }
          setConfirmDeleteCategoria(null);
        }}
        onCancel={() => setConfirmDeleteCategoria(null)}
        destructive
      />
    </div>
  );
}
