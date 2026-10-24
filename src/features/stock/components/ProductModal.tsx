import React, { useState } from 'react';
import { StockModal, Field } from './StockModal';
import { INPUT_CLASS, toNumber } from './stockFormat';
import { useCreateProduct, useUpdateProduct } from '../hooks/useStock';
import type { Product, StockUnit } from '../services/stock.service';

const UNITS: [StockUnit, string][] = [['un', 'Unidade'], ['ml', 'ml'], ['g', 'g'], ['par', 'Par']];

export const ProductModal: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
  const [name, setName] = useState(product?.name ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [unit, setUnit] = useState<StockUnit>(product?.unit ?? 'un');
  const [minQuantity, setMinQuantity] = useState(product ? String(product.minQuantity).replace('.', ',') : '0');
  const [error, setError] = useState('');
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = toNumber(minQuantity);
    if (!name.trim()) return setError('Informe o nome do produto.');
    if (Number.isNaN(min) || min < 0) return setError('Estoque mínimo inválido.');
    const data = { name: name.trim(), brand: brand.trim() || null, unit, minQuantity: min };
    const onError = (err: unknown) => setError((err as { message?: string })?.message || 'Erro ao salvar produto.');
    if (product) update.mutate({ id: product.id, data }, { onSuccess: onClose, onError });
    else create.mutate(data, { onSuccess: onClose, onError });
  };

  return (
    <StockModal title={product ? 'Editar produto' : 'Novo produto'} error={error} isSaving={create.isPending || update.isPending}
      submitLabel={product ? 'Salvar' : 'Cadastrar'} onSubmit={submit} onClose={onClose}>
      <Field id="prd-name" label="Nome *"><input id="prd-name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} placeholder="Ex.: Acetona" /></Field>
      <Field id="prd-brand" label="Marca"><input id="prd-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={INPUT_CLASS} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="prd-unit" label="Unidade *">
          <select id="prd-unit" value={unit} onChange={(e) => setUnit(e.target.value as StockUnit)} className={INPUT_CLASS}>
            {UNITS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field id="prd-min" label="Estoque mínimo"><input id="prd-min" inputMode="decimal" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} className={INPUT_CLASS} /></Field>
      </div>
    </StockModal>
  );
};
