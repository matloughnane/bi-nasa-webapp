process.env.NODE_ENV = "test";
process.env.NASA_API_KEY = "TEST_KEY";
process.env.RATE_LIMIT_MAX = "10000";

// Mock Winston logger to suppress file I/O and console noise during tests
jest.mock("./utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
  },
}));
