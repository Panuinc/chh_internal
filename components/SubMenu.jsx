import Link from "next/link";

export default function SubMenu({
  href,
  text,
  icon: Icon,
  disabled = false,
  className = "",
}) {
  const baseClasses =
    "flex flex-col items-center justify-center w-36 h-36 p-2 gap-2 border shadow transition-all duration-200";

  const enabledClasses = "hover:scale-105 hover:shadow-lg cursor-pointer";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  const combinedClasses = `${baseClasses} ${
    disabled ? disabledClasses : enabledClasses
  } ${className}`;

  if (disabled) {
    return (
      <div className={combinedClasses}>
        {Icon && (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 border">
            <Icon />
          </div>
        )}
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border text-center">
          {text}
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className={combinedClasses}>
      {Icon && (
        <div className="flex items-center justify-center w-full h-full p-2 gap-2 border">
          <Icon />
        </div>
      )}
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border text-center">
        {text}
      </div>
    </Link>
  );
}
