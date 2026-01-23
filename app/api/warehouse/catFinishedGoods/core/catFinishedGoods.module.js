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

export function formatData(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item.id,
    number: item.number,
    displayName: item.displayName,
    displayName2: item.displayName2 || "",
    type: item.type,
    itemCategoryCode: item.itemCategoryCode,
    inventoryPostingGroupCode: item.inventoryPostingGroupCode,
    unitOfMeasureCode: item.baseUnitOfMeasureCode,
    unitPrice: item.unitPrice,
    unitCost: item.unitCost,
    inventory: item.inventory,
    blocked: item.blocked,
    gtin: item.gtin,
    lastModifiedDateTime: item.lastModifiedDateTime,
  }));
}

const controller = createBCController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  formatData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllCatFinishedGoodsItems = controller.getAll;
export const getCatFinishedGoodsItemById = controller.getById;

export default {
  getAllCatFinishedGoodsItems,
  getCatFinishedGoodsItemById,
  GetAllUseCase,
  GetByIdUseCase,
  formatData,
};
