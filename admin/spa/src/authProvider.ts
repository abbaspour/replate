import { AuthProvider } from 'react-admin';
import { ensureAuthenticated, getAccessToken, logout } from './auth';

export const authProvider: AuthProvider = {
  login: async () => {
    await ensureAuthenticated();
    return Promise.resolve();
  },
  logout: async () => {
    await logout();
    return Promise.resolve();
  },
  checkAuth: async () => {
    try {
      await ensureAuthenticated();
      await getAccessToken();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  },
  checkError: async (error: any) => {
    const status = error?.status || error?.statusCode;
    if (status === 401) {
      return Promise.reject({ redirectTo: '/login' });
    }
    return Promise.resolve();
  },
  getPermissions: async () => Promise.resolve(''),
  getIdentity: async () => Promise.resolve({ id: 'me', fullName: 'Admin' }),
};
