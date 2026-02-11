export default function StatItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-2 border-b-1 border-default last:border-b-0 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-default-400" />}
        <span className="text-[12px] text-default-400">{label}</span>
      </div>
      <span className="text-[13px] font-medium text-default-700">{value}</span>
    </div>
  );
}
