const ACCESS_TOKEN_KEY = "adminAccessToken";
const REFRESH_TOKEN_KEY = "adminRefreshToken";
const PROFILE_KEY = "adminProfile";

export const getAdminAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) || "";

export const getAdminRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY) || "";

export const setAdminSession = ({ accessToken, refreshToken, admin }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (admin) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(admin));
  }
};

export const setAdminProfileCache = (admin) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(admin));
};

export const getAdminProfileCache = () => {
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

export const clearAdminSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
};

export const getAdminAuthHeaders = () => {
  const accessToken = getAdminAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

export const isAdminAuthenticated = () => Boolean(getAdminAccessToken());

export const ADMIN_STORAGE_KEYS = {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  PROFILE_KEY,
};
