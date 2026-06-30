import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Truck, Plus, Edit3, Trash2, X, Phone, Mail, MapPin, AlertCircle, Package, PackageSearch } from 'lucide-react';
import { filterTelefono, validateTelefono, validateEmail } from '../../lib/validation';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastContext';

interface Proveedor { prv_id: number; prv_nombre: string; prv_telefono: string; prv_email: string; prv_direccion: string; total_productos?: number; }
const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function Proveedores() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ prv_nombre: '', prv_telefono: '', prv_email: '', prv_direccion: '' });
  const [errors, setErrors] = useState<{ prv_nombre?: string; prv_telefono?: string; prv_email?: string; prv_direccion?: string; api?: string }>({});
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    // Nombre: solo letras, números y espacios
    if (!form.prv_nombre || form.prv_nombre.trim() === '') {
      newErrors.prv_nombre = 'Nombre del proveedor es requerido';
    } else if (form.prv_nombre.trim().length < 2) {
      newErrors.prv_nombre = 'Nombre debe tener al menos 2 caracteres';
    } else if (form.prv_nombre.trim().length > 80) {
      newErrors.prv_nombre = 'Nombre no debe exceder 80 caracteres';
    } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(form.prv_nombre.trim())) {
      newErrors.prv_nombre = 'Nombre debe contener al menos una letra';
    } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,\-&]/.test(form.prv_nombre.trim())) {
      newErrors.prv_nombre = 'Nombre solo puede contener letras, números, espacios, puntos, comas, guiones y &';
    }
    // Teléfono: exactamente 10 dígitos
    if (!form.prv_telefono || form.prv_telefono.trim() === '') {
      newErrors.prv_telefono = 'Teléfono es requerido';
    } else {
      const phoneErr = validateTelefono(form.prv_telefono);
      if (phoneErr) newErrors.prv_telefono = phoneErr;
    }
    // Email
    if (form.prv_email) {
      const emailErr = validateEmail(form.prv_email);
      if (emailErr) newErrors.prv_email = emailErr;
    }
    // Dirección: requerida
    if (!form.prv_direccion || form.prv_direccion.trim() === '') {
      newErrors.prv_direccion = 'Dirección es requerida';
    }
    // Validar duplicados locales (contra datos ya cargados)
    if (!newErrors.prv_nombre && !newErrors.prv_telefono && !newErrors.prv_email && !newErrors.prv_direccion) {
      const existe = proveedores.some(p => {
        if (editId && p.prv_id === editId) return false;
        return p.prv_nombre?.trim().toLowerCase() === form.prv_nombre.trim().toLowerCase()
          && p.prv_telefono?.trim() === form.prv_telefono.trim()
          && p.prv_email?.trim().toLowerCase() === form.prv_email.trim().toLowerCase()
          && p.prv_direccion?.trim().toLowerCase() === form.prv_direccion.trim().toLowerCase();
      });
      if (existe) {
        newErrors.api = 'Ya existe un proveedor registrado con los mismos datos (nombre, teléfono, email y dirección)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetch = async (p?: number) => { try { const pg = p ?? page; const params: any = { page: pg, limit: 10 }; if (search) params.search = search; const res = await api.get('/api/proveedores/', { params }); setProveedores(res.data.data || []); setPages(res.data.pages || 1); setTotal(res.data.total || 0); } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetch(); }, [page, search]);

  // Auto-abrir formulario si vino desde inventario con ?nuevo=1
  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      openCreate();
      navigate('/admin/proveedores', { replace: true });
    }
  }, []);

  const openCreate = () => { setEditId(null); setForm({ prv_nombre: '', prv_telefono: '', prv_email: '', prv_direccion: '' }); setErrors({}); setShowForm(true); };
  const openEdit = (p: Proveedor) => { setEditId(p.prv_id); setForm({ prv_nombre: p.prv_nombre, prv_telefono: p.prv_telefono || '', prv_email: p.prv_email || '', prv_direccion: p.prv_direccion || '' }); setErrors({}); setShowForm(true); };
  const handleSave = async () => {
    setErrors({});
    // Si es edición, verificar si hubo cambios ANTES de validar
    if (editId) {
      const original = proveedores.find(p => p.prv_id === editId);
      if (original) {
        const sinCambios =
          original.prv_nombre === form.prv_nombre &&
          (original.prv_telefono || '') === form.prv_telefono &&
          (original.prv_email || '') === form.prv_email &&
          (original.prv_direccion || '') === form.prv_direccion;
        if (sinCambios) {
          addToast('No se realizaron cambios en la información');
          setShowForm(false);
          return;
        }
      }
    }
    if (!validateForm()) return;
    try {
      if (editId) {
        await api.put(`/api/proveedores/${editId}`, form);
        addToast('Proveedor actualizado correctamente');
        setShowForm(false);
        fetch();
      } else {
        await api.post('/api/proveedores/', form);
        addToast('Proveedor creado correctamente');
        setShowForm(false);
        setPage(1);
        fetch(1);
      }
    }
    catch (err: any) {
      const msg = err.response?.data?.error || 'Error al guardar';
      setErrors(prev => ({ ...prev, api: msg }));
      addToast(msg, 'error');
    }
  };
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/proveedores/${id}`);
      addToast('Proveedor eliminado correctamente');
      setConfirmDelete(null);
      fetch();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al eliminar el proveedor';
      console.error(err);
      addToast(msg, 'error');
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-2xl lg:text-3xl font-bold">Proveedores</h1><p className="text-white/30 text-sm mt-1">{total} proveedores registrados</p></div>
        <button onClick={openCreate} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-xs font-semibold hover:shadow-[0_0_20px_rgba(212,168,67,0.3)]"><Plus size={14} /> Nuevo</button>
      </div>

      <div className="relative max-w-xs mb-6">
        <input type="text" maxLength={50} placeholder="Buscar proveedor..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50" />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
      {loading ? <div className="p-8 text-center text-white/30">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedores.map(p => (
            <div key={p.prv_id} className={`${glassCard} p-5 hover:border-salon-gold/20 transition-all`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><Truck size={18} className="text-salon-gold" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{p.prv_nombre}</h3>
                  <span className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                    <PackageSearch size={10} /> {p.total_productos ?? 0} producto{(p.total_productos ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate(`/admin/proveedor-productos?prv_id=${p.prv_id}`)} className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1"><Package size={11} /> Productos</button>
              </div>
              <div className="space-y-1.5 text-xs text-white/30 mt-3">
                {p.prv_telefono && <p className="flex items-center gap-1"><Phone size={10} />{p.prv_telefono}</p>}
                {p.prv_email && <p className="flex items-center gap-1"><Mail size={10} />{p.prv_email}</p>}
                {p.prv_direccion && <p className="flex items-center gap-1"><MapPin size={10} />{p.prv_direccion}</p>}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-3">
                <button onClick={() => openEdit(p)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] hover:text-salon-pink hover:bg-white/10 transition-all"><Edit3 size={11} /> Editar</button>
                <button onClick={() => setConfirmDelete(p.prv_id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] hover:text-red-400 hover:bg-white/10 transition-all ml-auto"><Trash2 size={11} /> Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pages={pages} total={total} limit={10} onChange={n => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      {/* Confirmación de eliminación */}
      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar proveedor"
        message="¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (confirmDelete !== null) handleDelete(confirmDelete); }}
        onCancel={() => setConfirmDelete(null)}
        destructive
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} Proveedor</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-white/30" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-white/40 text-xs mb-1">Nombre</label>
                <input type="text" maxLength={80} value={form.prv_nombre} onChange={e => { setForm(f => ({...f, prv_nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,\-&]/g, '')})); setErrors(prev => ({...prev, prv_nombre: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.prv_nombre ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.prv_nombre && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.prv_nombre}</p>}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white/40 text-xs mb-1">Teléfono</label>
                  <input type="tel" maxLength={10} value={form.prv_telefono} onChange={e => { setForm(f => ({...f, prv_telefono: filterTelefono(e.target.value, 10)})); setErrors(prev => ({...prev, prv_telefono: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.prv_telefono ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.prv_telefono && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.prv_telefono}</p>}</div>
                <div><label className="block text-white/40 text-xs mb-1">Email</label>
                  <input type="email" maxLength={100} value={form.prv_email} onChange={e => { setForm(f => ({...f, prv_email: e.target.value})); setErrors(prev => ({...prev, prv_email: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.prv_email ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.prv_email && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.prv_email}</p>}</div>
              </div>
              <div><label className="block text-white/40 text-xs mb-1">Dirección</label>
                <input type="text" maxLength={100} value={form.prv_direccion} onChange={e => { setForm(f => ({...f, prv_direccion: e.target.value})); setErrors(prev => ({...prev, prv_direccion: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.prv_direccion ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.prv_direccion && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.prv_direccion}</p>}</div>
              {errors.api && <div className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/10 flex items-center gap-1"><AlertCircle size={10} />{errors.api}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
