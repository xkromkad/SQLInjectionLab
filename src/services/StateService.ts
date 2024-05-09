import { api } from 'src/boot/axios';

class StateService {
  async saveState(state: string): Promise<void> {
    await api.post('state', {
      state: state,
    });
  }

  async loadState(): Promise<[] | null> {
    const response = await api.get('state');
    return response.data.json;
  }
}

export default new StateService();
