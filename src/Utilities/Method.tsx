export enum Method {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HELPER = "Helper",
  TRIGGER = "Trigger",
}
export const methodToColor = (method?: Method, methodString?: string) => {
  if (methodString) {
    method = methodString as Method;
  }
  switch (method) {
    case Method.GET:
      return "text-green-400";
    case Method.POST:
      return "text-blue-400";
    case Method.PUT:
      return "text-yellow-400";
    case Method.DELETE:
      return "text-red-400";
    case Method.PATCH:
      return "text-purple-400";
  }
};
