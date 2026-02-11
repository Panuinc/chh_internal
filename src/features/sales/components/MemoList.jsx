"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { Settings2, CheckCircle, XCircle, Eye } from "lucide-react";

const STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_SALES_MANAGER: "Pending Sales Manager",
  PENDING_CEO: "Pending CEO",
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

const columns = [
  { name: "ID", uid: "memoIndex" },
  { name: "Document No", uid: "memoDocumentNo" },
  { name: "Subject", uid: "memoSubject" },
  { name: "To", uid: "memoTo" },
  { name: "Date", uid: "memoDateFormatted" },
  { name: "Requester", uid: "memoRequesterName" },
  { name: "Status", uid: "memoStatus" },
  { name: "Created By", uid: "memoCreatedBy" },
  { name: "Created At", uid: "memoCreatedAtFormatted" },
  { name: "Actions", uid: "actions" },
];

const ActionMenu = ({ item, onEdit, onView, onApprove, onReject, canApproveSM, canApproveCEO }) => {
  // Determine which actions are available
  const canEdit = item.memoStatus === "DRAFT" || item.memoStatus === "REJECTED";
  const canApprove = 
    (item.memoStatus === "PENDING_SALES_MANAGER" && canApproveSM) ||
    (item.memoStatus === "PENDING_CEO" && canApproveCEO);
  const canReject = 
    (item.memoStatus === "PENDING_SALES_MANAGER" && canApproveSM) ||
    (item.memoStatus === "PENDING_CEO" && canApproveCEO);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          color="default"
          variant="shadow"
          size="md"
          radius="md"
          className="text-foreground"
        >
          <Settings2 />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {onView && (
          <DropdownItem key="view" onPress={() => onView(item)} startContent={<Eye className="w-4 h-4" />}>
            View Details
          </DropdownItem>
        )}
        {canEdit && onEdit && (
          <DropdownItem key="edit" onPress={() => onEdit(item)}>
            Edit
          </DropdownItem>
        )}
        {canApprove && onApprove && (
          <DropdownItem 
            key="approve" 
            onPress={() => onApprove(item)}
            className="text-success"
            color="success"
            startContent={<CheckCircle className="w-4 h-4" />}
          >
            Approve
          </DropdownItem>
        )}
        {canReject && onReject && (
          <DropdownItem 
            key="reject" 
            onPress={() => onReject(item)}
            className="text-danger"
            color="danger"
            startContent={<XCircle className="w-4 h-4" />}
          >
            Reject
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

export default function UIMemo({ 
  Memos = [], 
  loading, 
  onAddNew, 
  onEdit, 
  onView,
  onApprove,
  onReject,
  canApproveSM = false,
  canApproveCEO = false,
}) {
  const total = Memos.length;

  const normalized = Array.isArray(Memos)
    ? Memos.map((memo, i) => ({
        ...memo,
        id: memo.memoId,
        memoIndex: i + 1,
        memoCreatedBy: memo.createdByEmployee
          ? `${memo.createdByEmployee.employeeFirstName} ${memo.createdByEmployee.employeeLastName}`
          : memo.memoCreatedBy || "-",
        memoUpdatedBy: memo.updatedByEmployee
          ? `${memo.updatedByEmployee.employeeFirstName} ${memo.updatedByEmployee.employeeLastName}`
          : memo.memoUpdatedBy || "-",
        memoDateFormatted: memo.memoDate
          ? new Date(memo.memoDate).toLocaleDateString("en-US")
          : "-",
        memoCreatedAtFormatted: memo.memoCreatedAt
          ? new Date(memo.memoCreatedAt).toLocaleString("en-US")
          : "-",
      }))
    : [];

  const renderCustomCell = (item, columnKey) => {
    if (columnKey === "memoStatus") {
      return (
        <Chip
          color={STATUS_COLORS[item.memoStatus] || "default"}
          variant="flat"
          size="sm"
        >
          {STATUS_LABELS[item.memoStatus] || item.memoStatus}
        </Chip>
      );
    }
    if (columnKey === "actions") {
      return (
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <ActionMenu 
            item={item} 
            onEdit={onEdit} 
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
            canApproveSM={canApproveSM}
            canApproveCEO={canApproveCEO}
          />
        </div>
      );
    }
    return undefined;
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      {/* Inline stats */}
      <div className="hidden xl:flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Memos</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">{total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={normalized}
            searchPlaceholder="Search by document no or subject..."
            emptyContent="No memos found"
            itemName="memos"
            onAddNew={onAddNew}
            onEdit={onEdit}
            renderCustomCell={renderCustomCell}
          />
        )}
      </div>
    </div>
  );
}
