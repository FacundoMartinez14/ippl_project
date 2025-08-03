import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface ActivityButtonProps {
  className?: string;
}

const ActivityButton: React.FC<ActivityButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/activity')}
      className={`cursor-pointer p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <ChartBarIcon className="h-6 w-6 text-[#00B19F]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">Actividad</h3>
          <p className="text-xs text-gray-500">Registro de acciones</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityButton; 