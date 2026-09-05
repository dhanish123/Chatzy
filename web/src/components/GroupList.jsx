import { useGroupStore } from '../stores/groupStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { Avatar } from './Avatar.jsx';
import { EmptyState } from './EmptyState.jsx';
import { LuUsers } from 'react-icons/lu';

export const GroupList = () => {
  const { user } = useAuthStore();
  const { groups, setSelectedGroup, selectedGroup } = useGroupStore();

  if (groups.length === 0) {
    return <EmptyState title="No groups" description="Create or join a group" icon={LuUsers} />;
  }

  return (
    <div>
      {groups.map((group) => {
        const currentUserMember = group.members?.find(m => m.userId?._id?.toString() === user?._id?.toString());
        const unreadCount = currentUserMember?.unreadCount || 0;

        return (
          <div
            key={group._id}
            onClick={() => setSelectedGroup(group)}
            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar src={group.image} initials={group.name[0]} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {group.lastMessage?.isDeleted
                    ? 'Message deleted'
                    : group.lastMessage?.mediaType === 'audio' 
                    ? '🎙️ Audio message'
                    : group.lastMessage?.mediaType === 'image'
                    ? '📷 Image'
                    : group.lastMessage?.mediaType === 'video'
                    ? '🎥 Video'
                    : group.lastMessage?.mediaType === 'file'
                    ? '📄 File'
                    : group.lastMessage?.mediaType === 'application/pdf'
                    ? '📕 PDF'
                    : group.lastMessage?.content || 'No messages'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && selectedGroup?._id !== group._id && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
