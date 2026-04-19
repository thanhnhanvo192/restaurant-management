import { render, screen } from "@testing-library/react";

import ManageCustomersPage from "@/features/customers/pages/manage-customers-page.jsx";
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

describe("Admin customer page smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { customers: [] } });
  });

  it("renders customer management UI", async () => {
    render(<ManageCustomersPage />);

    expect(await screen.findByText(/quản lý khách hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/danh sách khách hàng/i)).toBeInTheDocument();
  });
});
