export default function ChartCard({ title, children, className = "" }) {
  return (
    <div
      className={`flex flex-col gap-2 p-2 bg-background rounded-lg border-1 border-default ${className}`}
    >
      {title && (
        <h3 className="text-[12px] font-medium text-default-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
