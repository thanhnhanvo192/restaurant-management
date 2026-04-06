/\*\*

- ════════════════════════════════════════════════════════════════════════════════
- 🎯 CustomerLayout (NO SIDEBAR VERSION)
-
- Senior Frontend Developer - React + Tailwind CSS + Shadcn/ui
- ════════════════════════════════════════════════════════════════════════════════
-
- 📌 ĐẶC ĐIỂM CHÍNH:
-
- - ❌ KHÔNG có Sidebar trái
- - ✅ Chỉ có Header ở phía trên cùng (fixed/sticky)
- - ✅ Main content chiếm toàn bộ chiều rộng (full width)
- - ✅ Header gọn gàng: Logo trái | Giữa | User menu phải
- - ✅ Responsive tốt trên mobile/tablet/desktop
-
- ════════════════════════════════════════════════════════════════════════════════
- 📁 CẤU TRÚC FILE
- ════════════════════════════════════════════════════════════════════════════════
  \*/

/\*\*

-
- src/
- ├── layouts/
- │ └── CustomerLayout.jsx ..................... ✅ MAIN LAYOUT (không sidebar)
- │
- ├── components/layouts/
- │ └── customer-header.jsx ................... ✅ HEADER COMPONENT
- │ - Logo nhà hàng (bên trái)
- │ - Tiêu đề/Breadcrumb (giữa - tùy chọn)
- │ - User Avatar + Dropdown menu
- │ - Bell Notification icon
- │ - Height: h-16 (cố định)
- │
- └── pages/Customer/
-     └── BookTablePage.jsx ..................... ✅ VÍ DỤ PAGE CON
-         - Form đặt bàn
-         - Sidebar info (thời gian, tips, liên hệ)
-         - FAQ section
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 📐 LAYOUT STRUCTURE
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- ┌─────────────────────────────────────────────────────────────────┐
- │ 🍽️ Nhà hàng ABC [Center - Breadcrumb/Title] [👤 User | 🔔 | ➡️]│
- ├─────────────────────────────────────────────────────────────────┤
- │ │
- │ │
- │ MAIN CONTENT (Full Width) │
- │ - p-4 on mobile, p-6 on desktop │
- │ - Responsive grid/flex layout │
- │ - Content từ <Outlet /> của React Router │
- │ │
- │ │
- └─────────────────────────────────────────────────────────────────┘
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 🚀 QUICK START - CÁCH SỬ DỤNG
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- 1️⃣ VÀO App.jsx VÀ THÊM ROUTES:
- ──────────────────────────────────────────────────────────────────────────
-
-     import CustomerLayout from "./layouts/CustomerLayout";
-     import BookTablePage from "./pages/Customer/BookTablePage";
-     // Import thêm các pages khác
-
-     <Routes>
-       {/* Admin routes */}
-       <Route path="/admin" element={<AdminLayout />}>
-         ...
-       </Route>
-
-       {/* 🟢 Customer routes - HỌC LAYOUT MỚI */}
-       <Route path="/customer" element={<CustomerLayout />}>
-         <Route path="book-table" element={<BookTablePage />} />
-         <Route path="menu" element={<MenuPage />} />
-         <Route path="orders" element={<OrdersPage />} />
-         <Route path="profile" element={<ProfilePage />} />
-       </Route>
-
-       <Route path="/" element={<HomePage />} />
-     </Routes>
-
-
- 2️⃣ TEST LAYOUT:
- ──────────────────────────────────────────────────────────────────────────
-
-     npm run dev
-
-     Truy cập: http://localhost:5173/customer/book-table
-
-     Kỳ vọng:
-     ✅ Header cố định ở trên (h-16)
-     ✅ Logo + User menu hiển thị
-     ✅ Main content chiếm toàn bộ chiều rộng
-     ✅ Responsive trên mobile
-
-
- 3️⃣ CUSTOM CÁC ELEMENT:
- ──────────────────────────────────────────────────────────────────────────
-
-     File: src/components/layouts/customer-header.jsx
-
-     - Thay tên nhà hàng:
-       <h1 className="text-lg font-semibold">Nhà hàng ABC</h1>
-       → Thay "Nhà hàng ABC" thành tên thực
-
-     - Thay avatar/name:
-       const USER_DATA = { name: "...", email: "...", avatar: "..." }
-       → Thay bằng dữ liệu từ API hoặc context
-
-     - Xử lý logout:
-       const handleLogout = () => { ... }
-       → Thêm logic logout (API call, clear token, redirect)
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 🎨 HEADER COMPONENT DETAILS
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- Header có 3 phần:
-
- ┌─────────────────────────────────────────────────────────────────┐
- │ [Logo] [ Giữa (empty) ] [🔔 Bell] [👤 User Dropdown] [Logout] │
- └─────────────────────────────────────────────────────────────────┘
-
-
- 📌 BÊN TRÁI: Logo Nhà hàng
- ──────────────────────────────────────────────────────────────────
- - Icon: UtensilsCrossed từ lucide-react
- - Text: "Nhà hàng ABC"
- - Responsive: Text ẩn trên mobile (hidden sm:block)
- - Color: Primary background với white text
-
-
- 📌 GIỮA: Tiêu đề/Breadcrumb (Tùy chọn)
- ──────────────────────────────────────────────────────────────────
- - Hiện tại để trống
- - Có thể thêm breadcrumb hoặc page title
- - Sử dụng props từ trang con nếu cần
-
-
- 📌 BÊN PHẢI: User Menu
- ──────────────────────────────────────────────────────────────────
-
- 1️⃣ Bell Icon (Notification)
-       - Dropdown menu với danh sách thông báo
-       - Có badge đỏ nếu có thông báo mới
-       - Hiện tại: "Không có thông báo mới"
-
- 2️⃣ User Avatar + Dropdown
-       - Avatar: Ảnh từ mock data hoặc API
-       - Tên + Email (ẩn trên mobile)
-       - ChevronDown icon
-
- 3️⃣ User Dropdown Menu
-       - Hiển thị tên + email + avatar
-       - Menu items:
-         * Hồ sơ cá nhân
-         * Cài đặt
-         * Đăng xuất (red themed)
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 💻 RESPONSIVE BEHAVIOR
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- 📱 MOBILE (< 768px):
- - Header: h-16 (4rem)
- - Logo text ẩn (chỉ hiển thị icon)
- - User email ẩn
- - Main content: p-4
- - Single column layout
-
- 💻 TABLET/DESKTOP (≥ 768px):
- - Header: h-16 (4rem)
- - Logo text hiển thị
- - User email hiển thị
- - Main content: p-6
- - Multi-column layout
-
-
- Responsive Classes:
- - hidden sm:block (ẩn mobile, hiện tablet+)
- - p-4 md:p-6 (padding)
- - grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (layout)
- - w-full (full width)
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 📋 VÍ DỤ: BOOKTRABLEPAGE
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- File: src/pages/Customer/BookTablePage.jsx
-
- Cấu trúc:
- - Tiêu đề trang (h1 + description)
- - Grid layout: 2/3 form + 1/3 sidebar
- - Form đặt bàn: date, time, guests, name, phone, note
- - Sidebar: thời gian hoạt động, tips, liên hệ
- - FAQ section
-
- Sử dụng dalam App.jsx:
-
- <Route path="/customer" element={<CustomerLayout />}>
-     <Route path="book-table" element={<BookTablePage />} />
- </Route>
-
- Navigator URL: /customer/book-table
-
-
- Ví dụ tạo page con khác:
-
- 1.  Tạo file: src/pages/Customer/CustomerDashboardPage.jsx
- 2.  Export default component với content
- 3.  Add route trong App.jsx
- 4.  CustomerLayout sẽ tự động bọc page
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 🔧 CUSTOMIZATION GUIDE
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- 1️⃣ THAY ĐỔI NÀ HÀNG BRANDING:
- ──────────────────────────────────────────────────────────────────────────
-
- File: src/components/layouts/customer-header.jsx
-
- Change:
-     const USER_DATA = {
-       name: "Nguyễn Văn A",       ← Thay tên khách hàng
-       email: "email@...",         ← Thay email
-       avatar: "/avatars/...",     ← Thay ảnh
-     };
-
- Change:
-     <h1>Nhà hàng ABC</h1>        ← Thay tên nhà hàng
-
-
- 2️⃣ THAY ĐỔI HEADER ICON:
- ──────────────────────────────────────────────────────────────────────────
-
- Import icon khác từ lucide-react:
-     import { Coffee } from "lucide-react";
-
- Replace:
-     <UtensilsCrossed className="w-5 h-5" />
- với:
-     <Coffee className="w-5 h-5" />
-
-
- 3️⃣ THAY ĐỔI HEADER HEIGHT:
- ──────────────────────────────────────────────────────────────────────────
-
- File: src/components/layouts/customer-header.jsx
-
- Change:
-     <header className="h-16 ...">
- thành:
-     <header className="h-20 ...">
-
- Cũng cần update main content padding:
- File: src/layouts/CustomerLayout.jsx
-
-     <main className="flex-1 w-full">
-       <div className="h-full w-full p-4 md:p-6">
-
-
- 4️⃣ THÊM BREADCRUMB:
- ──────────────────────────────────────────────────────────────────────────
-
- File: src/components/layouts/customer-header.jsx
-
- Replace:
-     {/* Giữa: Tiêu đề trang */}
-     <div className="flex-1 text-center">
-       {/* Để trống hoặc thêm breadcrumb */}
-     </div>
-
- Thành:
-     <nav className="flex-1">
-       <div className="flex items-center gap-1 text-sm">
-         <Link to="/customer">Trang chủ</Link>
-         <span>/</span>
-         <span>Đặt bàn</span>
-       </div>
-     </nav>
-
-
- 5️⃣ THAY ĐỔI LOGOUT BEHAVIOR:
- ──────────────────────────────────────────────────────────────────────────
-
- File: src/components/layouts/customer-header.jsx
-
- Update:
-     const handleLogout = () => {
-       // TODO: Gọi API logout
-       console.log("Logout");
-
-       // Thêm logic:
-       localStorage.removeItem("authToken");
-       navigate("/login");
-     };
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 🎯 FEATURES & COMPONENTS USED
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- 🎨 SHADCN/UI COMPONENTS:
- ──────────────────────────────────────────────────────────────────────────
- ✅ Button (variant: ghost, size: icon)
- ✅ Avatar (AvatarImage, AvatarFallback)
- ✅ DropdownMenu (trigger, content, items, separator, label)
- ✅ Card (CardHeader, CardTitle, CardContent, CardDescription)
- ✅ Input (text, date, tel)
- ✅ Label
- ✅ Select (SelectTrigger, Selectvalue, SelectContent, SelectItem)
- ✅ Textarea
-
-
- 🎨 LUCIDE ICONS:
- ──────────────────────────────────────────────────────────────────────────
- ✅ UtensilsCrossed (logo)
- ✅ Bell (notifications)
- ✅ LogOut (logout)
- ✅ User, Settings (user menu)
- ✅ ChevronDown (indicator)
- ✅ Calendar, Clock, Users, Info (form icons)
-
-
- 🎨 TAILWIND CSS:
- ──────────────────────────────────────────────────────────────────────────
- ✅ Flexbox: flex, gap, items-center, justify-between
- ✅ Grid: grid, grid-cols-2, lg:grid-cols-3
- ✅ Spacing: p-4, md:p-6, gap-4, md:gap-6
- ✅ Colors: bg-primary, text-destructive, text-muted-foreground
- ✅ Responsive: hidden sm:block, hidden md:flex, lg:col-span-2
- ✅ Sizing: h-16, w-5, h-8
- ✅ Effects: shadow-sm, border, border-b
-
-
- 🎨 SONNER TOAST:
- ──────────────────────────────────────────────────────────────────────────
- ✅ toast.success() - Thành công
- ✅ toast.error() - Lỗi
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 📝 TODO / NEXT STEPS
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- 1.  ✅ CreateCustomerLayout (no sidebar)
- 2.  ✅ Create customer-header.jsx
- 3.  ✅ Create BookTablePage example
- 4.  📝 Add routes to App.jsx
- 5.  📝 Create other customer pages:
- - CustomerDashboardPage
- - MenuPage
- - OrdersPage
- - ProfilePage
- 6.  📝 API Integration:
- - Fetch user data from API
- - POST booking data
- - GET orders list
- 7.  📝 Authentication:
- - Protect /customer routes
- - Check user role
- - Redirect if not logged in
- 8.  📝 Notifications:
- - Connect notification API
- - Real-time updates (WebSocket)
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 🔗 FILE REFERENCES
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- Main Layout:
- src/layouts/CustomerLayout.jsx
-
- Header Component:
- src/components/layouts/customer-header.jsx
-
- Example Page:
- src/pages/Customer/BookTablePage.jsx
-
- Integration:
- src/App.jsx (Add routes here)
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// 🎓 LEARN MORE
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- Documentation:
- https://shadcn-ui.com/
- https://lucide.dev/
- https://tailwindcss.com/
- https://reactrouter.com/
- \*/

// ════════════════════════════════════════════════════════════════════════════════
// ✨ READY TO USE!
// ════════════════════════════════════════════════════════════════════════════════

/\*\*

-
- ✅ CustomerLayout hoàn thiện
- ✅ Header đầy đủ tính năng
- ✅ Ví dụ BookTablePage
- ✅ Code sạch, có comment tiếng Việt
- ✅ Responsive trên mọi thiết bị
- ✅ Sẵn sàng tích hợp API
-
- Bước tiếp theo: Thêm routes vào App.jsx và test!
- \*/
