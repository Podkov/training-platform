import React from 'react';
import { Navbar } from './Navbar';
import { Breadcrumbs } from './Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  actions?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  breadcrumbs, 
  pageTitle, 
  actions 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navigation */}
      <Navbar />
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Page Header */}
      {(pageTitle || actions) && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {pageTitle && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pageTitle}
                  </h1>
                )}
                {actions && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 min-h-0">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    TrainingHub
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    System zarządzania szkoleniami
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <span>© 2024 TrainingHub</span>
                <span>•</span>
                <span>Wersja 1.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 