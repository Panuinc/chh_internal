"use client";

import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { useDisclosure } from "@heroui/modal";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
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

const MONTHLY_TARGET = 1500000;
const YEARLY_TARGET = 18000000;

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
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
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
      uniqueCustomers: 0,
      newCustomers: 0,
      repeatCustomers: 0,
      repeatRate: 0,
      topCustomers: [],
      geoDistribution: [],
      fulfillmentRate: 0,
      shippedOrders: 0,
      avgItemsPerOrder: 0,
      momGrowth: null,
      bestMonth: null,
      monthCount: 1,
    };
  }

  const totalOrders = orders.length;
  const totalAmount = orders.reduce(
    (sum, o) => sum + (o.totalAmountExcludingTax || 0),
    0,
  );
  const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

  const productStats = {};
  const skuStats = {};
  let totalItemCount = 0;

  const customerOrderCount = {};
  const customerRevenue = {};
  const customerNames = {};
  const cityStats = {};
  let shippedOrders = 0;

  orders.forEach((order) => {
    const custNum = order.customerNumber || "Unknown";
    customerOrderCount[custNum] = (customerOrderCount[custNum] || 0) + 1;
    customerRevenue[custNum] =
      (customerRevenue[custNum] || 0) + (order.totalAmountExcludingTax || 0);
    if (!customerNames[custNum]) {
      customerNames[custNum] = order.customerName || custNum;
    }

    const city = (order.shipToCity || "").trim() || "Unknown";
    if (!cityStats[city]) {
      cityStats[city] = { orders: 0, revenue: 0 };
    }
    cityStats[city].orders += 1;
    cityStats[city].revenue += order.totalAmountExcludingTax || 0;

    if (order.fullyShipped === true) shippedOrders++;

    const lines = order.salesOrderLines || [];
    lines.forEach((line) => {
      if (line.lineType !== "Item") return;

      totalItemCount += line.quantity || 0;

      const itemNumber = line.itemNumber || line.lineObjectNumber || "Unknown";
      const description = line.description || "";

      let category = "Others";
      if (description.includes("WPC") || itemNumber.includes("WPC")) {
        category =
          description.includes("วงกบ") || itemNumber.includes("FRAME")
            ? "WPC Frame"
            : "WPC Door Panel";
      } else if (
        description.includes("uPVC") ||
        description.includes("UPVC") ||
        itemNumber.includes("UPVC")
      ) {
        category =
          description.includes("วงกบ") || itemNumber.includes("FRAME")
            ? "uPVC Frame"
            : "uPVC Door Panel";
      } else if (description.includes("วงกบ") || itemNumber.includes("FRAME")) {
        category = "Frame";
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
        line.amountExcludingTax || line.netAmount || 0;
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

  const channelStats = { Facebook: 0, Line: 0, Website: 0, Others: 0 };
  orders.forEach((order) => {
    const extDoc = (order.externalDocumentNumber || "").toLowerCase();
    const custName = (order.customerName || "").toLowerCase();

    if (
      extDoc.includes("fb") ||
      extDoc.includes("facebook") ||
      custName.includes("facebook")
    ) {
      channelStats.Facebook++;
    } else if (extDoc.includes("line") || custName.includes("line")) {
      channelStats.Line++;
    } else if (extDoc.includes("web") || custName.includes("web")) {
      channelStats.Website++;
    } else {
      channelStats["Others"]++;
    }
  });

  const channelBreakdown = Object.entries(channelStats)
    .filter(([_, count]) => count > 0)
    .map(([name, orderCount]) => ({
      name,
      orders: orderCount,
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
    const monthLabel = `${getMonthName(order.orderDate)} ${date.getFullYear()}`;

    if (!monthStats[monthKey]) {
      monthStats[monthKey] = { month: monthLabel, sales: 0, orders: 0 };
    }
    monthStats[monthKey].sales += order.totalAmountExcludingTax || 0;
    monthStats[monthKey].orders += 1;
  });

  const sortedMonthKeys = Object.keys(monthStats).sort();
  const monthlyData = sortedMonthKeys.map((key) => monthStats[key]);
  const monthCount = sortedMonthKeys.length || 1;

  let momGrowth = null;
  if (sortedMonthKeys.length >= 2) {
    const lastKey = sortedMonthKeys[sortedMonthKeys.length - 1];
    const prevKey = sortedMonthKeys[sortedMonthKeys.length - 2];
    const lastSales = monthStats[lastKey].sales;
    const prevSales = monthStats[prevKey].sales;
    if (prevSales > 0) {
      const pct = (((lastSales - prevSales) / prevSales) * 100).toFixed(1);
      momGrowth = {
        percentage: pct,
        direction: lastSales >= prevSales ? "up" : "down",
        lastMonth: monthStats[lastKey].month,
        prevMonth: monthStats[prevKey].month,
      };
    }
  }

  let bestMonth = null;
  if (sortedMonthKeys.length > 0) {
    const bestKey = sortedMonthKeys.reduce((best, key) =>
      monthStats[key].sales > monthStats[best].sales ? key : best,
    );
    bestMonth = {
      name: monthStats[bestKey].month,
      sales: monthStats[bestKey].sales,
      orders: monthStats[bestKey].orders,
    };
  }

  const uniqueCustomers = Object.keys(customerOrderCount).length;
  const repeatCustomers = Object.values(customerOrderCount).filter(
    (c) => c > 1,
  ).length;
  const newCustomers = uniqueCustomers - repeatCustomers;
  const repeatRate =
    uniqueCustomers > 0
      ? ((repeatCustomers / uniqueCustomers) * 100).toFixed(1)
      : 0;

  const topCustomers = Object.entries(customerRevenue)
    .map(([custNum, revenue]) => ({
      customerNumber: custNum,
      customerName: customerNames[custNum],
      revenue,
      orderCount: customerOrderCount[custNum],
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const geoDistribution = Object.entries(cityStats)
    .map(([city, data]) => ({
      name: city,
      orders: data.orders,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const fulfillmentRate =
    totalOrders > 0 ? ((shippedOrders / totalOrders) * 100).toFixed(1) : 0;
  const avgItemsPerOrder =
    totalOrders > 0 ? (totalItemCount / totalOrders).toFixed(1) : 0;

  return {
    totalOrders,
    totalAmount,
    totalItems: totalItemCount,
    avgOrderValue,
    productBreakdown,
    channelBreakdown,
    monthlyData,
    topSKUs,
    uniqueCustomers,
    newCustomers,
    repeatCustomers,
    repeatRate,
    topCustomers,
    geoDistribution,
    fulfillmentRate,
    shippedOrders,
    avgItemsPerOrder,
    momGrowth,
    bestMonth,
    monthCount,
  };
}

function MonthlySalesChart({ data }) {
  const chartData = data.map((d) => ({ ...d, target: MONTHLY_TARGET }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-default-400">
        No sales data available
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
            formatter={(value) => `${formatCurrency(value)} THB`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey="sales"
            name="Actual Sales"
            fill="#006FEE"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="target"
            name="Target"
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
      <div className="w-full h-64 flex items-center justify-center text-default-400">
        No product data available
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
            formatter={(value) => `${value} pcs`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="quantity" name="Quantity" radius={[4, 4, 0, 0]}>
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
      <div className="w-full h-64 flex items-center justify-center text-default-400">
        No channel data available
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
            formatter={(value) => `${value} orders`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="orders" name="Order Count" radius={[4, 4, 0, 0]}>
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
      <div className="w-full h-64 flex items-center justify-center text-default-400">
        No SKU data available
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
                if (name === "quantity") return [`${value} pcs`, "Sales Qty"];
                return [formatCurrency(value) + " THB", "Revenue"];
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-default-50">
              <th className="p-2 text-left font-medium">Rank</th>
              <th className="p-2 text-left font-medium">SKU Code</th>
              <th className="p-2 text-left font-medium">Description</th>
              <th className="p-2 text-right font-medium">Quantity</th>
              <th className="p-2 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.name}
                className="border-b-1 border-default hover:bg-default-50"
              >
                <td className="p-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-amber-50 text-warning"
                        : index === 1
                          ? "bg-default-100 text-foreground"
                          : index === 2
                            ? "bg-red-50 text-danger"
                            : "bg-default-50 text-default-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="p-2 font-mono text-xs">{item.name}</td>
                <td className="p-2 text-default-700">{item.description}</td>
                <td className="p-2 text-right font-medium">
                  {item.quantity} pcs
                </td>
                <td className="p-2 text-right">
                  {formatCurrency(item.revenue)} THB
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SmartInsightsRow({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="flex flex-col p-2 bg-default-50 rounded-lg border-1 border-default">
        <span className="text-xs text-default-500">Fulfillment Rate</span>
        <span className="text-lg font-bold">{stats.fulfillmentRate}%</span>
        <span className="text-xs text-default-400">
          {stats.shippedOrders} / {stats.totalOrders} shipped
        </span>
      </div>

      <div className="flex flex-col p-2 bg-default-50 rounded-lg border-1 border-default">
        <span className="text-xs text-default-500">MoM Growth</span>
        {stats.momGrowth ? (
          <>
            <div
              className={`flex items-center gap-1 text-lg font-bold ${stats.momGrowth.direction === "up" ? "text-success" : "text-danger"}`}
            >
              {stats.momGrowth.direction === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {stats.momGrowth.percentage}%
            </div>
            <span className="text-xs text-default-400">
              vs {stats.momGrowth.prevMonth}
            </span>
          </>
        ) : (
          <span className="text-sm text-default-400">Need 2+ months</span>
        )}
      </div>

      <div className="flex flex-col p-2 bg-default-50 rounded-lg border-1 border-default">
        <span className="text-xs text-default-500">Avg Items/Order</span>
        <span className="text-lg font-bold">{stats.avgItemsPerOrder} pcs</span>
        <span className="text-xs text-default-400">
          {formatNumber(stats.totalItems)} total items
        </span>
      </div>

      <div className="flex flex-col p-2 bg-default-50 rounded-lg border-1 border-default">
        <span className="text-xs text-default-500">Best Month</span>
        {stats.bestMonth ? (
          <>
            <span className="text-lg font-bold">{stats.bestMonth.name}</span>
            <span className="text-xs text-default-400">
              {formatNumber(stats.bestMonth.sales)} THB
            </span>
          </>
        ) : (
          <span className="text-sm text-default-400">No data</span>
        )}
      </div>
    </div>
  );
}

function TopCustomersTable({ data }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-default-400">
        No customer data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-default-50">
            <th className="p-2 text-left font-medium">#</th>
            <th className="p-2 text-left font-medium">Customer</th>
            <th className="p-2 text-right font-medium">Orders</th>
            <th className="p-2 text-right font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer, index) => (
            <tr
              key={customer.customerNumber}
              className="border-b-1 border-default hover:bg-default-50"
            >
              <td className="p-2">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-amber-50 text-warning"
                      : index === 1
                        ? "bg-default-100 text-foreground"
                        : index === 2
                          ? "bg-red-50 text-danger"
                          : "bg-default-50 text-default-500"
                  }`}
                >
                  {index + 1}
                </span>
              </td>
              <td className="p-2">
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[200px]">
                    {customer.customerName}
                  </span>
                  <span className="text-xs text-default-500">
                    {customer.customerNumber}
                  </span>
                </div>
              </td>
              <td className="p-2 text-right">{customer.orderCount}</td>
              <td className="p-2 text-right font-medium">
                {formatCurrency(customer.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GeoDistributionChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-default-400">
        No geographic data available
      </div>
    );
  }

  const colors = [
    "#006FEE",
    "#17C964",
    "#F5A524",
    "#9353D3",
    "#F31260",
    "#71717A",
    "#0E793C",
    "#C4841D",
    "#7828C8",
    "#A1A1AA",
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
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
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            width={75}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "revenue")
                return [`${formatCurrency(value)} THB`, "Revenue"];
              return [`${value} orders`, "Orders"];
            }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="orders" name="Orders" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 10]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatDateForInput(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    { label: "Today", value: "today" },
    { label: "This Week", value: "thisWeek" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "All", value: "all" },
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
    <div className="flex flex-col gap-2 p-2 bg-default-50 rounded-lg border-1 border-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-foreground" />
          <span className="font-medium">Filter by Date Range</span>
        </div>
        {hasFilter && (
          <Button
            size="sm"
            variant="light"
            color="danger"
            startContent={<X className="w-4 h-4" />}
            onPress={onClear}
          >
            Clear Filter
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-default-500">Start Date (From)</label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            placeholder="Select start date"
            startContent={<Calendar className="w-4 h-4 text-default-400" />}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-default-500">End Date (To)</label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            placeholder="Select end date"
            startContent={<Calendar className="w-4 h-4 text-default-400" />}
          />
        </div>
      </div>

      {hasFilter && (
        <div className="flex items-center gap-2 p-2 bg-default-50 rounded-lg">
          <Calendar className="w-4 h-4 text-foreground" />
          <span className="text-sm text-foreground">
            Showing data:{" "}
            {fromDate ? new Date(fromDate).toLocaleDateString("en-US") : "All"}
            {" - "}
            {toDate ? new Date(toDate).toLocaleDateString("en-US") : "Present"}
          </span>
        </div>
      )}
    </div>
  );
}

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
    primary: "bg-default-50 border-default text-foreground",
    success: "bg-default-50 border-default text-foreground",
    warning: "bg-default-50 border-default text-foreground",
    danger: "bg-default-50 border-default text-foreground",
    default: "bg-default-50 border-default text-foreground",
  };

  return (
    <div
      className={`flex flex-col p-2 rounded-lg border ${colorClasses[color]} min-h-[120px]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs opacity-70">{title}</span>
          <span className="text-2xl font-bold">{value}</span>
          {subValue && <span className="text-xs opacity-60">{subValue}</span>}
        </div>
        {Icon && <Icon className="w-5 h-5 opacity-60" />}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-2 text-xs ${trend === "up" ? "text-success" : "text-danger"}`}
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
    <div className="flex items-center gap-2 p-2 bg-background border-1 border-default rounded-lg">
      <Icon className="w-4 h-4 text-default-500" />
      <div className="flex flex-col">
        <span className="text-xs text-default-500">{label}</span>
        <span className="text-sm font-medium">
          {count} orders ({percentage}%)
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
              <span className="text-xs text-default-500">
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
          <p className="text-sm font-medium">Remarks:</p>
          {commentLines.map((line) => (
            <p key={line.id} className="text-sm text-default-600">
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
            <span className="text-sm text-default-500">
              Ref: {order.externalDocumentNumber}
            </span>
          )}
        </ModalHeader>

        <ModalBody className="gap-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-start gap-2">
              <User className="text-default-400" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Customer</p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-default-600">
                  {order.customerNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="text-default-400" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Dates</p>
                <p className="text-sm">Order: {order.orderDate}</p>
                <p className="text-sm">
                  Delivery: {order.requestedDeliveryDate}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="text-default-400" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Ship To</p>
                <p className="text-sm">{order.shipToName}</p>
                <p className="text-sm text-default-600">
                  {order.shipToAddressLine1}
                </p>
                {order.shipToCity && (
                  <p className="text-sm text-default-600">
                    {order.shipToCity} {order.shipToPostCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Divider />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Package className="text-default-400" />
              <span className="font-medium">
                Order Lines ({lineCount} items)
              </span>
            </div>
            <OrderLinesTable lines={lines} />
          </div>

          <div className="flex justify-end border-t-1 border-default pt-4">
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
              <p className="text-lg font-bold text-foreground">
                Total: {formatCurrency(order.totalAmountIncludingTax)}{" "}
                {order.currencyCode}
              </p>
            </div>
          </div>

          {!isConnected && (
            <div className="flex flex-col gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-danger font-medium">
                ⚠️ Printer Not Connected
              </p>
              <p className="text-xs text-red-400">
                Please connect the RFID printer before printing
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
            className="w-full text-white"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-white"
            startContent={<Printer />}
            isDisabled={!isConnected || printing || lineCount === 0}
            onPress={() => {
              onClose();
              onOpenPreview(order);
            }}
          >
            Packing Slip
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
    <div className="flex flex-col w-full p-2 bg-default-50/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="text-default-500" />
          <span className="text-sm font-semibold">Select Items to Print</span>
        </div>
        <Button
          size="md"
          color="default"
          variant="shadow"
          startContent={<RotateCcw />}
          onPress={onReset}
        >
          Reset
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
              className={`flex items-center gap-2 p-2 rounded-lg ${
                isSelected
                  ? "bg-background border-1 border-default shadow-sm"
                  : "bg-default-50/50 border-1 border-default"
              }`}
            >
              <Checkbox
                isSelected={isSelected}
                onValueChange={(checked) =>
                  onToggleItem(item.itemNumber, checked)
                }
                size="md"
                color="primary"
                className="text-white"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.description}
                </p>
                <p className="text-xs text-default-500">{item.itemNumber}</p>
              </div>

              <div className="flex items-center gap-2">
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

                <span className="text-xs text-default-400 w-12 text-right">
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

  const prevOrderRef = useRef(order?.number);
  useEffect(() => {
    if (order?.number !== prevOrderRef.current) {
      prevOrderRef.current = order?.number;
      queueMicrotask(() => {
        if (!order) return;
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
      });
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
            Packing Slip - {order.number}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-sm text-default-600">
            Will print {totalPieces} slips total (1 slip = 1 piece)
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
                Preview slip {currentPiece} / {totalPieces}
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

        <ModalBody className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2">
          <ItemQuantitySelector
            items={itemLines}
            selectedItems={selectedItems}
            quantities={quantities}
            onToggleItem={handleToggleItem}
            onQuantityChange={handleQuantityChange}
            onReset={handleResetSelection}
          />

          {totalPieces > 0 ? (
            <div className="flex flex-col w-full bg-default-100 rounded-lg p-2 gap-2">
              <div className="flex flex-col w-full bg-background rounded-lg overflow-hidden">
                <div className="flex flex-row items-stretch border-b-1 border-default">
                  <div className="flex items-center justify-center w-[15%] p-2 border-r-1 border-default">
                    <Image
                      src="/logo/logo-03.png"
                      alt="Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-col justify-center flex-1 p-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-semibold w-16">Sender:</span>
                      <span>{COMPANY_INFO.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold w-16">Address:</span>
                      <span>{COMPANY_INFO.address1}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold w-16">Tel:</span>
                      <span>{COMPANY_INFO.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-[15%] p-2 border-l-1 border-default text-xl font-bold">
                    {currentPiece}/{totalPieces}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full p-2 border-b-1 border-default bg-background">
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
                    <span className="font-semibold w-12 text-sm">To:</span>
                    <span className="font-bold text-base">
                      {displayAddress.shipToName}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="font-semibold w-12">Addr:</span>
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
                    <span className="font-semibold w-12">Tel:</span>
                    <span>{displayAddress.phoneNumber || "-"}</span>
                  </div>
                </div>

                <div className="flex p-2 bg-default-100 text-xs font-semibold">
                  <span className="w-10 text-center">#</span>
                  <span className="flex-1">Item</span>
                  <span className="w-16 text-right">Qty</span>
                </div>

                <div className="flex flex-col h-40 overflow-auto">
                  {currentItem ? (
                    <div className="flex p-2 text-sm border-b-1 border-default bg-default-50">
                      <span className="w-10 text-center font-bold">1</span>
                      <div className="flex-1 flex flex-col">
                        <span className="whitespace-pre-wrap break-words font-medium">
                          {currentItem.description}
                        </span>
                        {currentItem.description2 && (
                          <span className="text-xs text-default-500">
                            {currentItem.description2}
                          </span>
                        )}
                        <span className="text-xs text-default-400">
                          Item: {currentItem.itemNumber}
                        </span>
                      </div>
                      <span className="w-16 text-right font-bold text-lg">
                        1
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-default-400">
                      No items
                    </div>
                  )}
                </div>

                <div className="flex border-t-1 border-default">
                  <div className="flex flex-col flex-1 p-2 text-lg text-danger gap-2">
                    <p className="font-bold">
                      ❗Please record a video while unboxing the parcel for use
                      as evidence for product claims. No evidence, no claims
                      accepted.
                    </p>
                  </div>

                  <div className="flex items-center justify-center p-2">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-lg bg-default-100">
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
            <div className="flex items-center justify-center w-full h-40 bg-default-50 rounded-lg">
              <p className="text-default-400">Please select at least 1 item</p>
            </div>
          )}

          <div className="flex flex-col w-full p-2 bg-default-50 rounded-lg">
            <p className="text-sm font-semibold">
              Print Summary ({filteredItems.length} items, {totalPieces} slips):
            </p>
            <div className="flex flex-col gap-2 text-xs max-h-32 overflow-auto">
              {filteredItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate flex-1">{item.description}</span>
                  <span className="font-medium">x{item.quantity} slips</span>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-default-400">No items selected</p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full p-2 bg-default-50 border-1 border-default rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                isSelected={useCustomAddress}
                onValueChange={setUseCustomAddress}
                size="md"
                color="secondary"
                className="text-white"
              >
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Edit3 />
                  Edit Shipping Address
                </span>
              </Checkbox>
            </div>

            {useCustomAddress && (
              <div className="flex flex-col gap-2">
                <Input
                  label="Recipient Name"
                  size="md"
                  value={customAddress.shipToName}
                  onValueChange={(v) => handleAddressChange("shipToName", v)}
                />
                <Input
                  label="Address Line 1"
                  size="md"
                  value={customAddress.shipToAddressLine1}
                  onValueChange={(v) =>
                    handleAddressChange("shipToAddressLine1", v)
                  }
                />
                <Input
                  label="Phone Number"
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
              className="flex-1 text-white"
              onPress={onClose}
            >
              Close
            </Button>
            <Button
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="flex-1 text-white"
              startContent={<Printer />}
              onPress={handlePrint}
              isLoading={printing}
              isDisabled={totalPieces === 0}
            >
              {printing ? "Printing..." : `Print ${totalPieces} Slips`}
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
              <span className="text-xs text-default-500">
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
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      <div className="hidden xl:flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Orders</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Items</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">
            {totalItems}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Amount</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        {(fromDate || toDate) && (
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-default-500" />
            <span className="text-xs text-default-500">
              {fromDate && new Date(fromDate).toLocaleDateString("en-US")}
              {fromDate && toDate && " - "}
              {toDate && new Date(toDate).toLocaleDateString("en-US")}
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 p-2 rounded">
              of {orders.length}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <PrinterStatusBadge />
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={openSettings}
            title="Printer Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onRefresh}
            isDisabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex xl:hidden items-center justify-between w-full shrink-0">
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

      <div className="flex-1 min-h-0 overflow-hidden overflow-y-auto">
        <div className="w-full p-2">
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

        <div className="flex flex-col w-full p-2 gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-foreground" />
              <h2 className="text-lg font-semibold">Executive Summary</h2>
            </div>
            {(fromDate || toDate) && (
              <Chip color="primary" variant="flat" size="sm">
                Filtered: {filteredOrders.length} records
              </Chip>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <ExecutiveSummaryCard
              title="Total Online Sales"
              value={`${formatNumber(stats.totalAmount)} THB`}
              subValue={(() => {
                const target =
                  fromDate || toDate
                    ? stats.monthCount * MONTHLY_TARGET
                    : YEARLY_TARGET;
                const pct =
                  stats.totalAmount > 0
                    ? ((stats.totalAmount / target) * 100).toFixed(1)
                    : 0;
                return `Target: ${formatNumber(target)} THB (${pct}%)`;
              })()}
              icon={ShoppingCart}
              color="primary"
            />

            <ExecutiveSummaryCard
              title="Order Count"
              value={`${formatNumber(stats.totalOrders)} Orders`}
              subValue={`${stats.uniqueCustomers} unique customers`}
              icon={Calendar}
              color="default"
            />

            <ExecutiveSummaryCard
              title="Total Items"
              value={`${formatNumber(stats.totalItems)} pcs`}
              subValue={`${stats.avgItemsPerOrder} avg per order`}
              icon={Package}
              color="success"
            />

            <ExecutiveSummaryCard
              title="Average Order Value"
              value={`${formatNumber(Math.round(stats.avgOrderValue))} THB`}
              subValue={`From ${stats.totalOrders} orders`}
              icon={Target}
              trend={stats.momGrowth?.direction}
              trendValue={
                stats.momGrowth
                  ? `${stats.momGrowth.percentage}% vs ${stats.momGrowth.prevMonth}`
                  : undefined
              }
              color="warning"
            />
          </div>

          <SmartInsightsRow stats={stats} />

          <div className="p-2 bg-default-50/50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-foreground" />
              <span className="font-medium">Monthly Sales vs Target</span>
            </div>
            <MonthlySalesChart data={stats.monthlyData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="flex flex-col gap-2 p-2 bg-default-50/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-foreground" />
                <span className="font-medium">Sales by Channel</span>
              </div>
              {stats.channelBreakdown.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {stats.channelBreakdown.map((channel) => (
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
                  ))}
                </div>
              ) : (
                <div className="text-sm text-default-400">No channel data</div>
              )}
              <ChannelSalesChart data={stats.channelBreakdown} />
            </div>

            <div className="flex flex-col gap-2 p-2 bg-default-50/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-success" />
                <span className="font-medium">Sales by Product</span>
              </div>
              <div className="flex flex-col gap-2 p-2 bg-default-50 rounded-lg">
                {stats.productBreakdown.length > 0 ? (
                  stats.productBreakdown.map((product) => (
                    <div
                      key={product.name}
                      className="flex justify-between text-sm"
                    >
                      <span>{product.name}</span>
                      <span className="font-medium">
                        {product.quantity} pcs
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-default-400">
                    No product data
                  </div>
                )}
              </div>
              <ProductSalesChart data={stats.productBreakdown} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="flex flex-col gap-2 p-2 bg-default-50/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground" />
                <span className="font-medium">Customer Analytics</span>
              </div>
              <div className="flex flex-col gap-2 p-2 bg-default-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total Unique Customers</span>
                  <span className="font-medium">{stats.uniqueCustomers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Customers (1 order)</span>
                  <span className="font-medium text-success">
                    {stats.newCustomers}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Repeat Customers (2+ orders)</span>
                  <span className="font-medium text-primary">
                    {stats.repeatCustomers}
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between text-sm">
                  <span>Repeat Rate</span>
                  <span className="font-bold text-primary">
                    {stats.repeatRate}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Orders per Customer</span>
                  <span className="font-medium">
                    {stats.uniqueCustomers > 0
                      ? (stats.totalOrders / stats.uniqueCustomers).toFixed(1)
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-2 bg-default-50/50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-foreground" />
                <span className="font-medium">Top 10 Customers by Revenue</span>
              </div>
              <TopCustomersTable data={stats.topCustomers} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="flex flex-col gap-2 p-2 bg-default-50/50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-foreground" />
                <span className="font-medium">
                  Geographic Distribution (Top Cities)
                </span>
              </div>
              <GeoDistributionChart data={stats.geoDistribution} />
            </div>

            <div className="p-2 bg-default-50/50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-danger" />
                <span className="font-medium">Top 10 Best Selling SKUs</span>
              </div>
              <Top10SKUChart data={stats.topSKUs} />
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full p-2 gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-default-600" />
            <h2 className="text-lg font-semibold">Order List</h2>
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
              title="Printer Control"
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
