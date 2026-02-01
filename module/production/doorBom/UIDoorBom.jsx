"use client";

import React, { useState, useMemo, useRef, useCallback, memo } from "react";
import { Calculator, RulerDimensionLine, ZoomIn, ZoomOut, Maximize2, RotateCcw, Download, Layers, FileImage, FileText, FileCode, Printer, ChevronDown } from "lucide-react";
import { Button, Input, Select, SelectItem, Card, CardHeader, CardBody, Chip, Divider, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch, Tooltip, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import jsPDF from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import * as htmlToImage from "html-to-image";

import { GLUE_THICKNESS, LOCK_BLOCK_HEIGHT, LOCK_BLOCK_POSITION, SURFACE_MATERIALS, FRAME_TYPES, DOUBLE_FRAME_SIDES, LOCK_BLOCK_PIECES_OPTIONS, LOCK_BLOCK_POSITIONS, DOUBLE_FRAME_COUNT_OPTIONS, CORE_TYPES, GRID_LETTERS, GRID_NUMBERS, LAYER_CONFIG, formatDimension, getMaterialLabel, getEfficiencyColor, generateDXF } from "@/app/(pages)/production/doorBom/page";

// ==================== SVG DRAWING COMPONENTS ====================
export const DimLine = memo(({ x1, y1, x2, y2, value, offset = 25, vertical = false, color = "#000000", fontSize = 9, unit = "", theme }) => {
  const strokeColor = theme?.stroke || color;
  const paperColor = theme?.paper || "#FFFFFF";
  const arrowSize = 3;
  const displayValue = unit ? `${value}${unit}` : value;
  const textWidth = String(displayValue).length * 5.5 + 10;

  if (vertical) {
    const lineX = x1 + offset;
    const midY = (y1 + y2) / 2;
    return (
      <g className="layer-dimensions">
        <line x1={x1 + 2} y1={y1} x2={lineX + 3} y2={y1} stroke={strokeColor} strokeWidth="0.4" />
        <line x1={x1 + 2} y1={y2} x2={lineX + 3} y2={y2} stroke={strokeColor} strokeWidth="0.4" />
        <line x1={lineX} y1={y1} x2={lineX} y2={y2} stroke={strokeColor} strokeWidth="0.6" />
        <polygon points={`${lineX},${y1} ${lineX - arrowSize},${y1 + arrowSize * 1.5} ${lineX + arrowSize},${y1 + arrowSize * 1.5}`} fill={strokeColor} />
        <polygon points={`${lineX},${y2} ${lineX - arrowSize},${y2 - arrowSize * 1.5} ${lineX + arrowSize},${y2 - arrowSize * 1.5}`} fill={strokeColor} />
        <rect x={lineX - textWidth / 2} y={midY - 6} width={textWidth} height="12" fill={paperColor} />
        <text x={lineX} y={midY + 3} textAnchor="middle" fontSize={fontSize} fontWeight="500" fill={strokeColor}>
          {displayValue}
        </text>
      </g>
    );
  }

  const lineY = y1 + offset;
  const midX = (x1 + x2) / 2;
  return (
    <g className="layer-dimensions">
      <line x1={x1} y1={y1 + 2} x2={x1} y2={lineY + 3} stroke={strokeColor} strokeWidth="0.4" />
      <line x1={x2} y1={y1 + 2} x2={x2} y2={lineY + 3} stroke={strokeColor} strokeWidth="0.4" />
      <line x1={x1} y1={lineY} x2={x2} y2={lineY} stroke={strokeColor} strokeWidth="0.6" />
      <polygon points={`${x1},${lineY} ${x1 + arrowSize * 1.5},${lineY - arrowSize} ${x1 + arrowSize * 1.5},${lineY + arrowSize}`} fill={strokeColor} />
      <polygon points={`${x2},${lineY} ${x2 - arrowSize * 1.5},${lineY - arrowSize} ${x2 - arrowSize * 1.5},${lineY + arrowSize}`} fill={strokeColor} />
      <rect x={midX - textWidth / 2} y={lineY - 6} width={textWidth} height="12" fill={paperColor} />
      <text x={midX} y={lineY + 3} textAnchor="middle" fontSize={fontSize} fontWeight="500" fill={strokeColor}>
        {displayValue}
      </text>
    </g>
  );
});
DimLine.displayName = "DimLine";

export const CenterLine = memo(({ x1, y1, x2, y2, theme }) => <line className="layer-centerlines" x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme?.stroke || "#000000"} strokeWidth="0.3" strokeDasharray="10,3,2,3" />);
CenterLine.displayName = "CenterLine";

export const LockBlockSVG = memo(({ x, y, width, height }) => (
  <g className="layer-lockblock">
    <rect x={x} y={y} width={width} height={height} fill="url(#hatch-lockblock)" stroke="#000000" strokeWidth="0.8" />
  </g>
));
LockBlockSVG.displayName = "LockBlockSVG";

export const FilledRect = memo(({ x, y, width, height, strokeWidth = 1, strokeDasharray, className, patternId }) => {
  const fill = patternId ? `url(#${patternId})` : "#FFFFFF";
  return <rect className={className} x={x} y={y} width={width} height={height} fill={fill} stroke="#000000" strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />;
});
FilledRect.displayName = "FilledRect";

