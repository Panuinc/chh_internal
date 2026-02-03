"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { UIDoorBom } from "@/app/(pages)/production/_components/doorBom/UIDoorBom";

export const GLUE_THICKNESS = 1;
export const LOCK_BLOCK_HEIGHT = 400;
export const LOCK_BLOCK_POSITION = 1000;
export const CUT_ALLOWANCE = 10;

export const NO_RAIL_CORE_TYPES = ["foam", "particle_solid", "honeycomb"];

export const SURFACE_MATERIALS = [
  { value: "upvc", label: "UPVC" },
  { value: "wpc", label: "WPC" },
  { value: "laminate", label: "ลามิเนต" },
  { value: "plywood", label: "ไม้อัด" },
  { value: "melamine", label: "เมลามีน" },
];

export const FRAME_TYPES = [
  { value: "rubberwood", label: "ยางพารา" },
  { value: "sadao", label: "สะเดา" },
  { value: "lvl", label: "LVL" },
];

export const DOUBLE_FRAME_SIDES = [
  { key: "top", label: "บน" },
  { key: "bottom", label: "ล่าง" },
  { key: "left", label: "ซ้าย" },
  { key: "center", label: "กลาง" },
  { key: "right", label: "ขวา" },
  { key: "all", label: "ทั้งหมด" },
];

export const LOCK_BLOCK_PIECES_OPTIONS = [
  { value: "1", label: "1 ชิ้น" },
  { value: "2", label: "2 ชิ้น" },
  { value: "3", label: "3 ชิ้น" },
  { value: "4", label: "4 ชิ้น" },
];

export const LOCK_BLOCK_POSITIONS = [
  { value: "left", left: true, right: false, label: "ซ้าย" },
  { value: "right", left: false, right: true, label: "ขวา" },
  { value: "both", left: true, right: true, label: "ทั้งสอง" },
];

export const DOUBLE_FRAME_COUNT_OPTIONS = [
  { value: "0", label: "ไม่เบิ้ล" },
  { value: "1", label: "1 ชั้น" },
  { value: "2", label: "2 ชั้น" },
  { value: "3", label: "3 ชั้น" },
];

export const CORE_TYPES = [
  {
    value: "foam",
    label: "EPS Foam (โฟม)",
    type: "solid",
    thickness: null,
    spacing: null,
  },
  {
    value: "plywood_strips",
    label: "Plywood Strips (ไม้อัดซี่)",
    type: "strips",
    thickness: 4,
    spacing: 40,
  },
  {
    value: "particle_solid",
    label: "Particle Board (ปาติเกิ้ลตัน)",
    type: "solid",
    thickness: null,
    spacing: null,
  },
  {
    value: "rockwool",
    label: "Rockwool (ใยแก้ว)",
    type: "solid",
    thickness: null,
    spacing: null,
  },
  {
    value: "honeycomb",
    label: "Honeycomb (รังผึ้ง)",
    type: "solid",
    thickness: null,
    spacing: null,
  },
  {
    value: "particle_strips",
    label: "Particle Strips (ปาติเกิ้ลซี่)",
    type: "strips",
    thickness: 12,
    spacing: null,
  },
];

