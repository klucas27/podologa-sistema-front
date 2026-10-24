import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, PackagePlus, PackageMinus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useStockAlerts, useDeleteProduct, useDiscardBatch } from '../hooks/useStock';
import { ProductModal } from '../components/ProductModal';
import { EntryModal } from '../components/EntryModal';
import { ExitModal } from '../components/ExitModal';
import { StockAlerts } from '../components/StockAlerts';
import { formatDay, formatQty, expiryTone, TONE_CLASS } from '../components/stockFormat';
import type { Product } from '../services/stock.service';

type Dialog = { kind: 'product'; product: Product | null } | { kind: 'entry' | 'exit'; product: Product } | null;

const EstoquePage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const canManage = role === 'admin' || role === 'recepcao';
  const { data: products = [], isLoading } = useProducts();
  const { data: alerts } = useStockAlerts();
  const deleteProduct = useDeleteProduct();
  const discard = useDiscardBatch();
  const [dialog, setDialog] = useState<Dialog>(null);

  const handleDelete = (p: Product) => {
    if (window.confirm(`Remover o produto "${p.name}"? O histórico de movimentos continua guardado.`)) deleteProduct.mutate(p.id);
  };
  const handleDiscard = (batchId: string, name: string) => {
    if (window.confirm(`Descartar o lote vencido de "${name}"? O saldo do lote vai a zero.`)) discard.mutate(batchId);
  };

  return (
    <ErrorBoundary featureName="Estoque">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estoque</h1>
            <p className="text-sm text-gray-500">Saldo por produto, validade dos lotes e saídas dos atendimentos.</p>
          </div>
          {isAdmin && <Button icon={<Plus size={16} />} onClick={() => setDialog({ kind: 'product', product: null })}>Novo produto</Button>}
        </div>

        {alerts && <StockAlerts alerts={alerts} canDiscard={canManage} onDiscard={handleDiscard} />}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : products.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">Nenhum produto cadastrado.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {products.map((p) => {
                const low = p.balance < p.minQuantity;
                return (
                  <li key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 sm:px-6">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}{p.brand && <span className="ml-2 text-xs font-normal text-gray-400">{p.brand}</span>}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5 text-xs text-gray-500">
                        <span className={low ? 'text-danger-600 font-semibold' : 'font-medium text-gray-700'}>Saldo {formatQty(p.balance, p.unit)}</span>
                        <span>Mínimo {formatQty(p.minQuantity, p.unit)}</span>
                        <span>Validade <span className={TONE_CLASS[expiryTone(p.nextExpiry)]}>{formatDay(p.nextExpiry)}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 flex-shrink-0">
                      <Button variant="secondary" size="sm" icon={<PackageMinus size={16} />} className="min-h-11" onClick={() => setDialog({ kind: 'exit', product: p })} aria-label={`Registrar saída de ${p.name}`}>Registrar saída</Button>
                      {canManage && <Button variant="secondary" size="sm" icon={<PackagePlus size={16} />} className="min-h-11" onClick={() => setDialog({ kind: 'entry', product: p })} aria-label={`Entrada de ${p.name}`}>Entrada</Button>}
                      {isAdmin && (
                        <>
                          <button type="button" onClick={() => setDialog({ kind: 'product', product: p })} className="p-3 rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600" aria-label={`Editar ${p.name}`}><Pencil size={18} /></button>
                          <button type="button" onClick={() => handleDelete(p)} className="p-3 rounded-lg text-gray-500 hover:bg-danger-50 hover:text-danger-600" aria-label={`Remover ${p.name}`}><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {dialog?.kind === 'product' && <ProductModal product={dialog.product} onClose={() => setDialog(null)} />}
        {dialog?.kind === 'entry' && <EntryModal product={dialog.product} onClose={() => setDialog(null)} />}
        {dialog?.kind === 'exit' && <ExitModal product={dialog.product} onClose={() => setDialog(null)} />}
      </div>
    </ErrorBoundary>
  );
};

export default EstoquePage;
