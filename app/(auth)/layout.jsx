export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center w-full h-full p-2 gap-2 border">
      {children}
    </div>
  );
}
