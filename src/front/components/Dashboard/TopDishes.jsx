import React from "react";

const calcMargin = (dish) => {
  // Si tu dish tiene total_cost y price (selling price) calcula margen.
  // Aquí uso placeholders: asumimos dish.total_cost y dish.price (si no existe mostrar '-')
  const cost = dish.total_cost ?? dish.cost_price ?? 0;
  const price = dish.price ?? dish.selling_price ?? null;
  if (!price) return null;
  const m = ((price - cost) / price) * 100;
  return Number.isFinite(m) ? m.toFixed(1) : null;
};

export default function TopDishes({ dishes = [] }) {
  // calculamos margen y ordenamos (si no hay price simplemente mostramos cost)
  const withMargin = dishes.map((d) => ({ ...d, marginPct: calcMargin(d) }));
  const sorted = [...withMargin].sort((a, b) => (b.marginPct ?? 0) - (a.marginPct ?? 0)).slice(0, 6);

  return (
    <div>
      <table className="table table-borderless mb-0">
        <tbody>
          {sorted.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td style={{ width: 120 }} className="text-end text-primary">{d.marginPct !== null ? `${d.marginPct} %` : "-"}</td>
            </tr>
          ))}
          {sorted.length === 0 && <tr><td colSpan={2} className="text-muted">No hay datos</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
