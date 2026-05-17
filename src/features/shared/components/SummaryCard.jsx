function SummaryCard({ title, value, subtitle, tone = "default" }) {
  return (
    <section className={`card summary-card summary-card--${tone}`}>
      <p className="summary-card__title">{title}</p>
      <div className="summary-card__meta">
        <p className="summary-card__value">{value}</p>
        {subtitle ? <p className="summary-card__subtitle">{subtitle}</p> : null}
      </div>
    </section>
  );
}

export default SummaryCard;
