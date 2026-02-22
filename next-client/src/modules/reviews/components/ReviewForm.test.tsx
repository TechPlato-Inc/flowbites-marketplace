import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/utils";
import { ReviewForm } from "./ReviewForm";

// Mock the review service
vi.mock("../services/reviews.service", () => ({
  submitReview: vi.fn(),
}));

// Mock toast
vi.mock("@/design-system/Toast", () => ({
  showToast: vi.fn(),
}));

// Import after mocking
import * as reviewService from "../services/reviews.service";

describe("ReviewForm", () => {
  const mockOnSuccess = vi.fn();
  const mockSubmitReview = vi.mocked(reviewService.submitReview);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(<ReviewForm templateId="template-123" onSuccess={mockOnSuccess} />);

    expect(screen.getByText("Write a Review")).toBeInTheDocument();
    expect(screen.getByText("Your Rating *")).toBeInTheDocument();
  });

  it("shows validation error when submitting empty form", async () => {
    render(<ReviewForm templateId="template-123" />);

    // Get form and submit it directly
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();

    // Trigger submit event
    form!.dispatchEvent(new Event("submit", { bubbles: true }));

    // Wait for error to appear
    await waitFor(() => {
      const errorDiv = document.querySelector(".bg-error-light");
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv?.textContent).toContain("Please select a rating");
    });
  });

  it("submits review successfully with all fields filled", async () => {
    mockSubmitReview.mockResolvedValueOnce({} as any);

    render(<ReviewForm templateId="template-123" onSuccess={mockOnSuccess} />);

    // Set rating (5 stars - last radio button)
    const stars = screen.getAllByRole("radio");
    await userEvent.click(stars[4]);

    // Set title
    const titleInput = screen.getByPlaceholderText("Summarize your experience");
    await userEvent.type(titleInput, "Excellent Template!");

    // Set comment
    const commentInput = screen.getByPlaceholderText(/What did you like/);
    await userEvent.type(commentInput, "This template saved me so much time.");

    // Submit using form
    const form = document.querySelector("form");
    form!.dispatchEvent(new Event("submit", { bubbles: true }));

    // Verify service called with correct data
    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith("template-123", {
        rating: 5,
        title: "Excellent Template!",
        comment: "This template saved me so much time.",
      });
    });
  });

  it("shows success message after submission", async () => {
    mockSubmitReview.mockResolvedValueOnce({} as any);

    render(<ReviewForm templateId="template-123" onSuccess={mockOnSuccess} />);

    // Fill form completely
    const stars = screen.getAllByRole("radio");
    await userEvent.click(stars[4]);

    const titleInput = screen.getByPlaceholderText("Summarize your experience");
    await userEvent.type(titleInput, "Great!");

    const commentInput = screen.getByPlaceholderText(/What did you like/);
    await userEvent.type(commentInput, "Awesome template.");

    const form = document.querySelector("form");
    form!.dispatchEvent(new Event("submit", { bubbles: true }));

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText("Review Submitted!")).toBeInTheDocument();
      expect(
        screen.getByText(/Thank you for your feedback/),
      ).toBeInTheDocument();
    });
  });

  it("handles submission error from API", async () => {
    mockSubmitReview.mockRejectedValueOnce({
      response: { data: { error: "Already reviewed this template" } },
    });

    render(<ReviewForm templateId="template-123" />);

    // Fill form
    const stars = screen.getAllByRole("radio");
    await userEvent.click(stars[4]);

    const titleInput = screen.getByPlaceholderText("Summarize your experience");
    await userEvent.type(titleInput, "Great!");

    const commentInput = screen.getByPlaceholderText(/What did you like/);
    await userEvent.type(commentInput, "Awesome template.");

    const form = document.querySelector("form");
    form!.dispatchEvent(new Event("submit", { bubbles: true }));

    // Error from API should be displayed
    await waitFor(() => {
      expect(
        screen.getByText("Already reviewed this template"),
      ).toBeInTheDocument();
    });
  });

  it("calls onSuccess callback after successful submission", async () => {
    mockSubmitReview.mockResolvedValueOnce({} as any);

    render(<ReviewForm templateId="template-123" onSuccess={mockOnSuccess} />);

    // Fill form
    const stars = screen.getAllByRole("radio");
    await userEvent.click(stars[4]);

    const titleInput = screen.getByPlaceholderText("Summarize your experience");
    await userEvent.type(titleInput, "Great!");

    const commentInput = screen.getByPlaceholderText(/What did you like/);
    await userEvent.type(commentInput, "Awesome template.");

    const form = document.querySelector("form");
    form!.dispatchEvent(new Event("submit", { bubbles: true }));

    // onSuccess should be called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
