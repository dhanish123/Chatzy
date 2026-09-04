import { useState } from 'react';
import { RiMenu3Line, RiSearchLine, RiAddLine } from 'react-icons/ri';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { Avatar } from './Avatar.jsx';
import { Input } from './Input.jsx';
import { Modal } from './Modal.jsx';
import { UserMenu } from './UserMenu.jsx';
import { ConversationList } from './ConversationList.jsx';
import { GroupList } from './GroupList.jsx';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandPrivate, setExpandPrivate] = useState(true);
  const [expandGroups, setExpandGroups] = useState(true);

  const initials = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chatzy</h1>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg"
            >
              <Avatar src={user?.profileImage} initials={initials} size="sm" />
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

      <Modal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} title="Create Group">
        <CreateGroupForm onClose={() => setShowCreateGroup(false)} />
      </Modal>
    </div>
  );
};

const CreateGroupForm = ({ onClose }) => {
  const [groupName, setGroupName] = useState('');
  const { addGroup } = useGroupStore();

  const handleCreate = async () => {
    // Implementation will be added in full version
    onClose();
  };

  return (
    <div>
      <Input
        label="Group Name"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
    </div>
  );
};
