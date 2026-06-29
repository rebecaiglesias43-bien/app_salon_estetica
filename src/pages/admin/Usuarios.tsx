import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit3, Trash2, X, UserCircle, Mail, AlertCircle } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { filterNombre, validateNombre, validateEmail } from '../../lib/validation';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastContext';

interface Usuario {
  usu_id: number;
  usu_username: string;
  usu_email: string;
  usu_estado: string;
}

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ usu_username: '', usu_password: '', usu_email: '', usu_estado: 'activo' });
  const [errors, setErrors] = useState<{ usu_username?: string; usu_password?: string; usu_email?: string; api?: string }>({});
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const nameErr = validateNombre(form.usu_username, 'Usuario');
    if (nameErr) newErrors.usu_username = nameErr;
    const emailErr = validateEmail(form.usu_email);
    if (emailErr) newErrors.usu_email = emailErr;
    if (!editId && !form.usu_password) {
      newErrors.usu_password = 'La contraseña es requerida';
    } else if (form.usu_password && form.usu_password.length < 6) {
      newErrors.usu_password = 'Mínimo 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetch = async () => {
    try { const res = await api.get('/api/usuarios/', { params: { page, limit: 10 } }); setUsuarios(res.data.data || []); setPages(res.data.pages || 1); setTotal(res.data.total || 0); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [page]);

  const openCreate = () => {
    setEditId(null);
    setForm({ usu_username: '', usu_password: '', usu_email: '', usu_estado: 'activo' });
    setShowForm(true);
  };
  const openEdit = (u: Usuario) => {
    setEditId(u.usu_id);
    setForm({ usu_username: u.usu_username, usu_password: '', usu_email: u.usu_email || '', usu_estado: u.usu_estado || 'activo' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setErrors({});
    try {
      const data: any = { ...form };
      if (editId && !data.usu_password) delete data.usu_password; // no cambiar si está vacío
      if (data.usu_password) data.usu_password = data.usu_password; // enviar tal cual (backend hashea)
      if (editId) {
        await api.put(`/api/usuarios/${editId}`, data);
        addToast('Usuario actualizado correctamente');
      } else {
        await api.post('/api/usuarios/', data);
        addToast('Usuario creado correctamente');
      }
      setShowForm(false);
      fetch();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al guardar';
      setErrors({ api: msg });
      addToast(msg, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/usuarios/${id}`);
      addToast('Usuario eliminado correctamente');
      fetch();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al eliminar';
      setErrors({ api: msg });
      addToast(msg, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Usuarios</h1>
          <p className="text-white/30 text-sm mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(212,168,67,0.3)]">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {loading ? <div className="p-8 text-center text-white/30">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
          {usuarios.map(u => (
            <div key={u.usu_id} className={`${glassCard} p-5 hover:border-salon-gold/20 transition-all`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-salon-gold/20 to-salon-pink/20 border border-salon-gold/10 flex items-center justify-center">
                  <UserCircle size={20} className="text-salon-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{u.usu_username}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${u.usu_estado === 'activo' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {u.usu_estado}
                  </span>
                </div>
              </div>
              {u.usu_email && (
                <p className="text-xs text-white/30 flex items-center gap-1 mb-3"><Mail size={10} />{u.usu_email}</p>
              )}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button onClick={() => openEdit(u)} className="flex items-center gap-1 text-xs text-salon-pink hover:text-salon-lavender"><Edit3 size={12} /> Editar</button>
                <button onClick={() => setConfirmDelete(u.usu_id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 ml-auto"><Trash2 size={12} /> Eliminar</button>
              </div>
            </div>
          ))}
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
        </div>
      )}

      {/* Confirmación de eliminación */}
      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar usuario"
        message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (confirmDelete !== null) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
        destructive
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} Usuario</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-white/30" /></button>
            </div>
            <div className="space-y-3">
              {errors.api && <div className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/10 flex items-center gap-1"><AlertCircle size={10} />{errors.api}</div>}
              <div><label className="block text-white/40 text-xs mb-1">Username</label>
                <input type="text" maxLength={30} value={form.usu_username} onChange={e => { setForm(f => ({...f, usu_username: filterNombre(e.target.value)})); setErrors(prev => ({...prev, usu_username: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.usu_username ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.usu_username && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.usu_username}</p>}</div>
              <div><label className="block text-white/40 text-xs mb-1">{editId ? 'Nueva contraseña (dejar vacío = no cambiar)' : 'Contraseña'}</label>
                <input type="password" maxLength={50} value={form.usu_password} onChange={e => { setForm(f => ({...f, usu_password: e.target.value})); setErrors(prev => ({...prev, usu_password: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.usu_password ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.usu_password && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.usu_password}</p>}</div>
              <div><label className="block text-white/40 text-xs mb-1">Email (opcional)</label>
                <input type="email" maxLength={100} value={form.usu_email} onChange={e => setForm(f => ({...f, usu_email: e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50" placeholder="correo@ejemplo.com" /></div>
              <div><label className="block text-white/40 text-xs mb-1">Estado</label>
                <select value={form.usu_estado} onChange={e => setForm(f => ({...f, usu_estado: e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50">
                  <option value="activo" className="bg-[#120c1a]">Activo</option>
                  <option value="inactivo" className="bg-[#120c1a]">Inactivo</option>
                </select></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-salon-pink text-white text-sm font-semibold hover:bg-salon-lavender">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
