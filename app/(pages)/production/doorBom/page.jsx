"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";

// ===== HeroUI IMPORTS =====
// Note: These imports assume @heroui/react is installed
// Install with: npm install @heroui/react framer-motion
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Checkbox,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Select,
  SelectItem,
  Tooltip,
  Chip,
  Divider,
  useDisclosure,
} from "@heroui/react";
import { Calculator, Cog, Fullscreen } from "lucide-react";

// ===== THEME COLORS =====
const COLORS = {
  background: "#FFFFFF",
  foreground: "#000000",
  default: "#DCDCDC",
  primary: "#4456E9",
  secondary: "#FF8A00",
  danger: "#FF0076",
  warning: "#FFB441",
  success: "#10B981",
};

// ===== CONSTANTS =====
const GLUE_THICKNESS = 1;
const LOCK_BLOCK_HEIGHT = 400;
const LOCK_BLOCK_POSITION = 1000;

const STANDARD_THICKNESS = [35, 40, 45];
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

// Section colors mapping to theme
const SECTION_COLORS = {
  primary: COLORS.primary,
  success: COLORS.success,
  secondary: COLORS.secondary,
  warning: COLORS.warning,
  danger: COLORS.danger,
  default: COLORS.default,
  foreground: COLORS.foreground,
};

// ===== UTILITY FUNCTIONS =====
const formatDimension = (t, w, h, separator = "×") =>
  `${t || "-"}${separator}${w || "-"}${separator}${h || "-"}`;

const getMaterialLabel = (materials, value) =>
  materials.find((m) => m.value === value)?.label || "-";

const getEfficiencyColor = (efficiency) => {
  const val = parseFloat(efficiency);
  if (val >= 80) return "success";
  if (val >= 60) return "warning";
  return "danger";
};

// ===== REUSABLE UI COMPONENTS =====

// Uncontrolled number input with HeroUI
const NumberInputField = ({ value, onChange, label, className }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleBlur = (e) => onChange(parseFloat(e.target.value) || 0);
  const handleKeyDown = (e) => e.key === "Enter" && e.target.blur();

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      defaultValue={value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      classNames={{
        input: "text-center font-bold",
        inputWrapper: "h-10",
      }}
      size="sm"
      variant="bordered"
      className={className}
    />
  );
};

// Quick select buttons with custom input - using HeroUI Button
const QuickSelectWithInput = ({
  label,
  options,
  value,
  onChange,
  unit = "mm",
  color = "primary",
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-medium text-default-600">
      {label}
    </label>
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <Button
          key={opt}
          size="md"
          variant={value === opt ? "shadow" : "shadow"}
          color={value === opt ? color : "default"}
          onPress={() => onChange(opt)}
          className="text-background"
        >
          {opt}
        </Button>
      ))}
    </div>
    <div className="flex items-center gap-2">
      <NumberInputField value={value} onChange={onChange} className="flex-1" />
      <span className="text-xs text-default-500">{unit}</span>
    </div>
  </div>
);

// Info row component
const InfoRow = ({ label, value, className = "", valueColor }) => (
  <div className={`flex justify-between text-xs ${className}`}>
    <span className="text-default-600">{label}</span>
    <span className={`font-bold ${valueColor || ""}`}>{value}</span>
  </div>
);

// Stat card component using HeroUI Card
const StatCard = ({ value, label, color = "primary" }) => (
  <Card
    className="p-2"
    shadow="none"
    classNames={{
      base: `bg-${color}/10 border-none`,
    }}
  >
    <div className="text-center">
      <div className={`font-bold text-lg text-${color}`}>{value}</div>
      <div className="text-xs text-default-500">{label}</div>
    </div>
  </Card>
);

