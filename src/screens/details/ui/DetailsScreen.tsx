import { StyleSheet, Text, View } from 'react-native';
import type { StaticScreenProps } from '@react-navigation/native';
import { colors, spacing, typography } from '@shared/theme';

type DetailsScreenProps = StaticScreenProps<{ postId: number }>;

export const DetailsScreen = ({ route }: DetailsScreenProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Post {route.params.postId}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
});
