import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Muestra el botón de eliminar en rojo si es una acción destructiva */
  destructive?: boolean;
  /** Texto adicional informativo (ej: "Esta acción no se puede deshacer") */
  hint?: string;
}

export default function ConfirmModal({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  destructive = true,
  hint,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 modal-enter"
        onClick={e => e.stopPropagation()}
      >
        {/* Icono */}
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            destructive
              ? 'bg-red-500/10 border border-red-500/20'
              : 'bg-salon-gold/10 border border-salon-gold/20'
          }`}>
            <AlertTriangle size={28} className={
              destructive ? 'text-red-400' : 'text-salon-gold'
            } />
          </div>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-center mb-2">{title}</h3>

        {/* Mensaje */}
        <p className="text-sm text-white/50 text-center mb-1">{message}</p>

        {/* Hint opcional */}
        {hint && (
          <p className="text-[11px] text-white/30 text-center mb-4">{hint}</p>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              destructive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gradient-to-r from-salon-gold to-salon-pink text-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
