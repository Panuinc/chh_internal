import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";

const CONTACT_REASON_MAP = {
  Shipping: "📦 การจัดส่ง",
  BillingChequeCollection: "💰 รับเช็ค/วางบิล",
  JobApplication: "📝 สมัครงาน",
  ProductPresentation: "📊 นำเสนอสินค้า",
  Meeting: "🤝 ประชุม",
  Other: "📋 อื่นๆ",
};

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

function getContactUserName(visitor) {
  return visitor?.contactUser
    ? `${visitor.contactUser.employeeFirstName} ${visitor.contactUser.employeeLastName}`
    : "-";
}

export default function UIQuickCheckout({
  visitor,
  loading,
  checkoutLoading,
  success,
  isLoggedIn,
  onCheckout,
  onGoBack,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-2">
        <Spinner size="lg" label="กำลังโหลด..." />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-2">
        <Card className="w-full p-2 gap-2">
          <CardBody className="text-center py-8 gap-2">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-danger mb-2">
              ไม่พบข้อมูลผู้เยี่ยม
            </h2>
            <Button
              color="danger"
              variant="solid"
              size="lg"
              radius="sm"
              className="w-full text-background"
              onPress={onGoBack}
            >
              กลับหน้าหลัก
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isAlreadyCheckedOut = visitor.visitorStatus === "CheckOut";
  const showCheckoutTime = success || isAlreadyCheckedOut;

  return (
    <div className="flex flex-col items-center justify-center w-full p-2 gap-2">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="flex flex-col items-center pb-0 pt-6">
          <HeaderContent
            success={success}
            isAlreadyCheckedOut={isAlreadyCheckedOut}
          />
        </CardHeader>

        <CardBody className="px-6 py-4">
          {visitor.visitorPhoto && (
            <div className="flex justify-center mb-4">
              <img
                src={`/api/uploads/${visitor.visitorPhoto}`}
                alt="Visitor"
                className="w-24 h-24 rounded-full object-cover shadow-md"
              />
            </div>
          )}

          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">
              {visitor.visitorFirstName} {visitor.visitorLastName}
            </h2>
            <p className="text-default-600">{visitor.visitorCompany}</p>
            <Chip
              color={showCheckoutTime ? "default" : "success"}
              variant="flat"
              className="mt-2"
            >
              {success ? "CheckOut" : visitor.visitorStatus}
            </Chip>
          </div>

          <Divider className="my-4" />

          <VisitorDetails
            visitor={visitor}
            showCheckoutTime={showCheckoutTime}
          />

          <Divider className="my-4" />

          {!isLoggedIn && !isAlreadyCheckedOut && !success && (
            <div className="bg-warning-50 text-warning-700 p-2 rounded-lg mb-4 text-center text-sm">
              ⚠️ คุณยังไม่ได้เข้าสู่ระบบ กดปุ่ม Checkout จะพาไปหน้า Login
            </div>
          )}

          <ActionButtons
            isAlreadyCheckedOut={isAlreadyCheckedOut}
            success={success}
            checkoutLoading={checkoutLoading}
            onCheckout={onCheckout}
            onGoBack={onGoBack}
          />
        </CardBody>
      </Card>
    </div>
  );
}

function HeaderContent({ success, isAlreadyCheckedOut }) {
  if (success) {
    return (
      <>
        <div className="text-6xl mb-2">✅</div>
        <h1 className="text-2xl font-bold text-success">Checkout สำเร็จ!</h1>
      </>
    );
  }

  if (isAlreadyCheckedOut) {
    return (
      <>
        <div className="text-6xl mb-2">⚪</div>
        <h1 className="text-2xl font-bold text-default-500">
          Checked Out แล้ว
        </h1>
      </>
    );
  }

  return (
    <>
      <div className="text-6xl mb-2">👋</div>
      <h1 className="text-2xl font-bold">Quick Checkout</h1>
    </>
  );
}

function VisitorDetails({ visitor, showCheckoutTime }) {
  return (
    <div className="space-y-3">
      <DetailRow
        icon="🚗"
        label="ทะเบียนรถ"
        value={`${visitor.visitorCarRegistration} (${visitor.visitorProvince})`}
      />
      <DetailRow
        icon="📌"
        label="เหตุผล"
        value={
          CONTACT_REASON_MAP[visitor.visitorContactReason] ||
          visitor.visitorContactReason
        }
      />
      <DetailRow
        icon="👤"
        label="ติดต่อ"
        value={getContactUserName(visitor)}
        valueClassName="text-success"
      />
      <DetailRow
        icon="🕐"
        label="เข้า"
        value={formatDateTime(visitor.visitorCreatedAt)}
      />
      {showCheckoutTime && visitor.visitorUpdatedAt && (
        <DetailRow
          icon="🕐"
          label="ออก"
          value={formatDateTime(visitor.visitorUpdatedAt)}
        />
      )}
    </div>
  );
}

function DetailRow({ icon, label, value, valueClassName = "" }) {
  return (
    <div className="flex justify-between">
      <span className="text-default-500">
        {icon} {label}
      </span>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

function ActionButtons({
  isAlreadyCheckedOut,
  success,
  checkoutLoading,
  onCheckout,
  onGoBack,
}) {
  return (
    <div className="flex flex-col gap-2">
      {!isAlreadyCheckedOut && !success ? (
        <Button
          color="warning"
          size="lg"
          className="w-full font-bold"
          isLoading={checkoutLoading}
          onPress={onCheckout}
        >
          ✅ Checkout ผู้เยี่ยม
        </Button>
      ) : (
        <div className="text-center text-default-500 py-2">
          ผู้เยี่ยมได้ออกจากพื้นที่แล้ว
        </div>
      )}

      <Button
        color="default"
        variant="flat"
        size="md"
        className="w-full"
        onPress={onGoBack}
      >
        กลับหน้ารายการ
      </Button>
    </div>
  );
}
