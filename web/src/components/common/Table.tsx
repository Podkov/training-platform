import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 ${className || ''}`} {...props}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-700 ${className || ''}`} {...props}>
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className, ...props }) => {
  return (
    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${className || ''}`} {...props}>
      {children}
    </tbody>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => {
  return (
    <tr className={`${className || ''}`} {...props}>
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  header?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({ children, header, className, ...props }) => {
  const commonClasses = "px-6 py-3 text-left text-sm font-medium";
  if (header) {
    return (
      <th scope="col" className={`${commonClasses} text-gray-700 dark:text-gray-300 uppercase tracking-wider ${className || ''}`} {...props}>
        {children}
      </th>
    );
  }
  return (
    <td className={`${commonClasses} text-gray-900 dark:text-white ${className || ''}`} {...props}>
      {children}
    </td>
  );
}; 