import { randomUUID } from "crypto";

const asyncLocalStorage = globalThis.AsyncLocalStorage
  ? new globalThis.AsyncLocalStorage()
  : null;

export function generateRequestId() {
  return randomUUID();
}

export function getRequestId() {
  if (!asyncLocalStorage) return null;
  const store = asyncLocalStorage.getStore();
  return store?.requestId || null;
}

export function setRequestId(requestId) {
  if (!asyncLocalStorage) return;
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.requestId = requestId;
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
  return asyncLocalStorage.getStore() || {};
}
