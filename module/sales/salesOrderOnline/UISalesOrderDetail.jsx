"use client";

import React from "react";
import {
  Card,
  CardBody,
  Chip,
  Spinner,
  Button,
  Image,
  Divider,
} from "@heroui/react";
import {
  Package,
  User,
  MapPin,
  Phone,
  FileText,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const COMPANY_INFO = {
  name: "บริษัท ชื้อฮะฮวด อุตสาหกรรม จำกัด",
  phone: "02-921-9979",
};

const statusConfig = {
  Draft: { color: "default", label: "ร่าง" },
  Open: { color: "primary", label: "เปิด" },
  Released: { color: "success", label: "ปล่อยแล้ว" },
  "Pending Approval": { color: "warning", label: "รออนุมัติ" },
};

function formatCurrency(value) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === "0001-01-01") return "-";
  try {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function LoadingState() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-primary-50 to-background">
      <div className="text-center">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-foreground/60 animate-pulse">
          กำลังโหลดข้อมูล...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-b from-danger-50 to-background">
      <Card className="max-w-sm w-full shadow-lg">
        <CardBody className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-100 flex items-center justify-center">
            <FileText className="text-danger" />
          </div>
          <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-sm text-foreground/60 mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button color="primary" variant="flat" onPress={onRetry}>
                <RefreshCw className="mr-1" />
                ลองใหม่
              </Button>
            )}
            <Button
              as={Link}
              href="/sales/salesOrderOnline"
              color="default"
              variant="flat"
            >
              <ArrowLeft className="mr-1" />
              กลับหน้าหลัก
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-b from-warning-50 to-background">
      <Card className="max-w-sm w-full shadow-lg">
        <CardBody className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning-100 flex items-center justify-center">
            <Package className="text-warning" />
          </div>
          <h2 className="text-xl font-bold mb-2">ไม่พบคำสั่งซื้อ</h2>
          <p className="text-sm text-foreground/60 mb-6">
            ไม่พบข้อมูลที่ต้องการ
          </p>
          <Button
            as={Link}
            href="/sales/salesOrderOnline"
            color="primary"
            variant="flat"
          >
            <ArrowLeft className="mr-1" />
            กลับหน้าหลัก
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
          <Icon className="text-primary" />
        </div>
        <span className="font-semibold">{title}</span>
      </div>
      {action}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value || value === "-") return null;
  return (
    <div>
      <p className="text-xs text-foreground/50 uppercase tracking-wide">
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function OrderInfoCard({ order }) {
  return (
    <Card className="shadow-md">
      <CardBody className="p-4">
        <SectionHeader icon={FileText} title="ข้อมูลคำสั่งซื้อ" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="เลขที่" value={order.number} />
          <InfoRow label="วันที่สั่งซื้อ" value={formatDate(order.orderDate)} />
          <InfoRow
            label="กำหนดส่ง"
            value={formatDate(order.requestedDeliveryDate)}
          />
          {order.externalDocumentNumber && (
            <InfoRow label="เลขอ้างอิง" value={order.externalDocumentNumber} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function CustomerInfoCard({ order }) {
  return (
    <Card className="shadow-md">
      <CardBody className="p-4">
        <SectionHeader icon={User} title="ข้อมูลลูกค้า" />
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-lg">{order.customerName}</p>
            <p className="text-sm text-foreground/60">{order.customerNumber}</p>
          </div>
          {order.phoneNumber && (
            <a
              href={`tel:${order.phoneNumber}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Phone />
              <span>{order.phoneNumber}</span>
            </a>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function ShippingAddressCard({ order }) {
  return (
    <Card className="shadow-md">
      <CardBody className="p-4">
        <SectionHeader icon={MapPin} title="ที่อยู่จัดส่ง" />
        <div className="space-y-1">
          <p className="font-semibold">{order.shipToName}</p>
          {order.shipToAddressLine1 && (
            <p className="text-sm text-foreground/70">
              {order.shipToAddressLine1}
            </p>
          )}
          {order.shipToAddressLine2 && (
            <p className="text-sm text-foreground/70">
              {order.shipToAddressLine2}
            </p>
          )}
          {(order.shipToCity || order.shipToPostCode) && (
            <p className="text-sm text-foreground/70">
              {order.shipToCity} {order.shipToPostCode}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function OrderLinesCard({ order }) {
  const itemLines = (order.salesOrderLines || []).filter(
    (l) => l.lineType === "Item",
  );
  const commentLines = (order.salesOrderLines || []).filter(
    (l) => l.lineType === "Comment",
  );

  return (
    <Card className="shadow-md">
      <CardBody className="p-4">
        <SectionHeader
          icon={Package}
          title="รายการสินค้า"
          action={
            <Chip size="sm" variant="flat" color="primary">
              {itemLines.length} รายการ
            </Chip>
          }
        />

        {itemLines.length === 0 ? (
          <p className="text-center text-foreground/50 py-4">
            ไม่มีรายการสินค้า
          </p>
        ) : (
          <div className="space-y-3">
            {itemLines.map((line, index) => (
              <div
                key={line.id || index}
                className="flex gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-foreground/50">
                    {line.itemNumber || line.lineObjectNumber}
                  </p>
                  <p className="font-medium text-sm">{line.description}</p>
                  {line.description2 && (
                    <p className="text-xs text-foreground/60">
                      {line.description2}
                    </p>
                  )}
                  <div className="flex gap-4 mt-1 text-xs text-foreground/60">
                    <span className="font-medium">
                      {line.quantity} {line.unitOfMeasureCode}
                    </span>
                    <span>@ {formatCurrency(line.unitPrice)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary">
                    {formatCurrency(line.amountIncludingTax)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {commentLines.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-warning-50">
            <p className="text-xs font-semibold text-warning-800 mb-1">
              หมายเหตุ:
            </p>
            {commentLines.map((line, i) => (
              <p key={i} className="text-sm text-warning-700">
                {line.description} {line.description2}
              </p>
            ))}
          </div>
        )}

        <Divider className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">ยอดรวมก่อนภาษี</span>
            <span>{formatCurrency(order.totalAmountExcludingTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">ภาษีมูลค่าเพิ่ม (VAT)</span>
            <span>{formatCurrency(order.totalTaxAmount)}</span>
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">ยอดรวมทั้งสิ้น</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(order.totalAmountIncludingTax)}
              <span className="text-sm ml-1 text-foreground/60">
                {order.currencyCode}
              </span>
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function WarningCard() {
  return (
    <Card className="bg-gradient-to-r from-warning-100 to-warning-50 border-l-4 border-warning shadow-md">
      <CardBody className="p-4">
        <p className="font-bold text-warning-800 flex items-center gap-2">
          <span className="text-xl">❗</span>
          กรุณาถ่ายวิดีโอขณะแกะพัสดุ
        </p>
        <p className="text-sm text-warning-700 mt-1 ml-7">
          เพื่อใช้เป็นหลักฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี
        </p>
      </CardBody>
    </Card>
  );
}

function CompanyFooter() {
  return (
    <div className="text-center py-4 space-y-1">
      <p className="text-sm font-medium text-foreground/70">
        {COMPANY_INFO.name}
      </p>
      <p className="text-xs text-foreground/50">โทร: {COMPANY_INFO.phone}</p>
    </div>
  );
}

export default function UISalesOrderDetail({
  order,
  loading,
  error,
  onRefresh,
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRefresh} />;
  if (!order) return <NotFoundState />;

  const status = statusConfig[order.status] || {
    color: "default",
    label: order.status,
  };

  return (
    <div className="bg-gradient-to-b from-primary-50/50 to-background h-full overflow-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            as={Link}
            href="/sales/salesOrderOnline"
            variant="light"
            isIconOnly
            size="sm"
            radius="full"
          >
            <ArrowLeft />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{order.number}</h1>
            <p className="text-xs text-foreground/50">รายละเอียดคำสั่งซื้อ</p>
          </div>
          <Chip color={status.color} variant="flat" size="sm">
            {status.label}
          </Chip>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo/logo-09.png"
            alt="Logo"
            width={120}
            height={60}
            className="object-contain"
          />
        </div>

        <OrderInfoCard order={order} />
        <CustomerInfoCard order={order} />
        <ShippingAddressCard order={order} />
        <OrderLinesCard order={order} />
        <WarningCard />
        <CompanyFooter />
      </div>
    </div>
  );
}
