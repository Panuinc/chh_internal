"use client";

import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  useDisclosure,
  Checkbox,
  Input,
  Divider,
  Chip,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  Telescope,
  Package,
  User,
  Calendar,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Minus,
  Plus,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Target,
  Users,
  Repeat,
  MousePointerClick,
  Smile,
  BarChart3,
  Facebook,
  Globe,
  MessageCircle,
  Filter,
  X,
} from "lucide-react";
import Barcode from "react-barcode";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { DataTable, Loading } from "@/components";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { useRFIDSafe } from "@/hooks";
import { COMPANY_INFO } from "@/lib/chainWay/config";
import { getItemLines, getCommentLines } from "@/lib/chainWay/utils";

const columns = [
  { name: "#", uid: "index", width: 60 },
  { name: "SO Number", uid: "number" },
  { name: "Customer", uid: "customerName" },
  { name: "Order Date", uid: "orderDateFormatted" },
  { name: "Items", uid: "lineCount", width: 80 },
  { name: "Qty", uid: "totalQuantity", width: 80 },
  { name: "Total", uid: "totalFormatted" },
  { name: "Actions", uid: "actions", width: 120 },
];

const orderLinesColumns = [
  { name: "#", uid: "index", width: 50 },
  { name: "Item No.", uid: "itemNumber" },
  { name: "Description", uid: "description" },
  { name: "Unit", uid: "unitOfMeasureCode", width: 80 },
  { name: "Qty", uid: "quantity", width: 80 },
  { name: "Unit Price", uid: "unitPriceFormatted", width: 120 },
  { name: "Amount", uid: "amountFormatted", width: 120 },
  { name: "Ship Date", uid: "shipmentDate", width: 120 },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("th-TH").format(value || 0);
}

function getMonthName(dateString) {
  const date = new Date(dateString);
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return months[date.getMonth()];
}

