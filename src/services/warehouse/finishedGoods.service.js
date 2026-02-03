import {
  bcClient,
  ENDPOINTS,
  query,
  BCNotFoundError,
  BCValidationError,
  createLogger,
  createBCController,
  parseQueryParams,
} from "@/lib/bc/server";

const ENTITY_NAME = "Category Finished Goods Item";
const ENTITY_KEY = "catFinishedGoodsItems";
const ENTITY_SINGULAR = "catFinishedGoodsItem";
const INVENTORY_POSTING_GROUP_CODE = "FG";
const NUMBER_PREFIX = "FG-";

const QUERY_SCHEMA = {
  displayName: { type: "string", required: false },
  number: { type: "string", required: false },
  description: { type: "string", required: false },
  includeZeroInventory: { type: "boolean", required: false, default: false },
  limit: {
    type: "number",
    required: false,
    default: 100,
    validate: (v) => v > 0 && v <= 1000,
    message: "limit must be between 1 and 1000",
  },
};

export function extractDimensionCodes(itemNumber) {
  if (!itemNumber || typeof itemNumber !== "string") {
    return {
      projectCode: null,
      productCode: null,
      suffix: null,
      raw: itemNumber,
    };
  }

  const pattern = /^FG-(\d{5})-([A-Z0-9]+)(?:-([A-Z]))?$/i;
  const match = itemNumber.match(pattern);

  if (match) {
    return {
      projectCode: match[1],
      productCode: match[2],
      suffix: match[3] || null,
      raw: itemNumber,
    };
  }

  const simplePattern = /^FG-(\d+)-(.+)$/i;
  const simpleMatch = itemNumber.match(simplePattern);

  if (simpleMatch) {
    return {
      projectCode: simpleMatch[1],
      productCode: simpleMatch[2],
      suffix: null,
      raw: itemNumber,
    };
  }

  return {
    projectCode: null,
    productCode: null,
    suffix: null,
    raw: itemNumber,
  };
}

export function buildDimensionFilter(
  dimensionCode,
  dimensionSetCode = "PROJECT",
) {
  if (!dimensionCode) return "";
  return `dimensionCode eq '${dimensionSetCode}' and code eq '${dimensionCode}'`;
}

export async function fetchDimensionValue(
  dimensionCode,
  dimensionSetCode = "PROJECT",
) {
  const log = createLogger("FetchDimensionValue");

  if (!dimensionCode) {
    log.error({ message: "Dimension code is required" });
    return null;
  }

  try {
    log.start({ dimensionCode, dimensionSetCode });

    const filterString = buildDimensionFilter(dimensionCode, dimensionSetCode);
    const endpoint = `${ENDPOINTS.DIMENSION_VALUES}?$filter=${encodeURIComponent(filterString)}&$select=code,displayName,dimensionCode`;

    const result = await bcClient.get(endpoint);

    if (result && Array.isArray(result) && result.length > 0) {
      log.success({ found: true, displayName: result[0].displayName });
      return result[0];
    }

    if (result && result.code) {
      log.success({ found: true, displayName: result.displayName });
      return result;
    }

    log.success({ found: false });
    return null;
  } catch (error) {
    log.error({ message: error.message, dimensionCode });
    return null;
  }
}

export async function getProjectInfoFromItemNumber(itemNumber) {
  const log = createLogger("GetProjectInfo");
  log.start({ itemNumber });

  const extracted = extractDimensionCodes(itemNumber);

  if (!extracted.projectCode) {
    log.error({ message: "Could not extract project code", itemNumber });
    return {
      itemNumber,
      projectCode: null,
      projectName: null,
      extracted,
      error: "Could not extract project code from item number",
    };
  }

  const dimensionValue = await fetchDimensionValue(
    extracted.projectCode,
    "PROJECT",
  );

  const result = {
    itemNumber,
    projectCode: extracted.projectCode,
    projectName: dimensionValue?.displayName || null,
    productCode: extracted.productCode,
    suffix: extracted.suffix,
    dimensionValue,
  };

  log.success(result);
  return result;
}

export async function batchGetProjectInfo(itemNumbers) {
  const log = createLogger("BatchGetProjectInfo");
  log.start({ count: itemNumbers?.length });

  if (!Array.isArray(itemNumbers) || itemNumbers.length === 0) {
    return new Map();
  }

  const projectCodeMap = new Map();
  for (const itemNumber of itemNumbers) {
    const extracted = extractDimensionCodes(itemNumber);
    if (extracted.projectCode) {
      if (!projectCodeMap.has(extracted.projectCode)) {
        projectCodeMap.set(extracted.projectCode, []);
      }
      projectCodeMap.get(extracted.projectCode).push({ itemNumber, extracted });
    }
  }

  const dimensionCache = new Map();
  const uniqueCodes = Array.from(projectCodeMap.keys());

  const BATCH_SIZE = 10;
  for (let i = 0; i < uniqueCodes.length; i += BATCH_SIZE) {
    const batch = uniqueCodes.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (code) => {
      const dimValue = await fetchDimensionValue(code, "PROJECT");
      return { code, dimValue };
    });

    const results = await Promise.all(promises);
    for (const { code, dimValue } of results) {
      dimensionCache.set(code, dimValue);
    }
  }

  const resultMap = new Map();
  for (const itemNumber of itemNumbers) {
    const extracted = extractDimensionCodes(itemNumber);
    const dimensionValue = extracted.projectCode
      ? dimensionCache.get(extracted.projectCode)
      : null;

    resultMap.set(itemNumber, {
      itemNumber,
      projectCode: extracted.projectCode,
      projectName: dimensionValue?.displayName || null,
      productCode: extracted.productCode,
      suffix: extracted.suffix,
      dimensionValue,
    });
  }

  log.success({
    processed: resultMap.size,
    uniqueProjects: uniqueCodes.length,
  });
  return resultMap;
}

