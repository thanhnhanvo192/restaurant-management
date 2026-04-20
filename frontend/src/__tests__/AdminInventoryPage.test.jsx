import { render, screen } from "@testing-library/react";

import InventoryPage from "@/features/inventory/pages/inventory-page.jsx";
import api from "@/services/api/client";

jest.mock("@/services/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    defaults: { baseURL: "http://localhost:5000" },
  },
}));

describe("Admin inventory page smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    api.get.mockImplementation((url) => {
      if (url === "/admin/inventories") {
        return Promise.resolve({ data: { inventories: [] } });
      }

      if (url === "/admin/inventories/movements") {
        return Promise.resolve({ data: { movements: [] } });
      }

      return Promise.resolve({ data: {} });
    });
  });

  it("renders core inventory UI", async () => {
    render(<InventoryPage />);

    expect(await screen.findByText(/quản lý kho/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /thêm mặt hàng/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/lịch sử biến động kho/i)).toBeInTheDocument();
  });
});
