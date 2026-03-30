import React, { useState, useEffect } from "react";
import { UserCog, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import { usePatientProfessionals, useReplacePatientProfessionals } from "../hooks/usePatientProfessionals";
import { useActiveProfessionals } from "@/features/professionals/hooks/useProfessionals";

interface Props {
  patientId: string;
}

const PatientProfessionalAccess: React.FC<Props> = ({ patientId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: links = [], isLoading: isLoadingLinks } = usePatientProfessionals(patientId);
  const { data: allProfessionals = [], isLoading: isLoadingProfessionals } = useActiveProfessionals();
  const replaceMutation = useReplacePatientProfessionals(patientId);

  const linkedIds = links.map((l) => l.professionalId);
  const [selected, setSelected] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setSelected(linkedIds);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(linkedIds)]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setDirty(true);
  };

  const handleSave = () => {
    replaceMutation.mutate(selected, {
      onSuccess: () => setDirty(false),
    });
  };

  const isLoading = isLoadingLinks || isLoadingProfessionals;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center justify-between w-full px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <UserCog size={20} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Acesso de Profissionais
            </h3>
            <p className="text-xs text-gray-400">
              {links.length} profissional(is) com acesso
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-primary-400" />
            </div>
          ) : allProfessionals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">
              Nenhum profissional ativo cadastrado.
            </p>
          ) : (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allProfessionals.map((prof) => {
                  const checked = selected.includes(prof.id);
                  return (
                    <label
                      key={prof.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? "border-primary-300 bg-primary-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                          checked
                            ? "bg-primary-500 border-primary-500"
                            : "border-gray-300"
                        }`}
                      >
                        {checked && <Check size={12} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(prof.id)}
                        className="sr-only"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {prof.fullName}
                        </p>
                        {prof.specialty && (
                          <p className="text-xs text-gray-400 truncate">
                            {prof.specialty}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {dirty && (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={replaceMutation.isPending}
                  >
                    {replaceMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin mr-1" />
                    ) : null}
                    Salvar
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientProfessionalAccess;
