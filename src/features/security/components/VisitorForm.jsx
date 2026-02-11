"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Image } from "@heroui/image";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Camera, FileText, RefreshCw, Plus, X } from "lucide-react";

const contactReasonOptions = [
  { key: "Shipping", label: "Shipping" },
  { key: "BillingChequeCollection", label: "Cheque Collection / Billing" },
  { key: "JobApplication", label: "Job Application" },
  { key: "ProductPresentation", label: "Product Presentation" },
  { key: "Meeting", label: "Meeting" },
  { key: "Other", label: "Other" },
];

const statusOptions = [
  { key: "CheckIn", label: "Check In" },
  { key: "CheckOut", label: "Check Out" },
];

const thaiProvinces = [
  { key: "กรุงเทพมหานคร", label: "Bangkok" },
  { key: "กระบี่", label: "Krabi" },
  { key: "กาญจนบุรี", label: "Kanchanaburi" },
  { key: "กาฬสินธุ์", label: "Kalasin" },
  { key: "กำแพงเพชร", label: "Kamphaeng Phet" },
  { key: "ขอนแก่น", label: "Khon Kaen" },
  { key: "จันทบุรี", label: "Chanthaburi" },
  { key: "ฉะเชิงเทรา", label: "Chachoengsao" },
  { key: "ชลบุรี", label: "Chon Buri" },
  { key: "ชัยนาท", label: "Chai Nat" },
  { key: "ชัยภูมิ", label: "Chaiyaphum" },
  { key: "ชุมพร", label: "Chumphon" },
  { key: "เชียงราย", label: "Chiang Rai" },
  { key: "เชียงใหม่", label: "Chiang Mai" },
  { key: "ตรัง", label: "Trang" },
  { key: "ตราด", label: "Trat" },
  { key: "ตาก", label: "Tak" },
  { key: "นครนายก", label: "Nakhon Nayok" },
  { key: "นครปฐม", label: "Nakhon Pathom" },
  { key: "นครพนม", label: "Nakhon Phanom" },
  { key: "นครราชสีมา", label: "Nakhon Ratchasima" },
  { key: "นครศรีธรรมราช", label: "Nakhon Si Thammarat" },
  { key: "นครสวรรค์", label: "Nakhon Sawan" },
  { key: "นนทบุรี", label: "Nonthaburi" },
  { key: "นราธิวาส", label: "Narathiwat" },
  { key: "น่าน", label: "Nan" },
  { key: "บึงกาฬ", label: "Bueng Kan" },
  { key: "บุรีรัมย์", label: "Buri Ram" },
  { key: "ปทุมธานี", label: "Pathum Thani" },
  { key: "ประจวบคีรีขันธ์", label: "Prachuap Khiri Khan" },
  { key: "ปราจีนบุรี", label: "Prachin Buri" },
  { key: "ปัตตานี", label: "Pattani" },
  { key: "พระนครศรีอยุธยา", label: "Phra Nakhon Si Ayutthaya" },
  { key: "พังงา", label: "Phang Nga" },
  { key: "พัทลุง", label: "Phatthalung" },
  { key: "พิจิตร", label: "Phichit" },
  { key: "พิษณุโลก", label: "Phitsanulok" },
  { key: "เพชรบุรี", label: "Phetchaburi" },
  { key: "เพชรบูรณ์", label: "Phetchabun" },
  { key: "แพร่", label: "Phrae" },
  { key: "พะเยา", label: "Phayao" },
  { key: "ภูเก็ต", label: "Phuket" },
  { key: "มหาสารคาม", label: "Maha Sarakham" },
  { key: "มุกดาหาร", label: "Mukdahan" },
  { key: "แม่ฮ่องสอน", label: "Mae Hong Son" },
  { key: "ยโสธร", label: "Yasothon" },
  { key: "ยะลา", label: "Yala" },
  { key: "ร้อยเอ็ด", label: "Roi Et" },
  { key: "ระนอง", label: "Ranong" },
  { key: "ระยอง", label: "Rayong" },
  { key: "ราชบุรี", label: "Ratchaburi" },
  { key: "ลพบุรี", label: "Lop Buri" },
  { key: "ลำปาง", label: "Lampang" },
  { key: "ลำพูน", label: "Lamphun" },
  { key: "เลย", label: "Loei" },
  { key: "ศรีสะเกษ", label: "Si Sa Ket" },
  { key: "สกลนคร", label: "Sakon Nakhon" },
  { key: "สงขลา", label: "Songkhla" },
  { key: "สตูล", label: "Satun" },
  { key: "สมุทรปราการ", label: "Samut Prakan" },
  { key: "สมุทรสงคราม", label: "Samut Songkhram" },
  { key: "สมุทรสาคร", label: "Samut Sakhon" },
  { key: "สระแก้ว", label: "Sa Kaeo" },
  { key: "สระบุรี", label: "Saraburi" },
  { key: "สิงห์บุรี", label: "Sing Buri" },
  { key: "สุโขทัย", label: "Sukhothai" },
  { key: "สุพรรณบุรี", label: "Suphan Buri" },
  { key: "สุราษฎร์ธานี", label: "Surat Thani" },
  { key: "สุรินทร์", label: "Surin" },
  { key: "หนองคาย", label: "Nong Khai" },
  { key: "หนองบัวลำภู", label: "Nong Bua Lam Phu" },
  { key: "อ่างทอง", label: "Ang Thong" },
  { key: "อุดรธานี", label: "Udon Thani" },
  { key: "อุทัยธานี", label: "Uthai Thani" },
  { key: "อุตรดิตถ์", label: "Uttaradit" },
  { key: "อุบลราชธานี", label: "Ubon Ratchathani" },
  { key: "อำนาจเจริญ", label: "Amnat Charoen" },
];

