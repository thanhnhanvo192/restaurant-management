import { render, screen } from "@testing-library/react";

import NotFound from "./not-found-page.jsx";

describe("NotFound page", () => {
  it("renders warning message", () => {
    render(<NotFound />);

    expect(screen.getByText(/vùng cấm địa/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /quay về trang chủ/i }),
    ).toBeInTheDocument();
  });
});
