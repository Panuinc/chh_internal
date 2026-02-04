

function generateUUID() {

  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const asyncLocalStorage =
  typeof globalThis !== "undefined" && globalThis.AsyncLocalStorage
    ? new globalThis.AsyncLocalStorage()
    : null;

export function generateRequestId() {
  return generateUUID();
}

export function getRequestId() {
  if (!asyncLocalStorage) return null;
  try {
    const store = asyncLocalStorage.getStore();
    return store?.requestId || null;
  } catch {
    return null;
  }
}

export function setRequestId(requestId) {
  if (!asyncLocalStorage) return;
  try {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.requestId = requestId;
    }
  } catch {

  }
}

export function runWithRequestId(requestId, callback) {
  if (!asyncLocalStorage) {
    return callback();
  }
  return asyncLocalStorage.run({ requestId }, callback);
}

export function getRequestContext() {
  if (!asyncLocalStorage) return {};
  try {
    return asyncLocalStorage.getStore() || {};
  } catch {
    return {};
  }
}