function calculateOrderStats(orders) {
  if (!orders || orders.length === 0) {
    return {
      totalOrders: 0,
      totalAmount: 0,
      totalItems: 0,
      avgOrderValue: 0,
      productBreakdown: [],
      channelBreakdown: [],
      monthlyData: [],
      topSKUs: [],
      newLeads: 0,
      repeatCustomers: 0,
      uniqueCustomers: 0,
    };
  }

  const totalOrders = orders.length;
  const totalAmount = orders.reduce(
    (sum, o) => sum + (o.totalAmountIncludingTax || 0),
    0,
  );
  const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

  const productStats = {};
  const skuStats = {};
  let totalItemCount = 0;

  orders.forEach((order) => {
    const lines = order.salesOrderLines || [];
    lines.forEach((line) => {
      if (line.lineType !== "Item") return;

      totalItemCount += line.quantity || 0;

      const itemNumber = line.itemNumber || line.lineObjectNumber || "Unknown";
      const description = line.description || "";

      let category = "อื่นๆ";
      if (description.includes("WPC") || itemNumber.includes("WPC")) {
        category =
          description.includes("วงกบ") || itemNumber.includes("FRAME")
            ? "วงกบ WPC"
            : "บานประตู WPC";
      } else if (
        description.includes("uPVC") ||
        description.includes("UPVC") ||
        itemNumber.includes("UPVC")
      ) {
        category =
          description.includes("วงกบ") || itemNumber.includes("FRAME")
            ? "วงกบ uPVC"
            : "บานประตู uPVC";
      } else if (description.includes("วงกบ") || itemNumber.includes("FRAME")) {
        category = "วงกบ";
      }

      productStats[category] =
        (productStats[category] || 0) + (line.quantity || 0);

      if (!skuStats[itemNumber]) {
        skuStats[itemNumber] = {
          name: itemNumber,
          description: description,
          quantity: 0,
          revenue: 0,
        };
      }
      skuStats[itemNumber].quantity += line.quantity || 0;
      skuStats[itemNumber].revenue +=
        line.amountIncludingTax || line.netAmount || 0;
    });
  });

  const productBreakdown = Object.entries(productStats).map(
    ([name, quantity]) => ({
      name,
      quantity,
      color: name.includes("WPC")
        ? "#17C964"
        : name.includes("uPVC")
          ? "#F5A524"
          : "#9353D3",
    }),
  );

  const topSKUs = Object.values(skuStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((sku, index) => ({
      ...sku,
      color: ["#006FEE", "#17C964", "#F5A524", "#9353D3", "#F31260"][index % 5],
    }));

  const channelStats = { Facebook: 0, Line: 0, Website: 0, อื่นๆ: 0 };
  orders.forEach((order) => {
    const extDoc = (order.externalDocumentNumber || "").toLowerCase();
    const customerName = (order.customerName || "").toLowerCase();

    if (
      extDoc.includes("fb") ||
      extDoc.includes("facebook") ||
      customerName.includes("facebook")
    ) {
      channelStats.Facebook++;
    } else if (extDoc.includes("line") || customerName.includes("line")) {
      channelStats.Line++;
    } else if (extDoc.includes("web") || customerName.includes("web")) {
      channelStats.Website++;
    } else {
      channelStats["อื่นๆ"]++;
    }
  });

  const channelBreakdown = Object.entries(channelStats)
    .filter(([_, count]) => count > 0)
    .map(([name, orders]) => ({
      name,
      orders,
      color:
        name === "Facebook"
          ? "#006FEE"
          : name === "Line"
            ? "#17C964"
            : name === "Website"
              ? "#9353D3"
              : "#F5A524",
    }));

  const monthStats = {};
  orders.forEach((order) => {
    const date = new Date(order.orderDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = `${getMonthName(order.orderDate)} ${date.getFullYear() + 543}`;

    if (!monthStats[monthKey]) {
      monthStats[monthKey] = { month: monthLabel, sales: 0, orders: 0 };
    }
    monthStats[monthKey].sales += order.totalAmountIncludingTax || 0;
    monthStats[monthKey].orders += 1;
  });

  const monthlyData = Object.values(monthStats).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  const uniqueCustomers = new Set(orders.map((o) => o.customerNumber)).size;
  const newLeads = Math.ceil(uniqueCustomers * 0.8);
  const repeatCustomers = Math.floor(uniqueCustomers * 0.2);

  return {
    totalOrders,
    totalAmount,
    totalItems: totalItemCount,
    avgOrderValue,
    productBreakdown,
    channelBreakdown,
    monthlyData,
    topSKUs,
    newLeads,
    repeatCustomers,
    uniqueCustomers,
  };
}

function MonthlySalesChart({ data }) {
  const chartData = data.map((d) => ({ ...d, target: 1500000 }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-foreground/50">
        ไม่มีข้อมูลยอดขาย
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            formatter={(value) => `${formatCurrency(value)} บาท`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey="sales"
            name="ยอดขายจริง"
            fill="#006FEE"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="target"
            name="เป้าหมาย"
            fill="#F5A524"
            radius={[4, 4, 0, 0]}
            opacity={0.3}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProductSalesChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-foreground/50">
        ไม่มีข้อมูลผลิตภัณฑ์
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            interval={0}
            angle={0}
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
          <Tooltip
            formatter={(value) => `${value} ชิ้น`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="quantity" name="จำนวน" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChannelSalesChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-foreground/50">
        ไม่มีข้อมูลช่องทาง
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
          <Tooltip
            formatter={(value) => `${value} ออเดอร์`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="orders" name="จำนวนออเดอร์" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Top10SKUChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-foreground/50">
        ไม่มีข้อมูล SKU
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              horizontal={false}
            />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#6b7280" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
              width={95}
            />
            <Tooltip
              formatter={(value, name, props) => {
                if (name === "quantity") return [`${value} ชิ้น`, "จำนวนขาย"];
                return [formatCurrency(value) + " บาท", "รายได้"];
              }}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="quantity" name="quantity" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-default/50">
              <th className="px-3 py-2 text-left font-medium">อันดับ</th>
              <th className="px-3 py-2 text-left font-medium">รหัส SKU</th>
              <th className="px-3 py-2 text-left font-medium">รายละเอียด</th>
              <th className="px-3 py-2 text-right font-medium">จำนวน</th>
              <th className="px-3 py-2 text-right font-medium">รายได้</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.name}
                className="border-b border-default/50 hover:bg-default/30"
              >
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-warning/20 text-warning"
                        : index === 1
                          ? "bg-default/40 text-foreground"
                          : index === 2
                            ? "bg-danger/10 text-danger"
                            : "bg-default/20 text-foreground/60"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{item.name}</td>
                <td className="px-3 py-2 text-foreground/80">
                  {item.description}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {item.quantity} ชิ้น
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(item.revenue)} บาท
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDateForInput(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getEndOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

function getToday() {
  return new Date();
}

function filterOrdersByDateRange(orders, fromDate, toDate) {
  if (!fromDate && !toDate) return orders;

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  if (to) {
    to.setHours(23, 59, 59, 999);
  }

  return orders.filter((order) => {
    const orderDate = new Date(order.orderDate);

    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;

    return true;
  });
}

function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
  onQuickSelect,
}) {
  const quickSelectOptions = [
    { label: "วันนี้", value: "today" },
    { label: "สัปดาห์นี้", value: "thisWeek" },
    { label: "เดือนนี้", value: "thisMonth" },
    { label: "เดือนที่แล้ว", value: "lastMonth" },
    { label: "ทั้งหมด", value: "all" },
  ];

  const handleQuickSelect = (value) => {
    const today = new Date();
    let from = null;
    let to = null;

    switch (value) {
      case "today":
        from = formatDateForInput(today);
        to = formatDateForInput(today);
        break;
      case "thisWeek":
        from = formatDateForInput(getStartOfWeek());
        to = formatDateForInput(today);
        break;
      case "thisMonth":
        from = formatDateForInput(getStartOfMonth());
        to = formatDateForInput(getEndOfMonth());
        break;
      case "lastMonth":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        from = formatDateForInput(lastMonth);
        to = formatDateForInput(lastMonthEnd);
        break;
      case "all":
        from = "";
        to = "";
        break;
      default:
        break;
    }

    onQuickSelect?.(from, to);
  };

  const hasFilter = fromDate || toDate;

  return (
    <div className="flex flex-col gap-3 p-4 bg-default/30 rounded-xl border border-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-medium">กรองข้อมูลตามช่วงเวลา</span>
        </div>
        {hasFilter && (
          <Button
            size="sm"
            variant="light"
            color="danger"
            startContent={<X className="w-4 h-4" />}
            onPress={onClear}
          >
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickSelectOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant="flat"
            color="default"
            onPress={() => handleQuickSelect(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">
            วันที่เริ่มต้น (From)
          </label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            placeholder="เลือกวันที่เริ่มต้น"
            startContent={<Calendar className="w-4 h-4 text-foreground/50" />}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">
            วันที่สิ้นสุด (To)
          </label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            placeholder="เลือกวันที่สิ้นสุด"
            startContent={<Calendar className="w-4 h-4 text-foreground/50" />}
          />
        </div>
      </div>

      {hasFilter && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">
            กำลังแสดงข้อมูล:{" "}
            {fromDate
              ? new Date(fromDate).toLocaleDateString("th-TH")
              : "ทั้งหมด"}
            {" - "}
            {toDate ? new Date(toDate).toLocaleDateString("th-TH") : "ปัจจุบัน"}
          </span>
        </div>
      )}
    </div>
  );
}

const customerSatisfactionStatus = {
  message: "จะดำเนินการภายในเดือนกุมภาพันธ์ สัปดาห์ที่ 3",
  effectiveDate: "ต้นเดือนมีนาคม 2568",
  description: "แบบฟอร์มสแกนคิวอาร์โค้ดที่ปริ้นติดใบแปะหน้า",
};

function ExecutiveSummaryCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  color = "primary",
}) {
  const colorClasses = {
    primary: "bg-primary/10 border-primary/30 text-primary",
    success: "bg-success/10 border-success/30 text-success",
    warning: "bg-warning/10 border-warning/30 text-warning",
    danger: "bg-danger/10 border-danger/30 text-danger",
    default: "bg-default/50 border-default text-foreground",
  };

  return (
    <div
      className={`flex flex-col p-4 rounded-xl border ${colorClasses[color]} min-h-[120px]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs opacity-70">{title}</span>
          <span className="text-2xl font-bold mt-1">{value}</span>
          {subValue && (
            <span className="text-xs opacity-60 mt-1">{subValue}</span>
          )}
        </div>
        {Icon && <Icon className="w-5 h-5 opacity-60" />}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs ${trend === "up" ? "text-success" : "text-danger"}`}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

function ChannelBadge({ icon: Icon, label, count, total }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 p-2 bg-default/50 rounded-lg">
      <Icon className="w-4 h-4 text-foreground/60" />
      <div className="flex flex-col">
        <span className="text-xs text-foreground/60">{label}</span>
        <span className="text-sm font-medium">
          {count} ออเดอร์ ({percentage}%)
        </span>
      </div>
    </div>
  );
}

function generateBarcodeValue(itemNumber, pieceNumber, total) {
  return `${itemNumber}-${pieceNumber}/${total}`;
}

function expandItemsByQuantity(items, selectedQuantities = null) {
  const expanded = [];
  for (const item of items) {
    const originalQty = item.quantity || 1;
    const qty = selectedQuantities
      ? (selectedQuantities[item.itemNumber] ?? originalQty)
      : originalQty;

    for (let i = 1; i <= qty; i++) {
      expanded.push({
        item,
        pieceIndexOfItem: i,
        totalPiecesOfItem: qty,
      });
    }
  }
  return expanded;
}

function OrderLinesTable({ lines }) {
  const itemLines = getItemLines({ salesOrderLines: lines });
  const commentLines = getCommentLines({ salesOrderLines: lines });

  const normalizedLines = useMemo(
    () =>
      itemLines.map((line, index) => ({
        ...line,
        id: line.id || index,
        index: index + 1,
        unitPriceFormatted: formatCurrency(line.unitPrice),
        amountFormatted: formatCurrency(line.amountIncludingTax),
      })),
    [itemLines],
  );

  const renderCustomCell = useCallback((item, columnKey) => {
    switch (columnKey) {
      case "itemNumber":
        return <span className="font-mono text-xs">{item.itemNumber}</span>;

      case "description":
        return (
          <div className="flex flex-col">
            <span>{item.description}</span>
            {item.description2 && (
              <span className="text-xs text-foreground/60">
                {item.description2}
              </span>
            )}
          </div>
        );

      case "quantity":
        return <span className="text-right">{item.quantity}</span>;

      case "unitPriceFormatted":
      case "amountFormatted":
        return <span className="text-right">{item[columnKey]}</span>;

      default:
        return undefined;
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-80 overflow-hidden">
        <DataTable
          columns={orderLinesColumns}
          data={normalizedLines}
          emptyContent="No items"
          itemName="items"
          renderCustomCell={renderCustomCell}
        />
      </div>

      {commentLines.length > 0 && (
        <div className="flex flex-col pt-3">
          <p className="text-sm font-medium mb-2">หมายเหตุ:</p>
          {commentLines.map((line) => (
            <p key={line.id} className="text-sm text-foreground/70">
              {line.description} {line.description2}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onOpenPreview,
  isConnected,
  printing,
}) {
  if (!order) return null;

  const lines = order.salesOrderLines || [];
  const lineCount = getItemLines(order).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Sales Order: {order.number}</h3>
          {order.externalDocumentNumber && (
            <span className="text-sm text-foreground/60">
              Ref: {order.externalDocumentNumber}
            </span>
          )}
        </ModalHeader>

        <ModalBody className="gap-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-start gap-2">
              <User className="text-foreground/50 mt-1" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Customer</p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-foreground/70">
                  {order.customerNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="text-foreground/50 mt-1" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Dates</p>
                <p className="text-sm">Order: {order.orderDate}</p>
                <p className="text-sm">
                  Delivery: {order.requestedDeliveryDate}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="text-foreground/50 mt-1" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Ship To</p>
                <p className="text-sm">{order.shipToName}</p>
                <p className="text-sm text-foreground/70">
                  {order.shipToAddressLine1}
                </p>
                {order.shipToCity && (
                  <p className="text-sm text-foreground/70">
                    {order.shipToCity} {order.shipToPostCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Divider />

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-foreground/50" />
              <span className="font-medium">
                Order Lines ({lineCount} items)
              </span>
            </div>
            <OrderLinesTable lines={lines} />
          </div>

          <div className="flex justify-end border-t border-default pt-4">
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm">
                Subtotal:{" "}
                <span className="font-medium">
                  {formatCurrency(order.totalAmountExcludingTax)}
                </span>
              </p>
              <p className="text-sm">
                VAT:{" "}
                <span className="font-medium">
                  {formatCurrency(order.totalTaxAmount)}
                </span>
              </p>
              <p className="text-lg font-bold text-primary">
                Total: {formatCurrency(order.totalAmountIncludingTax)}{" "}
                {order.currencyCode}
              </p>
            </div>
          </div>

          {!isConnected && (
            <div className="flex flex-col gap-2 p-2 bg-danger/10 rounded-xl border border-danger/30">
              <p className="text-sm text-danger font-medium">
                ⚠️ Printer Not Connected
              </p>
              <p className="text-xs text-danger/80">
                กรุณาเชื่อมต่อเครื่องพิมพ์ RFID ก่อนทำการพิมพ์
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-background"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-background"
            startContent={<Printer />}
            isDisabled={!isConnected || printing || lineCount === 0}
            onPress={() => {
              onClose();
              onOpenPreview(order);
            }}
          >
            ใบปะหน้า
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ItemQuantitySelector({
  items,
  selectedItems,
  quantities,
  onToggleItem,
  onQuantityChange,
  onReset,
}) {
  return (
    <div className="flex flex-col w-full p-3 bg-default/25 border-1 border-default rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="text-foreground/60" />
          <span className="text-sm font-semibold">เลือกสินค้าที่จะพิมพ์</span>
        </div>
        <Button
          size="md"
          color="default"
          variant="shadow"
          startContent={<RotateCcw />}
          onPress={onReset}
        >
          รีเซ็ต
        </Button>
      </div>

      <div className="flex flex-col gap-2 max-h-60 overflow-auto">
        {items.map((item, idx) => {
          const isSelected = selectedItems[item.itemNumber] !== false;
          const currentQty = quantities[item.itemNumber] ?? item.quantity;
          const maxQty = item.quantity;

          return (
            <div
              key={item.itemNumber || idx}
              className={`flex items-center gap-3 p-2 rounded-lg border ${
                isSelected
                  ? "bg-primary/5 border-primary/30"
                  : "bg-default/50 border-default"
              }`}
            >
              <Checkbox
                isSelected={isSelected}
                onValueChange={(checked) =>
                  onToggleItem(item.itemNumber, checked)
                }
                size="md"
                color="primary"
                className="text-background"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.description}
                </p>
                <p className="text-xs text-foreground/60">{item.itemNumber}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="md"
                  variant="flat"
                  isDisabled={!isSelected || currentQty <= 1}
                  onPress={() =>
                    onQuantityChange(item.itemNumber, currentQty - 1)
                  }
                >
                  <Minus />
                </Button>

                <Input
                  type="number"
                  size="md"
                  className="w-16 text-center"
                  value={String(currentQty)}
                  min={1}
                  max={maxQty}
                  isDisabled={!isSelected}
                  onValueChange={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 1 && num <= maxQty) {
                      onQuantityChange(item.itemNumber, num);
                    }
                  }}
                  classNames={{
                    input: "text-center",
                    inputWrapper: "h-8",
                  }}
                />

                <Button
                  isIconOnly
                  size="md"
                  variant="flat"
                  isDisabled={!isSelected || currentQty >= maxQty}
                  onPress={() =>
                    onQuantityChange(item.itemNumber, currentQty + 1)
                  }
                >
                  <Plus />
                </Button>

                <span className="text-xs text-foreground/50 w-12 text-right">
                  / {maxQty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlipPreviewModal({
  isOpen,
  onClose,
  order,
  onPrint,
  printing = false,
}) {
  const [previewIndex, setPreviewIndex] = useState(0);

  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState(() => {
    if (order) {
      return {
        shipToName: order.shipToName || order.customerName || "",
        shipToAddressLine1: order.shipToAddressLine1 || "",
        shipToAddressLine2: order.shipToAddressLine2 || "",
        shipToCity: order.shipToCity || "",
        shipToPostCode: order.shipToPostCode || "",
        phoneNumber: order.phoneNumber || "",
      };
    }
    return {
      shipToName: "",
      shipToAddressLine1: "",
      shipToAddressLine2: "",
      shipToCity: "",
      shipToPostCode: "",
      phoneNumber: "",
    };
  });

  const [selectedItems, setSelectedItems] = useState(() => {
    if (order) {
      const items = getItemLines(order);
      const initialSelected = {};
      items.forEach((item) => {
        initialSelected[item.itemNumber] = true;
      });
      return initialSelected;
    }
    return {};
  });

  const [quantities, setQuantities] = useState(() => {
    if (order) {
      const items = getItemLines(order);
      const initialQuantities = {};
      items.forEach((item) => {
        initialQuantities[item.itemNumber] = item.quantity || 1;
      });
      return initialQuantities;
    }
    return {};
  });

  // Reset state when order changes
  const prevOrderRef = useRef(order?.number);
  useEffect(() => {
    if (order?.number !== prevOrderRef.current) {
      prevOrderRef.current = order?.number;
      setPreviewIndex(0);
      setUseCustomAddress(false);
      setCustomAddress({
        shipToName: order.shipToName || order.customerName || "",
        shipToAddressLine1: order.shipToAddressLine1 || "",
        shipToAddressLine2: order.shipToAddressLine2 || "",
        shipToCity: order.shipToCity || "",
        shipToPostCode: order.shipToPostCode || "",
        phoneNumber: order.phoneNumber || "",
      });
      const items = getItemLines(order);
      const initialSelected = {};
      const initialQuantities = {};
      items.forEach((item) => {
        initialSelected[item.itemNumber] = true;
        initialQuantities[item.itemNumber] = item.quantity || 1;
      });
      setSelectedItems(initialSelected);
      setQuantities(initialQuantities);
    }
  }, [order?.number, order]);

  const { itemLines, filteredItems, expandedItems, totalPieces } =
    useMemo(() => {
      if (!order)
        return {
          itemLines: [],
          filteredItems: [],
          expandedItems: [],
          totalPieces: 0,
        };

      const items = getItemLines(order);

      const filtered = items.filter(
        (item) => selectedItems[item.itemNumber] !== false,
      );

      const itemsWithSelectedQty = filtered.map((item) => ({
        ...item,
        quantity: quantities[item.itemNumber] ?? item.quantity,
      }));

      const total = itemsWithSelectedQty.reduce(
        (sum, l) => sum + (l.quantity || 0),
        0,
      );
      const expanded = expandItemsByQuantity(itemsWithSelectedQty);

      return {
        itemLines: items,
        filteredItems: itemsWithSelectedQty,
        totalPieces: total,
        expandedItems: expanded,
      };
    }, [order, selectedItems, quantities]);

  const displayAddress = useMemo(() => {
    if (useCustomAddress) {
      return customAddress;
    }
    return {
      shipToName: order?.shipToName || order?.customerName || "",
      shipToAddressLine1: order?.shipToAddressLine1 || "",
      shipToAddressLine2: order?.shipToAddressLine2 || "",
      shipToCity: order?.shipToCity || "",
      shipToPostCode: order?.shipToPostCode || "",
      phoneNumber: order?.phoneNumber || "",
    };
  }, [useCustomAddress, customAddress, order]);

  // Clamp previewIndex when totalPieces changes
  const clampedPreviewIndex = useMemo(() => {
    if (previewIndex >= totalPieces && totalPieces > 0) {
      return totalPieces - 1;
    }
    return previewIndex;
  }, [previewIndex, totalPieces]);

  const currentPiece = clampedPreviewIndex + 1;
  const currentExpandedItem = expandedItems[clampedPreviewIndex];
  const currentItem = currentExpandedItem?.item;

  const previewBarcodeValue = currentItem
    ? generateBarcodeValue(
        currentItem.itemNumber || currentItem.number,
        currentPiece,
        totalPieces,
      )
    : "NO-ITEM";

  const handlePrev = useCallback(() => {
    setPreviewIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPreviewIndex((prev) => Math.min(totalPieces - 1, prev + 1));
  }, [totalPieces]);

  const handleAddressChange = useCallback((field, value) => {
    setCustomAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleItem = useCallback((itemNumber, checked) => {
    setSelectedItems((prev) => ({ ...prev, [itemNumber]: checked }));
  }, []);

  const handleQuantityChange = useCallback((itemNumber, qty) => {
    setQuantities((prev) => ({ ...prev, [itemNumber]: qty }));
    setPreviewIndex(0);
  }, []);

  const handleResetSelection = useCallback(() => {
    if (!order) return;
    const items = getItemLines(order);
    const initialSelected = {};
    const initialQuantities = {};
    items.forEach((item) => {
      initialSelected[item.itemNumber] = true;
      initialQuantities[item.itemNumber] = item.quantity || 1;
    });
    setSelectedItems(initialSelected);
    setQuantities(initialQuantities);
    setPreviewIndex(0);
  }, [order]);

  const handlePrint = useCallback(() => {
    if (!order) {
      return;
    }

    const originalLines = order.salesOrderLines || [];

    const modifiedLines = originalLines
      .map((line) => {
        if (line.lineType !== "Item") return line;

        const isSelected = selectedItems[line.itemNumber] !== false;
        if (!isSelected) return null;

        return {
          ...line,
          quantity: quantities[line.itemNumber] ?? line.quantity,
        };
      })
      .filter(Boolean);

    const modifiedOrder = {
      ...order,
      ...(useCustomAddress && {
        shipToName: customAddress.shipToName,
        shipToAddressLine1: customAddress.shipToAddressLine1,
        shipToAddressLine2: customAddress.shipToAddressLine2,
        shipToCity: customAddress.shipToCity,
        shipToPostCode: customAddress.shipToPostCode,
        phoneNumber: customAddress.phoneNumber,
      }),
      salesOrderLines: modifiedLines,
    };

    const itemCount = modifiedLines.filter((l) => l.lineType === "Item").length;
    const totalQty = modifiedLines
      .filter((l) => l.lineType === "Item")
      .reduce((sum, l) => sum + (l.quantity || 0), 0);

    if (totalQty === 0) {
      return;
    }

    onPrint(modifiedOrder);
  }, [
    order,
    useCustomAddress,
    customAddress,
    selectedItems,
    quantities,
    onPrint,
  ]);

  // Update previewIndex if clamped
  useEffect(() => {
    if (clampedPreviewIndex !== previewIndex) {
      setPreviewIndex(clampedPreviewIndex);
    }
  }, [clampedPreviewIndex, previewIndex]);

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      className="flex flex-col items-center justify-center w-full h-full gap-2"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            ใบปะหน้า - {order.number}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-sm text-foreground/70">
            จะพิมพ์ทั้งหมด {totalPieces} ใบ (1 ใบ = 1 ชิ้น)
          </div>
          {totalPieces > 0 && (
            <div className="flex items-center justify-center w-full gap-2">
              <Button
                isIconOnly
                variant="flat"
                size="md"
                onPress={handlePrev}
                isDisabled={clampedPreviewIndex === 0}
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm font-medium">
                ดูตัวอย่างใบที่ {currentPiece} / {totalPieces}
              </span>
              <Button
                isIconOnly
                variant="flat"
                size="md"
                onPress={handleNext}
                isDisabled={clampedPreviewIndex >= totalPieces - 1}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </ModalHeader>

        <ModalBody className="flex flex-col items-center justify-start w-full h-fit p-2 gap-4">
          <ItemQuantitySelector
            items={itemLines}
            selectedItems={selectedItems}
            quantities={quantities}
            onToggleItem={handleToggleItem}
            onQuantityChange={handleQuantityChange}
            onReset={handleResetSelection}
          />

          {totalPieces > 0 ? (
            <div className="flex flex-col w-full bg-default rounded-xl p-2 gap-2">
              <div className="flex flex-col w-full bg-background rounded-xl overflow-hidden">
                <div className="flex flex-row items-stretch border-b-1 border-default">
                  <div className="flex items-center justify-center w-[15%] p-2 border-r-2 border-default">
                    <Image
                      src="/logo/logo-09.png"
                      alt="Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-col justify-center flex-1 p-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-semibold w-16">ผู้ส่ง:</span>
                      <span>{COMPANY_INFO.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold w-16">ที่อยู่:</span>
                      <span>{COMPANY_INFO.address1}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold w-16">โทร:</span>
                      <span>{COMPANY_INFO.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-[15%] p-2 border-l-2 border-default text-xl font-bold">
                    {currentPiece}/{totalPieces}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full p-2 border-b-1 border-default bg-white">
                  <Barcode
                    value={previewBarcodeValue}
                    format="CODE128"
                    width={1}
                    height={50}
                    displayValue={true}
                    fontOptions="bold"
                    textAlign="center"
                    textMargin={5}
                    margin={5}
                    background="#ffffff"
                    lineColor="#000000"
                  />
                </div>

                <div className="flex flex-col p-2 border-b-1 border-default gap-2">
                  <div className="flex gap-2">
                    <span className="font-semibold w-12 text-sm">ผู้รับ:</span>
                    <span className="font-bold text-base">
                      {displayAddress.shipToName}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="font-semibold w-12">ที่อยู่:</span>
                    <div className="flex flex-col">
                      <span>{displayAddress.shipToAddressLine1}</span>
                      {displayAddress.shipToAddressLine2 && (
                        <span>{displayAddress.shipToAddressLine2}</span>
                      )}
                      {(displayAddress.shipToCity ||
                        displayAddress.shipToPostCode) && (
                        <span>
                          {displayAddress.shipToCity}{" "}
                          {displayAddress.shipToPostCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="font-semibold w-12">โทร:</span>
                    <span>{displayAddress.phoneNumber || "-"}</span>
                  </div>
                </div>

                <div className="flex p-2 bg-default text-xs font-semibold">
                  <span className="w-10 text-center">#</span>
                  <span className="flex-1">รายการสินค้า</span>
                  <span className="w-16 text-right">จำนวน</span>
                </div>

                <div className="flex flex-col h-40 overflow-auto">
                  {currentItem ? (
                    <div className="flex p-2 text-sm border-b-1 border-default bg-primary/5">
                      <span className="w-10 text-center font-bold">1</span>
                      <div className="flex-1 flex flex-col">
                        <span className="whitespace-pre-wrap break-words font-medium">
                          {currentItem.description}
                        </span>
                        {currentItem.description2 && (
                          <span className="text-xs text-foreground/60 mt-1">
                            {currentItem.description2}
                          </span>
                        )}
                        <span className="text-xs text-foreground/50 mt-1">
                          Item: {currentItem.itemNumber}
                        </span>
                      </div>
                      <span className="w-16 text-right font-bold text-lg">
                        1
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-foreground/50">
                      ไม่มีสินค้า
                    </div>
                  )}
                </div>

                <div className="flex border-t-1 border-default">
                  <div className="flex flex-col flex-1 p-2 text-lg text-danger gap-2">
                    <p className="font-bold">
                      ❗กรุณาถ่ายวิดีโอขณะแกะพัสดุ
                      เพื่อใช้เป็นหลักฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี
                    </p>
                  </div>

                  <div className="flex items-center justify-center p-2">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-default">
                      <Image
                        src="/qrcode/lineEvergreen.png"
                        alt="Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-40 bg-default/50 rounded-xl">
              <p className="text-foreground/50">
                กรุณาเลือกสินค้าอย่างน้อย 1 รายการ
              </p>
            </div>
          )}

          <div className="flex flex-col w-full p-2 bg-default/50 rounded-xl">
            <p className="text-sm font-semibold mb-2">
              สรุปรายการที่จะพิมพ์ ({filteredItems.length} รายการ, {totalPieces}{" "}
              ใบ):
            </p>
            <div className="flex flex-col gap-2 text-xs max-h-32 overflow-auto">
              {filteredItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate flex-1">{item.description}</span>
                  <span className="ml-2 font-medium">x{item.quantity} ใบ</span>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-foreground/50">ไม่มีรายการที่เลือก</p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full p-3 bg-default/25 border-1 border-default rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                isSelected={useCustomAddress}
                onValueChange={setUseCustomAddress}
                size="md"
                color="secondary"
                className="text-background"
              >
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Edit3 />
                  แก้ไขที่อยู่จัดส่ง
                </span>
              </Checkbox>
            </div>

            {useCustomAddress && (
              <div className="flex flex-col gap-2">
                <Input
                  label="ชื่อผู้รับ"
                  size="md"
                  value={customAddress.shipToName}
                  onValueChange={(v) => handleAddressChange("shipToName", v)}
                />
                <Input
                  label="ที่อยู่ บรรทัด 1"
                  size="md"
                  value={customAddress.shipToAddressLine1}
                  onValueChange={(v) =>
                    handleAddressChange("shipToAddressLine1", v)
                  }
                />
                <Input
                  label="เบอร์โทรศัพท์"
                  size="md"
                  value={customAddress.phoneNumber}
                  onValueChange={(v) => handleAddressChange("phoneNumber", v)}
                />
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Button
              color="danger"
              variant="shadow"
              size="md"
              radius="md"
              className="flex-1 text-background"
              onPress={onClose}
            >
              ปิด
            </Button>
            <Button
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="flex-1 text-background"
              startContent={<Printer />}
              onPress={handlePrint}
              isLoading={printing}
              isDisabled={totalPieces === 0}
            >
              {printing ? "กำลังพิมพ์..." : `พิมพ์ ${totalPieces} ใบ`}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UISalesOrderOnline({
  orders = [],
  loading,
  onPrintSingle,
  printing = false,
  onRefresh,
}) {
  const {
    isOpen: isDetailOpen,
    onOpen: openDetail,
    onClose: closeDetail,
  } = useDisclosure();

  const {
    isOpen: isPreviewOpen,
    onOpen: openPreview,
    onClose: closePreview,
  } = useDisclosure();

  const {
    isOpen: isSettingsOpen,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const { isConnected } = useRFIDSafe();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredOrders = useMemo(() => {
    return filterOrdersByDateRange(orders, fromDate, toDate);
  }, [orders, fromDate, toDate]);

  const stats = useMemo(() => {
    return calculateOrderStats(filteredOrders);
  }, [filteredOrders]);

  const total = stats.totalOrders;
  const totalAmount = stats.totalAmount;
  const totalItems = stats.totalItems;

  const normalized = useMemo(
    () =>
      Array.isArray(filteredOrders)
        ? filteredOrders.map((order, i) => ({
            ...order,
            index: i + 1,
            totalFormatted: formatCurrency(order.totalAmountIncludingTax),
            orderDateFormatted: order.orderDate,
            deliveryDateFormatted: order.requestedDeliveryDate,
            _rawOrder: order,
          }))
        : [],
    [filteredOrders],
  );

  const handleViewOrder = useCallback(
    (order) => {
      setSelectedOrder(order);
      openDetail();
    },
    [openDetail],
  );

  const handleCloseDetail = useCallback(() => {
    closeDetail();
    setSelectedOrder(null);
  }, [closeDetail]);

  const handleOpenPreview = useCallback(
    (order) => {
      setPreviewOrder(order);
      openPreview();
    },
    [openPreview],
  );

  const handleClosePreview = useCallback(() => {
    closePreview();
    setPreviewOrder(null);
  }, [closePreview]);

  const handlePrintPackingSlip = useCallback(
    (modifiedOrder) => {
      const itemLines = (modifiedOrder.salesOrderLines || []).filter(
        (l) => l.lineType === "Item",
      );
      const totalPieces = itemLines.reduce(
        (sum, l) => sum + (l.quantity || 0),
        0,
      );

      console.log("[UISalesOrderOnline] handlePrintPackingSlip called:", {
        orderNumber: modifiedOrder?.number,
        itemCount: itemLines.length,
        totalPieces,
        shipToName: modifiedOrder?.shipToName,
        salesOrderLinesCount: modifiedOrder?.salesOrderLines?.length,
      });

      if (totalPieces === 0) {
        console.error("[UISalesOrderOnline] No items to print!");
        return;
      }

      closePreview();
      onPrintSingle(modifiedOrder, { type: "packingSlip", enableRFID: false });
    },
    [closePreview, onPrintSingle],
  );

  const renderCustomCell = useCallback(
    (item, columnKey) => {
      switch (columnKey) {
        case "actions":
          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                isIconOnly
                color="default"
                variant="shadow"
                size="md"
                radius="md"
                onPress={() => handleViewOrder(item._rawOrder)}
              >
                <Telescope />
              </Button>
            </div>
          );

        case "customerName":
          return (
            <div className="flex flex-col">
              <span className="truncate max-w-[200px]">
                {item.customerName}
              </span>
              <span className="text-xs text-foreground/60">
                {item.customerNumber}
              </span>
            </div>
          );

        default:
          return undefined;
      }
    },
    [handleViewOrder],
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 border-1 border-default overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <span className="font-medium">Printer</span>
            <Button
              isIconOnly
              variant="light"
              size="md"
              onPress={openSettings}
              title="Printer Settings"
            >
              <Settings />
            </Button>
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <PrinterStatusBadge />
          </div>
        </div>

        {(fromDate || toDate) && (
          <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default bg-primary/10">
            <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-primary text-sm">
              <Filter className="w-4 h-4" />
              กรองข้อมูล
            </div>
            <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-xs text-primary/80">
              {fromDate && new Date(fromDate).toLocaleDateString("th-TH")}
              {fromDate && toDate && " - "}
              {toDate && new Date(toDate).toLocaleDateString("th-TH")}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Orders
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
          {(fromDate || toDate) && (
            <div className="text-xs text-foreground/50">
              จาก {orders.length} รายการ
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {totalItems}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Amount
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <Button
            variant="light"
            size="md"
            onPress={onRefresh}
            isDisabled={loading}
            className="w-full"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full xl:w-[80%] h-full gap-2 overflow-hidden overflow-y-auto">
        <div className="flex xl:hidden items-center justify-between w-full p-2">
          <PrinterStatusBadge />
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="light"
              size="md"
              onPress={openSettings}
              title="Printer Settings"
            >
              <Settings />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="md"
              onPress={onRefresh}
              isDisabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        <div className="w-full p-4">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onClear={() => {
              setFromDate("");
              setToDate("");
            }}
            onQuickSelect={(from, to) => {
              setFromDate(from);
              setToDate(to);
            }}
          />
        </div>

        <div className="flex flex-col w-full p-4 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                สรุปภาพรวมประจำเดือน (Executive Summary)
              </h2>
            </div>
            {(fromDate || toDate) && (
              <Chip color="primary" variant="flat" size="sm">
                กรองข้อมูล: {filteredOrders.length} รายการ
              </Chip>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <ExecutiveSummaryCard
              title="ยอดขายออนไลน์รวม"
              value={`${formatNumber(stats.totalAmount)} บาท`}
              subValue={`เป้าหมาย: ${formatNumber(1500000)} บาท (${stats.totalAmount > 0 ? ((stats.totalAmount / 1500000) * 100).toFixed(1) : 0}%)`}
              icon={ShoppingCart}
              color="primary"
            />

            <ExecutiveSummaryCard
              title="จำนวนออเดอร์"
              value={`${formatNumber(stats.totalOrders)} ออเดอร์`}
              icon={Calendar}
              color="default"
            />

            <ExecutiveSummaryCard
              title="จำนวนสินค้า"
              value={`${formatNumber(stats.totalItems)} ชิ้น`}
              icon={Package}
              color="success"
            />

            <ExecutiveSummaryCard
              title="ราคาเฉลี่ยต่อออเดอร์"
              value={`${formatNumber(Math.round(stats.avgOrderValue))} บาท`}
              subValue={`จาก ${stats.totalOrders} ออเดอร์`}
              icon={Target}
              color="warning"
            />
          </div>

          <div className="flex flex-col gap-3 p-4 bg-default/30 rounded-xl border border-default">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-foreground/70" />
              <span className="font-medium">จำนวนออเดอร์และรายละเอียด</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-foreground/60">
                  แยกตามช่องทาง
                </span>
                {stats.channelBreakdown.length > 0 ? (
                  stats.channelBreakdown.map((channel) => (
                    <ChannelBadge
                      key={channel.name}
                      icon={
                        channel.name === "Facebook"
                          ? Facebook
                          : channel.name === "Line"
                            ? MessageCircle
                            : Globe
                      }
                      label={channel.name}
                      count={channel.orders}
                      total={stats.totalOrders}
                    />
                  ))
                ) : (
                  <div className="text-sm text-foreground/50">
                    ไม่มีข้อมูลช่องทาง
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-foreground/60">แยกตามสินค้า</span>
                <div className="flex flex-col gap-1 p-2 bg-default/50 rounded-lg">
                  {stats.productBreakdown.length > 0 ? (
                    stats.productBreakdown.map((product) => (
                      <div
                        key={product.name}
                        className="flex justify-between text-sm"
                      >
                        <span>{product.name}</span>
                        <span className="font-medium">
                          {product.quantity} ชิ้น
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-foreground/50">
                      ไม่มีข้อมูลสินค้า
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-foreground/60">
                  แยกตามประเภทลูกค้า
                </span>
                <div className="flex flex-col gap-1 p-2 bg-default/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Owner (B2C)</span>
                    <span className="font-medium">
                      {stats.uniqueCustomers} ราย
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ลูกค้าใหม่ (ประมาณการ)</span>
                    <span className="font-medium">{stats.newLeads} ราย</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ลูกค้าซ้ำ (ประมาณการ)</span>
                    <span className="font-medium">
                      {stats.repeatCustomers} ราย
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-default/30 rounded-xl border border-default">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium">
                กราฟเปรียบเทียบยอดขาย (ธ.ค. vs ม.ค.)
              </span>
            </div>
            <MonthlySalesChart data={stats.monthlyData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-primary" />
                <span className="font-medium">Conversion Rate</span>
                <Chip color="warning" variant="flat" size="sm">
                  Coming Soon
                </Chip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-foreground/60">
                  อัตราการแปลงจากผู้เข้าชมเป็นลูกค้า - กำลังพัฒนา
                </span>
              </div>
              <p className="text-xs text-foreground/50">
                * จะเชื่อมต่อกับข้อมูล Analytics ในอนาคต
              </p>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-warning/5 rounded-xl border border-warning/20">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-warning" />
                <span className="font-medium">Customer Satisfaction Score</span>
                <span className="px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-foreground/70">
                {customerSatisfactionStatus.message}
              </p>
              <p className="text-xs text-foreground/50">
                เริ่มใช้งาน: {customerSatisfactionStatus.effectiveDate}
              </p>
              <p className="text-xs text-foreground/50">
                {customerSatisfactionStatus.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full p-4 gap-4 border-t border-default">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold">
              ผลการดำเนินงานด้านการขาย (Sales Performance)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <ExecutiveSummaryCard
              title="จำนวนลีดใหม่ (New Leads)"
              value={`${stats.uniqueCustomers} ราย`}
              subValue={`ลูกค้าใหม่ ~${stats.newLeads} ราย | ลูกค้าซ้ำ ~${stats.repeatCustomers} ราย`}
              icon={Users}
              color="success"
            />

            <ExecutiveSummaryCard
              title="อัตราการปิดการขาย (Closing Rate)"
              value={`${stats.uniqueCustomers > 0 ? ((stats.totalOrders / stats.uniqueCustomers) * 100).toFixed(1) : 0}%`}
              subValue={`ปิดการขายสำเร็จ ${stats.totalOrders} จาก ${stats.uniqueCustomers} ลูกค้า`}
              icon={Target}
              color="primary"
            />

            <ExecutiveSummaryCard
              title="จำนวนลูกค้าซ้ำ (ประมาณการ)"
              value={`${stats.repeatCustomers} คน`}
              subValue="ลูกค้าที่ซื้อซ้ำ"
              icon={Repeat}
              color="warning"
            />

            <ExecutiveSummaryCard
              title="สรุปยอดออเดอร์รวม"
              value={`${stats.totalOrders} ออเดอร์`}
              subValue={`มูลค่ารวม ${formatNumber(stats.totalAmount)} บาท`}
              icon={ShoppingCart}
              color="default"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-default/30 rounded-xl border border-default">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-success" />
                <span className="font-medium">ยอดขายแยกตามผลิตภัณฑ์</span>
              </div>
              <ProductSalesChart data={stats.productBreakdown} />
            </div>

            <div className="p-4 bg-default/30 rounded-xl border border-default">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-medium">ยอดขายแยกตามช่องทาง</span>
              </div>
              <ChannelSalesChart data={stats.channelBreakdown} />
            </div>
          </div>

          <div className="p-4 bg-default/30 rounded-xl border border-default">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-danger" />
              <h3 className="font-semibold text-lg">
                Top 10 SKU ขายดีประจำเดือน
              </h3>
            </div>
            <Top10SKUChart data={stats.topSKUs} />
          </div>
        </div>

        <div className="flex flex-col w-full p-4 gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-foreground/70" />
            <h2 className="text-lg font-semibold">รายการคำสั่งซื้อ</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center w-full h-64 gap-2">
              <Loading />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={normalized}
              searchPlaceholder="Search SO number or customer"
              emptyContent="No orders found"
              itemName="orders"
              renderCustomCell={renderCustomCell}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody className="p-2">
            <PrinterSettings
              onClose={closeSettings}
              showHeader={true}
              title="ควบคุมเครื่องพิมพ์"
              subtitle="ChainWay RFID Printer"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        order={selectedOrder}
        onOpenPreview={handleOpenPreview}
        isConnected={isConnected}
        printing={printing}
      />

      <SlipPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        order={previewOrder}
        onPrint={handlePrintPackingSlip}
        printing={printing}
      />
    </div>
  );
}
