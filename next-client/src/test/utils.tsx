import React, { ReactElement } from "react";
import { render, RenderOptions, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Custom render with providers (if needed in future)
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from "@testing-library/react";
export { customRender as render };
export { userEvent, screen, waitFor };

// Test utilities
export function createMockEvent(value: string) {
  return { target: { value } } as React.ChangeEvent<HTMLInputElement>;
}

export async function fillForm(fields: Record<string, string>) {
  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(new RegExp(label, "i"));
    await userEvent.clear(input);
    await userEvent.type(input, value);
  }
}

export async function submitForm(buttonText = /submit|save|create/i) {
  const button = screen.getByRole("button", { name: buttonText });
  await userEvent.click(button);
}

// Async test helpers
export async function waitForLoadingToFinish() {
  return waitFor(() => {
    expect(
      screen.queryByText(/loading|loading\.\.\./i),
    ).not.toBeInTheDocument();
  });
}

export async function waitForErrorMessage(message?: string) {
  if (message) {
    return waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  }
  return waitFor(() => {
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
}

// Mock timer utilities
export function mockDateNow(timestamp: number) {
  const original = Date.now;
  vi.spyOn(Date, "now").mockImplementation(() => timestamp);
  return () => {
    Date.now = original;
  };
}

export function mockConsole(method: "log" | "error" | "warn" = "error") {
  const spy = vi.spyOn(console, method).mockImplementation(() => {});
  return () => spy.mockRestore();
}
