export class ParsedActiveEndpoint {
  method: string;
  pathParams: string[];
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
}
