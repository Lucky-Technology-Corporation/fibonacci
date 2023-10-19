export class ParsedActiveEndpoint {
  method: string;
  pathParams: string[];
  pathComponents: string[];
  fullPath: string;

  constructor(activeEndpoint: string) {
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
