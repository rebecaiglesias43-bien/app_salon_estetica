import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, total, limit, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Generar números de página visibles (máx 5)
  const getPageNumbers = () => {
    const nums: (number | '...')[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);

    if (start > 1) { nums.push(1); if (start > 2) nums.push('...'); }
    for (let i = start; i <= end; i++) nums.push(i);
    if (end < pages) { if (end < pages - 1) nums.push('...'); nums.push(pages); }

    return nums;
  };

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
      <p className="text-xs text-white/30">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((n, i) =>
          n === '...' ? (
            <span key={`dots-${i}`} className="px-1 text-white/20 text-xs">···</span>
          ) : (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`min-w-[30px] h-[30px] rounded-lg text-xs font-medium transition-all ${
                n === page
                  ? 'bg-salon-gold/15 text-salon-gold border border-salon-gold/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {n}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
