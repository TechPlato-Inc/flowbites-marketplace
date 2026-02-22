import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { ReviewCard } from "./ReviewCard";
import { createMockReview } from "@/test/factories";

// Mock the ReportButton component
vi.mock("@/modules/reports/components/ReportButton", () => ({
  ReportButton: () => <button data-testid="report-button">Report</button>,
}));

// Mock formatDate to return predictable values
vi.mock("@/lib/utils/format", () => ({
  formatDate: () => "Jan 15, 2026",
}));

describe("ReviewCard", () => {
  it("renders review with buyer name", () => {
    const review = createMockReview({
      buyerId: { _id: "buyer-1", name: "John Doe", avatar: "avatar.jpg" },
    });

    render(<ReviewCard review={review} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders review title and comment", () => {
    const review = createMockReview({
      title: "Excellent Design",
      comment: "Highly recommend this template!",
    });

    render(<ReviewCard review={review} />);

    expect(screen.getByText("Excellent Design")).toBeInTheDocument();
    expect(
      screen.getByText("Highly recommend this template!"),
    ).toBeInTheDocument();
  });

  it("renders avatar image when provided", () => {
    const review = createMockReview({
      buyerId: {
        _id: "buyer-1",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
      },
    });

    render(<ReviewCard review={review} />);

    const avatar = screen.getByAltText("John Doe");
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("renders initials avatar when no avatar provided", () => {
    const review = createMockReview({
      buyerId: { _id: "buyer-1", name: "Jane Smith" },
    });

    render(<ReviewCard review={review} />);

    // Should show first letter of name
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("displays correct star rating", () => {
    const review = createMockReview({ rating: 4 });

    render(<ReviewCard review={review} />);

    // Should have StarRating component with 5 star SVGs
    expect(document.querySelectorAll("svg")).toHaveLength(5);
  });

  it("displays report button", () => {
    const review = createMockReview();

    render(<ReviewCard review={review} />);

    expect(screen.getByTestId("report-button")).toBeInTheDocument();
  });

  it("displays formatted date", () => {
    const review = createMockReview({
      createdAt: "2026-01-15T10:00:00Z",
    });

    render(<ReviewCard review={review} />);

    expect(screen.getByText("Jan 15, 2026")).toBeInTheDocument();
  });
});
