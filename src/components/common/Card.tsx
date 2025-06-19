import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2 sm:p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm hover:shadow transition-shadow duration-200',
    md: 'shadow hover:shadow-md transition-shadow duration-200',
    lg: 'shadow-lg hover:shadow-xl transition-shadow duration-200',
  };

  return (
    <div className={`bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;