export const TitleBlockSVG = ({ x, y, w, h, theme, data }) => {
  const stroke = theme?.stroke || "#000";
  const fill = theme?.text || "#000";
  const font = "Arial, sans-serif";

  const rows = [
    { key: "logo", weight: 220 },
    { key: "company", weight: 95 },
    { key: "ownerH", weight: 110 },
    { key: "ownerV", weight: 360 },
    { key: "pcH", weight: 120 },
    { key: "pcV", weight: 90 },
    { key: "dimH", weight: 110 },
    { key: "dimV", weight: 105 },
    { key: "typeH", weight: 110 },
    { key: "typeV", weight: 105 },
    { key: "issueH", weight: 110 },
    { key: "issueV", weight: 95 },
    { key: "drawn", weight: 85 },
    { key: "checked", weight: 85 },
    { key: "sale", weight: 85 },
    { key: "co", weight: 85 },
    { key: "tol", weight: 235 },
    { key: "qr", weight: 280 },
    { key: "thai1", weight: 140 },
    { key: "thai2", weight: 150 },
    { key: "sig", weight: 120 },
    { key: "app", weight: 110 },
    { key: "footer", weight: 35 },
  ];

  const total = rows.reduce((s, r) => s + r.weight, 0);
  const k = h / total;

  const yMap = {};
  let cy = y;
  rows.forEach((r) => {
    const rh = r.weight * k;
    yMap[r.key] = { y: cy, h: rh };
    cy += rh;
  });

  const midY = (key) => yMap[key].y + yMap[key].h / 2;

  const line = (x1, y1, x2, y2, sw = 2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={sw} />;

  const txt = (tx, ty, text, opt = {}) => (
    <text x={tx} y={ty} fill={fill} fontFamily={font} fontSize={opt.size ?? 20} fontWeight={opt.weight ?? 700} textAnchor={opt.anchor ?? "middle"} dominantBaseline="middle" letterSpacing={opt.letterSpacing ?? 0}>
      {text || ""}
    </text>
  );

  const splitHalf = x + w * 0.5;
  const splitIssue = x + w * 0.66;
  const splitName = x + w * 0.36;
  const pad = w * 0.04;

  const owner = data?.projectOwner || "";
  const projectCode = data?.projectCode || "";
  const code = data?.code || "";
  const dimText = data?.dimension || "-";
  const type = data?.type || "";
  const issueDate = data?.issueDate || "";
  const revise = data?.revise ?? "";

  const drawn = data?.drawn || "";
  const checked = data?.checked || "";
  const sale = data?.sale || "";
  const coApproved = data?.coApproved || "";

  return (
    <g className="layer-title">
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={stroke} strokeWidth="3" />

      {rows.map((r) => (
        <React.Fragment key={`h-${r.key}`}>{line(x, yMap[r.key].y, x + w, yMap[r.key].y, 2)}</React.Fragment>
      ))}
      {line(x, y + h, x + w, y + h, 3)}

      <rect x={x + pad} y={yMap.logo.y + pad * 0.5} width={w - pad * 2} height={yMap.logo.h - pad} fill="none" stroke={stroke} strokeWidth="2" />
      {txt(x + w / 2, yMap.logo.y + yMap.logo.h * 0.62, "EVERGREEN", { size: 34, weight: 300, letterSpacing: 8 })}
      {txt(x + w / 2, yMap.logo.y + yMap.logo.h * 0.8, "GREEN CONSTRUCTION MATERIALS", { size: 16, weight: 300, letterSpacing: 2 })}

      {txt(x + w / 2, midY("company"), "C.H.H. INDUSTRY CO.,LTD .", { size: 26, weight: 600, letterSpacing: 2 })}

      {txt(x + w / 2, midY("ownerH"), "PROJECT OWNER", { size: 38, weight: 900 })}
      {txt(x + w / 2, midY("ownerV"), owner, { size: 28, weight: 600 })}

      {line(splitHalf, yMap.pcH.y, splitHalf, yMap.pcH.y + yMap.pcH.h + yMap.pcV.h, 2)}
      {txt(x + (splitHalf - x) / 2, midY("pcH"), "PROJECT CODE", { size: 24, weight: 900 })}
      {txt(splitHalf + (x + w - splitHalf) / 2, midY("pcH"), "CODE", { size: 32, weight: 900 })}
      {txt(x + (splitHalf - x) / 2, midY("pcV"), projectCode, { size: 28, weight: 600 })}
      {txt(splitHalf + (x + w - splitHalf) / 2, midY("pcV"), code, { size: 28, weight: 600 })}

      {txt(x + w / 2, midY("dimH"), "DIMENSION", { size: 34, weight: 900 })}
      {txt(x + w / 2, midY("dimV"), dimText, { size: 26, weight: 600 })}

      {txt(x + w / 2, midY("typeH"), "TYPE", { size: 34, weight: 900 })}
      {txt(x + w / 2, midY("typeV"), type, { size: 26, weight: 600 })}

      {line(splitIssue, yMap.issueH.y, splitIssue, yMap.issueH.y + yMap.issueH.h + yMap.issueV.h, 2)}
      {txt(x + (splitIssue - x) / 2, midY("issueH"), "ISSUE DATE", { size: 30, weight: 900 })}
      {txt(splitIssue + (x + w - splitIssue) / 2, midY("issueH"), "REVISE", { size: 28, weight: 900 })}
      {txt(x + (splitIssue - x) / 2, midY("issueV"), issueDate, { size: 26, weight: 600 })}
      {txt(splitIssue + (x + w - splitIssue) / 2, midY("issueV"), String(revise), { size: 26, weight: 600 })}

      {["drawn", "checked", "sale", "co"].map((kRow) => {
        const yy = yMap[kRow].y;
        const hh = yMap[kRow].h;
        const value = kRow === "drawn" ? drawn : kRow === "checked" ? checked : kRow === "sale" ? sale : coApproved;
        const label = kRow === "drawn" ? "DRAWN" : kRow === "checked" ? "CHECKED" : kRow === "sale" ? "SALE" : "CO-APPROVED";

        return (
          <React.Fragment key={`ap-${kRow}`}>
            {line(splitName, yy, splitName, yy + hh, 2)}
            {txt(x + (splitName - x) / 2, yy + hh / 2, label, { size: 18, weight: 600 })}
            <text x={splitName + pad} y={yy + hh / 2} fill={fill} fontFamily={font} fontSize={18} fontWeight={500} textAnchor="start" dominantBaseline="middle">
              {value || ""}
            </text>
          </React.Fragment>
        );
      })}

      <text x={x + pad * 2} y={yMap.tol.y + yMap.tol.h * 0.25} fill={fill} fontFamily={font} fontSize={18} fontWeight={500} textAnchor="start" dominantBaseline="middle">
        Straightness ( ± 4 MM. )
      </text>
      <text x={x + pad * 2} y={yMap.tol.y + yMap.tol.h * 0.45} fill={fill} fontFamily={font} fontSize={18} fontWeight={500} textAnchor="start" dominantBaseline="middle">
        Tolerance ( ± 3 MM. )
      </text>
      <text x={x + pad * 2} y={yMap.tol.y + yMap.tol.h * 0.65} fill={fill} fontFamily={font} fontSize={18} fontWeight={500} textAnchor="start" dominantBaseline="middle">
        Thickness ( ± 1 MM. )
      </text>
      <text x={x + pad * 2} y={yMap.tol.y + yMap.tol.h * 0.85} fill={fill} fontFamily={font} fontSize={18} fontWeight={500} textAnchor="start" dominantBaseline="middle">
        UNIT : Millimeters
      </text>

      <rect x={x + w * 0.25} y={yMap.qr.y + yMap.qr.h * 0.18} width={w * 0.5} height={yMap.qr.h * 0.55} fill="none" stroke={stroke} strokeWidth="2" />
      {txt(x + w / 2, yMap.qr.y + yMap.qr.h * 0.48, "QR", { size: 28, weight: 900 })}

      {txt(x + w / 2, midY("thai1"), "*เงื่อนไขการรับประกันสินค้า*", { size: 20, weight: 600 })}
      {txt(x + w / 2, midY("thai2"), "*ตรวจสอบยืนยันทุกครั้งก่อนเซ็นต์อนุมัติ*", { size: 20, weight: 600 })}
      {txt(x + w / 2, midY("sig"), "( Customer SIG.)", { size: 20, weight: 600 })}
      {txt(x + w / 2, midY("app"), "( Approved date )", { size: 20, weight: 600 })}

      <text x={x + w - pad} y={midY("footer")} fill={fill} fontFamily={font} fontSize={18} fontWeight={500} textAnchor="end" dominantBaseline="middle">
        FP-MR-02-02 Rev.00
      </text>
    </g>
  );
};

// ==================== ENHANCED ENGINEERING DRAWING ====================
export const EnhancedEngineeringDrawing = memo(({ results, coreCalculation }) => {
  const svgRef = useRef(null);
  const [visibleLayers, setVisibleLayers] = useState(() => Object.fromEntries(Object.entries(LAYER_CONFIG).map(([key, config]) => [key, config.defaultVisible])));
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const theme = {
    background: "#FFFFFF",
    paper: "#FFFFFF",
    stroke: "#000000",
    text: "#000000",
    gridText: "#000000",
    border: "#000000",
    accent: "#000000",
  };

  const safeResults = results || {};
  const { W = 0, H = 0, T = 0, S = 0, F = 0, R = 0, railPositions = [], railSections = 3, lockBlockBottom = 1200, lockBlockLeft = false, lockBlockRight = false, lockBlockPosition = 1000, lockBlockCount = 0, lockBlockSides = 1, doubleFrame = {} } = safeResults;

  const titleData = useMemo(
    () => ({
      projectOwner: safeResults.projectOwner || "",
      projectCode: safeResults.projectCode || "0",
      code: safeResults.code || "0",
      dimension: `${T} × ${W} × ${H} mm`,
      type: safeResults.type || "",
      issueDate: safeResults.issueDate || "",
      revise: safeResults.revise ?? "0",
      drawn: safeResults.drawn || "",
      checked: safeResults.checked || "",
      sale: safeResults.sale || "",
      coApproved: safeResults.coApproved || "",
    }),
    [safeResults, T, W, H],
  );

  const safeH = H > 0 ? H : 2000;
  const safeW = W > 0 ? W : 800;
  const safeT = T > 0 ? T : 35;
  const safeS = S > 0 ? S : 4;
  const safeF = F > 0 ? F : 50;
  const safeR = R > 0 ? R : 27;

  const wrapperKey = useMemo(() => `drawing-${safeT}-${safeW}-${safeH}`, [safeT, safeW, safeH]);

  const viewBoxWidth = 2970;
  const viewBoxHeight = 2100;
  const DRAWING_SCALE = 0.5;

  const hasDoubleFrame = doubleFrame?.hasAny && doubleFrame.count > 0;
  const drawingDF = hasDoubleFrame ? safeF * doubleFrame.count : 0;
  const piecesPerSide = parseInt(lockBlockCount / (lockBlockSides || 1)) || 0;

  const dims = useMemo(
    () => ({
      front: {
        W: safeW * DRAWING_SCALE,
        H: safeH * DRAWING_SCALE,
        F: safeF * DRAWING_SCALE,
        DF: drawingDF * DRAWING_SCALE,
        totalFrame: safeF * DRAWING_SCALE,
        R: safeR * DRAWING_SCALE,
        lockBlockW: safeF * DRAWING_SCALE,
      },
      side: {
        T: safeT * DRAWING_SCALE,
        H: safeH * DRAWING_SCALE,
        S: safeS * DRAWING_SCALE,
      },
    }),
    [safeW, safeH, safeT, safeS, safeF, safeR, drawingDF],
  );

  const marginX = 150;
  const marginY = 200;

  const positions = {
    side: { x: marginX, y: marginY + 200 },
    front: { x: marginX + 700, y: marginY + 200 },
  };

  const layerStyle = useMemo(() => {
    let css = "";
    Object.entries(visibleLayers).forEach(([layer, visible]) => {
      if (!visible) css += `.layer-${layer} { display: none !important; }`;
    });
    return css;
  }, [visibleLayers]);

  const exportToPDF = useCallback(async () => {
    if (!svgRef.current) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const svgElement = svgRef.current.cloneNode(true);
      const styleTag = svgElement.querySelector("style");
      if (styleTag) styleTag.remove();

      await svg2pdf(svgElement, pdf, {
        x: 0,
        y: 0,
        width: 297,
        height: 210,
      });

      pdf.save(`door-drawing-${safeT}x${safeW}x${safeH}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
    }
    setIsExporting(false);
  }, [safeT, safeW, safeH]);

  const exportToPNG = useCallback(
    async (scale = 2) => {
      if (!svgRef.current) return;
      setIsExporting(true);
      try {
        const dataUrl = await htmlToImage.toPng(svgRef.current, {
          quality: 1,
          pixelRatio: scale,
          backgroundColor: theme.background,
        });
        const link = document.createElement("a");
        link.download = `door-drawing-${safeT}x${safeW}x${safeH}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("PNG export error:", error);
      }
      setIsExporting(false);
    },
    [safeT, safeW, safeH, theme.background],
  );

  const exportToDXF = useCallback(() => {
    setIsExporting(true);
    try {
      const dxfContent = generateDXF(safeResults);
      const blob = new Blob([dxfContent], { type: "application/dxf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `door-drawing-${safeT}x${safeW}x${safeH}.dxf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DXF export error:", error);
    }
    setIsExporting(false);
  }, [safeResults, safeT, safeW, safeH]);

  const toggleLayer = useCallback((layerId) => {
    setVisibleLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  }, []);

  const toggleAllLayers = useCallback((visible) => {
    setVisibleLayers(Object.fromEntries(Object.keys(LAYER_CONFIG).map((key) => [key, visible])));
  }, []);

  const getCorePatternId = (value) => {
    if (value === "honeycomb") return "hatch-core";
    if (value === "foam") return "hatch-foam";
    if (value === "rockwool") return "hatch-rockwool";
    if (value === "particle_solid" || value === "particle_strips") return "hatch-particle";
    if (value === "plywood_strips") return "hatch-plywood";
    return "hatch-core";
  };

  const corePatternId = useMemo(() => getCorePatternId(coreCalculation?.coreType?.value), [coreCalculation?.coreType?.value]);

  const renderLockBlocks = useCallback(() => {
    const blocks = [];
    const lockBlockH = LOCK_BLOCK_HEIGHT * DRAWING_SCALE;
    const lockBlockY = positions.front.y + dims.front.H - lockBlockBottom * DRAWING_SCALE;

    const getOffset = (isLeft) => {
      const hasDoubleOnSide = hasDoubleFrame && doubleFrame && doubleFrame.count > 0 && (isLeft ? doubleFrame.left : doubleFrame.right);
      return dims.front.F + (hasDoubleOnSide ? dims.front.DF : 0);
    };

    const renderSide = (isLeft) => {
      if (!(isLeft ? lockBlockLeft : lockBlockRight)) return;

      const offset = getOffset(isLeft);

      [...Array(piecesPerSide)].forEach((_, i) => {
        const x = isLeft ? positions.front.x + offset + dims.front.lockBlockW * i : positions.front.x + dims.front.W - offset - dims.front.lockBlockW * (i + 1);
        blocks.push(<LockBlockSVG key={`lb-${isLeft ? "left" : "right"}-${i}`} x={x} y={lockBlockY} width={dims.front.lockBlockW} height={lockBlockH} />);
      });
    };

    renderSide(true);
    renderSide(false);

    return blocks;
  }, [positions, dims, lockBlockLeft, lockBlockRight, piecesPerSide, lockBlockBottom, hasDoubleFrame, doubleFrame]);

  const renderDoubleFrames = useCallback(() => {
    if (!hasDoubleFrame) return null;

    const elements = [];
    const count = doubleFrame.count;
    const leftOffset = doubleFrame.left ? dims.front.F * count : 0;
    const rightOffset = doubleFrame.right ? dims.front.F * count : 0;

    const configs = [
      {
        key: "left",
        getRect: (i) => ({
          x: positions.front.x + dims.front.F + dims.front.F * i,
          y: positions.front.y + dims.front.F,
          w: dims.front.F,
          h: dims.front.H - 2 * dims.front.F,
        }),
      },
      {
        key: "right",
        getRect: (i) => ({
          x: positions.front.x + dims.front.W - dims.front.F - dims.front.F * (i + 1),
          y: positions.front.y + dims.front.F,
          w: dims.front.F,
          h: dims.front.H - 2 * dims.front.F,
        }),
      },
      {
        key: "top",
        getRect: (i) => ({
          x: positions.front.x + dims.front.F + leftOffset,
          y: positions.front.y + dims.front.F + dims.front.F * i,
          w: dims.front.W - 2 * dims.front.F - leftOffset - rightOffset,
          h: dims.front.F,
        }),
      },
      {
        key: "bottom",
        getRect: (i) => ({
          x: positions.front.x + dims.front.F + leftOffset,
          y: positions.front.y + dims.front.H - dims.front.F - dims.front.F * (i + 1),
          w: dims.front.W - 2 * dims.front.F - leftOffset - rightOffset,
          h: dims.front.F,
        }),
      },
      {
        key: "center",
        getRect: (i) => ({
          x: positions.front.x + dims.front.W / 2 - dims.front.F / 2 + (i - (count - 1) / 2) * dims.front.F,
          y: positions.front.y + dims.front.F,
          w: dims.front.F,
          h: dims.front.H - 2 * dims.front.F,
        }),
      },
    ];

    configs.forEach(({ key, getRect }) => {
      if (!doubleFrame[key]) return;
      for (let i = 0; i < count; i++) {
        const r = getRect(i);
        elements.push(<rect key={`df-${key}-${i}`} className="layer-doubleframe" x={r.x} y={r.y} width={r.w} height={r.h} fill="url(#hatch-doubleframe)" stroke="#000000" strokeWidth="1" strokeDasharray="8,4" />);
      }
    });

    return elements;
  }, [hasDoubleFrame, positions, dims, doubleFrame]);

  const renderRails = useCallback(() => {
    if (!railPositions || railPositions.length === 0) return null;
    if (coreCalculation?.coreType?.value === "particle_strips") return null;

    const leftOffset = hasDoubleFrame && doubleFrame.left ? dims.front.DF : 0;
    const rightOffset = hasDoubleFrame && doubleFrame.right ? dims.front.DF : 0;
    const railX = positions.front.x + dims.front.F + leftOffset;
    const railWidth = dims.front.W - 2 * dims.front.F - leftOffset - rightOffset;

    return railPositions.map((pos, idx) => {
      const railY = positions.front.y + dims.front.H - pos * DRAWING_SCALE;
      return <FilledRect key={`front-rail-${idx}`} className="layer-rails" x={railX} y={railY - dims.front.R / 2} width={railWidth} height={dims.front.R} patternId="hatch-rails" strokeWidth={1} />;
    });
  }, [railPositions, positions, dims, hasDoubleFrame, doubleFrame, coreCalculation]);

  const renderCore = useCallback(() => {
    if (!coreCalculation || !coreCalculation.coreType || coreCalculation.totalPieces === 0) return null;

    const elements = [];
    const pid = getCorePatternId(coreCalculation.coreType.value);

    if (coreCalculation.isSolid) {
      coreCalculation.pieces.forEach((piece, idx) => {
        elements.push(<rect key={`core-solid-${idx}`} className="layer-core" x={positions.front.x + piece.x * DRAWING_SCALE} y={positions.front.y + piece.y * DRAWING_SCALE} width={piece.width * DRAWING_SCALE} height={piece.height * DRAWING_SCALE} fill={`url(#${pid})`} stroke="#000000" strokeWidth="0.5" strokeDasharray="4,4" />);
      });
      return elements;
    }

    const maxPiecesToDraw = 200;
    const piecesToDraw = coreCalculation.pieces.slice(0, maxPiecesToDraw);

    piecesToDraw.forEach((piece, idx) => {
      elements.push(<rect key={`core-strip-${idx}`} className="layer-core" x={positions.front.x + piece.x * DRAWING_SCALE} y={positions.front.y + piece.y * DRAWING_SCALE} width={piece.width * DRAWING_SCALE} height={piece.height * DRAWING_SCALE} fill={`url(#${pid})`} stroke="#000000" strokeWidth="0.25" opacity="0.95" />);
    });

    if (coreCalculation.damPieces?.length) {
      coreCalculation.damPieces.forEach((p) => {
        elements.push(<rect key={p.id} className="layer-core" x={positions.front.x + p.x * DRAWING_SCALE} y={positions.front.y + p.y * DRAWING_SCALE} width={p.width * DRAWING_SCALE} height={p.height * DRAWING_SCALE} fill={`url(#${pid})`} stroke="#000000" strokeWidth="0.35" />);
      });
    }

    if (coreCalculation.pieces.length > maxPiecesToDraw) {
      elements.push(
        <text key="core-overflow-text" x={positions.front.x + dims.front.W / 2} y={positions.front.y + dims.front.H / 2} textAnchor="middle" fontSize="14" fill="#4456E9">
          +{coreCalculation.pieces.length - maxPiecesToDraw} more strips
        </text>,
      );
    }

    return elements;
  }, [coreCalculation, positions, dims]);

  return (
    <div className="relative w-full h-full flex flex-col bg-default-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-default-50 border-b-2 border-default gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="shadow">
            {Math.round(zoomLevel * 100)}%
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button size="sm" variant="shadow" startContent={<Layers className="w-4 h-4" />}>
                Layers
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="p-2 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b-2 border-default">
                  <span className="font-semibold text-sm">Layers</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="light" onPress={() => toggleAllLayers(true)}>
                      All On
                    </Button>
                    <Button size="sm" variant="light" onPress={() => toggleAllLayers(false)}>
                      All Off
                    </Button>
                  </div>
                </div>
                {Object.entries(LAYER_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: config.color }} />
                      <span className="text-sm">{config.label}</span>
                    </div>
                    <Switch size="sm" isSelected={visibleLayers[key]} onValueChange={() => toggleLayer(key)} />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Divider orientation="vertical" className="h-6 mx-1" />

          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" color="primary" variant="shadow" startContent={<Download className="w-4 h-4" />} endContent={<ChevronDown className="w-3 h-3" />} isLoading={isExporting}>
                Export
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Export options">
              <DropdownItem key="pdf" startContent={<FileText className="w-4 h-4" />} description="Vector format, best for printing" onPress={exportToPDF}>
                Export as PDF
              </DropdownItem>

              <DropdownItem key="png-hd" startContent={<FileImage className="w-4 h-4" />} description="4x resolution for large prints" onPress={() => exportToPNG(4)}>
                Export as PNG (4K)
              </DropdownItem>

              <DropdownItem key="dxf" startContent={<FileCode className="w-4 h-4" />} description="For AutoCAD/CAD software" onPress={exportToDXF}>
                Export as DXF
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Tooltip content="Print">
            <Button size="sm" variant="shadow" isIconOnly onPress={() => window.print()}>
              <Printer className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: theme.background }}>
        <TransformWrapper key={wrapperKey} initialScale={1} minScale={0.1} maxScale={5} centerOnInit onTransformed={(ref) => setZoomLevel(ref.state.scale)} wheel={{ step: 0.1 }}>
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
              <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-default-50/90 backdrop-blur-sm rounded-xl p-2 shadow-md border-2 border-default">
                <Tooltip content="Zoom In" placement="left">
                  <Button size="sm" variant="light" isIconOnly onPress={() => zoomIn()}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Zoom Out" placement="left">
                  <Button size="sm" variant="light" isIconOnly onPress={() => zoomOut()}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Divider className="my-1" />
                <Tooltip content="Fit to View" placement="left">
                  <Button size="sm" variant="light" isIconOnly onPress={() => centerView()}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Reset Zoom" placement="left">
                  <Button size="sm" variant="light" isIconOnly onPress={() => resetTransform()}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>

              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <svg ref={svgRef} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} width="297mm" height="210mm" className="w-full h-auto" style={{ backgroundColor: theme.paper }}>
                  <style>{layerStyle}</style>

                  <defs>
                    <pattern id="hatch-surface" patternUnits="userSpaceOnUse" width="8" height="8">
                      <path d="M0 8 L8 0" stroke="#000000" strokeWidth="0.3" />
                    </pattern>

                    <pattern id="hatch-frame" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M2 0 L2 4" stroke="#000000" strokeWidth="0.4" />
                    </pattern>

                    <pattern id="hatch-rails" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M0 2 L4 2" stroke="#000000" strokeWidth="0.4" />
                    </pattern>

                    <pattern id="hatch-lockblock" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M2 0 L2 4" stroke="#000000" strokeWidth="0.4" />
                    </pattern>

                    <pattern id="hatch-core" patternUnits="userSpaceOnUse" width="17.32" height="20">
                      <polygon points="8.66,0 17.32,5 17.32,15 8.66,20 0,15 0,5" fill="none" stroke="#555555" strokeWidth="0.6" />
                      <polygon points="17.32,10 25.98,15 25.98,25 17.32,30 8.66,25 8.66,15" fill="none" stroke="#555555" strokeWidth="0.6" />
                    </pattern>

                    <pattern id="hatch-particle" patternUnits="userSpaceOnUse" width="10" height="10">
                      <circle cx="2" cy="3" r="0.6" fill="#000000" opacity="0.35" />
                      <circle cx="7" cy="2" r="0.5" fill="#000000" opacity="0.25" />
                      <circle cx="5" cy="7" r="0.7" fill="#000000" opacity="0.3" />
                      <circle cx="9" cy="8" r="0.4" fill="#000000" opacity="0.22" />
                      <circle cx="1" cy="9" r="0.45" fill="#000000" opacity="0.2" />
                    </pattern>

                    <pattern id="hatch-foam" patternUnits="userSpaceOnUse" width="12" height="12">
                      <circle cx="3" cy="3" r="0.7" fill="#000000" opacity="0.18" />
                      <circle cx="9" cy="4" r="0.6" fill="#000000" opacity="0.14" />
                      <circle cx="6" cy="9" r="0.8" fill="#000000" opacity="0.16" />
                    </pattern>

                    <pattern id="hatch-rockwool" patternUnits="userSpaceOnUse" width="18" height="12">
                      <path d="M0 3 C4 0, 8 6, 12 3 S20 6, 24 3" stroke="#000000" strokeWidth="0.35" opacity="0.25" fill="none" />
                      <path d="M0 9 C4 6, 8 12, 12 9 S20 12, 24 9" stroke="#000000" strokeWidth="0.35" opacity="0.2" fill="none" />
                    </pattern>

                    <pattern id="hatch-plywood" patternUnits="userSpaceOnUse" width="12" height="12">
                      <path d="M0 10 L10 0" stroke="#000000" strokeWidth="0.35" opacity="0.25" />
                      <path d="M2 12 L12 2" stroke="#000000" strokeWidth="0.35" opacity="0.18" />
                      <path d="M0 6 L6 0" stroke="#000000" strokeWidth="0.25" opacity="0.15" />
                    </pattern>

                    <pattern id="hatch-doubleframe" patternUnits="userSpaceOnUse" width="6" height="6">
                      <path d="M0 6 L6 0" stroke="#000000" strokeWidth="0.3" />
                      <path d="M0 0 L6 6" stroke="#000000" strokeWidth="0.3" />
                    </pattern>
                  </defs>

                  <rect x="8" y="8" width={viewBoxWidth - 16} height={viewBoxHeight - 16} fill="none" stroke={theme.border} strokeWidth="2" />
                  <rect x="12" y="12" width={viewBoxWidth - 24} height={viewBoxHeight - 24} fill="none" stroke={theme.border} strokeWidth="0.5" />

                  <g className="layer-grid" fontSize="20" fill={theme.gridText}>
                    {GRID_LETTERS.map((letter, i) => (
                      <text key={`grid-${letter}`} x="40" y={200 + i * 400} textAnchor="middle">
                        {letter}
                      </text>
                    ))}
                    {GRID_NUMBERS.map((num, i) => (
                      <text key={`grid-${num}`} x={250 + i * 200} y="120" textAnchor="middle">
                        {num}
                      </text>
                    ))}
                  </g>

                  <text x={viewBoxWidth / 2} y="80" textAnchor="middle" fontSize="40" fontWeight="bold" fill={theme.text}>
                    DOOR FRAME STRUCTURE DRAWING
                  </text>

                  <g id="side-view">
                    <text x={positions.side.x + dims.side.T / 2} y={positions.side.y + dims.side.H + 70} textAnchor="middle" fontSize="28" fontWeight="bold" fill={theme.text}>
                      Side View
                    </text>

                    <FilledRect className="layer-surface" x={positions.side.x} y={positions.side.y} width={dims.side.S} height={dims.side.H} patternId="hatch-surface" strokeWidth={0.8} />
                    <FilledRect className="layer-surface" x={positions.side.x + dims.side.T - dims.side.S} y={positions.side.y} width={dims.side.S} height={dims.side.H} patternId="hatch-surface" strokeWidth={0.8} />

                    <FilledRect className="layer-frame" x={positions.side.x + dims.side.S} y={positions.side.y} width={(dims.side.T - 2 * dims.side.S) * 0.25} height={dims.side.H} patternId="hatch-frame" />
                    <FilledRect className="layer-frame" x={positions.side.x + dims.side.T - dims.side.S - (dims.side.T - 2 * dims.side.S) * 0.25} y={positions.side.y} width={(dims.side.T - 2 * dims.side.S) * 0.25} height={dims.side.H} patternId="hatch-frame" />

                    <FilledRect className="layer-core" x={positions.side.x + dims.side.S + (dims.side.T - 2 * dims.side.S) * 0.25} y={positions.side.y} width={(dims.side.T - 2 * dims.side.S) * 0.5} height={dims.side.H} patternId={corePatternId} strokeWidth={0.8} strokeDasharray="4,4" />

                    <CenterLine x1={positions.side.x + dims.side.T / 2} y1={positions.side.y - 40} x2={positions.side.x + dims.side.T / 2} y2={positions.side.y + dims.side.H + 40} theme={theme} />

                    {railPositions.map((pos, idx) => {
                      const railY = positions.side.y + dims.side.H - pos * DRAWING_SCALE;
                      const railH = safeR * DRAWING_SCALE * 0.5;
                      return <FilledRect key={`side-rail-${idx}`} className="layer-rails" x={positions.side.x + dims.side.S} y={railY - railH / 2} width={dims.side.T - 2 * dims.side.S} height={railH} patternId="hatch-rails" />;
                    })}

                    {(lockBlockLeft || lockBlockRight) && <rect className="layer-lockblock" x={positions.side.x + dims.side.S} y={positions.side.y + dims.side.H - lockBlockBottom * DRAWING_SCALE} width={dims.side.T - 2 * dims.side.S} height={LOCK_BLOCK_HEIGHT * DRAWING_SCALE} fill="none" stroke="#000000" strokeWidth="1.4" strokeDasharray="6,4" />}

                    {(lockBlockLeft || lockBlockRight) &&
                      (() => {
                        const lockBlockTopY = positions.side.y + dims.side.H - lockBlockBottom * DRAWING_SCALE;
                        const lockBlockBottomY = lockBlockTopY + LOCK_BLOCK_HEIGHT * DRAWING_SCALE;
                        return <DimLine x1={positions.side.x} y1={lockBlockTopY} x2={positions.side.x} y2={lockBlockBottomY} value={LOCK_BLOCK_HEIGHT} offset={-60} vertical fontSize={16} theme={theme} />;
                      })()}

                    <DimLine x1={positions.side.x} y1={positions.side.y} x2={positions.side.x + dims.side.T} y2={positions.side.y} value={T} offset={-160} fontSize={18} theme={theme} />
                    <DimLine x1={positions.side.x} y1={positions.side.y} x2={positions.side.x + dims.side.S} y2={positions.side.y} value={S} offset={-80} fontSize={18} theme={theme} />
                    <DimLine x1={positions.side.x + dims.side.S} y1={positions.side.y} x2={positions.side.x + dims.side.T - dims.side.S} y2={positions.side.y} value={T - 2 * S} offset={-120} fontSize={18} theme={theme} />
                    <DimLine x1={positions.side.x + dims.side.T} y1={positions.side.y} x2={positions.side.x + dims.side.T} y2={positions.side.y + dims.side.H} value={H} offset={100} vertical fontSize={18} theme={theme} />
                  </g>

                  <g id="front-view">
                    <text x={positions.front.x + dims.front.W / 2} y={positions.front.y + dims.front.H + 70} textAnchor="middle" fontSize="28" fontWeight="bold" fill={theme.text}>
                      Front View
                    </text>

                    <FilledRect className="layer-frame" x={positions.front.x} y={positions.front.y} width={dims.front.F} height={dims.front.H} patternId="hatch-frame" strokeWidth={1.2} />
                    <FilledRect className="layer-frame" x={positions.front.x + dims.front.W - dims.front.F} y={positions.front.y} width={dims.front.F} height={dims.front.H} patternId="hatch-frame" strokeWidth={1.2} />

                    <FilledRect className="layer-rails" x={positions.front.x + dims.front.F} y={positions.front.y} width={dims.front.W - 2 * dims.front.F} height={dims.front.F} patternId="hatch-rails" strokeWidth={1.2} />
                    <FilledRect className="layer-rails" x={positions.front.x + dims.front.F} y={positions.front.y + dims.front.H - dims.front.F} width={dims.front.W - 2 * dims.front.F} height={dims.front.F} patternId="hatch-rails" strokeWidth={1.2} />

                    {renderCore()}
                    {renderDoubleFrames()}
                    {renderRails()}
                    {renderLockBlocks()}

                    <CenterLine x1={positions.front.x + dims.front.W / 2} y1={positions.front.y - 40} x2={positions.front.x + dims.front.W / 2} y2={positions.front.y + dims.front.H + 40} theme={theme} />
                    <CenterLine x1={positions.front.x - 40} y1={positions.front.y + dims.front.H / 2} x2={positions.front.x + dims.front.W + 40} y2={positions.front.y + dims.front.H / 2} theme={theme} />

                    <DimLine x1={positions.front.x} y1={positions.front.y} x2={positions.front.x + dims.front.W} y2={positions.front.y} value={W} offset={-160} fontSize={18} theme={theme} />
                    <DimLine x1={positions.front.x} y1={positions.front.y} x2={positions.front.x + dims.front.F} y2={positions.front.y} value={F} offset={-80} fontSize={18} theme={theme} />
                    <DimLine x1={positions.front.x} y1={positions.front.y} x2={positions.front.x} y2={positions.front.y + dims.front.F} value={F} offset={-80} vertical fontSize={18} theme={theme} />
                    <DimLine x1={positions.front.x + dims.front.W} y1={positions.front.y} x2={positions.front.x + dims.front.W} y2={positions.front.y + dims.front.H} value={H} offset={100} vertical fontSize={18} theme={theme} />

                    {(lockBlockLeft || lockBlockRight) && <DimLine x1={positions.front.x} y1={positions.front.y + dims.front.H} x2={positions.front.x} y2={positions.front.y + dims.front.H - lockBlockPosition * DRAWING_SCALE} value={lockBlockPosition} offset={-100} vertical fontSize={18} theme={theme} />}

                    {railPositions.length > 0 &&
                      (() => {
                        const railPos = railPositions[0];
                        const railCenter = positions.front.y + dims.front.H - railPos * DRAWING_SCALE;
                        const top = railCenter - dims.front.R / 2;
                        const bottom = railCenter + dims.front.R / 2;
                        const dx = positions.front.x + dims.front.W + 120;
                        return <DimLine x1={dx} y1={top} x2={dx} y2={bottom} value={F} offset={40} vertical fontSize={16} theme={theme} />;
                      })()}

                    {railPositions.map((pos, idx) => (
                      <g key={`front-ann-${idx}`} className="layer-dimensions">
                        <line x1={positions.front.x + dims.front.W + 200} y1={positions.front.y + dims.front.H - pos * DRAWING_SCALE} x2={positions.front.x + dims.front.W + 240} y2={positions.front.y + dims.front.H - pos * DRAWING_SCALE} stroke={theme.stroke} strokeWidth="0.8" />
                        <text x={positions.front.x + dims.front.W + 260} y={positions.front.y + dims.front.H - pos * DRAWING_SCALE + 10} fontSize="20" fill={theme.text}>
                          {pos}
                        </text>
                      </g>
                    ))}
                  </g>

                  <TitleBlockSVG x={viewBoxWidth - 439} y={9} w={430} h={viewBoxHeight - 17} theme={theme} data={titleData} />
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-default-50 border-t-2 border-default text-xs text-default-500">
        <div className="flex items-center gap-2">
          <span>
            Door: {T}×{W}×{H} mm
          </span>
          <span>
            Frame: {R}×{F} mm
          </span>
          <span>Rails: {railSections - 1}</span>
          <span>Lock Blocks: {lockBlockCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Scale: 1:25</span>
        </div>
      </div>
    </div>
  );
});

