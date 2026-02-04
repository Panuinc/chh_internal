"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Settings2 } from "lucide-react";

const columns = [
  { name: "ID", uid: "memoIndex" },
  { name: "Document No", uid: "memoDocumentNo" },
  { name: "Subject", uid: "memoSubject" },
  { name: "To", uid: "memoTo" },
  { name: "Date", uid: "memoDateFormatted" },
  { name: "Requester", uid: "memoRequesterName" },
  { name: "Created By", uid: "memoCreatedBy" },
  { name: "Created At", uid: "memoCreatedAtFormatted" },
  { name: "Actions", uid: "actions" },
];

const ActionMenu = ({ item, onEdit }) => (
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
      {onEdit && (
        <DropdownItem key="edit" onPress={() => onEdit(item)}>
          Edit
        </DropdownItem>
      )}
    </DropdownMenu>
  </Dropdown>
);

export default function UIMemo({ Memos = [], loading, onAddNew, onEdit }) {
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
          ? new Date(memo.memoDate).toLocaleDateString("th-TH")
          : "-",
        memoCreatedAtFormatted: memo.memoCreatedAt
          ? new Date(memo.memoCreatedAt).toLocaleString("th-TH")
          : "-",
      }))
    : [];

  const renderCustomCell = (item, columnKey) => {
    if (columnKey === "actions") {
      return (
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <ActionMenu item={item} onEdit={onEdit} />
        </div>
      );
    }
    return undefined;
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 border-1 border-default overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Memos
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full xl:w-[80%] h-full gap-2 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full gap-2">
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
