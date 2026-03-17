module.exports = async (objectPagination, query, countProducts) => {
  if (query.page) {
    objectPagination.currentPage = parseInt(query.page);
  }
  objectPagination.skip =
    (objectPagination.currentPage - 1) * objectPagination.limitItem;
  const totalPage = countProducts / objectPagination.limitItem;
  objectPagination.totalPage = Math.ceil(totalPage);

  return objectPagination;
};
