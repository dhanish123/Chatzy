// Utility functions for navigating and displaying reply threads

export const scrollToMessage = (flatListRef, messages, targetMessageId) => {
  if (!flatListRef.current || !messages) return;

  // Find the index of the target message
  const index = messages.findIndex(msg => msg._id === targetMessageId);
  
  if (index !== -1) {
    // Since the list is inverted, we need to calculate the correct offset
    // Scroll to the message with animation
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: index,
        viewPosition: 0.5 // Center the message in view
      });
    }, 100);
  }
};

export const getReplyChain = (message, allMessages) => {
  const chain = [message];
  let current = message;

  // Walk up the reply chain
  while (current?.replyTo) {
    const replied = allMessages.find(m => m._id === current.replyTo._id || m._id === current.replyTo);
    if (replied) {
      chain.unshift(replied);
      current = replied;
    } else {
      break;
    }
  }

  return chain;
};

export const countReplies = (messageId, allMessages) => {
  return allMessages.filter(msg => msg.replyTo?._id === messageId).length;
};

export const getReplyingMessages = (messageId, allMessages) => {
  return allMessages.filter(msg => msg.replyTo?._id === messageId);
};
