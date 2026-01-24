import { jwtDecode } from "jwt-decode";

export function useToken() {
  const getToken = () => localStorage.getItem("token");

  const saveToken = (token) => {
    localStorage.setItem("token", token);
  };

  const removeToken = () => {
    localStorage.clear("token");
  };

  const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const getUserRole = () => {
    try {
      const token = getToken();
      return jwtDecode(token)?.role;
    } catch {
      return null;
    }
  };

  return {
    getToken,
    saveToken,
    removeToken,
    isTokenValid,
    getUserRole,
  };
}
