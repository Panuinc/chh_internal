"use client";
import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { ChevronDown, Plus, Search, Settings2 } from "lucide-react";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const ActionMenu = ({ item, onEdit }) => (
  <Dropdown>
    <DropdownTrigger>
      <Button
        isIconOnly
        variant="light"
        size="sm"
        radius="sm"
        className="text-default-400 hover:text-default-700"
      >
        <Settings2 className="w-[14px] h-[14px]" />
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

const StatusChip = ({ value, colorMap }) => (
  <Chip
    color={colorMap[value] || "default"}
    variant="flat"
    size="sm"
    radius="full"
    className="capitalize text-[11px]"
  >
    {value}
  </Chip>
);

const StatusFilterDropdown = ({
  statusOptions,
  statusFilter,
  setStatusFilter,
}) => (
  <Dropdown>
    <DropdownTrigger>
      <Button
        endContent={<ChevronDown className="w-3 h-3" />}
        variant="bordered"
        size="sm"
        radius="sm"
        className="w-full xl:w-32 border-default text-default-600 text-[12px] h-[34px]"
      >
        Status
      </Button>
    </DropdownTrigger>
    <DropdownMenu
      disallowEmptySelection
      closeOnSelect={false}
      selectionMode="multiple"
      selectedKeys={statusFilter}
      onSelectionChange={setStatusFilter}
    >
      {statusOptions.map((status) => (
        <DropdownItem key={status.uid} className="capitalize text-[13px]">
          {capitalize(status.name)}
        </DropdownItem>
      ))}
    </DropdownMenu>
  </Dropdown>
);

const RowsPerPageSelector = ({ onChange }) => (
  <label className="flex items-center gap-2 text-[12px] text-default-500 whitespace-nowrap">
    Rows:
    <select
      className="p-2 border border-default rounded text-[12px] text-default-600 bg-background focus:outline-none focus:border-default"
      onChange={onChange}
      defaultValue="5"
    >
      <option value="10">10</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
  </label>
);

const useDataFiltering = (data, statusOptions) => {
  const [filterValue, setFilterValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filteredItems = React.useMemo(() => {
    let filtered = [...data];

    if (filterValue) {
      const searchTerm = filterValue.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm),
        ),
      );
    }

    const isStatusFiltered =
      statusFilter !== "all" &&
      statusOptions.length > 0 &&
      Array.from(statusFilter).length !== statusOptions.length;

    if (isStatusFiltered) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          Array.from(statusFilter).includes(String(value)),
        ),
      );
    }

    return filtered;
  }, [data, filterValue, statusFilter, statusOptions.length]);

  return {
    filterValue,
    setFilterValue,
    statusFilter,
    setStatusFilter,
    filteredItems,
  };
};

const usePagination = (filteredItems) => {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  return {
    page,
    setPage,
    totalPages,
    paginatedItems,
    handleRowsPerPageChange,
  };
};

export default function DataTable({
  columns = [],
  data = [],
  statusOptions = [],
  statusColorMap = {},
  searchPlaceholder = "Search...",
  emptyContent = "No data found",
  itemName = "items",
  onAddNew,
  onEdit,
  renderCustomCell,
  selectionMode,
  selectedKeys,
  onSelectionChange,
}) {
  const {
    filterValue,
    setFilterValue,
    statusFilter,
    setStatusFilter,
    filteredItems,
  } = useDataFiltering(data, statusOptions);

  const { page, setPage, totalPages, paginatedItems, handleRowsPerPageChange } =
    usePagination(filteredItems);

  const renderCell = React.useCallback(
    (item, columnKey) => {
      const cellValue = item[columnKey];

      if (renderCustomCell) {
        const custom = renderCustomCell(item, columnKey);
        if (custom !== undefined) return custom;
      }

      if (statusColorMap[cellValue]) {
        return <StatusChip value={cellValue} colorMap={statusColorMap} />;
      }

      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center">
            <ActionMenu item={item} onEdit={onEdit} />
          </div>
        );
      }

      return cellValue;
    },
    [statusColorMap, renderCustomCell, onEdit],
  );

  return (
    <div className="flex flex-col w-full h-full bg-background rounded-lg border border-default overflow-hidden">
      <div className="shrink-0 flex flex-col gap-2 p-2 border-b border-default">
        <div className="flex flex-col xl:flex-row items-center gap-2">
          <Input
            isClearable
            placeholder={searchPlaceholder}
            startContent={<Search className="w-[14px] h-[14px] text-default-400" />}
            value={filterValue}
            onValueChange={setFilterValue}
            variant="bordered"
            size="sm"
            radius="sm"
            className="w-full"
            classNames={{
              inputWrapper: "border-default hover:border-default shadow-none h-[34px]",
              input: "text-[13px]",
            }}
          />
          {statusOptions.length > 0 && (
            <StatusFilterDropdown
              statusOptions={statusOptions}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}
          {onAddNew && (
            <Button
              endContent={<Plus className="w-[14px] h-[14px]" />}
              onPress={onAddNew}
              size="sm"
              radius="sm"
              className="w-full xl:w-auto bg-foreground text-background text-[12px] font-medium hover:bg-default-800 h-[34px]"
            >
              Create
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="hidden xl:block text-[12px] text-default-400">
            {data.length} {itemName}
          </span>
          <RowsPerPageSelector onChange={handleRowsPerPageChange} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <Table
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          classNames={{ wrapper: "min-h-full shadow-none rounded-none" }}
          size="sm"
          radius="none"
          shadow="none"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                className="p-2 bg-default-50 text-[11px] font-medium text-default-400 uppercase tracking-wider"
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={emptyContent} items={paginatedItems}>
            {(item) => (
              <TableRow key={item.id} className="hover:bg-default-50 transition-colors">
                {(columnKey) => (
                  <TableCell className="p-2 text-[13px] text-default-600">
                    {renderCell(item, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="shrink-0 flex items-center justify-between p-2 border-t border-default bg-default-50/50">
        <span className="text-[12px] text-default-400">
          Page {page} of {totalPages}
        </span>
        <Pagination
          isCompact
          showControls
          color="default"
          size="sm"
          radius="sm"
          page={page}
          total={totalPages}
          onChange={setPage}
          classNames={{
            cursor: "bg-foreground text-background",
          }}
        />
      </div>
    </div>
  );
}
