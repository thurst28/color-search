// test-utils.js
import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme as baseTheme } from "../static/theme";
import "@testing-library/jest-dom/extend-expect";
import "jest-canvas-mock";

const AllTheProviders = ({ children }) => {
  return <ThemeProvider theme={baseTheme}>{children}</ThemeProvider>;
};

const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react";
export * from "jest-canvas-mock";
export * from "@testing-library/jest-dom/extend-expect";

// override render method
export { customRender as render };
