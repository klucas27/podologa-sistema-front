import React from "react";
import { Bug, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { BODY_PART_OPTIONS, BODY_PART_LABELS } from "../constants";
import type { Pathology, BodyPart } from "@/types";
import type { PathologyRow } from "../hooks/useConsultationExecutionPage";

interface PathologySectionProps {
  isClinicalEditable: boolean;
  pathologyRows: PathologyRow[];
  pathologies: Pathology[];
  onAdd: () => void;
  onUpdate: (idx: number, patch: Partial<PathologyRow>) => void;
  onRemove: (idx: number) => void;
}

const PathologySection: React.FC<PathologySectionProps> = ({
  isClinicalEditable,
  pathologyRows,
  pathologies,
  onAdd,
  onUpdate,
  onRemove,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bug size={18} className="text-orange-500" />
        <h2 className="text-base font-semibold text-gray-700">
          Patologias Identificadas
        </h2>
      </div>
      {isClinicalEditable && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onAdd}
        >
          Adicionar
        </Button>
      )}
    </div>

    {pathologyRows.length === 0 ? (
      <p className="text-sm text-gray-400 text-center py-3">
        Nenhuma patologia adicionada.
      </p>
    ) : (
      <div className="space-y-3">
        {pathologyRows.map((row, idx) => (
          <PathologyRowItem
            key={idx}
            row={row}
            idx={idx}
            pathologies={pathologies}
            isClinicalEditable={isClinicalEditable}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>
    )}
  </div>
);

const PathologyRowItem: React.FC<{
  row: PathologyRow;
  idx: number;
  pathologies: Pathology[];
  isClinicalEditable: boolean;
  onUpdate: (idx: number, patch: Partial<PathologyRow>) => void;
  onRemove: (idx: number) => void;
}> = ({ row, idx, pathologies, isClinicalEditable, onUpdate, onRemove }) => (
  <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <label className="block text-xs text-gray-500 mb-1">Patologia</label>
      {isClinicalEditable ? (
        <select
          aria-label="Selecionar patologia"
          value={row.pathologyId}
          onChange={(e) => onUpdate(idx, { pathologyId: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
        >
          <option value="">Selecione</option>
          {pathologies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-sm text-gray-700">
          {pathologies.find((p) => p.id === row.pathologyId)?.name ??
            row.pathologyId}
        </p>
      )}
    </div>
    <div className="sm:w-40">
      <label className="block text-xs text-gray-500 mb-1">Local</label>
      {isClinicalEditable ? (
        <select
          aria-label="Selecionar local do corpo"
          value={row.bodyPart}
          onChange={(e) =>
            onUpdate(idx, { bodyPart: e.target.value as BodyPart })
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
        >
          {BODY_PART_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-sm text-gray-700">{BODY_PART_LABELS[row.bodyPart]}</p>
      )}
    </div>
    <div className="flex-1">
      <label className="block text-xs text-gray-500 mb-1">Observação</label>
      {isClinicalEditable ? (
        <input
          type="text"
          value={row.notes}
          onChange={(e) => onUpdate(idx, { notes: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
          placeholder="Opcional"
        />
      ) : (
        <p className="text-sm text-gray-700">{row.notes || "—"}</p>
      )}
    </div>
    {isClinicalEditable && (
      <div className="flex items-end">
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition"
          title="Remover"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )}
  </div>
);

export default PathologySection;
