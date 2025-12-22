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

const ActionMenu = ({ item, onEdit, onView }) => (
  <Dropdown>
    <DropdownTrigger>
      <Button isIconOnly variant="light" size="md">
        <Settings2 size={24} />
      </Button>
    </DropdownTrigger>
    <DropdownMenu>
      {onView && (
        <DropdownItem key="view" onPress={() => onView(item)}>
          View
        </DropdownItem>
      )}
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
    variant="solid"
    size="md"
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
        size="lg"
        radius="sm"
        className="w-full xl:w-52 text-foreground"
      >
        Status
      </Button>
    </DropdownTrigger>
    <DropdownMenu
      disallowEmptySelection
      aria-label="Status Filter"
      closeOnSelect={false}
      selectedKeys={statusFilter}
      selectionMode="multiple"
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
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    const isStatusFiltered =
      statusFilter !== "all" &&
      statusOptions.length > 0 &&
      Array.from(statusFilter).length !== statusOptions.length;

    if (isStatusFiltered) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          Array.from(statusFilter).includes(String(value))
        )
      );
    }

    return filtered;
  }, [data, filterValue, statusFilter, statusOptions.length]);

  const clearFilter = () => setFilterValue("");

  return {
    filterValue,
    setFilterValue,
    statusFilter,
    setStatusFilter,
    filteredItems,
    clearFilter,
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

  const resetPage = () => setPage(1);

  return {
    page,
    setPage,
    rowsPerPage,
    totalPages,
    paginatedItems,
    handleRowsPerPageChange,
    resetPage,
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
  onView,
  renderCustomCell,
}) {
  const {
    filterValue,
    setFilterValue,
    statusFilter,
    setStatusFilter,
    filteredItems,
    clearFilter,
  } = useDataFiltering(data, statusOptions);

  const {
    page,
    setPage,
    totalPages,
    paginatedItems,
    handleRowsPerPageChange,
    resetPage,
  } = usePagination(filteredItems);

  const handleSearchChange = (value) => {
    setFilterValue(value);
    resetPage();
  };

  const handleClearSearch = () => {
    clearFilter();
    resetPage();
  };

  const renderCell = React.useCallback(
    (item, columnKey) => {
      const cellValue = item[columnKey];

      if (renderCustomCell) {
        const customRender = renderCustomCell(item, columnKey);
        if (customRender !== undefined) return customRender;
      }

      if (statusColorMap?.[cellValue]) {
        return <StatusChip value={cellValue} colorMap={statusColorMap} />;
      }

      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <ActionMenu item={item} onEdit={onEdit} onView={onView} />
          </div>
        );
      }

      return cellValue;
    },
    [statusColorMap, renderCustomCell, onEdit, onView]
  );

  return (
    <div className="flex flex-col w-full h-full p-2 gap-2 border-1 rounded-xl overflow-hidden">
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-full h-fit gap-2">
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2">
          <Input
            isClearable
            placeholder={searchPlaceholder}
            startContent={<Search />}
            value={filterValue}
            onClear={handleClearSearch}
            onValueChange={handleSearchChange}
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
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
              startContent={<Plus />}
              onPress={onAddNew}
              color="success"
              variant="shadow"
              size="lg"
              radius="sm"
              className="w-full xl:w-52 text-background"
            >
              Add New
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
          aria-label="Data table with pagination"
          classNames={{ wrapper: "min-h-full" }}
          size="lg"
          radius="sm"
          shadow="none"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                className="p-4 gap-2 border-b-1 border-t-1"
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={emptyContent} items={paginatedItems}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell className="border-b-1">
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
            color="none"
            size="lg"
            radius="sm"
            page={page}
            total={totalPages}
            onChange={setPage}
            classNames={{ cursor: "border-1" }}
          />
        </div>
      </div>
    </div>
  );
}
