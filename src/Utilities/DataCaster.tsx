import { filenameToEndpoint } from "./EndpointParser";

export function castValues(input: any): any {
  let output;

  if (Array.isArray(input)) {
    output = input.map(castValues); // recursively apply to each item if it's an array
  } else if (typeof input === "object" && input !== null) {
    output = Object.fromEntries(
      // recreate the object
      Object.entries(input).map(([key, value]) => [key, castValues(value)]), // recursively apply to each value
    );
  } else if (typeof input === "string") {
    // Check if it can be casted to a number
    const number = Number(input);
    if (!isNaN(number)) {
      output = number;
    }

    // Check if it can be casted to a boolean
    else if (input.toLowerCase() === "true" || input.toLowerCase() === "false") {
      output = input.toLowerCase() === "true";
    }

    // Check if it can be casted to a date
    else {
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        output = date;
      } else {
        // If it can't be casted to anything, just keep the original value
        output = input;
      }
    }
  } else {
    // If it's not a string, just keep the original value
    output = input;
  }

  return output;
}

const filenameToEnglish = (filename: string) => {
  if(filename.startsWith("get")) {
    return "GET " + filename.slice(3);
  } else if(filename.startsWith("post")) {
    return "POST " + filename.slice(4);
  }
}

export function replaceCodeBlocks(str: string) {
  const regex = /(`+)([^\n`]+?)\1|(`{3,})(?:[a-zA-Z]*)\n?([\s\S]*?)\3/g;
  let lastIndex = 0;
  let result = '';

  let match;
  while ((match = regex.exec(str)) !== null) {
    result += str.slice(lastIndex, match.index).replace(/\n/g, '<br>');
    const code = match[2] || match[4];
    const escapedCode = code.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>");
    result += `<span style="font-family: monospace;">${escapedCode}</span>`;
    lastIndex = regex.lastIndex;
  }

  result += str.slice(lastIndex).replace(/\n/g, '<br>');
  
  const filepathRegex = /\/swizzle\/code\/backend\/user-dependencies\/([^\/\s]+)/g;
  result = result.replace(filepathRegex, (_, filename) => filenameToEnglish(filenameToEndpoint(filename)));

  const helperRegex = /\/swizzle\/code\/backend\/helpers\/([^\/\s]+)/g;
  result = result.replace(helperRegex, (_, filename) => filename);

  const fileNameOnlyRegex = /\b(post\.|get\.)[\w\.\(\)]+\.js\b/g;
  result = result.replace(fileNameOnlyRegex, (filename) => filenameToEnglish(filenameToEndpoint(filename)));

  return result;
}
