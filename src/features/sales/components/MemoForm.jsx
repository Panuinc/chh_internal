"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Save, Send, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

const STATUS_LABELS = {
  DRAFT: "ร่าง",
  PENDING_SALES_MANAGER: "รอผู้จัดการฝ่ายขายอนุมัติ",
  PENDING_CEO: "รอกรรมการผู้จัดการอนุมัติ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ปฏิเสธ",
};

const STATUS_COLORS = {
  DRAFT: "default",
  PENDING_SALES_MANAGER: "warning",
  PENDING_CEO: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export default function UIMemoForm({
  formHandler,
  mode,
  isUpdate,
  operatedBy,
  memo,
  onSubmitForApproval,
  onApprove,
  onReject,
  canApproveSM = false,
  canApproveCEO = false,
  isReadOnly = false,
}) {
  const { formRef, formData, handleChange, handleSubmit, errors } = formHandler;

  const status = memo?.memoStatus || "DRAFT";
  const canEdit = status === "DRAFT" || status === "REJECTED";
  const canSubmitForApproval = status === "DRAFT" || status === "REJECTED";
  const canApprove = 
    (status === "PENDING_SALES_MANAGER" && canApproveSM) ||
    (status === "PENDING_CEO" && canApproveCEO);
  const canReject = canApprove;

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("th-TH");
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-2 border-l-2 border-r-2 border-default overflow-auto"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center min-w-40 h-full p-2 gap-2">
          <Image src="/logo/logo-02.png" alt="logo" width={150} height={150} />
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-lg font-black">
            C.H.H. INDUSTRY CO., LTD.
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2">
            9/1 Moo.2 Banglen-Lardloomkeaw rd, T.Khunsri A.Sainoi Nonthaburi
            11150 Tel: (66) 02-921-9979-80 Fax: 02-921-9978 WWW.CHHTHAILAND.COM
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-lg font-black">
            บริษัท ซื้อฮะฮวด อุตสาหกรรม จำกัด
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2">
            9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150
            โทร:02-921-9979-80 แฟกซ์ 02-921-9978 WWW.CHHTHAILAND.COM
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {isUpdate && (
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default bg-default-100">
          <span className="font-bold">สถานะ:</span>
          <Chip color={STATUS_COLORS[status]} variant="flat" size="md">
            {STATUS_LABELS[status]}
          </Chip>
          {status === "REJECTED" && memo?.memoRejectReason && (
            <span className="text-danger text-sm ml-2">
              เหตุผล: {memo.memoRejectReason}
            </span>
          )}
        </div>
      )}

      {/* Document Info */}
      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 font-black">
          เรียน คุณจงคม ชูชัยศรี
        </div>
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 font-black">
          สำเนา คุณนวพล ชูเกียรติ
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap font-black">
          เรื่อง :
          <Input
            name="subject"
            type="text"
            placeholder="หัวข้อเรื่อง"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.subject || ""}
            onChange={handleChange("subject")}
            isInvalid={!!errors.subject}
            errorMessage={errors.subject?.[0] || errors.subject}
            isDisabled={!canEdit || isReadOnly}
          />
        </div>
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-nowrap font-black">
          วันที่ :
          <Input
            name="date"
            type="date"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.date || ""}
            onChange={handleChange("date")}
            isInvalid={!!errors.date}
            errorMessage={errors.date?.[0] || errors.date}
            isDisabled={!canEdit || isReadOnly}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-nowrap font-black">
          เลขที่เอกสาร :
          <Input
            name="documentNo"
            type="text"
            placeholder="ME-XXXX-XX"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.documentNo || ""}
            onChange={handleChange("documentNo")}
            isInvalid={!!errors.documentNo}
            errorMessage={errors.documentNo?.[0] || errors.documentNo}
            isDisabled={!canEdit || isReadOnly}
          />
        </div>
        <div className="flex items-center justify-start w-10/12 h-full p-2 gap-2 text-nowrap">
          <Textarea
            name="content"
            placeholder="รายละเอียดเนื้อหา..."
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.content || ""}
            onChange={handleChange("content")}
            minRows={4}
            isInvalid={!!errors.content}
            errorMessage={errors.content?.[0] || errors.content}
            isDisabled={!canEdit || isReadOnly}
          />
        </div>
        <div className="flex items-center justify-start w-10/12 h-full p-2 gap-2 text-nowrap font-black">
          เรียนมาเพื่อขออนุมัติ
        </div>
      </div>

      {/* Approval Section */}
      <div className="flex flex-col xl:flex-row items-center justify-center w-10/12 xl:min-h-52 p-2">
        {/* Requester */}
        <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 border-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 font-medium">
            {formData.requesterName || operatedBy || "-"}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-sm text-default-500">
            ผู้ร้องขอ
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap text-sm">
            {formatDate(formData.requesterDate) || "-"}
          </div>
        </div>

        {/* Sales Manager */}
        <div className={`flex flex-col items-center justify-center w-full h-full p-2 gap-2 border-2 ${
          status === "PENDING_SALES_MANAGER" ? "border-warning" : "border-default"
        }`}>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 font-medium">
            {memo?.memoSalesManagerName || (
              status === "PENDING_SALES_MANAGER" ? (
                <span className="text-warning text-sm">รออนุมัติ</span>
              ) : "-"
            )}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-sm text-default-500">
            ผู้จัดการฝ่ายขาย
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap text-sm">
            {formatDate(memo?.memoSalesManagerDate) || "-"}
          </div>
        </div>

        {/* CEO */}
        <div className={`flex flex-col items-center justify-center w-full h-full p-2 gap-2 border-2 ${
          status === "PENDING_CEO" ? "border-warning" : "border-default"
        }`}>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 font-medium">
            {memo?.memoCeoName || (
              status === "PENDING_CEO" ? (
                <span className="text-warning text-sm">รออนุมัติ</span>
              ) : status === "PENDING_SALES_MANAGER" ? (
                <span className="text-default-400 text-sm">รอผจก.ฝ่ายขาย</span>
              ) : "-"
            )}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-sm text-default-500">
            กรรมการผู้จัดการ
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap text-sm">
            {formatDate(memo?.memoCeoDate) || "-"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          {/* Save Draft Button */}
          {canEdit && !isReadOnly && (
            <Button
              type="submit"
              color="default"
              variant="shadow"
              size="md"
              radius="md"
              startContent={<Save className="w-4 h-4" />}
              className="text-foreground"
            >
              บันทึกร่าง
            </Button>
          )}

          {/* Submit for Approval Button */}
          {canSubmitForApproval && onSubmitForApproval && (
            <Button
              type="button"
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              startContent={<Send className="w-4 h-4" />}
              className="text-background"
              onPress={onSubmitForApproval}
            >
              ส่งขออนุมัติ
            </Button>
          )}

          {/* Approve Button */}
          {canApprove && onApprove && (
            <Button
              type="button"
              color="success"
              variant="shadow"
              size="md"
              radius="md"
              startContent={<CheckCircle className="w-4 h-4" />}
              className="text-background"
              onPress={onApprove}
            >
              อนุมัติ
            </Button>
          )}

          {/* Reject Button */}
          {canReject && onReject && (
            <Button
              type="button"
              color="danger"
              variant="shadow"
              size="md"
              radius="md"
              startContent={<XCircle className="w-4 h-4" />}
              className="text-background"
              onPress={onReject}
            >
              ปฏิเสธ
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
