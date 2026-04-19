import { render, screen } from "@testing-library/react";

import ManageInvoicesPage from "@/features/orders/pages/manage-invoices-page.jsx";
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

describe("Admin order/invoice page smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { orders: [] } });
  });

  it("renders invoice management UI with primary actions", async () => {
    render(<ManageInvoicesPage />);

    expect(await screen.findByText(/quản lý hóa đơn/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /xuất excel/i }),
    ).toBeInTheDocument();
  });
});
