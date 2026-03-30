// [GET] /admin/dashboard
export const getDashboardData = async (req, res) => {
  res.status(200).json({ message: "Dashboard data" });
};
