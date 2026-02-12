import {
  bcClient,
  BCNotFoundError,
  BCValidationError,
  createBCController,
  parseQueryParams,
} from "@/lib/bc/server";
import { createLogger } from "@/lib/logger.node";

const ENTITY_NAME = "Sales Order Online";
const ENTITY_KEY = "salesOrders";
const ENTITY_SINGULAR = "salesOrder";

const SALES_ORDER_ENDPOINT = "/ODataV4/SalesOrder";
const SALES_LINES_ENDPOINT = "/ODataV4/SalesLines";

const STANDARD_API_ENDPOINT = "/salesOrders";

const VAT_RATE = 0.07;

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

function buildSalesOrderFilter(params) {
  const filters = ["Salesperson_Code eq 'ONLINE'"];

  if (params.number) {
    filters.push(`startswith(No,'${params.number}')`);
  }
  if (params.customerNumber) {
    filters.push(`Sell_to_Customer_No eq '${params.customerNumber}'`);
  }
  if (params.customerName) {
    filters.push(`contains(Sell_to_Customer_Name,'${params.customerName}')`);
  }
  if (params.status) {
    filters.push(`Status eq '${params.status}'`);
  }
  if (params.orderDateFrom) {
    filters.push(`Order_Date ge ${params.orderDateFrom}`);
  }
  if (params.orderDateTo) {
    filters.push(`Order_Date le ${params.orderDateTo}`);
  }

  return filters.join(" and ");
}

async function fetchSalesOrders(params) {
  const filter = buildSalesOrderFilter(params);
  const top = params.limit || 100;

  const queryParts = [];
  queryParts.push(`$filter=${filter}`);
  queryParts.push(`$top=${top}`);
  queryParts.push(`$orderby=No desc`);

  const url = `${SALES_ORDER_ENDPOINT}?${queryParts.join("&")}`;

  const result = await bcClient.get(url);
  return Array.isArray(result) ? result : result?.value || [];
}

async function fetchOrderTotals(params) {
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

  const queryParts = [];
  queryParts.push(
    "$select=number,totalAmountExcludingTax,totalTaxAmount,totalAmountIncludingTax",
  );
  queryParts.push(`$filter=${filters.join(" and ")}`);
  queryParts.push(`$top=${params.limit || 100}`);
  queryParts.push("$orderby=number desc");

  const url = `${STANDARD_API_ENDPOINT}?${queryParts.join("&")}`;

  try {
    const result = await bcClient.get(url);
    const items = Array.isArray(result) ? result : result?.value || [];

    const totalsMap = {};
    for (const item of items) {
      totalsMap[item.number] = {
        totalAmountExcludingTax: item.totalAmountExcludingTax,
        totalTaxAmount: item.totalTaxAmount,
        totalAmountIncludingTax: item.totalAmountIncludingTax,
      };
    }

    return totalsMap;
  } catch (error) {
    return {};
  }
}

async function fetchSalesLines(orderNumbers) {
  if (!orderNumbers || orderNumbers.length === 0) {
    return [];
  }

  const documentNoFilter = orderNumbers
    .map((no) => `Document_No eq '${no}'`)
    .join(" or ");

  const queryParts = [];
  queryParts.push(`$filter=Document_Type eq 'Order' and (${documentNoFilter})`);
  queryParts.push(`$top=5000`);

  const url = `${SALES_LINES_ENDPOINT}?${queryParts.join("&")}`;

  const result = await bcClient.get(url);
  return Array.isArray(result) ? result : result?.value || [];
}

function mapOrdersWithLines(orders, allLines, totalsMap = {}) {
  const linesByDocumentNo = allLines.reduce((acc, line) => {
    const docNo = line.Document_No;
    if (!acc[docNo]) {
      acc[docNo] = [];
    }
    acc[docNo].push(line);
    return acc;
  }, {});

  return orders.map((order) => ({
    ...order,
    salesOrderLines: linesByDocumentNo[order.No] || [],
    _bcTotals: totalsMap[order.No] || null,
  }));
}

