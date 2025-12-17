export default function QuickCheckoutLayout({ children }) {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-2 overflow-auto">
      {children}
    </div>
  );
}