// Section card wrapper using HeroUI Card
const SectionCard = ({ text, title, icon, children, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    secondary: "bg-secondary",
    warning: "bg-warning",
    danger: "bg-danger",
    default: "bg-default-400",
    foreground: "bg-foreground",
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader
        className={`${colorClasses[color] || colorClasses.primary} py-2.5 px-4`}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="w-6 h-6 rounded-full bg-white text-foreground flex items-center justify-center text-sm font-bold">
            {text}
          </span>
          <span>{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>
      </CardHeader>
      <CardBody className="p-4">{children}</CardBody>
    </Card>
  );
};

// Info box with colored background using HeroUI Card
const InfoBox = ({ children, color = "primary", className = "" }) => (
  <Card
    className={`p-2 ${className}`}
    shadow="none"
    classNames={{
      base: `bg-${color}/10 border border-${color}/30`,
    }}
  >
    <div className={`text-xs text-${color}`}>{children}</div>
  </Card>
);

// Checkbox option using HeroUI Checkbox
const CheckboxOption = ({ checked, onChange, label, sublabel, isActive }) => (
  <div
    className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
      isActive
        ? "bg-warning/10 border-warning"
        : "bg-default-100 border-default-200"
    }`}
    onClick={() => onChange({ target: { checked: !checked } })}
  >
    <Checkbox
      isSelected={checked}
      onValueChange={(val) => onChange({ target: { checked: val } })}
      color="warning"
      size="sm"
    />
    <div>
      <span className="text-xs font-medium">{label}</span>
      {sublabel && (
        <span className="text-xs ml-1 text-warning">{sublabel}</span>
      )}
    </div>
  </div>
);

// Radio option card with custom visual indicator
const RadioOptionCard = ({
  name,
  checked,
  onChange,
  label,
  sublabel,
  isActive,
}) => (
  <div
    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
      isActive
        ? "bg-danger/10 border-danger"
        : "bg-default-100 border-default-200"
    }`}
    onClick={onChange}
  >
    {/* Custom radio indicator */}
    <div
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? "border-danger bg-danger" : "border-default-400 bg-white"
      }`}
    >
      {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
    <span className="text-xs font-medium">{label}</span>
    {sublabel && (
      <span className="text-[10px] font-bold text-danger">{sublabel}</span>
    )}
  </div>
);

// Empty state placeholder
const EmptyState = ({ icon, title, subtitle, children }) => (
  <div className="flex flex-col items-center justify-center h-96 text-default-400">
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
  color = COLORS.foreground,
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
          fill={COLORS.background}
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
        fill={COLORS.background}
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
    stroke={COLORS.foreground}
    strokeWidth="0.3"
    strokeDasharray="10,3,2,3"
  />
);

// Lock block SVG element
const LockBlockSVG = ({ x, y, width, height, strokeColor = COLORS.danger }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={COLORS.danger + "30"}
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
    <line
      x1={x - 10}
      y1={y}
      x2={x}
      y2={y}
      stroke={COLORS.foreground + "99"}
      strokeWidth="0.4"
    />
    <text
      x={x - 13}
      y={y + 3}
      fontSize="7"
      fill={COLORS.foreground + "99"}
      textAnchor={align}
    >
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

    const strategies = [
      () => {
        const exact = filterAndSort(
          frames.filter((f) => f.thickness === requiredThickness),
        );
        return exact.length > 0 ? createFrameResult(exact, false, 0) : null;
      },
      () => {
        const flipExact = filterAndSort(
          frames.filter((f) => f.width === requiredThickness),
        );
        return flipExact.length > 0
          ? createFrameResult(flipExact, true, 0)
          : null;
      },
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

    const lockBlockZoneTop = LOCK_BLOCK_POSITION - LOCK_BLOCK_HEIGHT / 2;
    const lockBlockZoneBottom = LOCK_BLOCK_POSITION + LOCK_BLOCK_HEIGHT / 2;
    const lockBlockZoneBuffer = 50;
    const avoidZoneTop = lockBlockZoneTop - lockBlockZoneBuffer;
    const avoidZoneBottom = lockBlockZoneBottom + lockBlockZoneBuffer;

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

    const addPiece = (name, length, qty, color, isSplice = false) => {
      cutPieces.push({ name, length, qty, color, isSplice });
    };

    const stileLength = H;
    if (needSplice && stileLength > stockLength) {
      const pieceLength = Math.ceil(stileLength / 2) + spliceOverlap / 2;
      addPiece("โครงตั้ง (ท่อน 1)", pieceLength, 2, COLORS.secondary, true);
      addPiece(
        "โครงตั้ง (ท่อน 2)",
        pieceLength,
        2,
        COLORS.secondary + "CC",
        true,
      );
    } else {
      addPiece("โครงตั้ง", stileLength, 2, COLORS.secondary);
    }

    addPiece("โครงนอน", W - 2 * F, 2, COLORS.secondary + "99");

    if (hasDoubleFrame) {
      const doubleStileLength = H - 2 * F;
      if (needSplice && doubleStileLength > stockLength) {
        const pieceLength =
          Math.ceil(doubleStileLength / 2) + spliceOverlap / 2;
        addPiece(
          "เบิ้ลโครงตั้ง (ท่อน 1)",
          pieceLength,
          2,
          COLORS.warning,
          true,
        );
        addPiece(
          "เบิ้ลโครงตั้ง (ท่อน 2)",
          pieceLength,
          2,
          COLORS.warning + "CC",
          true,
        );
      } else {
        addPiece("เบิ้ลโครงตั้ง", doubleStileLength, 2, COLORS.warning);
      }
      addPiece(
        "เบิ้ลโครงนอน",
        W - 2 * totalFrameWidth,
        2,
        COLORS.warning + "99",
      );
    }

    const railCount = railSections - 1;
    if (railCount > 0) {
      addPiece(
        "ไม้ดาม",
        W - 2 * totalFrameWidth,
        railCount,
        COLORS.secondary + "77",
      );
    }

    if (lockBlockCount > 0) {
      addPiece("Lock Block", LOCK_BLOCK_HEIGHT, lockBlockCount, COLORS.danger);
    }

    const allPieces = cutPieces
      .flatMap((piece) =>
        Array.from({ length: piece.qty }, (_, i) => ({
          ...piece,
          id: `${piece.name}-${i + 1}`,
        })),
      )
      .sort((a, b) => b.length - a.length);

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

  const safeH = H > 0 ? H : 2000;
  const safeW = W > 0 ? W : 800;
  const safeT = T > 0 ? T : 35;
  const safeS = S > 0 ? S : 4;
  const safeF = F > 0 ? F : 50;
  const safeR = R > 0 ? R : 27;

  const viewBoxWidth = 1200;
  const viewBoxHeight = 970;

  const frontScale = 200 / safeH;
  const sideScale = 200 / safeH;
  const topScaleW = 0.15;
  const topScaleT = 2.5;
  const backScale = 200 / safeH;

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

  const positions = {
    top: { x: 600, y: 130 },
    back: { x: 120, y: 370 },
    side: { x: 480, y: 370 },
    front: { x: 750, y: 370 },
  };

  const piecesPerSide =
    parseInt(results.lockBlockCount / results.lockBlockSides) || 0;
  const hasDoubleFrame = DF > 0;

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
      className="w-full h-auto"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Border frames */}
      <rect
        x="8"
        y="8"
        width={viewBoxWidth - 16}
        height={viewBoxHeight - 16}
        fill="none"
        stroke={COLORS.foreground}
        strokeWidth="2"
      />
      <rect
        x="12"
        y="12"
        width={viewBoxWidth - 24}
        height={viewBoxHeight - 24}
        fill="none"
        stroke={COLORS.foreground}
        strokeWidth="0.5"
      />

      {/* Grid reference */}
      <g id="grid-ref" fontSize="8" fill={COLORS.foreground + "99"}>
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
        fill={COLORS.foreground}
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
          fill={COLORS.foreground}
        >
          Side View
        </text>

        <rect
          x={positions.side.x}
          y={positions.side.y}
          width={dims.side.T}
          height={dims.side.H}
          fill={COLORS.default + "20"}
          stroke={COLORS.foreground}
          strokeWidth="1.5"
        />

        <rect
          x={positions.side.x}
          y={positions.side.y}
          width={dims.side.S}
          height={dims.side.H}
          fill={COLORS.success + "30"}
          stroke={COLORS.foreground}
          strokeWidth="0.6"
        />
        <rect
          x={positions.side.x + dims.side.T - dims.side.S}
          y={positions.side.y}
          width={dims.side.S}
          height={dims.side.H}
          fill={COLORS.success + "30"}
          stroke={COLORS.foreground}
          strokeWidth="0.6"
        />

        <rect
          x={positions.side.x + dims.side.S}
          y={positions.side.y}
          width={(dims.side.T - 2 * dims.side.S) * 0.25}
          height={dims.side.H}
          fill={COLORS.secondary + "30"}
          stroke={COLORS.foreground}
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
          fill={COLORS.secondary + "30"}
          stroke={COLORS.foreground}
          strokeWidth="0.4"
        />

        <rect
          x={
            positions.side.x +
            dims.side.S +
            (dims.side.T - 2 * dims.side.S) * 0.25
          }
          y={positions.side.y}
          width={(dims.side.T - 2 * dims.side.S) * 0.5}
          height={dims.side.H}
          fill={COLORS.danger + "15"}
          stroke={COLORS.foreground}
          strokeWidth="0.3"
          strokeDasharray="2,2"
        />

        <CenterLine
          x1={positions.side.x + dims.side.T / 2}
          y1={positions.side.y - 8}
          x2={positions.side.x + dims.side.T / 2}
          y2={positions.side.y + dims.side.H + 8}
        />

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
              fill={COLORS.secondary + "50"}
              stroke={COLORS.foreground}
              strokeWidth="0.5"
            />
          );
        })}

        {(lockBlockLeft || lockBlockRight) && (
          <rect
            x={positions.side.x + dims.side.S}
            y={positions.side.y + dims.side.H - lockBlockBottom * sideScale}
            width={dims.side.T - 2 * dims.side.S}
            height={LOCK_BLOCK_HEIGHT * sideScale}
            fill="none"
            stroke={COLORS.danger}
            strokeWidth="0.6"
            strokeDasharray="3,2"
          />
        )}

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
          fill={COLORS.foreground}
        >
          Front View
        </text>

        <rect
          x={positions.front.x}
          y={positions.front.y}
          width={dims.front.W}
          height={dims.front.H}
          fill={COLORS.default + "20"}
          stroke={COLORS.foreground}
          strokeWidth="1.5"
        />

        <rect
          x={positions.front.x}
          y={positions.front.y}
          width={dims.front.F}
          height={dims.front.H}
          fill={COLORS.secondary + "30"}
          stroke={COLORS.foreground}
          strokeWidth="0.8"
        />
        <rect
          x={positions.front.x + dims.front.W - dims.front.F}
          y={positions.front.y}
          width={dims.front.F}
          height={dims.front.H}
          fill={COLORS.secondary + "30"}
          stroke={COLORS.foreground}
          strokeWidth="0.8"
        />

        <rect
          x={positions.front.x + dims.front.F}
          y={positions.front.y}
          width={dims.front.W - 2 * dims.front.F}
          height={dims.front.F}
          fill={COLORS.secondary + "50"}
          stroke={COLORS.foreground}
          strokeWidth="0.8"
        />
        <rect
          x={positions.front.x + dims.front.F}
          y={positions.front.y + dims.front.H - dims.front.F}
          width={dims.front.W - 2 * dims.front.F}
          height={dims.front.F}
          fill={COLORS.secondary + "50"}
          stroke={COLORS.foreground}
          strokeWidth="0.8"
        />

        {hasDoubleFrame && (
          <>
            <rect
              x={positions.front.x + dims.front.F}
              y={positions.front.y + dims.front.F}
              width={dims.front.DF}
              height={dims.front.H - 2 * dims.front.F}
              fill="none"
              stroke={COLORS.warning}
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
              stroke={COLORS.warning}
              strokeWidth="0.5"
              strokeDasharray="4,2"
            />
          </>
        )}

        {railPositions.map((pos, idx) => {
          const railY = positions.front.y + dims.front.H - pos * frontScale;
          return (
            <g key={`front-rail-${idx}`}>
              <rect
                x={positions.front.x + dims.front.totalFrame}
                y={railY - dims.front.R / 2}
                width={dims.front.W - 2 * dims.front.totalFrame}
                height={dims.front.R}
                fill={COLORS.secondary + "50"}
                stroke={COLORS.foreground}
                strokeWidth="0.6"
              />
              <line
                x1={positions.front.x + dims.front.totalFrame}
                y1={railY - dims.front.R / 2}
                x2={positions.front.x + dims.front.W - dims.front.totalFrame}
                y2={railY + dims.front.R / 2}
                stroke={COLORS.default}
                strokeWidth="0.3"
              />
            </g>
          );
        })}

        {renderLockBlocks(
          positions.front.x,
          positions.front.y,
          frontScale,
          dims.front.lockBlockW,
          false,
        )}

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

        {railPositions.map((pos, idx) => (
          <g key={`front-ann-${idx}`}>
            <line
              x1={positions.front.x + dims.front.W + 50}
              y1={positions.front.y + dims.front.H - pos * frontScale}
              x2={positions.front.x + dims.front.W + 60}
              y2={positions.front.y + dims.front.H - pos * frontScale}
              stroke={COLORS.foreground + "99"}
              strokeWidth="0.4"
            />
            <text
              x={positions.front.x + dims.front.W + 63}
              y={positions.front.y + dims.front.H - pos * frontScale + 3}
              fontSize="7"
              fill={COLORS.foreground + "99"}
            >
              {pos}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// ===== MAIN COMPONENT =====
export default function DoorConfigurator() {
  const [doorThickness, setDoorThickness] = useState("");
  const [doorWidth, setDoorWidth] = useState("");
  const [doorHeight, setDoorHeight] = useState("");
  const [surfaceMaterial, setSurfaceMaterial] = useState("");
  const [surfaceThickness, setSurfaceThickness] = useState("");
  const [frameType, setFrameType] = useState("");
  const [selectedFrameCode, setSelectedFrameCode] = useState("");
  const [hasDoubleFrame, setHasDoubleFrame] = useState(false);
  const [lockBlockLeft, setLockBlockLeft] = useState(false);
  const [lockBlockRight, setLockBlockRight] = useState(false);
  const [lockBlockPiecesPerSide, setLockBlockPiecesPerSide] = useState("");

  // HeroUI Modal hook
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const handleLockBlockChange = (left, right) => {
    setLockBlockLeft(left);
    setLockBlockRight(right);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 gap-4 overflow-auto bg-default-100">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1 text-foreground">
            🚪 Door Configuration System
          </h1>
          <p className="text-default-500">
            ระบบออกแบบโครงประตู - C.H.H INDUSTRY CO., LTD.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Left Panel - Using SectionCard instead of Accordion */}
          <div className="lg:col-span-2 space-y-4">
            {/* 1. สเปคลูกค้า */}
            <SectionCard text="1" title="สเปคลูกค้า" icon="📝" color="primary">
              <div className="space-y-3">
                <QuickSelectWithInput
                  label="ความหนา (T)"
                  options={STANDARD_THICKNESS}
                  value={doorThickness}
                  onChange={setDoorThickness}
                  color="primary"
                />
                <QuickSelectWithInput
                  label="ความกว้าง (W)"
                  options={STANDARD_WIDTHS}
                  value={doorWidth}
                  onChange={setDoorWidth}
                  color="primary"
                />
                <QuickSelectWithInput
                  label="ความสูง (H)"
                  options={STANDARD_HEIGHTS}
                  value={doorHeight}
                  onChange={setDoorHeight}
                  color="primary"
                />
                <Card className="bg-primary/10 border-primary/30 border">
                  <CardBody className="py-2 text-center">
                    <p className="text-xs text-primary">
                      สเปค:{" "}
                      <span className="font-bold">
                        {formatDimension(doorThickness, doorWidth, doorHeight)}
                      </span>{" "}
                      mm
                    </p>
                  </CardBody>
                </Card>
              </div>
            </SectionCard>

            {/* 2. วัสดุปิดผิว */}
            <SectionCard text="2" title="วัสดุปิดผิว" icon="🎨" color="success">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-default-600">
                    ประเภทวัสดุ
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {SURFACE_MATERIALS.map((mat) => (
                      <Button
                        key={mat.value}
                        size="md"
                        variant={
                          surfaceMaterial === mat.value ? "shadow" : "shadow"
                        }
                        color={
                          surfaceMaterial === mat.value ? "success" : "default"
                        }
                        onPress={() => setSurfaceMaterial(mat.value)}
                        className="text-background"
                      >
                        {mat.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <QuickSelectWithInput
                  label="ความหนา/แผ่น"
                  options={[]}
                  value={surfaceThickness}
                  onChange={setSurfaceThickness}
                  color="success"
                />

                <Card className="bg-success/10 border-success/30 border">
                  <CardBody className="py-2 space-y-1">
                    <InfoRow
                      label="วัสดุ:"
                      value={getMaterialLabel(
                        SURFACE_MATERIALS,
                        surfaceMaterial,
                      )}
                      valueColor="text-success"
                    />
                    <InfoRow
                      label="วัสดุปิดผิว:"
                      value={`${surfaceThickness || 0} mm × 2 = ${(parseFloat(surfaceThickness) || 0) * 2} mm`}
                    />
                    <InfoRow
                      label="กาว:"
                      value={`${GLUE_THICKNESS} mm × 2 = ${GLUE_THICKNESS * 2} mm`}
                    />
                    <Divider className="my-1" />
                    <InfoRow
                      label="รวมทั้งหมด:"
                      value={`${results.totalSurfaceThickness} mm`}
                      className="font-medium"
                    />
                    <InfoRow
                      label="ความหนาโครงที่ต้องการ:"
                      value={`${results.frameThickness} mm`}
                      valueColor="text-success font-bold"
                    />
                  </CardBody>
                </Card>
              </div>
            </SectionCard>

            {/* 3. โครง (ERP) */}
            <SectionCard
              text="3"
              title="โครง (ERP)"
              icon="🪵"
              color="secondary"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-1">
                  {FRAME_TYPES.map((opt) => (
                    <Button
                      key={opt.value}
                      size="md"
                      variant={frameType === opt.value ? "shadow" : "shadow"}
                      color={frameType === opt.value ? "secondary" : "default"}
                      onPress={() => setFrameType(opt.value)}
                      className="text-background"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-default-600">
                    เลือกไม้โครง (จาก ERP)
                    <span className="font-normal ml-1 text-default-400">
                      ยาว≥{doorHeight || 0}mm
                    </span>
                  </label>
                  {frameType && frameSelection.frames.length > 0 ? (
                    <Select
                      selectedKeys={
                        selectedFrameCode ? [selectedFrameCode] : []
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        if (selected) setSelectedFrameCode(selected);
                      }}
                      size="sm"
                      variant="bordered"
                      classNames={{
                        trigger: "h-10",
                      }}
                    >
                      {frameSelection.frames.map((frame) => (
                        <SelectItem key={frame.code} value={frame.code}>
                          {frame.displaySize}
                        </SelectItem>
                      ))}
                    </Select>
                  ) : frameType ? (
                    <Card className="bg-danger/10 border-danger/30 border">
                      <CardBody className="py-2">
                        <p className="text-xs text-danger">
                          ⚠️{" "}
                          {frameSelection.reason ||
                            `ไม่มีไม้ที่ใช้ได้สำหรับความหนา ${results.frameThickness}mm`}
                        </p>
                      </CardBody>
                    </Card>
                  ) : (
                    <Card className="bg-default-100 border-default-200 border">
                      <CardBody className="py-2">
                        <p className="text-xs text-default-500">
                          กรุณาเลือกประเภทไม้โครงก่อน
                        </p>
                      </CardBody>
                    </Card>
                  )}
                </div>

                {frameType && frameSelection.frames.length > 0 && (
                  <Card
                    className={`border ${
                      currentFrame.needSplice
                        ? "bg-primary/10 border-primary/30"
                        : currentFrame.planeAmount > 0 || currentFrame.isFlipped
                          ? "bg-warning/10 border-warning/30"
                          : "bg-secondary/10 border-secondary/30"
                    }`}
                  >
                    <CardBody className="py-2 space-y-1">
                      <InfoRow
                        label="ไม้โครงใช้จริง:"
                        value={`${currentFrame.useThickness}×${currentFrame.useWidth} mm`}
                        valueColor="text-secondary font-bold"
                      />
                      <InfoRow
                        label="รหัส ERP:"
                        value={
                          <code className="text-[10px] bg-default-200 px-1 rounded">
                            {selectedFrameCode}
                          </code>
                        }
                      />
                      {currentFrame.isFlipped && (
                        <div className="flex items-center gap-1 text-warning text-xs">
                          <span>🔄</span>
                          <span>
                            พลิกไม้ {currentFrame.thickness}×
                            {currentFrame.width} → {currentFrame.width}×
                            {currentFrame.thickness}
                          </span>
                        </div>
                      )}
                      {currentFrame.planeAmount > 0 && (
                        <div className="flex items-center gap-1 text-warning text-xs">
                          <span>🪚</span>
                          <span>
                            ต้องไสเนื้อออก {currentFrame.planeAmount} mm
                          </span>
                        </div>
                      )}
                      {currentFrame.needSplice && (
                        <div className="text-primary text-xs space-y-1 pt-1 border-t border-primary/30">
                          <div className="flex items-center gap-1 font-medium">
                            <span>🔗</span>
                            <span>ต่อไม้ {currentFrame.spliceCount} ท่อน</span>
                          </div>
                          <div className="text-[10px] space-y-0.5">
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
                    </CardBody>
                  </Card>
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
              color="secondary"
            >
              <Card className="bg-secondary/10 border-secondary/30 border">
                <CardBody className="py-2 space-y-1">
                  <InfoRow
                    label="จำนวนช่อง:"
                    value={`${results.railSections} ช่อง (${results.railSections - 1} ไม้ดาม)`}
                    valueColor="text-secondary font-bold"
                  />
                  {doorHeight >= 2400 && (
                    <div className="text-[10px] text-secondary">
                      ⚡ ประตูสูงเกิน 2400mm → แบ่ง 4 ช่อง อัตโนมัติ
                    </div>
                  )}
                  {results.railsAdjusted && (
                    <div className="text-[10px] p-1 rounded bg-warning/20 text-warning">
                      🔄 ปรับตำแหน่งไม้ดามอัตโนมัติเพื่อหลบ Lock Block
                    </div>
                  )}
                  <InfoRow
                    label="ขนาดไม้ดาม:"
                    value={`${currentFrame.useThickness || 0}×${currentFrame.useWidth || 0} mm`}
                    valueColor="text-secondary"
                  />
                  <div className="text-[10px] text-default-500">
                    (ใช้ไม้เดียวกับโครง)
                  </div>
                  <Divider className="my-1" />
                  {results.railPositions.map((pos, idx) => {
                    const wasAdjusted =
                      results.railPositionsOriginal &&
                      pos !== results.railPositionsOriginal[idx];
                    return (
                      <InfoRow
                        key={idx}
                        label={`ตำแหน่งที่ ${idx + 1}:`}
                        value={
                          <>
                            {pos} mm
                            {wasAdjusted && (
                              <span className="text-[9px] ml-1 text-warning">
                                (เดิม {results.railPositionsOriginal[idx]})
                              </span>
                            )}
                          </>
                        }
                        valueColor={
                          wasAdjusted ? "text-warning" : "text-secondary"
                        }
                      />
                    );
                  })}
                </CardBody>
              </Card>
            </SectionCard>

            {/* 5. Lock Block */}
            <SectionCard
              text="5"
              title="Lock Block (รองลูกบิด)"
              icon="🔒"
              color="danger"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-default-600">
                    จำนวนต่อฝั่ง
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <Button
                        key={n}
                        size="md"
                        variant={piecesPerSide === n ? "shadow" : "shadow"}
                        color={piecesPerSide === n ? "danger" : "default"}
                        onPress={() => setLockBlockPiecesPerSide(n)}
                        className="text-background"
                      >
                        {n} ชิ้น
                      </Button>
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
                  <Card className="bg-danger/10 border-danger/30 border">
                    <CardBody className="py-2 space-y-1">
                      <InfoRow
                        label="จำนวนรวม:"
                        value={`${results.lockBlockCount} ชิ้น (${
                          lockBlockLeft && lockBlockRight
                            ? `ซ้าย ${piecesPerSide} + ขวา ${piecesPerSide}`
                            : lockBlockLeft
                              ? `ซ้าย ${piecesPerSide}`
                              : `ขวา ${piecesPerSide}`
                        })`}
                        valueColor="text-danger font-bold"
                      />
                      <InfoRow
                        label="ขนาด Lock Block:"
                        value={`${currentFrame.useThickness || 0}×${currentFrame.useWidth || 0}×${LOCK_BLOCK_HEIGHT} mm`}
                        valueColor="text-danger"
                      />
                      <div className="text-[10px] text-default-500 mb-2">
                        (ใช้ไม้เดียวกับโครง)
                      </div>
                      <Divider />
                      <div className="space-y-1 text-danger text-xs">
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
                    </CardBody>
                  </Card>
                )}
              </div>
            </SectionCard>

            {/* Summary Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  📋 สรุปโครงสร้าง
                </h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-default-100">
                    <span className="block text-default-500">สเปคประตู:</span>
                    <span className="font-bold">
                      {formatDimension(doorThickness, doorWidth, doorHeight)} mm
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-default-100">
                    <span className="block text-default-500">ปิดผิว:</span>
                    <span className="font-bold text-success">
                      {getMaterialLabel(SURFACE_MATERIALS, surfaceMaterial)}{" "}
                      {surfaceThickness || 0}mm + กาว {GLUE_THICKNESS}mm (×2)
                    </span>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${
                      currentFrame.planeAmount > 0 || currentFrame.isFlipped
                        ? "bg-warning/10"
                        : "bg-secondary/10"
                    }`}
                  >
                    <span className="block text-default-500">โครงไม้:</span>
                    <span className="font-bold text-secondary">
                      {currentFrame.useThickness || "-"}×
                      {currentFrame.useWidth || "-"} mm
                    </span>
                    {currentFrame.isFlipped && (
                      <span className="block text-[10px] text-warning">
                        🔄 พลิกไม้
                      </span>
                    )}
                    {currentFrame.planeAmount > 0 && (
                      <span className="block text-[10px] text-warning">
                        🪚 ไส {currentFrame.planeAmount}mm
                      </span>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <span className="block text-default-500">ไม้ดาม:</span>
                    <span className="font-bold text-secondary">
                      {results.railSections - 1} ตัว ({results.railSections}{" "}
                      ช่อง)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-danger/10 col-span-2">
                    <span className="block text-default-500">Lock Block:</span>
                    <span className="font-bold text-danger">
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
                  <div className="mt-3 p-2 rounded-lg bg-primary/10">
                    <div className="font-medium text-primary text-xs">
                      รหัส ERP: {selectedFrameCode}
                    </div>
                    <div className="text-[10px] text-primary/70">
                      {currentFrame.desc}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 6. Cutting Optimization */}
            {isDataComplete ? (
              <SectionCard
                text="6"
                title="แผนการตัดไม้ (Cutting Optimization)"
                icon="✂️"
                color="primary"
              >
                <div className="space-y-4">
                  {cuttingPlan.needSplice && (
                    <Card className="bg-primary/10 border-primary/30 border">
                      <CardBody className="py-2">
                        <div className="flex items-center gap-2 font-medium mb-1 text-primary">
                          <span>🔗</span>
                          <span>ต้องต่อไม้โครงตั้ง</span>
                        </div>
                        <div className="text-xs text-primary/80 space-y-0.5">
                          <div>
                            • จำนวนชิ้นที่ต้องต่อ: {cuttingPlan.spliceCount}{" "}
                            ชิ้น
                          </div>
                          <div>
                            • เผื่อซ้อนทับ: {cuttingPlan.spliceOverlap} mm
                            ต่อจุด
                          </div>
                          <div className="text-[10px] mt-1 text-primary/60">
                            💡 ใช้กาว + ตะปูยึดบริเวณรอยต่อ
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <Card className="bg-primary/10 border-none" shadow="none">
                      <CardBody className="py-2 text-center">
                        <div className="font-bold text-lg text-primary">
                          {cuttingPlan.totalStocks}
                        </div>
                        <div className="text-default-500">ไม้ที่ใช้ (ท่อน)</div>
                      </CardBody>
                    </Card>
                    <Card className="bg-success/10 border-none" shadow="none">
                      <CardBody className="py-2 text-center">
                        <div className="font-bold text-lg text-success">
                          {cuttingPlan.efficiency}%
                        </div>
                        <div className="text-default-500">ประสิทธิภาพ</div>
                      </CardBody>
                    </Card>
                    <Card className="bg-primary/10 border-none" shadow="none">
                      <CardBody className="py-2 text-center">
                        <div className="font-bold text-lg text-primary">
                          {cuttingPlan.usedWithoutKerf}
                        </div>
                        <div className="text-default-500">ใช้จริง (mm)</div>
                      </CardBody>
                    </Card>
                    <Card className="bg-danger/10 border-none" shadow="none">
                      <CardBody className="py-2 text-center">
                        <div className="font-bold text-lg text-danger">
                          {cuttingPlan.totalWaste}
                        </div>
                        <div className="text-default-500">เศษเหลือ (mm)</div>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Piece list */}
                  <Card className="overflow-hidden" shadow="sm">
                    <CardHeader className="bg-default-100 py-2">
                      <span className="text-xs font-semibold">
                        📋 รายการชิ้นส่วน (เผื่อรอยเลื่อย {cuttingPlan.sawKerf}
                        mm)
                      </span>
                    </CardHeader>
                    <CardBody className="p-0">
                      <div className="divide-y divide-default-200">
                        {cuttingPlan.cutPieces.map((piece, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-3 py-2 text-xs ${
                              piece.isSplice ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: piece.color }}
                              />
                              <span className="font-medium">{piece.name}</span>
                              {piece.isSplice && (
                                <Chip
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  className="h-4 text-[9px]"
                                >
                                  ต่อ
                                </Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-default-500">
                              <span>{piece.length} mm</span>
                              <span className="font-bold text-foreground">
                                ×{piece.qty}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Stock visualization */}
                  <Card className="overflow-hidden" shadow="sm">
                    <CardHeader className="bg-default-100 py-2">
                      <span className="text-xs font-semibold">
                        🪵 แผนการตัด (ไม้ยาว {cuttingPlan.stockLength}mm ×{" "}
                        {cuttingPlan.totalStocks} ท่อน)
                      </span>
                    </CardHeader>
                    <CardBody className="p-3 space-y-2">
                      {cuttingPlan.stocks.map((stock, stockIdx) => (
                        <div key={stockIdx} className="space-y-1">
                          <div className="text-[10px] text-default-500">
                            ท่อนที่ {stockIdx + 1}
                          </div>
                          <div className="relative h-8 rounded border border-secondary/40 bg-secondary/10 overflow-hidden">
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
                                    <Tooltip
                                      content={`${piece.name}: ${piece.length}mm`}
                                    >
                                      <div
                                        className="absolute h-full flex items-center justify-center text-[8px] font-medium overflow-hidden text-white cursor-pointer"
                                        style={{
                                          left: `${left}%`,
                                          width: `${width}%`,
                                          backgroundColor: piece.color,
                                        }}
                                      >
                                        {width > 8 && (
                                          <span className="truncate px-1">
                                            {piece.length}
                                          </span>
                                        )}
                                      </div>
                                    </Tooltip>
                                    {pieceIdx < stock.pieces.length - 1 && (
                                      <div
                                        className="absolute h-full bg-foreground/50"
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
                                className="absolute right-0 h-full flex items-center justify-center text-[8px] bg-default-300 text-default-600"
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
                    </CardBody>
                  </Card>

                  {/* Efficiency bar using HeroUI Progress */}
                  <div className="p-2 rounded-lg bg-default-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-default-500">
                        ประสิทธิภาพการใช้ไม้
                      </span>
                      <span
                        className={`font-bold text-${getEfficiencyColor(cuttingPlan.efficiency)}`}
                      >
                        {cuttingPlan.efficiency}%
                      </span>
                    </div>
                    <Progress
                      value={parseFloat(cuttingPlan.efficiency)}
                      color={getEfficiencyColor(cuttingPlan.efficiency)}
                      size="sm"
                      className="max-w-full"
                    />
                    <div className="flex justify-between text-[10px] mt-1 text-default-400">
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
                color="default"
              >
                <EmptyState
                  icon={<Calculator />}
                  title="กรุณากรอกข้อมูลสเปคประตูให้ครบ"
                  subtitle="ระบบจะคำนวณแผนการตัดไม้ให้อัตโนมัติ"
                />
              </SectionCard>
            )}
          </div>

          {/* Right Panel - Drawing */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg overflow-hidden sticky top-4">
              <CardHeader className="bg-foreground py-2.5 px-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                  <span>📐</span>
                  <span className="font-semibold">
                    Door Frame Structure Drawing
                  </span>
                </div>
                {isDataComplete && (
                  <Button
                    size="md"
                    variant="shadow"
                    color="primary"
                    className="text-background"
                    onPress={onOpen}
                    startContent={<Fullscreen />}
                  >
                    ขยาย
                  </Button>
                )}
              </CardHeader>
              <CardBody
                className={`p-3 bg-default-100 ${isDataComplete ? "cursor-pointer" : ""}`}
                onClick={() => isDataComplete && onOpen()}
              >
                {isDataComplete ? (
                  <>
                    <EngineeringDrawing results={results} />
                  </>
                ) : (
                  <EmptyState
                    icon={<Cog />}
                    title="กรุณากรอกข้อมูลสเปคประตู"
                    subtitle="ระบุ ความหนา (T), ความกว้าง (W), ความสูง (H)"
                  >
                    <div className="mt-4 flex gap-2 text-xs">
                      <Chip
                        size="sm"
                        color={doorThickness ? "success" : "danger"}
                        variant="flat"
                      >
                        T: {doorThickness || "—"}
                      </Chip>
                      <Chip
                        size="sm"
                        color={doorWidth ? "success" : "danger"}
                        variant="flat"
                      >
                        W: {doorWidth || "—"}
                      </Chip>
                      <Chip
                        size="sm"
                        color={doorHeight ? "success" : "danger"}
                        variant="flat"
                      >
                        H: {doorHeight || "—"}
                      </Chip>
                    </div>
                  </EmptyState>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Drawing Modal using HeroUI Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        scrollBehavior="inside"
        classNames={{
          base: "max-w-[95vw] max-h-[95vh]",
          body: "p-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                📐 Door Frame Structure Drawing
              </ModalHeader>
              <ModalBody>
                <EngineeringDrawing results={results} />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  size="md"
                  variant="shadow"
                  className="text-background"
                  onPress={onClose}
                >
                  ปิด
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
