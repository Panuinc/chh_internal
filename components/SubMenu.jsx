import Link from "next/link";

export default function SubMenu({ text, href, icon }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-36 h-36 p-2 gap-2 border-1 border-foreground rounded-xl shadow hover:scale-105 transition-transform"
    >
      {icon && (
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          {icon}
        </div>
      )}
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
        {text}
      </div>
    </Link>
  );
}