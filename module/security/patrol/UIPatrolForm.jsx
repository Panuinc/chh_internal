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
        (errorMessage) => {}
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
      size="2xl"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            {label}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center w-full gap-2">
            {error && (
              <div className="text-danger text-sm p-2 bg-danger-50 rounded-lg w-full text-center">
                {error}
              </div>
            )}

            <div className="relative w-full bg-black rounded-xl overflow-hidden">
              <div
                id="qr-reader"
                className="w-full"
                style={{ minHeight: "350px" }}
              />

              {!isScanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    <span className="text-white text-sm">
                      กำลังเปิดกล้อง...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isScanning && (
              <div className="text-center text-default-600 text-sm">
                วาง QR Code ให้อยู่ในกรอบสี่เหลี่ยม
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="shadow"
            size="lg"
            radius="sm"
            className="w-2/12 text-background"
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
        0.9
      );
    }
  }, [onCapture, stopCamera, onClose]);

  useEffect(() => {
    if (isOpen) {
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
      size="2xl"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6" />
            {label}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center w-full gap-2">
            {error && (
              <div className="text-danger text-sm p-2 bg-danger-50 rounded-lg w-full text-center">
                {error}
              </div>
            )}

            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isStreaming && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    <span className="text-white text-sm">
                      กำลังเปิดกล้อง...
                    </span>
                  </div>
                </div>
              )}

              {isStreaming && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-4 w-16 h-16 border-l-4 border-t-4 border-white/50 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-4 w-16 h-16 border-r-4 border-t-4 border-white/50 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-white/50 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-white/50 rounded-br-lg"></div>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="shadow"
            size="lg"
            radius="sm"
            className="w-2/12 text-background"
            onPress={handleClose}
          >
            ยกเลิก
          </Button>
          <Button
            color="success"
            variant="shadow"
            size="lg"
            radius="sm"
            className="w-2/12 text-background"
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
      <div className="flex items-center justify-center w-full gap-2 font-semibold text-default-700">
        <QrCode />
        {label}
      </div>

      {qrCodeInfo ? (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="w-full p-2 bg-success-50 border-1 border-success-200 rounded-lg">
            <div className="text-sm text-success-600 font-medium mb-1">
              สแกนสำเร็จ:
            </div>
            <div className="text-default-700 break-all">{qrCodeInfo}</div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              className="w-6/12"
              onPress={onOpenScanner}
              startContent={<RefreshCw />}
            >
              สแกนใหม่
            </Button>
            <Button
              type="button"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              className="w-6/12"
              onPress={onClear}
            >
              ล้าง
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-default-400" strokeWidth={1} />
          </div>
          <p className="text-sm text-default-500">ยังไม่ได้สแกน QR Code</p>
          <Button
            type="button"
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            className="w-full"
            onPress={onOpenScanner}
            startContent={<QrCode />}
          >
            สแกน QR Code
          </Button>
        </div>
      )}

      {error && (
        <div className="text-danger text-sm">{error?.[0] || error}</div>
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
      <div className="flex items-center justify-center w-full gap-2 font-semibold text-default-700">
        <Camera />
        {label}
      </div>

      {capturedImage ? (
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <Image
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-48 object-contain rounded-lg shadow-md"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              className="w-6/12"
              onPress={onOpenCamera}
              startContent={<RefreshCw />}
            >
              ถ่ายใหม่
            </Button>
            <Button
              type="button"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              className="w-6/12"
              onPress={onClear}
            >
              ลบ
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center">
            <Camera className="w-10 h-10 text-default-400" strokeWidth={1} />
          </div>
          <p className="text-sm text-default-500">ยังไม่มีรูปภาพ</p>
          <Button
            type="button"
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            className="w-full"
            onPress={onOpenCamera}
            startContent={<Camera />}
          >
            เปิดกล้อง
          </Button>
        </div>
      )}

      {error && (
        <div className="text-danger text-sm">{error?.[0] || error}</div>
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
    [setFormData]
  );

  const handleClearQr = useCallback(() => {
    setFormData((prev) => ({ ...prev, patrolQrCodeInfo: "" }));
  }, [setFormData]);

  const handlePictureCapture = useCallback(
    (file, preview) => {
      setCapturedPicture(preview);
      setFormData((prev) => ({ ...prev, patrolPicture: file }));
    },
    [setFormData]
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
        className="flex flex-col items-center justify-start w-full xl:w-12/12 h-full gap-2 border-1 rounded-xl overflow-auto"
      >
        <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center h-full p-2 gap-2 border-b-1">
            สร้างโดย : {operatedBy}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 border-1 rounded-xl">
            <QrCodeCard
              label="สแกน QR Code"
              qrCodeInfo={formData.patrolQrCodeInfo}
              onOpenScanner={qrModal.onOpen}
              onClear={handleClearQr}
              error={errors.patrolQrCodeInfo}
            />
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 border-1 rounded-xl">
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
              size="lg"
              radius="sm"
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
              color="success"
              variant="shadow"
              size="lg"
              radius="sm"
              className="w-2/12 text-background"
            >
              บันทึก
            </Button>
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
