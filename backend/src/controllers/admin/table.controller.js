import Table from "../../models/table.model.js";
import { created, fail, ok, sendSuccess } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "tableNumber",
  "capacity",
];
const ALLOWED_STATUSES = ["available", "occupied", "reserved", "cleaning"];

const parsePage = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
};

const parseLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
};

const parseSort = (sortBy, sortOrder) => {
  const nextSortBy = ALLOWED_SORT_FIELDS.includes(String(sortBy))
    ? String(sortBy)
    : "createdAt";
  const direction = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
  return { [nextSortBy]: direction };
};

// [GET] /admin/tables
export const getTables = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;
    const shouldPaginate =
      req.query.page !== undefined || req.query.limit !== undefined;

    const query = {};

    if (
      req.query.status &&
      ALLOWED_STATUSES.includes(String(req.query.status))
    ) {
      query.status = String(req.query.status);
    }

    if (req.query.area) {
      const area = String(req.query.area).trim();
      if (area) {
        query.area = new RegExp(area, "i");
      }
    }

    if (req.query.keyword) {
      const keyword = String(req.query.keyword).trim();
      if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [{ tableNumber: regex }, { area: regex }];
      }
    }

    const sort = parseSort(req.query.sortBy, req.query.sortOrder);

    const [total, tables] = await Promise.all([
      Table.countDocuments(query),
      shouldPaginate
        ? Table.find(query).sort(sort).skip(skip).limit(limit)
        : Table.find(query).sort(sort),
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách bàn thành công",
      data: { tables },
      meta: {
        page: shouldPaginate ? page : 1,
        limit: shouldPaginate ? limit : tables.length,
        total,
        totalPages: shouldPaginate ? Math.max(1, Math.ceil(total / limit)) : 1,
        sortBy: Object.keys(sort)[0],
        sortOrder: Object.values(sort)[0] === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    logger.error("Không thể lấy danh sách bàn", { message: error?.message });
    return fail(res, 500, "Lỗi máy chủ", "TABLE_LIST_FAILED");
  }
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
    return created(res, { table: savedTable }, "Thêm bàn thành công");
  } catch (error) {
    logger.error("Lỗi khi tạo bàn", { message: error?.message });
    return fail(res, 500, "Lỗi máy chủ", "TABLE_CREATE_FAILED");
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
      return fail(res, 404, "Không tìm thấy bàn", "TABLE_NOT_FOUND");
    }
    return ok(res, { table: updatedTable }, "Cập nhật bàn thành công");
  } catch (error) {
    logger.error("Lỗi khi cập nhật bàn", {
      message: error?.message,
      tableId: id,
    });
    return fail(res, 500, "Lỗi máy chủ", "TABLE_UPDATE_FAILED");
  }
};

// [DELETE] /admin/tables/:id
export const deleteTable = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTable = await Table.findByIdAndDelete(id);
    if (!deletedTable) {
      return fail(res, 404, "Không tìm thấy bàn", "TABLE_NOT_FOUND");
    }
    return ok(res, {}, "Bàn đã được xoá thành công");
  } catch (error) {
    logger.error("Lỗi khi xoá bàn", { message: error?.message, tableId: id });
    return fail(res, 500, "Lỗi máy chủ", "TABLE_DELETE_FAILED");
  }
};
