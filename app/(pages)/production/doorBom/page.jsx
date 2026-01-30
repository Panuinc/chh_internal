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
const CUT_ALLOWANCE = 10;

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
        ...(spliceInfo && {
          spliceCount: spliceInfo.spliceCount,
          spliceOverlap: spliceInfo.spliceOverlap,
          splicePosition: spliceInfo.splicePosition,
          effectiveLength: spliceInfo.effectiveLength,
        }),
        displaySize: createDisplaySize(f, isFlipped, planeAmount, needSplice),
      });
      return {
        frames: needSplice ? [mapFrame(spliceInfo.frame)] : frameList.map(mapFrame),
        needFlip: isFlipped,
        needPlane: planeAmount > 0,
        needSplice,
      };
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
    return {
      frames: [],
      needFlip: false,
      needPlane: false,
      needSplice: false,
      noMatch: true,
      reason: maxLength > 0 ? `ไม่มีไม้ที่ใช้ได้ (ต้องการ ≥${requiredLength}mm, ต่อได้สูงสุด ${maxSpliceLength}mm)` : `ไม่มีไม้ความหนา ${requiredThickness}mm`,
    };
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

    const doubleFrameLeftWidth = effectiveSides.left ? F * numericDoubleCount : 0;
    const doubleFrameRightWidth = effectiveSides.right ? F * numericDoubleCount : 0;

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
      doubleFrame: {
        count: numericDoubleCount,
        ...effectiveSides,
        hasAny: hasDoubleFrame,
        leftWidth: doubleFrameLeftWidth,
        rightWidth: doubleFrameRightWidth,
      },
    };
  }, [doorThickness, doorWidth, doorHeight, surfaceThickness, currentFrame, lockBlockLeft, lockBlockRight, lockBlockPiecesPerSide, doubleFrameSides, doubleFrameCount]);
};

