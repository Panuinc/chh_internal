import { runWithRequestId, generateRequestId } from "./requestContext";

export function withRequestContext(handler) {
  return async function(request, ...args) {
    const existingRequestId = request.headers.get("x-request-id");
    const requestId = existingRequestId || generateRequestId();
    
    return runWithRequestId(requestId, async () => {
      const response = await handler(request, ...args);
      
      // Add request ID to response headers
      if (response && response.headers) {
        response.headers.set("x-request-id", requestId);
      }
      
      return response;
    });
  };
}
