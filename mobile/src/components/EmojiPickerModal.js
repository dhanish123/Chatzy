import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  triggerButton: {
    padding: 8,
    marginHorizontal: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%'
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  closeButton: {
    padding: 4
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row'
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6'
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#6b7280'
  },
  categoryButtonTextActive: {
    color: '#ffffff'
  },
  emojiGrid: {
    paddingHorizontal: 8
  },
  emojiItem: {
    width: '20%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emoji: {
    fontSize: 28
  }
});

const EMOJI_CATEGORIES = {
  smileys: {
    name: '😀',
    label: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙']
  },
  gestures: {
    name: '👋',
    label: 'Gestures',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '👊', '👏', '🙌', '👐']
  },
  hearts: {
    name: '❤️',
    label: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋']
  },
  nature: {
    name: '🌳',
    label: 'Nature',
    emojis: ['🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🎍', '🎎', '🎏', '🌇', '🌆', '🏞️', '🌅', '🌄', '🌠', '⛅', '🌤️', '🌥️']
  },
  food: {
    name: '🍔',
    label: 'Food',
    emojis: ['🍔', '🍟', '🍕', '🌭', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪']
  },
  activities: {
    name: '⚽',
    label: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊', '🥋', '🎽', '🎿']
  }
};

export const EmojiPickerModal = ({ onEmojiSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('smileys');

  const currentEmojis = EMOJI_CATEGORIES[activeCategory]?.emojis || [];

  const handleEmojiPress = (emoji) => {
    onEmojiSelect(emoji);
    setIsVisible(false);
  };

  const renderEmojiItem = ({ item }) => (
    <Pressable
      style={styles.emojiItem}
      onPress={() => handleEmojiPress(item)}
    >
      <Text style={styles.emoji}>{item}</Text>
    </Pressable>
  );

  return (
    <>
      <Pressable
        style={styles.triggerButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={{ fontSize: 20 }}>😊</Text>
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            activeOpacity={1}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Emoji</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <Pressable
                  key={key}
                  style={[
                    styles.categoryButton,
                    activeCategory === key && styles.categoryButtonActive
                  ]}
                  onPress={() => setActiveCategory(key)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      activeCategory === key && styles.categoryButtonTextActive
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <FlatList
              data={currentEmojis}
              renderItem={renderEmojiItem}
              keyExtractor={(item, index) => `${activeCategory}-${index}`}
              numColumns={5}
              scrollEnabled
              style={styles.emojiGrid}
              nestedScrollEnabled={true}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
