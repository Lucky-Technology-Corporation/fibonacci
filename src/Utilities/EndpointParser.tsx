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

export function modifySwizzleImport(importStatement: string, newImport: string, action = 'add'){
  if(importStatement == ""){
    return `import { ${newImport} } from 'swizzle-js';`;
  }
  
  const imports = importStatement.split("{")[1].split("}")[0].split(",").map((i) => i.trim());

  if (action === 'add' && !imports.includes(newImport)) {
    imports.push(newImport);
  } else if (action === 'remove' && imports.includes(newImport)) {
    const index = imports.indexOf(newImport);
    imports.splice(index, 1);
  }

  const newImports = `{ ${imports.join(', ')} }`;
  return `import ${newImports} from 'swizzle-js';`;
}