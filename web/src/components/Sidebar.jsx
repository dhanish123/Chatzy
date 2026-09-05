import { useState, useEffect } from 'react';
import { RiMenu3Line, RiSearchLine, RiAddLine } from 'react-icons/ri';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { Avatar } from './Avatar.jsx';
import { Input } from './Input.jsx';
import { UserMenu } from './UserMenu.jsx';
import { ConversationList } from './ConversationList.jsx';
import { GroupList } from './GroupList.jsx';
import { CreateGroupModal } from './CreateGroupModal.jsx';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { setSelectedGroup } = useGroupStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandPrivate, setExpandPrivate] = useState(true);
  const [expandGroups, setExpandGroups] = useState(true);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  const initials = user?.username?.[0]?.toUpperCase() || 'U';

  // Update timestamp when user profile image changes
  useEffect(() => {
    setImageTimestamp(Date.now());
  }, [user?.profileImage]);

  const getProfileImageUrl = () => {
    if (!user?.profileImage) return '';
    // Add cache-busting query parameter
    return `${user.profileImage}?t=${imageTimestamp}`;
  };

  const handleGroupCreated = (group) => {
    setSelectedGroup(group);
    setShowCreateGroup(false);
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chatzy<span className="text-gray-500 font-normal text-lg ml-2">- {user?.username}</span></h1>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg"
            >
              <Avatar src={getProfileImageUrl()} initials={initials} size="sm" />
            </button>
            {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}
          </div>
        </div>

        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Conversations and Groups */}
      <div className="flex-1 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => setExpandPrivate(!expandPrivate)}>
            <h2 className="font-semibold text-sm">Private Chats</h2>
            <span>{expandPrivate ? '▼' : '▶'}</span>
          </div>
          {expandPrivate && <ConversationList searchQuery={searchQuery} />}
        </div>

        <div>
          <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => setExpandGroups(!expandGroups)}>
            <h2 className="font-semibold text-sm">Groups</h2>
            <div className="flex items-center gap-2">
              <span>{expandGroups ? '▼' : '▶'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateGroup(true);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <RiAddLine />
              </button>
            </div>
          </div>
          {expandGroups && <GroupList />}
        </div>
      </div>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

