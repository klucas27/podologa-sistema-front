import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SOURCE_LABELS } from "./kpiFormat";

/** Clientes novas por origem (como chegaram ao salão). */
const AcquisitionChart: React.FC<{ data: { source: string | null; count: number }[] }> = ({ data }) => (
  <section className="bg-white rounded-xl border border-gray-200 p-4" aria-label="Origem das clientes novas">
    <h3 className="text-sm font-semibold text-gray-700 mb-2">Origem das clientes novas</h3>
    {data.length === 0 ? (
      <p className="text-sm text-gray-400 py-8 text-center">Nenhuma cliente nova no período.</p>
    ) : (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.map((d) => ({ name: d.source ? SOURCE_LABELS[d.source] ?? d.source : "Não informado", count: d.count }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <Tooltip />
            <Bar dataKey="count" name="Clientes" fill="#c9867e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </section>
);

export default AcquisitionChart;
