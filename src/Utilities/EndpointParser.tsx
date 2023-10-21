export function endpointToFilename(path: string): string {
  if (path.includes("!helper!")) {
    if (path.endsWith(".js")) {
      return path;
    } else {
      return path + ".js";
    }
  }
  return path.replace(/\//g, ".").replace(/:([^\.]+)/g, "($1)") + ".js";
}

export function filenameToEndpoint(filename: string): string {
  return decodeURIComponent(filename).replace(".js", "").replace(/\./g, "/").replace(/\(/g, ":").replace(/\)/g, "");
}
