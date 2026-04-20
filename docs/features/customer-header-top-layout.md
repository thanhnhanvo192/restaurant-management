# Customer Feature: Header-Top Layout

## Goal

Chuyển giao diện customer từ bố cục sidebar bên trái sang bố cục header phía trên để điều hướng trực quan hơn, phù hợp responsive tốt hơn ở desktop/tablet và giữ thao tác nhanh trên mobile.

## Scope

- Customer route shell: `/customer/*`
- Frontend layout chính: `frontend/src/layouts/customer-layout.jsx`
- Đồng bộ nhanh visual của các trang customer chính:
  - `frontend/src/features/customer-menu/pages/customer-menu-page.jsx`
  - `frontend/src/features/customer-booking/pages/book-table-page.jsx`
  - `frontend/src/features/customer-orders/pages/order-history-page.jsx`
  - `frontend/src/features/profile/pages/profile-page.jsx`

## Current Problem

- Desktop đang phụ thuộc sidebar trái, chiếm nhiều không gian chiều ngang.
- Trải nghiệm chuyển breakpoint giữa desktop/tablet/mobile chưa thật sự liền mạch.
- Cần một shell thống nhất để các trang customer đồng bộ phong cách.

## Target UX Architecture

- Header sticky ở phía trên làm điều hướng chính trên desktop/tablet.
- Navigation ngang trong header với trạng thái active rõ ràng.
- Quick actions đặt gần header để vào nhanh các luồng quan trọng.
- Mobile giữ bottom navigation để tối ưu thao tác bằng ngón tay cái.
- Khu vực content full-width theo nhịp spacing nhất quán.

## Implementation Milestones

1. Refactor `customer-layout.jsx` để loại bỏ sidebar desktop.
2. Đưa cụm brand + title/subtitle + notifications + profile vào header top.
3. Tạo navigation ngang trong header cho desktop/tablet.
4. Giữ và tinh chỉnh bottom nav mobile để đồng bộ nhãn/màu/trạng thái.
5. Đồng bộ visual section header/card spacing ở menu, booking, orders, profile.
6. Kiểm tra overlap của sticky header và bottom nav trên màn nhỏ.
7. Chạy diagnostics + build để xác nhận không có regression.

## Constraints

- Không đổi route path hiện có.
- Không đổi logic auth/session/profile/logout.
- Không đổi backend/API contract.
- Chỉ thay đổi UI/UX và cấu trúc trình bày.

## Selected Color Direction

- Chosen palette: **Ocean Fresh**
- Primary: `#0EA5E9`
- Primary hover: `#0284C7`
- Soft surface: `#F0F9FF`
- Border: `#BAE6FD`
- Theme approach: dùng customer-scoped CSS variables để tránh hardcode màu trong JSX.

## Verification Checklist

1. Điều hướng đầy đủ các tab customer hoạt động bình thường.
2. Header sticky không che form/action quan trọng.
3. Bottom nav không đè nội dung thao tác ở mobile.
4. Build frontend thành công.
5. Luồng login -> navigate -> logout giữ nguyên hành vi.

## Acceptance Criteria

- Sidebar trái không còn xuất hiện ở desktop.
- Header top là điều hướng chính cho desktop/tablet.
- Mobile bottom nav vẫn rõ ràng, dễ thao tác.
- Tất cả luồng customer hiện tại hoạt động như trước.
