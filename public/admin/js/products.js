// Change satus
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonsChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector("#form-change-status");
  const path = formChangeStatus.getAttribute("data-path");
  // console.log(path);

  buttonsChangeStatus.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const currentStatus = button.getAttribute("data-status");
      const newStatus = currentStatus == "active" ? "inactive" : "active";
      // console.log(id, currentStatus, newStatus);

      const action = path + `/${newStatus}/${id}?_method=PATCH`;
      // console.log(action);
      formChangeStatus.action = action;
      formChangeStatus.submit();
    });
  });
}
// End Change satus

// Delete item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
  const formDelete = document.querySelector("#form-delete-item");
  const path = formDelete.getAttribute("data-path");

  buttonsDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc muốn xoá sản phẩm này không?");

      if (isConfirm) {
        const id = button.getAttribute("data-id");
        const action = path + `/${id}?_method=DELETE`;
        formDelete.action = action;
        console.log(action);
        formDelete.submit();
      }
    });
  });
}
// End Delete item
