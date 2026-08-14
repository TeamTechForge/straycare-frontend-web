import "./KpiCard.css";

interface KpiCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

export default function KpiCard({ label, value, valueColor }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <p className="kpi-card-label">{label}</p>
      <p
        className="kpi-card-value"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </p>
    </div>
  );
}