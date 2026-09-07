// Message search and filtering utilities

export const searchMessages = (messages, query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();

  return messages.filter((msg) => {
    // Skip system messages
    if (msg.isSystemMessage) return false;

    // Skip deleted messages
    if (msg.isDeleted) return false;

    // Search in message content
    if (msg.content && msg.content.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in sender username
    if (msg.senderId?.username && msg.senderId.username.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    return false;
  }).reverse(); // Reverse so newest matches appear first
};

export const filterMessagesByDate = (messages, startDate, endDate) => {
  return messages.filter((msg) => {
    const msgDate = new Date(msg.createdAt);
    return msgDate >= startDate && msgDate <= endDate;
  });
};

export const filterMessagesBySender = (messages, senderId) => {
  return messages.filter((msg) => msg.senderId._id === senderId);
};

export const filterMessagesByType = (messages, mediaType) => {
  if (!mediaType) {
    // Return text messages (no media)
    return messages.filter((msg) => !msg.mediaType || msg.mediaType === 'text');
  }

  return messages.filter((msg) => msg.mediaType === mediaType);
};
