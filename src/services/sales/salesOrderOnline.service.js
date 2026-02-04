import {
  bcClient,
  BCNotFoundError,
  BCValidationError,
  createBCController,
  parseQueryParams,
} from "@/lib/bc/server";
import { createLogger } from "@/lib/shared/logger";

const ENTITY_NAME = "Sales Order Online";
const ENTITY_KEY = "salesOrders";
const ENTITY_SINGULAR = "salesOrder";
const SALES_ORDERS_ENDPOINT = "salesOrders";

const QUERY_SCHEMA = {
  number: { type: "string", required: false },
  customerNumber: { type: "string", required: false },
  customerName: { type: "string", required: false },
  status: { type: "string", required: false },
  orderDateFrom: { type: "string", required: false },
  orderDateTo: { type: "string", required: false },
  limit: {
    type: "number",
    required: false,
    default: 100,
    validate: (v) => v > 0 && v <= 1000,
    message: "limit must be between 1 and 1000",
  },
};

const Repository = {
  async findMany(params) {
    const queryParts = [];

    queryParts.push("$expand=salesOrderLines");

    const filters = ["salesperson eq 'ONLINE'"];
    if (params.number) filters.push(`startswith(number,'${params.number}')`);
    if (params.customerNumber)
      filters.push(`customerNumber eq '${params.customerNumber}'`);
    if (params.customerName)
      filters.push(`contains(customerName,'${params.customerName}')`);
    if (params.status) filters.push(`status eq '${params.status}'`);
    if (params.orderDateFrom)
      filters.push(`orderDate ge ${params.orderDateFrom}`);
    if (params.orderDateTo) filters.push(`orderDate le ${params.orderDateTo}`);

    if (filters.length > 0) {
      queryParts.push(`$filter=${filters.join(" and ")}`);
    }

    queryParts.push(`$top=${params.limit || 100}`);

    queryParts.push("$orderby=number desc");

    const queryString = queryParts.join("&");
    const url = `/${SALES_ORDERS_ENDPOINT}?${queryString}`;

    console.log("[SalesOrderOnline] Requesting:", url);

    return bcClient.get(url);
  },

  async findById(id) {
    return bcClient.get(
      `/${SALES_ORDERS_ENDPOINT}(${id})?$expand=salesOrderLines`,
    );
  },
};

const Service = {
  async getFiltered(params) {
    const result = await Repository.findMany(params);
    const items = Array.isArray(result) ? result : result?.value || [];

    return {
      items,
      total: result?.["@odata.count"] || items.length,
    };
  },

  async findById(id) {
    const order = await Repository.findById(id);

    if (!order?.id) {
      throw new BCNotFoundError(ENTITY_NAME, id);
    }

    return order;
  },
};

export async function GetAllUseCase(searchParams) {
  const log = createLogger("GetAllSalesOrdersOnline");
  const params = parseQueryParams(searchParams, QUERY_SCHEMA);

  log.start({ ...params, salesperson: "ONLINE" });

  try {
    const { items, total } = await Service.getFiltered(params);
    log.success({ total, returned: items.length });

    return {
      items,
      total,
      filters: {
        salesperson: "ONLINE",
        number: params.number || null,
        customerNumber: params.customerNumber || null,
        customerName: params.customerName || null,
        status: params.status || null,
        orderDateFrom: params.orderDateFrom || null,
        orderDateTo: params.orderDateTo || null,
      },
    };
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetSalesOrderOnlineById");
  log.start({ id });

  try {
    if (!id) throw new BCValidationError("Sales Order ID is required", "id");
    const order = await Service.findById(id);
    log.success({ id, number: order.number });
    return order;
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

export function formatData(orders) {
  if (!Array.isArray(orders)) return [];

  return orders.map((order) => ({
    id: order.id,
    number: order.number,
    externalDocumentNumber: order.externalDocumentNumber || "",
    orderDate: order.orderDate,
    postingDate: order.postingDate,
    requestedDeliveryDate: order.requestedDeliveryDate,
    customerId: order.customerId,
    customerNumber: order.customerNumber,
    customerName: order.customerName,
    billToName: order.billToName,
    shipToName: order.shipToName,
    shipToAddressLine1: order.shipToAddressLine1 || "",
    shipToAddressLine2: order.shipToAddressLine2 || "",
    shipToCity: order.shipToCity || "",
    shipToPostCode: order.shipToPostCode || "",
    currencyCode: order.currencyCode,
    salesperson: order.salesperson,
    status: order.status,
    fullyShipped: order.fullyShipped,
    totalAmountExcludingTax: order.totalAmountExcludingTax,
    totalTaxAmount: order.totalTaxAmount,
    totalAmountIncludingTax: order.totalAmountIncludingTax,
    phoneNumber: order.phoneNumber || "",
    email: order.email || "",
    lastModifiedDateTime: order.lastModifiedDateTime,
    salesOrderLines: formatLines(order.salesOrderLines),
    lineCount:
      order.salesOrderLines?.filter((l) => l.lineType === "Item").length || 0,
    totalQuantity:
      order.salesOrderLines
        ?.filter((l) => l.lineType === "Item")
        .reduce((sum, l) => sum + (l.quantity || 0), 0) || 0,
  }));
}

export function formatLines(lines) {
  if (!Array.isArray(lines)) return [];

  return lines.map((line, index) => ({
    id: line.id,
    documentId: line.documentId,
    sequence: line.sequence,
    lineNumber: index + 1,
    lineType: line.lineType,
    itemId: line.itemId,
    itemNumber: line.lineObjectNumber,
    description: line.description,
    description2: line.description2 || "",
    unitOfMeasureCode: line.unitOfMeasureCode,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    discountPercent: line.discountPercent,
    discountAmount: line.discountAmount,
    amountExcludingTax: line.amountExcludingTax,
    taxCode: line.taxCode,
    taxPercent: line.taxPercent,
    totalTaxAmount: line.totalTaxAmount,
    amountIncludingTax: line.amountIncludingTax,
    netAmount: line.netAmount,
    shipmentDate: line.shipmentDate,
    shippedQuantity: line.shippedQuantity,
    invoicedQuantity: line.invoicedQuantity,
    locationId: line.locationId,
  }));
}

const controller = createBCController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  formatData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllSalesOrdersOnline = controller.getAll;
export const getSalesOrderOnlineById = controller.getById;

export default {
  getAllSalesOrdersOnline,
  getSalesOrderOnlineById,
  GetAllUseCase,
  GetByIdUseCase,
  formatData,
  formatLines,
};