const Repository = {
  async findMany(params) {
    const q = query()
      .filter("inventoryPostingGroupCode", "eq", INVENTORY_POSTING_GROUP_CODE)
      .filter("number", "startswith", NUMBER_PREFIX)
      .filterIf(params.number, "number", "startswith", params.number)
      .filterIf(
        params.displayName,
        "displayName",
        "contains",
        params.displayName,
      )
      .filterIf(
        params.description,
        "description",
        "contains",
        params.description,
      )
      .count(true)
      .orderBy("number", "asc");

    return bcClient.get(q.buildPath(ENDPOINTS.ITEMS));
  },

  async findById(id) {
    return bcClient.get(`${ENDPOINTS.ITEMS}(${id})`);
  },
};

const Service = {
  async getFiltered(params) {
    const items = await Repository.findMany(params);
    const filtered = Array.isArray(items)
      ? items.filter(
          (item) =>
            item.inventoryPostingGroupCode === INVENTORY_POSTING_GROUP_CODE &&
            item.number?.startsWith(NUMBER_PREFIX) &&
            (params.includeZeroInventory || item.inventory > 0),
        )
      : [];

    return { items: filtered, total: filtered.length };
  },

  async findById(id) {
    const item = await Repository.findById(id);

    if (
      !item?.id ||
      item.inventoryPostingGroupCode !== INVENTORY_POSTING_GROUP_CODE ||
      !item.number?.startsWith(NUMBER_PREFIX)
    ) {
      throw new BCNotFoundError(ENTITY_NAME, id);
    }

    return item;
  },
};

export async function GetAllUseCase(searchParams) {
  const log = createLogger("GetAllCatFinishedGoodsItems");
  const params = parseQueryParams(searchParams, QUERY_SCHEMA);

  log.start({
    ...params,
    inventoryPostingGroupCode: INVENTORY_POSTING_GROUP_CODE,
    numberPrefix: NUMBER_PREFIX,
  });

  try {
    const { items, total } = await Service.getFiltered(params);
    log.success({ total, returned: items.length });

    return {
      items,
      total,
      filters: {
        inventoryPostingGroupCode: INVENTORY_POSTING_GROUP_CODE,
        numberPrefix: NUMBER_PREFIX,
        includeZeroInventory: params.includeZeroInventory || false,
        displayName: params.displayName || null,
        number: params.number || null,
        description: params.description || null,
      },
    };
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetCatFinishedGoodsItemById");
  log.start({ id });

  try {
    if (!id) throw new BCValidationError("Item ID is required", "id");
    const item = await Service.findById(id);
    log.success({ id, number: item.number });
    return item;
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

export async function GetAllWithProjectInfoUseCase(
  searchParams,
  includeProjectInfo = true,
) {
  const log = createLogger("GetAllWithProjectInfo");
  const params = parseQueryParams(searchParams, QUERY_SCHEMA);

  log.start({ ...params, includeProjectInfo });

  try {
    const { items, total } = await Service.getFiltered(params);

    if (!includeProjectInfo) {
      return { items, total };
    }

    const itemNumbers = items.map((item) => item.number).filter(Boolean);
    const projectInfoMap = await batchGetProjectInfo(itemNumbers);

    const itemsWithProjectInfo = items.map((item) => {
      const projectInfo = projectInfoMap.get(item.number);
      return {
        ...item,
        projectCode: projectInfo?.projectCode || null,
        projectName: projectInfo?.projectName || null,
        productCode: projectInfo?.productCode || null,
      };
    });

    log.success({ total, returned: itemsWithProjectInfo.length });

    return {
      items: itemsWithProjectInfo,
      total,
      filters: {
        inventoryPostingGroupCode: INVENTORY_POSTING_GROUP_CODE,
        numberPrefix: NUMBER_PREFIX,
        includeZeroInventory: params.includeZeroInventory || false,
        displayName: params.displayName || null,
        number: params.number || null,
        description: params.description || null,
      },
    };
  } catch (error) {
    log.error({ message: error.message });
    throw error;
  }
}

export function formatData(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item.id,
    number: item.number,
    displayName: item.displayName,
    displayName2: item.displayName2 || "",
    type: item.type,
    inventoryPostingGroupCode: item.inventoryPostingGroupCode,
    unitOfMeasureCode: item.baseUnitOfMeasureCode,
    unitPrice: item.unitPrice,
    unitCost: item.unitCost,
    inventory: item.inventory,
    blocked: item.blocked,
    gtin: item.gtin,
    lastModifiedDateTime: item.lastModifiedDateTime,
    projectCode: item.projectCode || null,
    projectName: item.projectName || null,
    productCode: item.productCode || null,
  }));
}

const controller = createBCController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  formatData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllFinishedGoodsItems = controller.getAll;
export const getFinishedGoodsItemById = controller.getById;

export default {
  getAllFinishedGoodsItems,
  getFinishedGoodsItemById,
  GetAllUseCase,
  GetByIdUseCase,
  formatData,
  extractDimensionCodes,
  buildDimensionFilter,
  fetchDimensionValue,
  getProjectInfoFromItemNumber,
  batchGetProjectInfo,
  GetAllWithProjectInfoUseCase,
};
