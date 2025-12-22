import {
  bcClient,
  ENDPOINTS,
  query,
  sanitizeODataValue,
  BCNotFoundError,
  BCValidationError,
  createLogger,
  createBCController,
  parseQueryParams,
} from "@/lib/bc/server";

const ENTITY_NAME = "Sales Invoice";
const ENTITY_KEY = "salesInvoices";
const ENTITY_SINGULAR = "salesInvoice";

const QUERY_SCHEMA = {
  displayName: { type: "string", required: false },
  numberPrefix: { type: "string", required: false, default: "IV25" },
  includeLines: { type: "boolean", required: false, default: true },
  limit: {
    type: "number",
    required: false,
    default: 10,
    validate: (v) => v > 0 && v <= 1000,
    message: "limit must be between 1 and 1000",
  },
};

export const SalesInvoiceRepository = {
  async findMany(params) {
    const q = query()
      .filterIf(
        params.numberPrefix,
        "number",
        "startswith",
        params.numberPrefix
      )
      .filterIf(
        params.displayName,
        "displayName",
        "contains",
        params.displayName
      )
      .top(params.limit)
      .orderBy("postingDate", "desc");

    if (params.includeLines) {
      q.expand("salesInvoiceLines");
    }

    const url = q.buildPath(ENDPOINTS.SALES_INVOICES);
    return bcClient.get(url);
  },

  async findById(id, includeLines = true) {
    const expand = includeLines ? "?$expand=salesInvoiceLines" : "";
    return bcClient.get(`${ENDPOINTS.SALES_INVOICES}(${id})${expand}`);
  },
};

export const SalesInvoiceService = {
  async getFiltered(params) {
    const items = await SalesInvoiceRepository.findMany(params);
    return {
      items: Array.isArray(items) ? items : [],
      total: Array.isArray(items) ? items.length : 0,
    };
  },

  async findById(id) {
    const item = await SalesInvoiceRepository.findById(id);
    if (!item || !item.id) {
      throw new BCNotFoundError(ENTITY_NAME, id);
    }
    return item;
  },
};

export async function GetAllUseCase(searchParams) {
  const log = createLogger("GetAllSalesInvoicesUseCase");
  const params = parseQueryParams(searchParams, QUERY_SCHEMA);

  log.start(params);

  try {
    const { items, total } = await SalesInvoiceService.getFiltered(params);

    log.success({ total, returned: items.length });

    return {
      items,
      total,
      filters: {
        displayName: params.displayName || null,
        numberPrefix: params.numberPrefix,
      },
    };
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetSalesInvoiceByIdUseCase");
  log.start({ id });

  try {
    if (!id) {
      throw new BCValidationError("Invoice ID is required", "id");
    }

    const item = await SalesInvoiceService.findById(id);

    log.success({ id, number: item.number });
    return item;
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

export function formatSalesInvoiceData(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
  }));
}

const baseController = createBCController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  formatData: formatSalesInvoiceData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllSalesInvoices = baseController.getAll;
export const getSalesInvoiceById = baseController.getById;
