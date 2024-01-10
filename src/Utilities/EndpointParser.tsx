export function endpointToFilename(path: string): string {
  if (path.includes("!helper!")) {
    if (path.endsWith(".ts")) {
      return path;
    } else {
      return path + ".ts";
    }
  }
  return path.replace(/\//g, ".").replace(/:([^\.]+)/g, "($1)") + ".ts";
}

export function filenameToEndpoint(filename: string): string {
  return decodeURIComponent(filename).replace(".ts", "").replace(/\./g, "/").replace(/\(/g, ":").replace(/\)/g, "");
}

export function modifySwizzleImport(importStatement: string, newImport: string, action = "add") {
  if (importStatement == "") {
    return `import { ${newImport} } from 'swizzle-js';`;
  }

  const imports = importStatement
    .split("{")[1]
    .split("}")[0]
    .split(",")
    .map((i) => i.trim());

  if (action === "add" && !imports.includes(newImport)) {
    imports.push(newImport);
  } else if (action === "remove" && imports.includes(newImport)) {
    const index = imports.indexOf(newImport);
    imports.splice(index, 1);
  }

  const newImports = `{ ${imports.join(", ")} }`;
  return `import ${newImports} from 'swizzle-js';`;
}

export function formatPath(fullPath: string, path: string, allComponents: boolean = false) {
  if ((fullPath || "").includes("frontend/src/pages")) {
    var p = path;
    var p = p.replace(".tsx", "").replace(/\./g, "/").toLowerCase();
    if (!p.startsWith("/")) {
      p = "/" + p;
    }
    p = p.replace(/\$/g, ":");
    p = p.replace("_", "/");
    if (p == "/swizzlehomepage") {
      p = "/";
    }

    if (allComponents) {
      const pathAfterPages = fullPath.split("/pages")[1];
      const numberOfLevels = pathAfterPages.match(/\//g);
      if (numberOfLevels.length > 1) {
        const prependPath = splitAtLast(pathAfterPages, "/")[0].replace(/\$/g, ":");
        return prependPath + p;
      }
    }

    return p;
  } else {
    return path;
  }
}

function splitAtLast(str, delimiter) {
  const lastIndex = str.lastIndexOf(delimiter);
  if (lastIndex === -1) return [str]; // Delimiter not found

  return [str.substring(0, lastIndex), str.substring(lastIndex + 1)];
}

export function capitalizeAfterLastSlash(str: string) {
  return str.replace(/\/([^/]*)$/, (match, lastSegment) =>
    match.replace(lastSegment.charAt(0), lastSegment.charAt(0).toUpperCase()),
  );
}

export const pathToFile = (path: string) => {
  if (path.startsWith("/")) {
    path = path.substring(1);
  }
  if (path.endsWith("/")) {
    path = path.substring(0, path.length - 1);
  }
  path = path.replace(/:/g, "$");

  if (!path.endsWith(".tsx")) {
    path += ".tsx";
  }

  const lastSlashIdx = path.lastIndexOf("/");

  let dir = "";
  let component = "";
  if (lastSlashIdx == -1) {
    component = path;
  } else {
    dir = path.substring(0, lastSlashIdx + 1);
    component = path.substring(lastSlashIdx + 1);
  }

  return dir + titleCaseDashes(component);
};

// Returns how many more directorys newPath has compared to oldPath.
export const pathLengthDifference = (oldPath: string, newPath: string): number => {
  return (newPath.match(/\//g) || []).length - (oldPath.match(/\//g) || []).length;
};

// Changes the depth of the relative import statement
//
// Improvement: Handle the case where im above the import and I move to below it.
//
// Example: we have /page that imports another at ./a/b/c/Another. Now, we want to move
// /page to /a/b/c/d/e/Page. This should result in a relative import of ../../Another.
// Currently, this will result in ../../../../../a/b/c/Another. It's still a valid path but
// it can be simplified.
//
// a
// - b
// -- c
// --- another
// page
export const changeRelativeImportDepth = (originalPath: string, importPath: string, delta: number): string => {
  if (delta === 0) {
    return importPath;
  }

  if (delta > 0) {
    if (importPath.startsWith("./")) {
      importPath = importPath.substring(2);
    }
    return "../".repeat(delta) + importPath;
  }

  let offset = 0;
  while (delta < 0 && importPath.startsWith("../")) {
    importPath = importPath.substring(3);
    delta++;
    offset++;
  }

  if (delta === 0) {
    if (!importPath.startsWith("../")) {
      importPath = "./" + importPath;
    }
    return importPath;
  }

  // We still need to move up but we've run out of leeway so now we need to pull
  // from the full path.

  // Remove ./ prefix
  if (importPath.startsWith("./")) {
    importPath = importPath.substring(2);
  }

  const dirPath = originalPath.substring(0, originalPath.lastIndexOf("/"));
  const pieces = dirPath.split("/");

  if (pieces.length < -delta + offset) {
    throw new Error("originalPath isn't long enough to determine what the relative import should be");
  }

  return "./" + pieces.slice(pieces.length + delta - offset, pieces.length - offset).join("/") + "/" + importPath;
};

// Changes kebab case strings to title case:
//
// submit-details ===> SubmitDetails
// test-----me    ===> TestMe
function titleCaseDashes(s: string): string {
  return s
    .split("-")
    .filter((word) => word != "")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
