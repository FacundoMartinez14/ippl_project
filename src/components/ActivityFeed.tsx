import React from 'react';
import { Activity } from '../services/activity.service';
import { motion } from 'framer-motion';
import { DocumentTextIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'new_patient':
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      case 'appointment_update':
        return <CalendarIcon className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getIconBackground = (type: string) => {
    switch (type) {
      case 'new_post':
        return 'bg-blue-50';
      case 'new_patient':
        return 'bg-green-50';
      case 'appointment_update':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-4">
        {activities.map((activity, index) => (
          <motion.li
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative pb-4"
          >
            {index < activities.length - 1 && (
              <span
                className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                aria-hidden="true"
              />
            )}
            <div className="relative flex items-start space-x-3">
              <div className={`relative px-1.5 py-1.5 rounded-lg ${getIconBackground(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              <motion.div 
                className="flex-1 min-w-0"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >image.png
                <div className="text-sm font-medium text-gray-900">
                  {activity.user}
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {activity.description}
                </p>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </motion.div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed; 