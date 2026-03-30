import Menu from "../../models/menu.model.js";

// [GET] /admin/menus
export const getMenus = async (req, res) => {
  const menus = await Menu.find();
  console.log("Menus: ", menus);
  res.status(200).json({ menus });
};
