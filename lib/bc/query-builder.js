export function sanitizeODataValue(value) {
  if (typeof value !== "string") return value;
  return value.replace(/'/g, "''");
}

export class ODataQueryBuilder {
  constructor() {
    this.filters = [];
    this.expands = [];
    this.selects = [];
    this.orderBys = [];
    this.topValue = null;
    this.skipValue = null;
    this.countValue = false;
  }

  filter(fieldOrExpression, operator, value) {
    if (operator === undefined && value === undefined) {
      this.filters.push(fieldOrExpression);
    } else {
      const sanitizedValue = sanitizeODataValue(value);
      const quotedValue =
        typeof value === "string" ? `'${sanitizedValue}'` : sanitizedValue;

      switch (operator.toLowerCase()) {
        case "contains":
          this.filters.push(`contains(${fieldOrExpression},${quotedValue})`);
          break;
        case "startswith":
          this.filters.push(`startswith(${fieldOrExpression},${quotedValue})`);
          break;
        case "endswith":
          this.filters.push(`endswith(${fieldOrExpression},${quotedValue})`);
          break;
        default:
          this.filters.push(`${fieldOrExpression} ${operator} ${quotedValue}`);
      }
    }
    return this;
  }

  filterIf(condition, fieldOrExpression, operator, value) {
    if (condition) this.filter(fieldOrExpression, operator, value);
    return this;
  }

  expand(...entities) {
    this.expands.push(...entities);
    return this;
  }

  select(...fields) {
    this.selects.push(...fields.flat());
    return this;
  }

  orderBy(field, direction = "asc") {
    this.orderBys.push(`${field} ${direction}`);
    return this;
  }

  top(count) {
    this.topValue = count;
    return this;
  }

  skip(count) {
    this.skipValue = count;
    return this;
  }

  count(include = true) {
    this.countValue = include;
    return this;
  }

  build() {
    const parts = [];

    if (this.filters.length > 0) {
      parts.push(`$filter=${this.filters.join(" and ")}`);
    }
    if (this.expands.length > 0) {
      parts.push(`$expand=${this.expands.join(",")}`);
    }
    if (this.selects.length > 0) {
      parts.push(`$select=${this.selects.join(",")}`);
    }
    if (this.orderBys.length > 0) {
      parts.push(`$orderby=${this.orderBys.join(",")}`);
    }
    if (this.topValue !== null) {
      parts.push(`$top=${this.topValue}`);
    }
    if (this.skipValue !== null) {
      parts.push(`$skip=${this.skipValue}`);
    }
    if (this.countValue) {
      parts.push("$count=true");
    }

    return parts.length > 0 ? `?${parts.join("&")}` : "";
  }

  buildPath(endpoint) {
    return `${endpoint}${this.build()}`;
  }
}

export function query() {
  return new ODataQueryBuilder();
}
