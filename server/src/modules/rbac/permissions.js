/**
 * Central permission registry — single source of truth for all valid permissions.
 * Organized by category for admin UI display.
 */
export const PERMISSION_CATEGORIES = {
  templates: {
    label: 'Templates',
    permissions: {
      'templates.view_all':  'View all templates (admin panel)',
      'templates.approve':   'Approve/reject template submissions',
      'templates.delete':    'Delete any template',
      'templates.create':    'Create templates',
      'templates.edit_own':  'Edit own templates',
    },
  },
  users: {
    label: 'Users',
    permissions: {
      'users.view':          'View user list',
      'users.ban':           'Ban/unban users',
      'users.role_change':   'Change user roles',
      'users.delete':        'Delete user accounts',
    },
  },
  orders: {
    label: 'Orders',
    permissions: {
      'orders.view_all':     'View all orders',
      'orders.refund':       'Process refunds',
    },
  },
  reviews: {
    label: 'Reviews',
    permissions: {
      'reviews.moderate':    'Moderate reviews',
    },
  },
  services: {
    label: 'Services',
    permissions: {
      'services.manage':     'Manage service packages',
      'services.admin':      'Admin service order management',
    },
  },
  coupons: {
    label: 'Coupons',
    permissions: {
      'coupons.manage':      'Create/edit/delete coupons',
    },
  },
  tickets: {
    label: 'Support Tickets',
    permissions: {
      'tickets.admin':       'Manage all support tickets',
    },
  },
  reports: {
    label: 'Reports',
    permissions: {
      'reports.manage':      'View and resolve content reports',
    },
  },
  withdrawals: {
    label: 'Withdrawals',
    permissions: {
      'withdrawals.view':    'View withdrawal requests',
      'withdrawals.approve': 'Approve/reject withdrawals',
    },
  },
  analytics: {
    label: 'Analytics',
    permissions: {
      'analytics.view_all':  'View platform-wide analytics',
      'analytics.view_own':  'View own template analytics',
    },
  },
  affiliates: {
    label: 'Affiliates',
    permissions: {
      'affiliates.admin':    'Manage affiliate program',
    },
  },
  blog: {
    label: 'Blog',
    permissions: {
      'blog.create':         'Create blog posts',
      'blog.admin':          'Admin blog management',
    },
  },
  audit: {
    label: 'Audit Logs',
    permissions: {
      'audit.view':          'View audit logs',
    },
  },
  earnings: {
    label: 'Earnings',
    permissions: {
      'earnings.view_own':   'View own earnings',
    },
  },
  creators: {
    label: 'Creators',
    permissions: {
      'creators.onboarding': 'Access creator onboarding',
      'creators.admin':      'Admin creator management',
    },
  },
  content: {
    label: 'Content',
    permissions: {
      'content.manage_shots': 'Manage UI shots',
    },
  },
  dashboard: {
    label: 'Dashboard',
    permissions: {
      'dashboard.admin':     'Access admin dashboard',
      'dashboard.creator':   'Access creator dashboard',
    },
  },
};

/** Flat set of all valid permission strings for validation. */
export const ALL_PERMISSIONS = new Set(
  Object.values(PERMISSION_CATEGORIES)
    .flatMap(cat => Object.keys(cat.permissions))
);

/** Default permission sets for built-in roles. */
export const DEFAULT_ROLE_PERMISSIONS = {
  buyer: [],

  creator: [
    'templates.create',
    'templates.edit_own',
    'services.manage',
    'analytics.view_own',
    'earnings.view_own',
    'creators.onboarding',
    'blog.create',
    'dashboard.creator',
  ],

  admin: [
    // Admin-specific
    'templates.view_all', 'templates.approve', 'templates.delete',
    'users.view', 'users.ban', 'users.role_change',
    'orders.view_all', 'orders.refund',
    'reviews.moderate',
    'services.admin',
    'coupons.manage',
    'tickets.admin',
    'reports.manage',
    'withdrawals.view', 'withdrawals.approve',
    'analytics.view_all',
    'affiliates.admin',
    'blog.admin',
    'audit.view',
    'creators.admin',
    'content.manage_shots',
    'dashboard.admin',
    // Also inherits creator permissions
    'templates.create', 'templates.edit_own',
    'services.manage',
    'analytics.view_own',
    'earnings.view_own',
    'blog.create',
    'dashboard.creator',
  ],

  super_admin: ['*'],
};
