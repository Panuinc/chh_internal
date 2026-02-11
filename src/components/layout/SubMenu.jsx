import Link from "next/link";

export default function SubMenu({
  href,
  text,
  icon: Icon,
  disabled = false,
  className = "",
}) {
  const baseClasses =
    "flex flex-col items-center justify-center gap-2 p-2 bg-background border border-default rounded-lg transition-all duration-100 hover:shadow-sm"; 

  const enabledClasses = "hover:border-default cursor-pointer group";
  const disabledClasses = "opacity-40 cursor-not-allowed";

  const combinedClasses = `${baseClasses} ${
    disabled ? disabledClasses : enabledClasses
  } ${className}`;

  const content = (
    <>
      {Icon && (
        <div className={`flex items-center justify-center w-9 h-9 rounded-md bg-default-100 text-default-500 ${!disabled ? "group-hover:bg-default-200 group-hover:text-default-700" : ""} transition-colors`}>
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
      )}
      <span className="text-[12px] font-medium text-default-600 text-center leading-tight">
        {text}
      </span>
    </>
  );

  if (disabled) {
    return <div className={combinedClasses}>{content}</div>;
  }

  return (
    <Link href={href} className={combinedClasses}>
      {content}
    </Link>
  );
}
