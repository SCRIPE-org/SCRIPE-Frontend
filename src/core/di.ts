import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { NotificationService } from './services/notification.service';

// 1. Interfaces
export interface IApiService {
      get<T>(url: string, params?: unknown): Promise<T>;
      post<T>(url: string, data?: unknown): Promise<T>;
      put<T>(url: string, data?: unknown): Promise<T>;
      delete<T>(url: string): Promise<T>;
}

// 2. Implementation (Axios)
export class ApiService implements IApiService {
      private client: AxiosInstance;

      constructor() {
            this.client = axios.create({
                  baseURL: process.env.NEXT_PUBLIC_API_URL,
                  headers: {
                        'Content-Type': 'application/json',
                  },
            });

            // Add interceptors here if needed
            this.client.interceptors.response.use(
                  (response) => response,
                  (error) => {
                        // Global error handling
                        return Promise.reject(error);
                  }
            );
      }

      async get<T>(url: string, params?: unknown): Promise<T> {
            const config: AxiosRequestConfig = { params };
            const response = await this.client.get<T>(url, config);
            return response.data;
      }

      async post<T>(url: string, data?: unknown): Promise<T> {
            const response = await this.client.post<T>(url, data);
            return response.data;
      }

      async put<T>(url: string, data?: unknown): Promise<T> {
            const response = await this.client.put<T>(url, data);
            return response.data;
      }

      async delete<T>(url: string): Promise<T> {
            const response = await this.client.delete<T>(url);
            return response.data;
      }
}

// 3. Container Interface
export interface CoreContainer {
      apiService: IApiService;
      notificationService: NotificationService;
}

// 4. Singleton
let container: CoreContainer | null = null;

export function getCoreContainer(): CoreContainer {
      if (!container) {
            container = {
                  apiService: new ApiService(),
                  notificationService: new NotificationService(),
            };
      }
      return container;
}
