"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

const contactReasonOptions = [
  { key: "Shipping", label: "การจัดส่ง" },
  { key: "BillingChequeCollection", label: "รับเช็ค/วางบิล" },
  { key: "JobApplication", label: "สมัครงาน" },
  { key: "ProductPresentation", label: "นำเสนอสินค้า" },
  { key: "Meeting", label: "ประชุม" },
  { key: "Other", label: "อื่นๆ" },
];

const statusOptions = [
  { key: "CheckIn", label: "เข้า" },
  { key: "CheckOut", label: "ออก" },
];

const thaiProvinces = [
  { key: "กรุงเทพมหานคร", label: "กรุงเทพมหานคร" },
  { key: "กระบี่", label: "กระบี่" },
  { key: "กาญจนบุรี", label: "กาญจนบุรี" },
  { key: "กาฬสินธุ์", label: "กาฬสินธุ์" },
  { key: "กำแพงเพชร", label: "กำแพงเพชร" },
  { key: "ขอนแก่น", label: "ขอนแก่น" },
  { key: "จันทบุรี", label: "จันทบุรี" },
  { key: "ฉะเชิงเทรา", label: "ฉะเชิงเทรา" },
  { key: "ชลบุรี", label: "ชลบุรี" },
  { key: "ชัยนาท", label: "ชัยนาท" },
  { key: "ชัยภูมิ", label: "ชัยภูมิ" },
  { key: "ชุมพร", label: "ชุมพร" },
  { key: "เชียงราย", label: "เชียงราย" },
  { key: "เชียงใหม่", label: "เชียงใหม่" },
  { key: "ตรัง", label: "ตรัง" },
  { key: "ตราด", label: "ตราด" },
  { key: "ตาก", label: "ตาก" },
  { key: "นครนายก", label: "นครนายก" },
  { key: "นครปฐม", label: "นครปฐม" },
  { key: "นครพนม", label: "นครพนม" },
  { key: "นครราชสีมา", label: "นครราชสีมา" },
  { key: "นครศรีธรรมราช", label: "นครศรีธรรมราช" },
  { key: "นครสวรรค์", label: "นครสวรรค์" },
  { key: "นนทบุรี", label: "นนทบุรี" },
  { key: "นราธิวาส", label: "นราธิวาส" },
  { key: "น่าน", label: "น่าน" },
  { key: "บึงกาฬ", label: "บึงกาฬ" },
  { key: "บุรีรัมย์", label: "บุรีรัมย์" },
  { key: "ปทุมธานี", label: "ปทุมธานี" },
  { key: "ประจวบคีรีขันธ์", label: "ประจวบคีรีขันธ์" },
  { key: "ปราจีนบุรี", label: "ปราจีนบุรี" },
  { key: "ปัตตานี", label: "ปัตตานี" },
  { key: "พระนครศรีอยุธยา", label: "พระนครศรีอยุธยา" },
  { key: "พังงา", label: "พังงา" },
  { key: "พัทลุง", label: "พัทลุง" },
  { key: "พิจิตร", label: "พิจิตร" },
  { key: "พิษณุโลก", label: "พิษณุโลก" },
  { key: "เพชรบุรี", label: "เพชรบุรี" },
  { key: "เพชรบูรณ์", label: "เพชรบูรณ์" },
  { key: "แพร่", label: "แพร่" },
  { key: "พะเยา", label: "พะเยา" },
  { key: "ภูเก็ต", label: "ภูเก็ต" },
  { key: "มหาสารคาม", label: "มหาสารคาม" },
  { key: "มุกดาหาร", label: "มุกดาหาร" },
  { key: "แม่ฮ่องสอน", label: "แม่ฮ่องสอน" },
  { key: "ยโสธร", label: "ยโสธร" },
  { key: "ยะลา", label: "ยะลา" },
  { key: "ร้อยเอ็ด", label: "ร้อยเอ็ด" },
  { key: "ระนอง", label: "ระนอง" },
  { key: "ระยอง", label: "ระยอง" },
  { key: "ราชบุรี", label: "ราชบุรี" },
  { key: "ลพบุรี", label: "ลพบุรี" },
  { key: "ลำปาง", label: "ลำปาง" },
  { key: "ลำพูน", label: "ลำพูน" },
  { key: "เลย", label: "เลย" },
  { key: "ศรีสะเกษ", label: "ศรีสะเกษ" },
  { key: "สกลนคร", label: "สกลนคร" },
  { key: "สงขลา", label: "สงขลา" },
  { key: "สตูล", label: "สตูล" },
  { key: "สมุทรปราการ", label: "สมุทรปราการ" },
  { key: "สมุทรสงคราม", label: "สมุทรสงคราม" },
  { key: "สมุทรสาคร", label: "สมุทรสาคร" },
  { key: "สระแก้ว", label: "สระแก้ว" },
  { key: "สระบุรี", label: "สระบุรี" },
  { key: "สิงห์บุรี", label: "สิงห์บุรี" },
  { key: "สุโขทัย", label: "สุโขทัย" },
  { key: "สุพรรณบุรี", label: "สุพรรณบุรี" },
  { key: "สุราษฎร์ธานี", label: "สุราษฎร์ธานี" },
  { key: "สุรินทร์", label: "สุรินทร์" },
  { key: "หนองคาย", label: "หนองคาย" },
  { key: "หนองบัวลำภู", label: "หนองบัวลำภู" },
  { key: "อ่างทอง", label: "อ่างทอง" },
  { key: "อุดรธานี", label: "อุดรธานี" },
  { key: "อุทัยธานี", label: "อุทัยธานี" },
  { key: "อุตรดิตถ์", label: "อุตรดิตถ์" },
  { key: "อุบลราชธานี", label: "อุบลราชธานี" },
  { key: "อำนาจเจริญ", label: "อำนาจเจริญ" },
];

