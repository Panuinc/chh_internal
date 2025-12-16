"use client";

import React from "react";

// ============================================================================
// IMPORTS - UI Components
// ============================================================================
import {
  // Table
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  // Form & Input
  Input,
  Button,
  ButtonGroup,
  // Dropdown
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  // Display
  Chip,
  Pagination,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";

// ============================================================================
// IMPORTS - Icons
// ============================================================================
import {
  ChevronDown,
  Plus,
  Search,
  Settings2,
  LayoutGrid,
  LayoutList,
} from "lucide-react";

// ============================================================================
// UTILITIES
// ============================================================================
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Action Menu - Dropdown menu for row actions (Edit, Assign)
 */
const ActionMenu = ({ item, onEdit, onAssign, size = "md" }) => (
  <Dropdown>
    <DropdownTrigger>
      <Button isIconOnly variant="light" size={size}>
        <Settings2 size={size === "sm" ? 18 : 24} />
      </Button>
    </DropdownTrigger>
    <DropdownMenu>
      {onEdit && (
        <DropdownItem key="edit" onPress={() => onEdit(item)}>
          Edit
        </DropdownItem>
      )}
      {onAssign && (
        <DropdownItem key="assign" onPress={() => onAssign(item)}>
          Assign Permissions
        </DropdownItem>
      )}
    </DropdownMenu>
  </Dropdown>
);

/**
 * Status Chip - Displays status with color coding
 */
const StatusChip = ({ value, colorMap, size = "md" }) => (
  <Chip
    className="capitalize"
    color={colorMap[value] || "default"}
    variant="dot"
    size={size}
  >
    {value}
  </Chip>
);

/**
 * View Toggle - Switch between table and card view
 */
const ViewToggle = ({ viewMode, setViewMode }) => (
  <ButtonGroup size="lg">
    <Button
      isIconOnly
      variant={viewMode === "table" ? "solid" : "bordered"}
      onPress={() => setViewMode("table")}
      className={viewMode === "table" ? "border-1" : ""}
      color="none"
      aria-label="Table View"
    >
      <LayoutList size={20} />
    </Button>
    <Button
      isIconOnly
      variant={viewMode === "card" ? "solid" : "bordered"}
      onPress={() => setViewMode("card")}
      className={viewMode === "card" ? "border-1" : ""}
      color="none"
      aria-label="Card View"
    >
      <LayoutGrid size={20} />
    </Button>
  </ButtonGroup>
);

/**
 * Status Filter Dropdown
 */
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
        variant="bordered"
        size="lg"
        className="w-full xl:w-52"
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

/**
 * Rows Per Page Selector
 */
const RowsPerPageSelector = ({ onChange }) => (
  <label className="flex items-center justify-between w-fit h-full p-2 gap-2 border-1 whitespace-nowrap">
    Rows per page:
    <select
      className="flex items-center justify-between w-fit h-full p-2 gap-2 border-1"
      onChange={onChange}
      defaultValue="5"
    >
      <option value="10">10</option>
      <option value="15">15</option>
      <option value="50">50</option>
    </select>
  </label>
);

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * useDataFiltering - Handles search and status filtering logic
 */
const useDataFiltering = (data, statusOptions) => {
  const [filterValue, setFilterValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filteredItems = React.useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (filterValue) {
      const searchTerm = filterValue.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Status filter
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

/**
 * usePagination - Handles pagination logic
 */
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

/**
 * useSorting - Handles sorting logic
 */
const useSorting = (items, defaultColumn) => {
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: defaultColumn,
    direction: "ascending",
  });

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  return { sortDescriptor, setSortDescriptor, sortedItems };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DataTable({
  // Data
  columns = [],
  data = [],
  // Status configuration
  statusOptions = [],
  statusColorMap = {},
  // UI text
  searchPlaceholder = "Search...",
  emptyContent = "No data found",
  itemName = "items",
  // View configuration
  defaultView = "table",
  cardTitleKey,
  cardDescriptionKey,
  // Callbacks
  onAddNew,
  onEdit,
  onAssign,
  // Custom renderers
  renderCustomCell,
  renderCard,
}) {
  // --------------------------------------------------------------------------
  // State & Hooks
  // --------------------------------------------------------------------------
  const [viewMode, setViewMode] = React.useState(defaultView);

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

  const { sortDescriptor, setSortDescriptor, sortedItems } = useSorting(
    paginatedItems,
    columns[0]?.uid || "id"
  );

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------
  const handleSearchChange = (value) => {
    setFilterValue(value);
    resetPage();
  };

  const handleClearSearch = () => {
    clearFilter();
    resetPage();
  };

  // --------------------------------------------------------------------------
  // Cell Renderer
  // --------------------------------------------------------------------------
  const renderCell = React.useCallback(
    (item, columnKey) => {
      const cellValue = item[columnKey];

      // Custom cell renderer (if provided)
      if (renderCustomCell) {
        const customRender = renderCustomCell(item, columnKey);
        if (customRender !== undefined) return customRender;
      }

      // Status chip
      if (statusColorMap?.[cellValue]) {
        return <StatusChip value={cellValue} colorMap={statusColorMap} />;
      }

      // Actions column
      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 border-1">
            <ActionMenu item={item} onEdit={onEdit} onAssign={onAssign} />
          </div>
        );
      }

      // Default: raw value
      return cellValue;
    },
    [statusColorMap, renderCustomCell, onEdit, onAssign]
  );

  // --------------------------------------------------------------------------
  // Card Renderer
  // --------------------------------------------------------------------------
  const defaultRenderCard = React.useCallback(
    (item) => {
      const titleKey = cardTitleKey || columns[0]?.uid || "id";
      const descKey = cardDescriptionKey || columns[1]?.uid;
      const hasActions = onEdit || onAssign;

      // Filter out action, title, and description columns
      const displayColumns = columns.filter(
        (col) =>
          col.uid !== "actions" && col.uid !== titleKey && col.uid !== descKey
      );

      return (
        <Card key={item.id} className="w-full border-1" shadow="none">
          {/* Card Header */}
          <CardHeader className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-semibold">{item[titleKey]}</h4>
              {descKey && (
                <p className="text-sm text-default-500">{item[descKey]}</p>
              )}
            </div>
            {hasActions && (
              <ActionMenu
                item={item}
                onEdit={onEdit}
                onAssign={onAssign}
                size="sm"
              />
            )}
          </CardHeader>

          {/* Card Body */}
          <CardBody className="pt-0">
            <div className="flex flex-wrap gap-2">
              {displayColumns.map((col) => {
                const value = item[col.uid];

                if (statusColorMap?.[value]) {
                  return (
                    <StatusChip
                      key={col.uid}
                      value={value}
                      colorMap={statusColorMap}
                      size="sm"
                    />
                  );
                }

                return (
                  <div key={col.uid} className="text-sm">
                    <span className="text-default-500">{col.name}: </span>
                    <span>{value}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      );
    },
    [
      columns,
      cardTitleKey,
      cardDescriptionKey,
      statusColorMap,
      onEdit,
      onAssign,
    ]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-col w-full h-full p-2 gap-2 border-1 overflow-hidden">
      {/* ===== TOOLBAR ===== */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1">
        {/* Search & Filters Row */}
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full p-2 gap-2 border-1">
          {/* Search Input */}
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
            className="w-full"
          />

          {/* View Toggle */}
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

          {/* Status Filter */}
          {statusOptions.length > 0 && (
            <StatusFilterDropdown
              statusOptions={statusOptions}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}

          {/* Add New Button */}
          {onAddNew && (
            <Button
              startContent={<Plus />}
              onPress={onAddNew}
              color="default"
              variant="bordered"
              size="lg"
              className="w-full xl:w-52"
            >
              Add New
            </Button>
          )}
        </div>

        {/* Info Row */}
        <div className="flex flex-col xl:flex-row items-center justify-between w-full h-full p-2 gap-2 border-1">
          <div className="flex items-center justify-between w-full h-full p-2 gap-2 border-1">
            Total {data.length} {itemName}
          </div>
          <RowsPerPageSelector onChange={handleRowsPerPageChange} />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 min-h-0 overflow-auto p-2 gap-2 border-1">
        {viewMode === "table" ? (
          /* Table View */
          <Table
            aria-label="Data table with sorting and pagination"
            classNames={{ wrapper: "min-h-full" }}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            size="lg"
            shadow="none"
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                  allowsSorting={column.sortable}
                  className="p-4 gap-2 border-b-1 border-t-1"
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={emptyContent} items={sortedItems}>
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
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4">
            {sortedItems.length > 0 ? (
              sortedItems.map((item) =>
                renderCard ? renderCard(item) : defaultRenderCard(item)
              )
            ) : (
              <div className="col-span-full text-center py-10 text-default-500">
                {emptyContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      <div className="flex-shrink-0 flex flex-row items-center justify-center w-full h-fit p-2 gap-2 border-1">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2 border-1">
          <Pagination
            isCompact
            showControls
            showShadow
            color="none"
            size="lg"
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
