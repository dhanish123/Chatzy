import { useState, useRef, useEffect } from 'react';
import { useGroupStore } from '../stores/groupStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { userStateAPI } from '../services/userStateAPI.js';
import { groupAPI } from '../services/api.js';
import { Avatar } from './Avatar.jsx';
import { EmptyState } from './EmptyState.jsx';
import { LuUsers } from 'react-icons/lu';

export const GroupList = () => {
  const { user } = useAuthStore();
  const { groups, setSelectedGroup, selectedGroup, setGroups } = useGroupStore();
  const { setSelectedConversation } = useChatStore();
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  const handleContextMenu = (e, groupId) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      groupId
    });
  };

  const handleDeleteGroup = async () => {
    if (!contextMenu?.groupId) return;
    
    console.log('Deleting group:', contextMenu.groupId);
    
    try {
      const response = await groupAPI.delete(contextMenu.groupId);
      console.log('Delete response:', response);
      
      // Remove from store
      const updatedGroups = groups.filter(g => g._id !== contextMenu.groupId);
      console.log('Updated groups:', updatedGroups);
      setGroups(updatedGroups);
      
      // Clear selection if deleted group was selected
      if (selectedGroup?._id === contextMenu.groupId) {
        setSelectedGroup(null);
        setSelectedConversation(null);
      }
      
      setContextMenu(null);
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

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
            onClick={() => {
              setSelectedGroup(group);
              setSelectedConversation(null); // Clear private chat when selecting group
              // Save selected group to MongoDB (fire and forget)
              userStateAPI.setSelectedGroup(group._id);
            }}
            onContextMenu={(e) => handleContextMenu(e, group._id)}
            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar src={group.image} initials={group.name[0]} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {group.lastMessage?.mediaType === 'audio' 
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-300 rounded shadow-lg py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteGroup();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
          >
            Delete Group
          </button>
        </div>
      )}
    </div>
  );
};
