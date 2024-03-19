import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ApiToken,
  LoginCredentials,
  RegisterData,
  User,
} from 'src/components/models';
import { api } from 'src/boot/axios';

class AuthService {
  async me(dontTriggerLogout = false): Promise<User | null> {
    return api
      .get('auth/me', { dontTriggerLogout } as AxiosRequestConfig)
      .then((response: AxiosResponse<User>) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }
        //chcem aby aj v offline režime appka fungovala
        return null;
        return Promise.reject(error);
      });
  }

  async register(data: RegisterData): Promise<ApiToken> {
    const response = await api.post<ApiToken>('auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<ApiToken> {
      const response = await api.post<ApiToken>('auth/login', credentials);
      return response.data;
  }

  async googleLogin() {
    //await api.get('api/sessions/oauth/google');
    //window.open('http://127.0.0.1:3333/api/sessions/oauth/google', 'myWindow', 'width=500,height=500');
    location.href = 'http://127.0.0.1:3333/api/sessions/oauth/google'

}

  async logout(): Promise<void> {
    await api.post('auth/logout');
  }
}

export default new AuthService();
