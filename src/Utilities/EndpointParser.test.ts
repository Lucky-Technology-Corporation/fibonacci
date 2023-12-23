import { changeRelativeImportDepth, pathLengthDifference, pathToFile } from "./EndpointParser";

describe("pathToFile", () => {
  it("simple parse", () => {
    const result = pathToFile("/simple");
    expect(result).toBe("Simple.tsx");
  });

  it("just component name", () => {
    const result = pathToFile("simple");
    expect(result).toBe("Simple.tsx");
  });

  it("multiple", () => {
    const result = pathToFile("/a/b/c");
    expect(result).toBe("a/b/C.tsx");
  });

  it("trailing slash", () => {
    const result = pathToFile("/a/b/c/");
    expect(result).toBe("a/b/C.tsx");
  });

  it("missing slash", () => {
    const result = pathToFile("a/b/c");
    expect(result).toBe("a/b/C.tsx");
  });

  it("variable", () => {
    const result = pathToFile("a/:b/c");
    expect(result).toBe("a/$b/C.tsx");
  });

  it("variable in component", () => {
    const result = pathToFile("a/b/$c");
    expect(result).toBe("a/b/$c.tsx");
  });

  it("dashes in name", () => {
    const result = pathToFile("/submit-details");
    expect(result).toBe("SubmitDetails.tsx");
  });
});

describe("pathLengthDifference", () => {
  it("same difference", () => {
    const result = pathLengthDifference("a/b/C.tsx", "a/b/D.tsx");
    expect(result).toBe(0);
  });

  it("new path longer", () => {
    const result = pathLengthDifference("a/b/C.tsx", "a/b/c/D.tsx");
    expect(result).toBe(1);
  });

  it("new path shorter", () => {
    const result = pathLengthDifference("a/b/C.tsx", "a/B.tsx");
    expect(result).toBe(-1);
  });
});

describe("changeRelativeImportDepth", () => {
  it("no change", () => {
    const result = changeRelativeImportDepth("a/b/C.tsx", "../Api", 0);
    expect(result).toBe("../Api");
  });

  it("positive delta", () => {
    const result = changeRelativeImportDepth("a/b/C.tsx", "../Api", 2);
    expect(result).toBe("../../../Api");
  });

  it("positive delta was same directory", () => {
    const result = changeRelativeImportDepth("a/b/C.tsx", "./Api", 2);
    expect(result).toBe("../../Api");
  });

  it("negative delta still ../", () => {
    const result = changeRelativeImportDepth("a/b/C.tsx", "../../Api", -1);
    expect(result).toBe("../Api");
  });

  it("negative delta moving to same directory", () => {
    const result = changeRelativeImportDepth("a/b/C.tsx", "../../Api", -2);
    expect(result).toBe("./Api");
  });

  it("negative delta moving above directory", () => {
    // We originally were in the same directory (i.e. a/b/Api) but now the file has
    // moved up a directory.
    const result = changeRelativeImportDepth("a/b/C.tsx", "./Api", -1);
    expect(result).toBe("./b/Api");
  });

  it("big negative difference", () => {
    // a
    // - b
    // -- c
    // --- d
    // ---- e
    // ----- Component
    // --- Api
    const result = changeRelativeImportDepth("a/b/c/d/e/Component.tsx", "../../Api", -4);
    expect(result).toBe("./b/c/Api");
  });

  it("original import path not long enough", () => {
    // --- d
    // ---- e
    // ----- Component
    // --- Api
    //
    // Here, we want to move up 4 levels but we don't know what the path is so we need to throw
    // an error that the provided originalPath doesn't contain enough information.
    expect(() => changeRelativeImportDepth("d/e/Component.tsx", "../../Api", -4)).toThrow();
  });
});
