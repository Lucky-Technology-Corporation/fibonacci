import { pathToFile } from "./EndpointParser";

test("simple parse", () => {
  const result = pathToFile("/simple");
  expect(result).toBe("Simple.tsx");
});

test("just component name", () => {
  const result = pathToFile("simple");
  expect(result).toBe("Simple.tsx");
});

test("multiple", () => {
  const result = pathToFile("/a/b/c");
  expect(result).toBe("a/b/C.tsx");
});

test("trailing slash", () => {
  const result = pathToFile("/a/b/c/");
  expect(result).toBe("a/b/C.tsx");
});

test("missing slash", () => {
  const result = pathToFile("a/b/c");
  expect(result).toBe("a/b/C.tsx");
});

test("variable", () => {
  const result = pathToFile("a/:b/c");
  expect(result).toBe("a/$b/C.tsx");
});

test("variable in component", () => {
  const result = pathToFile("a/b/$c");
  expect(result).toBe("a/b/$c.tsx");
});

test("dashes in name", () => {
  const result = pathToFile("/submit-details");
  expect(result).toBe("SubmitDetails.tsx");
});
