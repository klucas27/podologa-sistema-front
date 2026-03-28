import { useState, useCallback } from "react";
import { usePatients, useDeletePatient, useForceDeletePatient } from "./usePatients";

export function usePacientesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(
    undefined,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: patients = [], isLoading } = usePatients(debouncedSearch);
  const deletePatient = useDeletePatient();
  const forceDeletePatient = useForceDeletePatient();

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      // Debounce inline via setTimeout — the timeout is managed by the page component
    },
    [],
  );

  const handleSearchDebounced = useCallback((value: string) => {
    setDebouncedSearch(value || undefined);
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
    handleSearchDebounced,
    handleDelete,
    handleForceDelete,
  };
}
