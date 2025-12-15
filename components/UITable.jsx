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
  Card,
  CardBody,
  CardHeader,
  ButtonGroup,
} from "@heroui/react";
import {
  ChevronDown,
  Plus,
  Search,
  Settings2,
  LayoutGrid,
  LayoutList,
} from "lucide-react";

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

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
  onAssign,
  renderCustomCell,
  renderCard,
  cardTitleKey,
  cardDescriptionKey,
  defaultView = "table",
}) {
  const [filterValue, setFilterValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: columns[0]?.uid || "id",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState(defaultView);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filtered = [...data];
    if (hasSearchFilter) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    if (
      statusFilter !== "all" &&
      statusOptions.length > 0 &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filtered = filtered.filter((item) => {
        return Object.values(item).some((value) =>
          Array.from(statusFilter).includes(String(value))
        );
      });
    }
    return filtered;
  }, [data, filterValue, statusFilter, statusOptions.length, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

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
    (item, columnKey) => {
      const cellValue = item[columnKey];
      if (renderCustomCell) {
        const customRender = renderCustomCell(item, columnKey);
        if (customRender !== undefined) return customRender;
      }
      if (statusColorMap && statusColorMap[cellValue]) {
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[cellValue] || "default"}
            variant="dot"
          >
            {cellValue}
          </Chip>
        );
      }
      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light">
                  <Settings2 />
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
          </div>
        );
      }
      return cellValue;
    },
    [statusColorMap, renderCustomCell, onEdit, onAssign]
  );

  const defaultRenderCard = (item) => {
    const titleKey = cardTitleKey || columns[0]?.uid || "id";
    const descKey = cardDescriptionKey || columns[1]?.uid;

    return (
      <Card key={item.id} className="w-full border-2" shadow="none">
        <CardHeader className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h4 className="text-lg font-semibold">{item[titleKey]}</h4>
            {descKey && (
              <p className="text-sm text-default-500">{item[descKey]}</p>
            )}
          </div>
          {(onEdit || onAssign) && (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <Settings2 size={18} />
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
          )}
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex flex-wrap gap-2">
            {columns
              .filter(
                (col) =>
                  col.uid !== "actions" &&
                  col.uid !== titleKey &&
                  col.uid !== descKey
              )
              .map((col) => {
                const value = item[col.uid];
                if (statusColorMap && statusColorMap[value]) {
                  return (
                    <Chip
                      key={col.uid}
                      className="capitalize"
                      color={statusColorMap[value] || "default"}
                      variant="dot"
                      size="sm"
                    >
                      {value}
                    </Chip>
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
  };

  const onRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  const onSearchChange = (value) => {
    setFilterValue(value);
    setPage(1);
  };

  const onClear = () => {
    setFilterValue("");
    setPage(1);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-full h-fit gap-2">
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2">
          <Input
            isClearable
            placeholder={searchPlaceholder}
            startContent={<Search />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
            size="lg"
            variant="faded"
            className="w-full"
          />

          <ButtonGroup size="lg">
            <Button
              isIconOnly
              variant={viewMode === "table" ? "solid" : "bordered"}
              onPress={() => setViewMode("table")}
              className={viewMode === "table" ? "border-2" : ""}
              color="none"
              aria-label="Table View"
            >
              <LayoutList size={20} />
            </Button>
            <Button
              isIconOnly
              variant={viewMode === "card" ? "solid" : "bordered"}
              onPress={() => setViewMode("card")}
              className={viewMode === "card" ? "border-2" : ""}
              color="none"
              aria-label="Card View"
            >
              <LayoutGrid size={20} />
            </Button>
          </ButtonGroup>

          {statusOptions.length > 0 && (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  color="none"
                  endContent={<ChevronDown />}
                  size="lg"
                  className="w-full xl:w-52 border-2"
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
          )}
          {onAddNew && (
            <Button
              startContent={<Plus />}
              color="none"
              onPress={onAddNew}
              size="lg"
              className="w-full xl:w-52 border-2"
            >
              Add New
            </Button>
          )}
        </div>
        <div className="flex flex-col xl:flex-row items-center justify-between w-full h-full gap-2">
          <div className="flex items-center justify-between w-full h-full p-2 gap-2">
            Total {data.length} {itemName}
          </div>
          <label className="flex items-center justify-between w-fit h-full p-2 gap-2 whitespace-nowrap">
            Rows per page:
            <select
              className="flex items-center justify-between w-fit h-full p-2 gap-2"
              onChange={onRowsPerPageChange}
              defaultValue="5"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {viewMode === "table" ? (
          <Table
            aria-label="Data table with sorting and pagination"
            classNames={{
              wrapper: "min-h-full",
            }}
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
                  className="p-4 gap-2 border-b-2 border-t-2"
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={emptyContent} items={sortedItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell className="border-b-2">
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
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

      <div className="flex-shrink-0 flex flex-row items-center justify-center w-full h-fit gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          <Pagination
            isCompact
            showControls
            showShadow
            color="none"
            size="lg"
            page={page}
            total={pages}
            onChange={setPage}
            classNames={{
              cursor: "border-2",
            }}
          />
        </div>
      </div>
    </div>
  );
}
