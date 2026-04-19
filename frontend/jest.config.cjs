module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup-tests.js"],
  testMatch: ["**/?(*.)+(test).[jt]sx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "ecmascript",
            jsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },
};
