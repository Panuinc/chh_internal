"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";

// ===== CONSTANTS =====
const GLUE_THICKNESS = 1;
const LOCK_BLOCK_HEIGHT = 400;
const LOCK_BLOCK_POSITION = 1000;

const STANDARD_THICKNESS = [33, 35, 40, 45];
const STANDARD_WIDTHS = [700, 800, 900, 1000];
const STANDARD_HEIGHTS = [2000, 2100, 2200, 2400, 2700, 3000];

const SURFACE_MATERIALS = [
  { value: "upvc", label: "UPVC" },
  { value: "wpc", label: "WPC" },
  { value: "laminate", label: "ลามิเนต" },
  { value: "plywood", label: "ไม้อัด" },
  { value: "melamine", label: "เมลามีน" },
];

const FRAME_TYPES = [
  { value: "rubberwood", label: "ยางพารา" },
  { value: "sadao", label: "สะเดา" },
  { value: "lvl", label: "LVL" },
];

const ERP_FRAMES = {
  rubberwood: [
    {
      code: "RM-14-01-26-30-200",
      desc: "ไม้ยางพาราจ๊อย 26x30x2040mm",
      thickness: 26,
      width: 30,
      length: 2040,
    },
    {
      code: "RM-14-01-26-30-230",
      desc: "ไม้ยางพาราจ๊อย 26x30x2310mm",
      thickness: 26,
      width: 30,
      length: 2310,
    },
    {
      code: "RM-14-01-26-30-250",
      desc: "ไม้ยางพาราจ๊อย 26x30x2510mm",
      thickness: 26,
      width: 30,
      length: 2510,
    },
    {
      code: "RM-14-01-26-32-200",
      desc: "ไม้ยางพาราจ๊อย 26x32x2040mm",
      thickness: 26,
      width: 32,
      length: 2040,
    },
    {
      code: "RM-14-01-26-32-230",
      desc: "ไม้ยางพาราจ๊อย 26x32x2310mm",
      thickness: 26,
      width: 32,
      length: 2310,
    },
    {
      code: "RM-14-01-26-32-250",
      desc: "ไม้ยางพาราจ๊อย 26x32x2510mm",
      thickness: 26,
      width: 32,
      length: 2510,
    },
    {
      code: "RM-14-01-28-50-200",
      desc: "ไม้ยางพาราจ๊อย 28x50x2040mm",
      thickness: 28,
      width: 50,
      length: 2040,
    },
    {
      code: "RM-14-01-28-50-230",
      desc: "ไม้ยางพาราจ๊อย 28x50x2310mm",
      thickness: 28,
      width: 50,
      length: 2310,
    },
    {
      code: "RM-14-01-28-50-230B",
      desc: "ไม้ยางพาราจ๊อยB 28x50x2310mm",
      thickness: 28,
      width: 50,
      length: 2310,
    },
    {
      code: "RM-14-01-28-50-250",
      desc: "ไม้ยางพาราจ๊อย 28x50x2510mm",
      thickness: 28,
      width: 50,
      length: 2510,
    },
    {
      code: "RM-14-01-32-50-200",
      desc: "ไม้ยางพาราจ๊อย 32x50x2040mm",
      thickness: 32,
      width: 50,
      length: 2040,
    },
    {
      code: "RM-14-01-32-50-230",
      desc: "ไม้ยางพาราจ๊อย 32x50x2310mm",
      thickness: 32,
      width: 50,
      length: 2310,
    },
    {
      code: "RM-14-01-32-50-250",
      desc: "ไม้ยางพาราจ๊อย 32x50x2510mm",
      thickness: 32,
      width: 50,
      length: 2510,
    },
  ],
  sadao: [
    {
      code: "RM-14-04-32-50-200",
      desc: "ไม้สะเดาจ๊อย 32x50x2040mm",
      thickness: 32,
      width: 50,
      length: 2040,
    },
    {
      code: "RM-14-04-32-50-225",
      desc: "ไม้สะเดาจ๊อย 32x50x2250mm",
      thickness: 32,
      width: 50,
      length: 2250,
    },
    {
      code: "RM-14-04-32-50-230",
      desc: "ไม้สะเดาจ๊อย 32x50x2300mm",
      thickness: 32,
      width: 50,
      length: 2300,
    },
    {
      code: "RM-14-04-32-50-250",
      desc: "ไม้สะเดาจ๊อย 32x50x2500mm",
      thickness: 32,
      width: 50,
      length: 2500,
    },
  ],
  lvl: [
    {
      code: "RM-16-19-2.9-3.4-258",
      desc: "ไม้อัด LVL 29x34x2580mm",
      thickness: 29,
      width: 34,
      length: 2580,
    },
    {
      code: "RM-16-19-2.9-3.5-202",
      desc: "ไม้อัด LVL 29x35x2020mm",
      thickness: 29,
      width: 35,
      length: 2020,
    },
    {
      code: "RM-16-19-2.9-3.5-244",
      desc: "ไม้อัด LVL 29x35x2440mm",
      thickness: 29,
      width: 35,
      length: 2440,
    },
    {
      code: "RM-16-19-2.9-3.5-258",
      desc: "ไม้อัด LVL 29x35x2580mm",
      thickness: 29,
      width: 35,
      length: 2580,
    },
    {
      code: "RM-16-19-3.2-3.5-202",
      desc: "ไม้อัด LVL 32x35x2020mm",
      thickness: 32,
      width: 35,
      length: 2020,
    },
    {
      code: "RM-16-19-3.2-3.5-244",
      desc: "ไม้อัด LVL 32x35x2440mm",
      thickness: 32,
      width: 35,
      length: 2440,
    },
  ],
};

const SECTION_COLORS = {
  blue: "from-blue-600 to-blue-700",
  green: "from-green-600 to-green-700",
  amber: "from-amber-500 to-amber-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
  indigo: "from-indigo-600 to-indigo-700",
  gray: "from-gray-400 to-gray-500",
  slate: "from-slate-700 to-slate-800",
};

// ===== UTILITY FUNCTIONS =====
const formatDimension = (t, w, h, separator = "×") =>
  `${t || "-"}${separator}${w || "-"}${separator}${h || "-"}`;

const getMaterialLabel = (materials, value) =>
  materials.find((m) => m.value === value)?.label || "-";

const getEfficiencyColor = (efficiency) => {
  const val = parseFloat(efficiency);
  if (val >= 80) return { bg: "bg-green-500", text: "text-green-600" };
  if (val >= 60) return { bg: "bg-yellow-500", text: "text-yellow-600" };
  return { bg: "bg-red-500", text: "text-red-600" };
};

// ===== REUSABLE UI COMPONENTS =====

// Uncontrolled number input - ไม่ re-render ขณะพิมพ์
const NumberInput = ({ value, onChange, className }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleBlur = (e) => onChange(parseFloat(e.target.value) || 0);
  const handleKeyDown = (e) => e.key === "Enter" && e.target.blur();

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      defaultValue={value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
    />
  );
};

// Button group for selecting values
const SelectButtonGroup = ({
  options,
  value,
  onChange,
  gridCols = "grid-cols-4",
  renderLabel,
}) => (
  <div className={`grid ${gridCols} gap-1`}>
    {options.map((opt) => {
      const optValue = typeof opt === "object" ? opt.value : opt;
      const optLabel = renderLabel
        ? renderLabel(opt)
        : typeof opt === "object"
          ? opt.label
          : opt;
      return (
        <button
          key={optValue}
          onClick={() => onChange(optValue)}
          className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${
            value === optValue
              ? "bg-current-theme text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          style={
            value === optValue
              ? { backgroundColor: "var(--theme-color, #2563eb)" }
              : {}
          }
        >
          {optLabel}
        </button>
      );
    })}
  </div>
);

