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
