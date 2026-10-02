import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radii, shadows, spacing, typography } from '@shared/theme';

export const PostsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts</Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Details', { postId: 1 })}
      >
        <Text style={styles.buttonLabel}>Open post</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  button: {
    ...shadows.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.navy,
  },
  buttonLabel: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
