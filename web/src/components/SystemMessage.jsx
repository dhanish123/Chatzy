export const SystemMessage = ({ message }) => {
  const getSystemMessageText = () => {
    if (message.isSystemMessage) {
      return message.content;
    }
    return null;
  };

  if (!message.isSystemMessage) {
    return null;
  }

  return (
    <div className="flex justify-center py-2">
      <div className="bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-xs font-medium">
        {getSystemMessageText()}
      </div>
    </div>
  );
};
