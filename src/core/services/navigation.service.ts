import { type IApiService } from "./api.service";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { appLogger } from "@/lib/logger";
import {
  NavigationData,
  MenuItemsResponse,
  NavigationMapper,
} from "@/domain";

export interface INavigationService {
  fetchMenuItems(): Promise<NavigationData>;
  getNavigationData(): NavigationData | null;
  hasPageAccess(pathname: string): boolean;
  getAllowedPages(): string[];
  clearNavigationData(): void;
  convertToNavigationItems(): any[];
}

export class NavigationService implements INavigationService {
  private navigationData: NavigationData | null = null;

  constructor(private readonly apiService: IApiService) {}

  /**
   * Fetch menu items from the backend
   */
  async fetchMenuItems(): Promise<NavigationData> {
    try {
      const response = await this.apiService.get<any>(API_ENDPOINTS.GET_MENU_ITEMS);
      
      appLogger.debug('Navigation API Response:', response);
      
      // Use mapper to handle different response formats
      const navigationData = NavigationMapper.handleApiResponse(response);
      
      this.navigationData = navigationData;
      
      appLogger.debug('Processed navigation data:', navigationData);
      return navigationData;
    } catch (error) {
      appLogger.error('Error fetching menu items:', error);
      throw error;
    }
  }

  /**
   * Get cached navigation data
   */
  getNavigationData(): NavigationData | null {
    return this.navigationData;
  }

  /**
   * Check if user has access to a specific page
   */
  hasPageAccess(pathname: string): boolean {
    if (!this.navigationData) {
      return false;
    }

    return this.navigationData.hasPageAccess(pathname);
  }

  /**
   * Get allowed pages list
   */
  getAllowedPages(): string[] {
    return this.navigationData?.allowedPages || [];
  }

  /**
   * Clear cached navigation data (used on logout)
   */
  clearNavigationData(): void {
    this.navigationData = null;
  }

  /**
   * Convert backend menu items to frontend navigation format
   */
  convertToNavigationItems(): any[] {
    if (!this.navigationData) {
      return [];
    }

    return this.navigationData.menuItems.map(item => 
      NavigationMapper.menuItemToPlainObject(item)
    );
  }
}