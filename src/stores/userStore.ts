// stores/userStore.ts
import { defineStore } from 'pinia';
import { User } from 'src/components/models';
import { LoginCredentials, RegisterData } from 'src/components/models';
import { authManager, authService } from 'src/services';

export const useUserStore = defineStore('user', {
  state: (): AuthStateInterface => {
    return {
      user: null,
      status: 'pending',
      errors: [],
      userStatus: 'ONLINE',
    };
  },
  actions: {
    async googleLogin() {
      try {
        const apiToken = await authService.googleLogin();
        // save api token to local storage and notify listeners
        //authManager.setToken(apiToken.token);
        return apiToken;
      } catch (err) {
        throw err;
      }
    },

    async login(credentials: LoginCredentials) {
      try {
        const apiToken = await authService.login(credentials);
        // save api token to local storage and notify listeners
        authManager.setToken(apiToken.token);
        return apiToken;
      } catch (err) {
        throw err;
      }
    },
    async register (form: RegisterData) {
      try {
        //commit('AUTH_START')
        const apiToken = await authService.register(form)
        authManager.setToken(apiToken.token);
        //commit('AUTH_SUCCESS', null)
        return apiToken
      } catch (err) {
        //commit('AUTH_ERROR', err)
        throw err
      }
    },
    async check(): Promise<boolean> {
      try {
        const user = await authService.me();
        if (user !== null) {
          this.user = user
        }
        return user !== null;
      } catch (err) {
        throw err;
      }
    },
    async logout () {
      try {
        await authService.logout()
        this.user = null,
        //await dispatch('chat/leaveSockets', { channel: null, clearChannelData: true }, { root: true })
        //commit('chat/SET_USER_STATUSES', {}, { root: true })
        //commit('AUTH_SUCCESS', null)
        // remove api token and notify listeners
        authManager.removeToken()
      } catch (err) {
        //commit('AUTH_ERROR', err)
        console.log(err)
        throw err
      }
    },
  },
});


export interface AuthStateInterface {
  user: User | null;
  status: 'pending' | 'success' | 'error';
  errors: { message: string; field?: string }[];
  userStatus: 'ONLINE' | 'OFFLINE' | 'DND';
}