const Repository = {
  async findMany(params) {
    const [orders, totalsMap] = await Promise.all([
      fetchSalesOrders(params),
      fetchOrderTotals(params),
    ]);

    if (orders.length === 0) {
      return { value: [], count: 0 };
    }

    const orderNumbers = orders.map((o) => o.No);
    const lines = await fetchSalesLines(orderNumbers);

    const ordersWithLines = mapOrdersWithLines(orders, lines, totalsMap);

    return {
      value: ordersWithLines,
      count: ordersWithLines.length,
    };
  },

  async findById(id) {
    const orderPromise = (async () => {
      const url = `${SALES_ORDER_ENDPOINT}?$filter=No eq '${id}'`;
      const result = await bcClient.get(url);
      const orders = Array.isArray(result) ? result : result?.value || [];
      if (orders.length === 0) {
        throw new BCNotFoundError(ENTITY_NAME, id);
      }
      return orders[0];
    })();

    const totalsPromise = (async () => {
      try {
        const url = `${STANDARD_API_ENDPOINT}?$filter=number eq '${id}'&$select=number,totalAmountExcludingTax,totalTaxAmount,totalAmountIncludingTax`;
        const result = await bcClient.get(url);
        const items = Array.isArray(result) ? result : result?.value || [];
        return items[0] || null;
      } catch {
        return null;
      }
    })();

    const linesPromise = (async () => {
      const url = `${SALES_LINES_ENDPOINT}?$filter=Document_Type eq 'Order' and Document_No eq '${id}'`;
      const result = await bcClient.get(url);
      return Array.isArray(result) ? result : result?.value || [];
    })();

    const [order, bcTotals, lines] = await Promise.all([
      orderPromise,
      totalsPromise,
      linesPromise,
    ]);

    return {
      ...order,
      salesOrderLines: lines,
      _bcTotals: bcTotals,
    };
  },
};

