import Table from "../../models/table.model.js";

// [GET] /admin/tables
export const getTables = async (req, res) => {
  const tables = await Table.find();
  // console.log("Tables: ", tables);
  res.json(tables);
};

// [POST] /admin/tables
export const createTable = async (req, res) => {
  const { tableNumber, area, capacity, status } = req.body;

  try {
    const newTable = new Table({
      tableNumber,
      area,
      capacity,
      status,
    });
    const savedTable = await newTable.save();
    res.status(201).json(savedTable);
  } catch (error) {
    console.error("Lỗi khi tạo bàn: ", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// [PUT] /admin/tables/:id
export const updateTable = async (req, res) => {
  const { id } = req.params;
  const { tableNumber, area, capacity, status } = req.body;

  try {
    const updatedTable = await Table.findByIdAndUpdate(
      id,
      { tableNumber, area, capacity, status },
      { new: true },
    );
    if (!updatedTable) {
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    }
    res.status(200).json(updatedTable);
  } catch (error) {
    console.error("Lỗi khi cập nhật bàn: ", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// [DELETE] /admin/tables/:id
export const deleteTable = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTable = await Table.findByIdAndDelete(id);
    if (!deletedTable) {
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    }
    res.status(200).json({ message: "Bàn đã được xoá thành công" });
  } catch (error) {
    console.error("Lỗi khi xoá bàn: ", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
