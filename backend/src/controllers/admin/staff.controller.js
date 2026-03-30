import Staff from "../../models/staff.model.js";

// [GET] /admin/staff
export const getStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find();
    console.log(staffs); // Debug log
    res.status(200).json({ staffs });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách nhân viên" });
  }
};
