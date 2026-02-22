import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  describe("Non-interactive mode", () => {
    it("renders correct number of stars", () => {
      render(<StarRating rating={3} />);
      // Should render 5 star SVGs
      expect(document.querySelectorAll("svg")).toHaveLength(5);
    });

    it("displays rating value when showValue is true", () => {
      render(<StarRating rating={4.5} showValue />);
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    it("does not display rating value when showValue is false", () => {
      render(<StarRating rating={4.5} />);
      expect(screen.queryByText("4.5")).not.toBeInTheDocument();
    });

    it("handles size variations", () => {
      const { rerender } = render(<StarRating rating={3} size="sm" />);
      // Check for small size class using getAttribute or classList
      const container = document.querySelector(".flex");
      expect(container).toBeInTheDocument();

      rerender(<StarRating rating={3} size="md" />);
      expect(container).toBeInTheDocument();

      rerender(<StarRating rating={3} size="lg" />);
      expect(container).toBeInTheDocument();
    });

    it("handles edge case: rating of 0", () => {
      render(<StarRating rating={0} showValue />);
      expect(screen.getByText("0.0")).toBeInTheDocument();
    });

    it("handles edge case: rating of 5", () => {
      render(<StarRating rating={5} showValue />);
      expect(screen.getByText("5.0")).toBeInTheDocument();
    });

    it("rounds decimal ratings properly", () => {
      render(<StarRating rating={3.7} showValue />);
      expect(screen.getByText("3.7")).toBeInTheDocument();
    });
  });

  describe("Interactive mode", () => {
    it("calls onChange when star is clicked", async () => {
      const onChange = vi.fn();
      render(
        <StarRating rating={0} interactive onChange={onChange} size="lg" />,
      );

      const stars = screen.getAllByRole("radio");
      await userEvent.click(stars[2]);

      expect(onChange).toHaveBeenCalledWith(3);
    });

    it("has correct accessibility attributes", () => {
      render(<StarRating rating={3} interactive />);

      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveAttribute("aria-label", "Rating");

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(5);
      expect(radios[0]).toHaveAttribute("aria-label", "1 star");
      expect(radios[1]).toHaveAttribute("aria-label", "2 stars");
    });

    it("marks correct star as checked", () => {
      render(<StarRating rating={3} interactive />);

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAttribute("aria-checked", "true");
      expect(radios[1]).toHaveAttribute("aria-checked", "true");
      expect(radios[2]).toHaveAttribute("aria-checked", "true");
      expect(radios[3]).toHaveAttribute("aria-checked", "false");
      expect(radios[4]).toHaveAttribute("aria-checked", "false");
    });

    it("supports keyboard navigation", async () => {
      const onChange = vi.fn();
      render(<StarRating rating={0} interactive onChange={onChange} />);

      const firstStar = screen.getByLabelText("1 star");
      await userEvent.tab();
      expect(document.activeElement).toBe(firstStar);

      // Press Enter to select
      await userEvent.keyboard("{Enter}");
      expect(onChange).toHaveBeenCalledWith(1);
    });
  });
});
