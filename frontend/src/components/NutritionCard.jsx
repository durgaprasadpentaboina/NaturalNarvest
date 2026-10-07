const ROWS = [
  ['calories', 'Energy', 'kcal'], ['protein', 'Protein', 'g'], ['carbohydrates', 'Carbohydrates', 'g'],
  ['fiber', 'Dietary fibre', 'g'], ['fat', 'Fat', 'g'], ['iron', 'Iron', 'mg'], ['calcium', 'Calcium', 'mg'],
];

export default function NutritionCard({ info = {}, name }) {
  const macros = [['protein', 'bg-leaf-600'], ['carbohydrates', 'bg-turmeric-400'], ['fiber', 'bg-leaf-300'], ['fat', 'bg-bark-400']];
  const total = macros.reduce((s, [k]) => s + (info[k] || 0), 0) || 1;
  return (
    <section className="card p-5 sm:p-6" aria-label={`Nutrition information for ${name}`}>
      <h3 className="text-lg font-bold">Nutrition facts</h3>
      <p className="text-sm text-bark-600">Per {info.servingSize || '100 g'}, dry and uncooked</p>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-oat-200" aria-hidden>
        {macros.map(([k, c]) => <span key={k} className={c} style={{ width: `${((info[k] || 0) / total) * 100}%` }} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-bark-600">
        {[['Protein', 'bg-leaf-600'], ['Carbs', 'bg-turmeric-400'], ['Fibre', 'bg-leaf-300'], ['Fat', 'bg-bark-400']].map(([n, c]) => <span key={n} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${c}`} />{n}</span>)}
      </div>
      <dl className="mt-4 divide-y divide-oat-200">
        {ROWS.map(([k, label, unit]) => (
          <div key={k} className="flex justify-between py-2.5 text-[15px]"><dt className="text-bark-700">{label}</dt><dd className="font-semibold tabular-nums">{info[k] ?? 0} {unit}</dd></div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-bark-500">Typical values and may vary by harvest. This is food information, not medical advice.</p>
    </section>
  );
}
