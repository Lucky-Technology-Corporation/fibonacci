
export function endpointToFilename(path: string): string {
    return path.replace(/\//g, ".").replace(/:([^\.]+)/g, "($1)") + ".js"
}

export function filenameToEndpoint(filename: string): string {
    const decodedFilename = decodeURIComponent(filename)
    return decodedFilename.replace(".js", "").replace(/\./g, '/').replace(/\(/g, ":").replace(/\)/g, "")
}