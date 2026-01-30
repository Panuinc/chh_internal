"use client";
import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { Calculator, RulerDimensionLine, ZoomIn, ZoomOut, Maximize2, RotateCcw, Download, Layers, FileImage, FileText, FileCode, Printer, ChevronDown, Copy } from "lucide-react";
import { Button, Input, Select, SelectItem, Card, CardHeader, CardBody, Chip, Divider, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch, Tooltip, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import jsPDF from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import * as htmlToImage from "html-to-image";

const GLUE_THICKNESS = 1;
const LOCK_BLOCK_HEIGHT = 400;
const LOCK_BLOCK_POSITION = 1000;

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

const DOUBLE_FRAME_SIDES = [
  { key: "top", label: "บน" },
  { key: "bottom", label: "ล่าง" },
  { key: "left", label: "ซ้าย" },
  { key: "center", label: "กลาง" },
  { key: "right", label: "ขวา" },
  { key: "all", label: "ทั้งหมด" },
];

const LOCK_BLOCK_PIECES_OPTIONS = [
  { value: "1", label: "1 ชิ้น" },
  { value: "2", label: "2 ชิ้น" },
  { value: "3", label: "3 ชิ้น" },
  { value: "4", label: "4 ชิ้น" },
];

const LOCK_BLOCK_POSITIONS = [
  { value: "left", left: true, right: false, label: "ซ้าย" },
  { value: "right", left: false, right: true, label: "ขวา" },
  { value: "both", left: true, right: true, label: "ทั้งสอง" },
];

const DOUBLE_FRAME_COUNT_OPTIONS = [
  { value: "0", label: "ไม่เบิ้ล" },
  { value: "1", label: "1 ชั้น" },
  { value: "2", label: "2 ชั้น" },
  { value: "3", label: "3 ชั้น" },
];

const ERP_FRAMES = {
  rubberwood: [
    { code: "RM-14-01-26-30-200", desc: "ไม้ยางพาราจ๊อย 26x30x2040mm", thickness: 26, width: 30, length: 2040 },
    { code: "RM-14-01-26-30-230", desc: "ไม้ยางพาราจ๊อย 26x30x2310mm", thickness: 26, width: 30, length: 2310 },
    { code: "RM-14-01-26-30-250", desc: "ไม้ยางพาราจ๊อย 26x30x2510mm", thickness: 26, width: 30, length: 2510 },
    { code: "RM-14-01-26-32-200", desc: "ไม้ยางพาราจ๊อย 26x32x2040mm", thickness: 26, width: 32, length: 2040 },
    { code: "RM-14-01-26-32-230", desc: "ไม้ยางพาราจ๊อย 26x32x2310mm", thickness: 26, width: 32, length: 2310 },
    { code: "RM-14-01-26-32-250", desc: "ไม้ยางพาราจ๊อย 26x32x2510mm", thickness: 26, width: 32, length: 2510 },
    { code: "RM-14-01-28-50-200", desc: "ไม้ยางพาราจ๊อย 28x50x2040mm", thickness: 28, width: 50, length: 2040 },
    { code: "RM-14-01-28-50-230", desc: "ไม้ยางพาราจ๊อย 28x50x2310mm", thickness: 28, width: 50, length: 2310 },
    { code: "RM-14-01-28-50-230B", desc: "ไม้ยางพาราจ๊อยB 28x50x2310mm", thickness: 28, width: 50, length: 2310 },
    { code: "RM-14-01-28-50-250", desc: "ไม้ยางพาราจ๊อย 28x50x2510mm", thickness: 28, width: 50, length: 2510 },
    { code: "RM-14-01-32-50-200", desc: "ไม้ยางพาราจ๊อย 32x50x2040mm", thickness: 32, width: 50, length: 2040 },
    { code: "RM-14-01-32-50-230", desc: "ไม้ยางพาราจ๊อย 32x50x2310mm", thickness: 32, width: 50, length: 2310 },
    { code: "RM-14-01-32-50-250", desc: "ไม้ยางพาราจ๊อย 32x50x2510mm", thickness: 32, width: 50, length: 2510 },
  ],
  sadao: [
    { code: "RM-14-04-32-50-200", desc: "ไม้สะเดาจ๊อย 32x50x2040mm", thickness: 32, width: 50, length: 2040 },
    { code: "RM-14-04-32-50-225", desc: "ไม้สะเดาจ๊อย 32x50x2250mm", thickness: 32, width: 50, length: 2250 },
    { code: "RM-14-04-32-50-230", desc: "ไม้สะเดาจ๊อย 32x50x2300mm", thickness: 32, width: 50, length: 2300 },
    { code: "RM-14-04-32-50-250", desc: "ไม้สะเดาจ๊อย 32x50x2500mm", thickness: 32, width: 50, length: 2500 },
  ],
  lvl: [
    { code: "RM-16-19-2.9-3.4-258", desc: "ไม้อัด LVL 29x34x2580mm", thickness: 29, width: 34, length: 2580 },
    { code: "RM-16-19-2.9-3.5-202", desc: "ไม้อัด LVL 29x35x2020mm", thickness: 29, width: 35, length: 2020 },
    { code: "RM-16-19-2.9-3.5-244", desc: "ไม้อัด LVL 29x35x2440mm", thickness: 29, width: 35, length: 2440 },
    { code: "RM-16-19-2.9-3.5-258", desc: "ไม้อัด LVL 29x35x2580mm", thickness: 29, width: 35, length: 2580 },
    { code: "RM-16-19-3.2-3.5-202", desc: "ไม้อัด LVL 32x35x2020mm", thickness: 32, width: 35, length: 2020 },
    { code: "RM-16-19-3.2-3.5-244", desc: "ไม้อัด LVL 32x35x2440mm", thickness: 32, width: 35, length: 2440 },
  ],
};

const LEGEND_ITEMS = [
  { fill: "#10B98150", stroke: "#10B981", label: "Surface Material" },
  { fill: "#FFB44150", stroke: "#FFB441", label: "Frame (Stile)" },
  { fill: "#FF8A0050", stroke: "#FF8A00", label: "Frame (Rail)" },
  { fill: "#FF007650", stroke: "#FF0076", label: "Lock Block" },
  { fill: "#4456E950", stroke: "#DCDCDC", label: "Core (Honeycomb)", dashed: true },
  { fill: "#FFB44150", stroke: "#FFB441", label: "Double Frame", dashed: true },
];

const GRID_LETTERS = ["A", "B", "C", "D", "E", "F"];
const GRID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

const THEME = {
  background: "#FFFFFF",
  paper: "#FFFFFF",
  stroke: "#000000",
  text: "#000000",
  gridText: "#DCDCDC",
  border: "#000000",
  accent: "#4456E9",
};

const LAYER_CONFIG = {
  grid: { id: "grid", label: "Grid Reference", color: "#DCDCDC", defaultVisible: true },
  title: { id: "title", label: "Title Block", color: "#4456E9", defaultVisible: true },
  dimensions: { id: "dimensions", label: "Dimensions", color: "#000000", defaultVisible: true },
  centerlines: { id: "centerlines", label: "Center Lines", color: "#666666", defaultVisible: true },
  surface: { id: "surface", label: "Surface Material", color: "#10B981", defaultVisible: true },
  frame: { id: "frame", label: "Frame (Stile)", color: "#FFB441", defaultVisible: true },
  rails: { id: "rails", label: "Frame (Rail)", color: "#FF8A00", defaultVisible: true },
  lockblock: { id: "lockblock", label: "Lock Block", color: "#FF0076", defaultVisible: true },
  core: { id: "core", label: "Core (Honeycomb)", color: "#4456E9", defaultVisible: true },
  doubleframe: { id: "doubleframe", label: "Double Frame", color: "#FFB441", defaultVisible: true },
};

const formatDimension = (t, w, h, separator = "×") => `${t || "-"}${separator}${w || "-"}${separator}${h || "-"}`;
const getMaterialLabel = (materials, value) => materials.find((m) => m.value === value)?.label || "-";

const getEfficiencyColor = (efficiency) => {
  const val = parseFloat(String(efficiency)) || 0;
  if (val >= 80) return "success";
  if (val >= 60) return "warning";
  return "danger";
};

const generateDXF = (results) => {
  if (!results) return "";
  const { W = 0, H = 0, F = 0, railPositions = [] } = results;

  let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;
  const offsetX = 100;
  const offsetY = 100;

  const addLine = (x1, y1, x2, y2) => `0\nLINE\n8\n0\n10\n${x1}\n20\n${y1}\n30\n0\n11\n${x2}\n21\n${y2}\n31\n0\n`;

  dxf += addLine(offsetX, offsetY, offsetX + W, offsetY);
  dxf += addLine(offsetX + W, offsetY, offsetX + W, offsetY + H);
  dxf += addLine(offsetX + W, offsetY + H, offsetX, offsetY + H);
  dxf += addLine(offsetX, offsetY + H, offsetX, offsetY);

  dxf += addLine(offsetX + F, offsetY, offsetX + F, offsetY + H);
  dxf += addLine(offsetX + W - F, offsetY, offsetX + W - F, offsetY + H);
  dxf += addLine(offsetX + F, offsetY + F, offsetX + W - F, offsetY + F);
  dxf += addLine(offsetX + F, offsetY + H - F, offsetX + W - F, offsetY + H - F);

  railPositions?.forEach((pos) => {
    const railY = offsetY + H - pos;
    dxf += addLine(offsetX + F, railY, offsetX + W - F, railY);
  });

  dxf += `0\nENDSEC\n0\nEOF`;
  return dxf;
};

const useFrameSelection = (frameType, doorThickness, surfaceThickness, doorHeight) => {
  return useMemo(() => {
    const S = parseFloat(surfaceThickness) || 0;
    const requiredThickness = doorThickness ? parseFloat(doorThickness) - (S + GLUE_THICKNESS) * 2 : 0;
    const requiredLength = doorHeight ? parseFloat(doorHeight) : 0;
    const frames = ERP_FRAMES[frameType] || [];

    const filterAndSort = (frameList) => frameList.filter((f) => f.length >= requiredLength).sort((a, b) => a.length - b.length);

    const findSpliceable = (frameList) => {
      const sorted = [...frameList].sort((a, b) => b.length - a.length);
      for (const frame of sorted) {
        const spliceOverlap = 100;
        const totalLength = frame.length * 2 - spliceOverlap;
        if (totalLength >= requiredLength) {
          return { frame, needSplice: true, spliceCount: 2, spliceOverlap, effectiveLength: totalLength, splicePosition: Math.round(requiredLength / 2) };
        }
      }
      return null;
    };

    const createDisplaySize = (f, isFlipped, planeAmount, needSplice) => {
      const parts = [];
      if (isFlipped) parts.push("พลิก");
      if (planeAmount > 0) parts.push(`ไส ${planeAmount}mm`);
      if (needSplice) parts.push("ต่อ 2 ท่อน");
      const suffix = parts.length > 0 ? ` (${parts.join("+")})` : "";
      return isFlipped ? `${f.width}×${f.thickness}×${f.length}${suffix}` : `${f.thickness}×${f.width}×${f.length}${suffix}`;
    };

    const createFrameResult = (frameList, isFlipped, planeAmount, needSplice = false, spliceInfo = null) => {
      const mapFrame = (f) => ({
        ...f,
        useThickness: isFlipped ? f.width - planeAmount : f.thickness - planeAmount,
        useWidth: isFlipped ? f.thickness : f.width,
        isFlipped,
        planeAmount,
        needSplice,
        ...(spliceInfo && { spliceCount: spliceInfo.spliceCount, spliceOverlap: spliceInfo.spliceOverlap, splicePosition: spliceInfo.splicePosition, effectiveLength: spliceInfo.effectiveLength }),
        displaySize: createDisplaySize(f, isFlipped, planeAmount, needSplice),
      });
      return { frames: needSplice ? [mapFrame(spliceInfo.frame)] : frameList.map(mapFrame), needFlip: isFlipped, needPlane: planeAmount > 0, needSplice };
    };

    const strategies = [
      () => {
        const exact = filterAndSort(frames.filter((f) => f.thickness === requiredThickness));
        return exact.length > 0 ? createFrameResult(exact, false, 0) : null;
      },
      () => {
        const flipExact = filterAndSort(frames.filter((f) => f.width === requiredThickness));
        return flipExact.length > 0 ? createFrameResult(flipExact, true, 0) : null;
      },
      () => {
        const thicker = frames.filter((f) => f.thickness > requiredThickness && f.length >= requiredLength).sort((a, b) => (a.thickness !== b.thickness ? a.thickness - b.thickness : a.length - b.length));
        return thicker.length > 0 ? createFrameResult(thicker, false, thicker[0].thickness - requiredThickness) : null;
      },
      () => {
        const flipPlane = frames.filter((f) => f.width > requiredThickness && f.length >= requiredLength).sort((a, b) => (a.width !== b.width ? a.width - b.width : a.length - b.length));
        return flipPlane.length > 0 ? createFrameResult(flipPlane, true, flipPlane[0].width - requiredThickness) : null;
      },
      () => {
        const splice = findSpliceable(frames.filter((f) => f.thickness === requiredThickness));
        return splice ? createFrameResult([], false, 0, true, splice) : null;
      },
      () => {
        const splice = findSpliceable(frames.filter((f) => f.width === requiredThickness));
        return splice ? createFrameResult([], true, 0, true, splice) : null;
      },
      () => {
        const splice = findSpliceable(frames.filter((f) => f.thickness > requiredThickness));
        return splice ? createFrameResult([], false, splice.frame.thickness - requiredThickness, true, splice) : null;
      },
      () => {
        const splice = findSpliceable(frames.filter((f) => f.width > requiredThickness));
        return splice ? createFrameResult([], true, splice.frame.width - requiredThickness, true, splice) : null;
      },
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result) return result;
    }

    const maxLength = Math.max(...frames.map((f) => f.length), 0);
    const maxSpliceLength = maxLength > 0 ? maxLength * 2 - 100 : 0;
    return { frames: [], needFlip: false, needPlane: false, needSplice: false, noMatch: true, reason: maxLength > 0 ? `ไม่มีไม้ที่ใช้ได้ (ต้องการ ≥${requiredLength}mm, ต่อได้สูงสุด ${maxSpliceLength}mm)` : `ไม่มีไม้ความหนา ${requiredThickness}mm` };
  }, [frameType, doorThickness, surfaceThickness, doorHeight]);
};