export const ERP_FRAMES = {
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

export const GRID_LETTERS = ["A", "B", "C", "D", "E", "F"];
export const GRID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const LAYER_CONFIG = {
  grid: {
    id: "grid",
    label: "Grid Reference",
    color: "#DCDCDC",
    defaultVisible: true,
  },
  title: {
    id: "title",
    label: "Title Block",
    color: "#4456E9",
    defaultVisible: true,
  },
  dimensions: {
    id: "dimensions",
    label: "Dimensions",
    color: "#000000",
    defaultVisible: true,
  },
  centerlines: {
    id: "centerlines",
    label: "Center Lines",
    color: "#666666",
    defaultVisible: true,
  },
  surface: {
    id: "surface",
    label: "Surface Material",
    color: "#10B981",
    defaultVisible: true,
  },
  frame: {
    id: "frame",
    label: "Frame (Stile)",
    color: "#FFB441",
    defaultVisible: true,
  },
  rails: {
    id: "rails",
    label: "Frame (Rail)",
    color: "#FF8A00",
    defaultVisible: true,
  },
  lockblock: {
    id: "lockblock",
    label: "Lock Block",
    color: "#FF0076",
    defaultVisible: true,
  },
  core: { id: "core", label: "Core", color: "#4456E9", defaultVisible: true },
  doubleframe: {
    id: "doubleframe",
    label: "Double Frame",
    color: "#FFB441",
    defaultVisible: true,
  },
};

export const formatDimension = (t, w, h, separator = "×") =>
  `${t || "-"}${separator}${w || "-"}${separator}${h || "-"}`;

export const getMaterialLabel = (materials, value) =>
  materials.find((m) => m.value === value)?.label || "-";

export const getEfficiencyColor = (efficiency) => {
  const val = parseFloat(String(efficiency)) || 0;
  if (val >= 80) return "success";
  if (val >= 60) return "warning";
  return "danger";
};

export const generateDXF = (results) => {
  if (!results) return "";
  const { W = 0, H = 0, F = 0, railPositions = [] } = results;

  let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;
  const offsetX = 100;
  const offsetY = 100;

  const addLine = (x1, y1, x2, y2) =>
    `0\nLINE\n8\n0\n10\n${x1}\n20\n${y1}\n30\n0\n11\n${x2}\n21\n${y2}\n31\n0\n`;

  dxf += addLine(offsetX, offsetY, offsetX + W, offsetY);
  dxf += addLine(offsetX + W, offsetY, offsetX + W, offsetY + H);
  dxf += addLine(offsetX + W, offsetY + H, offsetX, offsetY + H);
  dxf += addLine(offsetX, offsetY + H, offsetX, offsetY);

  dxf += addLine(offsetX + F, offsetY, offsetX + F, offsetY + H);
  dxf += addLine(offsetX + W - F, offsetY, offsetX + W - F, offsetY + H);
  dxf += addLine(offsetX + F, offsetY + F, offsetX + W - F, offsetY + F);
  dxf += addLine(
    offsetX + F,
    offsetY + H - F,
    offsetX + W - F,
    offsetY + H - F,
  );

  railPositions?.forEach((pos) => {
    const railY = offsetY + H - pos;
    dxf += addLine(offsetX + F, railY, offsetX + W - F, railY);
  });

  dxf += `0\nENDSEC\n0\nEOF`;
  return dxf;
};

export const useFrameSelection = (
  frameType,
  doorThickness,
  surfaceThickness,
  doorHeight,
) => {
  return useMemo(() => {
    const S = parseFloat(surfaceThickness) || 0;
    const requiredThickness = doorThickness
      ? parseFloat(doorThickness) - (S + GLUE_THICKNESS) * 2
      : 0;
    const requiredLength = doorHeight ? parseFloat(doorHeight) : 0;
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

export const useCalculations = (params) => {
  const {
    doorThickness,
    doorWidth,
    doorHeight,
    surfaceThickness,
    currentFrame,
    lockBlockLeft,
    lockBlockRight,
    lockBlockPiecesPerSide,
    doubleFrameSides,
    doubleFrameCount,
  } = params;

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
    const hasDoubleFrame =
      numericDoubleCount > 0 && Object.values(effectiveSides).some(Boolean);
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

    const doubleFrameLeftWidth = effectiveSides.left
      ? F * numericDoubleCount
      : 0;
    const doubleFrameRightWidth = effectiveSides.right
      ? F * numericDoubleCount
      : 0;

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
  }, [
    doorThickness,
    doorWidth,
    doorHeight,
    surfaceThickness,
    currentFrame,
    lockBlockLeft,
    lockBlockRight,
    lockBlockPiecesPerSide,
    doubleFrameSides,
    doubleFrameCount,
  ]);
};

export const useCuttingPlan = (results, currentFrame, coreType) => {
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

    const addPiece = (
      name,
      finishedLength,
      qty,
      color,
      isSplice = false,
      withAllowance = true,
    ) => {
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
          addPiece(
            "เบิ้ลโครงตั้งซ้าย (ท่อน 1)",
            pieceLength,
            count,
            "warning",
            true,
          );
          addPiece(
            "เบิ้ลโครงตั้งซ้าย (ท่อน 2)",
            pieceLength,
            count,
            "secondary",
            true,
          );
        } else {
          addPiece("เบิ้ลโครงตั้งซ้าย", clearHeight, count, "warning");
        }
      }

      if (doubleFrame.right) {
        if (needSplice && clearHeight > stockLength) {
          const pieceLength = Math.ceil(clearHeight / 2) + spliceOverlap / 2;
          addPiece(
            "เบิ้ลโครงตั้งขวา (ท่อน 1)",
            pieceLength,
            count,
            "warning",
            true,
          );
          addPiece(
            "เบิ้ลโครงตั้งขวา (ท่อน 2)",
            pieceLength,
            count,
            "secondary",
            true,
          );
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
    const skipRailCoreTypes = [...NO_RAIL_CORE_TYPES, "particle_strips"];
    if (railCount > 0 && !skipRailCoreTypes.includes(coreType)) {
      let damLength = clearWidth;
      if (doubleFrame?.hasAny && doubleFrame.count > 0) {
        if (doubleFrame.left) damLength -= F * doubleFrame.count;
        if (doubleFrame.right) damLength -= F * doubleFrame.count;
      }
      addPiece("ไม้ดาม", damLength, railCount, "primary");
    }

    if (lockBlockCount > 0) {
      addPiece(
        "Lock Block",
        LOCK_BLOCK_HEIGHT,
        lockBlockCount,
        "danger",
        false,
        false,
      );
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
    const efficiency = totalStock
      ? ((usedLength / totalStock) * 100).toFixed(1)
      : "0.0";
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
      usedLength,
      needSplice,
      spliceCount,
      spliceOverlap,
    };
  }, [results, currentFrame, coreType]);
};

export const useCoreCalculation = (results, coreType) => {
  return useMemo(() => {
    if (!results || !coreType) {
      return {
        coreType: null,
        pieces: [],
        damPieces: [],
        totalPieces: 0,
        columns: 0,
        rows: 0,
        stripThickness: 0,
        stripSpacing: 0,
        isSolid: true,
      };
    }

    const {
      W,
      H,
      F,
      railPositions,
      lockBlockLeft,
      lockBlockRight,
      lockBlockTop,
      lockBlockBottom,
      doubleFrame,
    } = results;
    const coreConfig = CORE_TYPES.find((c) => c.value === coreType);
    if (!coreConfig) {
      return {
        coreType: null,
        pieces: [],
        damPieces: [],
        totalPieces: 0,
        columns: 0,
        rows: 0,
        stripThickness: 0,
        stripSpacing: 0,
        isSolid: true,
      };
    }

    const leftOffset = F + (doubleFrame?.left ? F * doubleFrame.count : 0);
    const rightOffset = F + (doubleFrame?.right ? F * doubleFrame.count : 0);
    const topOffset = F + (doubleFrame?.top ? F * doubleFrame.count : 0);
    const bottomOffset = F + (doubleFrame?.bottom ? F * doubleFrame.count : 0);

    const coreWidth = W - leftOffset - rightOffset;
    const coreHeight = H - topOffset - bottomOffset;

    const hasLockBlock = lockBlockLeft || lockBlockRight;
    const lockBlockZoneStart = hasLockBlock ? lockBlockTop : null;
    const lockBlockZoneEnd = hasLockBlock ? lockBlockBottom : null;

    if (coreConfig.type === "solid") {
      const solidLockBlockSides =
        (lockBlockLeft ? 1 : 0) + (lockBlockRight ? 1 : 0);
      const solidLockBlockCount = results.lockBlockCount || 0;
      const solidPiecesPerSide =
        solidLockBlockSides > 0
          ? Math.max(1, Math.ceil(solidLockBlockCount / solidLockBlockSides))
          : 0;
      const solidLockBlockWidth = F * solidPiecesPerSide;

      const isFullPanelCore = NO_RAIL_CORE_TYPES.includes(coreType);

      let rows = [];

      if (isFullPanelCore) {
        rows = [
          { top: topOffset, bottom: H - bottomOffset, height: coreHeight },
        ];
      } else {
        const rowBoundaries = [topOffset];
        if (railPositions && railPositions.length > 0) {
          railPositions.forEach((pos) => {
            rowBoundaries.push(H - pos - F / 2);
            rowBoundaries.push(H - pos + F / 2);
          });
        }
        rowBoundaries.push(H - bottomOffset);
        rowBoundaries.sort((a, b) => a - b);

        for (let i = 0; i < rowBoundaries.length - 1; i += 2) {
          const rowTop = rowBoundaries[i];
          const rowBottom = rowBoundaries[i + 1];
          if (rowBottom > rowTop)
            rows.push({
              top: rowTop,
              bottom: rowBottom,
              height: rowBottom - rowTop,
            });
        }
      }

      const pieces = [];

      if (isFullPanelCore && hasLockBlock) {
        const lockBlockYTop = H - lockBlockZoneEnd;
        const lockBlockYBottom = H - lockBlockZoneStart;

        if (lockBlockYTop > topOffset) {
          pieces.push({
            name: "ไส้ส่วนบน",
            x: leftOffset,
            y: topOffset,
            width: coreWidth,
            height: lockBlockYTop - topOffset,
          });
        }

        const middleHeight = lockBlockYBottom - lockBlockYTop;
        if (middleHeight > 0) {
          if (lockBlockLeft && lockBlockRight) {
            const middleWidth = coreWidth - solidLockBlockWidth * 2;
            if (middleWidth > 0) {
              pieces.push({
                name: "ไส้ส่วนกลาง",
                x: leftOffset + solidLockBlockWidth,
                y: lockBlockYTop,
                width: middleWidth,
                height: middleHeight,
              });
            }
          } else if (lockBlockLeft) {
            pieces.push({
              name: "ไส้ส่วนกลาง",
              x: leftOffset + solidLockBlockWidth,
              y: lockBlockYTop,
              width: coreWidth - solidLockBlockWidth,
              height: middleHeight,
            });
          } else if (lockBlockRight) {
            pieces.push({
              name: "ไส้ส่วนกลาง",
              x: leftOffset,
              y: lockBlockYTop,
              width: coreWidth - solidLockBlockWidth,
              height: middleHeight,
            });
          }
        }

        if (lockBlockYBottom < H - bottomOffset) {
          pieces.push({
            name: "ไส้ส่วนล่าง",
            x: leftOffset,
            y: lockBlockYBottom,
            width: coreWidth,
            height: H - bottomOffset - lockBlockYBottom,
          });
        }
      } else if (isFullPanelCore && !hasLockBlock) {
        pieces.push({
          name: "ไส้เต็มบาน",
          x: leftOffset,
          y: topOffset,
          width: coreWidth,
          height: coreHeight,
        });
      } else {
        rows.forEach((row, rowIdx) => {
          const rowTopFromBottom = H - row.bottom;
          const rowBottomFromBottom = H - row.top;

          if (
            hasLockBlock &&
            lockBlockZoneStart < rowBottomFromBottom &&
            lockBlockZoneEnd > rowTopFromBottom
          ) {
            if (lockBlockLeft && lockBlockRight) {
              pieces.push({
                name: `ไส้แถว ${rowIdx + 1} (ซ้าย)`,
                x: leftOffset + solidLockBlockWidth,
                y: row.top,
                width: (coreWidth - solidLockBlockWidth * 2) / 2,
                height: row.height,
              });
              pieces.push({
                name: `ไส้แถว ${rowIdx + 1} (ขวา)`,
                x:
                  W -
                  rightOffset -
                  solidLockBlockWidth -
                  (coreWidth - solidLockBlockWidth * 2) / 2,
                y: row.top,
                width: (coreWidth - solidLockBlockWidth * 2) / 2,
                height: row.height,
              });
            } else if (lockBlockLeft) {
              pieces.push({
                name: `ไส้แถว ${rowIdx + 1}`,
                x: leftOffset + solidLockBlockWidth,
                y: row.top,
                width: coreWidth - solidLockBlockWidth,
                height: row.height,
              });
            } else if (lockBlockRight) {
              pieces.push({
                name: `ไส้แถว ${rowIdx + 1}`,
                x: leftOffset,
                y: row.top,
                width: coreWidth - solidLockBlockWidth,
                height: row.height,
              });
            }
          } else {
            pieces.push({
              name: `ไส้แถว ${rowIdx + 1}`,
              x: leftOffset,
              y: row.top,
              width: coreWidth,
              height: row.height,
            });
          }
        });
      }

      return {
        coreType: coreConfig,
        pieces,
        damPieces: [],
        totalPieces: pieces.length,
        columns: 1,
        rows: isFullPanelCore ? 1 : rows.length,
        stripThickness: 0,
        stripSpacing: 0,
        isSolid: true,
        isFullPanelCore,
        coreWidth,
        coreHeight,
        leftOffset,
        rightOffset,
        topOffset,
        bottomOffset,
      };
    }

    const stripThickness = coreConfig.thickness || 4;
    const edgePadding = 40;
    const stripAreaWidth = coreWidth - edgePadding * 2;
    const stripStartX = leftOffset + edgePadding;

    let columnCount;
    let actualSpacing;

    if (coreConfig.value === "particle_strips") {
      columnCount = Math.round(W / 100) + 1;
      actualSpacing =
        (stripAreaWidth - columnCount * stripThickness) /
        (columnCount - 1 || 1);
    } else {
      const stripSpacing = coreConfig.spacing || 40;
      columnCount =
        Math.floor(stripAreaWidth / (stripThickness + stripSpacing)) + 1;
      actualSpacing =
        (stripAreaWidth - columnCount * stripThickness) /
        (columnCount - 1 || 1);
    }

    const rows =
      coreConfig.value === "particle_strips"
        ? [{ top: topOffset, bottom: H - bottomOffset, height: coreHeight }]
        : (() => {
            const rowBoundaries = [topOffset];
            if (railPositions && railPositions.length > 0) {
              railPositions.forEach((pos) => {
                rowBoundaries.push(H - pos - F / 2);
                rowBoundaries.push(H - pos + F / 2);
              });
            }
            rowBoundaries.push(H - bottomOffset);
            rowBoundaries.sort((a, b) => a - b);

            const out = [];
            for (let i = 0; i < rowBoundaries.length - 1; i += 2) {
              const rowTop = rowBoundaries[i];
              const rowBottom = rowBoundaries[i + 1];
              if (rowBottom > rowTop)
                out.push({
                  top: rowTop,
                  bottom: rowBottom,
                  height: rowBottom - rowTop,
                });
            }
            return out;
          })();

    const lockBlockSides = (lockBlockLeft ? 1 : 0) + (lockBlockRight ? 1 : 0);
    const lockBlockCount = results.lockBlockCount || 0;
    const piecesPerSide =
      lockBlockSides > 0
        ? Math.max(1, Math.ceil(lockBlockCount / lockBlockSides))
        : 0;

    const lockBlockWidth = F * piecesPerSide;
    const lockBlockLeftStart = lockBlockLeft ? leftOffset : null;
    const lockBlockLeftEnd = lockBlockLeft ? leftOffset + lockBlockWidth : null;
    const lockBlockRightStart = lockBlockRight
      ? W - rightOffset - lockBlockWidth
      : null;
    const lockBlockRightEnd = lockBlockRight ? W - rightOffset : null;

    const lockBlockYTop = H - (lockBlockZoneEnd ?? 0);
    const lockBlockYBottom = H - (lockBlockZoneStart ?? 0);

    const pieces = [];
    let pieceId = 0;

    for (let col = 0; col < columnCount; col++) {
      const stripX = stripStartX + col * (stripThickness + actualSpacing);
      const stripXEnd = stripX + stripThickness;

      const overlapsLeftLockBlock =
        lockBlockLeft &&
        lockBlockLeftStart !== null &&
        lockBlockLeftEnd !== null &&
        stripXEnd > lockBlockLeftStart &&
        stripX < lockBlockLeftEnd;
      const overlapsRightLockBlock =
        lockBlockRight &&
        lockBlockRightStart !== null &&
        lockBlockRightEnd !== null &&
        stripXEnd > lockBlockRightStart &&
        stripX < lockBlockRightEnd;
      const overlapsAnyLockBlockX =
        overlapsLeftLockBlock || overlapsRightLockBlock;

      rows.forEach((row, rowIdx) => {
        const rowOverlapsLockBlockY =
          hasLockBlock &&
          row.top < lockBlockYBottom &&
          row.bottom > lockBlockYTop;
        const stripHitsLockBlock =
          overlapsAnyLockBlockX && rowOverlapsLockBlockY;

        if (stripHitsLockBlock) {
          if (lockBlockYTop > row.top) {
            const pieceHeight = lockBlockYTop - row.top;
            if (pieceHeight > 5)
              pieces.push({
                id: pieceId++,
                col,
                row: rowIdx,
                x: stripX,
                y: row.top,
                width: stripThickness,
                height: pieceHeight,
                name: `ซี่ C${col + 1}-R${rowIdx + 1}a`,
              });
          }
          if (lockBlockYBottom < row.bottom) {
            const pieceHeight = row.bottom - lockBlockYBottom;
            if (pieceHeight > 5)
              pieces.push({
                id: pieceId++,
                col,
                row: rowIdx,
                x: stripX,
                y: lockBlockYBottom,
                width: stripThickness,
                height: pieceHeight,
                name: `ซี่ C${col + 1}-R${rowIdx + 1}b`,
              });
          }
        } else {
          pieces.push({
            id: pieceId++,
            col,
            row: rowIdx,
            x: stripX,
            y: row.top,
            width: stripThickness,
            height: row.height,
            name: `ซี่ C${col + 1}-R${rowIdx + 1}`,
          });
        }
      });
    }

    const damPieces =
      coreConfig.value === "particle_strips" && railPositions?.length
        ? railPositions.map((pos, idx) => {
            const yCenter = H - pos;
            return {
              id: `dam-${idx}`,
              x: leftOffset,
              y: yCenter - stripThickness / 2,
              width: coreWidth,
              height: stripThickness,
              name: `ไม้ดามปาติเกิ้ล ${idx + 1}`,
            };
          })
        : [];

    return {
      coreType: coreConfig,
      pieces,
      damPieces,
      totalPieces: pieces.length + damPieces.length,
      columns: columnCount,
      rows: rows.length,
      stripThickness,
      stripSpacing: Math.round(actualSpacing),
      isSolid: false,
      coreWidth,
      coreHeight,
      leftOffset,
      rightOffset,
      topOffset,
      bottomOffset,
      rowBoundaries: rows,
      edgePadding,
    };
  }, [results, coreType]);
};

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
  const [coreType, setCoreType] = useState("");

  const lockBlockLeft =
    lockBlockPosition === "left" || lockBlockPosition === "both";
  const lockBlockRight =
    lockBlockPosition === "right" || lockBlockPosition === "both";

  const frameSelection = useFrameSelection(
    frameType,
    doorThickness,
    surfaceThickness,
    doorHeight,
  );

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
    return (
      frameSelection.frames.find((f) => f.code === selectedFrameCode) ||
      frameSelection.frames[0]
    );
  }, [frameSelection, selectedFrameCode]);

  useEffect(() => {
    if (frameSelection.frames?.length > 0)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFrameCode(frameSelection.frames[0].code);
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

  const cuttingPlan = useCuttingPlan(results, currentFrame, coreType);
  const coreCalculation = useCoreCalculation(results, coreType);

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
    return sides.length
      ? `เบิ้ลโครงด้าน ${sides.join(", ")} จำนวน ${df.count} ชั้น/ด้าน`
      : "";
  }, [results]);

  const handleToggleDoubleSide = useCallback((side) => {
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
  }, []);

  const lockBlockDesc =
    lockBlockLeft && lockBlockRight
      ? `ซ้าย ${piecesPerSide} + ขวา ${piecesPerSide}`
      : lockBlockLeft
        ? `ซ้าย ${piecesPerSide}`
        : lockBlockRight
          ? `ขวา ${piecesPerSide}`
          : "-";

  const uiProps = {
    formRef,
    doorThickness,
    setDoorThickness,
    doorWidth,
    setDoorWidth,
    doorHeight,
    setDoorHeight,
    surfaceMaterial,
    setSurfaceMaterial,
    surfaceThickness,
    setSurfaceThickness,
    frameType,
    setFrameType,
    selectedFrameCode,
    setSelectedFrameCode,
    lockBlockPosition,
    setLockBlockPosition,
    lockBlockPiecesPerSide,
    setLockBlockPiecesPerSide,
    doubleFrameSides,
    doubleFrameCount,
    setDoubleFrameCount,
    coreType,
    setCoreType,
    lockBlockLeft,
    lockBlockRight,
    frameSelection,
    currentFrame,
    results,
    cuttingPlan,
    coreCalculation,
    isDataComplete,
    piecesPerSide,
    doubleConfigSummary,
    handleToggleDoubleSide,
    lockBlockDesc,
  };

  return <UIDoorBom {...uiProps} />;
}
