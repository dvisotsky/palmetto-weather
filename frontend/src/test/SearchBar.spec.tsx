import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/components/SearchBar/SearchBar";

vi.mock("@/services/weatherApi", () => ({
  fetchLocations: vi.fn().mockResolvedValue([]),
}));

describe("SearchBar", () => {
  beforeEach(() => {
    localStorage.removeItem("palmetto_favorites");
  });

  it("renders input and submit button", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(
      screen.getByRole("textbox", { name: /location/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("calls onSearch with trimmed value on submit", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.type(screen.getByRole("textbox"), "  Charleston  ");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith("Charleston");
  });

  it("disables the button while loading", () => {
    render(<SearchBar onSearch={vi.fn()} isLoading />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