const inputClassNames = {
  label: "text-default-600 text-xs font-medium",
  input: "text-sm",
  inputWrapper: "border-default hover:border-default shadow-none",
};

const selectClassNames = {
  label: "text-default-600 text-xs font-medium",
  trigger: "border-default hover:border-default shadow-none",
};

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
              setError("Unable to play video");
            });
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

  useEffect(() => {
    return () => {

      setTimeout(() => {
        stopCamera();
      }, 0);
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
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Camera />
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
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-1 border-white"></div>
                </div>
              )}
              {isStreaming && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-4 w-16 h-16 border-l-4 border-t-4 border-white/50 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-4 w-16 h-16 border-r-4 border-t-4 border-white/50 rounded-tr-lg"></div>
                  <div className="absolute botto left-4 w-16 h-16 border-l-4 border-b-4 border-white/50 rounded-bl-lg"></div>
                  <div className="absolute botto right-4 w-16 h-16 border-r-4 border-b-4 border-white/50 rounded-br-lg"></div>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            size="sm"
            radius="sm"
            className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
            onPress={() => {
              stopCamera();
              onClose();
            }}
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
              setError("Unable to play video");
            });
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
        0.9,
      );
    }
  }, [capturedImages, setCapturedImages, onCapture]);

  const removeImage = useCallback(
    (index) => {
      const newImages = capturedImages.filter((_, i) => i !== index);
      setCapturedImages(newImages);
      onCapture(newImages.map((img) => img.file));
    },
    [capturedImages, setCapturedImages, onCapture],
  );

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

  useEffect(() => {
    return () => {

      setTimeout(() => {
        stopCamera();
      }, 0);
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
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FileText />
            {label}
            {capturedImages.length > 0 && (
              <span className="text-sm text-default-500">
                ({capturedImages.length} photo(s))
              </span>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center w-full gap-2">
            {error && (
              <div className="text-danger text-sm p-2 bg-danger-50 rounded-lg w-full text-center">
                {error}
              </div>
            )}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-1 border-white"></div>
                </div>
              )}
              {isStreaming && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-4 w-16 h-16 border-l-4 border-t-4 border-white/50 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-4 w-16 h-16 border-r-4 border-t-4 border-white/50 rounded-tr-lg"></div>
                  <div className="absolute botto left-4 w-16 h-16 border-l-4 border-b-4 border-white/50 rounded-bl-lg"></div>
                  <div className="absolute botto right-4 w-16 h-16 border-r-4 border-b-4 border-white/50 rounded-br-lg"></div>
                </div>
              )}
            </div>
            {capturedImages.length > 0 && (
              <div className="w-full">
                <div className="text-sm text-default-600">
                  Captured photos:
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
                        size="sm"
                        radius="sm"
                        isIconOnly
                        className="bg-foreground text-background absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={() => removeImage(index)}
                      >
                        <X size={12} />
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
            size="sm"
            radius="sm"
            className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
            onPress={() => {
              stopCamera();
              onClose();
            }}
          >
            Done
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

function PhotoCaptureCard({
  label,
  capturedImage,
  existingImage,
  onOpenCamera,
  onClear,
  error,
}) {
  const displayImage =
    capturedImage || (existingImage ? `/api/uploads/${existingImage}` : null);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 bg-background rounded-lg border border-default">
      <div className="flex items-center justify-center w-full gap-2 text-sm font-medium text-default-700">
        <Camera size={16} />
        {label}
      </div>
      {displayImage ? (
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <Image
              src={displayImage}
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
        <div className="flex flex-col items-center gap-2 p-2">
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
        <div className="text-danger text-xs">{error?.[0] || error}</div>
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
      : parsedExistingImages.map((path) => `/api/uploads/${path}`);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 bg-background rounded-lg border border-default">
      <div className="flex items-center justify-center w-full gap-2 text-sm font-medium text-default-700">
        <FileText size={16} />
        {label}
        {displayImages.length > 0 && (
          <span className="text-[12px] text-default-400">
            ({displayImages.length} photo(s))
          </span>
        )}
      </div>
      {displayImages.length > 0 ? (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex flex-wrap justify-center gap-2 w-full">
            {displayImages.map((src, index) => (
              <div key={index} className="relative group">
                <Image
                  src={src}
                  alt={`Document ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                {capturedImages.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    radius="sm"
                    isIconOnly
                    className="bg-foreground text-background absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => onRemove(index)}
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              radius="sm"
              className="bg-foreground text-background font-medium hover:bg-default-800"
              onPress={onOpenCamera}
              startContent={<Plus size={14} />}
            >
              Add Photo
            </Button>
            {capturedImages.length > 0 && (
              <Button
                type="button"
                size="sm"
                radius="sm"
                className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
                onPress={onClear}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-2">
          <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
            <FileText className="text-default-400" size={20} />
          </div>
          <p className="text-[12px] text-default-400">No documents yet</p>
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
        <div className="text-danger text-xs">{error?.[0] || error}</div>
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
    [setFormData],
  );

  const handleClearPhoto = useCallback(() => {
    setCapturedPhoto(null);
    setFormData((prev) => ({ ...prev, visitorPhoto: null }));
  }, [setFormData]);

  const handleDocumentPhotosCapture = useCallback(
    (files) => {
      setFormData((prev) => ({ ...prev, visitorDocumentPhotos: files }));
    },
    [setFormData],
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
    [capturedDocuments, setFormData],
  );

  return (
    <>
      <div className="flex flex-col w-full h-full overflow-auto p-2">
        <div className="w-full h-full">
          <div className="bg-background rounded-lg border border-default h-full flex flex-col">
            <div className="p-2 border-b border-default">
              <h2 className="text-[13px] font-semibold text-foreground">
                {mode === "create" ? "Register Visitor" : "Edit Visitor"}
              </h2>
              <p className="text-[12px] text-default-400">
                {mode === "create" ? "Add a new visitor record" : "Edit visitor information"}
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
              <div className="flex flex-col xl:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    name="visitorFirstName"
              type="text"
              label="First Name"
              labelPlacement="outside"
              placeholder="Enter first name"
              variant="bordered"
              size="md"
              radius="sm"
              isRequired
              value={formData.visitorFirstName || ""}
              onChange={handleChange("visitorFirstName")}
              isInvalid={!!errors.visitorFirstName}
              errorMessage={
                errors.visitorFirstName?.[0] || errors.visitorFirstName
              }
              classNames={inputClassNames}
            />
          </div>
          <div className="flex-1">
            <Input
              name="visitorLastName"
              type="text"
              label="Last Name"
              labelPlacement="outside"
              placeholder="Enter last name"
              variant="bordered"
              size="md"
              radius="sm"
              isRequired
              value={formData.visitorLastName || ""}
              onChange={handleChange("visitorLastName")}
              isInvalid={!!errors.visitorLastName}
              errorMessage={
                errors.visitorLastName?.[0] || errors.visitorLastName
              }
              classNames={inputClassNames}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-2 w-full">
          <div className="flex-1">
            <Input
              name="visitorCompany"
              type="text"
              label="Company"
              labelPlacement="outside"
              placeholder="Enter company name"
              variant="bordered"
              size="md"
              radius="sm"
              isRequired
              value={formData.visitorCompany || ""}
              onChange={handleChange("visitorCompany")}
              isInvalid={!!errors.visitorCompany}
              errorMessage={errors.visitorCompany?.[0] || errors.visitorCompany}
              classNames={inputClassNames}
            />
          </div>
          <div className="flex-1">
            <Input
              name="visitorCarRegistration"
              type="text"
              label="License Plate"
              labelPlacement="outside"
              placeholder="Enter license plate"
              variant="bordered"
              size="md"
              radius="sm"
              isRequired
              value={formData.visitorCarRegistration || ""}
              onChange={handleChange("visitorCarRegistration")}
              isInvalid={!!errors.visitorCarRegistration}
              errorMessage={
                errors.visitorCarRegistration?.[0] ||
                errors.visitorCarRegistration
              }
              classNames={inputClassNames}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-2 w-full">
          <div className="flex-1">
            <Select
              name="visitorProvince"
              label="Province"
              labelPlacement="outside"
              placeholder="Please select"
              variant="bordered"
              size="md"
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
              classNames={selectClassNames}
            >
              {thaiProvinces.map((province) => (
                <SelectItem key={province.key}>{province.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Select
              name="visitorContactUserId"
              label="Contact Person"
              labelPlacement="outside"
              placeholder="Please select"
              variant="bordered"
              size="md"
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
              classNames={selectClassNames}
            >
              {employees.map((emp) => (
                <SelectItem key={emp.employeeId}>
                  {`${emp.employeeFirstName} ${emp.employeeLastName}`}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-2 w-full">
          <div className="flex-1">
            <Select
              name="visitorContactReason"
              label="Contact Reason"
              labelPlacement="outside"
              placeholder="Please select"
              variant="bordered"
              size="md"
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
              classNames={selectClassNames}
            >
              {contactReasonOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>

          {isUpdate && (
            <div className="flex-1">
              <Select
                name="visitorStatus"
                label="Visitor Status"
                labelPlacement="outside"
                placeholder="Please select"
                variant="bordered"
                size="md"
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
                classNames={selectClassNames}
              >
                {statusOptions.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>
          )}
        </div>

        <div className="flex flex-col xl:flex-row gap-2 w-full">
          <div className="flex-1">
            <PhotoCaptureCard
              label="Visitor Photo"
              capturedImage={capturedPhoto}
              existingImage={existingPhoto}
              onOpenCamera={photoModal.onOpen}
              onClear={handleClearPhoto}
              error={errors.visitorPhoto}
            />
          </div>
          <div className="flex-1">
            <DocumentCaptureCard
              label="Document Photos"
              capturedImages={capturedDocuments}
              existingImages={existingDocumentPhotos}
              onOpenCamera={docModal.onOpen}
              onClear={handleClearDocuments}
              onRemove={handleRemoveDocument}
              error={errors.visitorDocumentPhotos}
            />
          </div>
        </div>

              <div className="flex items-center justify-between pt-4 border-t border-default">
                <span className="text-xs text-default-400">
                  {mode === "create" ? `Create by: ${operatedBy}` : `Update by: ${operatedBy}`}
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

      <CameraModal
        isOpen={photoModal.isOpen}
        onClose={photoModal.onClose}
        onCapture={handlePhotoCapture}
        label="Capture Visitor Photo"
      />

      <MultiCameraModal
        isOpen={docModal.isOpen}
        onClose={docModal.onClose}
        onCapture={handleDocumentPhotosCapture}
        label="Capture Document Photo"
        capturedImages={capturedDocuments}
        setCapturedImages={setCapturedDocuments}
      />
    </>
  );
}
