export function DiscoveryProgress({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div aria-label={`${label}: ${value}% complete`}>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span>{label}</span>
        <span className="text-muted font-mono">{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="bg-panel-raised mt-2 h-2 overflow-hidden rounded-full"
      >
        <div
          className="bg-gold h-full rounded-full transition-[width]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
