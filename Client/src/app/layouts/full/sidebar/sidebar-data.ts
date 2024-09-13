import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-dashboard',
    route: '/dashboard',
  },
  {
    navCap: 'Decision Maker Queries',
  },
  {
    displayName: 'Chief Librarian',
    iconName: 'book',
    route: '/decision-makers/chief-librarian',
  },
  {
    displayName: 'Vice Chancellor',
    iconName: 'school',
    route: '/decision-makers/vice-chancellor',
  },
  {
    displayName: 'Departmental Heads',
    iconName: 'users',
    route: '/decision-makers/departmental-heads',
  },
  {
    displayName: 'Finance Director',
    iconName: 'currency-pound',
    route: '/decision-makers/finance-director',
  },
  {
    navCap: 'External Links',
  },
  {
    displayName: 'System Status',
    iconName: 'list',
    route: 'https://status.dylanwarrell.com',
    external: true,
  },
  {
    displayName: 'API Testing',
    iconName: 'settings',
    route: 'https://datawarehouseapi.dylanwarrell.com/swagger',
    external: true,
  },
  {
    displayName: 'GitHub Repository',
    iconName: 'code',
    route: 'https://github.com/DylanW01/Data-Warehouse-Application/',
    external: true,
  },
  {
    navCap: 'Ui Components',
  },
  {
    displayName: 'Lists',
    iconName: 'list',
    route: '/ui-components/lists',
  },
  {
    displayName: 'Menu',
    iconName: 'layout-navbar-expand',
    route: '/ui-components/menu',
  },
  {
    displayName: 'Tooltips',
    iconName: 'tooltip',
    route: '/ui-components/tooltips',
  },
];