// Quick select buttons with custom input
const QuickSelectWithInput = ({
  label,
  options,
  value,
  onChange,
  unit = "mm",
  themeColor = "#2563eb",
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
    </label>
    <div className="flex flex-wrap gap-1 mb-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
            value === opt
              ? "text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          style={value === opt ? { backgroundColor: themeColor } : {}}
        >
          {opt}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-1">
      <NumberInput
        value={value}
        onChange={onChange}
        className="flex-1 px-2 py-1.5 border rounded text-center text-sm font-bold focus:ring-2"
        style={{ "--tw-ring-color": themeColor }}
      />
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  </div>
);

// Info row component
const InfoRow = ({ label, value, className = "" }) => (
  <div className={`flex justify-between ${className}`}>
    <span>{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

// Stat card component
const StatCard = ({
  value,
  label,
  bgColor = "bg-gray-50",
  textColor = "text-gray-600",
}) => (
  <div className={`p-2 ${bgColor} rounded-lg text-center`}>
    <div className={`${textColor} font-bold text-lg`}>{value}</div>
    <div className="text-gray-500">{label}</div>
  </div>
);

// Section card wrapper
const SectionCard = ({ text, title, icon, children, color = "blue" }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div className={`bg-gradient-to-r ${SECTION_COLORS[color]} px-4 py-2.5`}>
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <span className="bg-white text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
          {text}
        </span>
        <span>{icon}</span>
        {title}
      </h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// Info box with colored background
const InfoBox = ({ children, color = "blue", className = "" }) => {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
    purple: "bg-purple-50 border-purple-300 text-purple-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };
  return (
    <div
      className={`p-2 rounded-lg border text-xs ${colorMap[color]} ${className}`}
    >
      {children}
    </div>
  );
};

// Checkbox with label
const CheckboxOption = ({ checked, onChange, label, sublabel, isActive }) => (
  <label
    className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
      isActive ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-200"
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-yellow-500 rounded"
    />
    <div>
      <span className="text-xs font-medium">{label}</span>
      {sublabel && (
        <span className="text-xs text-yellow-600 ml-1">{sublabel}</span>
      )}
    </div>
  </label>
);

// Radio option card
const RadioOptionCard = ({
  name,
  checked,
  onChange,
  label,
  sublabel,
  isActive,
}) => (
  <label
    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
      isActive
        ? "bg-red-50 border-red-400"
        : "bg-gray-50 border-gray-200 hover:border-gray-300"
    }`}
  >
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-red-500"
    />
    <span className="text-xs font-medium">{label}</span>
    {sublabel && (
      <span className="text-[10px] text-red-500 font-bold">{sublabel}</span>
    )}
  </label>
);

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-[95vw] max-h-[95vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg transition-colors"
        >
          ✕
        </button>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// Empty state placeholder
const EmptyState = ({ icon, title, subtitle, children }) => (
  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
    {icon}
    <p className="text-lg font-medium mb-2">{title}</p>
    <p className="text-sm">{subtitle}</p>
    {children}
  </div>
);

// ===== SVG COMPONENTS =====

// Dimension line for engineering drawings
const DimLine = ({
  x1,
  y1,
  x2,
  y2,
  value,
  offset = 25,
  vertical = false,
  color = "#000",
  fontSize = 9,
  unit = "",
}) => {
  const arrowSize = 3;
  const displayValue = unit ? `${value}${unit}` : value;
  const textWidth = String(displayValue).length * 4 + 8;

  if (vertical) {
    const lineX = x1 + offset;
    const midY = (y1 + y2) / 2;
    return (
      <g className="dimension">
        <line
          x1={x1 + 2}
          y1={y1}
          x2={lineX + 3}
          y2={y1}
          stroke={color}
          strokeWidth="0.4"
        />
        <line
          x1={x1 + 2}
          y1={y2}
          x2={lineX + 3}
          y2={y2}
          stroke={color}
          strokeWidth="0.4"
        />
        <line
          x1={lineX}
          y1={y1}
          x2={lineX}
          y2={y2}
          stroke={color}
          strokeWidth="0.6"
        />
        <polygon
          points={`${lineX},${y1} ${lineX - arrowSize},${y1 + arrowSize * 1.5} ${lineX + arrowSize},${y1 + arrowSize * 1.5}`}
          fill={color}
        />
        <polygon
          points={`${lineX},${y2} ${lineX - arrowSize},${y2 - arrowSize * 1.5} ${lineX + arrowSize},${y2 - arrowSize * 1.5}`}
          fill={color}
        />
        <rect
          x={lineX - textWidth / 2}
          y={midY - 6}
          width={textWidth}
          height="12"
          fill="white"
        />
        <text
          x={lineX}
          y={midY + 3}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="500"
          fill={color}
        >
          {displayValue}
        </text>
      </g>
    );
  }

  const lineY = y1 + offset;
  const midX = (x1 + x2) / 2;
  return (
    <g className="dimension">
      <line
        x1={x1}
        y1={y1 + 2}
        x2={x1}
        y2={lineY + 3}
        stroke={color}
        strokeWidth="0.4"
      />
      <line
        x1={x2}
        y1={y1 + 2}
        x2={x2}
        y2={lineY + 3}
        stroke={color}
        strokeWidth="0.4"
      />
      <line
        x1={x1}
        y1={lineY}
        x2={x2}
        y2={lineY}
        stroke={color}
        strokeWidth="0.6"
      />
      <polygon
        points={`${x1},${lineY} ${x1 + arrowSize * 1.5},${lineY - arrowSize} ${x1 + arrowSize * 1.5},${lineY + arrowSize}`}
        fill={color}
      />
      <polygon
        points={`${x2},${lineY} ${x2 - arrowSize * 1.5},${lineY - arrowSize} ${x2 - arrowSize * 1.5},${lineY + arrowSize}`}
        fill={color}
      />
      <rect
        x={midX - textWidth / 2}
        y={lineY - 6}
        width={textWidth}
        height="12"
        fill="white"
      />
      <text
        x={midX}
        y={lineY + 3}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="500"
        fill={color}
      >
        {displayValue}
      </text>
    </g>
  );
};

// Center line for drawings
const CenterLine = ({ x1, y1, x2, y2 }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke="#000"
    strokeWidth="0.3"
    strokeDasharray="10,3,2,3"
  />
);

// Hatch pattern lines
const HatchLines = ({
  x,
  y,
  width,
  height,
  count,
  color = "#ddd",
  direction = "diagonal",
}) => (
  <>
    {[...Array(count)].map((_, i) => (
      <line
        key={i}
        x1={x + 1}
        y1={y + i * (height / count)}
        x2={x + width - 1}
        y2={y + i * (height / count) + 4}
        stroke={color}
        strokeWidth="0.2"
      />
    ))}
  </>
);

// Lock block SVG element
const LockBlockSVG = ({ x, y, width, height, strokeColor = "#c62828" }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="#ffcdd2"
      stroke={strokeColor}
      strokeWidth="0.8"
    />
    <line
      x1={x}
      y1={y}
      x2={x + width}
      y2={y + height}
      stroke={strokeColor}
      strokeWidth="0.4"
    />
    <line
      x1={x + width}
      y1={y}
      x2={x}
      y2={y + height}
      stroke={strokeColor}
      strokeWidth="0.4"
    />
  </g>
);

// Position annotation
const PositionAnnotation = ({ x, y, value, align = "end" }) => (
  <g>
    <line x1={x - 10} y1={y} x2={x} y2={y} stroke="#666" strokeWidth="0.4" />
    <text x={x - 13} y={y + 3} fontSize="7" fill="#666" textAnchor={align}>
      {value}
    </text>
  </g>
);

// ===== CUSTOM HOOKS =====

// Frame selection logic
const useFrameSelection = (
  frameType,
  doorThickness,
  surfaceThickness,
  doorHeight,
) => {
  return useMemo(() => {
    const S = parseFloat(surfaceThickness) || 0;
    const requiredThickness = doorThickness - (S + GLUE_THICKNESS) * 2;
    const requiredLength = doorHeight;
    const frames = ERP_FRAMES[frameType] || [];

    const filterAndSort = (frameList) =>
      frameList
        .filter((f) => f.length >= requiredLength)
        .sort((a, b) => a.length - b.length);

    const findSpliceable = (frameList) => {
      const sorted = [...frameList].sort((a, b) => b.length - a.length);
      for (const frame of sorted) {
        const spliceOverlap = 100;
        const totalLength = frame.length * 2 - spliceOverlap;
        if (totalLength >= requiredLength) {
          return {
            frame,
            needSplice: true,
            spliceCount: 2,
            spliceOverlap,
            effectiveLength: totalLength,
            splicePosition: Math.round(requiredLength / 2),
          };
        }
      }
      return null;
    };

    const createFrameResult = (
      frameList,
      isFlipped,
      planeAmount,
      needSplice = false,
      spliceInfo = null,
    ) => {
      const mapFrame = (f) => ({
        ...f,
        useThickness: isFlipped
          ? f.width - planeAmount
          : f.thickness - planeAmount,
        useWidth: isFlipped ? f.thickness : f.width,
        isFlipped,
        planeAmount,
        needSplice,
        ...(spliceInfo && {
          spliceCount: spliceInfo.spliceCount,
          spliceOverlap: spliceInfo.spliceOverlap,
          splicePosition: spliceInfo.splicePosition,
          effectiveLength: spliceInfo.effectiveLength,
        }),
        displaySize: createDisplaySize(f, isFlipped, planeAmount, needSplice),
      });

      return {
        frames: needSplice
          ? [mapFrame(spliceInfo.frame)]
          : frameList.map(mapFrame),
        needFlip: isFlipped,
        needPlane: planeAmount > 0,
        needSplice,
      };
    };

    const createDisplaySize = (f, isFlipped, planeAmount, needSplice) => {
      const parts = [];
      if (isFlipped) parts.push("พลิก");
      if (planeAmount > 0) parts.push(`ไส ${planeAmount}mm`);
      if (needSplice) parts.push("ต่อ 2 ท่อน");
      const suffix = parts.length > 0 ? ` (${parts.join("+")})` : "";
      return isFlipped
        ? `${f.width}×${f.thickness}×${f.length}${suffix}`
        : `${f.thickness}×${f.width}×${f.length}${suffix}`;
    };

    // Try each matching strategy in order
    const strategies = [
      // 1. Exact match
      () => {
        const exact = filterAndSort(
          frames.filter((f) => f.thickness === requiredThickness),
        );
        return exact.length > 0 ? createFrameResult(exact, false, 0) : null;
      },
      // 2. Flip exact
      () => {
        const flipExact = filterAndSort(
          frames.filter((f) => f.width === requiredThickness),
        );
        return flipExact.length > 0
          ? createFrameResult(flipExact, true, 0)
          : null;
      },
      // 3. Plane thicker
      () => {
        const thicker = frames
          .filter(
            (f) =>
              f.thickness > requiredThickness && f.length >= requiredLength,
          )
          .sort((a, b) =>
            a.thickness !== b.thickness
              ? a.thickness - b.thickness
              : a.length - b.length,
          );
        return thicker.length > 0
          ? createFrameResult(
              thicker,
              false,
              thicker[0].thickness - requiredThickness,
            )
          : null;
      },
      // 4. Flip and plane
      () => {
        const flipPlane = frames
          .filter(
            (f) => f.width > requiredThickness && f.length >= requiredLength,
          )
          .sort((a, b) =>
            a.width !== b.width ? a.width - b.width : a.length - b.length,
          );
        return flipPlane.length > 0
          ? createFrameResult(
              flipPlane,
              true,
              flipPlane[0].width - requiredThickness,
            )
          : null;
      },
      // 5-8. Splice variations
      () => {
        const splice = findSpliceable(
          frames.filter((f) => f.thickness === requiredThickness),
        );
        return splice ? createFrameResult([], false, 0, true, splice) : null;
      },
      () => {
        const splice = findSpliceable(
          frames.filter((f) => f.width === requiredThickness),
        );
        return splice ? createFrameResult([], true, 0, true, splice) : null;
      },
      () => {
        const splice = findSpliceable(
          frames.filter((f) => f.thickness > requiredThickness),
        );
        return splice
          ? createFrameResult(
              [],
              false,
              splice.frame.thickness - requiredThickness,
              true,
              splice,
            )
          : null;
      },
      () => {
        const splice = findSpliceable(
          frames.filter((f) => f.width > requiredThickness),
        );
        return splice
          ? createFrameResult(
              [],
              true,
              splice.frame.width - requiredThickness,
              true,
              splice,
            )
          : null;
      },
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result) return result;
    }

    const maxLength = Math.max(...frames.map((f) => f.length), 0);
    const maxSpliceLength = maxLength > 0 ? maxLength * 2 - 100 : 0;
    return {
      frames: [],
      needFlip: false,
      needPlane: false,
      needSplice: false,
      noMatch: true,
      reason:
        maxLength > 0
          ? `ไม่มีไม้ที่ใช้ได้ (ต้องการ ≥${requiredLength}mm, ต่อได้สูงสุด ${maxSpliceLength}mm)`
          : `ไม่มีไม้ความหนา ${requiredThickness}mm`,
    };
  }, [frameType, doorThickness, surfaceThickness, doorHeight]);
};

// Calculations hook
const useCalculations = (params) => {
  const {
    doorThickness,
    doorWidth,
    doorHeight,
    surfaceThickness,
    hasDoubleFrame,
    currentFrame,
    lockBlockLeft,
    lockBlockRight,
    lockBlockPiecesPerSide,
  } = params;

  return useMemo(() => {
    const T = parseFloat(doorThickness) || 0;
    const W = parseFloat(doorWidth) || 0;
    const H = parseFloat(doorHeight) || 0;
    const S = parseFloat(surfaceThickness) || 0;

    const totalSurfaceThickness = (S + GLUE_THICKNESS) * 2;
    const frameThickness = T - totalSurfaceThickness;
    const F = currentFrame.useWidth || 0;
    const R = currentFrame.useThickness || 0;
    const DF = hasDoubleFrame ? F : 0;
    const totalFrameWidth = F + DF;
    const innerWidth = W - 2 * totalFrameWidth;
    const innerHeight = H - 2 * totalFrameWidth;
    const doorArea = W * H;
    const railSections = H >= 2400 ? 4 : 3;

    // Lock block zone calculations
    const lockBlockZoneTop = LOCK_BLOCK_POSITION - LOCK_BLOCK_HEIGHT / 2;
    const lockBlockZoneBottom = LOCK_BLOCK_POSITION + LOCK_BLOCK_HEIGHT / 2;
    const lockBlockZoneBuffer = 50;
    const avoidZoneTop = lockBlockZoneTop - lockBlockZoneBuffer;
    const avoidZoneBottom = lockBlockZoneBottom + lockBlockZoneBuffer;

    // Calculate rail positions
    const railPositions = [];
    const railPositionsOriginal = [];
    const railThickness = currentFrame.useWidth || 50;
    const hasLockBlock = lockBlockLeft || lockBlockRight;

    for (let i = 1; i < railSections; i++) {
      const eqPosition = Math.round((H * i) / railSections);
      railPositionsOriginal.push(eqPosition);

      const railTop = eqPosition + railThickness / 2;
      const railBottom = eqPosition - railThickness / 2;
      const hitLockBlock =
        hasLockBlock &&
        railBottom <= avoidZoneBottom &&
        railTop >= avoidZoneTop;

      if (hitLockBlock) {
        const distToTop = eqPosition - avoidZoneTop;
        const distToBottom = avoidZoneBottom - eqPosition;
        railPositions.push(
          distToTop <= distToBottom
            ? avoidZoneTop - railThickness / 2
            : avoidZoneBottom + railThickness / 2,
        );
      } else {
        railPositions.push(eqPosition);
      }
    }

    const lockBlockTop = LOCK_BLOCK_POSITION - LOCK_BLOCK_HEIGHT / 2;
    const lockBlockBottom = LOCK_BLOCK_POSITION + LOCK_BLOCK_HEIGHT / 2;
    const lockBlockSides = (lockBlockLeft ? 1 : 0) + (lockBlockRight ? 1 : 0);
    const piecesPerSide = parseInt(lockBlockPiecesPerSide) || 0;
    const lockBlockCount = lockBlockSides * piecesPerSide;
    const railsAdjusted = railPositions.some(
      (pos, idx) => pos !== railPositionsOriginal[idx],
    );

    return {
      T,
      W,
      H,
      S,
      F,
      DF,
      R,
      totalSurfaceThickness,
      frameThickness,
      totalFrameWidth,
      innerWidth,
      innerHeight,
      doorArea,
      railPositions,
      railPositionsOriginal,
      railSections,
      railsAdjusted,
      lockBlockTop,
      lockBlockBottom,
      lockBlockHeight: LOCK_BLOCK_HEIGHT,
      lockBlockPosition: LOCK_BLOCK_POSITION,
      lockBlockWidth: F,
      lockBlockCount,
      lockBlockSides,
      lockBlockLeft,
      lockBlockRight,
      currentFrame,
    };
  }, [
    doorThickness,
    doorWidth,
    doorHeight,
    surfaceThickness,
    hasDoubleFrame,
    currentFrame,
    lockBlockLeft,
    lockBlockRight,
    lockBlockPiecesPerSide,
  ]);
};

// Cutting optimization hook
const useCuttingPlan = (results, currentFrame, hasDoubleFrame) => {
  return useMemo(() => {
    const { W, H, F, totalFrameWidth, railSections, lockBlockCount } = results;
    const stockLength = currentFrame.length || 2040;
    const sawKerf = 5;
    const needSplice = currentFrame.needSplice || false;
    const spliceOverlap = currentFrame.spliceOverlap || 100;

    const cutPieces = [];

    // Helper to add pieces
    const addPiece = (name, length, qty, color, isSplice = false) => {
      cutPieces.push({ name, length, qty, color, isSplice });
    };

    // Stiles
    const stileLength = H;
    if (needSplice && stileLength > stockLength) {
      const pieceLength = Math.ceil(stileLength / 2) + spliceOverlap / 2;
      addPiece("โครงตั้ง (ท่อน 1)", pieceLength, 2, "#8d6e63", true);
      addPiece("โครงตั้ง (ท่อน 2)", pieceLength, 2, "#6d4c41", true);
    } else {
      addPiece("โครงตั้ง", stileLength, 2, "#8d6e63");
    }

    // Rails
    addPiece("โครงนอน", W - 2 * F, 2, "#a1887f");

    // Double frame
    if (hasDoubleFrame) {
      const doubleStileLength = H - 2 * F;
      if (needSplice && doubleStileLength > stockLength) {
        const pieceLength =
          Math.ceil(doubleStileLength / 2) + spliceOverlap / 2;
        addPiece("เบิ้ลโครงตั้ง (ท่อน 1)", pieceLength, 2, "#ff8f00", true);
        addPiece("เบิ้ลโครงตั้ง (ท่อน 2)", pieceLength, 2, "#e65100", true);
      } else {
        addPiece("เบิ้ลโครงตั้ง", doubleStileLength, 2, "#ff8f00");
      }
      addPiece("เบิ้ลโครงนอน", W - 2 * totalFrameWidth, 2, "#ffb74d");
    }

    // Horizontal rails
    const railCount = railSections - 1;
    if (railCount > 0) {
      addPiece("ไม้ดาม", W - 2 * totalFrameWidth, railCount, "#a67c52");
    }

    // Lock blocks
    if (lockBlockCount > 0) {
      addPiece("Lock Block", LOCK_BLOCK_HEIGHT, lockBlockCount, "#c62828");
    }

    // Flatten and sort pieces
    const allPieces = cutPieces
      .flatMap((piece) =>
        Array.from({ length: piece.qty }, (_, i) => ({
          ...piece,
          id: `${piece.name}-${i + 1}`,
        })),
      )
      .sort((a, b) => b.length - a.length);

    // Bin packing
    const stocks = [];
    allPieces.forEach((piece) => {
      const pieceWithKerf = piece.length + sawKerf;
      const availableStock = stocks.find((s) => s.remaining >= pieceWithKerf);

      if (availableStock) {
        availableStock.pieces.push(piece);
        availableStock.remaining -= pieceWithKerf;
        availableStock.used += pieceWithKerf;
      } else {
        stocks.push({
          length: stockLength,
          pieces: [piece],
          remaining: stockLength - pieceWithKerf,
          used: pieceWithKerf,
        });
      }
    });

    const totalStocks = stocks.length;
    const totalWaste = stocks.reduce((sum, s) => sum + s.remaining, 0);
    const totalStock = totalStocks * stockLength;
    const usedWithoutKerf = allPieces.reduce((sum, p) => sum + p.length, 0);
    const efficiency = ((usedWithoutKerf / totalStock) * 100).toFixed(1);
    const spliceCount =
      cutPieces.filter((p) => p.isSplice).reduce((sum, p) => sum + p.qty, 0) /
      2;

    return {
      cutPieces,
      allPieces,
      stocks,
      totalStocks,
      totalWaste,
      totalStock,
      efficiency,
      stockLength,
      sawKerf,
      usedWithoutKerf,
      needSplice,
      spliceCount,
      spliceOverlap,
    };
  }, [results, currentFrame, hasDoubleFrame]);
};

// ===== ENGINEERING DRAWING COMPONENT =====
const EngineeringDrawing = ({ results }) => {
  const {
    W,
    H,
    T,
    S,
    F,
    DF,
    R,
    totalFrameWidth,
    railPositions,
    railSections,
    lockBlockTop,
    lockBlockBottom,
    lockBlockLeft,
    lockBlockRight,
    lockBlockPosition,
    lockBlockCount,
    currentFrame,
  } = results;

  // Safe values
  const safeH = H > 0 ? H : 2000;
  const safeW = W > 0 ? W : 800;
  const safeT = T > 0 ? T : 35;
  const safeS = S > 0 ? S : 4;
  const safeF = F > 0 ? F : 50;
  const safeR = R > 0 ? R : 27;

  const viewBoxWidth = 1200;
  const viewBoxHeight = 970;

  // Scales
  const frontScale = 200 / safeH;
  const sideScale = 200 / safeH;
  const topScaleW = 0.15;
  const topScaleT = 2.5;
  const backScale = 200 / safeH;

  // Calculated dimensions for each view
  const dims = {
    front: {
      W: safeW * frontScale,
      H: safeH * frontScale,
      F: safeF * frontScale,
      DF: DF * frontScale,
      totalFrame: totalFrameWidth * frontScale,
      R: Math.max(safeR * frontScale, 2),
      lockBlockW: safeF * frontScale,
    },
    side: {
      T: Math.max(safeT * sideScale * 4, 25),
      H: safeH * sideScale,
      S: Math.max(safeS * sideScale * 4, 3),
    },
    top: {
      W: safeW * topScaleW,
      T: Math.max(safeT * topScaleT, 30),
      F: safeF * topScaleW,
      S: Math.max(safeS * topScaleT, 2),
    },
    back: {
      W: safeW * backScale,
      H: safeH * backScale,
      F: safeF * backScale,
    },
  };

  // Positions
  const positions = {
    top: { x: 600, y: 130 },
    back: { x: 120, y: 370 },
    side: { x: 480, y: 370 },
    front: { x: 750, y: 370 },
  };

  const piecesPerSide =
    parseInt(results.lockBlockCount / results.lockBlockSides) || 0;
  const hasDoubleFrame = DF > 0;

  // Render lock blocks helper
  const renderLockBlocks = (
    viewX,
    viewY,
    scale,
    frameWidth,
    isBack = false,
  ) => {
    const blocks = [];
    const lockBlockH = LOCK_BLOCK_HEIGHT * scale;
    const lockBlockY = viewY + dims.front.H - lockBlockBottom * scale;

    if (lockBlockLeft) {
      [...Array(piecesPerSide)].forEach((_, i) => {
        const x = isBack
          ? viewX +
            dims.back.W -
            frameWidth -
            (hasDoubleFrame ? frameWidth : 0) -
            frameWidth * (i + 1)
          : viewX + dims.front.totalFrame + dims.front.lockBlockW * i;
        blocks.push(
          <LockBlockSVG
            key={`lb-${isBack ? "back" : "front"}-left-${i}`}
            x={x}
            y={lockBlockY}
            width={frameWidth}
            height={lockBlockH}
          />,
        );
      });
    }

    if (lockBlockRight) {
      [...Array(piecesPerSide)].forEach((_, i) => {
        const x = isBack
          ? viewX +
            frameWidth +
            (hasDoubleFrame ? frameWidth : 0) +
            frameWidth * i
          : viewX +
            dims.front.W -
            dims.front.totalFrame -
            dims.front.lockBlockW * (i + 1);
        blocks.push(
          <LockBlockSVG
            key={`lb-${isBack ? "back" : "front"}-right-${i}`}
            x={x}
            y={lockBlockY}
            width={frameWidth}
            height={lockBlockH}
          />,
        );
      });
    }

    return blocks;
  };

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="w-full h-auto bg-white"
    >
      {/* Border frames */}
      <rect
        x="8"
        y="8"
        width={viewBoxWidth - 16}
        height={viewBoxHeight - 16}
        fill="none"
        stroke="#000"
        strokeWidth="2"
      />
      <rect
        x="12"
        y="12"
        width={viewBoxWidth - 24}
        height={viewBoxHeight - 24}
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />

      {/* Grid reference */}
      <g id="grid-ref" fontSize="8" fill="#666">
        {["A", "B", "C", "D", "E", "F"].map((letter, i) => (
          <text
            key={`grid-${letter}`}
            x="20"
            y={80 + i * 130}
            textAnchor="middle"
          >
            {letter}
          </text>
        ))}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num, i) => (
          <text key={`grid-${num}`} x={80 + i * 140} y="40" textAnchor="middle">
            {num}
          </text>
        ))}
      </g>

      {/* Title */}
      <text
        x={viewBoxWidth / 2}
        y="32"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
      >
        DOOR FRAME STRUCTURE DRAWING
      </text>

      {/* SIDE VIEW */}
      <g id="side-view">
        <text
          x={positions.side.x + dims.side.T / 2}
          y={positions.side.y - 15}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
        >
          Side View
        </text>

        {/* Main outline */}
        <rect
          x={positions.side.x}
          y={positions.side.y}
          width={dims.side.T}
          height={dims.side.H}
          fill="#fafafa"
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* Surface layers */}
        <rect
          x={positions.side.x}
          y={positions.side.y}
          width={dims.side.S}
          height={dims.side.H}
          fill="#e8f5e9"
          stroke="#000"
          strokeWidth="0.6"
        />
        <rect
          x={positions.side.x + dims.side.T - dims.side.S}
          y={positions.side.y}
          width={dims.side.S}
          height={dims.side.H}
          fill="#e8f5e9"
          stroke="#000"
          strokeWidth="0.6"
        />

        {/* Frame layers */}
        <rect
          x={positions.side.x + dims.side.S}
          y={positions.side.y}
          width={(dims.side.T - 2 * dims.side.S) * 0.25}
          height={dims.side.H}
          fill="#fff3e0"
          stroke="#000"
          strokeWidth="0.4"
        />
        <rect
          x={
            positions.side.x +
            dims.side.T -
            dims.side.S -
            (dims.side.T - 2 * dims.side.S) * 0.25
          }
          y={positions.side.y}
          width={(dims.side.T - 2 * dims.side.S) * 0.25}
          height={dims.side.H}
          fill="#fff3e0"
          stroke="#000"
          strokeWidth="0.4"
        />

        {/* Core area */}
        <rect
          x={
            positions.side.x +
            dims.side.S +
            (dims.side.T - 2 * dims.side.S) * 0.25
          }
          y={positions.side.y}
          width={(dims.side.T - 2 * dims.side.S) * 0.5}
          height={dims.side.H}
          fill="#fce4ec"
          stroke="#000"
          strokeWidth="0.3"
          strokeDasharray="2,2"
        />

        {/* Center line */}
        <CenterLine
          x1={positions.side.x + dims.side.T / 2}
          y1={positions.side.y - 8}
          x2={positions.side.x + dims.side.T / 2}
          y2={positions.side.y + dims.side.H + 8}
        />

        {/* Rails in side view */}
        {railPositions.map((pos, idx) => {
          const railY = positions.side.y + dims.side.H - pos * sideScale;
          const railH = Math.max(safeR * sideScale * 0.5, 2);
          return (
            <rect
              key={`side-rail-${idx}`}
              x={positions.side.x + dims.side.S}
              y={railY - railH / 2}
              width={dims.side.T - 2 * dims.side.S}
              height={railH}
              fill="#ffe0b2"
              stroke="#000"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Lock block indicator */}
        {(lockBlockLeft || lockBlockRight) && (
          <rect
            x={positions.side.x + dims.side.S}
            y={positions.side.y + dims.side.H - lockBlockBottom * sideScale}
            width={dims.side.T - 2 * dims.side.S}
            height={LOCK_BLOCK_HEIGHT * sideScale}
            fill="none"
            stroke="#c62828"
            strokeWidth="0.6"
            strokeDasharray="3,2"
          />
        )}

        {/* Dimensions */}
        <DimLine
          x1={positions.side.x}
          y1={positions.side.y + dims.side.H}
          x2={positions.side.x + dims.side.T}
          y2={positions.side.y + dims.side.H}
          value={T}
          offset={40}
        />
        <DimLine
          x1={positions.side.x + dims.side.T}
          y1={positions.side.y}
          x2={positions.side.x + dims.side.T}
          y2={positions.side.y + dims.side.H}
          value={H}
          offset={35}
          vertical
        />
        <DimLine
          x1={positions.side.x}
          y1={positions.side.y}
          x2={positions.side.x + dims.side.S}
          y2={positions.side.y}
          value={S}
          offset={-20}
          fontSize={7}
        />
        <DimLine
          x1={positions.side.x + dims.side.S}
          y1={positions.side.y}
          x2={positions.side.x + dims.side.T - dims.side.S}
          y2={positions.side.y}
          value={T - 2 * S}
          offset={-35}
          fontSize={7}
        />
      </g>

      {/* FRONT VIEW */}
      <g id="front-view">
        <text
          x={positions.front.x + dims.front.W / 2}
          y={positions.front.y - 15}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
        >
          Front View
        </text>

        {/* Main outline */}
        <rect
          x={positions.front.x}
          y={positions.front.y}
          width={dims.front.W}
          height={dims.front.H}
          fill="#fafafa"
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* Stiles */}
        <rect
          x={positions.front.x}
          y={positions.front.y}
          width={dims.front.F}
          height={dims.front.H}
          fill="#fff3e0"
          stroke="#000"
          strokeWidth="0.8"
        />
        <rect
          x={positions.front.x + dims.front.W - dims.front.F}
          y={positions.front.y}
          width={dims.front.F}
          height={dims.front.H}
          fill="#fff3e0"
          stroke="#000"
          strokeWidth="0.8"
        />

        {/* Top and bottom rails */}
        <rect
          x={positions.front.x + dims.front.F}
          y={positions.front.y}
          width={dims.front.W - 2 * dims.front.F}
          height={dims.front.F}
          fill="#ffe0b2"
          stroke="#000"
          strokeWidth="0.8"
        />
        <rect
          x={positions.front.x + dims.front.F}
          y={positions.front.y + dims.front.H - dims.front.F}
          width={dims.front.W - 2 * dims.front.F}
          height={dims.front.F}
          fill="#ffe0b2"
          stroke="#000"
          strokeWidth="0.8"
        />

        {/* Double frame indicator */}
        {hasDoubleFrame && (
          <>
            <rect
              x={positions.front.x + dims.front.F}
              y={positions.front.y + dims.front.F}
              width={dims.front.DF}
              height={dims.front.H - 2 * dims.front.F}
              fill="none"
              stroke="#ff8f00"
              strokeWidth="0.5"
              strokeDasharray="4,2"
            />
            <rect
              x={
                positions.front.x + dims.front.W - dims.front.F - dims.front.DF
              }
              y={positions.front.y + dims.front.F}
              width={dims.front.DF}
              height={dims.front.H - 2 * dims.front.F}
              fill="none"
              stroke="#ff8f00"
              strokeWidth="0.5"
              strokeDasharray="4,2"
            />
          </>
        )}

        {/* Horizontal rails */}
        {railPositions.map((pos, idx) => {
          const railY = positions.front.y + dims.front.H - pos * frontScale;
          return (
            <g key={`front-rail-${idx}`}>
              <rect
                x={positions.front.x + dims.front.totalFrame}
                y={railY - dims.front.R / 2}
                width={dims.front.W - 2 * dims.front.totalFrame}
                height={dims.front.R}
                fill="#ffe0b2"
                stroke="#000"
                strokeWidth="0.6"
              />
              <line
                x1={positions.front.x + dims.front.totalFrame}
                y1={railY - dims.front.R / 2}
                x2={positions.front.x + dims.front.W - dims.front.totalFrame}
                y2={railY + dims.front.R / 2}
                stroke="#d7ccc8"
                strokeWidth="0.3"
              />
            </g>
          );
        })}

        {/* Lock blocks */}
        {renderLockBlocks(
          positions.front.x,
          positions.front.y,
          frontScale,
          dims.front.lockBlockW,
          false,
        )}

        {/* Center lines */}
        <CenterLine
          x1={positions.front.x + dims.front.W / 2}
          y1={positions.front.y - 10}
          x2={positions.front.x + dims.front.W / 2}
          y2={positions.front.y + dims.front.H + 10}
        />
        <CenterLine
          x1={positions.front.x - 10}
          y1={positions.front.y + dims.front.H / 2}
          x2={positions.front.x + dims.front.W + 10}
          y2={positions.front.y + dims.front.H / 2}
        />

        {/* Dimensions */}
        <DimLine
          x1={positions.front.x}
          y1={positions.front.y + dims.front.H}
          x2={positions.front.x + dims.front.W}
          y2={positions.front.y + dims.front.H}
          value={W}
          offset={40}
        />
        <DimLine
          x1={positions.front.x + dims.front.W}
          y1={positions.front.y}
          x2={positions.front.x + dims.front.W}
          y2={positions.front.y + dims.front.H}
          value={H}
          offset={35}
          vertical
        />
        <DimLine
          x1={positions.front.x}
          y1={positions.front.y}
          x2={positions.front.x + dims.front.F}
          y2={positions.front.y}
          value={F}
          offset={-20}
          fontSize={7}
        />
        <DimLine
          x1={positions.front.x + dims.front.F}
          y1={positions.front.y}
          x2={positions.front.x + dims.front.W - dims.front.F}
          y2={positions.front.y}
          value={W - 2 * F}
          offset={-35}
          fontSize={7}
        />

        {/* Lock block position */}
        {(lockBlockLeft || lockBlockRight) && (
          <DimLine
            x1={positions.front.x}
            y1={positions.front.y + dims.front.H}
            x2={positions.front.x}
            y2={
              positions.front.y + dims.front.H - lockBlockPosition * frontScale
            }
            value={lockBlockPosition}
            offset={-35}
            vertical
            fontSize={7}
          />
        )}

        {/* Rail position annotations */}
        {railPositions.map((pos, idx) => (
          <g key={`front-ann-${idx}`}>
            <line
              x1={positions.front.x + dims.front.W + 50}
              y1={positions.front.y + dims.front.H - pos * frontScale}
              x2={positions.front.x + dims.front.W + 60}
              y2={positions.front.y + dims.front.H - pos * frontScale}
              stroke="#666"
              strokeWidth="0.4"
            />
            <text
              x={positions.front.x + dims.front.W + 63}
              y={positions.front.y + dims.front.H - pos * frontScale + 3}
              fontSize="7"
              fill="#666"
            >
              {pos}
            </text>
          </g>
        ))}
      </g>

      {/* BOTTOM INFO BAR */}
      <BottomInfoBar
        viewBoxWidth={viewBoxWidth}
        viewBoxHeight={viewBoxHeight}
        T={T}
        W={W}
        H={H}
        S={S}
        F={F}
        R={R}
        surfaceMaterial={results.currentFrame.desc?.split(" ")[0] || "-"}
        frameType={results.currentFrame.desc?.split(" ")[0] || "-"}
        hasDoubleFrame={hasDoubleFrame}
        railSections={railSections}
        railPositions={railPositions}
        lockBlockCount={lockBlockCount}
        currentFrame={currentFrame}
      />
    </svg>
  );
};

// Bottom info bar component for drawing
const BottomInfoBar = ({
  viewBoxWidth,
  viewBoxHeight,
  T,
  W,
  H,
  S,
  F,
  R,
  surfaceMaterial,
  frameType,
  hasDoubleFrame,
  railSections,
  railPositions,
  lockBlockCount,
  currentFrame,
}) => (
  <g id="bottom-info">
    {/* Main container */}
    <rect
      x="20"
      y={viewBoxHeight - 145}
      width={viewBoxWidth - 40}
      height="130"
      fill="#f8fafc"
      stroke="#1e3a5f"
      strokeWidth="1.5"
      rx="3"
    />

    {/* SPECIFICATIONS SECTION */}
    <g id="specs">
      <rect
        x="25"
        y={viewBoxHeight - 140}
        width="370"
        height="20"
        fill="#1e3a5f"
        rx="2"
      />
      <text
        x="35"
        y={viewBoxHeight - 126}
        fontSize="10"
        fontWeight="bold"
        fill="white"
      >
        📋 SPECIFICATIONS
      </text>
      <rect
        x="25"
        y={viewBoxHeight - 118}
        width="370"
        height="100"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />

      <text x="35" y={viewBoxHeight - 100} fontSize="8" fill="#64748b">
        Door Size:
      </text>
      <text
        x="35"
        y={viewBoxHeight - 88}
        fontSize="11"
        fontWeight="bold"
        fill="#1e293b"
      >
        {T} × {W} × {H} mm
      </text>

      <text x="35" y={viewBoxHeight - 70} fontSize="8" fill="#64748b">
        Surface Material:
      </text>
      <text
        x="35"
        y={viewBoxHeight - 58}
        fontSize="9"
        fontWeight="600"
        fill="#059669"
      >
        {surfaceMaterial} {S || 0}mm × 2
      </text>

      <text x="35" y={viewBoxHeight - 40} fontSize="8" fill="#64748b">
        Frame:
      </text>
      <text
        x="35"
        y={viewBoxHeight - 28}
        fontSize="9"
        fontWeight="600"
        fill="#d97706"
      >
        {R || 0}×{F || 0}mm {hasDoubleFrame ? "(Double)" : ""}
      </text>

      <text x="200" y={viewBoxHeight - 100} fontSize="8" fill="#64748b">
        Horizontal Rails:
      </text>
      <text
        x="200"
        y={viewBoxHeight - 88}
        fontSize="9"
        fontWeight="600"
        fill="#ea580c"
      >
        {railSections - 1} pcs @ {railPositions.join(", ") || "-"} mm
      </text>

      <text x="200" y={viewBoxHeight - 70} fontSize="8" fill="#64748b">
        Lock Block:
      </text>
      <text
        x="200"
        y={viewBoxHeight - 58}
        fontSize="9"
        fontWeight="600"
        fill="#dc2626"
      >
        {lockBlockCount} pcs ({R || 0}×{F || 0}×{LOCK_BLOCK_HEIGHT}mm)
      </text>

      {currentFrame.code && (
        <>
          <text x="200" y={viewBoxHeight - 40} fontSize="8" fill="#64748b">
            ERP Code:
          </text>
          <text
            x="200"
            y={viewBoxHeight - 28}
            fontSize="8"
            fontWeight="500"
            fill="#6366f1"
            fontFamily="monospace"
          >
            {currentFrame.code}
          </text>
        </>
      )}
    </g>

    {/* LEGEND SECTION */}
    <g id="legend">
      <rect
        x="405"
        y={viewBoxHeight - 140}
        width="280"
        height="20"
        fill="#1e3a5f"
        rx="2"
      />
      <text
        x="415"
        y={viewBoxHeight - 126}
        fontSize="10"
        fontWeight="bold"
        fill="white"
      >
        🎨 LEGEND
      </text>
      <rect
        x="405"
        y={viewBoxHeight - 118}
        width="280"
        height="100"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />

      {/* Legend items */}
      {[
        {
          x: 415,
          y: -105,
          fill: "#e8f5e9",
          stroke: "#4caf50",
          label: "Surface Material",
        },
        {
          x: 525,
          y: -105,
          fill: "#fff3e0",
          stroke: "#ff9800",
          label: "Frame (Stile)",
        },
        {
          x: 415,
          y: -88,
          fill: "#ffe0b2",
          stroke: "#f57c00",
          label: "Frame (Rail)",
        },
        {
          x: 525,
          y: -88,
          fill: "#ffcdd2",
          stroke: "#c62828",
          label: "Lock Block",
        },
        {
          x: 415,
          y: -71,
          fill: "#fce4ec",
          stroke: "#9e9e9e",
          label: "Core (Honeycomb)",
          dashed: true,
        },
        {
          x: 525,
          y: -71,
          fill: "none",
          stroke: "#ff8f00",
          label: "Double Frame",
          dashed: true,
        },
      ].map((item, i) => (
        <g key={`legend-${i}`}>
          <rect
            x={item.x}
            y={viewBoxHeight + item.y}
            width="16"
            height="10"
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth="0.8"
            rx="1"
            strokeDasharray={item.dashed ? "2,1" : undefined}
          />
          <text
            x={item.x + 20}
            y={viewBoxHeight + item.y + 8}
            fontSize="7"
            fill="#374151"
          >
            {item.label}
          </text>
        </g>
      ))}

      {/* Line legends */}
      <line
        x1="415"
        y1={viewBoxHeight - 49}
        x2="431"
        y2={viewBoxHeight - 49}
        stroke="#333"
        strokeWidth="0.6"
        strokeDasharray="8,2,2,2"
      />
      <text x="435" y={viewBoxHeight - 46} fontSize="7" fill="#374151">
        Center Line
      </text>

      <line
        x1="525"
        y1={viewBoxHeight - 49}
        x2="541"
        y2={viewBoxHeight - 49}
        stroke="#333"
        strokeWidth="0.6"
        strokeDasharray="3,3"
      />
      <text x="545" y={viewBoxHeight - 46} fontSize="7" fill="#374151">
        Hidden Line
      </text>

      <line
        x1="415"
        y1={viewBoxHeight - 32}
        x2="431"
        y2={viewBoxHeight - 32}
        stroke="#333"
        strokeWidth="0.6"
      />
      <polygon
        points={`415,${viewBoxHeight - 32} 418,${viewBoxHeight - 34} 418,${viewBoxHeight - 30}`}
        fill="#333"
      />
      <polygon
        points={`431,${viewBoxHeight - 32} 428,${viewBoxHeight - 34} 428,${viewBoxHeight - 30}`}
        fill="#333"
      />
      <text x="435" y={viewBoxHeight - 29} fontSize="7" fill="#374151">
        Dimension Line
      </text>
    </g>

    {/* TITLE BLOCK */}
    <g id="title-block">
      <rect
        x={viewBoxWidth - 305}
        y={viewBoxHeight - 140}
        width="280"
        height="120"
        fill="white"
        stroke="#1e3a5f"
        strokeWidth="1.5"
        rx="2"
      />
      <rect
        x={viewBoxWidth - 305}
        y={viewBoxHeight - 140}
        width="280"
        height="28"
        fill="#1e3a5f"
        rx="2"
      />
      <rect
        x={viewBoxWidth - 305}
        y={viewBoxHeight - 115}
        width="280"
        height="3"
        fill="#1e3a5f"
      />
      <text
        x={viewBoxWidth - 165}
        y={viewBoxHeight - 121}
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill="white"
      >
        DOOR FRAME ASSEMBLY
      </text>

      <rect
        x={viewBoxWidth - 300}
        y={viewBoxHeight - 107}
        width="270"
        height="22"
        fill="#f1f5f9"
        rx="1"
      />
      <text
        x={viewBoxWidth - 290}
        y={viewBoxHeight - 92}
        fontSize="8"
        fill="#64748b"
      >
        Size:
      </text>
      <text
        x={viewBoxWidth - 165}
        y={viewBoxHeight - 91}
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#1e293b"
      >
        {T} × {W} × {H} mm
      </text>

      <line
        x1={viewBoxWidth - 300}
        y1={viewBoxHeight - 82}
        x2={viewBoxWidth - 30}
        y2={viewBoxHeight - 82}
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />
      <text
        x={viewBoxWidth - 290}
        y={viewBoxHeight - 68}
        fontSize="8"
        fill="#64748b"
      >
        Material:
      </text>
      <text
        x={viewBoxWidth - 165}
        y={viewBoxHeight - 68}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="#059669"
      >
        {surfaceMaterial} + {frameType}
      </text>

      <line
        x1={viewBoxWidth - 300}
        y1={viewBoxHeight - 55}
        x2={viewBoxWidth - 30}
        y2={viewBoxHeight - 55}
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />
      <line
        x1={viewBoxWidth - 165}
        y1={viewBoxHeight - 55}
        x2={viewBoxWidth - 165}
        y2={viewBoxHeight - 35}
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />

      <text
        x={viewBoxWidth - 290}
        y={viewBoxHeight - 42}
        fontSize="8"
        fill="#64748b"
      >
        Scale:
      </text>
      <text
        x={viewBoxWidth - 240}
        y={viewBoxHeight - 42}
        fontSize="10"
        fontWeight="600"
        fill="#1e293b"
      >
        NTS
      </text>

      <text
        x={viewBoxWidth - 155}
        y={viewBoxHeight - 42}
        fontSize="8"
        fill="#64748b"
      >
        Rev:
      </text>
      <text
        x={viewBoxWidth - 120}
        y={viewBoxHeight - 42}
        fontSize="10"
        fontWeight="600"
        fill="#1e293b"
      >
        1.0
      </text>

      <rect
        x={viewBoxWidth - 305}
        y={viewBoxHeight - 35}
        width="280"
        height="15"
        fill="#f8fafc"
      />
      <line
        x1={viewBoxWidth - 300}
        y1={viewBoxHeight - 35}
        x2={viewBoxWidth - 30}
        y2={viewBoxHeight - 35}
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />
      <text
        x={viewBoxWidth - 165}
        y={viewBoxHeight - 24}
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#1e3a5f"
      >
        C.H.H INDUSTRY CO., LTD.
      </text>
    </g>
  </g>
);

// ===== MAIN COMPONENT =====
export default function DoorConfigurator() {
  // State
  const [doorThickness, setDoorThickness] = useState("");
  const [doorWidth, setDoorWidth] = useState("");
  const [doorHeight, setDoorHeight] = useState("");
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [surfaceMaterial, setSurfaceMaterial] = useState("");
  const [surfaceThickness, setSurfaceThickness] = useState("");
  const [frameType, setFrameType] = useState("");
  const [selectedFrameCode, setSelectedFrameCode] = useState("");
  const [hasDoubleFrame, setHasDoubleFrame] = useState(false);
  const [lockBlockLeft, setLockBlockLeft] = useState(false);
  const [lockBlockRight, setLockBlockRight] = useState(false);
  const [lockBlockPiecesPerSide, setLockBlockPiecesPerSide] = useState("");

  // Computed values
  const frameSelection = useFrameSelection(
    frameType,
    doorThickness,
    surfaceThickness,
    doorHeight,
  );

  const currentFrame = useMemo(() => {
    if (frameSelection.frames.length === 0) {
      return {
        thickness: 0,
        width: 0,
        length: 0,
        useThickness: 0,
        useWidth: 0,
        isFlipped: false,
        planeAmount: 0,
        code: "",
        desc: "",
      };
    }
    return (
      frameSelection.frames.find((f) => f.code === selectedFrameCode) ||
      frameSelection.frames[0]
    );
  }, [frameSelection, selectedFrameCode]);

  // Auto-select first frame when selection changes
  useEffect(() => {
    if (frameSelection.frames.length > 0) {
      setSelectedFrameCode(frameSelection.frames[0].code);
    }
  }, [frameSelection]);

  const results = useCalculations({
    doorThickness,
    doorWidth,
    doorHeight,
    surfaceThickness,
    hasDoubleFrame,
    currentFrame,
    lockBlockLeft,
    lockBlockRight,
    lockBlockPiecesPerSide,
  });

  const cuttingPlan = useCuttingPlan(results, currentFrame, hasDoubleFrame);

  const isDataComplete = doorThickness && doorWidth && doorHeight;
  const piecesPerSide = parseInt(lockBlockPiecesPerSide) || 0;

  // Lock block handler
  const handleLockBlockChange = (left, right) => {
    setLockBlockLeft(left);
    setLockBlockRight(right);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 gap-4 overflow-auto bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            🚪 Door Configuration System
          </h1>
          <p className="text-gray-600">
            ระบบออกแบบโครงประตู - C.H.H INDUSTRY CO., LTD.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 1. สเปคลูกค้า */}
              <SectionCard text="1" title="สเปคลูกค้า" icon="📝" color="blue">
                <div className="space-y-3">
                  <QuickSelectWithInput
                    label="ความหนา (T)"
                    options={STANDARD_THICKNESS}
                    value={doorThickness}
                    onChange={setDoorThickness}
                    themeColor="#2563eb"
                  />
                  <QuickSelectWithInput
                    label="ความกว้าง (W)"
                    options={STANDARD_WIDTHS}
                    value={doorWidth}
                    onChange={setDoorWidth}
                    themeColor="#2563eb"
                  />
                  <QuickSelectWithInput
                    label="ความสูง (H)"
                    options={STANDARD_HEIGHTS}
                    value={doorHeight}
                    onChange={setDoorHeight}
                    themeColor="#2563eb"
                  />
                  <InfoBox color="blue" className="text-center">
                    <p>
                      สเปค:{" "}
                      <span className="font-bold">
                        {formatDimension(doorThickness, doorWidth, doorHeight)}
                      </span>{" "}
                      mm
                    </p>
                  </InfoBox>
                </div>
              </SectionCard>

              {/* 2. วัสดุปิดผิว */}
              <SectionCard text="2" title="วัสดุปิดผิว" icon="🎨" color="green">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ประเภทวัสดุ
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {SURFACE_MATERIALS.map((mat) => (
                        <button
                          key={mat.value}
                          onClick={() => setSurfaceMaterial(mat.value)}
                          className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${
                            surfaceMaterial === mat.value
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {mat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <QuickSelectWithInput
                    label="ความหนา/แผ่น"
                    options={[]}
                    value={surfaceThickness}
                    onChange={setSurfaceThickness}
                    themeColor="#16a34a"
                  />

                  <InfoBox color="green">
                    <InfoRow
                      label="วัสดุ:"
                      value={
                        <span className="text-green-700">
                          {getMaterialLabel(SURFACE_MATERIALS, surfaceMaterial)}
                        </span>
                      }
                    />
                    <InfoRow
                      label="วัสดุปิดผิว:"
                      value={`${surfaceThickness || 0} mm × 2 = ${(parseFloat(surfaceThickness) || 0) * 2} mm`}
                      className="text-gray-600"
                    />
                    <InfoRow
                      label="กาว:"
                      value={`${GLUE_THICKNESS} mm × 2 = ${GLUE_THICKNESS * 2} mm`}
                      className="text-gray-600"
                    />
                    <InfoRow
                      label="รวมทั้งหมด:"
                      value={`${results.totalSurfaceThickness} mm`}
                      className="font-medium border-t border-green-200 pt-1 mt-1"
                    />
                    <InfoRow
                      label="ความหนาโครงที่ต้องการ:"
                      value={
                        <span className="text-green-700">
                          {results.frameThickness} mm
                        </span>
                      }
                      className="pt-1 border-t border-green-200 mt-1"
                    />
                  </InfoBox>
                </div>
              </SectionCard>

              {/* 3. โครง (ERP) */}
              <SectionCard text="3" title="โครง (ERP)" icon="🪵" color="amber">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    {FRAME_TYPES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFrameType(opt.value)}
                        className={`py-1.5 rounded text-xs font-medium transition-all ${
                          frameType === opt.value
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      เลือกไม้โครง (จาก ERP)
                      <span className="text-gray-400 font-normal ml-1">
                        ยาว≥{doorHeight || 0}mm
                      </span>
                    </label>
                    {frameType && frameSelection.frames.length > 0 ? (
                      <select
                        value={selectedFrameCode}
                        onChange={(e) => setSelectedFrameCode(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-xs focus:ring-2 focus:ring-amber-500"
                      >
                        {frameSelection.frames.map((frame) => (
                          <option key={frame.code} value={frame.code}>
                            {frame.displaySize}
                          </option>
                        ))}
                      </select>
                    ) : frameType ? (
                      <InfoBox color="red">
                        ⚠️{" "}
                        {frameSelection.reason ||
                          `ไม่มีไม้ที่ใช้ได้สำหรับความหนา ${results.frameThickness}mm`}
                      </InfoBox>
                    ) : (
                      <InfoBox color="gray">
                        กรุณาเลือกประเภทไม้โครงก่อน
                      </InfoBox>
                    )}
                  </div>

                  {frameType && frameSelection.frames.length > 0 && (
                    <InfoBox
                      color={
                        currentFrame.needSplice
                          ? "purple"
                          : currentFrame.planeAmount > 0 ||
                              currentFrame.isFlipped
                            ? "orange"
                            : "amber"
                      }
                    >
                      <InfoRow
                        label="ไม้โครงใช้จริง:"
                        value={
                          <span className="text-amber-700">
                            {currentFrame.useThickness}×{currentFrame.useWidth}{" "}
                            mm
                          </span>
                        }
                      />
                      <InfoRow
                        label="รหัส ERP:"
                        value={
                          <span className="font-mono text-[10px]">
                            {selectedFrameCode}
                          </span>
                        }
                        className="pt-1 border-t mt-1"
                      />
                      {currentFrame.isFlipped && (
                        <div className="text-orange-600 mt-1 pt-1 border-t flex items-center gap-1">
                          <span>🔄</span>{" "}
                          <span>
                            พลิกไม้ {currentFrame.thickness}×
                            {currentFrame.width} → {currentFrame.width}×
                            {currentFrame.thickness}
                          </span>
                        </div>
                      )}
                      {currentFrame.planeAmount > 0 && (
                        <div className="text-orange-600 mt-1 pt-1 border-t flex items-center gap-1">
                          <span>🪚</span>{" "}
                          <span>
                            ต้องไสเนื้อออก {currentFrame.planeAmount} mm
                          </span>
                        </div>
                      )}
                      {currentFrame.needSplice && (
                        <div className="text-purple-600 mt-1 pt-1 border-t">
                          <div className="flex items-center gap-1 font-medium">
                            <span>🔗</span>{" "}
                            <span>ต่อไม้ {currentFrame.spliceCount} ท่อน</span>
                          </div>
                          <div className="text-[10px] mt-1 space-y-0.5">
                            <div>
                              • ตำแหน่งต่อ: {currentFrame.splicePosition} mm
                              จากปลาย
                            </div>
                            <div>
                              • เผื่อซ้อนทับ: {currentFrame.spliceOverlap} mm
                            </div>
                            <div>
                              • ความยาวรวม: {currentFrame.effectiveLength} mm
                            </div>
                          </div>
                        </div>
                      )}
                    </InfoBox>
                  )}

                  <CheckboxOption
                    checked={hasDoubleFrame}
                    onChange={(e) => setHasDoubleFrame(e.target.checked)}
                    label="เบิ้ลโครง"
                    sublabel={
                      hasDoubleFrame
                        ? `(${results.totalFrameWidth}mm/ด้าน)`
                        : null
                    }
                    isActive={hasDoubleFrame}
                  />
                </div>
              </SectionCard>

              {/* 4. ไม้ดามแนวนอน */}
              <SectionCard
                text="4"
                title="ไม้ดามแนวนอน"
                icon="➖"
                color="orange"
              >
                <InfoBox color="orange">
                  <InfoRow
                    label="จำนวนช่อง:"
                    value={
                      <span className="text-orange-700">
                        {results.railSections} ช่อง ({results.railSections - 1}{" "}
                        ไม้ดาม)
                      </span>
                    }
                    className="mb-1"
                  />
                  {doorHeight >= 2400 && (
                    <div className="text-orange-600 text-[10px] mb-1">
                      ⚡ ประตูสูงเกิน 2400mm → แบ่ง 4 ช่อง อัตโนมัติ
                    </div>
                  )}
                  {results.railsAdjusted && (
                    <div className="text-amber-600 text-[10px] mb-1 p-1 bg-amber-50 rounded">
                      🔄 ปรับตำแหน่งไม้ดามอัตโนมัติเพื่อหลบ Lock Block
                    </div>
                  )}
                  <InfoRow
                    label="ขนาดไม้ดาม:"
                    value={
                      <span className="text-orange-700">
                        {currentFrame.useThickness || 0}×
                        {currentFrame.useWidth || 0} mm
                      </span>
                    }
                    className="mb-1"
                  />
                  <div className="text-gray-500 text-[10px]">
                    (ใช้ไม้เดียวกับโครง)
                  </div>
                  <div className="mt-2 pt-2 border-t border-orange-200">
                    {results.railPositions.map((pos, idx) => {
                      const wasAdjusted =
                        results.railPositionsOriginal &&
                        pos !== results.railPositionsOriginal[idx];
                      return (
                        <InfoRow
                          key={idx}
                          label={`ตำแหน่งที่ ${idx + 1}:`}
                          value={
                            <span>
                              {pos} mm
                              {wasAdjusted && (
                                <span className="text-[9px] ml-1">
                                  (เดิม {results.railPositionsOriginal[idx]})
                                </span>
                              )}
                            </span>
                          }
                          className={
                            wasAdjusted ? "text-amber-600" : "text-orange-700"
                          }
                        />
                      );
                    })}
                  </div>
                </InfoBox>
              </SectionCard>
            </div>

            {/* 5. Lock Block */}
            <SectionCard
              text="5"
              title="Lock Block (รองลูกบิด)"
              icon="🔒"
              color="red"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    จำนวนต่อฝั่ง
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setLockBlockPiecesPerSide(n)}
                        className={`flex-1 py-2 rounded text-sm font-bold transition-all ${
                          piecesPerSide === n
                            ? "bg-red-500 text-white shadow-md"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {n} ชิ้น
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <RadioOptionCard
                    name="lockblock"
                    checked={lockBlockLeft && !lockBlockRight}
                    onChange={() => handleLockBlockChange(true, false)}
                    label="ซ้าย"
                    sublabel={`(${piecesPerSide} ชิ้น)`}
                    isActive={lockBlockLeft && !lockBlockRight}
                  />
                  <RadioOptionCard
                    name="lockblock"
                    checked={!lockBlockLeft && lockBlockRight}
                    onChange={() => handleLockBlockChange(false, true)}
                    label="ขวา"
                    sublabel={`(${piecesPerSide} ชิ้น)`}
                    isActive={!lockBlockLeft && lockBlockRight}
                  />
                  <RadioOptionCard
                    name="lockblock"
                    checked={lockBlockLeft && lockBlockRight}
                    onChange={() => handleLockBlockChange(true, true)}
                    label="ทั้งสอง"
                    sublabel={`(${piecesPerSide * 2} ชิ้น)`}
                    isActive={lockBlockLeft && lockBlockRight}
                  />
                </div>

                {(lockBlockLeft || lockBlockRight) && piecesPerSide > 0 && (
                  <InfoBox color="red">
                    <InfoRow
                      label="จำนวนรวม:"
                      value={
                        <span className="text-red-700">
                          {results.lockBlockCount} ชิ้น (
                          {lockBlockLeft && lockBlockRight
                            ? `ซ้าย ${piecesPerSide} + ขวา ${piecesPerSide}`
                            : lockBlockLeft
                              ? `ซ้าย ${piecesPerSide}`
                              : `ขวา ${piecesPerSide}`}
                          )
                        </span>
                      }
                      className="mb-1"
                    />
                    <InfoRow
                      label="ขนาด Lock Block:"
                      value={
                        <span className="text-red-700">
                          {currentFrame.useThickness || 0}×
                          {currentFrame.useWidth || 0}×{LOCK_BLOCK_HEIGHT} mm
                        </span>
                      }
                      className="mb-1"
                    />
                    <div className="text-gray-500 text-[10px] mb-2">
                      (ใช้ไม้เดียวกับโครง)
                    </div>
                    <div className="pt-2 border-t border-red-200 text-red-700 space-y-1">
                      <InfoRow
                        label="ขอบบน:"
                        value={`${results.lockBlockTop} mm จากพื้น`}
                      />
                      <InfoRow
                        label="กึ่งกลาง:"
                        value={`${results.lockBlockPosition} mm จากพื้น`}
                      />
                      <InfoRow
                        label="ขอบล่าง:"
                        value={`${results.lockBlockBottom} mm จากพื้น`}
                      />
                    </div>
                  </InfoBox>
                )}
              </div>
            </SectionCard>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📋 สรุปโครงสร้าง
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block">สเปคประตู:</span>
                  <span className="font-bold">
                    {formatDimension(doorThickness, doorWidth, doorHeight)} mm
                  </span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block">ปิดผิว:</span>
                  <span className="font-bold text-green-600">
                    {getMaterialLabel(SURFACE_MATERIALS, surfaceMaterial)}{" "}
                    {surfaceThickness || 0}mm + กาว {GLUE_THICKNESS}mm (×2)
                  </span>
                </div>
                <div
                  className={`p-2 rounded-lg ${currentFrame.planeAmount > 0 || currentFrame.isFlipped ? "bg-orange-50" : "bg-amber-50"}`}
                >
                  <span className="text-gray-500 block">โครงไม้:</span>
                  <span className="font-bold text-amber-600">
                    {currentFrame.useThickness || "-"}×
                    {currentFrame.useWidth || "-"} mm
                  </span>
                  {currentFrame.isFlipped && (
                    <span className="block text-[10px] text-orange-600">
                      🔄 พลิกไม้
                    </span>
                  )}
                  {currentFrame.planeAmount > 0 && (
                    <span className="block text-[10px] text-orange-600">
                      🪚 ไส {currentFrame.planeAmount}mm
                    </span>
                  )}
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <span className="text-gray-500 block">ไม้ดาม:</span>
                  <span className="font-bold text-orange-600">
                    {results.railSections - 1} ตัว ({results.railSections} ช่อง)
                  </span>
                </div>
                <div className="p-2 bg-red-50 rounded-lg col-span-2">
                  <span className="text-gray-500 block">Lock Block:</span>
                  <span className="font-bold text-red-600">
                    {results.lockBlockCount} ชิ้น (
                    {lockBlockLeft && lockBlockRight
                      ? `ซ้าย ${piecesPerSide} + ขวา ${piecesPerSide}`
                      : lockBlockLeft
                        ? `ซ้าย ${piecesPerSide}`
                        : lockBlockRight
                          ? `ขวา ${piecesPerSide}`
                          : "-"}
                    )
                  </span>
                </div>
              </div>
              {selectedFrameCode && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs">
                  <div className="font-medium text-blue-800">
                    รหัส ERP: {selectedFrameCode}
                  </div>
                  <div className="text-blue-600 text-[10px]">
                    {currentFrame.desc}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Cutting Optimization */}
            {isDataComplete ? (
              <SectionCard
                text="6"
                title="แผนการตัดไม้ (Cutting Optimization)"
                icon="✂️"
                color="indigo"
              >
                <div className="space-y-4">
                  {cuttingPlan.needSplice && (
                    <InfoBox color="purple">
                      <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
                        <span>🔗</span> <span>ต้องต่อไม้โครงตั้ง</span>
                      </div>
                      <div className="text-purple-600 space-y-0.5">
                        <div>
                          • จำนวนชิ้นที่ต้องต่อ: {cuttingPlan.spliceCount} ชิ้น
                        </div>
                        <div>
                          • เผื่อซ้อนทับ: {cuttingPlan.spliceOverlap} mm ต่อจุด
                        </div>
                        <div className="text-[10px] text-purple-500 mt-1">
                          💡 ใช้กาว + ตะปูยึดบริเวณรอยต่อ
                        </div>
                      </div>
                    </InfoBox>
                  )}

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <StatCard
                      value={cuttingPlan.totalStocks}
                      label="ไม้ที่ใช้ (ท่อน)"
                      bgColor="bg-indigo-50"
                      textColor="text-indigo-600"
                    />
                    <StatCard
                      value={`${cuttingPlan.efficiency}%`}
                      label="ประสิทธิภาพ"
                      bgColor="bg-green-50"
                      textColor="text-green-600"
                    />
                    <StatCard
                      value={cuttingPlan.usedWithoutKerf}
                      label="ใช้จริง (mm)"
                      bgColor="bg-blue-50"
                      textColor="text-blue-600"
                    />
                    <StatCard
                      value={cuttingPlan.totalWaste}
                      label="เศษเหลือ (mm)"
                      bgColor="bg-red-50"
                      textColor="text-red-600"
                    />
                  </div>

                  {/* Piece list */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                      📋 รายการชิ้นส่วน (เผื่อรอยเลื่อย {cuttingPlan.sawKerf}mm)
                    </div>
                    <div className="divide-y">
                      {cuttingPlan.cutPieces.map((piece, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 ${piece.isSplice ? "bg-purple-50" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: piece.color }}
                            ></div>
                            <span className="font-medium">{piece.name}</span>
                            {piece.isSplice && (
                              <span className="text-[9px] text-purple-600 bg-purple-100 px-1 rounded">
                                ต่อ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-gray-600">
                            <span>{piece.length} mm</span>
                            <span className="font-bold text-gray-800">
                              ×{piece.qty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock visualization */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                      🪵 แผนการตัด (ไม้ยาว {cuttingPlan.stockLength}mm ×{" "}
                      {cuttingPlan.totalStocks} ท่อน)
                    </div>
                    <div className="p-3 space-y-2">
                      {cuttingPlan.stocks.map((stock, stockIdx) => (
                        <div key={stockIdx} className="space-y-1">
                          <div className="text-[10px] text-gray-500">
                            ท่อนที่ {stockIdx + 1}
                          </div>
                          <div className="relative h-8 bg-amber-100 rounded border border-amber-300 overflow-hidden">
                            {(() => {
                              let offset = 0;
                              return stock.pieces.map((piece, pieceIdx) => {
                                const width =
                                  (piece.length / stock.length) * 100;
                                const kerfWidth =
                                  (cuttingPlan.sawKerf / stock.length) * 100;
                                const left = offset;
                                offset += width + kerfWidth;
                                return (
                                  <React.Fragment key={pieceIdx}>
                                    <div
                                      className="absolute h-full flex items-center justify-center text-[8px] text-white font-medium overflow-hidden"
                                      style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        backgroundColor: piece.color,
                                      }}
                                      title={`${piece.name}: ${piece.length}mm`}
                                    >
                                      {width > 8 && (
                                        <span className="truncate px-1">
                                          {piece.length}
                                        </span>
                                      )}
                                    </div>
                                    {pieceIdx < stock.pieces.length - 1 && (
                                      <div
                                        className="absolute h-full bg-gray-400"
                                        style={{
                                          left: `${left + width}%`,
                                          width: `${kerfWidth}%`,
                                        }}
                                      />
                                    )}
                                  </React.Fragment>
                                );
                              });
                            })()}
                            {stock.remaining > 0 && (
                              <div
                                className="absolute right-0 h-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-500"
                                style={{
                                  width: `${(stock.remaining / stock.length) * 100}%`,
                                }}
                              >
                                {stock.remaining > 100 && (
                                  <span>เศษ {stock.remaining}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Efficiency bar */}
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">
                        ประสิทธิภาพการใช้ไม้
                      </span>
                      <span
                        className={`font-bold ${getEfficiencyColor(cuttingPlan.efficiency).text}`}
                      >
                        {cuttingPlan.efficiency}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getEfficiencyColor(cuttingPlan.efficiency).bg}`}
                        style={{ width: `${cuttingPlan.efficiency}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>0%</span>
                      <span>ดี: ≥80%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : (
              <SectionCard
                text="6"
                title="แผนการตัดไม้ (Cutting Optimization)"
                icon="✂️"
                color="gray"
              >
                <EmptyState
                  icon={
                    <svg
                      className="w-16 h-16 mx-auto mb-3 opacity-30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  title="กรุณากรอกข้อมูลสเปคประตูให้ครบ"
                  subtitle="ระบบจะคำนวณแผนการตัดไม้ให้อัตโนมัติ"
                />
              </SectionCard>
            )}
          </div>

          {/* Right Panel - Drawing */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2.5 flex justify-between items-center">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>📐</span> แบบสถาปนิก 5 มุมมอง (Engineering Drawing)
                </h3>
                {isDataComplete && (
                  <button
                    onClick={() => setIsDrawingModalOpen(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    ขยาย
                  </button>
                )}
              </div>
              <div
                className={`p-3 bg-gray-50 ${isDataComplete ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""}`}
                onClick={() => isDataComplete && setIsDrawingModalOpen(true)}
              >
                {isDataComplete ? (
                  <>
                    <EngineeringDrawing results={results} />
                    <div className="text-center mt-2 text-xs text-gray-400">
                      💡 คลิกที่รูปเพื่อขยาย
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={
                      <svg
                        className="w-24 h-24 mb-4 opacity-30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                        />
                      </svg>
                    }
                    title="กรุณากรอกข้อมูลสเปคประตู"
                    subtitle="ระบุ ความหนา (T), ความกว้าง (W), ความสูง (H)"
                  >
                    <div className="mt-4 flex gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${doorThickness ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                      >
                        T: {doorThickness || "—"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${doorWidth ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                      >
                        W: {doorWidth || "—"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${doorHeight ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                      >
                        H: {doorHeight || "—"}
                      </span>
                    </div>
                  </EmptyState>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawing Modal */}
      <Modal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
      >
        <div className="min-w-[90vw] max-w-[95vw]">
          <EngineeringDrawing results={results} />
        </div>
      </Modal>
    </div>
  );
}
