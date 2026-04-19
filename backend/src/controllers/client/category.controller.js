import Category from "../../models/category.model.js";
import Menu from "../../models/menu.model.js";
import { ok } from "../../utils/response.js";

const DEFAULT_CATEGORIES = [
  { name: "Khai vị", slug: "cat-appetizer", sortOrder: 1 },
  { name: "Món chính", slug: "cat-main", sortOrder: 2 },
  { name: "Đồ uống", slug: "cat-drink", sortOrder: 3 },
  { name: "Tráng miệng", slug: "cat-dessert", sortOrder: 4 },
];

const toCategoryResponse = (category) => ({
  id: category.slug || String(category._id),
  name: category.name,
  slug: category.slug,
  sortOrder: category.sortOrder,
  active: category.active,
});

export const getCategories = async (_req, res) => {
  let categories = await Category.find({ active: true }).sort({
    sortOrder: 1,
    name: 1,
  });

  if (categories.length === 0) {
    const menuCategoryNames = await Menu.distinct("categoryId");
    const fallback =
      menuCategoryNames.length > 0
        ? menuCategoryNames
        : DEFAULT_CATEGORIES.map((category) => category.slug);

    categories = fallback.map((name, index) => ({
      _id: String(name),
      name: DEFAULT_CATEGORIES[index]?.name || String(name),
      slug: DEFAULT_CATEGORIES[index]?.slug || String(name).toLowerCase(),
      sortOrder: index + 1,
      active: true,
    }));
  }

  return ok(
    res,
    { categories: categories.map(toCategoryResponse) },
    "Lấy danh mục thành công",
  );
};
