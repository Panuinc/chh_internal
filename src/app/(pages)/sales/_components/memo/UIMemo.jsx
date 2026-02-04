"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Divider,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Printer,
  FileText,
  User,
  Calendar,
  Save,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Eye,
  List,
  PenSquare,
  Search,
} from "lucide-react";
import { useMemos } from "@/app/(pages)/sales/_hooks";
import { showToast } from "@/components";

// Thai date formatter
function formatThaiDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDate();
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day}-${month}-${year.toString().slice(2)}`;
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Signature Component
function SignatureBox({ title, name, date, signatureImage }) {
  return (
    <div className="flex flex-col items-center justify-end w-48 h-32 border-t border-gray-400 pt-2">
      <div className="flex-1 flex items-center justify-center w-full">
        {signatureImage ? (
          <Image
            src={signatureImage}
            alt={`${title} signature`}
            className="max-h-16 object-contain"
          />
        ) : (
          <div className="text-gray-300 text-xs">(ลายเซ็น)</div>
        )}
      </div>
      <div className="text-center">
        <div className="text-sm font-medium">{name || "........................"}</div>
        <div className="text-xs text-gray-600">{title}</div>
        {date && <div className="text-xs text-gray-500 mt-1">วันที่ {date}</div>}
      </div>
    </div>
  );
}

// Printable Memo Document
const PrintableMemo = React.forwardRef(({ data }, ref) => {
  const {
    documentNo,
    to,
    copy,
    subject,
    date,
    content,
    requesterName,
    requesterDate,
    salesManagerName,
    salesManagerDate,
    ceoName,
    ceoDate,
  } = data;

  return (
    <div
      ref={ref}
      className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-black"
      style={{ fontFamily: "'Sarabun', 'TH Sarabun New', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-16 h-16 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">EVERGREEN</div>
              <div className="text-[8px] text-green-700">GREEN CONSTRUCTION MATERIALS</div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="text-right text-xs leading-tight">
          <div className="font-bold">C.H.H. INDUSTRY CO., LTD.</div>
          <div>9/1 Moo.2 Banglen-Lardloomkeaw rd., T.Khunsri A.Sainoi Nonthaburi 11150</div>
          <div>Tel: (66) 02-921-9979-80 Fax: 02-921-9978 WWW.CHHTHAILAND.COM</div>
          <div className="mt-1">บริษัท ชื่ออะซาว อุตสาหกรรม จำกัด</div>
          <div>9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150</div>
          <div>โทร: 02-921-9979-80 แฟกซ์ 02-921-9978 WWW.CHHTHAILAND.COM</div>
        </div>
      </div>

      {/* MEMO Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-wider">MEMO</h1>
      </div>

      {/* Memo Info */}
      <div className="mb-6 space-y-1 text-sm">
        <div className="flex">
          <span className="w-16 font-medium">เรียน</span>
          <span className="flex-1">{to || "........................"}</span>
        </div>
        <div className="flex">
          <span className="w-16 font-medium">สำเนา</span>
          <span className="flex-1">{copy || "........................"}</span>
        </div>
        <div className="flex">
          <span className="w-16 font-medium">เรื่อง</span>
          <span className="flex-1 font-medium">{subject || "........................"}</span>
        </div>
        <div className="flex">
          <span className="w-16 font-medium">วันที่</span>
          <span className="flex-1">{date || formatThaiDate()}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-800 mb-6"></div>

      {/* Document No */}
      <div className="mb-4 text-sm">
        <span className="font-medium">เลขที่เอกสาร:</span>{" "}
        <span>{documentNo || "........................"}</span>
      </div>

      {/* Content */}
      <div className="mb-12 text-sm leading-relaxed min-h-[200px] whitespace-pre-wrap">
        {content || (
          <div className="space-y-4">
            <p className="indent-8">
              ขออนุมัติผลิตบานประตู UPVC จำนวน 2 บาน บานประตู HMR กระจกใส 0.5 จำนวน 1 บาน
              บานประตูเวลามีแผ่นมาตรฐานโรงงาน จำนวน 1 บาน เพื่อนำไปทดสอบที่วันศาสตร์เกษตร และอุตสาหกรรมครัวเรือน
            </p>
            <p className="text-center mt-8">เรียนมาเพื่อขออนุมัติ</p>
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-16 px-8">
        {/* Requester */}
        <SignatureBox
          title="ผู้ร้องขอ"
          name={requesterName}
          date={requesterDate}
        />

        {/* Sales Manager */}
        <SignatureBox
          title="ผู้จัดการเซลล์"
          name={salesManagerName}
          date={salesManagerDate}
        />

        {/* CEO */}
        <SignatureBox
          title="กรรมการผู้จัดการ"
          name={ceoName}
          date={ceoDate}
        />
      </div>
    </div>
  );
});

PrintableMemo.displayName = "PrintableMemo";

// Memo Form Component
function MemoForm({ 
  initialData = null, 
  onSave, 
  onPrint, 
  onReset, 
  printRef, 
  printData,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    documentNo: initialData?.memoDocumentNo || "",
    to: initialData?.memoTo || "",
    copy: initialData?.memoCopy || "",
    subject: initialData?.memoSubject || "",
    date: initialData?.memoDate 
      ? new Date(initialData.memoDate).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0],
    content: initialData?.memoContent || "",
    requesterName: initialData?.memoRequesterName || "",
    requesterDate: initialData?.memoRequesterDate || formatThaiDate(),
    salesManagerName: initialData?.memoSalesManagerName || "",
    salesManagerDate: initialData?.memoSalesManagerDate || "",
    ceoName: initialData?.memoCeoName || "",
    ceoDate: initialData?.memoCeoDate || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  const currentPrintData = {
    ...formData,
    date: formatThaiDate(formData.date),
    requesterDate: formData.requesterDate || formatThaiDate(),
    salesManagerDate: formData.salesManagerDate || "........../........../..........",
    ceoDate: formData.ceoDate || "........../........../..........",
  };

  return (
    <div className="flex flex-1 gap-4 overflow-hidden">
      {/* Form Panel */}
      <Card className="w-96 flex-shrink-0 overflow-auto">
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            ข้อมูลเอกสาร
          </h2>

          <Input
            label="เลขที่เอกสาร"
            placeholder="ME-XXXX-XX"
            value={formData.documentNo}
            onChange={(e) => handleChange("documentNo", e.target.value)}
            startContent={<FileText className="w-4 h-4 text-foreground/50" />}
          />

          <Input
            label="วันที่"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            startContent={<Calendar className="w-4 h-4 text-foreground/50" />}
          />

          <Divider />

          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            ผู้รับ/ผู้เกี่ยวข้อง
          </h2>

          <Input
            label="เรียน (To)"
            placeholder="ชื่อผู้รับ"
            value={formData.to}
            onChange={(e) => handleChange("to", e.target.value)}
            startContent={<User className="w-4 h-4 text-foreground/50" />}
          />

          <Input
            label="สำเนา (Copy)"
            placeholder="ชื่อผู้รับสำเนา"
            value={formData.copy}
            onChange={(e) => handleChange("copy", e.target.value)}
            startContent={<User className="w-4 h-4 text-foreground/50" />}
          />

          <Input
            label="เรื่อง (Subject)"
            placeholder="หัวข้อเรื่อง"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            startContent={<FileText className="w-4 h-4 text-foreground/50" />}
          />

          <Divider />

          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            รายละเอียด
          </h2>

          <Textarea
            label="เนื้อหา"
            placeholder="รายละเอียดเนื้อหา..."
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            minRows={6}
          />

          <Divider />

          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            ลงชื่อ
          </h2>

          <Input
            label="ผู้ร้องขอ"
            placeholder="ชื่อผู้ร้องขอ"
            value={formData.requesterName}
            onChange={(e) => handleChange("requesterName", e.target.value)}
          />

          <Input
            label="วันที่ลงชื่อ (ผู้ร้องขอ)"
            placeholder="12/11/68"
            value={formData.requesterDate}
            onChange={(e) => handleChange("requesterDate", e.target.value)}
          />

          <Input
            label="ผู้จัดการเซลล์"
            placeholder="ชื่อผู้จัดการเซลล์"
            value={formData.salesManagerName}
            onChange={(e) => handleChange("salesManagerName", e.target.value)}
          />

          <Input
            label="วันที่ลงชื่อ (ผู้จัดการเซลล์)"
            placeholder="12/11/68"
            value={formData.salesManagerDate}
            onChange={(e) => handleChange("salesManagerDate", e.target.value)}
          />

          <Input
            label="กรรมการผู้จัดการ (CEO)"
            placeholder="ชื่อ CEO"
            value={formData.ceoName}
            onChange={(e) => handleChange("ceoName", e.target.value)}
          />

          <Input
            label="วันที่ลงชื่อ (CEO)"
            placeholder="12/11/68"
            value={formData.ceoDate}
            onChange={(e) => handleChange("ceoDate", e.target.value)}
          />

          <div className="flex gap-2 pt-4">
            <Button
              color="primary"
              variant="flat"
              startContent={<Save className="w-4 h-4" />}
              onPress={handleSave}
              className="flex-1"
            >
              {isEditing ? "บันทึกการแก้ไข" : "บันทึก"}
            </Button>
            <Button
              color="primary"
              startContent={<Printer className="w-4 h-4" />}
              onPress={onPrint}
              className="flex-1"
            >
              พิมพ์
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Preview Panel */}
      <Card className="flex-1 overflow-auto">
        <CardBody className="bg-gray-100 flex items-start justify-center p-8">
          <div className="shadow-2xl">
            <PrintableMemo ref={printRef} data={currentPrintData} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Memo List Component
function MemoList({ memos, loading, onEdit, onDelete, onView }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);

  const handleDeleteClick = (memo) => {
    setSelectedMemo(memo);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedMemo) {
      onDelete?.(selectedMemo.memoId);
      setDeleteModalOpen(false);
      setSelectedMemo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground/60">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <>
      <Card className="flex-1 overflow-auto">
        <CardBody>
          <Table aria-label="Memo list">
            <TableHeader>
              <TableColumn>เลขที่เอกสาร</TableColumn>
              <TableColumn>เรื่อง</TableColumn>
              <TableColumn>เรียน</TableColumn>
              <TableColumn>วันที่</TableColumn>
              <TableColumn>ผู้ร้องขอ</TableColumn>
              <TableColumn>วันที่สร้าง</TableColumn>
              <TableColumn width={120}>Actions</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="text-center py-8 text-foreground/60">
                  ไม่พบข้อมูลบันทึกข้อความ
                </div>
              }
            >
              {memos.map((memo) => (
                <TableRow key={memo.memoId}>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {memo.memoDocumentNo}
                    </Chip>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {memo.memoSubject}
                  </TableCell>
                  <TableCell>{memo.memoTo}</TableCell>
                  <TableCell>{formatThaiDate(memo.memoDate)}</TableCell>
                  <TableCell>{memo.memoRequesterName}</TableCell>
                  <TableCell>{formatDateTime(memo.memoCreatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => onView?.(memo)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="warning"
                        onPress={() => onEdit?.(memo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDeleteClick(memo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>ยืนยันการลบ</ModalHeader>
          <ModalBody>
            <p>
              คุณต้องการลบบันทึกข้อความเลขที่{" "}
              <span className="font-bold">{selectedMemo?.memoDocumentNo}</span>{" "}
              ใช่หรือไม่?
            </p>
            <p className="text-sm text-danger mt-2">
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setDeleteModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button color="danger" onPress={handleConfirmDelete}>
              ลบ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// View Memo Modal
function ViewMemoModal({ memo, isOpen, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open("", "_blank");
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MEMO-${memo?.memoDocumentNo || "document"}</title>
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 20px; font-family: 'Sarabun', 'TH Sarabun New', sans-serif; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  if (!memo) return null;

  const printData = {
    documentNo: memo.memoDocumentNo,
    to: memo.memoTo,
    copy: memo.memoCopy,
    subject: memo.memoSubject,
    date: formatThaiDate(memo.memoDate),
    content: memo.memoContent,
    requesterName: memo.memoRequesterName,
    requesterDate: memo.memoRequesterDate,
    salesManagerName: memo.memoSalesManagerName,
    salesManagerDate: memo.memoSalesManagerDate,
    ceoName: memo.memoCeoName,
    ceoDate: memo.memoCeoDate,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>รายละเอียดบันทึกข้อความ</ModalHeader>
        <ModalBody>
          <div className="bg-gray-100 p-4 rounded-lg">
            <PrintableMemo ref={printRef} data={printData} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            ปิด
          </Button>
          <Button color="primary" startContent={<Printer className="w-4 h-4" />} onPress={handlePrint}>
            พิมพ์
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Main Component
export default function UIMemo() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingMemo, setEditingMemo] = useState(null);
  const [viewingMemo, setViewingMemo] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const printRef = useRef();

  const { memos, loading, refetch, createMemo, updateMemo, deleteMemo } = useMemos();

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open("", "_blank");
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MEMO-${editingMemo?.memoDocumentNo || "document"}</title>
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 20px; font-family: 'Sarabun', 'TH Sarabun New', sans-serif; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingMemo) {
        await updateMemo(editingMemo.memoId, formData);
        showToast("success", "แก้ไขบันทึกข้อความสำเร็จ");
      } else {
        await createMemo(formData);
        showToast("success", "สร้างบันทึกข้อความสำเร็จ");
      }
      setActiveTab("list");
      setEditingMemo(null);
    } catch (error) {
      showToast("danger", `เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleEdit = (memo) => {
    setEditingMemo(memo);
    setActiveTab("form");
  };

  const handleView = (memo) => {
    setViewingMemo(memo);
    setViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMemo(id);
      showToast("success", "ลบบันทึกข้อความสำเร็จ");
    } catch (error) {
      showToast("danger", `เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleNewMemo = () => {
    setEditingMemo(null);
    setActiveTab("form");
  };

  const handleCancelEdit = () => {
    setEditingMemo(null);
    setActiveTab("list");
  };

  return (
    <div className="flex flex-col w-full h-full gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-default/30 rounded-xl border border-default">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">บันทึกข้อความ (MEMO)</h1>
            <p className="text-sm text-foreground/60">
              สร้างและจัดการบันทึกข้อความสำหรับแผนก Sales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "form" && (
            <Button
              color="default"
              variant="flat"
              startContent={<List className="w-4 h-4" />}
              onPress={handleCancelEdit}
            >
              กลับไปรายการ
            </Button>
          )}
          {activeTab === "list" && (
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleNewMemo}
            >
              สร้างใหม่
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        className="hidden"
      >
        <Tab key="list" title="รายการ" />
        <Tab key="form" title="ฟอร์ม" />
      </Tabs>

      {/* Content */}
      {activeTab === "list" ? (
        <MemoList
          memos={memos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      ) : (
        <MemoForm
          initialData={editingMemo}
          onSave={handleSave}
          onPrint={handlePrint}
          onReset={handleCancelEdit}
          printRef={printRef}
          isEditing={!!editingMemo}
        />
      )}

      {/* View Modal */}
      <ViewMemoModal
        memo={viewingMemo}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />
    </div>
  );
}
