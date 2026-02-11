"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, Camera, RefreshCw } from "lucide-react";

const textareaClassNames = {
  label: "text-default-600 text-xs font-medium",
  input: "text-sm",
  inputWrapper: "border-default hover:border-default shadow-none",
};

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
      } catch (err) {}
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
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        () => {},
      );

      setIsScanning(true);
    } catch (err) {
      const errorStr = err.toString();
      if (
        errorStr.includes("NotAllowedError") ||
        errorStr.includes("Permission")
      ) {
        setError("Please allow camera access");
      } else if (
        errorStr.includes("NotFoundError") ||
        errorStr.includes("not found")
      ) {
        setError("No camera found on this device");
      } else {
        setError("Unable to open camera: " + (err.message || err));
      }
    }
  }, [onScan, onClose, stopScanner]);

  useEffect(() => {
    if (isOpen) {

      const timer = setTimeout(() => {
        startScanner();
      }, 0);
      return () => clearTimeout(timer);
    } else {

      setTimeout(() => {
        stopScanner();
      }, 0);
    }
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
        <ModalHeader className="flex flex-row items-center gap-2">
          <QrCode size={18} />
          {label}
        </ModalHeader>
        <ModalBody className="flex flex-col items-center justify-center w-full gap-2">
          {error && (
            <div className="text-danger text-sm p-2 bg-danger-50 rounded-lg w-full text-center">
              {error}
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center w-full bg-black rounded-lg overflow-hidden">
            <div
              id="qr-reader"
              className="w-full"
              style={{ minHeight: "350px" }}
            />

            {!isScanning && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-1 border-white"></div>
                <span className="text-white text-sm">Opening camera...</span>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="text-[12px] text-default-400 text-center">
              Position the QR Code within the frame
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            size="sm"
            radius="sm"
            className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
            onPress={handleClose}
          >
            Cancel
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
        } catch (e) {}
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
                setError("Unable to play video");
              });
          }
        };
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Please allow camera access");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device");
      } else {
        setError("Unable to access camera: " + err.message);
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

      const timer = setTimeout(() => {
        startCamera();
      }, 0);
      return () => clearTimeout(timer);
    } else {

      setTimeout(() => {
        stopCamera();
      }, 0);
    }
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
        <ModalHeader className="flex flex-row items-center gap-2">
          <Camera size={18} />
          {label}
        </ModalHeader>
        <ModalBody className="flex flex-col items-center justify-center w-full gap-2">
          {error && (
            <div className="text-danger text-sm p-2 bg-danger-50 rounded-lg w-full text-center">
              {error}
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {!isStreaming && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-1 border-white"></div>
                <span className="text-white text-sm">Opening camera...</span>
              </div>
            )}

            {isStreaming && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-4 w-12 h-12 border-l-2 border-t-1 border-white/50 rounded-tl-lg"></div>
                <div className="absolute top-2 right-4 w-12 h-12 border-r-2 border-t-1 border-white/50 rounded-tr-lg"></div>
                <div className="absolute botto left-4 w-12 h-12 border-l-2 border-b-1 border-white/50 rounded-bl-lg"></div>
                <div className="absolute botto right-4 w-12 h-12 border-r-2 border-b-1 border-white/50 rounded-br-lg"></div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            size="sm"
            radius="sm"
            className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
            onPress={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            radius="sm"
            className="bg-foreground text-background font-medium hover:bg-default-800"
            onPress={capturePhoto}
            isDisabled={!isStreaming}
            startContent={<Camera size={14} />}
          >
            Capture
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function QrCodeCard({ label, qrCodeInfo, onOpenScanner, onClear, error }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 bg-background rounded-lg border-1 border-default">
      <div className="flex items-center justify-center w-full gap-2 text-sm font-medium text-default-700">
        <QrCode size={16} />
        {label}
      </div>

      {qrCodeInfo ? (
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <div className="text-xs text-green-600 font-medium">
              Scan Successful
            </div>
            <div className="w-full p-2 bg-default-50 rounded-lg text-sm text-foreground break-all text-center">
              {qrCodeInfo}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              radius="sm"
              className="bg-foreground text-background font-medium hover:bg-default-800"
              onPress={onOpenScanner}
              startContent={<RefreshCw size={14} />}
            >
              Rescan
            </Button>
            <Button
              type="button"
              size="sm"
              radius="sm"
              className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
              onPress={onClear}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-2">
          <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
            <QrCode className="text-default-400" size={20} />
          </div>
          <p className="text-[12px] text-default-400">QR Code not scanned yet</p>
          <Button
            type="button"
            size="sm"
            radius="sm"
            className="bg-foreground text-background font-medium hover:bg-default-800"
            onPress={onOpenScanner}
            startContent={<QrCode size={14} />}
          >
            Scan QR Code
          </Button>
        </div>
      )}

      {error && (
        <div className="text-danger text-xs">
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
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 bg-background rounded-lg border-1 border-default">
      <div className="flex items-center justify-center w-full gap-2 text-sm font-medium text-default-700">
        <Camera size={16} />
        {label}
      </div>

      {capturedImage ? (
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <div className="flex items-center justify-center w-full">
            <Image
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-48 object-contain rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              radius="sm"
              className="bg-foreground text-background font-medium hover:bg-default-800"
              onPress={onOpenCamera}
              startContent={<RefreshCw size={14} />}
            >
              Retake
            </Button>
            <Button
              type="button"
              size="sm"
              radius="sm"
              className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
              onPress={onClear}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-2">
          <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
            <Camera className="text-default-400" size={20} />
          </div>
          <p className="text-[12px] text-default-400">No photo yet</p>
          <Button
            type="button"
            size="sm"
            radius="sm"
            className="bg-foreground text-background font-medium hover:bg-default-800"
            onPress={onOpenCamera}
            startContent={<Camera size={14} />}
          >
            Open Camera
          </Button>
        </div>
      )}

      {error && (
        <div className="text-danger text-xs">
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
      <div className="flex flex-col w-full h-full overflow-auto p-2">
        <div className="w-full h-full">
          <div className="bg-background rounded-lg border-1 border-default h-full flex flex-col">
            <div className="p-2 border-b-1 border-default">
              <h2 className="text-[13px] font-semibold text-foreground">Patrol Record</h2>
              <p className="text-[12px] text-default-400">Scan QR Code and take a photo of the checkpoint</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
              <div className="flex flex-col xl:flex-row gap-2">
                <div className="flex-1">
                  <QrCodeCard
              label="Scan QR Code"
              qrCodeInfo={formData.patrolQrCodeInfo}
              onOpenScanner={qrModal.onOpen}
              onClear={handleClearQr}
              error={errors.patrolQrCodeInfo}
            />
          </div>
          <div className="flex-1">
            <PhotoCaptureCard
              label="Take Photo"
              capturedImage={capturedPicture}
              onOpenCamera={cameraModal.onOpen}
              onClear={handleClearPicture}
              error={errors.patrolPicture}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-2 w-full">
          <div className="flex-1">
            <Textarea
              name="patrolNote"
              label="Additional Notes"
              labelPlacement="outside"
              placeholder="Enter additional notes (if any)"
              variant="bordered"
              size="md"
              radius="sm"
              minRows={3}
              maxRows={6}
              value={formData.patrolNote || ""}
              onChange={handleChange("patrolNote")}
              isInvalid={!!errors.patrolNote}
              errorMessage={errors.patrolNote?.[0] || errors.patrolNote}
              classNames={textareaClassNames}
            />
          </div>
        </div>

              <div className="flex items-center justify-between pt-4 border-t-1 border-default">
                <span className="text-xs text-default-400">
                  Created by: {operatedBy}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  radius="sm"
                  className="bg-foreground text-background font-medium hover:bg-default-800"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <QrScannerModal
        isOpen={qrModal.isOpen}
        onClose={qrModal.onClose}
        onScan={handleQrScan}
        label="Scan QR Code"
      />

      <CameraModal
        isOpen={cameraModal.isOpen}
        onClose={cameraModal.onClose}
        onCapture={handlePictureCapture}
        label="Take Photo"
      />
    </>
  );
}
