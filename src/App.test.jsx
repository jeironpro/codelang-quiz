import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Smoke test del esqueleto base de la app.
describe("App (scaffold)", () => {
  it("muestra el titulo de la aplicacion", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /Codelang Quiz/i }),
    ).toBeInTheDocument();
  });
});
