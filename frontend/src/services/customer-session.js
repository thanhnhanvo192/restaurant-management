const ACCESS_TOKEN_KEY = "customerAccessToken";
const REFRESH_TOKEN_KEY = "customerRefreshToken";
const PROFILE_KEY = "customerProfile";

export const getCustomerAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) || "";

export const getCustomerRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY) || "";

export const setCustomerSession = ({ accessToken, refreshToken, customer }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (customer) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(customer));
  }
};

export const setCustomerProfileCache = (customer) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(customer));
};

export const getCustomerProfileCache = () => {
  const cachedProfile = localStorage.getItem(PROFILE_KEY);

  if (!cachedProfile) {
    return null;
  }

  try {
    return JSON.parse(cachedProfile);
  } catch {
    return null;
  }
};

export const clearCustomerSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
};

export const getCustomerAuthHeaders = () => {
  const accessToken = getCustomerAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

export const CUSTOMER_STORAGE_KEYS = {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  PROFILE_KEY,
};
