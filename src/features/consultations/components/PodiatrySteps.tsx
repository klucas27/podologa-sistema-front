import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";

interface Props {
  patientId: string;
  quoteDone: boolean;
  anamnesisDone: boolean | null; // null = perfil sem acesso à anamnese
  evolutionDone: boolean;
  finished: boolean;
}

/** Etapas da avaliação podológica; só indicam o andamento, sem travar a ordem. */
const PodiatrySteps: React.FC<Props> = ({ patientId, quoteDone, anamnesisDone, evolutionDone, finished }) => {
  const steps: { label: React.ReactNode; done: boolean }[] = [
    { label: "Orçamento", done: quoteDone },
    {
      label: <Link to={`/pacientes/${patientId}/anamnese/nova`} className="underline decoration-dotted hover:text-primary-700">Anamnese</Link>,
      done: !!anamnesisDone,
    },
    { label: "Evolução e retorno", done: evolutionDone },
    { label: "Finalizar", done: finished },
  ];

  return (
    <ol aria-label="Etapas da avaliação" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {steps.map((s, i) => (
        <li key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${s.done ? "border-green-200 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-600"}`}>
          {s.done ? <CheckCircle2 size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
          <span>{i + 1}. {s.label}</span>
          <span className="sr-only">{s.done ? "concluído" : "pendente"}</span>
        </li>
      ))}
    </ol>
  );
};

export default PodiatrySteps;
