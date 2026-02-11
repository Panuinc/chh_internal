import Image from "next/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";

const CONTACT_REASON_MAP = {
  Shipping: "Shipping",
  BillingChequeCollection: "Cheque Collection / Billing",
  JobApplication: "Job Application",
  ProductPresentation: "Product Presentation",
  Meeting: "Meeting",
  Other: "Other",
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="md" label="Loading..." />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-2">
        <div className="w-full max-w-md bg-background rounded-lg border-1 border-default p-2">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
              <span className="text-2xl">?</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Visitor not found
            </h2>
            <Button
              size="sm"
              radius="sm"
              className="w-full bg-foreground text-background font-medium hover:bg-default-800"
              onPress={onGoBack}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAlreadyCheckedOut = visitor.visitorStatus === "CheckOut";
  const showCheckoutTime = success || isAlreadyCheckedOut;

  return (
    <div className="flex flex-col items-center justify-center w-full p-2">
      <div className="w-full max-w-md bg-background rounded-lg border-1 border-default overflow-hidden">
        <div className="flex flex-col items-center p-2">
          <HeaderContent
            success={success}
            isAlreadyCheckedOut={isAlreadyCheckedOut}
          />
        </div>

        <div className="p-2 space-y-4">
          {visitor.visitorPhoto && (
            <div className="flex justify-center">
              <Image
                src={`/api/uploads/${visitor.visitorPhoto}`}
                alt="Visitor"
                width={96}
                height={96}
                className="rounded-full object-cover border-1 border-default"
              />
            </div>
          )}

          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              {visitor.visitorFirstName} {visitor.visitorLastName}
            </h2>
            <p className="text-[13px] text-default-400">{visitor.visitorCompany}</p>
            <Chip
              color={showCheckoutTime ? "default" : "success"}
              variant="flat"
              size="sm"
              className=""
            >
              {success ? "CheckOut" : visitor.visitorStatus}
            </Chip>
          </div>

          <div className="border-t-1 border-default" />

          <VisitorDetails
            visitor={visitor}
            showCheckoutTime={showCheckoutTime}
          />

          <div className="border-t-1 border-default" />

          {!isLoggedIn && !isAlreadyCheckedOut && !success && (
            <div className="bg-amber-50 text-amber-700 p-2 rounded-lg text-center text-xs border border-amber-200">
              You are not logged in. Pressing Checkout will redirect you to the Login page.
            </div>
          )}

          <ActionButtons
            isAlreadyCheckedOut={isAlreadyCheckedOut}
            success={success}
            checkoutLoading={checkoutLoading}
            onCheckout={onCheckout}
            onGoBack={onGoBack}
          />
        </div>
      </div>
    </div>
  );
}

function HeaderContent({ success, isAlreadyCheckedOut }) {
  if (success) {
    return (
      <>
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <span className="text-green-600 text-xl font-bold">OK</span>
        </div>
        <h1 className="text-lg font-semibold text-green-600">Checkout Successful!</h1>
      </>
    );
  }

  if (isAlreadyCheckedOut) {
    return (
      <>
        <div className="w-14 h-14 rounded-full bg-default-100 flex items-center justify-center">
          <span className="text-default-400 text-xl font-bold">--</span>
        </div>
        <h1 className="text-lg font-semibold text-default-500">
          Already Checked Out
        </h1>
      </>
    );
  }

  return (
    <>
      <div className="w-14 h-14 rounded-full bg-default-100 flex items-center justify-center">
        <span className="text-default-600 text-xl font-bold">Hi</span>
      </div>
      <h1 className="text-lg font-semibold text-foreground">Quick Checkout</h1>
    </>
  );
}

function VisitorDetails({ visitor, showCheckoutTime }) {
  return (
    <div className="bg-background rounded-lg border-1 border-default p-2 space-y-0">
      <DetailRow
        label="License Plate"
        value={`${visitor.visitorCarRegistration} (${visitor.visitorProvince})`}
      />
      <DetailRow
        label="Reason"
        value={
          CONTACT_REASON_MAP[visitor.visitorContactReason] ||
          visitor.visitorContactReason
        }
      />
      <DetailRow
        label="Contact"
        value={getContactUserName(visitor)}
      />
      <DetailRow
        label="Check In"
        value={formatDateTime(visitor.visitorCreatedAt)}
      />
      {showCheckoutTime && visitor.visitorUpdatedAt && (
        <DetailRow
          label="Check Out"
          value={formatDateTime(visitor.visitorUpdatedAt)}
        />
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-2 border-b-1 border-default last:border-b-0">
      <span className="text-[12px] text-default-400">{label}</span>
      <span className="text-[13px] font-medium text-default-700">{value}</span>
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
          size="sm"
          radius="sm"
          className="w-full bg-foreground text-background font-medium hover:bg-default-800"
          isLoading={checkoutLoading}
          onPress={onCheckout}
        >
          Checkout Visitor
        </Button>
      ) : (
        <div className="text-center text-xs text-default-500 p-2">
          Visitor has already left the premises
        </div>
      )}

      <Button
        size="sm"
        radius="sm"
        variant="flat"
        className="w-full bg-default-100 text-default-700 font-medium hover:bg-default-200"
        onPress={onGoBack}
      >
        Back to List
      </Button>
    </div>
  );
}
