import React from "react";
import {
  CalendarDays,
  Heart,
  Briefcase,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import type { Patient } from "@/types";
import {
  MARITAL_LABELS,
  formatCpf,
  formatPhone,
  formatDate,
} from "../constants";

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
};

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const address = [
    patient.street,
    patient.addressNumber,
    patient.neighborhood,
    patient.city,
    patient.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-lg flex-shrink-0">
          {patient.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {patient.fullName}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            CPF: {formatCpf(patient.cpf)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 mt-6">
        <InfoItem
          icon={<CalendarDays size={16} />}
          label="Data de nascimento"
          value={formatDate(patient.dateOfBirth)}
        />
        <InfoItem
          icon={<Heart size={16} />}
          label="Estado civil"
          value={MARITAL_LABELS[patient.maritalStatus]}
        />
        <InfoItem
          icon={<Briefcase size={16} />}
          label="Profissão"
          value={patient.occupation}
        />
        <InfoItem
          icon={<Phone size={16} />}
          label="Telefone"
          value={formatPhone(patient.phoneNumber)}
        />
        <InfoItem
          icon={<Mail size={16} />}
          label="E-mail"
          value={patient.email}
        />
        <InfoItem
          icon={<MapPin size={16} />}
          label="Endereço"
          value={address || null}
        />
        {patient.zipCode && (
          <InfoItem
            icon={<MapPin size={16} />}
            label="CEP"
            value={patient.zipCode}
          />
        )}
      </div>
    </div>
  );
};

export default PatientCard;