const useCalculations = (params) => {
  const { doorThickness, doorWidth, doorHeight, surfaceThickness, currentFrame, lockBlockLeft, lockBlockRight, lockBlockPiecesPerSide, doubleFrameSides, doubleFrameCount } = params;

  return useMemo(() => {
    const T = parseFloat(doorThickness) || 0;
    const W = parseFloat(doorWidth) || 0;
    const H = parseFloat(doorHeight) || 0;
    const S = parseFloat(surfaceThickness) || 0;
    const totalSurfaceThickness = (S + GLUE_THICKNESS) * 2;
    const frameThickness = T - totalSurfaceThickness;
    const F = currentFrame?.useWidth || 0;
    const R = currentFrame?.useThickness || 0;

    const effectiveSides = {
      top: !!(doubleFrameSides?.all || doubleFrameSides?.top),
      bottom: !!(doubleFrameSides?.all || doubleFrameSides?.bottom),
      left: !!(doubleFrameSides?.all || doubleFrameSides?.left),
      right: !!(doubleFrameSides?.all || doubleFrameSides?.right),
      center: !!(doubleFrameSides?.all || doubleFrameSides?.center),
    };

    const numericDoubleCount = parseInt(doubleFrameCount) || 0;
    const hasDoubleFrame = numericDoubleCount > 0 && Object.values(effectiveSides).some(Boolean);
    const DF = hasDoubleFrame ? F * numericDoubleCount : 0;
    const totalFrameWidth = F + (hasDoubleFrame ? DF : 0);
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
    const railThickness = currentFrame?.useWidth || 50;
    const hasLockBlock = lockBlockLeft || lockBlockRight;

    for (let i = 1; i < railSections; i++) {
      const eqPosition = Math.round((H * i) / railSections);
      railPositionsOriginal.push(eqPosition);
      const railTop = eqPosition + railThickness / 2;
      const railBottom = eqPosition - railThickness / 2;
      const hitLockBlock = hasLockBlock && railBottom <= avoidZoneBottom && railTop >= avoidZoneTop;
      if (hitLockBlock) {
        const distToTop = eqPosition - avoidZoneTop;
        const distToBottom = avoidZoneBottom - eqPosition;
        railPositions.push(distToTop <= distToBottom ? avoidZoneTop - railThickness / 2 : avoidZoneBottom + railThickness / 2);
      } else {
        railPositions.push(eqPosition);
      }
    }

    const lockBlockTop = LOCK_BLOCK_POSITION - LOCK_BLOCK_HEIGHT / 2;
    const lockBlockBottom = LOCK_BLOCK_POSITION + LOCK_BLOCK_HEIGHT / 2;
    const lockBlockSides = (lockBlockLeft ? 1 : 0) + (lockBlockRight ? 1 : 0);
    const piecesPerSide = parseInt(lockBlockPiecesPerSide) || 0;
    const lockBlockCount = lockBlockSides * piecesPerSide;
    const railsAdjusted = railPositions.some((pos, idx) => pos !== railPositionsOriginal[idx]);

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
      doubleFrame: { count: numericDoubleCount, ...effectiveSides, hasAny: hasDoubleFrame },
    };
  }, [doorThickness, doorWidth, doorHeight, surfaceThickness, currentFrame, lockBlockLeft, lockBlockRight, lockBlockPiecesPerSide, doubleFrameSides, doubleFrameCount]);
};