const useCuttingPlan = (results, currentFrame) => {
  return useMemo(() => {
    if (!results || !currentFrame) {
      return {
        cutPieces: [],
        allPieces: [],
        stocks: [],
        totalStocks: 0,
        totalWaste: 0,
        totalStock: 0,
        efficiency: "0.0",
        stockLength: 2040,
        sawKerf: 5,
        usedLength: 0,
        needSplice: false,
        spliceCount: 0,
        spliceOverlap: 100,
      };
    }

    const { W, H, F, railSections, lockBlockCount, doubleFrame } = results;
    const stockLength = currentFrame.length || 2040;
    const sawKerf = 5;
    const needSplice = currentFrame.needSplice || false;
    const spliceOverlap = currentFrame.spliceOverlap || 100;
    const cutPieces = [];

    const addPiece = (name, finishedLength, qty, color, isSplice = false, withAllowance = true) => {
      if (!finishedLength || finishedLength <= 0 || !qty) return;

      const cutLength = finishedLength + (withAllowance ? CUT_ALLOWANCE : 0);
      cutPieces.push({
        name,
        length: finishedLength,
        cutLength,
        qty,
        color,
        isSplice,
      });
    };

    const stileLength = H;
    if (needSplice && stileLength > stockLength) {
      const pieceLength = Math.ceil(stileLength / 2) + spliceOverlap / 2;
      addPiece("โครงตั้ง (ท่อน 1)", pieceLength, 2, "secondary", true);
      addPiece("โครงตั้ง (ท่อน 2)", pieceLength, 2, "warning", true);
    } else {
      addPiece("โครงตั้ง", stileLength, 2, "secondary");
    }

    const railLength = W - 2 * F;
    addPiece("โครงนอน", railLength, 2, "primary");

    const clearHeight = H - 2 * F;
    const clearWidth = W - 2 * F;

    if (doubleFrame?.hasAny && doubleFrame.count > 0) {
      const count = doubleFrame.count;

      if (doubleFrame.left) {
        if (needSplice && clearHeight > stockLength) {
          const pieceLength = Math.ceil(clearHeight / 2) + spliceOverlap / 2;
          addPiece("เบิ้ลโครงตั้งซ้าย (ท่อน 1)", pieceLength, count, "warning", true);
          addPiece("เบิ้ลโครงตั้งซ้าย (ท่อน 2)", pieceLength, count, "secondary", true);
        } else {
          addPiece("เบิ้ลโครงตั้งซ้าย", clearHeight, count, "warning");
        }
      }

      if (doubleFrame.right) {
        if (needSplice && clearHeight > stockLength) {
          const pieceLength = Math.ceil(clearHeight / 2) + spliceOverlap / 2;
          addPiece("เบิ้ลโครงตั้งขวา (ท่อน 1)", pieceLength, count, "warning", true);
          addPiece("เบิ้ลโครงตั้งขวา (ท่อน 2)", pieceLength, count, "secondary", true);
        } else {
          addPiece("เบิ้ลโครงตั้งขวา", clearHeight, count, "warning");
        }
      }

      if (doubleFrame.center) {
        if (needSplice && clearHeight > stockLength) {
          const pieceLength = Math.ceil(clearHeight / 2) + spliceOverlap / 2;
          addPiece("โครงกลาง (ท่อน 1)", pieceLength, count, "warning", true);
          addPiece("โครงกลาง (ท่อน 2)", pieceLength, count, "secondary", true);
        } else {
          addPiece("โครงกลาง", clearHeight, count, "warning");
        }
      }

      if (doubleFrame.top) {
        let topLength = clearWidth;
        if (doubleFrame.left) topLength -= F * count;
        if (doubleFrame.right) topLength -= F * count;
        addPiece("เบิ้ลโครงบน", topLength, count, "secondary");
      }

      if (doubleFrame.bottom) {
        let bottomLength = clearWidth;
        if (doubleFrame.left) bottomLength -= F * count;
        if (doubleFrame.right) bottomLength -= F * count;
        addPiece("เบิ้ลโครงล่าง", bottomLength, count, "secondary");
      }
    }

    const railCount = railSections - 1;
    if (railCount > 0) {
      let damLength = clearWidth;
      if (doubleFrame?.hasAny && doubleFrame.count > 0) {
        if (doubleFrame.left) damLength -= F * doubleFrame.count;
        if (doubleFrame.right) damLength -= F * doubleFrame.count;
      }
      addPiece("ไม้ดาม", damLength, railCount, "primary");
    }

    if (lockBlockCount > 0) {
      addPiece("Lock Block", LOCK_BLOCK_HEIGHT, lockBlockCount, "danger", false, false);
    }

    const allPieces = cutPieces
      .flatMap((piece) =>
        Array.from({ length: piece.qty }, (_, i) => ({
          ...piece,
          id: `${piece.name}-${i + 1}`,
        })),
      )
      .sort((a, b) => (b.cutLength ?? b.length) - (a.cutLength ?? a.length));

    const stocks = [];
    allPieces.forEach((piece) => {
      const pieceCut = piece.cutLength ?? piece.length;
      const pieceWithKerf = pieceCut + sawKerf;
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

    stocks.forEach((s) => {
      s.remaining += sawKerf;
      s.used -= sawKerf;
    });

    const totalStocks = stocks.length;
    const totalStock = totalStocks * stockLength;
    const totalWaste = stocks.reduce((sum, s) => sum + s.remaining, 0);
    const usedLength = totalStock - totalWaste;
    const efficiency = totalStock ? ((usedLength / totalStock) * 100).toFixed(1) : "0.0";
    const spliceCount = cutPieces.filter((p) => p.isSplice).reduce((sum, p) => sum + p.qty, 0) / 2;

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
      usedLength,
      needSplice,
      spliceCount,
      spliceOverlap,
    };
  }, [results, currentFrame]);
};

const DimLine = memo(({ x1, y1, x2, y2, value, offset = 25, vertical = false, color = "#000000", fontSize = 9, unit = "", theme }) => {
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

const CenterLine = memo(({ x1, y1, x2, y2, theme }) => <line className="layer-centerlines" x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme?.stroke || "#000000"} strokeWidth="0.3" strokeDasharray="10,3,2,3" />);
CenterLine.displayName = "CenterLine";

const LockBlockSVG = memo(({ x, y, width, height }) => (
  <g className="layer-lockblock">
    <rect x={x} y={y} width={width} height={height} fill="url(#hatch-lockblock)" stroke="#000000" strokeWidth="0.8" />
    <line x1={x} y1={y} x2={x + width} y2={y + height} stroke="#000000" strokeWidth="0.4" />
    <line x1={x + width} y1={y} x2={x} y2={y + height} stroke="#000000" strokeWidth="0.4" />
  </g>
));
LockBlockSVG.displayName = "LockBlockSVG";

const FilledRect = memo(({ x, y, width, height, color, strokeWidth = 1, strokeDasharray, className, patternId }) => {
  const fill = patternId ? `url(#${patternId})` : "#FFFFFF";

  return <rect className={className} x={x} y={y} width={width} height={height} fill={fill} stroke="#000000" strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />;
});
FilledRect.displayName = "FilledRect";

const TitleBlockSVG = ({ x, y, w, h, theme, data }) => {
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
      {txt(x + w / 2, yMap.logo.y + yMap.logo.h * 0.62, "EVERGREEN", {
        size: 34,
        weight: 300,
        letterSpacing: 8,
      })}
      {txt(x + w / 2, yMap.logo.y + yMap.logo.h * 0.8, "GREEN CONSTRUCTION MATERIALS", {
        size: 16,
        weight: 300,
        letterSpacing: 2,
      })}

      {txt(x + w / 2, midY("company"), "C.H.H. INDUSTRY CO.,LTD .", {
        size: 26,
        weight: 600,
        letterSpacing: 2,
      })}

      {txt(x + w / 2, midY("ownerH"), "PROJECT OWNER", { size: 38, weight: 900 })}
      {txt(x + w / 2, midY("ownerV"), owner, { size: 28, weight: 600 })}

      {line(splitHalf, yMap.pcH.y, splitHalf, yMap.pcH.y + yMap.pcH.h + yMap.pcV.h, 2)}
      {txt(x + (splitHalf - x) / 2, midY("pcH"), "PROJECT CODE", {
        size: 24,
        weight: 900,
      })}
      {txt(splitHalf + (x + w - splitHalf) / 2, midY("pcH"), "CODE", {
        size: 32,
        weight: 900,
      })}
      {txt(x + (splitHalf - x) / 2, midY("pcV"), projectCode, { size: 28, weight: 600 })}
      {txt(splitHalf + (x + w - splitHalf) / 2, midY("pcV"), code, {
        size: 28,
        weight: 600,
      })}

      {txt(x + w / 2, midY("dimH"), "DIMENSION", { size: 34, weight: 900 })}
      {txt(x + w / 2, midY("dimV"), dimText, { size: 26, weight: 600 })}

      {txt(x + w / 2, midY("typeH"), "TYPE", { size: 34, weight: 900 })}
      {txt(x + w / 2, midY("typeV"), type, { size: 26, weight: 600 })}

      {line(splitIssue, yMap.issueH.y, splitIssue, yMap.issueH.y + yMap.issueH.h + yMap.issueV.h, 2)}
      {txt(x + (splitIssue - x) / 2, midY("issueH"), "ISSUE DATE", {
        size: 30,
        weight: 900,
      })}
      {txt(splitIssue + (x + w - splitIssue) / 2, midY("issueH"), "REVISE", {
        size: 28,
        weight: 900,
      })}
      {txt(x + (splitIssue - x) / 2, midY("issueV"), issueDate, { size: 26, weight: 600 })}
      {txt(splitIssue + (x + w - splitIssue) / 2, midY("issueV"), String(revise), {
        size: 26,
        weight: 600,
      })}

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

      {txt(x + w / 2, midY("thai1"), "*เงื่อนไขการรับประกันสินค้า*", {
        size: 20,
        weight: 600,
      })}
      {txt(x + w / 2, midY("thai2"), "*ตรวจสอบยืนยันทุกครั้งก่อนเซ็นต์อนุมัติ*", {
        size: 20,
        weight: 600,
      })}
      {txt(x + w / 2, midY("sig"), "( Customer SIG.)", { size: 20, weight: 600 })}
      {txt(x + w / 2, midY("app"), "( Approved date )", {
        size: 20,
        weight: 600,
      })}

      <text x={x + w - pad} y={midY("footer")} fill={fill} fontFamily={font} fontSize={18} fontWeight={500} textAnchor="end" dominantBaseline="middle">
        FP-MR-02-02 Rev.00
      </text>
    </g>
  );
};

const EnhancedEngineeringDrawing = memo(({ results }) => {
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
  const { W = 0, H = 0, T = 0, S = 0, F = 0, R = 0, totalFrameWidth = 0, railPositions = [], railSections = 3, lockBlockTop = 800, lockBlockBottom = 1200, lockBlockLeft = false, lockBlockRight = false, lockBlockPosition = 1000, lockBlockCount = 0, lockBlockSides = 1, currentFrame = {}, doubleFrame = {} } = safeResults;

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

    const leftOffset = hasDoubleFrame && doubleFrame.left ? dims.front.DF : 0;
    const rightOffset = hasDoubleFrame && doubleFrame.right ? dims.front.DF : 0;
    const railX = positions.front.x + dims.front.F + leftOffset;
    const railWidth = dims.front.W - 2 * dims.front.F - leftOffset - rightOffset;

    return railPositions.map((pos, idx) => {
      const railY = positions.front.y + dims.front.H - pos * DRAWING_SCALE;
      return <FilledRect key={`front-rail-${idx}`} className="layer-rails" x={railX} y={railY - dims.front.R / 2} width={railWidth} height={dims.front.R} patternId="hatch-rails" strokeWidth={1} />;
    });
  }, [railPositions, positions, dims, hasDoubleFrame, doubleFrame]);

  const getDoubleFrameDesc = () => {
    if (!hasDoubleFrame || !doubleFrame) return "";
    const sideLabels = {
      top: "บน",
      bottom: "ล่าง",
      left: "ซ้าย",
      right: "ขวา",
      center: "กลาง",
    };
    const sides = Object.entries(sideLabels)
      .filter(([key]) => doubleFrame[key])
      .map(([_, label]) => label);

    return sides.length > 0 ? `(Double: ${sides.join(", ")} x${doubleFrame.count})` : "(Double)";
  };

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
                      <rect width="4" height="4" fill="#000000" opacity="0.1" />
                    </pattern>

                    <pattern id="hatch-lockblock" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M0 4 L4 0" stroke="#000000" strokeWidth="0.4" />
                    </pattern>

                    <pattern id="hatch-core" patternUnits="userSpaceOnUse" width="6" height="6">
                      <circle cx="3" cy="3" r="0.5" fill="#000000" opacity="0.4" />
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

                    <FilledRect className="layer-core" x={positions.side.x + dims.side.S + (dims.side.T - 2 * dims.side.S) * 0.25} y={positions.side.y} width={(dims.side.T - 2 * dims.side.S) * 0.5} height={dims.side.H} patternId="hatch-core" strokeWidth={0.8} strokeDasharray="4,4" />

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

                    {(lockBlockLeft || lockBlockRight) &&
                      (() => {
                        const lockBlockTopY = positions.front.y + dims.front.H - lockBlockBottom * DRAWING_SCALE;
                        const lockBlockBottomY = lockBlockTopY + LOCK_BLOCK_HEIGHT * DRAWING_SCALE;

                        let lockBlockLeftX = null;
                        let lockBlockRightX = null;

                        const getOffset = (isLeft) => {
                          const hasDoubleOnSide = hasDoubleFrame && doubleFrame && doubleFrame.count > 0 && (isLeft ? doubleFrame.left : doubleFrame.right);

                          return dims.front.F + (hasDoubleOnSide ? dims.front.DF : 0);
                        };

                        if (lockBlockLeft) {
                          const offsetLeft = getOffset(true);
                          lockBlockLeftX = positions.front.x + offsetLeft;
                          lockBlockRightX = lockBlockLeftX + dims.front.lockBlockW;
                        } else if (lockBlockRight) {
                          const offsetRight = getOffset(false);
                          lockBlockRightX = positions.front.x + dims.front.W - offsetRight;
                          lockBlockLeftX = lockBlockRightX - dims.front.lockBlockW;
                        }

                        return (
                          <>
                            <DimLine x1={positions.front.x} y1={lockBlockTopY} x2={positions.front.x} y2={lockBlockBottomY} value={LOCK_BLOCK_HEIGHT} offset={-60} vertical fontSize={16} theme={theme} />

                            {lockBlockLeftX !== null && lockBlockRightX !== null && <DimLine x1={lockBlockLeftX} y1={lockBlockBottomY} x2={lockBlockRightX} y2={lockBlockBottomY} value={safeF} offset={40} fontSize={16} theme={theme} />}
                          </>
                        );
                      })()}

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
  const [doubleFrameSides, setDoubleFrameSides] = useState({
    top: false,
    bottom: false,
    left: false,
    center: false,
    right: false,
    all: false,
  });
  const [doubleFrameCount, setDoubleFrameCount] = useState("");

  const lockBlockLeft = lockBlockPosition === "left" || lockBlockPosition === "both";
  const lockBlockRight = lockBlockPosition === "right" || lockBlockPosition === "both";

  const frameSelection = useFrameSelection(frameType, doorThickness, surfaceThickness, doorHeight);

  const currentFrame = useMemo(() => {
    if (!frameSelection.frames?.length)
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
    return frameSelection.frames.find((f) => f.code === selectedFrameCode) || frameSelection.frames[0];
  }, [frameSelection, selectedFrameCode]);

  useEffect(() => {
    if (frameSelection.frames?.length > 0) setSelectedFrameCode(frameSelection.frames[0].code);
  }, [frameSelection]);

  const numericDoubleCount = parseInt(doubleFrameCount) || 0;

  const results = useCalculations({
    doorThickness,
    doorWidth,
    doorHeight,
    surfaceThickness,
    currentFrame,
    lockBlockLeft,
    lockBlockRight,
    lockBlockPiecesPerSide,
    doubleFrameSides,
    doubleFrameCount: numericDoubleCount,
  });
  const cuttingPlan = useCuttingPlan(results, currentFrame);

  const isDataComplete = doorThickness && doorWidth && doorHeight;
  const piecesPerSide = parseInt(lockBlockPiecesPerSide) || 0;

  const doubleConfigSummary = useMemo(() => {
    const df = results.doubleFrame;
    if (!df?.hasAny || !df.count) return "";
    const sideLabels = {
      top: "บน",
      bottom: "ล่าง",
      left: "ซ้าย",
      center: "กลาง",
      right: "ขวา",
    };
    const sides = Object.entries(sideLabels)
      .filter(([key]) => df[key])
      .map(([_, label]) => label);
    return sides.length ? `เบิ้ลโครงด้าน ${sides.join(", ")} จำนวน ${df.count} ชั้น/ด้าน` : "";
  }, [results]);

  const handleToggleDoubleSide = (side) => {
    setDoubleFrameSides((prev) => {
      if (side === "all") {
        const newValue = !prev.all;
        return {
          top: newValue,
          bottom: newValue,
          left: newValue,
          center: newValue,
          right: newValue,
          all: newValue,
        };
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
                </div>
                <div className="col-span-2 p-2 bg-danger/10 rounded-xl">
                  <span className="block text-foreground/70">Lock Block:</span>
                  <span className="font-bold text-danger">
                    {results.lockBlockCount} ชิ้น ({lockBlockDesc})
                  </span>
                </div>
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

          {isDataComplete ? (
            <Card className="w-full">
              <CardHeader className="bg-primary text-white">
                <div className="flex items-center gap-2">
                  <Chip color="default" variant="solid" size="md">
                    6
                  </Chip>
                  <span className="font-semibold">✂️ แผนการตัดไม้ (Cutting Optimization)</span>
                </div>
              </CardHeader>
              <CardBody className="gap-2">
                {cuttingPlan.needSplice && (
                  <div className="p-2 bg-primary/10 rounded-xl">
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
                  <div className="px-3 py-2 text-xs font-semibold bg-default-100">
                    📋 รายการชิ้นส่วน (เผื่อรอยเลื่อย {cuttingPlan.sawKerf}
                    mm)
                  </div>
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
                              const colorMap = {
                                primary: "#4456E9",
                                secondary: "#FF8A00",
                                warning: "#FFB441",
                                danger: "#FF0076",
                                success: "#10B981",
                              };
                              return (
                                <React.Fragment key={pieceIdx}>
                                  <div
                                    className="absolute h-full flex items-center justify-center text-[8px] font-medium overflow-hidden text-white"
                                    style={{
                                      left: `${left}%`,
                                      width: `${width}%`,
                                      backgroundColor: colorMap[piece.color] || "#DCDCDC",
                                    }}
                                    title={`${piece.name}: ตัด ${pieceCut}mm (ใช้ ${piece.length}mm)`}
                                  >
                                    {width > 8 && <span className="truncate px-1">{pieceCut}</span>}
                                  </div>
                                  {pieceIdx < stock.pieces.length - 1 && (
                                    <div
                                      className="absolute h-full bg-default"
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
                              className="absolute right-0 h-full flex items-center justify-center text-[8px] bg-white text-foreground/70"
                              style={{
                                width: `${(stock.remaining / stock.length) * 100}%`,
                              }}
                            >
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
}
