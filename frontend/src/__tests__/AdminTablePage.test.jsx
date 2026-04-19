import { render, screen } from "@testing-library/react";

import TablePage from "@/features/tables/pages/table-page.jsx";
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

describe("Admin table page smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { tables: [] } });
  });

  it("renders core table management UI", async () => {
    render(<TablePage />);

    expect(await screen.findByText(/quản lý bàn ăn/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /thêm bàn/i }),
    ).toBeInTheDocument();
  });
});
