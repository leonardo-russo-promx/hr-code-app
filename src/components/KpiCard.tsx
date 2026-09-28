interface Props {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  imageUrl?: string;
}

export function KpiCard({ icon, label, value, hint, imageUrl }: Props) {
  return (
    <div className="kpi">
      <div className={`kpi__icon${imageUrl ? ' kpi__icon--photo' : ''}`} aria-hidden>
        {imageUrl ? <img src={imageUrl} alt="" className="kpi__avatar" /> : icon}
      </div>
      <div>
        <div className="kpi__label">{label}</div>
        <div className="kpi__value">{value}</div>
        {hint && <div className="kpi__hint">{hint}</div>}
      </div>
    </div>
  );
}