EnhancedEngineeringDrawing.displayName = "EnhancedEngineeringDrawing";

// ==================== MAIN UI COMPONENT ====================
export const UIDoorBom = ({ formRef, doorThickness, setDoorThickness, doorWidth, setDoorWidth, doorHeight, setDoorHeight, surfaceMaterial, setSurfaceMaterial, surfaceThickness, setSurfaceThickness, frameType, setFrameType, selectedFrameCode, setSelectedFrameCode, lockBlockPosition, setLockBlockPosition, lockBlockPiecesPerSide, setLockBlockPiecesPerSide, doubleFrameSides, doubleFrameCount, setDoubleFrameCount, coreType, setCoreType, lockBlockLeft, lockBlockRight, frameSelection, currentFrame, results, cuttingPlan, coreCalculation, isDataComplete, piecesPerSide, doubleConfigSummary, handleToggleDoubleSide, lockBlockDesc }) => {
  return (
    <div ref={formRef} className="flex flex-col items-center justify-start w-full h-full p-2 gap-2 overflow-auto bg-background">
      <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
        <h1 className="text-3xl font-bold text-primary">🚪 Door Configuration System</h1>
        <p className="text-foreground/70">ระบบออกแบบโครงประตู - C.H.H INDUSTRY CO., LTD.</p>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
        <div className="flex flex-col items-center justify-start w-full h-full xl:w-8/12 gap-2">
          {/* Card 1: Customer Specs */}
          <Card className="w-full">
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="md">
                  1
                </Chip>
                <span className="font-semibold">📝 สเปคลูกค้า</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-2">
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Input name="doorThickness" type="number" label="ความหนา (T) mm" labelPlacement="outside" placeholder="Enter Thickness" color="default" variant="bordered" size="md" radius="md" value={doorThickness} onChange={(e) => setDoorThickness(e.target.value)} />
                </div>
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Input name="doorWidth" type="number" label="ความกว้าง (W) mm" labelPlacement="outside" placeholder="Enter Width" color="default" variant="bordered" size="md" radius="md" value={doorWidth} onChange={(e) => setDoorWidth(e.target.value)} />
                </div>
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Input name="doorHeight" type="number" label="ความสูง (H) mm" labelPlacement="outside" placeholder="Enter Height" color="default" variant="bordered" size="md" radius="md" value={doorHeight} onChange={(e) => setDoorHeight(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-center w-full p-2">
                <Chip color="primary" variant="shadow" size="lg">
                  สเปค: {formatDimension(doorThickness, doorWidth, doorHeight)} mm
                </Chip>
              </div>
            </CardBody>
          </Card>

          {/* Card 2: Surface Material */}
          <Card className="w-full">
            <CardHeader className="bg-success text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="md">
                  2
                </Chip>
                <span className="font-semibold">🎨 วัสดุปิดผิว</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-2">
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Select name="surfaceMaterial" label="ประเภทวัสดุ" labelPlacement="outside" placeholder="Please Select" color="default" variant="bordered" size="md" radius="md" selectedKeys={surfaceMaterial ? [surfaceMaterial] : []} onSelectionChange={(keys) => setSurfaceMaterial([...keys][0] || "")}>
                    {SURFACE_MATERIALS.map((mat) => (
                      <SelectItem key={mat.value}>{mat.label}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Input name="surfaceThickness" type="number" label="ความหนา/แผ่น (mm)" labelPlacement="outside" placeholder="Enter Thickness" color="default" variant="bordered" size="md" radius="md" value={surfaceThickness} onChange={(e) => setSurfaceThickness(e.target.value)} />
                </div>
              </div>
              <Divider />
              <div className="flex flex-col gap-2 text-sm p-2">
                <div className="flex justify-between">
                  <span>วัสดุ:</span>
                  <span className="font-bold text-success">{getMaterialLabel(SURFACE_MATERIALS, surfaceMaterial)}</span>
                </div>
                <div className="flex justify-between">
                  <span>วัสดุปิดผิว:</span>
                  <span>
                    {surfaceThickness || 0} mm × 2 = {(parseFloat(surfaceThickness) || 0) * 2} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>กาว:</span>
                  <span>
                    {GLUE_THICKNESS} mm × 2 = {GLUE_THICKNESS * 2} mm
                  </span>
                </div>
                <Divider className="my-1" />
                <div className="flex justify-between font-bold">
                  <span>รวมทั้งหมด:</span>
                  <span>{results.totalSurfaceThickness} mm</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>ความหนาโครงที่ต้องการ:</span>
                  <span className="text-success">{results.frameThickness} mm</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card 3: Frame (ERP) */}
          <Card className="w-full">
            <CardHeader className="bg-warning text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="md">
                  3
                </Chip>
                <span className="font-semibold">🪵 โครง (ERP)</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-2">
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Select name="frameType" label="ประเภทไม้โครง" labelPlacement="outside" placeholder="Please Select" color="default" variant="bordered" size="md" radius="md" selectedKeys={frameType ? [frameType] : []} onSelectionChange={(keys) => setFrameType([...keys][0] || "")}>
                    {FRAME_TYPES.map((opt) => (
                      <SelectItem key={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Select name="selectedFrameCode" label={`เลือกไม้โครง (ยาว≥${doorHeight || 0}mm)`} labelPlacement="outside" placeholder="Please Select" color="default" variant="bordered" size="md" radius="md" isDisabled={!frameType || frameSelection.frames.length === 0} selectedKeys={selectedFrameCode ? [selectedFrameCode] : []} onSelectionChange={(keys) => setSelectedFrameCode([...keys][0] || "")}>
                    {frameSelection.frames.map((frame) => (
                      <SelectItem key={frame.code}>{frame.displaySize}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {frameType && frameSelection.frames.length === 0 && (
                <Chip color="danger" variant="shadow" className="w-full">
                  ⚠️ {frameSelection.reason || `ไม่มีไม้ที่ใช้ได้สำหรับความหนา ${results.frameThickness}mm`}
                </Chip>
              )}

              {frameType && frameSelection.frames.length > 0 && (
                <div className="flex flex-col gap-2 text-sm p-2 bg-warning/10 rounded-xl">
                  <div className="flex justify-between">
                    <span>ไม้โครงใช้จริง:</span>
                    <span className="font-bold text-secondary">
                      {currentFrame.useThickness}×{currentFrame.useWidth} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>รหัส ERP:</span>
                    <span className="font-mono text-xs">{selectedFrameCode}</span>
                  </div>
                  {currentFrame.isFlipped && (
                    <Chip color="secondary" variant="shadow" size="md">
                      🔄 พลิกไม้ {currentFrame.thickness}×{currentFrame.width} → {currentFrame.width}×{currentFrame.thickness}
                    </Chip>
                  )}
                  {currentFrame.planeAmount > 0 && (
                    <Chip color="secondary" variant="shadow" size="md">
                      🪚 ต้องไสเนื้อออก {currentFrame.planeAmount} mm
                    </Chip>
                  )}
                  {currentFrame.needSplice && (
                    <div className="flex flex-col gap-2 mt-2 p-2 bg-primary/10 rounded-xl">
                      <Chip color="primary" variant="shadow" size="md">
                        🔗 ต่อไม้ {currentFrame.spliceCount} ท่อน
                      </Chip>
                      <span className="text-xs">• ตำแหน่งต่อ: {currentFrame.splicePosition} mm จากปลาย</span>
                      <span className="text-xs">• เผื่อซ้อนทับ: {currentFrame.spliceOverlap} mm</span>
                      <span className="text-xs">• ความยาวรวม: {currentFrame.effectiveLength} mm</span>
                    </div>
                  )}
                </div>
              )}

              <Divider />

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">ด้านที่ต้องการเบิ้ลโครง</span>
                <div className="flex flex-wrap gap-2">
                  {DOUBLE_FRAME_SIDES.map(({ key, label }) => (
                    <Button key={key} color={doubleFrameSides[key] ? "warning" : "default"} variant={doubleFrameSides[key] ? "solid" : "bordered"} size="md" radius="md" onPress={() => handleToggleDoubleSide(key)}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                <Select name="doubleFrameCount" label="จำนวนไม้เบิ้ลต่อด้าน" labelPlacement="outside" placeholder="Please Select" color="default" variant="bordered" size="md" radius="md" selectedKeys={doubleFrameCount ? [doubleFrameCount] : []} onSelectionChange={(keys) => setDoubleFrameCount([...keys][0] || "")}>
                  {DOUBLE_FRAME_COUNT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              </div>

              {doubleConfigSummary && (
                <Chip color="warning" variant="shadow" className="w-full">
                  {doubleConfigSummary}
                </Chip>
              )}
            </CardBody>
          </Card>

          {/* Card 4: Horizontal Rails */}
          <Card className="w-full">
            <CardHeader className="bg-secondary text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="md">
                  4
                </Chip>
                <span className="font-semibold">➖ ไม้ดามแนวนอน</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="flex flex-col gap-2 text-sm p-2 bg-secondary/10 rounded-xl">
                <div className="flex justify-between">
                  <span>จำนวนช่อง:</span>
                  <span className="font-bold text-secondary">
                    {results.railSections} ช่อง ({results.railSections - 1} ไม้ดาม)
                  </span>
                </div>

                {doorHeight && parseFloat(doorHeight) >= 2400 && (
                  <Chip color="secondary" variant="shadow" size="md">
                    ⚡ ประตูสูงเกิน 2400mm → แบ่ง 4 ช่อง อัตโนมัติ
                  </Chip>
                )}

                {results.railsAdjusted && (
                  <Chip color="warning" variant="shadow" size="md">
                    🔄 ปรับตำแหน่งไม้ดามอัตโนมัติเพื่อหลบ Lock Block
                  </Chip>
                )}

                <div className="flex justify-between">
                  <span>ขนาดไม้ดาม:</span>
                  <span className="font-bold text-secondary">{coreType === "particle_strips" ? `${coreCalculation.stripThickness || 12} mm (ปาติเกิ้ลซี่ตัดซอย)` : `${currentFrame.useThickness || 0}×${currentFrame.useWidth || 0} mm`}</span>
                </div>

                {coreType !== "particle_strips" && <span className="text-xs text-foreground/60">(ใช้ไม้เดียวกับโครง)</span>}
                {coreType === "particle_strips" && <span className="text-xs text-foreground/60">(ใช้ปาติเกิ้ลซี่ทำเป็นไม้ดามแทน)</span>}

                <Divider className="my-1" />

                {results.railPositions.map((pos, idx) => {
                  const wasAdjusted = results.railPositionsOriginal && pos !== results.railPositionsOriginal[idx];
                  return (
                    <div key={idx} className="flex justify-between">
                      <span>ตำแหน่งที่ {idx + 1}:</span>
                      <span>
                        {pos} mm {wasAdjusted && <span className="text-xs">(เดิม {results.railPositionsOriginal[idx]})</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Card 5: Lock Block */}
          <Card className="w-full">
            <CardHeader className="bg-danger text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="md">
                  5
                </Chip>
                <span className="font-semibold">🔒 Lock Block (รองลูกบิด)</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-2">
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Select name="lockBlockPiecesPerSide" label="จำนวนต่อฝั่ง" labelPlacement="outside" placeholder="Please Select" color="default" variant="bordered" size="md" radius="md" selectedKeys={lockBlockPiecesPerSide ? [lockBlockPiecesPerSide] : []} onSelectionChange={(keys) => setLockBlockPiecesPerSide([...keys][0] || "")}>
                    {LOCK_BLOCK_PIECES_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                  <Select name="lockBlockPosition" label="ตำแหน่ง Lock Block" labelPlacement="outside" placeholder="Please Select" color="default" variant="bordered" size="md" radius="md" selectedKeys={lockBlockPosition ? [lockBlockPosition] : []} onSelectionChange={(keys) => setLockBlockPosition([...keys][0] || "")}>
                    {LOCK_BLOCK_POSITIONS.map((pos) => (
                      <SelectItem key={pos.value} textValue={`${pos.label} (${pos.value === "both" ? `${piecesPerSide * 2} ชิ้น` : `${piecesPerSide} ชิ้น`})`}>
                        {pos.label} ({pos.value === "both" ? `${piecesPerSide * 2} ชิ้น` : `${piecesPerSide} ชิ้น`})
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {(lockBlockLeft || lockBlockRight) && piecesPerSide > 0 && (
                <div className="flex flex-col gap-2 text-sm p-2 bg-danger/10 rounded-xl">
                  <div className="flex justify-between">
                    <span>จำนวนรวม:</span>
                    <span className="font-bold text-danger">
                      {results.lockBlockCount} ชิ้น ({lockBlockDesc})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ขนาด Lock Block:</span>
                    <span className="font-bold text-danger">
                      {currentFrame.useThickness || 0}×{currentFrame.useWidth || 0}×{LOCK_BLOCK_HEIGHT} mm
                    </span>
                  </div>
                  <span className="text-xs text-foreground/60">(ใช้ไม้เดียวกับโครง)</span>
                  <Divider className="my-1" />
                  <div className="flex justify-between text-danger">
                    <span>ขอบบน:</span>
                    <span>{results.lockBlockTop} mm จากพื้น</span>
                  </div>
                  <div className="flex justify-between text-danger">
                    <span>กึ่งกลาง:</span>
                    <span>{results.lockBlockPosition} mm จากพื้น</span>
                  </div>
                  <div className="flex justify-between text-danger">
                    <span>ขอบล่าง:</span>
                    <span>{results.lockBlockBottom} mm จากพื้น</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Card 6: Core Material */}
          <Card className="w-full">
            <CardHeader className="bg-primary/80 text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="md">
                  6
                </Chip>
                <span className="font-semibold">🧱 ไส้ประตู (Core Material)</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                <Select name="coreType" label="ประเภทไส้" labelPlacement="outside" placeholder="Please Select" color="default" variant="bordered" size="md" radius="md" selectedKeys={coreType ? [coreType] : []} onSelectionChange={(keys) => setCoreType([...keys][0] || "")}>
                  {CORE_TYPES.map((core) => (
                    <SelectItem key={core.value}>{core.label}</SelectItem>
                  ))}
                </Select>
              </div>

              {coreType && coreCalculation.coreType && (
                <div className="flex flex-col gap-2 text-sm p-2 bg-primary/10 rounded-xl">
                  <div className="flex justify-between">
                    <span>ประเภท:</span>
                    <span className="font-bold text-primary">{coreCalculation.coreType.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>รูปแบบ:</span>
                    <span className="font-bold">{coreCalculation.isSolid ? "เต็มแผ่น" : "ซี่"}</span>
                  </div>

                  {!coreCalculation.isSolid && (
                    <>
                      <Divider className="my-1" />
                      <div className="flex justify-between">
                        <span>ระยะเว้นขอบ:</span>
                        <span>{coreCalculation.edgePadding || 40} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ความหนาซี่:</span>
                        <span>{coreCalculation.stripThickness} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ระยะห่างซี่:</span>
                        <span>{coreCalculation.stripSpacing} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>จำนวนแถว (columns):</span>
                        <span className="font-bold text-primary">
                          {coreCalculation.columns} แถว
                          {coreCalculation.coreType?.value === "particle_strips" && doorWidth && <span className="text-xs font-normal text-foreground/60 ml-1">({doorWidth}/10+1)</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>จำนวนชั้น (rows):</span>
                        <span>{coreCalculation.rows} ชั้น</span>
                      </div>

                      {coreCalculation.coreType?.value === "particle_strips" && coreCalculation.damPieces?.length > 0 && (
                        <div className="flex justify-between">
                          <span>ไม้ดามจากปาติเกิ้ล:</span>
                          <span className="font-bold text-primary">{coreCalculation.damPieces.length} ชิ้น</span>
                        </div>
                      )}
                    </>
                  )}

                  <Divider className="my-1" />
                  <div className="flex justify-between font-bold">
                    <span>จำนวนชิ้นทั้งหมด:</span>
                    <span className="text-primary">{coreCalculation.totalPieces} ชิ้น</span>
                  </div>
                  <div className="flex justify-between text-xs text-foreground/60">
                    <span>พื้นที่ไส้:</span>
                    <span>
                      {coreCalculation.coreWidth} × {coreCalculation.coreHeight} mm
                    </span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Card: Summary */}
          <Card className="w-full">
            <CardHeader className="bg-default-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold">📋 สรุปโครงสร้าง</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-default-100 rounded-xl">
                  <span className="block text-foreground/70">สเปคประตู:</span>
                  <span className="font-bold">{formatDimension(doorThickness, doorWidth, doorHeight)} mm</span>
                </div>
                <div className="p-2 bg-default-100 rounded-xl">
                  <span className="block text-foreground/70">ปิดผิว:</span>
                  <span className="font-bold text-success">
                    {getMaterialLabel(SURFACE_MATERIALS, surfaceMaterial)} {surfaceThickness || 0}mm + กาว {GLUE_THICKNESS}mm (×2)
                  </span>
                </div>
                <div className="p-2 bg-warning/20 rounded-xl">
                  <span className="block text-foreground/70">โครงไม้:</span>
                  <span className="font-bold text-secondary">
                    {currentFrame.useThickness || "-"}×{currentFrame.useWidth || "-"} mm
                  </span>
                  {currentFrame.isFlipped && <span className="block text-xs text-secondary">🔄 พลิกไม้</span>}
                  {currentFrame.planeAmount > 0 && <span className="block text-xs text-secondary">🪚 ไส {currentFrame.planeAmount}mm</span>}
                </div>
                <div className="p-2 bg-secondary/20 rounded-xl">
                  <span className="block text-foreground/70">ไม้ดาม:</span>
                  <span className="font-bold text-secondary">
                    {results.railSections - 1} ตัว ({results.railSections} ช่อง)
                  </span>
                  {coreType === "particle_strips" && <span className="block text-xs text-secondary">ใช้ปาติเกิ้ลซี่ทำไม้ดามแทน</span>}
                </div>
                <div className="col-span-2 p-2 bg-danger/10 rounded-xl">
                  <span className="block text-foreground/70">Lock Block:</span>
                  <span className="font-bold text-danger">
                    {results.lockBlockCount} ชิ้น ({lockBlockDesc})
                  </span>
                </div>
                {coreType && coreCalculation.coreType && (
                  <div className="col-span-2 p-2 bg-primary/10 rounded-xl">
                    <span className="block text-foreground/70">ไส้ประตู:</span>
                    <span className="font-bold text-primary">
                      {coreCalculation.coreType.label} ({coreCalculation.totalPieces} ชิ้น)
                    </span>
                    {!coreCalculation.isSolid && (
                      <span className="block text-xs text-primary/70">
                        {coreCalculation.columns} แถว × {coreCalculation.rows} ชั้น, ซี่หนา {coreCalculation.stripThickness}mm ห่าง {coreCalculation.stripSpacing}mm
                      </span>
                    )}
                  </div>
                )}
              </div>
              {doubleConfigSummary && <div className="p-2 bg-warning/20 rounded-xl text-sm text-secondary">{doubleConfigSummary}</div>}
              {selectedFrameCode && (
                <div className="p-2 bg-primary/10 rounded-xl text-sm">
                  <span className="font-medium text-primary">รหัส ERP: {selectedFrameCode}</span>
                  <span className="block text-xs">{currentFrame.desc}</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Card 7: Cutting Plan */}
          {isDataComplete ? (
            <Card className="w-full">
              <CardHeader className="bg-primary text-white">
                <div className="flex items-center gap-2">
                  <Chip color="default" variant="solid" size="md">
                    7
                  </Chip>
                  <span className="font-semibold">✂️ แผนการตัดไม้ (Cutting Optimization)</span>
                </div>
              </CardHeader>
              <CardBody className="gap-2">
                {coreType === "particle_strips" && (
                  <Chip color="warning" variant="shadow" className="w-full">
                    ไม้ดาม: ใช้ปาติเกิ้ลซี่ตัดซอยทำแทน (ไม่รวมในแผนตัดไม้โครง)
                  </Chip>
                )}

                {cuttingPlan.needSplice && (
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <div className="flex items-center gap-2 font-medium text-primary mb-1">
                      <span>🔗</span>
                      <span>ต้องต่อไม้โครงตั้ง</span>
                    </div>
                    <div className="text-sm text-primary">
                      <div>• จำนวนชิ้นที่ต้องต่อ: {cuttingPlan.spliceCount} ชิ้น</div>
                      <div>• เผื่อซ้อนทับ: {cuttingPlan.spliceOverlap} mm ต่อจุด</div>
                      <div className="text-xs mt-1 opacity-80">ใช้กาว + ตะปูยึดบริเวณรอยต่อ</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 rounded-xl text-center border-2 border-default">
                    <div className="font-bold text-lg text-primary">{cuttingPlan.totalStocks}</div>
                    <div className="text-xs text-foreground/80">ไม้ที่ใช้ (ท่อน)</div>
                  </div>
                  <div className="p-2 rounded-xl text-center border-2 border-default">
                    <div className="font-bold text-lg text-success">{cuttingPlan.efficiency}</div>
                    <div className="text-xs text-foreground/80">ประสิทธิภาพ</div>
                  </div>
                  <div className="p-2 rounded-xl text-center border-2 border-default">
                    <div className="font-bold text-lg text-primary">{cuttingPlan.usedLength}</div>
                    <div className="text-xs text-foreground/80">ใช้จริง (mm)</div>
                  </div>
                  <div className="p-2 rounded-xl text-center border-2 border-default">
                    <div className="font-bold text-lg text-danger">{cuttingPlan.totalWaste}</div>
                    <div className="text-xs text-foreground/80">เศษเหลือ (mm)</div>
                  </div>
                </div>

                <div className="border-2 border-default rounded-xl overflow-hidden">
                  <div className="px-3 py-2 text-xs font-semibold bg-default-100">📋 รายการชิ้นส่วน (เผื่อรอยเลื่อย {cuttingPlan.sawKerf} mm)</div>
                  <div>
                    {cuttingPlan.cutPieces.map((piece, idx) => (
                      <div key={idx} className={`flex items-center justify-between px-3 py-2 text-xs ${piece.isSplice ? "bg-primary/5" : ""}`}>
                        <div className="flex items-center gap-2">
                          <Chip color={piece.color} variant="shadow" size="md" className="min-w-3 h-3 p-0" />
                          <span className="font-medium">{piece.name}</span>
                          {piece.isSplice && (
                            <Chip color="primary" variant="shadow" size="md">
                              ต่อ
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>
                            {piece.length} mm <span className="text-foreground/60">(ตัด {piece.cutLength ?? piece.length} mm)</span>
                          </span>
                          <span className="font-bold">×{piece.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-default rounded-xl overflow-hidden">
                  <div className="px-3 py-2 text-xs font-semibold bg-default-100">
                    🪵 แผนการตัด (ไม้ยาว {cuttingPlan.stockLength}mm × {cuttingPlan.totalStocks} ท่อน)
                  </div>
                  <div className="p-2 space-y-2">
                    {cuttingPlan.stocks.map((stock, stockIdx) => (
                      <div key={stockIdx} className="space-y-1">
                        <div className="text-xs text-foreground/70">ท่อนที่ {stockIdx + 1}</div>
                        <div className="relative h-8 rounded border-2 border-default overflow-hidden bg-default-100">
                          {(() => {
                            let offset = 0;
                            return stock.pieces.map((piece, pieceIdx) => {
                              const pieceCut = piece.cutLength ?? piece.length;
                              const width = (pieceCut / stock.length) * 100;
                              const kerfWidth = (cuttingPlan.sawKerf / stock.length) * 100;
                              const left = offset;
                              offset += width + kerfWidth;
                              const colorMap = { primary: "#4456E9", secondary: "#FF8A00", warning: "#FFB441", danger: "#FF0076", success: "#10B981" };
                              return (
                                <React.Fragment key={pieceIdx}>
                                  <div className="absolute h-full flex items-center justify-center text-[8px] font-medium overflow-hidden text-white" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: colorMap[piece.color] || "#DCDCDC" }} title={`${piece.name}: ตัด ${pieceCut}mm (ใช้ ${piece.length}mm)`}>
                                    {width > 8 && <span className="truncate px-1">{pieceCut}</span>}
                                  </div>
                                  {pieceIdx < stock.pieces.length - 1 && <div className="absolute h-full bg-default" style={{ left: `${left + width}%`, width: `${kerfWidth}%` }} />}
                                </React.Fragment>
                              );
                            });
                          })()}
                          {stock.remaining > 0 && (
                            <div className="absolute right-0 h-full flex items-center justify-center text-[8px] bg-white text-foreground/70" style={{ width: `${(stock.remaining / stock.length) * 100}%` }}>
                              {stock.remaining > 100 && <span>เศษ {stock.remaining}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>ประสิทธิภาพการใช้ไม้</span>
                    <span className={`font-bold text-${getEfficiencyColor(cuttingPlan.efficiency)}`}>{cuttingPlan.efficiency}%</span>
                  </div>
                  <Progress value={parseFloat(cuttingPlan.efficiency)} color={getEfficiencyColor(cuttingPlan.efficiency)} size="md" />
                  <div className="flex justify-between text-[10px] mt-1 text-foreground/60">
                    <span>0%</span>
                    <span>ดี: ≥80%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader className="bg-default-200">
                <div className="flex items-center gap-2">
                  <Chip color="default" variant="solid" size="md">
                    7
                  </Chip>
                  <span className="font-semibold">✂️ แผนการตัดไม้ (Cutting Optimization)</span>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <Calculator className="w-12 h-12 text-default-300" />
                  <p className="text-lg font-medium">กรุณากรอกข้อมูลสเปคประตูให้ครบ</p>
                  <p className="text-sm text-foreground/70">ระบบจะคำนวณแผนการตัดไม้ให้อัตโนมัติ</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Drawing Section */}
        <div className="flex flex-col items-center justify-start w-full h-full xl:w-8/12 gap-2 sticky top-2">
          <Card className="w-full">
            <CardHeader className="bg-primary text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>📐</span>
                <span className="font-semibold">Drawing</span>
              </div>
            </CardHeader>
            <CardBody className="bg-default-50 p-0 min-h-[600px]">
              {isDataComplete ? (
                <EnhancedEngineeringDrawing results={results} coreCalculation={coreCalculation} />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 gap-2">
                  <RulerDimensionLine className="w-12 h-12 text-default-300" />
                  <p className="text-lg font-medium">กรุณากรอกข้อมูลสเปคประตู</p>
                  <p className="text-sm text-foreground/70">ระบุ ความหนา (T), ความกว้าง (W), ความสูง (H)</p>
                  <div className="flex gap-2 mt-4">
                    <Chip color={doorThickness ? "success" : "danger"} variant="shadow">
                      T: {doorThickness || "—"}
                    </Chip>
                    <Chip color={doorWidth ? "success" : "danger"} variant="shadow">
                      W: {doorWidth || "—"}
                    </Chip>
                    <Chip color={doorHeight ? "success" : "danger"} variant="shadow">
                      H: {doorHeight || "—"}
                    </Chip>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UIDoorBom;
