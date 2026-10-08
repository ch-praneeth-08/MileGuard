export function homeForRole(role: string): string {
  switch (role.trim().toLowerCase()) {
    case 'customer': return '/customer';
    case 'agent': return '/agent';
    case 'underwriter': return '/underwriter';
    case 'claims adjuster':
    case 'claimsofficer':
    case 'claims officer': return '/claims-officer';
    case 'admin': return '/admin';
    default: return '/login';
  }
}
