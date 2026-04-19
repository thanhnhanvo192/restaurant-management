import Category from "../../models/category.model.js";
import Menu from "../../models/menu.model.js";
import { ok } from "../../utils/response.js";

const DEFAULT_CATEGORY_LABELS = {
  "cat-appetizer": "Khai vị",
  "cat-main": "Món chính",
  "cat-drink": "Đồ uống",
  "cat-dessert": "Tráng miệng",
};

const toMenuResponse = (menu, categoryName = "") => ({
  id: menu._id,
  name: menu.name,
  categoryId: menu.categoryId,
  category: categoryName,
  price: menu.price,
  image: menu.imageUrl || "",
  imageUrl: menu.imageUrl || "",
  description: menu.description || "",
  available: menu.available,
  soldCount: menu.soldCount,
});

export const getMenus = async (_req, res) => {
  const [menus, categories] = await Promise.all([
    Menu.find().sort({ createdAt: -1 }),
    Category.find(),
  ]);

  const categoryMap = new Map();

  categories.forEach((category) => {
    categoryMap.set(String(category._id), category.name);
    categoryMap.set(String(category.slug || "").toLowerCase(), category.name);
  });

  return ok(
    res,
    {
      menus: menus.map((menu) =>
        toMenuResponse(
          menu,
          categoryMap.get(String(menu.categoryId).toLowerCase()) ||
            categoryMap.get(String(menu.categoryId)) ||
            DEFAULT_CATEGORY_LABELS[String(menu.categoryId).toLowerCase()] ||
            menu.categoryId,
        ),
      ),
    },
    "Lấy thực đơn thành công",
  );
};
