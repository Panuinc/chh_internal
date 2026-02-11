"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Save, Send, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

const STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_SALES_MANAGER: "Pending Sales Manager Approval",
  PENDING_CEO: "Pending CEO Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US");
  };

  return (
    <div className="flex flex-col w-full h-full overflow-auto p-2">
      <div className="w-full h-full">
        <div className="bg-background rounded-lg border border-default h-full flex flex-col">
          <div className="p-2 border-b border-default">
            <h2 className="text-[13px] font-semibold text-foreground">
              {mode === "create" ? "Create Memo" : "Edit Memo"}
            </h2>
            <p className="text-[12px] text-default-400">
              {mode === "create" ? "Create a new memo" : "Edit memo details"}
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
            <div className="flex flex-col xl:flex-row items-center gap-2 w-full">
              <div className="flex items-center justify-center min-w-40">
                <Image src="/logo/logo-02.png" alt="logo" width={150} height={150} />
              </div>
              <div className="flex flex-col w-full">
                <div className="text-lg font-black text-foreground">
                  C.H.H. INDUSTRY CO., LTD.
                </div>
                <div className="text-sm text-default-500">
                  9/1 Moo.2 Banglen-Lardloomkeaw rd, T.Khunsri A.Sainoi Nonthaburi
                  11150 Tel: (66) 02-921-9979-80 Fax: 02-921-9978 WWW.CHHTHAILAND.COM
                </div>
                <div className="text-lg font-black text-foreground">
                  C.H.H. Industry Co., Ltd. (Thai)
                </div>
                <div className="text-sm text-default-500">
                  9/1 Moo 2 Banglen-Lardloomkaew Rd, T.Khunsri A.Sainoi Nonthaburi 11150
                  Tel: 02-921-9979-80 Fax: 02-921-9978 WWW.CHHTHAILAND.COM
                </div>
              </div>
            </div>

            {isUpdate && (
              <div className="flex items-center justify-center w-full p-2 gap-2 border-b border-default bg-default-50 rounded-lg">
                <span className="font-bold text-default-700 text-sm">Status:</span>
                <Chip color={STATUS_COLORS[status]} variant="flat" size="md">
                  {STATUS_LABELS[status]}
                </Chip>
                {status === "REJECTED" && memo?.memoRejectReason && (
                  <span className="text-danger text-sm">
                    Reason: {memo.memoRejectReason}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col w-full gap-2 border-b border-default pb-4">
              <div className="font-bold text-foreground text-sm">
                To: Mr. Jongkom Chuchaisri
              </div>
              <div className="font-bold text-foreground text-sm">
                CC: Mr. Nawapon Chukiat
              </div>
              <div className="flex flex-col xl:flex-row gap-2 w-full">
                <div className="flex-1">
                  <Input
                    name="subject"
                    type="text"
                    label="Subject"
                    placeholder="Subject heading"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    value={formData.subject || ""}
                    onChange={handleChange("subject")}
                    isInvalid={!!errors.subject}
                    errorMessage={errors.subject?.[0] || errors.subject}
                    isDisabled={!canEdit || isReadOnly}
                    classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                  />
                </div>
              </div>
              <div className="flex flex-col xl:flex-row gap-2 w-full">
                <div className="flex-1">
                  <Input
                    name="date"
                    type="date"
                    label="Date"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    value={formData.date || ""}
                    onChange={handleChange("date")}
                    isInvalid={!!errors.date}
                    errorMessage={errors.date?.[0] || errors.date}
                    isDisabled={!canEdit || isReadOnly}
                    classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full gap-2">
              <div className="flex-1">
                <Input
                  name="documentNo"
                  type="text"
                  label="Document No."
                  placeholder="ME-XXXX-XX"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.documentNo || ""}
                  onChange={handleChange("documentNo")}
                  isInvalid={!!errors.documentNo}
                  errorMessage={errors.documentNo?.[0] || errors.documentNo}
                  isDisabled={!canEdit || isReadOnly}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>
              <div className="flex-1">
                <Textarea
                  name="content"
                  label="Content"
                  placeholder="Content details..."
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.content || ""}
                  onChange={handleChange("content")}
                  minRows={4}
                  isInvalid={!!errors.content}
                  errorMessage={errors.content?.[0] || errors.content}
                  isDisabled={!canEdit || isReadOnly}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>
              <div className="text-sm font-bold text-foreground">
                Submitted for Approval
              </div>
            </div>

            <div className="flex flex-col xl:flex-row items-stretch gap-2 w-full">
              <div className="flex flex-col items-center justify-center flex-1 p-2 gap-2 border border-default rounded-lg bg-default-50">
                <div className="font-medium text-foreground text-sm">
                  {formData.requesterName || operatedBy || "-"}
                </div>
                <div className="text-[12px] text-default-400">
                  Requester
                </div>
                <div className="text-[12px] text-default-400">
                  {formatDate(formData.requesterDate) || "-"}
                </div>
              </div>

              <div className={`flex flex-col items-center justify-center flex-1 p-2 gap-2 border rounded-lg bg-default-50 ${
                status === "PENDING_SALES_MANAGER" ? "border-amber-400" : "border-default"
              }`}>
                <div className="font-medium text-foreground text-sm">
                  {memo?.memoSalesManagerName || (
                    status === "PENDING_SALES_MANAGER" ? (
                      <span className="text-amber-500 text-sm">Pending Approval</span>
                    ) : "-"
                  )}
                </div>
                <div className="text-[12px] text-default-400">
                  Sales Manager
                </div>
                <div className="text-[12px] text-default-400">
                  {formatDate(memo?.memoSalesManagerDate) || "-"}
                </div>
              </div>

              <div className={`flex flex-col items-center justify-center flex-1 p-2 gap-2 border rounded-lg bg-default-50 ${
                status === "PENDING_CEO" ? "border-amber-400" : "border-default"
              }`}>
                <div className="font-medium text-foreground text-sm">
                  {memo?.memoCeoName || (
                    status === "PENDING_CEO" ? (
                      <span className="text-amber-500 text-sm">Pending Approval</span>
                    ) : status === "PENDING_SALES_MANAGER" ? (
                      <span className="text-default-400 text-sm">Pending Sales Manager</span>
                    ) : "-"
                  )}
                </div>
                <div className="text-[12px] text-default-400">
                  Managing Director
                </div>
                <div className="text-[12px] text-default-400">
                  {formatDate(memo?.memoCeoDate) || "-"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-default gap-2">
              {canEdit && !isReadOnly && (
                <Button
                  type="submit"
                  size="sm"
                  radius="sm"
                  variant="bordered"
                  startContent={<Save className="w-4 h-4" />}
                  className="border-default text-default-700 font-medium"
                >
                  Save Draft
                </Button>
              )}

              {canSubmitForApproval && onSubmitForApproval && (
                <Button
                  type="button"
                  size="sm"
                  radius="sm"
                  startContent={<Send className="w-4 h-4" />}
                  className="bg-foreground text-background font-medium hover:bg-default-800"
                  onPress={onSubmitForApproval}
                >
                  Submit for Approval
                </Button>
              )}

              {canApprove && onApprove && (
                <Button
                  type="button"
                  color="success"
                  size="sm"
                  radius="sm"
                  startContent={<CheckCircle className="w-4 h-4" />}
                  className="text-white font-medium"
                  onPress={onApprove}
                >
                  Approve
                </Button>
              )}

              {canReject && onReject && (
                <Button
                  type="button"
                  color="danger"
                  size="sm"
                  radius="sm"
                  startContent={<XCircle className="w-4 h-4" />}
                  className="text-white font-medium"
                  onPress={onReject}
                >
                  Reject
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
