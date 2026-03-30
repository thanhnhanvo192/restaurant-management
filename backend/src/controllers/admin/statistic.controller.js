//[GET] /admin/statistics
export const getStatistics = async (req, res) => {
  res.status(200).json({ statistics: [] });
};
