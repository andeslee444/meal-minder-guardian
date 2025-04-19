import { ROUTES } from './constants';

/**
 * Interface for a route configuration
 */
export interface RouteConfig {
  path: string;
  name: string;
  label: string;
  icon?: string;
  showInNav?: boolean;
  protected?: boolean;
}

/**
 * Application routes configuration
 */
export const routes: RouteConfig[] = [
  {
    path: ROUTES.HOME,
    name: 'home',
    label: 'Home',
    icon: 'home',
    showInNav: true,
  },
  {
    path: ROUTES.RECIPES,
    name: 'recipes',
    label: 'Recipes',
    icon: 'recipe',
    showInNav: true,
  },
  {
    path: ROUTES.RECIPE_DETAIL,
    name: 'recipe-detail',
    label: 'Recipe Detail',
    showInNav: false,
  },
  {
    path: ROUTES.INVENTORY,
    name: 'inventory',
    label: 'Inventory',
    icon: 'inventory',
    showInNav: true,
  },
  {
    path: ROUTES.FAVORITES,
    name: 'favorites',
    label: 'Favorites',
    icon: 'favorite',
    showInNav: true,
  },
  {
    path: ROUTES.SETTINGS,
    name: 'settings',
    label: 'Settings',
    icon: 'settings',
    showInNav: true,
  },
];

/**
 * Get a route by name
 *
 * @param name Route name
 * @returns The route configuration or undefined if not found
 */
export const getRouteByName = (name: string): RouteConfig | undefined => {
  return routes.find(route => route.name === name);
};

/**
 * Get a route by path
 *
 * @param path Route path
 * @returns The route configuration or undefined if not found
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};

/**
 * Get all routes that should be shown in navigation
 *
 * @returns List of routes to show in navigation
 */
export const getNavRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.showInNav);
};