const useCuttingPlan = (results, currentFrame) => {
  return useMemo(() => {
    if (!results || !currentFrame) {
      return { cutPieces: [], allPieces: [], stocks: [], totalStocks: 0, totalWaste: 0, totalStock: 0, efficiency: "0.0", stockLength: 2040, sawKerf: 5, usedWithoutKerf: 0, needSplice: false, spliceCount: 0, spliceOverlap: 100 };
    }

    const { W, H, F, railSections, lockBlockCount, doubleFrame } = results;
    const stockLength = currentFrame.length || 2040;
    const sawKerf = 5;
    const needSplice = currentFrame.needSplice || false;
    const spliceOverlap = currentFrame.spliceOverlap || 100;
    const cutPieces = [];

    const addPiece = (name, length, qty, color, isSplice = false) => {
      if (!length || !qty) return;
      cutPieces.push({ name, length, qty, color, isSplice });
    };

    const stileLength = H;
    if (needSplice && stileLength > stockLength) {
      const pieceLength = Math.ceil(stileLength / 2) + spliceOverlap / 2;
      addPiece("โครงตั้ง (ท่อน 1)", pieceLength, 2, "secondary", true);
      addPiece("โครงตั้ง (ท่อน 2)", pieceLength, 2, "warning", true);
    } else {
      addPiece("โครงตั้ง", stileLength, 2, "secondary");
    }

    addPiece("โครงนอน", W - 2 * F, 2, "primary");

    const clearHeight = H - 2 * F;
    const clearWidth = W - 2 * F;

    if (doubleFrame?.hasAny && doubleFrame.count > 0) {
      const count = doubleFrame.count;
      const addDoubleVertical = (label, enabled) => {
        if (!enabled) return;
        if (needSplice && clearHeight > stockLength) {
          const pieceLength = Math.ceil(clearHeight / 2) + spliceOverlap / 2;
          addPiece(label + " (ท่อน 1)", pieceLength, count, "warning", true);
          addPiece(label + " (ท่อน 2)", pieceLength, count, "secondary", true);
        } else {
          addPiece(label, clearHeight, count, "warning");
        }
      };
      const addDoubleHorizontal = (label, enabled) => {
        if (!enabled) return;
        addPiece(label, clearWidth, count, "secondary");
      };
      addDoubleVertical("เบิ้ลโครงตั้งซ้าย", doubleFrame.left);
      addDoubleVertical("เบิ้ลโครงตั้งขวา", doubleFrame.right);
      addDoubleVertical("โครงกลาง", doubleFrame.center);
      addDoubleHorizontal("เบิ้ลโครงบน", doubleFrame.top);
      addDoubleHorizontal("เบิ้ลโครงล่าง", doubleFrame.bottom);
    }

    const railCount = railSections - 1;
    if (railCount > 0) addPiece("ไม้ดาม", clearWidth, railCount, "primary");
    if (lockBlockCount > 0) addPiece("Lock Block", LOCK_BLOCK_HEIGHT, lockBlockCount, "danger");

    const allPieces = cutPieces.flatMap((piece) => Array.from({ length: piece.qty }, (_, i) => ({ ...piece, id: `${piece.name}-${i + 1}` }))).sort((a, b) => b.length - a.length);

    const stocks = [];
    allPieces.forEach((piece) => {
      const pieceWithKerf = piece.length + sawKerf;
      const availableStock = stocks.find((s) => s.remaining >= pieceWithKerf);
      if (availableStock) {
        availableStock.pieces.push(piece);
        availableStock.remaining -= pieceWithKerf;
        availableStock.used += pieceWithKerf;
      } else {
        stocks.push({ length: stockLength, pieces: [piece], remaining: stockLength - pieceWithKerf, used: pieceWithKerf });
      }
    });

    const totalStocks = stocks.length;
    const totalWaste = stocks.reduce((sum, s) => sum + s.remaining, 0);
    const totalStock = totalStocks * stockLength;
    const usedWithoutKerf = allPieces.reduce((sum, p) => sum + p.length, 0);
    const efficiency = totalStock ? ((usedWithoutKerf / totalStock) * 100).toFixed(1) : "0.0";
    const spliceCount = cutPieces.filter((p) => p.isSplice).reduce((sum, p) => sum + p.qty, 0) / 2;

    return { cutPieces, allPieces, stocks, totalStocks, totalWaste, totalStock, efficiency, stockLength, sawKerf, usedWithoutKerf, needSplice, spliceCount, spliceOverlap };
  }, [results, currentFrame]);
};

