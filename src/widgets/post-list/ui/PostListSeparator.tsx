import { StyleSheet, View } from 'react-native';
import { spacing } from '@shared/theme';

export const PostListSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    height: spacing.sm,
  },
});
