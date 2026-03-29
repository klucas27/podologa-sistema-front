import { useState, useCallback } from "react";
import { usePatients, useDeletePatient, useForceDeletePatient } from "./usePatients";
import { useDebounce } from "@/hooks/useDebounce";

export function usePacientesPage() {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce de 300ms: o input atualiza `search` imediatamente (UI responsiva),
  // mas a query só é disparada após 300ms de inatividade (menos requests).
  const debouncedSearch = useDebounce(search, 300);

  const { data: patients = [], isLoading } = usePatients(debouncedSearch || undefined);
  const deletePatient = useDeletePatient();
  const forceDeletePatient = useForceDeletePatient();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir o paciente "${name}"? Esta ação não pode ser desfeita.`,
      );
      if (!confirmed) return;

      setDeletingId(id);
      try {
        await deletePatient.mutateAsync(id);
      } catch {
        alert(
          "Erro ao excluir paciente. Verifique se não há registros vinculados.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [deletePatient],
  );

  const handleForceDelete = useCallback(
    async (id: string, name: string) => {
      const confirmed = window.confirm(
        `ATENÇÃO: Excluir definitivamente o paciente "${name}" e TODOS os registros vinculados (consultas, anamneses, cobranças, evoluções)?\n\nEsta ação é IRREVERSÍVEL.`,
      );
      if (!confirmed) return;

      setDeletingId(id);
      try {
        await forceDeletePatient.mutateAsync(id);
      } catch {
        alert("Erro ao excluir paciente definitivamente.");
      } finally {
        setDeletingId(null);
      }
    },
    [forceDeletePatient],
  );

  return {
    patients,
    search,
    isLoading,
    deletingId,
    handleSearchChange,
    handleDelete,
    handleForceDelete,
  };
}
