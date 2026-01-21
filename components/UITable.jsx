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
} from "@heroui/react";
import { ChevronDown, Plus, Search, Settings2 } from "lucide-react";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

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

const StatusChip = ({ value, colorMap }) => (
  <Chip
    className="capitalize text-background"
    color={colorMap[value] || "default"}
    variant="shadow"
    size="md"
    radius="md"
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
        endContent={<ChevronDown />}
        color="default"
        variant="shadow"
        size="md"
        radius="md"
        className="w-full xl:w-42 text-foreground"
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
        <DropdownItem key={status.uid} className="capitalize">
          {capitalize(status.name)}
        </DropdownItem>
      ))}
    </DropdownMenu>
  </Dropdown>
);

const RowsPerPageSelector = ({ onChange }) => (
  <label className="flex items-center justify-between w-fit h-full p-2 gap-2 whitespace-nowrap">
    Rows per page:
    <select
      className="flex items-center justify-between w-fit h-full p-2 gap-2"
      onChange={onChange}
      defaultValue="5"
    >
      <option value="10">10</option>
      <option value="15">15</option>
      <option value="50">50</option>
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
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <ActionMenu item={item} onEdit={onEdit} />
          </div>
        );
      }

      return cellValue;
    },
    [statusColorMap, renderCustomCell, onEdit],
  );

  return (
    <div className="flex flex-col w-full h-full p-2 gap-2 border-1 border-default overflow-hidden">
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-full h-fit gap-2">
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2">
          <Input
            isClearable
            placeholder={searchPlaceholder}
            startContent={<Search />}
            value={filterValue}
            onValueChange={setFilterValue}
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            className="w-full"
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
              endContent={<Plus />}
              onPress={onAddNew}
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="w-full xl:w-42 text-background"
            >
              Create
            </Button>
          )}
        </div>
        <div className="flex flex-row items-center justify-between w-full h-full gap-2">
          <div className="xl:flex items-center justify-between w-full h-full p-2 gap-2 hidden">
            Total {data.length} {itemName}
          </div>
          <RowsPerPageSelector onChange={handleRowsPerPageChange} />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto gap-2">
        <Table
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          classNames={{ wrapper: "min-h-full" }}
          size="md"
          radius="md"
          shadow="none"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                className="p-4 gap-2 border-b-2 border-t-2 border-default bg-default"
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={emptyContent} items={paginatedItems}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell className="border-b-2 border-default">
                    {renderCell(item, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex-shrink-0 flex flex-row items-center justify-center w-full h-fit gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          <Pagination
            isCompact
            showControls
            showShadow
            color="default"
            size="md"
            radius="md"
            page={page}
            total={totalPages}
            onChange={setPage}
            classNames={{ cursor: "text-foreground" }}
          />
        </div>
      </div>
    </div>
  );
}