const DimLine = memo(({ x1, y1, x2, y2, value, offset = 25, vertical = false, color = "#000000", fontSize = 9, unit = "", theme }) => {
  const strokeColor = theme?.stroke || color;
  const paperColor = theme?.paper || "#FFFFFF";
  const arrowSize = 3;
  const displayValue = unit ? `${value}${unit}` : value;
  const textWidth = String(displayValue).length * 4 + 8;

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

const CenterLine = memo(({ x1, y1, x2, y2, theme }) => <line className="layer-centerlines" x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme?.stroke || "#000000"} strokeWidth="0.3" strokeDasharray="10,3,2,3" />);
CenterLine.displayName = "CenterLine";

const LockBlockSVG = memo(({ x, y, width, height }) => (
  <g className="layer-lockblock">
    <rect x={x} y={y} width={width} height={height} fill="#FF007644" stroke="#FF0076" strokeWidth="0.8" />
    <line x1={x} y1={y} x2={x + width} y2={y + height} stroke="#FF0076" strokeWidth="0.4" />
    <line x1={x + width} y1={y} x2={x} y2={y + height} stroke="#FF0076" strokeWidth="0.4" />
  </g>
));
LockBlockSVG.displayName = "LockBlockSVG";

const FilledRect = memo(({ x, y, width, height, color, strokeWidth = 1, opacity = 0.2, strokeDasharray, className }) => (
  <rect
    className={className}
    x={x}
    y={y}
    width={width}
    height={height}
    fill={`${color}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`}
    stroke={color}
    strokeWidth={strokeWidth}
    strokeDasharray={strokeDasharray}
  />
));
FilledRect.displayName = "FilledRect";

const EnhancedEngineeringDrawing = memo(({ results }) => {
  const svgRef = useRef(null);
  const [visibleLayers, setVisibleLayers] = useState(() => Object.fromEntries(Object.entries(LAYER_CONFIG).map(([key, config]) => [key, config.defaultVisible])));
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const theme = THEME;

  const safeResults = results || {};
  const { W = 0, H = 0, T = 0, S = 0, F = 0, R = 0, totalFrameWidth = 0, railPositions = [], railSections = 3, lockBlockTop = 800, lockBlockBottom = 1200, lockBlockLeft = false, lockBlockRight = false, lockBlockPosition = 1000, lockBlockCount = 0, lockBlockSides = 1, currentFrame = {}, doubleFrame = {} } = safeResults;

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
        totalFrame: (totalFrameWidth || safeF) * DRAWING_SCALE,
        R: safeR * DRAWING_SCALE,
        lockBlockW: safeF * DRAWING_SCALE,
      },
      side: { T: safeT * DRAWING_SCALE, H: safeH * DRAWING_SCALE, S: safeS * DRAWING_SCALE },
    }),
    [safeW, safeH, safeT, safeS, safeF, safeR, drawingDF, totalFrameWidth],
  );

  const marginX = 150;
  const marginY = 200;
  const positions = { side: { x: marginX, y: marginY + 200 }, front: { x: marginX + 700, y: marginY + 200 } };

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
        const dataUrl = await htmlToImage.toPng(svgRef.current, { quality: 1, pixelRatio: scale, backgroundColor: THEME.background });
        const link = document.createElement("a");
        link.download = `door-drawing-${safeT}x${safeW}x${safeH}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("PNG export error:", error);
      }
      setIsExporting(false);
    },
    [safeT, safeW, safeH],
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

  const copyToClipboard = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(svgRef.current, { quality: 1, pixelRatio: 2, backgroundColor: THEME.background });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch (error) {
      console.error("Copy error:", error);
    }
  }, []);

  const toggleLayer = useCallback((layerId) => {
    setVisibleLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  }, []);

  const toggleAllLayers = useCallback((visible) => {
    setVisibleLayers(Object.fromEntries(Object.keys(LAYER_CONFIG).map((key) => [key, visible])));
  }, []);

  const renderLockBlocks = useCallback(() => {
    const blocks = [];
    const lockBlockH = LOCK_BLOCK_HEIGHT * DRAWING_SCALE;
    const lockBlockY = positions.front.y + dims.front.H - lockBlockBottom * DRAWING_SCALE;

    const renderSide = (isLeft) => {
      if (!(isLeft ? lockBlockLeft : lockBlockRight)) return;
      [...Array(piecesPerSide)].forEach((_, i) => {
        const x = isLeft ? positions.front.x + dims.front.totalFrame + dims.front.lockBlockW * i : positions.front.x + dims.front.W - dims.front.totalFrame - dims.front.lockBlockW * (i + 1);
        blocks.push(<LockBlockSVG key={`lb-${isLeft ? "left" : "right"}-${i}`} x={x} y={lockBlockY} width={dims.front.lockBlockW} height={lockBlockH} />);
      });
    };
    renderSide(true);
    renderSide(false);
    return blocks;
  }, [positions, dims, lockBlockLeft, lockBlockRight, piecesPerSide, lockBlockBottom]);

  const renderDoubleFrames = useCallback(() => {
    if (!hasDoubleFrame) return null;
    const elements = [];
    const configs = [
      { key: "left", getRect: (i) => ({ x: positions.front.x + dims.front.F + dims.front.F * i, y: positions.front.y + dims.front.F, w: dims.front.F, h: dims.front.H - 2 * dims.front.F }) },
      { key: "right", getRect: (i) => ({ x: positions.front.x + dims.front.W - dims.front.F - dims.front.F * (i + 1), y: positions.front.y + dims.front.F, w: dims.front.F, h: dims.front.H - 2 * dims.front.F }) },
      { key: "top", getRect: (i) => ({ x: positions.front.x + dims.front.F, y: positions.front.y + dims.front.F + dims.front.F * i, w: dims.front.W - 2 * dims.front.F, h: dims.front.F }) },
      { key: "bottom", getRect: (i) => ({ x: positions.front.x + dims.front.F, y: positions.front.y + dims.front.H - dims.front.F - dims.front.F * (i + 1), w: dims.front.W - 2 * dims.front.F, h: dims.front.F }) },
      { key: "center", getRect: (i) => ({ x: positions.front.x + dims.front.W / 2 - dims.front.F / 2 + (i - (doubleFrame.count - 1) / 2) * dims.front.F, y: positions.front.y + dims.front.F, w: dims.front.F, h: dims.front.H - 2 * dims.front.F }) },
    ];
    configs.forEach(({ key, getRect }) => {
      if (!doubleFrame[key]) return;
      for (let i = 0; i < doubleFrame.count; i++) {
        const r = getRect(i);
        elements.push(<rect key={`df-${key}-${i}`} className="layer-doubleframe" x={r.x} y={r.y} width={r.w} height={r.h} fill="#FFB44122" stroke="#FFB441" strokeWidth="1.5" strokeDasharray="8,4" />);
      }
    });
    return elements;
  }, [hasDoubleFrame, positions, dims, doubleFrame]);

  const getDoubleFrameDesc = () => {
    if (!hasDoubleFrame || !doubleFrame) return "";
    const sideLabels = { top: "บน", bottom: "ล่าง", left: "ซ้าย", right: "ขวา", center: "กลาง" };
    const sides = Object.entries(sideLabels)
      .filter(([key]) => doubleFrame[key])
      .map(([_, label]) => label);
    return sides.length > 0 ? `(Double: ${sides.join(", ")} x${doubleFrame.count})` : "(Double)";
  };

  const legendPositions = [
    { x: 415, yOffset: -105 },
    { x: 525, yOffset: -105 },
    { x: 415, yOffset: -88 },
    { x: 525, yOffset: -88 },
    { x: 415, yOffset: -71 },
    { x: 525, yOffset: -71 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-default-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-default-50 border-b border-default-200 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="flat">
            {Math.round(zoomLevel * 100)}%
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button size="sm" variant="flat" startContent={<Layers className="w-4 h-4" />}>
                Layers
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="p-2 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b">
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
              <Button size="sm" color="primary" variant="flat" startContent={<Download className="w-4 h-4" />} endContent={<ChevronDown className="w-3 h-3" />} isLoading={isExporting}>
                Export
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Export options">
              <DropdownItem key="pdf" startContent={<FileText className="w-4 h-4" />} description="Vector format, best for printing" onPress={exportToPDF}>
                Export as PDF
              </DropdownItem>
              <DropdownItem key="png" startContent={<FileImage className="w-4 h-4" />} description="High resolution image" onPress={() => exportToPNG(2)}>
                Export as PNG
              </DropdownItem>
              <DropdownItem key="png-hd" startContent={<FileImage className="w-4 h-4" />} description="4x resolution for large prints" onPress={() => exportToPNG(4)}>
                Export as PNG (4K)
              </DropdownItem>
              <DropdownItem key="dxf" startContent={<FileCode className="w-4 h-4" />} description="For AutoCAD/CAD software" onPress={exportToDXF}>
                Export as DXF
              </DropdownItem>
              <DropdownItem key="copy" startContent={<Copy className="w-4 h-4" />} description="Copy image to clipboard" onPress={copyToClipboard}>
                Copy to Clipboard
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Tooltip content="Print">
            <Button size="sm" variant="flat" isIconOnly onPress={() => window.print()}>
              <Printer className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: theme.background }}>
        <TransformWrapper key={wrapperKey} initialScale={1} minScale={0.1} maxScale={5} centerOnInit onTransformed={(ref) => setZoomLevel(ref.state.scale)} wheel={{ step: 0.1 }}>
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
              <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-default-50/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-default-200">
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
                    <rect x={positions.side.x} y={positions.side.y} width={dims.side.T} height={dims.side.H} fill={theme.paper} stroke={theme.stroke} strokeWidth="3" />
                    <FilledRect className="layer-surface" x={positions.side.x} y={positions.side.y} width={dims.side.S} height={dims.side.H} color="#10B981" strokeWidth={1.2} />
                    <FilledRect className="layer-surface" x={positions.side.x + dims.side.T - dims.side.S} y={positions.side.y} width={dims.side.S} height={dims.side.H} color="#10B981" strokeWidth={1.2} />
                    <FilledRect className="layer-frame" x={positions.side.x + dims.side.S} y={positions.side.y} width={(dims.side.T - 2 * dims.side.S) * 0.25} height={dims.side.H} color="#FFB441" />
                    <FilledRect className="layer-frame" x={positions.side.x + dims.side.T - dims.side.S - (dims.side.T - 2 * dims.side.S) * 0.25} y={positions.side.y} width={(dims.side.T - 2 * dims.side.S) * 0.25} height={dims.side.H} color="#FFB441" />
                    <FilledRect className="layer-core" x={positions.side.x + dims.side.S + (dims.side.T - 2 * dims.side.S) * 0.25} y={positions.side.y} width={(dims.side.T - 2 * dims.side.S) * 0.5} height={dims.side.H} color="#4456E9" strokeWidth={0.8} opacity={0.07} strokeDasharray="4,4" />
                    <CenterLine x1={positions.side.x + dims.side.T / 2} y1={positions.side.y - 40} x2={positions.side.x + dims.side.T / 2} y2={positions.side.y + dims.side.H + 40} theme={theme} />
                    {railPositions.map((pos, idx) => {
                      const railY = positions.side.y + dims.side.H - pos * DRAWING_SCALE;
                      const railH = safeR * DRAWING_SCALE * 0.5;
                      return <FilledRect key={`side-rail-${idx}`} className="layer-rails" x={positions.side.x + dims.side.S} y={railY - railH / 2} width={dims.side.T - 2 * dims.side.S} height={railH} color="#FF8A00" />;
                    })}
                    {(lockBlockLeft || lockBlockRight) && <rect className="layer-lockblock" x={positions.side.x + dims.side.S} y={positions.side.y + dims.side.H - lockBlockBottom * DRAWING_SCALE} width={dims.side.T - 2 * dims.side.S} height={LOCK_BLOCK_HEIGHT * DRAWING_SCALE} fill="none" stroke="#FF0076" strokeWidth="1.4" strokeDasharray="6,4" />}
                    <DimLine x1={positions.side.x} y1={positions.side.y + dims.side.H} x2={positions.side.x + dims.side.T} y2={positions.side.y + dims.side.H} value={T} offset={120} theme={theme} />
                    <DimLine x1={positions.side.x + dims.side.T} y1={positions.side.y} x2={positions.side.x + dims.side.T} y2={positions.side.y + dims.side.H} value={H} offset={100} vertical theme={theme} />
                    <DimLine x1={positions.side.x} y1={positions.side.y} x2={positions.side.x + dims.side.S} y2={positions.side.y} value={S} offset={-60} fontSize={18} theme={theme} />
                    <DimLine x1={positions.side.x + dims.side.S} y1={positions.side.y} x2={positions.side.x + dims.side.T - dims.side.S} y2={positions.side.y} value={T - 2 * S} offset={-120} fontSize={18} theme={theme} />
                  </g>

                  <g id="front-view">
                    <text x={positions.front.x + dims.front.W / 2} y={positions.front.y + dims.front.H + 70} textAnchor="middle" fontSize="28" fontWeight="bold" fill={theme.text}>
                      Front View
                    </text>
                    <rect x={positions.front.x} y={positions.front.y} width={dims.front.W} height={dims.front.H} fill={theme.paper} stroke={theme.stroke} strokeWidth="3" />
                    <FilledRect className="layer-frame" x={positions.front.x} y={positions.front.y} width={dims.front.F} height={dims.front.H} color="#FFB441" strokeWidth={1.6} />
                    <FilledRect className="layer-frame" x={positions.front.x + dims.front.W - dims.front.F} y={positions.front.y} width={dims.front.F} height={dims.front.H} color="#FFB441" strokeWidth={1.6} />
                    <FilledRect className="layer-rails" x={positions.front.x + dims.front.F} y={positions.front.y} width={dims.front.W - 2 * dims.front.F} height={dims.front.F} color="#FF8A00" strokeWidth={1.6} />
                    <FilledRect className="layer-rails" x={positions.front.x + dims.front.F} y={positions.front.y + dims.front.H - dims.front.F} width={dims.front.W - 2 * dims.front.F} height={dims.front.F} color="#FF8A00" strokeWidth={1.6} />
                    {renderDoubleFrames()}
                    {railPositions.map((pos, idx) => {
                      const railY = positions.front.y + dims.front.H - pos * DRAWING_SCALE;
                      return <FilledRect key={`front-rail-${idx}`} className="layer-rails" x={positions.front.x + dims.front.F} y={railY - dims.front.R / 2} width={dims.front.W - 2 * dims.front.F} height={dims.front.R} color="#FF8A00" strokeWidth={1.2} />;
                    })}
                    {renderLockBlocks()}
                    <CenterLine x1={positions.front.x + dims.front.W / 2} y1={positions.front.y - 40} x2={positions.front.x + dims.front.W / 2} y2={positions.front.y + dims.front.H + 40} theme={theme} />
                    <CenterLine x1={positions.front.x - 40} y1={positions.front.y + dims.front.H / 2} x2={positions.front.x + dims.front.W + 40} y2={positions.front.y + dims.front.H / 2} theme={theme} />
                    <DimLine x1={positions.front.x} y1={positions.front.y + dims.front.H} x2={positions.front.x + dims.front.W} y2={positions.front.y + dims.front.H} value={W} offset={120} theme={theme} />
                    <DimLine x1={positions.front.x + dims.front.W} y1={positions.front.y} x2={positions.front.x + dims.front.W} y2={positions.front.y + dims.front.H} value={H} offset={100} vertical theme={theme} />
                    <DimLine x1={positions.front.x} y1={positions.front.y} x2={positions.front.x + dims.front.F} y2={positions.front.y} value={F} offset={-60} fontSize={18} theme={theme} />
                    <DimLine x1={positions.front.x + dims.front.F} y1={positions.front.y} x2={positions.front.x + dims.front.W - dims.front.F} y2={positions.front.y} value={W - 2 * F} offset={-120} fontSize={18} theme={theme} />
                    {(lockBlockLeft || lockBlockRight) && <DimLine x1={positions.front.x} y1={positions.front.y + dims.front.H} x2={positions.front.x} y2={positions.front.y + dims.front.H - lockBlockPosition * DRAWING_SCALE} value={lockBlockPosition} offset={-100} vertical fontSize={18} theme={theme} />}
                    {railPositions.map((pos, idx) => (
                      <g key={`front-ann-${idx}`} className="layer-dimensions">
                        <line x1={positions.front.x + dims.front.W + 200} y1={positions.front.y + dims.front.H - pos * DRAWING_SCALE} x2={positions.front.x + dims.front.W + 240} y2={positions.front.y + dims.front.H - pos * DRAWING_SCALE} stroke={theme.stroke} strokeWidth="0.8" />
                        <text x={positions.front.x + dims.front.W + 260} y={positions.front.y + dims.front.H - pos * DRAWING_SCALE + 10} fontSize="18" fill={theme.text}>
                          {pos}
                        </text>
                      </g>
                    ))}
                  </g>

                  <g className="layer-title">
                    <rect x="20" y={viewBoxHeight - 145} width={viewBoxWidth - 40} height="130" fill={theme.paper} stroke={theme.accent} strokeWidth="1.5" rx="3" />

                    <g id="specs">
                      <rect x="25" y={viewBoxHeight - 140} width="370" height="20" fill={theme.accent} rx="2" />
                      <text x="35" y={viewBoxHeight - 126} fontSize="10" fontWeight="bold" fill="#FFFFFF">
                        📋 SPECIFICATIONS
                      </text>
                      <rect x="25" y={viewBoxHeight - 118} width="370" height="100" fill={theme.paper} stroke={`${theme.text}22`} strokeWidth="0.5" />
                      <text x="35" y={viewBoxHeight - 100} fontSize="8" fill={theme.text} opacity="0.7">
                        Door Size:
                      </text>
                      <text x="35" y={viewBoxHeight - 88} fontSize="11" fontWeight="bold" fill={theme.text}>
                        {T} × {W} × {H} mm
                      </text>
                      <text x="35" y={viewBoxHeight - 70} fontSize="8" fill={theme.text} opacity="0.7">
                        Surface Material:
                      </text>
                      <text x="35" y={viewBoxHeight - 58} fontSize="9" fontWeight="600" fill="#10B981">
                        {currentFrame?.desc?.split(" ")[0] || "-"} {S || 0}mm × 2
                      </text>
                      <text x="35" y={viewBoxHeight - 40} fontSize="8" fill={theme.text} opacity="0.7">
                        Frame:
                      </text>
                      <text x="35" y={viewBoxHeight - 28} fontSize="9" fontWeight="600" fill="#FF8A00">
                        {R || 0}×{F || 0}mm {hasDoubleFrame ? getDoubleFrameDesc() : ""}
                      </text>
                      <text x="200" y={viewBoxHeight - 100} fontSize="8" fill={theme.text} opacity="0.7">
                        Horizontal Rails:
                      </text>
                      <text x="200" y={viewBoxHeight - 88} fontSize="9" fontWeight="600" fill="#FF8A00">
                        {railSections - 1} pcs @ {railPositions.join(", ") || "-"} mm
                      </text>
                      <text x="200" y={viewBoxHeight - 70} fontSize="8" fill={theme.text} opacity="0.7">
                        Lock Block:
                      </text>
                      <text x="200" y={viewBoxHeight - 58} fontSize="9" fontWeight="600" fill="#FF0076">
                        {lockBlockCount} pcs ({R || 0}×{F || 0}×{LOCK_BLOCK_HEIGHT}mm)
                      </text>
                      {currentFrame?.code && (
                        <>
                          <text x="200" y={viewBoxHeight - 40} fontSize="8" fill={theme.text} opacity="0.7">
                            ERP Code:
                          </text>
                          <text x="200" y={viewBoxHeight - 28} fontSize="8" fontWeight="500" fill={theme.accent} fontFamily="monospace">
                            {currentFrame.code}
                          </text>
                        </>
                      )}
                    </g>

                    <g id="legend">
                      <rect x="405" y={viewBoxHeight - 140} width="280" height="20" fill={theme.accent} rx="2" />
                      <text x="415" y={viewBoxHeight - 126} fontSize="10" fontWeight="bold" fill="#FFFFFF">
                        🎨 LEGEND
                      </text>
                      <rect x="405" y={viewBoxHeight - 118} width="280" height="100" fill={theme.paper} stroke={`${theme.text}22`} strokeWidth="0.5" />
                      {LEGEND_ITEMS.map((item, i) => (
                        <g key={`legend-${i}`}>
                          <rect x={legendPositions[i].x} y={viewBoxHeight + legendPositions[i].yOffset} width="16" height="10" fill={item.fill} stroke={item.stroke} strokeWidth="0.8" rx="1" strokeDasharray={item.dashed ? "2,1" : undefined} />
                          <text x={legendPositions[i].x + 20} y={viewBoxHeight + legendPositions[i].yOffset + 8} fontSize="7" fill={theme.text}>
                            {item.label}
                          </text>
                        </g>
                      ))}
                      <line x1="415" y1={viewBoxHeight - 49} x2="431" y2={viewBoxHeight - 49} stroke={theme.text} strokeWidth="0.6" strokeDasharray="8,2,2,2" />
                      <text x="435" y={viewBoxHeight - 46} fontSize="7" fill={theme.text}>
                        Center Line
                      </text>
                      <line x1="525" y1={viewBoxHeight - 49} x2="541" y2={viewBoxHeight - 49} stroke={theme.text} strokeWidth="0.6" strokeDasharray="3,3" />
                      <text x="545" y={viewBoxHeight - 46} fontSize="7" fill={theme.text}>
                        Hidden Line
                      </text>
                      <line x1="415" y1={viewBoxHeight - 32} x2="431" y2={viewBoxHeight - 32} stroke={theme.text} strokeWidth="0.6" />
                      <polygon points={`415,${viewBoxHeight - 32} 418,${viewBoxHeight - 34} 418,${viewBoxHeight - 30}`} fill={theme.text} />
                      <polygon points={`431,${viewBoxHeight - 32} 428,${viewBoxHeight - 34} 428,${viewBoxHeight - 30}`} fill={theme.text} />
                      <text x="435" y={viewBoxHeight - 29} fontSize="7" fill={theme.text}>
                        Dimension Line
                      </text>
                    </g>

                    <g id="title-block">
                      <rect x={viewBoxWidth - 305} y={viewBoxHeight - 140} width="280" height="120" fill={theme.paper} stroke={theme.accent} strokeWidth="1.5" rx="2" />
                      <rect x={viewBoxWidth - 305} y={viewBoxHeight - 140} width="280" height="28" fill={theme.accent} rx="2" />
                      <rect x={viewBoxWidth - 305} y={viewBoxHeight - 115} width="280" height="3" fill={theme.accent} />
                      <text x={viewBoxWidth - 165} y={viewBoxHeight - 121} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#FFFFFF">
                        DOOR FRAME ASSEMBLY
                      </text>
                      <rect x={viewBoxWidth - 300} y={viewBoxHeight - 107} width="270" height="22" fill={`${theme.accent}11`} rx="1" />
                      <text x={viewBoxWidth - 290} y={viewBoxHeight - 92} fontSize="8" fill={theme.text} opacity="0.7">
                        Size:
                      </text>
                      <text x={viewBoxWidth - 165} y={viewBoxHeight - 91} textAnchor="middle" fontSize="14" fontWeight="bold" fill={theme.text}>
                        {T} × {W} × {H} mm
                      </text>
                      <line x1={viewBoxWidth - 300} y1={viewBoxHeight - 82} x2={viewBoxWidth - 30} y2={viewBoxHeight - 82} stroke={`${theme.text}33`} strokeWidth="0.5" />
                      <text x={viewBoxWidth - 290} y={viewBoxHeight - 68} fontSize="8" fill={theme.text} opacity="0.7">
                        Material:
                      </text>
                      <text x={viewBoxWidth - 165} y={viewBoxHeight - 68} textAnchor="middle" fontSize="10" fontWeight="600" fill="#10B981">
                        {currentFrame?.desc?.split(" ")[0] || "-"}
                      </text>
                      <line x1={viewBoxWidth - 300} y1={viewBoxHeight - 55} x2={viewBoxWidth - 30} y2={viewBoxHeight - 55} stroke={`${theme.text}33`} strokeWidth="0.5" />
                      <line x1={viewBoxWidth - 165} y1={viewBoxHeight - 55} x2={viewBoxWidth - 165} y2={viewBoxHeight - 35} stroke={`${theme.text}33`} strokeWidth="0.5" />
                      <text x={viewBoxWidth - 290} y={viewBoxHeight - 42} fontSize="8" fill={theme.text} opacity="0.7">
                        Scale:
                      </text>
                      <text x={viewBoxWidth - 240} y={viewBoxHeight - 42} fontSize="10" fontWeight="600" fill={theme.text}>
                        1:25
                      </text>
                      <text x={viewBoxWidth - 155} y={viewBoxHeight - 42} fontSize="8" fill={theme.text} opacity="0.7">
                        Rev:
                      </text>
                      <text x={viewBoxWidth - 120} y={viewBoxHeight - 42} fontSize="10" fontWeight="600" fill={theme.text}>
                        1.0
                      </text>
                      <rect x={viewBoxWidth - 305} y={viewBoxHeight - 35} width="280" height="15" fill={theme.paper} />
                      <line x1={viewBoxWidth - 300} y1={viewBoxHeight - 35} x2={viewBoxWidth - 30} y2={viewBoxHeight - 35} stroke={`${theme.text}33`} strokeWidth="0.5" />
                      <text x={viewBoxWidth - 165} y={viewBoxHeight - 24} textAnchor="middle" fontSize="9" fontWeight="bold" fill={theme.accent}>
                        C.H.H INDUSTRY CO., LTD.
                      </text>
                    </g>
                  </g>
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-default-50 border-t border-default-200 text-xs text-default-500">
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

export default function DoorConfigurator() {
  const formRef = useRef(null);
  const [doorThickness, setDoorThickness] = useState("");
  const [doorWidth, setDoorWidth] = useState("");
  const [doorHeight, setDoorHeight] = useState("");
  const [surfaceMaterial, setSurfaceMaterial] = useState("");
  const [surfaceThickness, setSurfaceThickness] = useState("");
  const [frameType, setFrameType] = useState("");
  const [selectedFrameCode, setSelectedFrameCode] = useState("");
  const [lockBlockPosition, setLockBlockPosition] = useState("");
  const [lockBlockPiecesPerSide, setLockBlockPiecesPerSide] = useState("");
  const [doubleFrameSides, setDoubleFrameSides] = useState({ top: false, bottom: false, left: false, center: false, right: false, all: false });
  const [doubleFrameCount, setDoubleFrameCount] = useState("");

  const lockBlockLeft = lockBlockPosition === "left" || lockBlockPosition === "both";
  const lockBlockRight = lockBlockPosition === "right" || lockBlockPosition === "both";

  const frameSelection = useFrameSelection(frameType, doorThickness, surfaceThickness, doorHeight);

  const currentFrame = useMemo(() => {
    if (!frameSelection.frames?.length) return { thickness: 0, width: 0, length: 0, useThickness: 0, useWidth: 0, isFlipped: false, planeAmount: 0, code: "", desc: "" };
    return frameSelection.frames.find((f) => f.code === selectedFrameCode) || frameSelection.frames[0];
  }, [frameSelection, selectedFrameCode]);

  useEffect(() => {
    if (frameSelection.frames?.length > 0) setSelectedFrameCode(frameSelection.frames[0].code);
  }, [frameSelection]);

  const numericDoubleCount = parseInt(doubleFrameCount) || 0;

  const results = useCalculations({ doorThickness, doorWidth, doorHeight, surfaceThickness, currentFrame, lockBlockLeft, lockBlockRight, lockBlockPiecesPerSide, doubleFrameSides, doubleFrameCount: numericDoubleCount });
  const cuttingPlan = useCuttingPlan(results, currentFrame);

  const isDataComplete = doorThickness && doorWidth && doorHeight;
  const piecesPerSide = parseInt(lockBlockPiecesPerSide) || 0;

  const doubleConfigSummary = useMemo(() => {
    const df = results.doubleFrame;
    if (!df?.hasAny || !df.count) return "";
    const sideLabels = { top: "บน", bottom: "ล่าง", left: "ซ้าย", center: "กลาง", right: "ขวา" };
    const sides = Object.entries(sideLabels)
      .filter(([key]) => df[key])
      .map(([_, label]) => label);
    return sides.length ? `เบิ้ลโครงด้าน ${sides.join(", ")} จำนวน ${df.count} ชั้น/ด้าน` : "";
  }, [results]);

  const handleToggleDoubleSide = (side) => {
    setDoubleFrameSides((prev) => {
      if (side === "all") {
        const newValue = !prev.all;
        return { top: newValue, bottom: newValue, left: newValue, center: newValue, right: newValue, all: newValue };
      }
      return { ...prev, [side]: !prev[side], all: false };
    });
  };

  const lockBlockDesc = lockBlockLeft && lockBlockRight ? `ซ้าย ${piecesPerSide} + ขวา ${piecesPerSide}` : lockBlockLeft ? `ซ้าย ${piecesPerSide}` : lockBlockRight ? `ขวา ${piecesPerSide}` : "-";

  return (
    <div ref={formRef} className="flex flex-col items-center justify-start w-full h-full p-2 gap-2 overflow-auto bg-background">
      <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
        <h1 className="text-3xl font-bold text-primary">🚪 Door Configuration System</h1>
        <p className="text-foreground/70">ระบบออกแบบโครงประตู - C.H.H INDUSTRY CO., LTD.</p>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
        <div className="flex flex-col items-center justify-start w-full h-full xl:w-8/12 gap-2">
          <Card className="w-full">
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="sm">
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
                <Chip color="primary" variant="flat" size="lg">
                  สเปค: {formatDimension(doorThickness, doorWidth, doorHeight)} mm
                </Chip>
              </div>
            </CardBody>
          </Card>

          <Card className="w-full">
            <CardHeader className="bg-success text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="sm">
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

          <Card className="w-full">
            <CardHeader className="bg-warning text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="sm">
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
                <Chip color="danger" variant="flat" className="w-full">
                  ⚠️ {frameSelection.reason || `ไม่มีไม้ที่ใช้ได้สำหรับความหนา ${results.frameThickness}mm`}
                </Chip>
              )}
              {frameType && frameSelection.frames.length > 0 && (
                <div className="flex flex-col gap-2 text-sm p-2 bg-warning/10 rounded-lg">
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
                    <Chip color="secondary" variant="flat" size="sm">
                      🔄 พลิกไม้ {currentFrame.thickness}×{currentFrame.width} → {currentFrame.width}×{currentFrame.thickness}
                    </Chip>
                  )}
                  {currentFrame.planeAmount > 0 && (
                    <Chip color="secondary" variant="flat" size="sm">
                      🪚 ต้องไสเนื้อออก {currentFrame.planeAmount} mm
                    </Chip>
                  )}
                  {currentFrame.needSplice && (
                    <div className="flex flex-col gap-2 mt-2 p-2 bg-primary/10 rounded-lg">
                      <Chip color="primary" variant="flat" size="sm">
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
                    <Button key={key} color={doubleFrameSides[key] ? "warning" : "default"} variant={doubleFrameSides[key] ? "solid" : "bordered"} size="sm" radius="md" onPress={() => handleToggleDoubleSide(key)}>
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
                <Chip color="warning" variant="flat" className="w-full">
                  {doubleConfigSummary}
                </Chip>
              )}
            </CardBody>
          </Card>

          <Card className="w-full">
            <CardHeader className="bg-secondary text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="sm">
                  4
                </Chip>
                <span className="font-semibold">➖ ไม้ดามแนวนอน</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="flex flex-col gap-2 text-sm p-2 bg-secondary/10 rounded-lg">
                <div className="flex justify-between">
                  <span>จำนวนช่อง:</span>
                  <span className="font-bold text-secondary">
                    {results.railSections} ช่อง ({results.railSections - 1} ไม้ดาม)
                  </span>
                </div>
                {doorHeight && parseFloat(doorHeight) >= 2400 && (
                  <Chip color="secondary" variant="flat" size="sm">
                    ⚡ ประตูสูงเกิน 2400mm → แบ่ง 4 ช่อง อัตโนมัติ
                  </Chip>
                )}
                {results.railsAdjusted && (
                  <Chip color="warning" variant="flat" size="sm">
                    🔄 ปรับตำแหน่งไม้ดามอัตโนมัติเพื่อหลบ Lock Block
                  </Chip>
                )}
                <div className="flex justify-between">
                  <span>ขนาดไม้ดาม:</span>
                  <span className="font-bold text-secondary">
                    {currentFrame.useThickness || 0}×{currentFrame.useWidth || 0} mm
                  </span>
                </div>
                <span className="text-xs text-foreground/60">(ใช้ไม้เดียวกับโครง)</span>
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

          <Card className="w-full">
            <CardHeader className="bg-danger text-white">
              <div className="flex items-center gap-2">
                <Chip color="default" variant="solid" size="sm">
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
                <div className="flex flex-col gap-2 text-sm p-2 bg-danger/10 rounded-lg">
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

          <Card className="w-full">
            <CardHeader className="bg-default-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold">📋 สรุปโครงสร้าง</span>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-default-100 rounded-lg">
                  <span className="block text-foreground/70">สเปคประตู:</span>
                  <span className="font-bold">{formatDimension(doorThickness, doorWidth, doorHeight)} mm</span>
                </div>
                <div className="p-2 bg-default-100 rounded-lg">
                  <span className="block text-foreground/70">ปิดผิว:</span>
                  <span className="font-bold text-success">
                    {getMaterialLabel(SURFACE_MATERIALS, surfaceMaterial)} {surfaceThickness || 0}mm + กาว {GLUE_THICKNESS}mm (×2)
                  </span>
                </div>
                <div className="p-2 bg-warning/20 rounded-lg">
                  <span className="block text-foreground/70">โครงไม้:</span>
                  <span className="font-bold text-secondary">
                    {currentFrame.useThickness || "-"}×{currentFrame.useWidth || "-"} mm
                  </span>
                  {currentFrame.isFlipped && <span className="block text-xs text-secondary">🔄 พลิกไม้</span>}
                  {currentFrame.planeAmount > 0 && <span className="block text-xs text-secondary">🪚 ไส {currentFrame.planeAmount}mm</span>}
                </div>
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <span className="block text-foreground/70">ไม้ดาม:</span>
                  <span className="font-bold text-secondary">
                    {results.railSections - 1} ตัว ({results.railSections} ช่อง)
                  </span>
                </div>
                <div className="col-span-2 p-2 bg-danger/10 rounded-lg">
                  <span className="block text-foreground/70">Lock Block:</span>
                  <span className="font-bold text-danger">
                    {results.lockBlockCount} ชิ้น ({lockBlockDesc})
                  </span>
                </div>
              </div>
              {doubleConfigSummary && <div className="p-2 bg-warning/20 rounded-lg text-sm text-secondary">{doubleConfigSummary}</div>}
              {selectedFrameCode && (
                <div className="p-2 bg-primary/10 rounded-lg text-sm">
                  <span className="font-medium text-primary">รหัส ERP: {selectedFrameCode}</span>
                  <span className="block text-xs">{currentFrame.desc}</span>
                </div>
              )}
            </CardBody>
          </Card>

          {isDataComplete ? (
            <Card className="w-full">
              <CardHeader className="bg-primary text-white">
                <div className="flex items-center gap-2">
                  <Chip color="default" variant="solid" size="sm">
                    6
                  </Chip>
                  <span className="font-semibold">✂️ แผนการตัดไม้ (Cutting Optimization)</span>
                </div>
              </CardHeader>
              <CardBody className="gap-2">
                {cuttingPlan.needSplice && (
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 font-medium text-primary mb-1">
                      <span>🔗</span>
                      <span>ต้องต่อไม้โครงตั้ง</span>
                    </div>
                    <div className="text-sm text-primary">
                      <div>• จำนวนชิ้นที่ต้องต่อ: {cuttingPlan.spliceCount} ชิ้น</div>
                      <div>• เผื่อซ้อนทับ: {cuttingPlan.spliceOverlap} mm ต่อจุด</div>
                      <div className="text-xs mt-1 opacity-80">💡 ใช้กาว + ตะปูยึดบริเวณรอยต่อ</div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg text-center border">
                    <div className="font-bold text-lg text-primary">{cuttingPlan.totalStocks}</div>
                    <div className="text-xs text-foreground/80">ไม้ที่ใช้ (ท่อน)</div>
                  </div>
                  <div className="p-2 rounded-lg text-center border">
                    <div className="font-bold text-lg text-success">{cuttingPlan.efficiency}</div>
                    <div className="text-xs text-foreground/80">ประสิทธิภาพ</div>
                  </div>
                  <div className="p-2 rounded-lg text-center border">
                    <div className="font-bold text-lg text-primary">{cuttingPlan.usedWithoutKerf}</div>
                    <div className="text-xs text-foreground/80">ใช้จริง (mm)</div>
                  </div>
                  <div className="p-2 rounded-lg text-center border">
                    <div className="font-bold text-lg text-danger">{cuttingPlan.totalWaste}</div>
                    <div className="text-xs text-foreground/80">เศษเหลือ (mm)</div>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 text-xs font-semibold bg-default-100">📋 รายการชิ้นส่วน (เผื่อรอยเลื่อย {cuttingPlan.sawKerf}mm)</div>
                  <div>
                    {cuttingPlan.cutPieces.map((piece, idx) => (
                      <div key={idx} className={`flex items-center justify-between px-3 py-2 text-xs ${piece.isSplice ? "bg-primary/5" : ""}`}>
                        <div className="flex items-center gap-2">
                          <Chip color={piece.color} variant="flat" size="sm" className="min-w-3 h-3 p-0" />
                          <span className="font-medium">{piece.name}</span>
                          {piece.isSplice && (
                            <Chip color="primary" variant="flat" size="sm">
                              ต่อ
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{piece.length} mm</span>
                          <span className="font-bold">×{piece.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 text-xs font-semibold bg-default-100">
                    🪵 แผนการตัด (ไม้ยาว {cuttingPlan.stockLength}mm × {cuttingPlan.totalStocks} ท่อน)
                  </div>
                  <div className="p-2 space-y-2">
                    {cuttingPlan.stocks.map((stock, stockIdx) => (
                      <div key={stockIdx} className="space-y-1">
                        <div className="text-xs text-foreground/70">ท่อนที่ {stockIdx + 1}</div>
                        <div className="relative h-8 rounded border overflow-hidden bg-default-100">
                          {(() => {
                            let offset = 0;
                            return stock.pieces.map((piece, pieceIdx) => {
                              const width = (piece.length / stock.length) * 100;
                              const kerfWidth = (cuttingPlan.sawKerf / stock.length) * 100;
                              const left = offset;
                              offset += width + kerfWidth;
                              const colorMap = { primary: "#4456E9", secondary: "#FF8A00", warning: "#FFB441", danger: "#FF0076", success: "#10B981" };
                              return (
                                <React.Fragment key={pieceIdx}>
                                  <div className="absolute h-full flex items-center justify-center text-[8px] font-medium overflow-hidden text-white" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: colorMap[piece.color] || "#DCDCDC" }} title={`${piece.name}: ${piece.length}mm`}>
                                    {width > 8 && <span className="truncate px-1">{piece.length}</span>}
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
                  <Progress value={parseFloat(cuttingPlan.efficiency)} color={getEfficiencyColor(cuttingPlan.efficiency)} size="sm" />
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
                  <Chip color="default" variant="solid" size="sm">
                    6
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
                <EnhancedEngineeringDrawing results={results} />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 gap-2">
                  <RulerDimensionLine className="w-12 h-12 text-default-300" />
                  <p className="text-lg font-medium">กรุณากรอกข้อมูลสเปคประตู</p>
                  <p className="text-sm text-foreground/70">ระบุ ความหนา (T), ความกว้าง (W), ความสูง (H)</p>
                  <div className="flex gap-2 mt-4">
                    <Chip color={doorThickness ? "success" : "danger"} variant="flat">
                      T: {doorThickness || "—"}
                    </Chip>
                    <Chip color={doorWidth ? "success" : "danger"} variant="flat">
                      W: {doorWidth || "—"}
                    </Chip>
                    <Chip color={doorHeight ? "success" : "danger"} variant="flat">
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
}
