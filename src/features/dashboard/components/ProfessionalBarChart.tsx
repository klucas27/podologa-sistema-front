import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fmtMoney } from "./kpiFormat";

interface Props {
  title: string;
  data: { name: string | null; total: number }[];
}

/** Barras horizontais em R$ (faturamento ou comissões por profissional). */
const ProfessionalBarChart: React.FC<Props> = ({ title, data }) => (
  <section className="bg-white rounded-xl border border-gray-200 p-4" aria-label={title}>
    <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
    {data.length === 0 ? (
      <p className="text-sm text-gray-400 py-8 text-center">Sem dados no período.</p>
    ) : (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.map((d) => ({ name: d.name ?? "Sem serviço", total: d.total }))} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(v: number) => `R$ ${v}`} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#374151" }} />
            <Tooltip formatter={(v) => fmtMoney(Number(v))} />
            <Bar dataKey="total" name="Total" fill="#9e1b22" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </section>
);

export default ProfessionalBarChart;