function CameraModal({ isOpen, onClose, onCapture, label }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
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
          videoRef.current
            .play()
            .then(() => {
              setIsStreaming(true);
            })
            .catch((err) => {
              console.error("Error playing video:", err);
              setError("ไม่สามารถเล่นวิดีโอได้");
            });
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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
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
            const file = new File([blob], `photo_${Date.now()}.jpg`, {
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
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      size="2xl"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
            {label}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center w-full gap-4">
            {error && (
              <div className="text-danger text-sm p-4 bg-danger-50 rounded-lg w-full text-center">
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}

              {isStreaming && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-white/50 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-white/50 rounded-tr-lg"></div>
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
            variant="light"
            onPress={() => {
              stopCamera();
              onClose();
            }}
          >
            ยกเลิก
          </Button>
          <Button
            color="success"
            onPress={capturePhoto}
            isDisabled={!isStreaming}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            }
          >
            ถ่ายรูป
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function MultiCameraModal({
  isOpen,
  onClose,
  onCapture,
  label,
  capturedImages,
  setCapturedImages,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
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
          videoRef.current
            .play()
            .then(() => {
              setIsStreaming(true);
            })
            .catch((err) => {
              console.error("Error playing video:", err);
              setError("ไม่สามารถเล่นวิดีโอได้");
            });
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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
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
            const file = new File([blob], `doc_${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            const newImages = [
              ...capturedImages,
              { file, preview: URL.createObjectURL(blob) },
            ];
            setCapturedImages(newImages);
            onCapture(newImages.map((img) => img.file));
          }
        },
        "image/jpeg",
        0.9
      );
    }
  }, [capturedImages, setCapturedImages, onCapture]);

  const removeImage = useCallback(
    (index) => {
      const newImages = capturedImages.filter((_, i) => i !== index);
      setCapturedImages(newImages);
      onCapture(newImages.map((img) => img.file));
    },
    [capturedImages, setCapturedImages, onCapture]
  );

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      size="3xl"
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            {label}
            {capturedImages.length > 0 && (
              <span className="text-sm text-default-500">
                ({capturedImages.length} รูป)
              </span>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center w-full gap-4">
            {error && (
              <div className="text-danger text-sm p-4 bg-danger-50 rounded-lg w-full text-center">
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}

              {isStreaming && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-white/50 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-white/50 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-white/50 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-white/50 rounded-br-lg"></div>
                </div>
              )}
            </div>

            {capturedImages.length > 0 && (
              <div className="w-full">
                <div className="text-sm text-default-600 mb-2">
                  รูปที่ถ่ายแล้ว:
                </div>
                <div className="flex flex-wrap gap-2">
                  {capturedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={img.preview}
                        alt={`Document ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        color="danger"
                        variant="solid"
                        size="sm"
                        radius="full"
                        isIconOnly
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={() => removeImage(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={() => {
              stopCamera();
              onClose();
            }}
          >
            เสร็จสิ้น
          </Button>
          <Button
            color="success"
            onPress={capturePhoto}
            isDisabled={!isStreaming}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            }
          >
            ถ่ายรูป
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function PhotoCaptureCard({
  label,
  capturedImage,
  existingImage,
  onOpenCamera,
  onClear,
  error,
}) {
  const displayImage =
    capturedImage || (existingImage ? `/${existingImage}` : null);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4 border-1 rounded-xl bg-default-50">
      <div className="flex items-center justify-center w-full gap-2 font-semibold text-default-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
          />
        </svg>
        {label}
      </div>

      {displayImage ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <Image
              src={displayImage}
              alt="Captured"
              className="max-w-full max-h-48 object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              color="success"
              variant="flat"
              size="sm"
              radius="sm"
              onPress={onOpenCamera}
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              }
            >
              ถ่ายใหม่
            </Button>
            <Button
              type="button"
              color="danger"
              variant="flat"
              size="sm"
              radius="sm"
              onPress={onClear}
            >
              ลบ
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-10 h-10 text-default-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
          </div>
          <p className="text-sm text-default-500">ยังไม่มีรูปภาพ</p>
          <Button
            type="button"
            color="success"
            variant="solid"
            size="md"
            radius="sm"
            onPress={onOpenCamera}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            }
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

function DocumentCaptureCard({
  label,
  capturedImages,
  existingImages,
  onOpenCamera,
  onClear,
  onRemove,
  error,
}) {
  const parsedExistingImages = React.useMemo(() => {
    if (!existingImages) return [];
    try {
      return JSON.parse(existingImages);
    } catch (_) {
      return [];
    }
  }, [existingImages]);

  const displayImages =
    capturedImages.length > 0
      ? capturedImages.map((img) => img.preview)
      : parsedExistingImages.map((path) => `/${path}`);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4 border-1 rounded-xl bg-default-50">
      <div className="flex items-center justify-center w-full gap-2 font-semibold text-default-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        {label}
        {displayImages.length > 0 && (
          <span className="text-sm text-default-500">
            ({displayImages.length} รูป)
          </span>
        )}
      </div>

      {displayImages.length > 0 ? (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex flex-wrap justify-center gap-2 w-full">
            {displayImages.map((src, index) => (
              <div key={index} className="relative group">
                <Image
                  src={src}
                  alt={`Document ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg shadow-lg"
                />
                {capturedImages.length > 0 && (
                  <Button
                    type="button"
                    color="danger"
                    variant="solid"
                    size="sm"
                    radius="full"
                    isIconOnly
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => onRemove(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              color="success"
              variant="flat"
              size="sm"
              radius="sm"
              onPress={onOpenCamera}
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              }
            >
              เพิ่มรูป
            </Button>
            {capturedImages.length > 0 && (
              <Button
                type="button"
                color="danger"
                variant="flat"
                size="sm"
                radius="sm"
                onPress={onClear}
              >
                ล้างทั้งหมด
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-10 h-10 text-default-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <p className="text-sm text-default-500">ยังไม่มีเอกสาร</p>
          <Button
            type="button"
            color="success"
            variant="solid"
            size="md"
            radius="sm"
            onPress={onOpenCamera}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            }
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

export default function UIVisitorForm({
  formHandler,
  mode,
  isUpdate,
  operatedBy,
  employees = [],
  existingPhoto,
  existingDocumentPhotos,
}) {
  const { formRef, formData, handleChange, handleSubmit, errors, setFormData } =
    formHandler;

  const photoModal = useDisclosure();
  const docModal = useDisclosure();

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedDocuments, setCapturedDocuments] = useState([]);

  const handlePhotoCapture = useCallback(
    (file, preview) => {
      setCapturedPhoto(preview);
      setFormData((prev) => ({ ...prev, visitorPhoto: file }));
    },
    [setFormData]
  );

  const handleClearPhoto = useCallback(() => {
    setCapturedPhoto(null);
    setFormData((prev) => ({ ...prev, visitorPhoto: null }));
  }, [setFormData]);

  const handleDocumentPhotosCapture = useCallback(
    (files) => {
      setFormData((prev) => ({ ...prev, visitorDocumentPhotos: files }));
    },
    [setFormData]
  );

  const handleClearDocuments = useCallback(() => {
    setCapturedDocuments([]);
    setFormData((prev) => ({ ...prev, visitorDocumentPhotos: [] }));
  }, [setFormData]);

  const handleRemoveDocument = useCallback(
    (index) => {
      const newImages = capturedDocuments.filter((_, i) => i !== index);
      setCapturedDocuments(newImages);
      setFormData((prev) => ({
        ...prev,
        visitorDocumentPhotos: newImages.map((img) => img.file),
      }));
    },
    [capturedDocuments, setFormData]
  );

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-start w-full xl:w-12/12 h-full gap-2 border-1 rounded-xl overflow-auto"
      >
        <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center h-full p-4 gap-2 border-b-1">
            {mode === "create"
              ? `สร้างโดย : ${operatedBy}`
              : `แก้ไขโดย : ${operatedBy}`}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Input
              name="visitorFirstName"
              type="text"
              label="ชื่อ"
              labelPlacement="outside"
              placeholder="กรอกชื่อ"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              value={formData.visitorFirstName || ""}
              onChange={handleChange("visitorFirstName")}
              isInvalid={!!errors.visitorFirstName}
              errorMessage={
                errors.visitorFirstName?.[0] || errors.visitorFirstName
              }
            />
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Input
              name="visitorLastName"
              type="text"
              label="นามสกุล"
              labelPlacement="outside"
              placeholder="กรอกนามสกุล"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              value={formData.visitorLastName || ""}
              onChange={handleChange("visitorLastName")}
              isInvalid={!!errors.visitorLastName}
              errorMessage={
                errors.visitorLastName?.[0] || errors.visitorLastName
              }
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Input
              name="visitorCompany"
              type="text"
              label="บริษัท"
              labelPlacement="outside"
              placeholder="กรอกชื่อบริษัท"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              value={formData.visitorCompany || ""}
              onChange={handleChange("visitorCompany")}
              isInvalid={!!errors.visitorCompany}
              errorMessage={errors.visitorCompany?.[0] || errors.visitorCompany}
            />
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Input
              name="visitorCarRegistration"
              type="text"
              label="ทะเบียนรถ"
              labelPlacement="outside"
              placeholder="กรอกทะเบียนรถ"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              value={formData.visitorCarRegistration || ""}
              onChange={handleChange("visitorCarRegistration")}
              isInvalid={!!errors.visitorCarRegistration}
              errorMessage={
                errors.visitorCarRegistration?.[0] ||
                errors.visitorCarRegistration
              }
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Select
              name="visitorProvince"
              label="จังหวัด"
              labelPlacement="outside"
              placeholder="กรุณาเลือก"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              selectedKeys={
                formData.visitorProvince ? [formData.visitorProvince] : []
              }
              onSelectionChange={(keys) =>
                handleChange("visitorProvince")([...keys][0])
              }
              isInvalid={!!errors.visitorProvince}
              errorMessage={
                errors.visitorProvince?.[0] || errors.visitorProvince
              }
            >
              {thaiProvinces.map((province) => (
                <SelectItem key={province.key}>{province.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Select
              name="visitorContactUserId"
              label="ผู้ติดต่อ"
              labelPlacement="outside"
              placeholder="กรุณาเลือก"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              selectedKeys={
                formData.visitorContactUserId
                  ? [formData.visitorContactUserId]
                  : []
              }
              onSelectionChange={(keys) =>
                handleChange("visitorContactUserId")([...keys][0])
              }
              isInvalid={!!errors.visitorContactUserId}
              errorMessage={
                errors.visitorContactUserId?.[0] || errors.visitorContactUserId
              }
            >
              {employees.map((emp) => (
                <SelectItem key={emp.employeeId}>
                  {`${emp.employeeFirstName} ${emp.employeeLastName}`}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Select
              name="visitorContactReason"
              label="เหตุผลการติดต่อ"
              labelPlacement="outside"
              placeholder="กรุณาเลือก"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              selectedKeys={
                formData.visitorContactReason
                  ? [formData.visitorContactReason]
                  : []
              }
              onSelectionChange={(keys) =>
                handleChange("visitorContactReason")([...keys][0])
              }
              isInvalid={!!errors.visitorContactReason}
              errorMessage={
                errors.visitorContactReason?.[0] || errors.visitorContactReason
              }
            >
              {contactReasonOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {isUpdate && (
          <div className="flex flex-col xl:flex-row items-center justify-end w-full h-fit p-2 gap-2">
            <div className="flex items-center justify-center w-full xl:w-6/12 h-full p-2 gap-2">
              <Select
                name="visitorStatus"
                label="สถานะผู้เยี่ยมชม"
                labelPlacement="outside"
                placeholder="กรุณาเลือก"
                color="default"
                variant="bordered"
                size="lg"
                radius="sm"
                isRequired
                selectedKeys={
                  formData.visitorStatus ? [formData.visitorStatus] : []
                }
                onSelectionChange={(keys) =>
                  handleChange("visitorStatus")([...keys][0])
                }
                isInvalid={!!errors.visitorStatus}
                errorMessage={errors.visitorStatus?.[0] || errors.visitorStatus}
              >
                {statusOptions.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row items-start justify-center w-full h-fit p-2 gap-4">
          <div className="w-full xl:w-6/12">
            <PhotoCaptureCard
              label="รูปถ่ายผู้เข้าเยี่ยม"
              capturedImage={capturedPhoto}
              existingImage={existingPhoto}
              onOpenCamera={photoModal.onOpen}
              onClear={handleClearPhoto}
              error={errors.visitorPhoto}
            />
          </div>
          <div className="w-full xl:w-6/12">
            <DocumentCaptureCard
              label="รูปถ่ายเอกสาร"
              capturedImages={capturedDocuments}
              existingImages={existingDocumentPhotos}
              onOpenCamera={docModal.onOpen}
              onClear={handleClearDocuments}
              onRemove={handleRemoveDocument}
              error={errors.visitorDocumentPhotos}
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

      <CameraModal
        isOpen={photoModal.isOpen}
        onClose={photoModal.onClose}
        onCapture={handlePhotoCapture}
        label="ถ่ายรูปผู้เข้าเยี่ยม"
      />

      <MultiCameraModal
        isOpen={docModal.isOpen}
        onClose={docModal.onClose}
        onCapture={handleDocumentPhotosCapture}
        label="ถ่ายรูปเอกสาร"
        capturedImages={capturedDocuments}
        setCapturedImages={setCapturedDocuments}
      />
    </>
  );
}
