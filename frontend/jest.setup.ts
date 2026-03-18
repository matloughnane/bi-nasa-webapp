import "@testing-library/jest-dom"

// Mock react-markdown (ESM-only) so Jest can process it
jest.mock("react-markdown", () => {
  const React = require("react")
  return {
    __esModule: true,
    default: ({ children }: { children: string }) =>
      React.createElement("div", { "data-testid": "markdown" }, children),
  }
})

// Polyfill ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
