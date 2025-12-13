"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Spinner,
} from "@heroui/react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

const columns = [
  { name: "PERMISSION NAME", uid: "permName", sortable: true },
  { name: "USERS", uid: "userCount", sortable: true },
  { name: "STATUS", uid: "permStatus", sortable: true },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "CREATED AT", uid: "createdAt", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "Active" },
  { name: "Inactive", uid: "Inactive" },
];

const statusColorMap = {
  Active: "success",
  Inactive: "danger",
};

export default function UIPermission({
  permissions,
  permissionCount,
  isLoading,
  searchTerm,
  onSearchChange,
  onRefresh,
  onDelete,
}) {
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "permName",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(searchTerm);

  const filteredItems = React.useMemo(() => {
    let filtered = [...permissions];

    if (hasSearchFilter) {
      filtered = filtered.filter((perm) =>
        perm.permName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filtered = filtered.filter((perm) =>
        Array.from(statusFilter).includes(perm.permStatus)
      );
    }

    return filtered;
  }, [permissions, searchTerm, statusFilter, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback(
    (perm, columnKey) => {
      const cellValue = perm[columnKey];

      switch (columnKey) {
        case "permName":
          return (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <p className="text-bold text-small">{cellValue}</p>
                <p className="text-bold text-tiny text-default-500">
                  ID: {perm.permId}
                </p>
              </div>
              {cellValue === "superAdmin" && (
                <Chip size="sm" color="success" variant="flat">
                  Admin
                </Chip>
              )}
              {cellValue.endsWith(".*") && (
                <Chip size="sm" color="warning" variant="flat">
                  Wildcard
                </Chip>
              )}
            </div>
          );
        case "userCount":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">{cellValue}</p>
              <p className="text-bold text-tiny text-default-500">users</p>
            </div>
          );
        case "permStatus":
          return (
            <Chip
              className="capitalize border-none gap-1 text-default-600"
              color={statusColorMap[cellValue] || "default"}
              size="sm"
              variant="dot"
            >
              {cellValue}
            </Chip>
          );
        case "createdBy":
          return <span className="text-default-600">{cellValue || "-"}</span>;
        case "createdAt":
          return (
            <span className="text-default-600">
              {cellValue
                ? new Date(cellValue).toLocaleDateString("en-US")
                : "-"}
            </span>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown className="bg-background border-1 border-default-200">
                <DropdownTrigger>
                  <Button isIconOnly radius="full" size="sm" variant="light">
                    <MoreVertical size={16} className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Actions">
                  <DropdownItem
                    key="edit"
                    startContent={<Edit size={16} />}
                    href={`/hr/permission/${perm.permId}`}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    color="danger"
                    startContent={<Trash2 size={16} />}
                    onPress={() => onDelete(perm.permId, perm.permName)}
                    isDisabled={perm.permName === "superAdmin"}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [onDelete]
  );

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const handleSearchChange = React.useCallback(
    (value) => {
      if (value) {
        onSearchChange(value);
        setPage(1);
      } else {
        onSearchChange("");
      }
    },
    [onSearchChange]
  );

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search by name..."
            size="sm"
            startContent={<Search size={16} className="text-default-300" />}
            value={searchTerm}
            variant="bordered"
            onClear={() => onSearchChange("")}
            onValueChange={handleSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown size={16} />}
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filter by Status"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              variant="flat"
              onPress={onRefresh}
              isLoading={isLoading}
              startContent={!isLoading && <RefreshCw size={16} />}
              size="sm"
            >
              Refresh
            </Button>
            <Link href="permission/create">
              <Button
                className="bg-foreground text-background"
                endContent={<Plus size={16} />}
                size="sm"
              >
                Add New
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {permissionCount} permissions
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    searchTerm,
    statusFilter,
    handleSearchChange,
    onRowsPerPageChange,
    permissionCount,
    isLoading,
    onRefresh,
    onSearchChange,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages || 1}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages, hasSearchFilter]);

  const classNames = React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-full"],
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: [
        "first:group-data-[first=true]/tr:before:rounded-none",
        "last:group-data-[first=true]/tr:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "first:group-data-[last=true]/tr:before:rounded-none",
        "last:group-data-[last=true]/tr:before:rounded-none",
      ],
    }),
    []
  );

  return (
    <div className="flex flex-col items-center justify-start w-full xl:w-10/12 h-full p-2 gap-2 border overflow-auto">
      <Table
        isCompact
        removeWrapper
        aria-label="Permission table with sorting, filtering and pagination"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        checkboxesProps={{
          classNames: {
            wrapper:
              "after:bg-foreground after:text-background text-background",
          },
        }}
        classNames={classNames}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={isLoading ? " " : "No permissions found"}
          items={sortedItems}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.permId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
