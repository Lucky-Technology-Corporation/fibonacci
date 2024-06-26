export class ParsedActiveEndpoint {
  method: string;
  pathParams: string[];
  pathComponents: string[];
  fullPath: string;

  constructor(activeEndpoint: string) {
    if (!activeEndpoint || activeEndpoint.length === 0 || !activeEndpoint.includes("/")) {
      this.method = "";
      this.pathParams = [];
      this.pathComponents = [];
      this.fullPath = "";
      return;
    }
    const idx = activeEndpoint.indexOf("/");
    this.method = activeEndpoint.substring(0, idx).toUpperCase();

    this.fullPath = activeEndpoint.substring(idx);
    const iter = this.fullPath.matchAll(/:([A-Za-z0-9-_]+)/g);
    this.pathParams = Array.from(iter).map((match) => match[1]);
  }

  getEndpointWithParams(params: string[]): string {
    if (this.pathParams.length !== params.length) {
      throw Error("Provided parameters doesn't match expected parameters");
    }

    const regex = /:[A-Za-z0-9-_]+/g;
    let match: RegExpExecArray;
    let currentIndex = 0;

    let path = this.fullPath;
    while ((match = regex.exec(path)) !== null) {
      path = path.substring(0, match.index) + params[currentIndex] + path.substring(regex.lastIndex);
      regex.lastIndex = match.index + params[currentIndex].length;
      currentIndex++;
    }

    return path;
  }

  // Returns the url in parts where path params have been separated out.
  // Ex: /:hi/:there/buddy => ["/", ":hi", "/", ":there", "/buddy"]
  toParts(): string[] {
    const regex = /:[A-Za-z0-9-_]+/g;
    let match: RegExpExecArray;

    let path = this.fullPath;
    let parts = [];
    let remainderIdx = 0;

    while ((match = regex.exec(path)) !== null) {
      parts.push(path.substring(remainderIdx, match.index));
      parts.push(path.substring(match.index, match.index + match[0].length));

      regex.lastIndex = match.index + match[0].length;
      remainderIdx = regex.lastIndex;
    }

    if (remainderIdx < path.length) {
      parts.push(path.substring(remainderIdx));
    }

    return parts;
  }
}

export function enumeratePathParams(parts: string[]): (string | [string, number])[] {
  let result: (string | [string, number])[] = [];
  let i = 0;
  parts.forEach((part) => {
    if (part[0] == ":") {
      result.push([part, i++]);
    } else {
      result.push(part);
    }
  });
  return result;
}

export function endpointSort(aIn, bIn) {
  const isASwizzle = aIn.startsWith("get/cron");
  const isBSwizzle = bIn.startsWith("get/cron");

  var a = aIn.replace(/^(get|post)/, "");
  var b = bIn.replace(/^(get|post)/, "");

  if (isASwizzle && !isBSwizzle) {
    return 1; // a goes after b
  } else if (!isASwizzle && isBSwizzle) {
    return -1; // a goes before b
  } else {
    return a.localeCompare(b); // normal alphabetical sort
  }
}
