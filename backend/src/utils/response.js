const nowIso = () => new Date().toISOString();

export const sendSuccess = (
  res,
  { statusCode = 200, message = "Thành công", data = {}, meta } = {},
) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: nowIso(),
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res,
  {
    statusCode = 500,
    message = "Đã xảy ra lỗi",
    code = "INTERNAL_ERROR",
    details,
  } = {},
) => {
  const error = { code };
  if (details !== undefined) {
    error.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error,
    timestamp: nowIso(),
  });
};

export const ok = (res, data = {}, message = "Thành công") =>
  sendSuccess(res, { statusCode: 200, message, data });

export const created = (res, data = {}, message = "Tạo thành công") =>
  sendSuccess(res, { statusCode: 201, message, data });

export const fail = (
  res,
  statusCode,
  message,
  code = "REQUEST_FAILED",
  details,
) => sendError(res, { statusCode, message, code, details });
