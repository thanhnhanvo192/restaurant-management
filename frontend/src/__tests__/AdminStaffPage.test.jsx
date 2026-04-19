import { render, screen } from "@testing-library/react";

import StaffPage from "@/features/staff/pages/staff-page.jsx";
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

describe("Admin staff page smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { staffs: [] } });
  });

  it("renders staff management UI", async () => {
    render(<StaffPage />);

    expect(await screen.findByText(/quản lý nhân viên/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /thêm nhân viên mới/i }),
    ).toBeInTheDocument();
  });
});
