function toggleDropdown(event, element) {
  event.preventDefault();

  const currentDropdownContainer = element.closest(".nav-dropdown");
  const currentMenu = currentDropdownContainer.querySelector(".dropdown-menu");
  const isOpen = currentMenu.classList.contains("show");

  // Đóng TẤT CẢ các menu khác trước (Tùy chọn: Nếu bạn muốn cho phép mở nhiều menu cùng lúc thì xóa đoạn này đi)
  document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
    menu.classList.remove("show");
  });
  document.querySelectorAll(".nav-dropdown.open").forEach((container) => {
    container.classList.remove("open");
  });

  // Nếu menu click vào đang đóng, thì mở nó ra (còn nếu nó đang mở sẵn thì nó sẽ tự đóng lại nhờ đoạn code trên)
  if (!isOpen) {
    currentMenu.classList.add("show");
    currentDropdownContainer.classList.add("open");
  }
}
