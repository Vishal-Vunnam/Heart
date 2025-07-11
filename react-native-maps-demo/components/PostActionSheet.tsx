import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type PostActionSheetProps = {
  visible: boolean;
  isUserLoggedIn: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
};

const PostActionSheet: React.FC<PostActionSheetProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  onReport,
  isUserLoggedIn
}) => {
  if (!visible) return null;

  return (
    <View style={styles.dropdownContainer}>
      <View style={styles.dropdownSheet}>
        {isUserLoggedIn && (
          <>
            <TouchableOpacity
              style={styles.action}
              onPress={() => {
                onEdit && onEdit();
                onClose();
              }}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.action}
              onPress={() => {
                console.log("deletig");
                onDelete && onDelete();
                onClose();
              }}
            >
              <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            onReport && onReport();
            onClose();
          }}
        >
          <Text style={[styles.actionText, { color: 'red' }]}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: 30, // adjust as needed for your UI
    right: 110,
    zIndex: 1000,
    // Optionally add shadow for dropdown effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  dropdownSheet: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 20,
    paddingVertical: 1,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  action: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'left',
  },
  cancel: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'left',
    fontWeight: '600',
  },
});

export default PostActionSheet;