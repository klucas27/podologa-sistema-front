import React, { useState } from 'react';
import { StockModal, Field } from './StockModal';
import { INPUT_CLASS, toNumber, formatQty, UNIT_LABELS } from './stockFormat';
import { useRegisterExit } from '../hooks/useStock';
import { ApiError } from '@/lib/api';
import type { Product } from '../services/stock.service';

export const ExitModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const exit = useRegisterExit();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = toNumber(quantity);
    if (!(qty > 0)) return setError('Informe a quantidade usada.');
    exit.mutate(
      { productId: product.id, quantity: qty, reason: reason.trim() || null },
      {
        onSuccess: onClose,
        onError: (err) => setError(err instanceof ApiError && err.status === 409
          ? `Saldo insuficiente (disponível: ${formatQty(product.balance, product.unit)}).`
          : (err as { message?: string })?.message || 'Erro ao registrar saída.'),
      },
    );
  };

  return (
    <StockModal title={`Saída — ${product.name}`} error={error} isSaving={exit.isPending} submitLabel="Registrar saída" onSubmit={submit} onClose={onClose}>
      <p className="text-sm text-gray-500">Usa primeiro o lote com validade mais próxima. Saldo: {formatQty(product.balance, product.unit)}.</p>
      <Field id="ext-qty" label={`Quantidade (${UNIT_LABELS[product.unit]}) *`}><input id="ext-qty" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={INPUT_CLASS} /></Field>
      <Field id="ext-reason" label="Motivo"><input id="ext-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={INPUT_CLASS} placeholder="Ex.: uso no atendimento, quebra" /></Field>
    </StockModal>
  );
};
