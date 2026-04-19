import { render, screen } from "@testing-library/react";

import ManageMenuPage from "@/features/menu/pages/manage-menu-page.jsx";
import api from "@/services/api/client";

jest.mock("@/services/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: { baseURL: "http://localhost:5000" },
  },
}));

describe("Admin menu page smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { menus: [] } });
  });

  it("renders core menu management UI", async () => {
    render(<ManageMenuPage />);

    expect(await screen.findByText(/quản lý thực đơn/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /thêm món mới/i }),
    ).toBeInTheDocument();
  });
});
