import { LuInbox } from 'react-icons/lu';

export const EmptyState = ({ 
  title = 'No items', 
  description = '', 
  icon = LuInbox,
  action = null 
}) => {
  const Icon = icon;

  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <Icon size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-gray-500 mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
