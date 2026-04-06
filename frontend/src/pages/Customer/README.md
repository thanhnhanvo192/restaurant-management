/\*\*

- ╔═══════════════════════════════════════════════════════════════════════════╗
- ║ CUSTOMER LAYOUT - HOÀN THIỆN ║
- ║ Senior Frontend Developer - React + Tailwind CSS ║
- ╚═══════════════════════════════════════════════════════════════════════════╝
-
- 📌 TỔNG HỢP CÔNG VIỆC ĐÃ HOÀN THÀNH
- ────────────────────────────────────────────────────────────────────────────
  \*/

// ═══════════════════════════════════════════════════════════════════════════
// 📁 FILE STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- src/
- ├── layouts/
- │ ├── CustomerLayout.jsx ............................ ✅ HOÀN THÀNH
- │ │ └─ Wrapper layout chính cho khách hàng
- │ │ Bao gồm: SidebarProvider + Sidebar + Header + Content
- │ │
- │ ├── CUSTOMER_LAYOUT_USAGE.md ...................... ✅ HOÀN THÀNH
- │ │ └─ Hướng dẫn chi tiết cách sử dụng & custom
- │ │
- │ └── AdminLayout.jsx ............................... (Sẵn có)
- │
- ├── components/
- │ └── layouts/
- │ ├── customer-sidebar.jsx ...................... ✅ HOÀN THÀNH
- │ │ └─ Sidebar trái: Logo + Menu navigation
- │ │ Menu items: Dashboard, Booking, Menu, Orders, Profile
- │ │
- │ ├── customer-site-header.jsx ................. ✅ HOÀN THÀNH
- │ │ └─ Header bên trên
- │ │ Bên trái: Menu trigger + Title
- │ │ Bên phải: Notification + Logout
- │ │
- │ ├── nav-documents.jsx ......................... (Sẵn có)
- │ ├── nav-user.jsx .............................. (Sẵn có)
- │ └── app-sidebar.jsx ........................... (Sẵn có)
- │
- └── pages/
-     └── Customer/
-         ├── CustomerDashboardPage.jsx ................ ✅ HOÀN THÀNH
-         │   └─ Dashboard chính
-         │      - Quick actions cards
-         │      - Recent orders list
-         │
-         ├── BookingPage.jsx ........................... ✅ HOÀN THÀNH
-         │   └─ Đặt bàn
-         │      - Date picker
-         │      - Time slots
-         │      - Guest count
-         │      - Notes
-         │
-         ├── MenuPage.jsx ............................. ✅ HOÀN THÀNH
-         │   └─ Thực đơn & Gọi món
-         │      - Menu items grid
-         │      - Search & filter
-         │      - Shopping cart
-         │
-         ├── OrderHistoryPage.jsx ..................... ✅ HOÀN THÀNH
-         │   └─ Lịch sử đơn hàng
-         │      - Stats: Total spent, Orders count, Avg rating
-         │      - Search & filter
-         │      - Order details (expandable)
-         │
-         ├── ProfilePage.jsx .......................... ✅ HOÀN THÀNH
-         │   └─ Thông tin cá nhân
-         │      - Tabs: Profile, Addresses, Security
-         │      - Edit profile
-         │      - Change password
-         │      - Notification settings
-         │
-         └── ManageCustomersPage.jsx .................. (Sẵn có - Admin page)
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CÁC TÍNH NĂNG ĐÃ IMPLEMENT
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- ✅ LAYOUT STRUCTURE
- ─────────────────────────────────────────────────────────────────────────
-
- 1.  Sidebar trái (Collapsible)
- - Logo nhà hàng (UtensilsCrossed icon + text "Nhà hàng ABC")
- - Menu items với icons từ lucide-react
- - User dropdown (NavUser) ở footer
- - Responsive: Offcanvas trên mobile, fixed trên desktop
-
- 2.  Header trên (Fixed)
- - Bên trái: Hamburger menu (SidebarTrigger) + Title
- - Bên phải: Notification bell + Logout button
- - Height cố định: --header-height
-
- 3.  Main Content
- - Sử dụng <SidebarInset> để responsive layout
- - Padding: px-4 py-4 (mobile), px-6 py-6 (desktop)
- - Flex layout: flex-col, gap-4 (md:gap-6)
- - Outlet cho React Router
-
- ✅ NAVIGATION MENU
- ─────────────────────────────────────────────────────────────────────────
-
- 1.  Trang chủ (Dashboard) → /customer/dashboard
- Icon: LayoutDashboard (LucideIcon)
-
- 2.  Đặt bàn (Booking) → /customer/booking
- Icon: UtensilsCrossed (LucideIcon)
-
- 3.  Thực đơn & Gọi món (Menu) → /customer/menu
- Icon: Menu (LucideIcon)
-
- 4.  Lịch sử đơn hàng (Orders) → /customer/orders
- Icon: ListOrdered (LucideIcon)
-
- 5.  Thông tin cá nhân (Profile) → /customer/profile
- Icon: UserCircle (LucideIcon)
-
- ✅ PAGES FEATURES
- ─────────────────────────────────────────────────────────────────────────
-
- CustomerDashboardPage:
- - Welcome message
- - Quick action cards (4 items)
- - Recent orders section with mock data
- - Navigation to other pages
-
- BookingPage:
- - Form validation
- - Date picker (min: today)
- - Time slots dropdown (11:00 - 20:00)
- - Guest count (1-10+)
- - Notes textarea
- - Operating hours info sidebar
- - Tips card
- - Toast notifications
-
- MenuPage:
- - Menu items grid (8 mock items)
- - Search by name
- - Filter by category (5 categories)
- - Sort by: Name, Price (asc/desc)
- - Shopping cart with quantity controls
- - Cart total calculation
- - Add/Remove items with toasts
-
- OrderHistoryPage:
- - Stats cards (Total spent, Orders count, Avg rating)
- - Search by order ID
- - Filter by status (Completed, Pending, Cancelled)
- - Expandable order cards
- - Order items list
- - Rating display
- - Action buttons (Details, Reorder)
- - Mock data: 5 orders
-
- ProfilePage:
- - Tab system (3 tabs: Profile, Addresses, Security)
- - Profile info with avatar and edit mode
- - Address management (add/edit/delete/set default)
- - Change password form
- - Notification settings (3 checkboxes)
- - Logout card (red themed)
- - Form validation & toast feedback
-
- ✅ UI COMPONENTS USED
- ─────────────────────────────────────────────────────────────────────────
-
- From Shadcn/ui:
- - Sidebar (collapsible="offcanvas")
- - SidebarProvider, SidebarInset
- - SidebarHeader, SidebarContent, SidebarFooter
- - SidebarMenu, SidebarMenuButton, SidebarMenuItem
- - Button (variant, size props)
- - Card, CardContent, CardDescription, CardHeader, CardTitle
- - Input, Label, Textarea
- - Badge (variant: default, outline, destructive, secondary)
- - Avatar, AvatarFallback, AvatarImage
- - Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- - Separator
- - Tabs, TabsContent, TabsList, TabsTrigger
- - DropdownMenu components
- - SidebarTrigger
-
- From Lucide React:
- - LayoutDashboard, UtensilsCrossed, Menu, ListOrdered, UserCircle
- - Calendar, Clock, Users, Zap, Bell, LogOut, Camera
- - Plus, Minus, Search, Filter, ShoppingCart, FileText
- - TrendingUp, User, Lock, MapPin, Pencil, Trash2
- - LucideIcon (type)
-
- From Sonner:
- - toast.success(), toast.error()
-
- ✅ STYLING & RESPONSIVE
- ─────────────────────────────────────────────────────────────────────────
-
- - Tailwind CSS: All styling using classes
- - Responsive breakpoints: sm, md, lg, xl
- - CSS Grid: grid-cols-2 (sm), grid-cols-3/4 (md/lg)
- - Flexbox: gap, justify-between, items-center, etc.
- - Colors: primary, secondary, destructive, muted, background
- - Shadows: hover:shadow-lg, shadow-md
- - Transitions: hover effects, smooth animations
- - Mobile-first approach: Classes override at breakpoints
-
- Examples:
- - "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
- - "flex items-center justify-between"
- - "text-sm md:text-base lg:text-lg"
- - "hidden sm:inline"
- - "px-4 py-4 md:px-6 md:py-6"
-
- ✅ STATE MANAGEMENT
- ─────────────────────────────────────────────────────────────────────────
-
- Using React Hooks:
- - useState: Form data, filters, selections
- - No Redux/Context (Simple component state)
- - Props: Passed between components
-
- Features:
- - Form validation
- - Search & filter logic
- - Cart calculations
- - Modal/Tab switching
- - Edit mode toggling
-
- ✅ INTERACTIVITY
- ─────────────────────────────────────────────────────────────────────────
-
- User Actions:
- - Navbar navigation (React Router <Link>)
- - Form submission (preventDefault, validation)
- - Search input (real-time filtering)
- - Sorting dropdown
- - Cart item quantity +/- buttons
- - Expandable cards
- - Tab switching
- - Modal open/close
- - Edit mode toggle
-
- Feedback:
- - Toast notifications (Sonner)
- - Form error messages
- - Empty states
- - Loading states (TODO: Add in API phase)
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 QUICK START
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- 1️⃣ COPY IMPORTS & ROUTES INTO App.jsx
- ─────────────────────────────────────────────────────────────────────────
-
- See: src/App.jsx.example for complete code
-
- Import the layout and pages:
-     import CustomerLayout from "./layouts/CustomerLayout";
-     import CustomerDashboardPage from "./pages/Customer/CustomerDashboardPage";
-     import BookingPage from "./pages/Customer/BookingPage";
-     import OrderHistoryPage from "./pages/Customer/OrderHistoryPage";
-     import ProfilePage from "./pages/Customer/ProfilePage";
-     import MenuPage from "./pages/Customer/MenuPage";
-
- Add routes:
-     <Route path="/customer" element={<CustomerLayout />}>
-       <Route path="dashboard" element={<CustomerDashboardPage />} />
-       <Route path="booking" element={<BookingPage />} />
-       <Route path="menu" element={<MenuPage />} />
-       <Route path="orders" element={<OrderHistoryPage />} />
-       <Route path="profile" element={<ProfilePage />} />
-     </Route>
-
-
- 2️⃣ TEST THE LAYOUT
- ─────────────────────────────────────────────────────────────────────────
-
- Run dev server:
-     npm run dev
-
- Navigate to:
-     http://localhost:5173/customer/dashboard
-
- Expected:
-     - Sidebar on left with logo & menu
-     - Header on top with hamburger, title, notification, logout
-     - Main content area showing CustomerDashboardPage
-     - Responsive: Menu toggles on mobile
-
-
- 3️⃣ CUSTOMIZE FOR YOUR NEEDS
- ─────────────────────────────────────────────────────────────────────────
-
- Change restaurant name:
-     File: src/components/layouts/customer-sidebar.jsx
-     Line: <span className="text-base font-semibold">Nhà hàng ABC</span>
-     → Change "Nhà hàng ABC" to real name
-
- Change avatar:
-     File: src/components/layouts/customer-sidebar.jsx
-     avatar: "/avatars/customer.jpg"
-     → Change path to real image
-
- Change Logout behavior:
-     File: src/components/layouts/customer-site-header.jsx
-     const handleLogout = () => { ... }
-     → Add API call, clear token, redirect, etc.
-
- Add more menu items:
-     File: src/components/layouts/customer-sidebar.jsx
-     data.menuItems array
-     → Add new menu objects with name, url, icon
-
-
- 4️⃣ CONNECT TO API (NEXT PHASE)
- ─────────────────────────────────────────────────────────────────────────
-
- Replace mock data with API calls:
-
- BookingPage:
-     POST /api/bookings
-     Submit form data to server
-
- MenuPage:
-     GET /api/menu-items
-     GET /api/categories
-     POST /api/carts/items (add to cart)
-
- OrderHistoryPage:
-     GET /api/orders (list with pagination)
-     GET /api/orders/:id (details)
-
- ProfilePage:
-     GET /api/profile (fetch user data)
-     PUT /api/profile (update info)
-     POST /api/auth/change-password
-     PUT /api/profile/addresses
-     DELETE /api/profile/addresses/:id
-
- CustomerDashboardPage:
-     GET /api/orders?limit=3 (recent orders)
-     GET /api/stats (stats cards)
-
-
- 5️⃣ AUTHENTICATION PROTECTION (OPTIONAL)
- ─────────────────────────────────────────────────────────────────────────
-
- Add ProtectedRoute wrapper:
-
-     <Route path="/customer" element={
-       <ProtectedRoute requiredRole="customer">
-         <CustomerLayout />
-       </ProtectedRoute>
-     }>
-       ...
-     </Route>
-
- Or middleware in routes:
-     Check token in localStorage
-     Redirect to /login if not authenticated
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 📋 CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- ✅ Layout & Components
- ✅ CustomerLayout.jsx (Main wrapper)
- ✅ customer-sidebar.jsx (Sidebar with navigation)
- ✅ customer-site-header.jsx (Header with notifications & logout)
-
- ✅ Pages (5 complete pages)
- ✅ CustomerDashboardPage.jsx
- ✅ BookingPage.jsx
- ✅ MenuPage.jsx
- ✅ OrderHistoryPage.jsx
- ✅ ProfilePage.jsx
-
- ✅ Features
- ✅ Responsive sidebar (collapsible on mobile)
- ✅ Fixed header with actions
- ✅ Navigation menu (5 items)
- ✅ Search & filter (Menu, Orders)
- ✅ Shopping cart (MenuPage)
- ✅ Form handling (Booking, Profile)
- ✅ Tabs & modals
- ✅ Toast notifications
- ✅ Stats cards
- ✅ Mock data
-
- 📝 TODO (Next Phase)
- ☐ API integration
- ☐ Authentication & authorization
- ☐ Loading states
- ☐ Error handling
- ☐ Form validation (more advanced)
- ☐ Image optimization
- ☐ Pagination (for large datasets)
- ☐ Real-time updates (WebSocket)
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 📚 DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- Detailed Documentation:
- └─ src/layouts/CUSTOMER_LAYOUT_USAGE.md
- Includes:
- - Directory structure
- - How to use in App.jsx
- - Layout structure diagram
- - Menu items list
- - Customization guide
- - Code examples for child pages
- - Component reuse explanation
- - Next steps
-
- App.jsx Integration Example:
- └─ src/App.jsx.example
- Includes:
- - Complete imports
- - All routes
- - URL mapping
- - Configuration notes
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 🎓 LEARNING RESOURCES
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- Shadcn/ui Documentation:
-     https://ui.shadcn.com/
-     - Sidebar component
-     - All UI components used
-
- Lucide React Icons:
-     https://lucide.dev/
-     - 200+ icons available
-
- Tailwind CSS:
-     https://tailwindcss.com/
-     - Responsive design
-     - Utility-first CSS
-
- React Router:
-     https://reactrouter.com/
-     - Navigation & routing
-     - Nested routes
-     - Outlet component
-
- Sonner Toast:
-     https://sonner.emilkowal.ski/
-     - Toast notifications
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 💡 TIPS & BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- 1.  Keep Components Focused
- ✓ Each page file handles one feature
- ✓ Sidebar & Header are reusable
- ✓ Use <Outlet> for nested routes
-
- 2.  Use Responsive Tailwind Classes
- ✓ Mobile-first: base styles first
- ✓ Override at breakpoints: md:, lg:, xl:
- ✓ Example: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
-
- 3.  Reuse Components
- ✓ Shadcn components are composable
- ✓ Card, Button, etc. already styled
- ✓ Combine with Tailwind for custom layouts
-
- 4.  State Management
- ✓ Use useState for component state
- ✓ Lift state up if shared between pages
- ✓ Consider Context API for global state (user info)
-
- 5.  Validation
- ✓ Validate on client-side (UX)
- ✓ Always validate on server (security)
- ✓ Show error messages to users
-
- 6.  Performance
- ✓ Use React.memo() for expensive renders
- ✓ useMemo/useCallback for optimization
- ✓ Lazy load routes with React.lazy()
-
- 7.  Accessibility
- ✓ Use semantic HTML (button, label, form)
- ✓ Add aria-labels where needed
- ✓ Keyboard navigation (tabindex, focus)
- ✓ Test with screen readers
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 📞 SUPPORT
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- Questions or issues?
-
- 1.  Check CUSTOMER_LAYOUT_USAGE.md for detailed guide
- 2.  Review App.jsx.example for integration
- 3.  Check Shadcn/ui & Tailwind docs
- 4.  Debug with Redux DevTools / React DevTools
- 5.  Use browser console for errors
- \*/

// ═══════════════════════════════════════════════════════════════════════════
// 🎉 SUẤT HÀN - HAPPY CODING!
// ═══════════════════════════════════════════════════════════════════════════

/\*\*

-
- Tất cả các files đã sẵn sàng!
-
- ✅ Layout được thiết kế với best practices
- ✅ 5 trang hoàn chỉnh với tất cả tính năng
- ✅ Code sạch, có comment chi tiết
- ✅ Responsive trên mọi thiết bị
- ✅ Sẵn sàng tích hợp API
-
- Bước tiếp theo: Thêm routes vào App.jsx và test!
- \*/
