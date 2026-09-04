import { useGroupStore } from '../stores/groupStore.js';
import { Avatar } from './Avatar.jsx';
import { EmptyState } from './EmptyState.jsx';
import { LuUsers } from 'react-icons/lu';

export const GroupList = () => {
  const { groups, setSelectedGroup } = useGroupStore();

  if (groups.length === 0) {
    return <EmptyState title="No groups" description="Create or join a group" icon={LuUsers} />;
  }

  return (
    <div>
      {groups.map((group) => (
        <div
          key={group._id}
          onClick={() => setSelectedGroup(group)}
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1">
            <Avatar src={group.image} initials={group.name[0]} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{group.name}</p>
              <p className="text-sm text-gray-500 truncate">{group.lastMessage?.content || 'No messages'}</p>
            </div>
          </div>
          {group.members.find(m => m.unreadCount > 0) && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {group.members.find(m => m.unreadCount > 0)?.unreadCount}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
