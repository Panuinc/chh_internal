"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";

// Uncontrolled number input - ไม่ re-render ขณะพิมพ์
const NumberInput = ({ value, onChange, className, step = 1 }) => {
  const inputRef = useRef(null);

  // Sync input value เมื่อ value เปลี่ยนจากภายนอก (เช่น กดปุ่ม)
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

  // ===== 2. วัสดุปิดผิว =====
  const [surfaceMaterial, setSurfaceMaterial] = useState("melamine");
  const [surfaceThickness, setSurfaceThickness] = useState(4); // ผู้ใช้กรอกเอง
  const GLUE_THICKNESS = 1; // ความหนากาว 1mm ต่อด้าน

  // ===== 3. โครง (Frame) - ตาม ERP =====
  const [frameType, setFrameType] = useState("rubberwood");
  const [selectedFrameCode, setSelectedFrameCode] = useState("");
  const [hasDoubleFrame, setHasDoubleFrame] = useState(false);

  // ===== 4. Lock Block - เลือกตำแหน่ง (ซ้าย/ขวา/ทั้งสอง) + จำนวนต่อฝั่ง =====
  const [lockBlockLeft, setLockBlockLeft] = useState(true);
  const [lockBlockRight, setLockBlockRight] = useState(true);
  const [lockBlockPiecesPerSide, setLockBlockPiecesPerSide] = useState(2); // จำนวนต่อฝั่ง (1-4)

  // Fixed Lock Block values
  const LOCK_BLOCK_HEIGHT = 400; // Fix 400mm
  const LOCK_BLOCK_POSITION = 1000; // Fix 1000mm จากพื้น

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

  // Find best matching frame with flipping logic + LENGTH consideration + SPLICING
  const frameSelection = useMemo(() => {
    const requiredThickness =
      doorThickness - (surfaceThickness + GLUE_THICKNESS) * 2; // รวมกาว
    const requiredLength = doorHeight; // ไม้ต้องยาวพอสำหรับโครงตั้ง
    const frames = erpFrames[frameType] || [];

    // Helper: กรองไม้ที่ยาวพอ แล้วเรียงจากสั้นไปยาว (ประหยัดสุด)
    const filterAndSort = (frameList) => {
      return frameList
        .filter((f) => f.length >= requiredLength)
        .sort((a, b) => a.length - b.length);
    };

    // Helper: หาไม้ที่ต่อได้ (2 ท่อนรวมกันยาวพอ)
    const findSpliceable = (frameList) => {
      // เรียงจากยาวไปสั้น แล้วหาท่อนที่ 2 ท่อนรวมกันยาวพอ
      const sorted = [...frameList].sort((a, b) => b.length - a.length);
      for (const frame of sorted) {
        // ต่อ 2 ท่อน ต้องเผื่อรอยต่อ 100mm (overlap)
        const spliceOverlap = 100;
        const totalLength = frame.length * 2 - spliceOverlap;
        if (totalLength >= requiredLength) {
          return {
            frame,
            needSplice: true,
            spliceCount: 2,
            spliceOverlap,
            effectiveLength: totalLength,
            splicePosition: Math.round(requiredLength / 2), // ต่อตรงกลาง
          };
        }
      }
      return null;
    };

    // 1. หาไม้ที่หนาตรงเป๊ะ + ยาวพอ
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

    // 2. หาไม้ที่พลิกแล้วหนาตรง + ยาวพอ
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

    // 3. หาไม้ที่หนากว่าแล้วไสลง + ยาวพอ
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

    // 4. หาไม้ที่พลิกแล้วหนากว่าแล้วไส + ยาวพอ
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

    // ===== 5. ไม่มีไม้ยาวพอ → ลองต่อไม้ =====

    // 5.1 ต่อไม้ที่หนาตรงเป๊ะ
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

    // 5.2 ต่อไม้ที่พลิกแล้วหนาตรง
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

    // 5.3 ต่อไม้ที่หนากว่า (ไส)
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

    // 5.4 ต่อไม้ที่พลิก+ไส
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

    // ไม่มีไม้ที่ใช้ได้เลย
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

  // Get current selected frame
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

  // Auto-select optimal frame when frameSelection changes (height/width/thickness change)
  React.useEffect(() => {
    if (frameSelection.frames.length > 0) {
      // เลือกไม้ตัวแรกเสมอ (ที่เหมาะสมที่สุด - สั้นที่สุดที่ใช้ได้)
      setSelectedFrameCode(frameSelection.frames[0].code);
    }
  }, [frameSelection]);

  // ===== Calculations =====
  const results = useMemo(() => {
    const T = parseFloat(doorThickness) || 0;
    const W = parseFloat(doorWidth) || 0;
    const H = parseFloat(doorHeight) || 0;
    const S = parseFloat(surfaceThickness) || 0;

    const totalSurfaceThickness = (S + GLUE_THICKNESS) * 2; // รวมกาว 1mm ต่อด้าน
    const frameThickness = T - totalSurfaceThickness;
    const F = currentFrame.useWidth;
    const R = currentFrame.useThickness;

    const DF = hasDoubleFrame ? F : 0;
    const totalFrameWidth = F + DF;
    const innerWidth = W - 2 * totalFrameWidth;
    const innerHeight = H - 2 * totalFrameWidth;
    const doorArea = W * H;

    // คำนวณจำนวนช่องไม้ดาม - ถ้าสูงเกิน 2400 แบ่ง 4 ช่อง ถ้าไม่ แบ่ง 3 ช่อง
    const railSections = H >= 2400 ? 4 : 3;

    // Lock Block zone (ต้องหลบ) - รวม buffer
    const lockBlockZoneTop = LOCK_BLOCK_POSITION - LOCK_BLOCK_HEIGHT / 2; // 800mm
    const lockBlockZoneBottom = LOCK_BLOCK_POSITION + LOCK_BLOCK_HEIGHT / 2; // 1200mm
    const lockBlockZoneBuffer = 50; // Buffer 50mm รอบๆ lock block
    const avoidZoneTop = lockBlockZoneTop - lockBlockZoneBuffer; // 750mm
    const avoidZoneBottom = lockBlockZoneBottom + lockBlockZoneBuffer; // 1250mm

    const railPositions = [];
    const railPositionsOriginal = []; // เก็บตำแหน่ง EQ เดิมไว้เทียบ

    // ความหนาของไม้ดาม (ใช้สำหรับคำนวณว่าชนหรือไม่)
    const railThickness = currentFrame.useWidth || 50;

    for (let i = 1; i < railSections; i++) {
      const eqPosition = Math.round((H * i) / railSections);
      railPositionsOriginal.push(eqPosition);

      // คำนวณขอบบน-ล่างของไม้ดาม
      const railTop = eqPosition + railThickness / 2;
      const railBottom = eqPosition - railThickness / 2;

      // ตรวจสอบว่าไม้ดามชนกับ Lock Block zone หรือไม่ (ต้องมี Lock Block อยู่ด้วย)
      const hasLockBlock = lockBlockLeft || lockBlockRight;
      const hitLockBlock =
        hasLockBlock &&
        railBottom <= avoidZoneBottom &&
        railTop >= avoidZoneTop;

      if (hitLockBlock) {
        // ถ้าชน → เลื่อนไปด้านที่ใกล้กว่า (บนหรือล่าง)
        const distToTop = eqPosition - avoidZoneTop;
        const distToBottom = avoidZoneBottom - eqPosition;

        if (distToTop <= distToBottom) {
          // เลื่อนขึ้นไปอยู่เหนือ lock block (ขอบล่างของไม้ดามอยู่ที่ avoidZoneTop)
          railPositions.push(avoidZoneTop - railThickness / 2);
        } else {
          // เลื่อนลงไปอยู่ใต้ lock block (ขอบบนของไม้ดามอยู่ที่ avoidZoneBottom)
          railPositions.push(avoidZoneBottom + railThickness / 2);
        }
      } else {
        railPositions.push(eqPosition);
      }
    }

    // Lock block calculations - จำนวนตามที่เลือก
    const lockBlockTop = LOCK_BLOCK_POSITION - LOCK_BLOCK_HEIGHT / 2;
    const lockBlockBottom = LOCK_BLOCK_POSITION + LOCK_BLOCK_HEIGHT / 2;
    const lockBlockWidth = F;
    const lockBlockSides = (lockBlockLeft ? 1 : 0) + (lockBlockRight ? 1 : 0);
    const lockBlockCount = lockBlockSides * lockBlockPiecesPerSide; // จำนวนรวม

    // Check if any rail was adjusted
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
    const sawKerf = 3; // เผื่อรอยเลื่อย 3mm
    const needSplice = currentFrame.needSplice || false;
    const spliceOverlap = currentFrame.spliceOverlap || 100;

    // รายการชิ้นส่วนที่ต้องตัด
    const cutPieces = [];

    // 1. โครงตั้ง (Stiles) - 2 ชิ้น (ซ้าย-ขวา)
    const stileLength = H;
    if (needSplice && stileLength > stockLength) {
      // ต่อไม้: แบ่งเป็น 2 ส่วน
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

    // 2. โครงนอน (Rails) - 2 ชิ้น (บน-ล่าง)
    const railLength = W - 2 * F;
    cutPieces.push({
      name: "โครงนอน",
      length: railLength,
      qty: 2,
      color: "#a1887f",
    });

    // 3. เบิ้ลโครงตั้ง (ถ้ามี)
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

    // 4. ไม้ดามแนวนอน
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

    // 5. Lock Block
    if (lockBlockCount > 0) {
      cutPieces.push({
        name: "Lock Block",
        length: LOCK_BLOCK_HEIGHT,
        qty: lockBlockCount,
        color: "#c62828",
      });
    }

    // สร้าง array ของชิ้นที่ต้องตัดทั้งหมด
    const allPieces = [];
    cutPieces.forEach((piece) => {
      for (let i = 0; i < piece.qty; i++) {
        allPieces.push({ ...piece, id: `${piece.name}-${i + 1}` });
      }
    });

    // เรียงจากยาวไปสั้น (First Fit Decreasing)
    allPieces.sort((a, b) => b.length - a.length);

    // จัดเรียงลงไม้ stock
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

    // คำนวณสรุป
    const totalStocks = stocks.length;
    const totalUsed = stocks.reduce((sum, s) => sum + s.used, 0);
    const totalWaste = stocks.reduce((sum, s) => sum + s.remaining, 0);
    const totalStock = totalStocks * stockLength;
    const usedWithoutKerf = allPieces.reduce((sum, p) => sum + p.length, 0);
    const efficiency = ((usedWithoutKerf / totalStock) * 100).toFixed(1);

    // นับชิ้นที่ต้องต่อ
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
  const ArchitecturalDrawing = ({ results }) => {
    const {
      W,
      H,
      T,
      S,
      F,
      DF,
      R,
      frameThickness,
      totalFrameWidth,
      railPositions,
      railSections,
      lockBlockTop,
      lockBlockBottom,
      lockBlockWidth,
      lockBlockLeft,
      lockBlockRight,
    } = results;

    // Guard against invalid values - ป้องกันค่า 0 หรือค่าลบ
    const safeH = H > 0 ? H : 2000;
    const safeW = W > 0 ? W : 800;
    const safeT = T > 0 ? T : 35;
    const safeS = S > 0 ? S : 4;
    const safeF = F > 0 ? F : 50;

    const viewBoxWidth = 950;
    const viewBoxHeight = 750;

    const frontScale = 300 / safeH;
    const fW = safeW * frontScale;
    const fH = safeH * frontScale;
    const fF = safeF * frontScale;
    const fDF = DF * frontScale;
    const fTotalFrame = totalFrameWidth * frontScale;
    const fR = Math.max(R * frontScale, 3);
    const fLockBlockW = lockBlockWidth * frontScale;

    const sideScale = 300 / safeH;
    const sT = Math.max(safeT * sideScale * 5, 25);
    const sH = safeH * sideScale;
    const sS = Math.max(safeS * sideScale * 5, 4);

    const topScaleW = 0.15;
    const topScaleT = 3;
    const tW = safeW * topScaleW;
    const tT = Math.max(safeT * topScaleT, 30);
    const tF = safeF * topScaleW;
    const tDF = DF * topScaleW;
    const tS = Math.max(safeS * topScaleT, 3);

    const secF = Math.max((safeF * 2) / 10, 8);
    const secDF = Math.max((DF * 2) / 10, 0);
    const secS = Math.max(safeS * 2, 5);

    const frontX = 80;
    const frontY = 100;
    const sideX = 440;
    const sideY = 100;
    const topX = 50;
    const topY = 530;
    const sectionX = 620;

    // Safe array length calculation - ป้องกัน Invalid array length
    const safeArrayLen = (n) => {
      const len = Math.floor(n);
      return len > 0 && len < 500 ? len : 0;
    };

    return (
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto bg-white rounded-lg border-2 border-gray-300"
      >
        {/* ==================== 1. FRONT VIEW ==================== */}
        <g id="front-view">
          <text
            x={frontX + fW / 2}
            y={frontY - 60}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#1e40af"
          >
            1. ภาพด้านหน้า
          </text>
          <text
            x={frontX + fW / 2}
            y={frontY - 45}
            textAnchor="middle"
            fontSize="9"
            fill="#666"
          >
            FRONT ELEVATION
          </text>

          {/* Surface */}
          <rect
            x={frontX}
            y={frontY}
            width={fW}
            height={fH}
            fill="#c8e6c9"
            stroke="#2e7d32"
            strokeWidth="1"
          />

          {/* Frame pattern */}
          <rect
            x={frontX + 2}
            y={frontY + 2}
            width={fW - 4}
            height={fF - 2}
            fill="none"
            stroke="#8d6e63"
            strokeWidth="0.5"
            strokeDasharray="3,2"
          />
          <rect
            x={frontX + 2}
            y={frontY + fH - fF}
            width={fW - 4}
            height={fF - 2}
            fill="none"
            stroke="#8d6e63"
            strokeWidth="0.5"
            strokeDasharray="3,2"
          />
          <rect
            x={frontX + 2}
            y={frontY + 2}
            width={fF - 2}
            height={fH - 4}
            fill="none"
            stroke="#8d6e63"
            strokeWidth="0.5"
            strokeDasharray="3,2"
          />
          <rect
            x={frontX + fW - fF}
            y={frontY + 2}
            width={fF - 2}
            height={fH - 4}
            fill="none"
            stroke="#8d6e63"
            strokeWidth="0.5"
            strokeDasharray="3,2"
          />

          {/* Double frame */}
          {hasDoubleFrame && (
            <>
              <rect
                x={frontX + fF + 2}
                y={frontY + fF + 2}
                width={fW - 2 * fF - 4}
                height={fDF - 2}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <rect
                x={frontX + fF + 2}
                y={frontY + fH - fF - fDF}
                width={fW - 2 * fF - 4}
                height={fDF - 2}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <rect
                x={frontX + fF + 2}
                y={frontY + fF + 2}
                width={fDF - 2}
                height={fH - 2 * fF - 4}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <rect
                x={frontX + fW - fF - fDF}
                y={frontY + fF + 2}
                width={fDF - 2}
                height={fH - 2 * fF - 4}
                fill="none"
                stroke="#ff8f00"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            </>
          )}

          {/* Horizontal Rails - แสดงเสมอ */}
          {railPositions.map((pos, idx) => {
            const railY = frontY + fH - pos * frontScale;
            return (
              <g key={`rail-${idx}`}>
                <rect
                  x={frontX + fTotalFrame}
                  y={railY - fR / 2}
                  width={fW - 2 * fTotalFrame}
                  height={fR}
                  fill="#e8d5b7"
                  stroke="#a67c52"
                  strokeWidth="1"
                  strokeDasharray="4,2"
                />
              </g>
            );
          })}

          {/* Lock Block - LEFT (ตามจำนวนที่เลือก) */}
          {lockBlockLeft && (
            <g id="lock-block-left">
              {[...Array(lockBlockPiecesPerSide)].map((_, i) => (
                <rect
                  key={`lb-left-${i}`}
                  x={frontX + fTotalFrame + fLockBlockW * i}
                  y={frontY + fH - lockBlockBottom * frontScale}
                  width={fLockBlockW}
                  height={results.lockBlockHeight * frontScale}
                  fill={
                    i === 0
                      ? "#ffcdd2"
                      : i === 1
                        ? "#ef9a9a"
                        : i === 2
                          ? "#e57373"
                          : "#ef5350"
                  }
                  stroke="#c62828"
                  strokeWidth={i === 0 ? "1.5" : "1"}
                />
              ))}
              {[...Array(4)].map((_, i) => (
                <line
                  key={`lb-hatch-l-${i}`}
                  x1={frontX + fTotalFrame + i * 6}
                  y1={frontY + fH - lockBlockBottom * frontScale}
                  x2={frontX + fTotalFrame + i * 6 + 8}
                  y2={frontY + fH - lockBlockTop * frontScale}
                  stroke="#c62828"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
              ))}
            </g>
          )}

          {/* Lock Block - RIGHT (ตามจำนวนที่เลือก) */}
          {lockBlockRight && (
            <g id="lock-block-right">
              {[...Array(lockBlockPiecesPerSide)].map((_, i) => (
                <rect
                  key={`lb-right-${i}`}
                  x={frontX + fW - fTotalFrame - fLockBlockW * (i + 1)}
                  y={frontY + fH - lockBlockBottom * frontScale}
                  width={fLockBlockW}
                  height={results.lockBlockHeight * frontScale}
                  fill={
                    i === 0
                      ? "#ffcdd2"
                      : i === 1
                        ? "#ef9a9a"
                        : i === 2
                          ? "#e57373"
                          : "#ef5350"
                  }
                  stroke="#c62828"
                  strokeWidth={i === 0 ? "1.5" : "1"}
                />
              ))}
              {[...Array(4)].map((_, i) => (
                <line
                  key={`lb-hatch-r-${i}`}
                  x1={
                    frontX +
                    fW -
                    fTotalFrame -
                    fLockBlockW * lockBlockPiecesPerSide +
                    i * 6
                  }
                  y1={frontY + fH - lockBlockBottom * frontScale}
                  x2={
                    frontX +
                    fW -
                    fTotalFrame -
                    fLockBlockW * lockBlockPiecesPerSide +
                    i * 6 +
                    8
                  }
                  y2={frontY + fH - lockBlockTop * frontScale}
                  stroke="#c62828"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
              ))}
            </g>
          )}

          {/* Core area */}
          <rect
            x={frontX + fTotalFrame}
            y={frontY + fTotalFrame}
            width={fW - 2 * fTotalFrame}
            height={fH - 2 * fTotalFrame}
            fill="none"
            stroke="#666"
            strokeWidth="0.5"
            strokeDasharray="5,3"
          />

          {/* Outline */}
          <rect
            x={frontX}
            y={frontY}
            width={fW}
            height={fH}
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />

          {/* Dimensions */}
          <g>
            <line
              x1={frontX}
              y1={frontY + fH + 25}
              x2={frontX + fW}
              y2={frontY + fH + 25}
              stroke="#000"
              strokeWidth="0.8"
            />
            <line
              x1={frontX}
              y1={frontY + fH + 15}
              x2={frontX}
              y2={frontY + fH + 35}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={frontX + fW}
              y1={frontY + fH + 15}
              x2={frontX + fW}
              y2={frontY + fH + 35}
              stroke="#000"
              strokeWidth="0.5"
            />
            <polygon
              points={`${frontX},${frontY + fH + 25} ${frontX + 6},${frontY + fH + 22} ${frontX + 6},${frontY + fH + 28}`}
              fill="#000"
            />
            <polygon
              points={`${frontX + fW},${frontY + fH + 25} ${frontX + fW - 6},${frontY + fH + 22} ${frontX + fW - 6},${frontY + fH + 28}`}
              fill="#000"
            />
            <rect
              x={frontX + fW / 2 - 20}
              y={frontY + fH + 32}
              width="40"
              height="14"
              fill="white"
            />
            <text
              x={frontX + fW / 2}
              y={frontY + fH + 43}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
            >
              {W}
            </text>
          </g>

          <g>
            <line
              x1={frontX - 45}
              y1={frontY}
              x2={frontX - 45}
              y2={frontY + fH}
              stroke="#000"
              strokeWidth="0.8"
            />
            <line
              x1={frontX - 55}
              y1={frontY}
              x2={frontX - 35}
              y2={frontY}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={frontX - 55}
              y1={frontY + fH}
              x2={frontX - 35}
              y2={frontY + fH}
              stroke="#000"
              strokeWidth="0.5"
            />
            <polygon
              points={`${frontX - 45},${frontY} ${frontX - 42},${frontY + 6} ${frontX - 48},${frontY + 6}`}
              fill="#000"
            />
            <polygon
              points={`${frontX - 45},${frontY + fH} ${frontX - 42},${frontY + fH - 6} ${frontX - 48},${frontY + fH - 6}`}
              fill="#000"
            />
            <text
              x={frontX - 60}
              y={frontY + fH / 2}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              transform={`rotate(-90, ${frontX - 60}, ${frontY + fH / 2})`}
            >
              {H}
            </text>
          </g>

          {/* Lock block position dimension */}
          {(lockBlockLeft || lockBlockRight) && (
            <g>
              <line
                x1={frontX - 25}
                y1={frontY + fH}
                x2={frontX - 25}
                y2={frontY + fH - results.lockBlockPosition * frontScale}
                stroke="#c62828"
                strokeWidth="0.5"
              />
              <line
                x1={frontX - 30}
                y1={frontY + fH}
                x2={frontX - 20}
                y2={frontY + fH}
                stroke="#c62828"
                strokeWidth="0.5"
              />
              <line
                x1={frontX - 30}
                y1={frontY + fH - results.lockBlockPosition * frontScale}
                x2={frontX - 20}
                y2={frontY + fH - results.lockBlockPosition * frontScale}
                stroke="#c62828"
                strokeWidth="0.5"
              />
              <text
                x={frontX - 25}
                y={frontY + fH - (results.lockBlockPosition * frontScale) / 2}
                textAnchor="middle"
                fontSize="7"
                fill="#c62828"
                transform={`rotate(-90, ${frontX - 25}, ${frontY + fH - (results.lockBlockPosition * frontScale) / 2})`}
              >
                {results.lockBlockPosition}
              </text>
            </g>
          )}

          {/* Frame dimension */}
          <g>
            <line
              x1={frontX}
              y1={frontY - 15}
              x2={frontX + fF}
              y2={frontY - 15}
              stroke="#8d6e63"
              strokeWidth="0.8"
            />
            <text
              x={frontX + fF / 2}
              y={frontY - 20}
              textAnchor="middle"
              fontSize="8"
              fill="#8d6e63"
            >
              {F}
            </text>
          </g>

          {/* Rail position markers - show actual positions, not EQ if adjusted */}
          <g>
            {results.railsAdjusted
              ? // แสดงตำแหน่งจริงของไม้ดาม (ไม่ใช่ EQ)
                railPositions.map((pos, idx) => {
                  const railY = frontY + fH - pos * frontScale;
                  const wasAdjusted =
                    results.railPositionsOriginal &&
                    pos !== results.railPositionsOriginal[idx];
                  return (
                    <g key={`rail-pos-${idx}`}>
                      <line
                        x1={frontX + fW + 10}
                        y1={railY}
                        x2={frontX + fW + 25}
                        y2={railY}
                        stroke={wasAdjusted ? "#f59e0b" : "#666"}
                        strokeWidth="0.5"
                      />
                      <text
                        x={frontX + fW + 28}
                        y={railY + 3}
                        fontSize="7"
                        fill={wasAdjusted ? "#f59e0b" : "#666"}
                      >
                        {pos}mm {wasAdjusted && "⚡"}
                      </text>
                    </g>
                  );
                })
              : // แสดง EQ. ปกติ (เมื่อไม่มีการปรับ)
                [...Array(railSections)].map((_, i) => (
                  <text
                    key={`eq-${i}`}
                    x={frontX + fW + 45}
                    y={frontY + (fH * (i + 0.5)) / railSections}
                    fontSize="8"
                    fill="#666"
                  >
                    EQ.
                  </text>
                ))}
          </g>

          {/* Lock block annotation */}
          {(lockBlockLeft || lockBlockRight) && (
            <g>
              <text
                x={frontX + fW + 15}
                y={frontY + fH - results.lockBlockPosition * frontScale - 3}
                fontSize="6"
                fill="#c62828"
                fontWeight="bold"
              >
                Lock Block
              </text>
              <text
                x={frontX + fW + 15}
                y={frontY + fH - results.lockBlockPosition * frontScale + 6}
                fontSize="5"
                fill="#c62828"
              >
                {R}×{F}×{results.lockBlockHeight} ×{results.lockBlockCount}
              </text>
            </g>
          )}
        </g>

        {/* ==================== 2. SIDE VIEW ==================== */}
        <g id="side-view">
          <text
            x={sideX + sT / 2}
            y={sideY - 60}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#7b1fa2"
          >
            2. ภาพด้านข้าง
          </text>
          <text
            x={sideX + sT / 2}
            y={sideY - 45}
            textAnchor="middle"
            fontSize="9"
            fill="#666"
          >
            SIDE ELEVATION
          </text>

          {(() => {
            const layerStartX = sideX;
            const surfaceW = sS;
            const frameW = ((sT - 2 * sS) / 2) * 0.3;
            const coreW = sT - 2 * sS - 2 * frameW;

            return (
              <>
                <rect
                  x={layerStartX}
                  y={sideY}
                  width={surfaceW}
                  height={sH}
                  fill="#a5d6a7"
                  stroke="#2e7d32"
                  strokeWidth="1"
                />
                <rect
                  x={layerStartX + surfaceW}
                  y={sideY}
                  width={frameW}
                  height={sH}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="0.5"
                />
                {[...Array(safeArrayLen(sH / 12))].map((_, i) => (
                  <line
                    key={`sf1-${i}`}
                    x1={layerStartX + surfaceW}
                    y1={sideY + i * 12}
                    x2={layerStartX + surfaceW + frameW}
                    y2={sideY + i * 12 + 8}
                    stroke="#8d6e63"
                    strokeWidth="0.3"
                  />
                ))}
                <rect
                  x={layerStartX + surfaceW + frameW}
                  y={sideY}
                  width={coreW}
                  height={sH}
                  fill="#fff8e1"
                  stroke="#ff8f00"
                  strokeWidth="0.5"
                  strokeDasharray="3,2"
                />
                <text
                  x={layerStartX + surfaceW + frameW + coreW / 2}
                  y={sideY + sH / 2}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#ff8f00"
                  transform={`rotate(-90, ${layerStartX + surfaceW + frameW + coreW / 2}, ${sideY + sH / 2})`}
                >
                  CORE
                </text>

                {/* Rails in side view */}
                {railPositions.map((pos, idx) => {
                  const railY = sideY + sH - pos * sideScale;
                  const railH = Math.max(R * sideScale * 0.5, 3);
                  return (
                    <rect
                      key={`side-rail-${idx}`}
                      x={layerStartX + surfaceW}
                      y={railY - railH / 2}
                      width={sT - 2 * surfaceW}
                      height={railH}
                      fill="#e8d5b7"
                      stroke="#a67c52"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* Lock block in side view */}
                {(lockBlockLeft || lockBlockRight) && (
                  <rect
                    x={layerStartX + surfaceW}
                    y={sideY + sH - lockBlockBottom * sideScale}
                    width={sT - 2 * surfaceW}
                    height={results.lockBlockHeight * sideScale}
                    fill="#ffcdd2"
                    stroke="#c62828"
                    strokeWidth="1"
                    fillOpacity="0.7"
                  />
                )}

                <rect
                  x={layerStartX + surfaceW + frameW + coreW}
                  y={sideY}
                  width={frameW}
                  height={sH}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="0.5"
                />
                {[...Array(safeArrayLen(sH / 12))].map((_, i) => (
                  <line
                    key={`sf2-${i}`}
                    x1={layerStartX + surfaceW + frameW + coreW}
                    y1={sideY + i * 12}
                    x2={layerStartX + surfaceW + 2 * frameW + coreW}
                    y2={sideY + i * 12 + 8}
                    stroke="#8d6e63"
                    strokeWidth="0.3"
                  />
                ))}
                <rect
                  x={layerStartX + sT - surfaceW}
                  y={sideY}
                  width={surfaceW}
                  height={sH}
                  fill="#a5d6a7"
                  stroke="#2e7d32"
                  strokeWidth="1"
                />
              </>
            );
          })()}

          <rect
            x={sideX}
            y={sideY}
            width={sT}
            height={sH}
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />

          {/* Dimensions */}
          <g>
            <line
              x1={sideX}
              y1={sideY + sH + 25}
              x2={sideX + sT}
              y2={sideY + sH + 25}
              stroke="#000"
              strokeWidth="0.8"
            />
            <line
              x1={sideX}
              y1={sideY + sH + 15}
              x2={sideX}
              y2={sideY + sH + 35}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={sideX + sT}
              y1={sideY + sH + 15}
              x2={sideX + sT}
              y2={sideY + sH + 35}
              stroke="#000"
              strokeWidth="0.5"
            />
            <polygon
              points={`${sideX},${sideY + sH + 25} ${sideX + 4},${sideY + sH + 22} ${sideX + 4},${sideY + sH + 28}`}
              fill="#000"
            />
            <polygon
              points={`${sideX + sT},${sideY + sH + 25} ${sideX + sT - 4},${sideY + sH + 22} ${sideX + sT - 4},${sideY + sH + 28}`}
              fill="#000"
            />
            <rect
              x={sideX + sT / 2 - 12}
              y={sideY + sH + 32}
              width="24"
              height="14"
              fill="white"
            />
            <text
              x={sideX + sT / 2}
              y={sideY + sH + 43}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
            >
              {T}
            </text>
          </g>

          <g>
            <line
              x1={sideX + sT + 20}
              y1={sideY}
              x2={sideX + sT + 20}
              y2={sideY + sH}
              stroke="#000"
              strokeWidth="0.8"
            />
            <line
              x1={sideX + sT + 10}
              y1={sideY}
              x2={sideX + sT + 30}
              y2={sideY}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={sideX + sT + 10}
              y1={sideY + sH}
              x2={sideX + sT + 30}
              y2={sideY + sH}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={sideX + sT + 35}
              y={sideY + sH / 2}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              transform={`rotate(-90, ${sideX + sT + 35}, ${sideY + sH / 2})`}
            >
              {H}
            </text>
          </g>

          <text
            x={sideX + sS / 2}
            y={sideY - 8}
            textAnchor="middle"
            fontSize="6"
            fill="#2e7d32"
          >
            S={S}
          </text>
        </g>

        {/* ==================== 3. TOP VIEW ==================== */}
        <g id="top-view">
          <text
            x={topX + tW / 2}
            y={topY - 25}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#00796b"
          >
            3. ภาพด้านบน
          </text>
          <text
            x={topX + tW / 2}
            y={topY - 10}
            textAnchor="middle"
            fontSize="9"
            fill="#666"
          >
            TOP VIEW / PLAN
          </text>

          {(() => {
            const startY = topY;
            return (
              <>
                <rect
                  x={topX}
                  y={startY}
                  width={tW}
                  height={tS}
                  fill="#a5d6a7"
                  stroke="#2e7d32"
                  strokeWidth="1"
                />
                <rect
                  x={topX}
                  y={startY + tS}
                  width={tW}
                  height={tF}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="0.5"
                />
                {hasDoubleFrame && (
                  <rect
                    x={topX + tF}
                    y={startY + tS + tF}
                    width={tW - 2 * tF}
                    height={tDF}
                    fill="#ffe0b2"
                    stroke="#ff8f00"
                    strokeWidth="0.5"
                  />
                )}
                <rect
                  x={topX + tF + (hasDoubleFrame ? tDF : 0)}
                  y={startY + tS + tF + (hasDoubleFrame ? tDF : 0)}
                  width={tW - 2 * tF - (hasDoubleFrame ? 2 * tDF : 0)}
                  height={tT - 2 * tS - 2 * tF - (hasDoubleFrame ? 2 * tDF : 0)}
                  fill="#fff8e1"
                  stroke="#666"
                  strokeWidth="0.5"
                  strokeDasharray="3,2"
                />
                {hasDoubleFrame && (
                  <rect
                    x={topX + tF}
                    y={startY + tT - tS - tF - tDF}
                    width={tW - 2 * tF}
                    height={tDF}
                    fill="#ffe0b2"
                    stroke="#ff8f00"
                    strokeWidth="0.5"
                  />
                )}
                <rect
                  x={topX}
                  y={startY + tT - tS - tF}
                  width={tW}
                  height={tF}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="0.5"
                />
                <rect
                  x={topX}
                  y={startY + tT - tS}
                  width={tW}
                  height={tS}
                  fill="#a5d6a7"
                  stroke="#2e7d32"
                  strokeWidth="1"
                />
                <rect
                  x={topX}
                  y={startY + tS}
                  width={tF}
                  height={tT - 2 * tS}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="0.5"
                />
                <rect
                  x={topX + tW - tF}
                  y={startY + tS}
                  width={tF}
                  height={tT - 2 * tS}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="0.5"
                />
                <rect
                  x={topX}
                  y={startY}
                  width={tW}
                  height={tT}
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                />
              </>
            );
          })()}

          {/* Dimensions */}
          <g>
            <line
              x1={topX}
              y1={topY + tT + 20}
              x2={topX + tW}
              y2={topY + tT + 20}
              stroke="#000"
              strokeWidth="0.8"
            />
            <line
              x1={topX}
              y1={topY + tT + 10}
              x2={topX}
              y2={topY + tT + 30}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={topX + tW}
              y1={topY + tT + 10}
              x2={topX + tW}
              y2={topY + tT + 30}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={topX + tW / 2}
              y={topY + tT + 38}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
            >
              {W}
            </text>
          </g>

          <g>
            <line
              x1={topX + tW + 15}
              y1={topY}
              x2={topX + tW + 15}
              y2={topY + tT}
              stroke="#000"
              strokeWidth="0.8"
            />
            <line
              x1={topX + tW + 5}
              y1={topY}
              x2={topX + tW + 25}
              y2={topY}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={topX + tW + 5}
              y1={topY + tT}
              x2={topX + tW + 25}
              y2={topY + tT}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={topX + tW + 35}
              y={topY + tT / 2 + 3}
              fontSize="10"
              fontWeight="bold"
            >
              {T}
            </text>
          </g>

          <text
            x={topX - 10}
            y={topY + tS / 2 + 2}
            textAnchor="end"
            fontSize="6"
            fill="#2e7d32"
          >
            S
          </text>
          <text
            x={topX - 10}
            y={topY + tS + tF / 2 + 2}
            textAnchor="end"
            fontSize="6"
            fill="#5d4037"
          >
            F
          </text>
        </g>

        {/* ==================== 4. SECTION A-A ==================== */}
        <g id="section-view">
          <text
            x={sectionX + 70}
            y={topY - 25}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#d32f2f"
          >
            4. ภาพตัด A-A
          </text>
          <text
            x={sectionX + 70}
            y={topY - 10}
            textAnchor="middle"
            fontSize="9"
            fill="#666"
          >
            SECTION A-A
          </text>

          {(() => {
            const secStartX = sectionX;
            const secStartY = topY;
            const totalW = 140;
            const totalH = 140;
            const lockBlockSecW = Math.max((F * 2) / 10, 10);

            return (
              <>
                <rect
                  x={secStartX}
                  y={secStartY}
                  width={totalW}
                  height={totalH}
                  fill="#fafafa"
                  stroke="#ddd"
                  strokeWidth="0.5"
                />
                <rect
                  x={secStartX + 5}
                  y={secStartY + 5}
                  width={totalW - 10}
                  height={secS}
                  fill="#a5d6a7"
                  stroke="#2e7d32"
                  strokeWidth="1.5"
                />
                <text
                  x={secStartX + totalW + 5}
                  y={secStartY + 5 + secS / 2 + 3}
                  fontSize="7"
                  fill="#2e7d32"
                >
                  ปิดผิวหน้า {S}mm
                </text>

                <rect
                  x={secStartX + 5}
                  y={secStartY + 5 + secS}
                  width={secF}
                  height={totalH - 10 - 2 * secS}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="1"
                />
                {[...Array(8)].map((_, i) => (
                  <line
                    key={`sec-l-${i}`}
                    x1={secStartX + 5}
                    y1={secStartY + 5 + secS + i * 14}
                    x2={secStartX + 5 + secF}
                    y2={secStartY + 5 + secS + i * 14 + 10}
                    stroke="#8d6e63"
                    strokeWidth="0.5"
                  />
                ))}

                {hasDoubleFrame && secDF > 0 && (
                  <rect
                    x={secStartX + 5 + secF}
                    y={secStartY + 5 + secS}
                    width={secDF}
                    height={totalH - 10 - 2 * secS}
                    fill="#ffe0b2"
                    stroke="#ff8f00"
                    strokeWidth="1"
                  />
                )}

                <rect
                  x={secStartX + 5 + secF + secDF}
                  y={secStartY + 5 + secS}
                  width={totalW - 10 - 2 * secF - 2 * secDF}
                  height={totalH - 10 - 2 * secS}
                  fill="#fff8e1"
                  stroke="#666"
                  strokeWidth="0.5"
                  strokeDasharray="4,2"
                />

                {/* Lock blocks in section (ตามจำนวนที่เลือก) */}
                {lockBlockLeft && (
                  <>
                    {[...Array(lockBlockPiecesPerSide)].map((_, i) => (
                      <rect
                        key={`sec-lb-left-${i}`}
                        x={secStartX + 5 + secF + secDF + lockBlockSecW * i}
                        y={secStartY + 5 + secS + 20}
                        width={lockBlockSecW}
                        height={totalH - 10 - 2 * secS - 40}
                        fill={
                          i === 0
                            ? "#ffcdd2"
                            : i === 1
                              ? "#ef9a9a"
                              : i === 2
                                ? "#e57373"
                                : "#ef5350"
                        }
                        stroke="#c62828"
                        strokeWidth="0.5"
                        fillOpacity={0.9 - i * 0.15}
                      />
                    ))}
                  </>
                )}
                {lockBlockRight && (
                  <>
                    {[...Array(lockBlockPiecesPerSide)].map((_, i) => (
                      <rect
                        key={`sec-lb-right-${i}`}
                        x={
                          secStartX +
                          totalW -
                          5 -
                          secF -
                          secDF -
                          lockBlockSecW * (i + 1)
                        }
                        y={secStartY + 5 + secS + 20}
                        width={lockBlockSecW}
                        height={totalH - 10 - 2 * secS - 40}
                        fill={
                          i === 0
                            ? "#ffcdd2"
                            : i === 1
                              ? "#ef9a9a"
                              : i === 2
                                ? "#e57373"
                                : "#ef5350"
                        }
                        stroke="#c62828"
                        strokeWidth="0.5"
                        fillOpacity={0.9 - i * 0.15}
                      />
                    ))}
                  </>
                )}

                {/* Rail in section */}
                <rect
                  x={secStartX + 5 + secF + secDF}
                  y={secStartY + totalH / 2 - 5}
                  width={totalW - 10 - 2 * secF - 2 * secDF}
                  height={10}
                  fill="#e8d5b7"
                  stroke="#a67c52"
                  strokeWidth="0.5"
                />

                <text
                  x={secStartX + totalW / 2}
                  y={secStartY + totalH / 2 + 25}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#666"
                >
                  ใส้ (Core)
                </text>

                {hasDoubleFrame && secDF > 0 && (
                  <rect
                    x={secStartX + totalW - 5 - secF - secDF}
                    y={secStartY + 5 + secS}
                    width={secDF}
                    height={totalH - 10 - 2 * secS}
                    fill="#ffe0b2"
                    stroke="#ff8f00"
                    strokeWidth="1"
                  />
                )}

                <rect
                  x={secStartX + totalW - 5 - secF}
                  y={secStartY + 5 + secS}
                  width={secF}
                  height={totalH - 10 - 2 * secS}
                  fill="#d7ccc8"
                  stroke="#5d4037"
                  strokeWidth="1"
                />
                {[...Array(8)].map((_, i) => (
                  <line
                    key={`sec-r-${i}`}
                    x1={secStartX + totalW - 5 - secF}
                    y1={secStartY + 5 + secS + i * 14}
                    x2={secStartX + totalW - 5}
                    y2={secStartY + 5 + secS + i * 14 + 10}
                    stroke="#8d6e63"
                    strokeWidth="0.5"
                  />
                ))}

                <rect
                  x={secStartX + 5}
                  y={secStartY + totalH - 5 - secS}
                  width={totalW - 10}
                  height={secS}
                  fill="#a5d6a7"
                  stroke="#2e7d32"
                  strokeWidth="1.5"
                />
                <text
                  x={secStartX + totalW + 5}
                  y={secStartY + totalH - 5 - secS / 2 + 3}
                  fontSize="7"
                  fill="#2e7d32"
                >
                  ปิดผิวหลัง {S}mm
                </text>

                <rect
                  x={secStartX + 5}
                  y={secStartY + 5}
                  width={totalW - 10}
                  height={totalH - 10}
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                />

                <text
                  x={secStartX + totalW + 5}
                  y={secStartY + totalH / 2}
                  fontSize="7"
                  fill="#5d4037"
                >
                  โครง {R}×{F}mm
                </text>
                <text
                  x={secStartX + totalW + 5}
                  y={secStartY + totalH / 2 + 12}
                  fontSize="6"
                  fill="#a67c52"
                >
                  ไม้ดาม×{railSections - 1}
                </text>
                {(lockBlockLeft || lockBlockRight) && (
                  <text
                    x={secStartX + totalW + 5}
                    y={secStartY + totalH / 2 + 24}
                    fontSize="6"
                    fill="#c62828"
                  >
                    LB×{results.lockBlockCount}
                  </text>
                )}

                <g>
                  <line
                    x1={secStartX + 5}
                    y1={secStartY + totalH + 15}
                    x2={secStartX + totalW - 5}
                    y2={secStartY + totalH + 15}
                    stroke="#000"
                    strokeWidth="0.5"
                  />
                  <text
                    x={secStartX + totalW / 2}
                    y={secStartY + totalH + 28}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {W}
                  </text>
                </g>
              </>
            );
          })()}
        </g>

        {/* ==================== LEGEND ==================== */}
        <g id="legend" transform="translate(820, 100)">
          <text x="0" y="0" fontSize="10" fontWeight="bold" fill="#333">
            สัญลักษณ์
          </text>
          <rect
            x="0"
            y="12"
            width="14"
            height="10"
            fill="#a5d6a7"
            stroke="#2e7d32"
            strokeWidth="1"
          />
          <text x="18" y="20" fontSize="8" fill="#333">
            วัสดุปิดผิว (S)
          </text>
          <rect
            x="0"
            y="28"
            width="14"
            height="10"
            fill="#d7ccc8"
            stroke="#5d4037"
            strokeWidth="1"
          />
          <text x="18" y="36" fontSize="8" fill="#333">
            โครง (F)
          </text>
          {hasDoubleFrame && (
            <>
              <rect
                x="0"
                y="44"
                width="14"
                height="10"
                fill="#ffe0b2"
                stroke="#ff8f00"
                strokeWidth="1"
              />
              <text x="18" y="52" fontSize="8" fill="#333">
                เบิ้ลโครง (DF)
              </text>
            </>
          )}
          <rect
            x="0"
            y={hasDoubleFrame ? 60 : 44}
            width="14"
            height="10"
            fill="#fff8e1"
            stroke="#666"
            strokeWidth="0.5"
            strokeDasharray="2,1"
          />
          <text x="18" y={hasDoubleFrame ? 68 : 52} fontSize="8" fill="#333">
            พื้นที่ใส้
          </text>
          <rect
            x="0"
            y={hasDoubleFrame ? 76 : 60}
            width="14"
            height="10"
            fill="#e8d5b7"
            stroke="#a67c52"
            strokeWidth="1"
          />
          <text x="18" y={hasDoubleFrame ? 84 : 68} fontSize="8" fill="#333">
            ไม้ดาม (R)
          </text>
          <rect
            x="0"
            y={hasDoubleFrame ? 92 : 76}
            width="14"
            height="10"
            fill="#ffcdd2"
            stroke="#c62828"
            strokeWidth="1"
          />
          <text x="18" y={hasDoubleFrame ? 100 : 84} fontSize="8" fill="#333">
            Lock Block (×{lockBlockPiecesPerSide})
          </text>
          <line
            x1="0"
            y1={hasDoubleFrame ? 112 : 96}
            x2="14"
            y2={hasDoubleFrame ? 112 : 96}
            stroke="#d32f2f"
            strokeWidth="1.5"
            strokeDasharray="4,2"
          />
          <text x="18" y={hasDoubleFrame ? 116 : 100} fontSize="8" fill="#333">
            เส้นตัด
          </text>
        </g>

        {/* ==================== TITLE BLOCK ==================== */}
        <g id="title-block">
          <rect
            x="820"
            y="220"
            width="120"
            height="180"
            fill="none"
            stroke="#333"
            strokeWidth="1"
          />
          <line
            x1="820"
            y1="240"
            x2="940"
            y2="240"
            stroke="#333"
            strokeWidth="0.5"
          />
          <line
            x1="820"
            y1="265"
            x2="940"
            y2="265"
            stroke="#333"
            strokeWidth="0.5"
          />
          <line
            x1="820"
            y1="290"
            x2="940"
            y2="290"
            stroke="#333"
            strokeWidth="0.5"
          />
          <line
            x1="820"
            y1="315"
            x2="940"
            y2="315"
            stroke="#333"
            strokeWidth="0.5"
          />
          <line
            x1="820"
            y1="340"
            x2="940"
            y2="340"
            stroke="#333"
            strokeWidth="0.5"
          />
          <line
            x1="820"
            y1="365"
            x2="940"
            y2="365"
            stroke="#333"
            strokeWidth="0.5"
          />

          <text
            x="880"
            y="235"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
          >
            โครงประตู
          </text>
          <text x="880" y="256" textAnchor="middle" fontSize="8">
            {T}×{W}×{H} mm
          </text>
          <text x="880" y="280" textAnchor="middle" fontSize="7">
            ปิดผิว: {surfaceMaterial} {S}mm
          </text>
          <text x="880" y="305" textAnchor="middle" fontSize="7" fill="#5d4037">
            โครง: {R}×{F} mm
          </text>
          <text x="880" y="330" textAnchor="middle" fontSize="7" fill="#a67c52">
            ไม้ดาม: {R}×{F}mm ×{railSections - 1}
          </text>
          <text x="880" y="355" textAnchor="middle" fontSize="6" fill="#c62828">
            LB: {R}×{F}×{LOCK_BLOCK_HEIGHT}mm ×{results.lockBlockCount} (
            {lockBlockLeft && lockBlockRight
              ? "L+R"
              : lockBlockLeft
                ? "L"
                : "R"}
            )
          </text>
          <text x="880" y="380" textAnchor="middle" fontSize="5" fill="#666">
            {currentFrame.code}
          </text>
          {currentFrame.isFlipped && (
            <text
              x="880"
              y="392"
              textAnchor="middle"
              fontSize="5"
              fill="#e65100"
            >
              (พลิกไม้)
            </text>
          )}
          {currentFrame.planeAmount > 0 && (
            <text
              x="880"
              y="392"
              textAnchor="middle"
              fontSize="5"
              fill="#e65100"
            >
              (ไส {currentFrame.planeAmount}mm)
            </text>
          )}
        </g>

        <rect
          x="5"
          y="5"
          width={viewBoxWidth - 10}
          height={viewBoxHeight - 10}
          fill="none"
          stroke="#333"
          strokeWidth="2"
        />
        <text
          x={viewBoxWidth / 2}
          y="25"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1a237e"
        >
          แบบโครงสร้างประตู - DOOR FRAME DRAWING
        </text>
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

  const standardWidths = [700, 800, 900, 1000];
  const standardHeights = [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700];
  const standardThickness = [35, 40, 45];

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

              {/* 4. ไม้ดามแนวนอน - แสดงข้อมูลเสมอ ไม่มี checkbox */}
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

            {/* 5. Lock Block - เลือกตำแหน่ง + จำนวน */}
            <SectionCard
              text="5"
              title="Lock Block (รองลูกบิด)"
              icon="🔒"
              color="red"
            >
              <div className="space-y-3">
                {/* จำนวนต่อฝั่ง */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    จำนวนต่อฝั่ง
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
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

                {/* เลือกฝั่ง */}
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

            {/* 6. Cutting Optimization */}
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
                {/* Splice Warning */}
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

                {/* Summary Stats */}
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

                {/* Cut List */}
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

                {/* Visual Cutting Diagram */}
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
                              const width = (piece.length / stock.length) * 100;
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

                {/* Efficiency Bar */}
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">ประสิทธิภาพการใช้ไม้</span>
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
          </div>

          {/* Right Panel - Drawing */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2.5">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>📐</span> แบบสถาปนิก 4 มุมมอง
                </h3>
              </div>
              <div className="p-3 bg-gray-50">
                {doorThickness && doorWidth && doorHeight ? (
                  <ArchitecturalDrawing results={results} />
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
          C.H.H INDUSTRY CO., LTD. | Door Configuration System v38.1 - Fixed
          Frame Selection with Glue
        </div>
      </div>
    </div>
  );
}
