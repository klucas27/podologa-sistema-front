import React, { useState } from 'react';
import { StockModal, Field } from './StockModal';
import { INPUT_CLASS, toNumber, todaySP, UNIT_LABELS } from './stockFormat';
import { useRegisterEntry } from '../hooks/useStock';
import type { Product } from '../services/stock.service';

export const EntryModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [receivedAt, setReceivedAt] = useState(todaySP());
  const [error, setError] = useState('');
  const entry = useRegisterEntry();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = toNumber(quantity);
    const cost = unitCost.trim() ? toNumber(unitCost) : null;
    if (!(qty > 0)) return setError('Informe a quantidade recebida.');
    if (cost !== null && (Number.isNaN(cost) || cost < 0)) return setError('Custo inválido.');
    if (!receivedAt) return setError('Informe a data de recebimento.');
    entry.mutate(
      { productId: product.id, quantity: qty, expiryDate: expiryDate || null, unitCost: cost, receivedAt },
      { onSuccess: onClose, onError: (err) => setError((err as { message?: string })?.message || 'Erro ao registrar entrada.') },
    );
  };

  return (
    <StockModal title={`Entrada — ${product.name}`} error={error} isSaving={entry.isPending} submitLabel="Registrar entrada" onSubmit={submit} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field id="ent-qty" label={`Quantidade (${UNIT_LABELS[product.unit]}) *`}><input id="ent-qty" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={INPUT_CLASS} /></Field>
        <Field id="ent-cost" label="Custo unitário (R$)"><input id="ent-cost" inputMode="decimal" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className={INPUT_CLASS} /></Field>
        <Field id="ent-expiry" label="Validade"><input id="ent-expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={INPUT_CLASS} /></Field>
        <Field id="ent-received" label="Recebido em *"><input id="ent-received" type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} className={INPUT_CLASS} /></Field>
      </div>
    </StockModal>
  );
};
