import Menu from "../../models/menu.model.js";

// [GET] /admin/menus
export const getMenus = async (req, res) => {
  const menus = await Menu.find();
  res.status(200).json({ menus });
};

// [POST] /admin/menus
export const createMenu = async (req, res) => {
  try {
    const { name, description, price, categoryId, category } = req.body;

    const normalizedCategoryId = categoryId || category;
    const normalizedImageUrl = req.file
      ? `/uploads/menus/${req.file.filename}`
      : "";

    if (
      !name ||
      !normalizedCategoryId ||
      price === undefined ||
      price === null
    ) {
      return res.status(400).json({
        message: "Thiếu dữ liệu bắt buộc: name, price, categoryId",
      });
    }

    const newMenu = new Menu({
      name,
      description,
      price,
      categoryId: normalizedCategoryId,
      imageUrl: normalizedImageUrl,
    });

    await newMenu.save();

    res
      .status(201)
      .json({ message: "Menu created successfully", menu: newMenu });
  } catch (error) {
    console.error("Error creating menu: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
