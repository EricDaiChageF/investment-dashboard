import api from './api';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export const authApi = {
  login: (params: LoginParams) =>
    api.post<LoginResponse>('/auth/login', params),
  
  register: (params: LoginParams) =>
    api.post('/auth/register', params),
};