const Service = {
  async getFiltered(params) {
    const result = await Repository.findMany(params);
    const items = result?.value || [];

    return {
      items,
      total: result?.count || items.length,
    };
  },

  async findById(id) {
    const order = await Repository.findById(id);

    if (!order?.No) {
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
    log.success({ id, number: order.No });
    return order;
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

function calculateOrderTotals(order, lines) {
  const pricesIncludingVAT = order.Prices_Including_VAT;

  if (!Array.isArray(lines) || lines.length === 0) {
    return {
      totalAmountExcludingTax: 0,
      totalTaxAmount: 0,
      totalAmountIncludingTax: 0,
      totalQuantity: 0,
    };
  }

  const validLines = lines.filter((line) => (line.Line_Amount || 0) > 0);

  let totalAmountExcludingTax = 0;
  let totalAmountIncludingTax = 0;

  for (const line of validLines) {
    const lineAmount = line.Line_Amount || 0;

    if (pricesIncludingVAT) {
      totalAmountIncludingTax += lineAmount;
      totalAmountExcludingTax += lineAmount / (1 + VAT_RATE);
    } else {
      totalAmountExcludingTax += lineAmount;
      totalAmountIncludingTax += lineAmount * (1 + VAT_RATE);
    }
  }

  totalAmountExcludingTax = Math.round(totalAmountExcludingTax * 100) / 100;
  totalAmountIncludingTax = Math.round(totalAmountIncludingTax * 100) / 100;
  const totalTaxAmount =
    Math.round((totalAmountIncludingTax - totalAmountExcludingTax) * 100) / 100;

  const totalQuantity = validLines.reduce(
    (sum, line) => sum + (line.Quantity || 0),
    0,
  );

  return {
    totalAmountExcludingTax,
    totalTaxAmount,
    totalAmountIncludingTax,
    totalQuantity,
  };
}

function calculateLineAmounts(line, pricesIncludingVAT) {
  const lineAmount = line.Line_Amount || 0;
  const quantity = line.Quantity || 0;

  let amountExcludingTax;
  let amountIncludingTax;

  if (pricesIncludingVAT) {
    amountIncludingTax = lineAmount;
    amountExcludingTax = Math.round((lineAmount / (1 + VAT_RATE)) * 100) / 100;
  } else {
    amountExcludingTax = lineAmount;
    amountIncludingTax = Math.round(lineAmount * (1 + VAT_RATE) * 100) / 100;
  }

  const taxAmount =
    Math.round((amountIncludingTax - amountExcludingTax) * 100) / 100;
  const unitPrice =
    quantity > 0 ? Math.round((amountExcludingTax / quantity) * 100) / 100 : 0;

  return {
    unitPrice,
    amountExcludingTax,
    taxAmount,
    amountIncludingTax,
  };
}

export function formatData(orders) {
  if (!Array.isArray(orders)) return [];

  return orders.map((order) => {
    const pricesIncludingVAT = order.Prices_Including_VAT;
    const formattedLines = formatLines(
      order.salesOrderLines,
      pricesIncludingVAT,
    );

    const itemLines = formattedLines.filter((l) => l.lineType === "Item");

    const bcTotals = order._bcTotals;
    let totals;

    if (bcTotals) {
      totals = {
        totalAmountExcludingTax: bcTotals.totalAmountExcludingTax,
        totalTaxAmount: bcTotals.totalTaxAmount,
        totalAmountIncludingTax: bcTotals.totalAmountIncludingTax,
      };
    } else {
      totals = calculateOrderTotals(order, order.salesOrderLines);
    }

    return {
      id: order.No,
      number: order.No,

      externalDocumentNumber: order.External_Document_No || "",
      quoteNumber: order.Quote_No || "",

      orderDate: order.Order_Date,
      documentDate: order.Document_Date,
      postingDate: order.Posting_Date,
      requestedDeliveryDate: order.Requested_Delivery_Date,
      promisedDeliveryDate: order.Promised_Delivery_Date,
      shipmentDate: order.Shipment_Date,

      customerId: order.Sell_to_Customer_No,
      customerNumber: order.Sell_to_Customer_No,
      customerName: order.Sell_to_Customer_Name,
      billToName: order.Bill_to_Name,
      billToAddress: order.Bill_to_Address,

      shipToName: order.Ship_to_Name,
      shipToAddressLine1: order.Ship_to_Address,
      shipToAddressLine2: order.Ship_to_Address_2,
      shipToCity: order.Ship_to_City,
      shipToPostCode: order.Ship_to_Post_Code,
      shipToCountry: order.Ship_to_Country_Region_Code,

      phoneNumber: order.Ship_to_Phone_No || order.Sell_to_Phone_No || "",
      email: order.Sell_to_E_Mail || "",
      contact: order.Sell_to_Contact,

      salesperson: order.Salesperson_Code,
      status: order.Status,
      fullyShipped: order.Completely_Shipped,

      locationCode: order.Location_Code,
      shippingAgentCode: order.Shipping_Agent_Code,

      currencyCode: order.Currency_Code || "",
      pricesIncludingVAT,
      totalAmountExcludingTax: totals.totalAmountExcludingTax,
      totalTaxAmount: totals.totalTaxAmount,
      totalAmountIncludingTax: totals.totalAmountIncludingTax,

      salesOrderLines: formattedLines,
      lineCount: itemLines.length,
      totalQuantity: itemLines.reduce((sum, l) => sum + (l.quantity || 0), 0),
    };
  });
}

export function formatLines(lines, pricesIncludingVAT = true) {
  if (!Array.isArray(lines)) return [];

  return lines.map((line, index) => {
    const amounts = calculateLineAmounts(line, pricesIncludingVAT);

    return {
      id: `${line.Document_No}-${line.Line_No}`,
      documentId: line.Document_No,
      sequence: line.Line_No,
      lineNumber: index + 1,
      lineType:
        line.Type === "Item"
          ? "Item"
          : line.Type?.trim() === ""
            ? "Comment"
            : line.Type || "",
      itemId: line.No,
      itemNumber: line.No,
      lineObjectNumber: line.No,
      description: line.Description,
      description2: line.Description_2 || "",
      unitOfMeasureCode: line.Unit_of_Measure_Code,
      quantity: line.Quantity,
      unitPrice: amounts.unitPrice,
      discountPercent: line.Line_Discount_Percent || 0,
      discountAmount: line.Line_Discount_Amount || 0,
      amountExcludingTax: amounts.amountExcludingTax,
      taxPercent: VAT_RATE * 100,
      totalTaxAmount: amounts.taxAmount,
      amountIncludingTax: amounts.amountIncludingTax,
      netAmount: amounts.amountExcludingTax,
      shipmentDate: line.Shipment_Date,
      shippedQuantity: 0,
      invoicedQuantity: 0,
      outstandingQuantity: line.Outstanding_Quantity || 0,
      locationId: line.Location_Code,
    };
  });
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

const salesOrderOnlineService = {
  getAllSalesOrdersOnline,
  getSalesOrderOnlineById,
  GetAllUseCase,
  GetByIdUseCase,
  formatData,
  formatLines,
};

export default salesOrderOnlineService;
