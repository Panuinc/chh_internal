"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Button,
  Textarea,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, Camera, RefreshCw } from "lucide-react";

function QrScannerModal({ isOpen, onClose, onScan, label }) {
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      try {
        html5QrCodeRef.current.clear();
      } catch (err) {}
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const element = document.getElementById("qr-reader");
    if (!element) {
      setError("Scanner element not ready");
      return;
    }

    try {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("QR Code scanned:", decodedText);
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        () => {},
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      const errorStr = err.toString();
      if (
        errorStr.includes("NotAllowedError") ||
        errorStr.includes("Permission")
      ) {
        setError("กรุณาอนุญาตการเข้าถึงกล้อง");
      } else if (
        errorStr.includes("NotFoundError") ||
        errorStr.includes("not found")
      ) {
        setError("ไม่พบกล้องในอุปกรณ์นี้");
      } else {
        setError("ไม่สามารถเปิดกล้องได้: " + (err.message || err));
      }
    }
  }, [onScan, onClose, stopScanner]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startScanner();
    }
    return () => {
      if (!isOpen) {
        stopScanner();
      }
    };
  }, [isOpen, startScanner, stopScanner]);

  const handleClose = useCallback(async () => {
    await stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-row items-center justify-start w-full h-fit p-2 gap-2">
          <QrCode />
          {label}
        </ModalHeader>
        <ModalBody className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2">
          {error && (
            <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-danger">
              {error}
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center w-full h-fit p-2 gap-2 bg-black rounded-xl overflow-hidden">
            <div
              id="qr-reader"
              className="w-full"
              style={{ minHeight: "350px" }}
            />

            {!isScanning && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-2 gap-2 bg-black/80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-1 border-white"></div>
                <span className="text-white">กำลังเปิดกล้อง...</span>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
              วาง QR Code ให้อยู่ในกรอบสี่เหลี่ยม
            </div>
          )}
        </ModalBody>
        <ModalFooter className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <Button
            color="danger"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-background"
            onPress={handleClose}
          >
            ยกเลิก
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function CameraModal({ isOpen, onClose, onCapture, label }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error("Error stopping track:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsStreaming(true);
              })
              .catch((err) => {
                console.error("Error playing video:", err);
                setError("ไม่สามารถเล่นวิดีโอได้");
              });
          }
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setError("กรุณาอนุญาตการเข้าถึงกล้อง");
      } else if (err.name === "NotFoundError") {
        setError("ไม่พบกล้องในอุปกรณ์นี้");
      } else {
        setError("ไม่สามารถเข้าถึงกล้องได้: " + err.message);
      }
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `patrol_${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            onCapture(file, URL.createObjectURL(blob));
            stopCamera();
            onClose();
          }
        },
        "image/jpeg",
        0.9,
      );
    }
  }, [onCapture, stopCamera, onClose]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startCamera();
    }
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-row items-center justify-start w-full h-fit p-2 gap-2">
          <Camera />
          {label}
        </ModalHeader>
        <ModalBody className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2">
          {error && (
            <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-danger">
              {error}
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center w-full aspect-video bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {!isStreaming && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-2 gap-2 bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-1 border-white"></div>
                <span className="text-white">กำลังเปิดกล้อง...</span>
              </div>
            )}

            {isStreaming && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-4 w-12 h-12 border-l-2 border-t-1 border-white/50 rounded-tl-lg"></div>
                <div className="absolute top-2 right-4 w-12 h-12 border-r-2 border-t-1 border-white/50 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-1 border-white/50 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-1 border-white/50 rounded-br-lg"></div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <Button
            color="danger"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-background"
            onPress={handleClose}
          >
            ยกเลิก
          </Button>
          <Button
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-background"
            onPress={capturePhoto}
            isDisabled={!isStreaming}
            startContent={<Camera />}
          >
            ถ่ายรูป
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function QrCodeCard({ label, qrCodeInfo, onOpenScanner, onClear, error }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2">
      <div className="flex items-center justify-center w-full h-fit gap-2 font-semibold">
        <QrCode />
        {label}
      </div>

      {qrCodeInfo ? (
        <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
          <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
            <div className="flex items-center justify-center w-full h-fit text-success">
              สแกนสำเร็จ
            </div>
            <div className="flex items-center justify-center w-full h-fit p-2 bg-default rounded-xl break-all">
              {qrCodeInfo}
            </div>
          </div>
          <div className="flex flex-row items-center justify-center w-full h-fit gap-2">
            <Button
              type="button"
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="w-full text-background"
              onPress={onOpenScanner}
              startContent={<RefreshCw />}
            >
              สแกนใหม่
            </Button>
            <Button
              type="button"
              color="danger"
              variant="shadow"
              size="md"
              radius="md"
              className="w-full text-background"
              onPress={onClear}
            >
              ล้าง
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-fit gap-2 p-2">
          <div className="flex items-center justify-center w-20 h-20">
            <QrCode />
          </div>
          <div className="flex items-center justify-center w-full h-fit">
            ยังไม่ได้สแกน QR Code
          </div>
          <Button
            type="button"
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-6/12 text-background"
            onPress={onOpenScanner}
            startContent={<QrCode />}
          >
            สแกน QR Code
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center w-full h-fit text-danger">
          {error?.[0] || error}
        </div>
      )}
    </div>
  );
}

function PhotoCaptureCard({
  label,
  capturedImage,
  onOpenCamera,
  onClear,
  error,
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2">
      <div className="flex items-center justify-center w-full h-fit gap-2 font-semibold">
        <Camera />
        {label}
      </div>

      {capturedImage ? (
        <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
          <div className="flex items-center justify-center w-full h-fit">
            <Image
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-48 object-contain rounded-xl shadow-md"
            />
          </div>
          <div className="flex flex-row items-center justify-center w-full h-fit gap-2">
            <Button
              type="button"
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="w-full text-background"
              onPress={onOpenCamera}
              startContent={<RefreshCw />}
            >
              ถ่ายใหม่
            </Button>
            <Button
              type="button"
              color="danger"
              variant="shadow"
              size="md"
              radius="md"
              className="w-full text-background"
              onPress={onClear}
            >
              ลบ
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-fit gap-2 p-2">
          <div className="flex items-center justify-center w-20 h-20">
            <Camera />
          </div>
          <div className="flex items-center justify-center w-full h-fit">
            ยังไม่มีรูปภาพ
          </div>
          <Button
            type="button"
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-6/12 text-background"
            onPress={onOpenCamera}
            startContent={<Camera />}
          >
            เปิดกล้อง
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center w-full h-fit text-danger">
          {error?.[0] || error}
        </div>
      )}
    </div>
  );
}

export default function UIPatrolForm({ formHandler, operatedBy }) {
  const { formRef, formData, handleChange, handleSubmit, errors, setFormData } =
    formHandler;

  const qrModal = useDisclosure();
  const cameraModal = useDisclosure();

  const [capturedPicture, setCapturedPicture] = useState(null);

  const handleQrScan = useCallback(
    (qrData) => {
      setFormData((prev) => ({ ...prev, patrolQrCodeInfo: qrData }));
    },
    [setFormData],
  );

  const handleClearQr = useCallback(() => {
    setFormData((prev) => ({ ...prev, patrolQrCodeInfo: "" }));
  }, [setFormData]);

  const handlePictureCapture = useCallback(
    (file, preview) => {
      setCapturedPicture(preview);
      setFormData((prev) => ({ ...prev, patrolPicture: file }));
    },
    [setFormData],
  );

  const handleClearPicture = useCallback(() => {
    setCapturedPicture(null);
    setFormData((prev) => ({ ...prev, patrolPicture: null }));
  }, [setFormData]);

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-2 border-l-2 border-r-2 border-default overflow-auto"
      >
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 border-b-1 xl:border-b-0 xl:border-r-2 border-default">
            <QrCodeCard
              label="สแกน QR Code"
              qrCodeInfo={formData.patrolQrCodeInfo}
              onOpenScanner={qrModal.onOpen}
              onClear={handleClearQr}
              error={errors.patrolQrCodeInfo}
            />
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <PhotoCaptureCard
              label="ถ่ายรูป"
              capturedImage={capturedPicture}
              onOpenCamera={cameraModal.onOpen}
              onClear={handleClearPicture}
              error={errors.patrolPicture}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Textarea
              name="patrolNote"
              label="บันทึกเพิ่มเติม"
              labelPlacement="outside"
              placeholder="กรอกบันทึกเพิ่มเติม (ถ้ามี)"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
              minRows={3}
              maxRows={6}
              value={formData.patrolNote || ""}
              onChange={handleChange("patrolNote")}
              isInvalid={!!errors.patrolNote}
              errorMessage={errors.patrolNote?.[0] || errors.patrolNote}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-end w-full h-full p-2 gap-2">
            <Button
              type="submit"
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="w-2/12 text-background"
            >
              บันทึก
            </Button>
          </div>
        </div>

        <div className="flex flex-row items-center justify-end w-full h-full p-2 gap-2">
          <div className="flex items-end justify-center h-full p-2 gap-2">
            สร้างโดย : {operatedBy}
          </div>
        </div>
      </form>

      <QrScannerModal
        isOpen={qrModal.isOpen}
        onClose={qrModal.onClose}
        onScan={handleQrScan}
        label="สแกน QR Code"
      />

      <CameraModal
        isOpen={cameraModal.isOpen}
        onClose={cameraModal.onClose}
        onCapture={handlePictureCapture}
        label="ถ่ายรูป"
      />
    </>
  );
}
