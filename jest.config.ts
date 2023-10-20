export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"], // This assumes your source files are in a "src" directory
  testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
