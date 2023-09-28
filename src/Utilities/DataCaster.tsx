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

export function replaceCodeBlocks(str: string){
  const regex = /(`{1,3})(?:[a-zA-Z]*)\n?([^`]+)\1/g;
  return str.replace(regex, (_, __, code) => {
    const escapedCode = code
      .replace(/ /g, '&nbsp;')
      .replace(/\n/g, '<br>');
    return `<span style="font-family: monospace;">${escapedCode}</span>`;
  });
}
