"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";

// Uncontrolled number input - ไม่ re-render ขณะพิมพ์
const NumberInput = ({ value, onChange, className, step = 1 }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleBlur = (e) => {
    const newVal = parseFloat(e.target.value) || 0;
    onChange(newVal);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

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

export default function DoorConfigurator() {
  // ===== 1. สเปคจากลูกค้า =====
  const [doorThickness, setDoorThickness] = useState("");
  const [doorWidth, setDoorWidth] = useState("");
  const [doorHeight, setDoorHeight] = useState("");

  // ===== Modal State =====
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);

  // ===== 2. วัสดุปิดผิว =====
  const [surfaceMaterial, setSurfaceMaterial] = useState("melamine");
  const [surfaceThickness, setSurfaceThickness] = useState(4);
  const GLUE_THICKNESS = 1;

  // ===== 3. โครง (Frame) - ตาม ERP =====
  const [frameType, setFrameType] = useState("rubberwood");
  const [selectedFrameCode, setSelectedFrameCode] = useState("");
  const [hasDoubleFrame, setHasDoubleFrame] = useState(false);

  // ===== 4. Lock Block =====
  const [lockBlockLeft, setLockBlockLeft] = useState(true);
  const [lockBlockRight, setLockBlockRight] = useState(true);
  const [lockBlockPiecesPerSide, setLockBlockPiecesPerSide] = useState(2);

  const LOCK_BLOCK_HEIGHT = 400;
  const LOCK_BLOCK_POSITION = 1000;

  // ===== ERP Frame Data =====
  const erpFrames = {
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

  // Frame selection logic
  const frameSelection = useMemo(() => {
    const requiredThickness =
      doorThickness - (surfaceThickness + GLUE_THICKNESS) * 2;
    const requiredLength = doorHeight;
    const frames = erpFrames[frameType] || [];

    const filterAndSort = (frameList) => {
      return frameList
        .filter((f) => f.length >= requiredLength)
        .sort((a, b) => a.length - b.length);
    };

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

    const exactMatch = filterAndSort(
      frames.filter((f) => f.thickness === requiredThickness),
    );
    if (exactMatch.length > 0) {
      return {
        frames: exactMatch.map((f) => ({
          ...f,
          useThickness: f.thickness,
          useWidth: f.width,
          isFlipped: false,
          planeAmount: 0,
          needSplice: false,
          displaySize: `${f.thickness}×${f.width}×${f.length}`,
        })),
        needFlip: false,
        needPlane: false,
        needSplice: false,
      };
    }

    const flipExact = filterAndSort(
      frames.filter((f) => f.width === requiredThickness),
    );
    if (flipExact.length > 0) {
      return {
        frames: flipExact.map((f) => ({
          ...f,
          useThickness: f.width,
          useWidth: f.thickness,
          isFlipped: true,
          planeAmount: 0,
          needSplice: false,
          displaySize: `${f.width}×${f.thickness}×${f.length} (พลิก)`,
        })),
        needFlip: true,
        needPlane: false,
        needSplice: false,
      };
    }

    const thickerFrames = frames
      .filter(
        (f) => f.thickness > requiredThickness && f.length >= requiredLength,
      )
      .sort((a, b) => {
        if (a.thickness !== b.thickness) return a.thickness - b.thickness;
        return a.length - b.length;
      });
    if (thickerFrames.length > 0) {
      return {
        frames: thickerFrames.map((f) => ({
          ...f,
          useThickness: requiredThickness,
          useWidth: f.width,
          isFlipped: false,
          planeAmount: f.thickness - requiredThickness,
          needSplice: false,
          displaySize: `${f.thickness}×${f.width}×${f.length} (ไส ${f.thickness - requiredThickness}mm)`,
        })),
        needFlip: false,
        needPlane: true,
        needSplice: false,
      };
    }

    const flipAndPlane = frames
      .filter((f) => f.width > requiredThickness && f.length >= requiredLength)
      .sort((a, b) => {
        if (a.width !== b.width) return a.width - b.width;
        return a.length - b.length;
      });
    if (flipAndPlane.length > 0) {
      return {
        frames: flipAndPlane.map((f) => ({
          ...f,
          useThickness: requiredThickness,
          useWidth: f.thickness,
          isFlipped: true,
          planeAmount: f.width - requiredThickness,
          needSplice: false,
          displaySize: `${f.width}×${f.thickness}×${f.length} (พลิก+ไส ${f.width - requiredThickness}mm)`,
        })),
        needFlip: true,
        needPlane: true,
        needSplice: false,
      };
    }

    const exactForSplice = frames.filter(
      (f) => f.thickness === requiredThickness,
    );
    const spliceExact = findSpliceable(exactForSplice);
    if (spliceExact) {
      const f = spliceExact.frame;
      return {
        frames: [
          {
            ...f,
            useThickness: f.thickness,
            useWidth: f.width,
            isFlipped: false,
            planeAmount: 0,
            needSplice: true,
            spliceCount: spliceExact.spliceCount,
            spliceOverlap: spliceExact.spliceOverlap,
            splicePosition: spliceExact.splicePosition,
            effectiveLength: spliceExact.effectiveLength,
            displaySize: `${f.thickness}×${f.width}×${f.length} (ต่อ 2 ท่อน)`,
          },
        ],
        needFlip: false,
        needPlane: false,
        needSplice: true,
      };
    }

    const flipForSplice = frames.filter((f) => f.width === requiredThickness);
    const spliceFlip = findSpliceable(flipForSplice);
    if (spliceFlip) {
      const f = spliceFlip.frame;
      return {
        frames: [
          {
            ...f,
            useThickness: f.width,
            useWidth: f.thickness,
            isFlipped: true,
            planeAmount: 0,
            needSplice: true,
            spliceCount: spliceFlip.spliceCount,
            spliceOverlap: spliceFlip.spliceOverlap,
            splicePosition: spliceFlip.splicePosition,
            effectiveLength: spliceFlip.effectiveLength,
            displaySize: `${f.width}×${f.thickness}×${f.length} (พลิก+ต่อ 2 ท่อน)`,
          },
        ],
        needFlip: true,
        needPlane: false,
        needSplice: true,
      };
    }

    const thickForSplice = frames.filter(
      (f) => f.thickness > requiredThickness,
    );
    const spliceThick = findSpliceable(thickForSplice);
    if (spliceThick) {
      const f = spliceThick.frame;
      return {
        frames: [
          {
            ...f,
            useThickness: requiredThickness,
            useWidth: f.width,
            isFlipped: false,
            planeAmount: f.thickness - requiredThickness,
            needSplice: true,
            spliceCount: spliceThick.spliceCount,
            spliceOverlap: spliceThick.spliceOverlap,
            splicePosition: spliceThick.splicePosition,
            effectiveLength: spliceThick.effectiveLength,
            displaySize: `${f.thickness}×${f.width}×${f.length} (ไส+ต่อ 2 ท่อน)`,
          },
        ],
        needFlip: false,
        needPlane: true,
        needSplice: true,
      };
    }

    const flipPlaneForSplice = frames.filter(
      (f) => f.width > requiredThickness,
    );
    const spliceFlipPlane = findSpliceable(flipPlaneForSplice);
    if (spliceFlipPlane) {
      const f = spliceFlipPlane.frame;
      return {
        frames: [
          {
            ...f,
            useThickness: requiredThickness,
            useWidth: f.thickness,
            isFlipped: true,
            planeAmount: f.width - requiredThickness,
            needSplice: true,
            spliceCount: spliceFlipPlane.spliceCount,
            spliceOverlap: spliceFlipPlane.spliceOverlap,
            splicePosition: spliceFlipPlane.splicePosition,
            effectiveLength: spliceFlipPlane.effectiveLength,
            displaySize: `${f.width}×${f.thickness}×${f.length} (พลิก+ไส+ต่อ 2 ท่อน)`,
          },
        ],
        needFlip: true,
        needPlane: true,
        needSplice: true,
      };
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

  const currentFrame = useMemo(() => {
    if (frameSelection.frames.length === 0) {
      return {
        thickness: 27,
        width: 50,
        length: 2000,
        useThickness: 27,
        useWidth: 50,
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

  React.useEffect(() => {
    if (frameSelection.frames.length > 0) {
      setSelectedFrameCode(frameSelection.frames[0].code);
    }
  }, [frameSelection]);

  // ===== Calculations =====
  const results = useMemo(() => {
    const T = parseFloat(doorThickness) || 0;
    const W = parseFloat(doorWidth) || 0;
    const H = parseFloat(doorHeight) || 0;
    const S = parseFloat(surfaceThickness) || 0;

    const totalSurfaceThickness = (S + GLUE_THICKNESS) * 2;
    const frameThickness = T - totalSurfaceThickness;
    const F = currentFrame.useWidth;
    const R = currentFrame.useThickness;

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

    for (let i = 1; i < railSections; i++) {
      const eqPosition = Math.round((H * i) / railSections);
      railPositionsOriginal.push(eqPosition);

      const railTop = eqPosition + railThickness / 2;
      const railBottom = eqPosition - railThickness / 2;

      const hasLockBlock = lockBlockLeft || lockBlockRight;
      const hitLockBlock =
        hasLockBlock &&
        railBottom <= avoidZoneBottom &&
        railTop >= avoidZoneTop;

      if (hitLockBlock) {
        const distToTop = eqPosition - avoidZoneTop;
        const distToBottom = avoidZoneBottom - eqPosition;

        if (distToTop <= distToBottom) {
          railPositions.push(avoidZoneTop - railThickness / 2);
        } else {
          railPositions.push(avoidZoneBottom + railThickness / 2);
        }
      } else {
        railPositions.push(eqPosition);
      }
    }

    const lockBlockTop = LOCK_BLOCK_POSITION - LOCK_BLOCK_HEIGHT / 2;
    const lockBlockBottom = LOCK_BLOCK_POSITION + LOCK_BLOCK_HEIGHT / 2;
    const lockBlockWidth = F;
    const lockBlockSides = (lockBlockLeft ? 1 : 0) + (lockBlockRight ? 1 : 0);
    const lockBlockCount = lockBlockSides * lockBlockPiecesPerSide;

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
      lockBlockWidth,
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

  // ===== Cutting Optimization =====
  const cuttingPlan = useMemo(() => {
    const { W, H, F, DF, totalFrameWidth, railSections, lockBlockCount } =
      results;
    const stockLength = currentFrame.length || 2040;
    const sawKerf = 3;
    const needSplice = currentFrame.needSplice || false;
    const spliceOverlap = currentFrame.spliceOverlap || 100;

    const cutPieces = [];

    const stileLength = H;
    if (needSplice && stileLength > stockLength) {
      const piece1Length = Math.ceil(stileLength / 2) + spliceOverlap / 2;
      const piece2Length = Math.ceil(stileLength / 2) + spliceOverlap / 2;
      cutPieces.push({
        name: "โครงตั้ง (ท่อน 1)",
        length: piece1Length,
        qty: 2,
        color: "#8d6e63",
        isSplice: true,
      });
      cutPieces.push({
        name: "โครงตั้ง (ท่อน 2)",
        length: piece2Length,
        qty: 2,
        color: "#6d4c41",
        isSplice: true,
      });
    } else {
      cutPieces.push({
        name: "โครงตั้ง",
        length: stileLength,
        qty: 2,
        color: "#8d6e63",
      });
    }

    const railLength = W - 2 * F;
    cutPieces.push({
      name: "โครงนอน",
      length: railLength,
      qty: 2,
      color: "#a1887f",
    });

    if (hasDoubleFrame) {
      const doubleStileLength = H - 2 * F;
      if (needSplice && doubleStileLength > stockLength) {
        const piece1Length =
          Math.ceil(doubleStileLength / 2) + spliceOverlap / 2;
        const piece2Length =
          Math.ceil(doubleStileLength / 2) + spliceOverlap / 2;
        cutPieces.push({
          name: "เบิ้ลโครงตั้ง (ท่อน 1)",
          length: piece1Length,
          qty: 2,
          color: "#ff8f00",
          isSplice: true,
        });
        cutPieces.push({
          name: "เบิ้ลโครงตั้ง (ท่อน 2)",
          length: piece2Length,
          qty: 2,
          color: "#e65100",
          isSplice: true,
        });
      } else {
        cutPieces.push({
          name: "เบิ้ลโครงตั้ง",
          length: doubleStileLength,
          qty: 2,
          color: "#ff8f00",
        });
      }

      const doubleRailLength = W - 2 * totalFrameWidth;
      cutPieces.push({
        name: "เบิ้ลโครงนอน",
        length: doubleRailLength,
        qty: 2,
        color: "#ffb74d",
      });
    }

    const horizontalRailLength = W - 2 * totalFrameWidth;
    const railCount = railSections - 1;
    if (railCount > 0) {
      cutPieces.push({
        name: "ไม้ดาม",
        length: horizontalRailLength,
        qty: railCount,
        color: "#a67c52",
      });
    }

    if (lockBlockCount > 0) {
      cutPieces.push({
        name: "Lock Block",
        length: LOCK_BLOCK_HEIGHT,
        qty: lockBlockCount,
        color: "#c62828",
      });
    }

    const allPieces = [];
    cutPieces.forEach((piece) => {
      for (let i = 0; i < piece.qty; i++) {
        allPieces.push({ ...piece, id: `${piece.name}-${i + 1}` });
      }
    });

    allPieces.sort((a, b) => b.length - a.length);

    const stocks = [];

    allPieces.forEach((piece) => {
      const pieceWithKerf = piece.length + sawKerf;

      let placed = false;
      for (let stock of stocks) {
        if (stock.remaining >= pieceWithKerf) {
          stock.pieces.push(piece);
          stock.remaining -= pieceWithKerf;
          stock.used += pieceWithKerf;
          placed = true;
          break;
        }
      }

      if (!placed) {
        stocks.push({
          length: stockLength,
          pieces: [piece],
          remaining: stockLength - pieceWithKerf,
          used: pieceWithKerf,
        });
      }
    });

    const totalStocks = stocks.length;
    const totalUsed = stocks.reduce((sum, s) => sum + s.used, 0);
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
      totalUsed,
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
  }, [results, currentFrame, hasDoubleFrame, LOCK_BLOCK_HEIGHT]);

  // ===== NEW Engineering Drawing Component - Layout ตาม PDF =====
  // 1. บนซ้าย - Isometric View
  // 2. บนขวา - Top View
  // 3. ล่างซ้าย - Back View
  // 4. กลางล่าง - Side View
  // 5. ขวาล่าง - Front View
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
    const viewBoxHeight = 970; // เพิ่มความสูงเพื่อรองรับ professional bottom bar

    // Dimension Line Component - ปรับปรุงให้ชัดเจนขึ้น
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

      if (vertical) {
        const lineX = x1 + offset;
        const midY = (y1 + y2) / 2;
        const textWidth = String(displayValue).length * 4 + 8;
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
      } else {
        const lineY = y1 + offset;
        const midX = (x1 + x2) / 2;
        const textWidth = String(displayValue).length * 4 + 8;
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
      }
    };

    // Scales for each view - adjusted for new layout
    const frontScale = 200 / safeH;
    const sideScale = 200 / safeH;
    const topScaleW = 0.15;
    const topScaleT = 2.5;
    const backScale = 200 / safeH;

    // Calculate dimensions for each view
    // Front View
    const fW = safeW * frontScale;
    const fH = safeH * frontScale;
    const fF = safeF * frontScale;
    const fDF = DF * frontScale;
    const fTotalFrame = totalFrameWidth * frontScale;
    const fR = Math.max(safeR * frontScale, 2);
    const fLockBlockW = safeF * frontScale;

    // Side View
    const sT = Math.max(safeT * sideScale * 4, 25);
    const sH = safeH * sideScale;
    const sS = Math.max(safeS * sideScale * 4, 3);

    // Top View
    const tW = safeW * topScaleW;
    const tT = Math.max(safeT * topScaleT, 30);
    const tF = safeF * topScaleW;
    const tS = Math.max(safeS * topScaleT, 2);

    // Back View
    const bW = safeW * backScale;
    const bH = safeH * backScale;
    const bF = safeF * backScale;

    // Positions - CENTERED LAYOUT
    // Row 1: Isometric (left-center), Top (right-center)
    // Row 2: Back (left), Side (center), Front (right)

    const topRowY = 80;
    const bottomRowY = 370;

    // Center the views better
    const isoX = 150;
    const isoY = topRowY;

    const topViewX = 600;
    const topViewY = topRowY + 50;

    const backViewX = 120;
    const backViewY = bottomRowY;

    const sideViewX = 480;
    const sideViewY = bottomRowY;

    const frontViewX = 750;
    const frontViewY = bottomRowY;

    return (
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto bg-white"
      >
        {/* Border frame */}
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
            <text
              key={`grid-${num}`}
              x={80 + i * 140}
              y="40"
              textAnchor="middle"
            >
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

        {/* ==================== 1. ISOMETRIC VIEW (บนซ้าย) ==================== */}
        <g id="isometric-view">
          <text
            x={isoX + 80}
            y={isoY - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
          >
            Isometric View
          </text>

          {(() => {
            const isoScale = 0.08;
            const iW = safeW * isoScale;
            const iH = safeH * isoScale;
            const iT = safeT * isoScale * 2.5;
            const angle = Math.PI / 6;
            const dx = iT * Math.cos(angle);
            const dy = iT * Math.sin(angle);
            const iF = safeF * isoScale;
            const iS = safeS * isoScale * 2.5;

            return (
              <g transform={`translate(${isoX}, ${isoY + 20})`}>
                {/* Front face - main door panel */}
                <polygon
                  points={`0,0 ${iW},0 ${iW},${iH} 0,${iH}`}
                  fill="#f5f5f5"
                  stroke="#000"
                  strokeWidth="1"
                />

                {/* Top face */}
                <polygon
                  points={`0,0 ${dx},${-dy} ${iW + dx},${-dy} ${iW},0`}
                  fill="#e0e0e0"
                  stroke="#000"
                  strokeWidth="1"
                />

                {/* Side face (right) */}
                <polygon
                  points={`${iW},0 ${iW + dx},${-dy} ${iW + dx},${iH - dy} ${iW},${iH}`}
                  fill="#d0d0d0"
                  stroke="#000"
                  strokeWidth="1"
                />

                {/* Frame outline on front face */}
                <rect
                  x={0}
                  y={0}
                  width={iF}
                  height={iH}
                  fill="none"
                  stroke="#000"
                  strokeWidth="0.5"
                />
                <rect
                  x={iW - iF}
                  y={0}
                  width={iF}
                  height={iH}
                  fill="none"
                  stroke="#000"
                  strokeWidth="0.5"
                />
                <rect
                  x={iF}
                  y={0}
                  width={iW - 2 * iF}
                  height={iF}
                  fill="none"
                  stroke="#000"
                  strokeWidth="0.5"
                />
                <rect
                  x={iF}
                  y={iH - iF}
                  width={iW - 2 * iF}
                  height={iF}
                  fill="none"
                  stroke="#000"
                  strokeWidth="0.5"
                />

                {/* Rails on front */}
                {railPositions.map((pos, idx) => {
                  const railY = iH - pos * isoScale;
                  return (
                    <line
                      key={`iso-rail-${idx}`}
                      x1={iF}
                      y1={railY}
                      x2={iW - iF}
                      y2={railY}
                      stroke="#000"
                      strokeWidth="0.4"
                    />
                  );
                })}

                {/* Lock block on front - left */}
                {lockBlockLeft && (
                  <rect
                    x={iF}
                    y={iH - lockBlockBottom * isoScale}
                    width={iF * lockBlockPiecesPerSide}
                    height={LOCK_BLOCK_HEIGHT * isoScale}
                    fill="#ffcdd2"
                    stroke="#c62828"
                    strokeWidth="0.6"
                  />
                )}

                {/* Lock block on front - right */}
                {lockBlockRight && (
                  <rect
                    x={iW - iF - iF * lockBlockPiecesPerSide}
                    y={iH - lockBlockBottom * isoScale}
                    width={iF * lockBlockPiecesPerSide}
                    height={LOCK_BLOCK_HEIGHT * isoScale}
                    fill="#ffcdd2"
                    stroke="#c62828"
                    strokeWidth="0.6"
                  />
                )}

                {/* Hidden edges (dashed) */}
                <line
                  x1={0}
                  y1={0}
                  x2={dx}
                  y2={-dy}
                  stroke="#000"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                />
                <line
                  x1={dx}
                  y1={-dy}
                  x2={dx}
                  y2={iH - dy}
                  stroke="#000"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                />
                <line
                  x1={0}
                  y1={iH}
                  x2={dx}
                  y2={iH - dy}
                  stroke="#000"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                />

                {/* Surface layer indication on top */}
                <line
                  x1={iS}
                  y1={0}
                  x2={dx + iS}
                  y2={-dy}
                  stroke="#666"
                  strokeWidth="0.3"
                />
                <line
                  x1={iW - iS}
                  y1={0}
                  x2={iW + dx - iS}
                  y2={-dy}
                  stroke="#666"
                  strokeWidth="0.3"
                />
              </g>
            );
          })()}
        </g>

        {/* ==================== 2. TOP VIEW (บนขวา) ==================== */}
        <g id="top-view">
          <text
            x={topViewX + tW / 2}
            y={topViewY - 25}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
          >
            Top View
          </text>

          {/* Main outline */}
          <rect
            x={topViewX}
            y={topViewY}
            width={tW}
            height={tT}
            fill="#f5f5f5"
            stroke="#000"
            strokeWidth="1.5"
          />

          {/* Surface layers (top & bottom) */}
          <rect
            x={topViewX}
            y={topViewY}
            width={tW}
            height={tS}
            fill="#e8f5e9"
            stroke="#000"
            strokeWidth="0.5"
          />
          <rect
            x={topViewX}
            y={topViewY + tT - tS}
            width={tW}
            height={tS}
            fill="#e8f5e9"
            stroke="#000"
            strokeWidth="0.5"
          />

          {/* Frame sides */}
          <rect
            x={topViewX}
            y={topViewY + tS}
            width={tF}
            height={tT - 2 * tS}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.5"
          />
          <rect
            x={topViewX + tW - tF}
            y={topViewY + tS}
            width={tF}
            height={tT - 2 * tS}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.5"
          />

          {/* Inner frame rails */}
          <rect
            x={topViewX + tF}
            y={topViewY + tS}
            width={tW - 2 * tF}
            height={(tT - 2 * tS) * 0.2}
            fill="#ffe0b2"
            stroke="#000"
            strokeWidth="0.3"
          />
          <rect
            x={topViewX + tF}
            y={topViewY + tT - tS - (tT - 2 * tS) * 0.2}
            width={tW - 2 * tF}
            height={(tT - 2 * tS) * 0.2}
            fill="#ffe0b2"
            stroke="#000"
            strokeWidth="0.3"
          />

          {/* Double frame if enabled */}
          {hasDoubleFrame && (
            <>
              <rect
                x={topViewX + tF}
                y={topViewY + tS}
                width={tF * 0.8}
                height={tT - 2 * tS}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.4"
                strokeDasharray="3,2"
              />
              <rect
                x={topViewX + tW - tF - tF * 0.8}
                y={topViewY + tS}
                width={tF * 0.8}
                height={tT - 2 * tS}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.4"
                strokeDasharray="3,2"
              />
            </>
          )}

          {/* Center lines */}
          <line
            x1={topViewX + tW / 2}
            y1={topViewY - 8}
            x2={topViewX + tW / 2}
            y2={topViewY + tT + 8}
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="10,3,2,3"
          />
          <line
            x1={topViewX - 8}
            y1={topViewY + tT / 2}
            x2={topViewX + tW + 8}
            y2={topViewY + tT / 2}
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="10,3,2,3"
          />

          {/* Hatch for frame */}
          {[...Array(Math.floor(tW / 10))].map((_, i) => (
            <line
              key={`top-hatch-${i}`}
              x1={topViewX + 2 + i * 10}
              y1={topViewY + tS + 2}
              x2={topViewX + 2 + i * 10 + 5}
              y2={topViewY + tT - tS - 2}
              stroke="#ccc"
              strokeWidth="0.2"
            />
          ))}

          {/* Dimensions for Top View */}
          {/* Overall width */}
          <DimLine
            x1={topViewX}
            y1={topViewY + tT}
            x2={topViewX + tW}
            y2={topViewY + tT}
            value={W}
            offset={35}
          />

          {/* Overall thickness */}
          <DimLine
            x1={topViewX + tW}
            y1={topViewY}
            x2={topViewX + tW}
            y2={topViewY + tT}
            value={T}
            offset={30}
            vertical
          />

          {/* Surface thickness (top) */}
          <DimLine
            x1={topViewX}
            y1={topViewY}
            x2={topViewX}
            y2={topViewY + tS}
            value={S}
            offset={-25}
            vertical
            fontSize={7}
          />

          {/* Frame width (left) */}
          <DimLine
            x1={topViewX}
            y1={topViewY}
            x2={topViewX + tF}
            y2={topViewY}
            value={F}
            offset={-18}
            fontSize={7}
          />

          {/* Inner width */}
          <DimLine
            x1={topViewX + tF}
            y1={topViewY}
            x2={topViewX + tW - tF}
            y2={topViewY}
            value={W - 2 * F}
            offset={-35}
            fontSize={7}
          />
        </g>

        {/* ==================== 3. BACK VIEW (ล่างซ้าย) ==================== */}
        <g id="back-view">
          <text
            x={backViewX + bW / 2}
            y={backViewY - 15}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
          >
            Back View
          </text>

          {/* Main outline */}
          <rect
            x={backViewX}
            y={backViewY}
            width={bW}
            height={bH}
            fill="#fafafa"
            stroke="#000"
            strokeWidth="1.5"
          />

          {/* Frame - Stiles (vertical) - mirrored */}
          <rect
            x={backViewX}
            y={backViewY}
            width={bF}
            height={bH}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.8"
          />
          <rect
            x={backViewX + bW - bF}
            y={backViewY}
            width={bF}
            height={bH}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.8"
          />

          {/* Frame - Rails (horizontal) */}
          <rect
            x={backViewX + bF}
            y={backViewY}
            width={bW - 2 * bF}
            height={bF}
            fill="#ffe0b2"
            stroke="#000"
            strokeWidth="0.8"
          />
          <rect
            x={backViewX + bF}
            y={backViewY + bH - bF}
            width={bW - 2 * bF}
            height={bF}
            fill="#ffe0b2"
            stroke="#000"
            strokeWidth="0.8"
          />

          {/* Horizontal Rails */}
          {railPositions.map((pos, idx) => {
            const railY = backViewY + bH - pos * backScale;
            const railH = Math.max(safeR * backScale, 2);
            return (
              <g key={`back-rail-${idx}`}>
                <rect
                  x={backViewX + bF + (hasDoubleFrame ? bF : 0)}
                  y={railY - railH / 2}
                  width={bW - 2 * bF - (hasDoubleFrame ? 2 * bF : 0)}
                  height={railH}
                  fill="#ffe0b2"
                  stroke="#000"
                  strokeWidth="0.6"
                />
              </g>
            );
          })}

          {/* Lock Block - Right (mirrored from front) */}
          {lockBlockRight &&
            [...Array(lockBlockPiecesPerSide)].map((_, i) => (
              <g key={`back-lb-right-${i}`}>
                <rect
                  x={backViewX + bF + (hasDoubleFrame ? bF : 0) + bF * i}
                  y={backViewY + bH - lockBlockBottom * backScale}
                  width={bF}
                  height={LOCK_BLOCK_HEIGHT * backScale}
                  fill="#ffcdd2"
                  stroke="#c62828"
                  strokeWidth="0.8"
                />
                <line
                  x1={backViewX + bF + (hasDoubleFrame ? bF : 0) + bF * i}
                  y1={backViewY + bH - lockBlockBottom * backScale}
                  x2={backViewX + bF + (hasDoubleFrame ? bF : 0) + bF * (i + 1)}
                  y2={backViewY + bH - lockBlockTop * backScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
                <line
                  x1={backViewX + bF + (hasDoubleFrame ? bF : 0) + bF * (i + 1)}
                  y1={backViewY + bH - lockBlockBottom * backScale}
                  x2={backViewX + bF + (hasDoubleFrame ? bF : 0) + bF * i}
                  y2={backViewY + bH - lockBlockTop * backScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
              </g>
            ))}

          {/* Lock Block - Left (mirrored from front) */}
          {lockBlockLeft &&
            [...Array(lockBlockPiecesPerSide)].map((_, i) => (
              <g key={`back-lb-left-${i}`}>
                <rect
                  x={
                    backViewX +
                    bW -
                    bF -
                    (hasDoubleFrame ? bF : 0) -
                    bF * (i + 1)
                  }
                  y={backViewY + bH - lockBlockBottom * backScale}
                  width={bF}
                  height={LOCK_BLOCK_HEIGHT * backScale}
                  fill="#ffcdd2"
                  stroke="#c62828"
                  strokeWidth="0.8"
                />
                <line
                  x1={
                    backViewX +
                    bW -
                    bF -
                    (hasDoubleFrame ? bF : 0) -
                    bF * (i + 1)
                  }
                  y1={backViewY + bH - lockBlockBottom * backScale}
                  x2={backViewX + bW - bF - (hasDoubleFrame ? bF : 0) - bF * i}
                  y2={backViewY + bH - lockBlockTop * backScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
                <line
                  x1={backViewX + bW - bF - (hasDoubleFrame ? bF : 0) - bF * i}
                  y1={backViewY + bH - lockBlockBottom * backScale}
                  x2={
                    backViewX +
                    bW -
                    bF -
                    (hasDoubleFrame ? bF : 0) -
                    bF * (i + 1)
                  }
                  y2={backViewY + bH - lockBlockTop * backScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
              </g>
            ))}

          {/* Center lines */}
          <line
            x1={backViewX + bW / 2}
            y1={backViewY - 10}
            x2={backViewX + bW / 2}
            y2={backViewY + bH + 10}
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="10,3,2,3"
          />
          <line
            x1={backViewX - 10}
            y1={backViewY + bH / 2}
            x2={backViewX + bW + 10}
            y2={backViewY + bH / 2}
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="10,3,2,3"
          />

          {/* Hatch pattern for frame */}
          {[...Array(Math.floor(bH / 6))].map((_, i) => (
            <React.Fragment key={`back-hatch-${i}`}>
              <line
                x1={backViewX + 1}
                y1={backViewY + i * 6}
                x2={backViewX + bF - 1}
                y2={backViewY + i * 6 + 4}
                stroke="#ddd"
                strokeWidth="0.2"
              />
              <line
                x1={backViewX + bW - bF + 1}
                y1={backViewY + i * 6}
                x2={backViewX + bW - 1}
                y2={backViewY + i * 6 + 4}
                stroke="#ddd"
                strokeWidth="0.2"
              />
            </React.Fragment>
          ))}

          {/* Dimensions for Back View */}
          {/* Overall width */}
          <DimLine
            x1={backViewX}
            y1={backViewY + bH}
            x2={backViewX + bW}
            y2={backViewY + bH}
            value={W}
            offset={40}
          />

          {/* Overall height */}
          <DimLine
            x1={backViewX}
            y1={backViewY}
            x2={backViewX}
            y2={backViewY + bH}
            value={H}
            offset={-50}
            vertical
          />

          {/* Frame width (top) */}
          <DimLine
            x1={backViewX}
            y1={backViewY}
            x2={backViewX + bF}
            y2={backViewY}
            value={F}
            offset={-20}
            fontSize={7}
          />

          {/* Inner width */}
          <DimLine
            x1={backViewX + bF}
            y1={backViewY + bH}
            x2={backViewX + bW - bF}
            y2={backViewY + bH}
            value={W - 2 * F}
            offset={20}
            fontSize={7}
          />

          {/* Rail positions from bottom */}
          {railPositions.map((pos, idx) => {
            const railY = backViewY + bH - pos * backScale;
            return (
              <g key={`back-rail-dim-${idx}`}>
                <line
                  x1={backViewX - 30}
                  y1={railY}
                  x2={backViewX - 20}
                  y2={railY}
                  stroke="#666"
                  strokeWidth="0.4"
                />
                <text
                  x={backViewX - 33}
                  y={railY + 3}
                  fontSize="7"
                  fill="#666"
                  textAnchor="end"
                >
                  {pos}
                </text>
              </g>
            );
          })}

          {/* Lock block position */}
          {(lockBlockLeft || lockBlockRight) && (
            <>
              <DimLine
                x1={backViewX + bW + 5}
                y1={backViewY + bH}
                x2={backViewX + bW + 5}
                y2={backViewY + bH - lockBlockPosition * backScale}
                value={lockBlockPosition}
                offset={20}
                vertical
                fontSize={7}
              />
              <DimLine
                x1={backViewX + bW + 5}
                y1={backViewY + bH - lockBlockTop * backScale}
                x2={backViewX + bW + 5}
                y2={backViewY + bH - lockBlockBottom * backScale}
                value={LOCK_BLOCK_HEIGHT}
                offset={40}
                vertical
                fontSize={7}
                color="#c62828"
              />
            </>
          )}
        </g>

        {/* ==================== 4. SIDE VIEW (กลางล่าง) ==================== */}
        <g id="side-view">
          <text
            x={sideViewX + sT / 2}
            y={sideViewY - 15}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
          >
            Side View
          </text>

          {/* Main outline */}
          <rect
            x={sideViewX}
            y={sideViewY}
            width={sT}
            height={sH}
            fill="#fafafa"
            stroke="#000"
            strokeWidth="1.5"
          />

          {/* Surface layers */}
          <rect
            x={sideViewX}
            y={sideViewY}
            width={sS}
            height={sH}
            fill="#e8f5e9"
            stroke="#000"
            strokeWidth="0.6"
          />
          <rect
            x={sideViewX + sT - sS}
            y={sideViewY}
            width={sS}
            height={sH}
            fill="#e8f5e9"
            stroke="#000"
            strokeWidth="0.6"
          />

          {/* Frame layers - showing frame depth */}
          <rect
            x={sideViewX + sS}
            y={sideViewY}
            width={(sT - 2 * sS) * 0.25}
            height={sH}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.4"
          />
          <rect
            x={sideViewX + sT - sS - (sT - 2 * sS) * 0.25}
            y={sideViewY}
            width={(sT - 2 * sS) * 0.25}
            height={sH}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.4"
          />

          {/* Core/honeycomb area indication */}
          <rect
            x={sideViewX + sS + (sT - 2 * sS) * 0.25}
            y={sideViewY}
            width={(sT - 2 * sS) * 0.5}
            height={sH}
            fill="#fce4ec"
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />

          {/* Hatch for surface */}
          {[...Array(Math.floor(sH / 5))].map((_, i) => (
            <React.Fragment key={`side-hatch-${i}`}>
              <line
                x1={sideViewX + 1}
                y1={sideViewY + i * 5}
                x2={sideViewX + sS - 1}
                y2={sideViewY + i * 5 + 3}
                stroke="#a5d6a7"
                strokeWidth="0.2"
              />
              <line
                x1={sideViewX + sT - sS + 1}
                y1={sideViewY + i * 5}
                x2={sideViewX + sT - 1}
                y2={sideViewY + i * 5 + 3}
                stroke="#a5d6a7"
                strokeWidth="0.2"
              />
            </React.Fragment>
          ))}

          {/* Center line */}
          <line
            x1={sideViewX + sT / 2}
            y1={sideViewY - 8}
            x2={sideViewX + sT / 2}
            y2={sideViewY + sH + 8}
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="10,3,2,3"
          />

          {/* Rails in side view */}
          {railPositions.map((pos, idx) => {
            const railY = sideViewY + sH - pos * sideScale;
            const railH = Math.max(safeR * sideScale * 0.5, 2);
            return (
              <rect
                key={`side-rail-${idx}`}
                x={sideViewX + sS}
                y={railY - railH / 2}
                width={sT - 2 * sS}
                height={railH}
                fill="#ffe0b2"
                stroke="#000"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Lock block in side (dashed) */}
          {(lockBlockLeft || lockBlockRight) && (
            <rect
              x={sideViewX + sS}
              y={sideViewY + sH - lockBlockBottom * sideScale}
              width={sT - 2 * sS}
              height={LOCK_BLOCK_HEIGHT * sideScale}
              fill="none"
              stroke="#c62828"
              strokeWidth="0.6"
              strokeDasharray="3,2"
            />
          )}

          {/* Dimensions for Side View */}
          {/* Overall thickness */}
          <DimLine
            x1={sideViewX}
            y1={sideViewY + sH}
            x2={sideViewX + sT}
            y2={sideViewY + sH}
            value={T}
            offset={40}
          />

          {/* Overall height */}
          <DimLine
            x1={sideViewX + sT}
            y1={sideViewY}
            x2={sideViewX + sT}
            y2={sideViewY + sH}
            value={H}
            offset={35}
            vertical
          />

          {/* Surface thickness */}
          <DimLine
            x1={sideViewX}
            y1={sideViewY}
            x2={sideViewX + sS}
            y2={sideViewY}
            value={S}
            offset={-20}
            fontSize={7}
          />

          {/* Frame thickness (core) */}
          <DimLine
            x1={sideViewX + sS}
            y1={sideViewY}
            x2={sideViewX + sT - sS}
            y2={sideViewY}
            value={T - 2 * S}
            offset={-35}
            fontSize={7}
          />
        </g>

        {/* ==================== 5. FRONT VIEW (ขวาล่าง) ==================== */}
        <g id="front-view">
          <text
            x={frontViewX + fW / 2}
            y={frontViewY - 15}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
          >
            Front View
          </text>

          {/* Main outline */}
          <rect
            x={frontViewX}
            y={frontViewY}
            width={fW}
            height={fH}
            fill="#fafafa"
            stroke="#000"
            strokeWidth="1.5"
          />

          {/* Frame - Stiles (vertical) */}
          <rect
            x={frontViewX}
            y={frontViewY}
            width={fF}
            height={fH}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.8"
          />
          <rect
            x={frontViewX + fW - fF}
            y={frontViewY}
            width={fF}
            height={fH}
            fill="#fff3e0"
            stroke="#000"
            strokeWidth="0.8"
          />

          {/* Frame - Rails (horizontal) */}
          <rect
            x={frontViewX + fF}
            y={frontViewY}
            width={fW - 2 * fF}
            height={fF}
            fill="#ffe0b2"
            stroke="#000"
            strokeWidth="0.8"
          />
          <rect
            x={frontViewX + fF}
            y={frontViewY + fH - fF}
            width={fW - 2 * fF}
            height={fF}
            fill="#ffe0b2"
            stroke="#000"
            strokeWidth="0.8"
          />

          {/* Hatch pattern for frame */}
          {[...Array(Math.floor(fH / 6))].map((_, i) => (
            <React.Fragment key={`front-hatch-${i}`}>
              <line
                x1={frontViewX + 1}
                y1={frontViewY + i * 6}
                x2={frontViewX + fF - 1}
                y2={frontViewY + i * 6 + 4}
                stroke="#ddd"
                strokeWidth="0.2"
              />
              <line
                x1={frontViewX + fW - fF + 1}
                y1={frontViewY + i * 6}
                x2={frontViewX + fW - 1}
                y2={frontViewY + i * 6 + 4}
                stroke="#ddd"
                strokeWidth="0.2"
              />
            </React.Fragment>
          ))}

          {/* Double frame if enabled */}
          {hasDoubleFrame && (
            <>
              <rect
                x={frontViewX + fF}
                y={frontViewY + fF}
                width={fDF}
                height={fH - 2 * fF}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.5"
                strokeDasharray="4,2"
              />
              <rect
                x={frontViewX + fW - fF - fDF}
                y={frontViewY + fF}
                width={fDF}
                height={fH - 2 * fF}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.5"
                strokeDasharray="4,2"
              />
            </>
          )}

          {/* Horizontal Rails */}
          {railPositions.map((pos, idx) => {
            const railY = frontViewY + fH - pos * frontScale;
            return (
              <g key={`front-rail-${idx}`}>
                <rect
                  x={frontViewX + fTotalFrame}
                  y={railY - fR / 2}
                  width={fW - 2 * fTotalFrame}
                  height={fR}
                  fill="#ffe0b2"
                  stroke="#000"
                  strokeWidth="0.6"
                />
                {/* Cross hatch for rail */}
                <line
                  x1={frontViewX + fTotalFrame}
                  y1={railY - fR / 2}
                  x2={frontViewX + fW - fTotalFrame}
                  y2={railY + fR / 2}
                  stroke="#d7ccc8"
                  strokeWidth="0.3"
                />
              </g>
            );
          })}

          {/* Lock Block - Left */}
          {lockBlockLeft &&
            [...Array(lockBlockPiecesPerSide)].map((_, i) => (
              <g key={`front-lb-left-${i}`}>
                <rect
                  x={frontViewX + fTotalFrame + fLockBlockW * i}
                  y={frontViewY + fH - lockBlockBottom * frontScale}
                  width={fLockBlockW}
                  height={LOCK_BLOCK_HEIGHT * frontScale}
                  fill="#ffcdd2"
                  stroke="#c62828"
                  strokeWidth="0.8"
                />
                {/* X pattern */}
                <line
                  x1={frontViewX + fTotalFrame + fLockBlockW * i}
                  y1={frontViewY + fH - lockBlockBottom * frontScale}
                  x2={frontViewX + fTotalFrame + fLockBlockW * (i + 1)}
                  y2={frontViewY + fH - lockBlockTop * frontScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
                <line
                  x1={frontViewX + fTotalFrame + fLockBlockW * (i + 1)}
                  y1={frontViewY + fH - lockBlockBottom * frontScale}
                  x2={frontViewX + fTotalFrame + fLockBlockW * i}
                  y2={frontViewY + fH - lockBlockTop * frontScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
              </g>
            ))}

          {/* Lock Block - Right */}
          {lockBlockRight &&
            [...Array(lockBlockPiecesPerSide)].map((_, i) => (
              <g key={`front-lb-right-${i}`}>
                <rect
                  x={frontViewX + fW - fTotalFrame - fLockBlockW * (i + 1)}
                  y={frontViewY + fH - lockBlockBottom * frontScale}
                  width={fLockBlockW}
                  height={LOCK_BLOCK_HEIGHT * frontScale}
                  fill="#ffcdd2"
                  stroke="#c62828"
                  strokeWidth="0.8"
                />
                <line
                  x1={frontViewX + fW - fTotalFrame - fLockBlockW * (i + 1)}
                  y1={frontViewY + fH - lockBlockBottom * frontScale}
                  x2={frontViewX + fW - fTotalFrame - fLockBlockW * i}
                  y2={frontViewY + fH - lockBlockTop * frontScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
                <line
                  x1={frontViewX + fW - fTotalFrame - fLockBlockW * i}
                  y1={frontViewY + fH - lockBlockBottom * frontScale}
                  x2={frontViewX + fW - fTotalFrame - fLockBlockW * (i + 1)}
                  y2={frontViewY + fH - lockBlockTop * frontScale}
                  stroke="#c62828"
                  strokeWidth="0.4"
                />
              </g>
            ))}

          {/* Center lines */}
          <line
            x1={frontViewX + fW / 2}
            y1={frontViewY - 10}
            x2={frontViewX + fW / 2}
            y2={frontViewY + fH + 10}
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="10,3,2,3"
          />
          <line
            x1={frontViewX - 10}
            y1={frontViewY + fH / 2}
            x2={frontViewX + fW + 10}
            y2={frontViewY + fH / 2}
            stroke="#000"
            strokeWidth="0.3"
            strokeDasharray="10,3,2,3"
          />

          {/* Dimensions for Front View */}
          {/* Overall width */}
          <DimLine
            x1={frontViewX}
            y1={frontViewY + fH}
            x2={frontViewX + fW}
            y2={frontViewY + fH}
            value={W}
            offset={40}
          />

          {/* Overall height */}
          <DimLine
            x1={frontViewX + fW}
            y1={frontViewY}
            x2={frontViewX + fW}
            y2={frontViewY + fH}
            value={H}
            offset={35}
            vertical
          />

          {/* Frame width (top) */}
          <DimLine
            x1={frontViewX}
            y1={frontViewY}
            x2={frontViewX + fF}
            y2={frontViewY}
            value={F}
            offset={-20}
            fontSize={7}
          />

          {/* Inner width */}
          <DimLine
            x1={frontViewX + fF}
            y1={frontViewY}
            x2={frontViewX + fW - fF}
            y2={frontViewY}
            value={W - 2 * F}
            offset={-35}
            fontSize={7}
          />

          {/* Lock block position from bottom */}
          {(lockBlockLeft || lockBlockRight) && (
            <DimLine
              x1={frontViewX}
              y1={frontViewY + fH}
              x2={frontViewX}
              y2={frontViewY + fH - lockBlockPosition * frontScale}
              value={lockBlockPosition}
              offset={-35}
              vertical
              fontSize={7}
            />
          )}

          {/* Rail position annotations */}
          {railPositions.map((pos, idx) => {
            const railY = frontViewY + fH - pos * frontScale;
            return (
              <g key={`front-rail-ann-${idx}`}>
                <line
                  x1={frontViewX + fW + 50}
                  y1={railY}
                  x2={frontViewX + fW + 60}
                  y2={railY}
                  stroke="#666"
                  strokeWidth="0.4"
                />
                <text
                  x={frontViewX + fW + 63}
                  y={railY + 3}
                  fontSize="7"
                  fill="#666"
                >
                  {pos}
                </text>
              </g>
            );
          })}
        </g>

        {/* ==================== PROFESSIONAL BOTTOM INFO BAR ==================== */}
        {/* Main container with shadow effect */}
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
          {/* Header */}
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

          {/* Content area */}
          <rect
            x="25"
            y={viewBoxHeight - 118}
            width="370"
            height="100"
            fill="white"
            stroke="#e2e8f0"
            strokeWidth="0.5"
          />

          {/* Left column */}
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
            {surfaceMaterial.toUpperCase()} {S}mm × 2
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
            {R}×{F}mm {hasDoubleFrame ? "(Double)" : ""}
          </text>

          {/* Right column */}
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
            {railSections - 1} pcs @ {railPositions.join(", ")} mm
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
            {lockBlockCount} pcs ({R}×{F}×{LOCK_BLOCK_HEIGHT}mm)
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
          {/* Header */}
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

          {/* Content area */}
          <rect
            x="405"
            y={viewBoxHeight - 118}
            width="280"
            height="100"
            fill="white"
            stroke="#e2e8f0"
            strokeWidth="0.5"
          />

          {/* Row 1 */}
          <rect
            x="415"
            y={viewBoxHeight - 105}
            width="16"
            height="10"
            fill="#e8f5e9"
            stroke="#4caf50"
            strokeWidth="0.8"
            rx="1"
          />
          <text x="435" y={viewBoxHeight - 97} fontSize="7" fill="#374151">
            Surface Material
          </text>

          <rect
            x="525"
            y={viewBoxHeight - 105}
            width="16"
            height="10"
            fill="#fff3e0"
            stroke="#ff9800"
            strokeWidth="0.8"
            rx="1"
          />
          <text x="545" y={viewBoxHeight - 97} fontSize="7" fill="#374151">
            Frame (Stile)
          </text>

          {/* Row 2 */}
          <rect
            x="415"
            y={viewBoxHeight - 88}
            width="16"
            height="10"
            fill="#ffe0b2"
            stroke="#f57c00"
            strokeWidth="0.8"
            rx="1"
          />
          <text x="435" y={viewBoxHeight - 80} fontSize="7" fill="#374151">
            Frame (Rail)
          </text>

          <rect
            x="525"
            y={viewBoxHeight - 88}
            width="16"
            height="10"
            fill="#ffcdd2"
            stroke="#c62828"
            strokeWidth="0.8"
            rx="1"
          />
          <text x="545" y={viewBoxHeight - 80} fontSize="7" fill="#374151">
            Lock Block
          </text>

          {/* Row 3 */}
          <rect
            x="415"
            y={viewBoxHeight - 71}
            width="16"
            height="10"
            fill="#fce4ec"
            stroke="#9e9e9e"
            strokeWidth="0.5"
            strokeDasharray="2,1"
            rx="1"
          />
          <text x="435" y={viewBoxHeight - 63} fontSize="7" fill="#374151">
            Core (Honeycomb)
          </text>

          <rect
            x="525"
            y={viewBoxHeight - 71}
            width="16"
            height="10"
            fill="none"
            stroke="#ff8f00"
            strokeWidth="1"
            strokeDasharray="3,2"
            rx="1"
          />
          <text x="545" y={viewBoxHeight - 63} fontSize="7" fill="#374151">
            Double Frame
          </text>

          {/* Row 4 - Lines */}
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

          {/* Dimension arrow example */}
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

        {/* TITLE BLOCK SECTION */}
        <g id="title-block">
          {/* Main border */}
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

          {/* Header with gradient effect */}
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

          {/* Size row */}
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

          {/* Material row */}
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
            {surfaceMaterial.toUpperCase()} + {frameType.toUpperCase()}
          </text>

          {/* Scale & Rev row */}
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

          {/* Company footer */}
          <rect
            x={viewBoxWidth - 305}
            y={viewBoxHeight - 35}
            width="280"
            height="15"
            fill="#f8fafc"
            rx="0 0 2 2"
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
      </svg>
    );
  };

  // ===== UI Components =====
  const SectionCard = ({ text, title, icon, children, color = "blue" }) => {
    const colors = {
      blue: "from-blue-600 to-blue-700",
      green: "from-green-600 to-green-700",
      amber: "from-amber-500 to-amber-600",
      orange: "from-orange-500 to-orange-600",
      red: "from-red-500 to-red-600",
    };
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${colors[color]} px-4 py-2.5`}>
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
  };

  // ===== Drawing Modal Component =====
  const DrawingModal = ({ isOpen, onClose, children }) => {
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

  // ===== Check if data is complete =====
  const isDataComplete = doorThickness && doorWidth && doorHeight;

  const standardWidths = [700, 800, 900, 1000];
  const standardHeights = [2000, 2100, 2200, 2400, 2700, 3000];
  const standardThickness = [33, 35, 40, 45];

  const surfaceMaterials = [
    { value: "upvc", label: "UPVC" },
    { value: "wpc", label: "WPC" },
    { value: "laminate", label: "ลามิเนต" },
    { value: "plywood", label: "ไม้อัด" },
    { value: "melamine", label: "เมลามีน" },
  ];

  const frameTypes = [
    { value: "rubberwood", label: "ยางพารา" },
    { value: "sadao", label: "สะเดา" },
    { value: "lvl", label: "LVL" },
  ];

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
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ความหนา (T)
                    </label>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {standardThickness.map((t) => (
                        <button
                          key={t}
                          onClick={() => setDoorThickness(t)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${doorThickness === t ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <NumberInput
                        value={doorThickness}
                        onChange={setDoorThickness}
                        className="flex-1 px-2 py-1.5 border rounded text-center text-sm font-bold focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ความกว้าง (W)
                    </label>
                    <div className="flex gap-1 mb-1">
                      {standardWidths.map((w) => (
                        <button
                          key={w}
                          onClick={() => setDoorWidth(w)}
                          className={`flex-1 py-1 rounded text-xs font-medium transition-all ${doorWidth === w ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <NumberInput
                        value={doorWidth}
                        onChange={setDoorWidth}
                        className="flex-1 px-2 py-1.5 border rounded text-center text-sm font-bold focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ความสูง (H)
                    </label>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {standardHeights.map((h) => (
                        <button
                          key={h}
                          onClick={() => setDoorHeight(h)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${doorHeight === h ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <NumberInput
                        value={doorHeight}
                        onChange={setDoorHeight}
                        className="flex-1 px-2 py-1.5 border rounded text-center text-sm font-bold focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">mm</span>
                    </div>
                  </div>

                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <p className="text-xs text-blue-700">
                      สเปค:{" "}
                      <span className="font-bold">
                        {doorThickness}×{doorWidth}×{doorHeight}
                      </span>{" "}
                      mm
                    </p>
                  </div>
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
                      {surfaceMaterials.map((mat) => (
                        <button
                          key={mat.value}
                          onClick={() => setSurfaceMaterial(mat.value)}
                          className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${surfaceMaterial === mat.value ? "bg-green-600 text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}`}
                        >
                          {mat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ความหนา/แผ่น
                    </label>
                    <div className="flex items-center gap-1">
                      <NumberInput
                        value={surfaceThickness}
                        onChange={setSurfaceThickness}
                        className="flex-1 px-2 py-1.5 border rounded text-center text-sm font-bold focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-500">mm</span>
                    </div>
                  </div>

                  <div className="p-2 bg-green-50 rounded-lg border border-green-200 text-xs">
                    <div className="flex justify-between">
                      <span>วัสดุ:</span>
                      <span className="font-bold text-green-700">
                        {
                          surfaceMaterials.find(
                            (m) => m.value === surfaceMaterial,
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>วัสดุปิดผิว:</span>
                      <span>
                        {surfaceThickness} mm × 2 = {surfaceThickness * 2} mm
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>กาว:</span>
                      <span>
                        {GLUE_THICKNESS} mm × 2 = {GLUE_THICKNESS * 2} mm
                      </span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-green-200 pt-1 mt-1">
                      <span>รวมทั้งหมด:</span>
                      <span className="font-bold">
                        {results.totalSurfaceThickness} mm
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-green-200 mt-1">
                      <span>ความหนาโครงที่ต้องการ:</span>
                      <span className="font-bold text-green-700">
                        {results.frameThickness} mm
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 3. โครง (ERP) */}
              <SectionCard text="3" title="โครง (ERP)" icon="🪵" color="amber">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    {frameTypes.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFrameType(opt.value)}
                        className={`py-1.5 rounded text-xs font-medium transition-all ${frameType === opt.value ? "bg-amber-500 text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      เลือกไม้โครง (จาก ERP)
                      <span className="text-gray-400 font-normal ml-1">
                        ยาว≥{doorHeight}mm
                      </span>
                    </label>
                    {frameSelection.frames.length > 0 ? (
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
                    ) : (
                      <div className="p-2 bg-red-50 rounded border border-red-200 text-xs text-red-600">
                        ⚠️{" "}
                        {frameSelection.reason ||
                          `ไม่มีไม้ที่ใช้ได้สำหรับความหนา ${results.frameThickness}mm`}
                      </div>
                    )}
                  </div>

                  {frameSelection.frames.length > 0 && (
                    <div
                      className={`p-2 rounded-lg border text-xs ${currentFrame.needSplice ? "bg-purple-50 border-purple-300" : currentFrame.planeAmount > 0 || currentFrame.isFlipped ? "bg-orange-50 border-orange-300" : "bg-amber-50 border-amber-200"}`}
                    >
                      <div className="flex justify-between">
                        <span>ไม้โครงใช้จริง:</span>
                        <span className="font-bold text-amber-700">
                          {currentFrame.useThickness}×{currentFrame.useWidth} mm
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t mt-1">
                        <span>รหัส ERP:</span>
                        <span className="font-mono text-[10px]">
                          {selectedFrameCode}
                        </span>
                      </div>
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
                    </div>
                  )}

                  <label
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${hasDoubleFrame ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-200"}`}
                  >
                    <input
                      type="checkbox"
                      checked={hasDoubleFrame}
                      onChange={(e) => setHasDoubleFrame(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-medium">เบิ้ลโครง</span>
                      {hasDoubleFrame && (
                        <span className="text-xs text-yellow-600 ml-1">
                          ({results.totalFrameWidth}mm/ด้าน)
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </SectionCard>

              {/* 4. ไม้ดามแนวนอน */}
              <SectionCard
                text="4"
                title="ไม้ดามแนวนอน"
                icon="➖"
                color="orange"
              >
                <div className="space-y-3">
                  <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-xs">
                    <div className="flex justify-between mb-1">
                      <span>จำนวนช่อง:</span>
                      <span className="font-bold text-orange-700">
                        {results.railSections} ช่อง ({results.railSections - 1}{" "}
                        ไม้ดาม)
                      </span>
                    </div>
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
                    <div className="flex justify-between mb-1">
                      <span>ขนาดไม้ดาม:</span>
                      <span className="font-bold text-orange-700">
                        {currentFrame.useThickness}×{currentFrame.useWidth} mm
                      </span>
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      (ใช้ไม้เดียวกับโครง)
                    </div>
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      {results.railPositions.map((pos, idx) => {
                        const wasAdjusted =
                          results.railPositionsOriginal &&
                          pos !== results.railPositionsOriginal[idx];
                        return (
                          <div
                            key={idx}
                            className={`flex justify-between ${wasAdjusted ? "text-amber-600" : "text-orange-700"}`}
                          >
                            <span>ตำแหน่งที่ {idx + 1}:</span>
                            <span className="font-bold">
                              {pos} mm
                              {wasAdjusted && (
                                <span className="text-[9px] ml-1">
                                  (เดิม {results.railPositionsOriginal[idx]})
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
                          lockBlockPiecesPerSide === n
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
                  <label
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${lockBlockLeft && !lockBlockRight ? "bg-red-50 border-red-400" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="lockblock"
                      checked={lockBlockLeft && !lockBlockRight}
                      onChange={() => {
                        setLockBlockLeft(true);
                        setLockBlockRight(false);
                      }}
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-xs font-medium">ซ้าย</span>
                    <span className="text-[10px] text-red-500 font-bold">
                      ({lockBlockPiecesPerSide} ชิ้น)
                    </span>
                  </label>

                  <label
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${!lockBlockLeft && lockBlockRight ? "bg-red-50 border-red-400" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="lockblock"
                      checked={!lockBlockLeft && lockBlockRight}
                      onChange={() => {
                        setLockBlockLeft(false);
                        setLockBlockRight(true);
                      }}
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-xs font-medium">ขวา</span>
                    <span className="text-[10px] text-red-500 font-bold">
                      ({lockBlockPiecesPerSide} ชิ้น)
                    </span>
                  </label>

                  <label
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${lockBlockLeft && lockBlockRight ? "bg-red-50 border-red-400" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="lockblock"
                      checked={lockBlockLeft && lockBlockRight}
                      onChange={() => {
                        setLockBlockLeft(true);
                        setLockBlockRight(true);
                      }}
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-xs font-medium">ทั้งสอง</span>
                    <span className="text-[10px] text-red-500 font-bold">
                      ({lockBlockPiecesPerSide * 2} ชิ้น)
                    </span>
                  </label>
                </div>

                {(lockBlockLeft || lockBlockRight) && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-xs">
                    <div className="flex justify-between mb-1">
                      <span>จำนวนรวม:</span>
                      <span className="font-bold text-red-700">
                        {results.lockBlockCount} ชิ้น (
                        {lockBlockLeft && lockBlockRight
                          ? `ซ้าย ${lockBlockPiecesPerSide} + ขวา ${lockBlockPiecesPerSide}`
                          : lockBlockLeft
                            ? `ซ้าย ${lockBlockPiecesPerSide}`
                            : `ขวา ${lockBlockPiecesPerSide}`}
                        )
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>ขนาด Lock Block:</span>
                      <span className="font-bold text-red-700">
                        {currentFrame.useThickness}×{currentFrame.useWidth}×
                        {LOCK_BLOCK_HEIGHT} mm
                      </span>
                    </div>
                    <div className="text-gray-500 text-[10px] mb-2">
                      (ใช้ไม้เดียวกับโครง)
                    </div>
                    <div className="pt-2 border-t border-red-200 text-red-700 space-y-1">
                      <div className="flex justify-between">
                        <span>ขอบบน:</span>
                        <span className="font-bold">
                          {results.lockBlockTop} mm จากพื้น
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>กึ่งกลาง:</span>
                        <span className="font-bold">
                          {results.lockBlockPosition} mm จากพื้น
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ขอบล่าง:</span>
                        <span className="font-bold">
                          {results.lockBlockBottom} mm จากพื้น
                        </span>
                      </div>
                    </div>
                  </div>
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
                    {doorThickness}×{doorWidth}×{doorHeight} mm
                  </span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block">ปิดผิว:</span>
                  <span className="font-bold text-green-600">
                    {
                      surfaceMaterials.find((m) => m.value === surfaceMaterial)
                        ?.label
                    }{" "}
                    {surfaceThickness}mm + กาว {GLUE_THICKNESS}mm (×2)
                  </span>
                </div>
                <div
                  className={`p-2 rounded-lg ${currentFrame.planeAmount > 0 || currentFrame.isFlipped ? "bg-orange-50" : "bg-amber-50"}`}
                >
                  <span className="text-gray-500 block">โครงไม้:</span>
                  <span className="font-bold text-amber-600">
                    {currentFrame.useThickness}×{currentFrame.useWidth} mm
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
                      ? `ซ้าย ${lockBlockPiecesPerSide} + ขวา ${lockBlockPiecesPerSide}`
                      : lockBlockLeft
                        ? `ซ้าย ${lockBlockPiecesPerSide}`
                        : `ขวา ${lockBlockPiecesPerSide}`}
                    )
                  </span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs">
                <div className="font-medium text-blue-800">
                  รหัส ERP: {selectedFrameCode}
                </div>
                <div className="text-blue-600 text-[10px]">
                  {currentFrame.desc}
                </div>
              </div>
            </div>

            {/* 6. Cutting Optimization - แสดงเฉพาะเมื่อกรอกข้อมูลครบ */}
            {isDataComplete ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span className="bg-white text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      6
                    </span>
                    <span>✂️</span>
                    แผนการตัดไม้ (Cutting Optimization)
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {cuttingPlan.needSplice && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-300 text-xs">
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
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-indigo-50 rounded-lg text-center">
                      <div className="text-indigo-600 font-bold text-lg">
                        {cuttingPlan.totalStocks}
                      </div>
                      <div className="text-gray-500">ไม้ที่ใช้ (ท่อน)</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg text-center">
                      <div className="text-green-600 font-bold text-lg">
                        {cuttingPlan.efficiency}%
                      </div>
                      <div className="text-gray-500">ประสิทธิภาพ</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-center">
                      <div className="text-blue-600 font-bold text-lg">
                        {cuttingPlan.usedWithoutKerf}
                      </div>
                      <div className="text-gray-500">ใช้จริง (mm)</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg text-center">
                      <div className="text-red-600 font-bold text-lg">
                        {cuttingPlan.totalWaste}
                      </div>
                      <div className="text-gray-500">เศษเหลือ (mm)</div>
                    </div>
                  </div>

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

                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">
                        ประสิทธิภาพการใช้ไม้
                      </span>
                      <span
                        className={`font-bold ${parseFloat(cuttingPlan.efficiency) >= 80 ? "text-green-600" : parseFloat(cuttingPlan.efficiency) >= 60 ? "text-yellow-600" : "text-red-600"}`}
                      >
                        {cuttingPlan.efficiency}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${parseFloat(cuttingPlan.efficiency) >= 80 ? "bg-green-500" : parseFloat(cuttingPlan.efficiency) >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
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
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-400 to-gray-500 px-4 py-2.5">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span className="bg-white text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      6
                    </span>
                    <span>✂️</span>
                    แผนการตัดไม้ (Cutting Optimization)
                  </h3>
                </div>
                <div className="p-8 text-center text-gray-400">
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
                  <p className="text-sm font-medium mb-1">
                    กรุณากรอกข้อมูลสเปคประตูให้ครบ
                  </p>
                  <p className="text-xs">ระบบจะคำนวณแผนการตัดไม้ให้อัตโนมัติ</p>
                </div>
              </div>
            )}
          </div>
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
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
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
                    <p className="text-lg font-medium mb-2">
                      กรุณากรอกข้อมูลสเปคประตู
                    </p>
                    <p className="text-sm">
                      ระบุ ความหนา (T), ความกว้าง (W), ความสูง (H)
                    </p>
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-gray-500 text-xs">
          C.H.H INDUSTRY CO., LTD. | Door Configuration System v43.0 -
          Professional Drawing Layout
        </div>
      </div>

      {/* Drawing Modal */}
      <DrawingModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
      >
        <div className="min-w-[90vw] max-w-[95vw]">
          <EngineeringDrawing results={results} />
        </div>
      </DrawingModal>
    </div>
  );
}
