import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs based on current path if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard', icon: '🏠' }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map route segments to readable labels
      let label = segment;
      let icon = '';
      
      switch (segment) {
        case 'dashboard':
          label = 'Dashboard';
          icon = '🏠';
          break;
        case 'courses':
          label = 'Kursy';
          icon = '📚';
          break;
        case 'profile':
          label = 'Profil';
          icon = '👤';
          break;
        default:
          // For dynamic segments like course IDs, show as is or try to get from context
          if (!isNaN(Number(segment))) {
            label = `Kurs #${segment}`;
            icon = '📖';
          }
      }

      // Don't add dashboard twice
      if (segment !== 'dashboard') {
        breadcrumbs.push({
          label,
          href: index === pathSegments.length - 1 ? undefined : currentPath, // Last item shouldn't be clickable
          icon
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard (home page) if auto-generated
  if (!items && location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg 
                    className="w-4 h-4 mx-2 text-gray-400 dark:text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                
                {item.href ? (
                  <Link
                    to={item.href}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex items-center text-gray-900 dark:text-white font-medium">
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}; 