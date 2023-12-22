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
  path = path.replace(":", "$");

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
