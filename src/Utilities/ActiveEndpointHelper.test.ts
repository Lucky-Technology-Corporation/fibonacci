import { ParsedActiveEndpoint } from "./ActiveEndpointHelper";

test("simple parse", () => {
  const result = new ParsedActiveEndpoint("get/hi/:var1/there/:var2");
  expect(result.method).toBe("GET");
  expect(result.pathParams).toEqual(["var1", "var2"]);
});

test("replace single path param", () => {
  expect(new ParsedActiveEndpoint("get/hi/:var1/there/:var2").getEndpointWithParams(["123", "456"])).toEqual(
    "/hi/123/there/456",
  );
});
