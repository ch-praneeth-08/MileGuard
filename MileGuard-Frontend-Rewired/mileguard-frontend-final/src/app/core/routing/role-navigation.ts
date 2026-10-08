export interface RoleNavigationItem {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly exact?: boolean;
}

export interface RoleNavigationSection {
  readonly title?: string;
  readonly items: readonly RoleNavigationItem[];
}

export const CUSTOMER_NAVIGATION: readonly RoleNavigationSection[] = [
  {
    items: [
      { label: 'Home', route: '/customer', icon: '⌂', exact: true },
      { label: 'My Profile', route: '/customer/profile', icon: '◎' },
      { label: 'My Vehicles', route: '/customer/vehicles', icon: '▱' },
      { label: 'Underwriting', route: '/customer/underwriting', icon: '✓' },
      { label: 'Policies', route: '/customer/policies', icon: '▤' },
      { label: 'Claims', route: '/customer/claims', icon: '!' }
    ]
  }
];

export const AGENT_NAVIGATION: readonly RoleNavigationSection[] = [
  {
    items: [
      { label: 'Home', route: '/agent', icon: '⌂', exact: true },
      { label: 'My Customers', route: '/agent/customers', icon: '◎' },
      // Feature entry remains customer-contextual; these canonical routes safely land on the workspace.
      { label: 'Quotes', route: '/agent/quotes', icon: '◫' },
      { label: 'Underwriting', route: '/agent/underwriting', icon: '✓' },
      { label: 'Claims', route: '/agent/claims', icon: '!' }
    ]
  }
];

export const UNDERWRITER_NAVIGATION: readonly RoleNavigationSection[] = [
  {
    items: [
      { label: 'Home', route: '/underwriter', icon: '⌂', exact: true },
      { label: 'Applications', route: '/underwriter/applications', icon: '▤' }
    ]
  }
];

export const CLAIMS_OFFICER_NAVIGATION: readonly RoleNavigationSection[] = [
  {
    items: [
      { label: 'Home', route: '/claims-officer', icon: '⌂', exact: true },
      { label: 'Claims', route: '/claims-officer/claims', icon: '!' }
    ]
  }
];

export const ADMIN_NAVIGATION: readonly RoleNavigationSection[] = [
  {
    title: 'Operations',
    items: [
      { label: 'Home', route: '/admin', icon: '⌂', exact: true },
      { label: 'People', route: '/admin/people', icon: '◎' },
      { label: 'Customers', route: '/admin/customers', icon: '◉' },
      { label: 'Assignments', route: '/admin/assignments', icon: '↔' },
      { label: 'Underwriting', route: '/admin/underwriting', icon: '✓' },
      { label: 'Claims', route: '/admin/claims', icon: '!' },
      { label: 'Pricing', route: '/admin/pricing', icon: '₹' }
    ]
  }
];
