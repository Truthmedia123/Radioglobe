export interface CarPlayState {
  isConnected: boolean;
  isCarPlayActive: boolean;
  isAndroidAutoActive: boolean;
}

class WebCarPlayService {
  async init(): Promise<boolean> {
    return false;
  }

  getState(): CarPlayState {
    return {
      isConnected: false,
      isCarPlayActive: false,
      isAndroidAutoActive: false,
    };
  }
}

export const carPlayService = new WebCarPlayService();
