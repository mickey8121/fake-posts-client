import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '@shared/theme';
import { useToggleFavorite } from '../model/useToggleFavorite';

type ToggleFavoriteButtonProps = {
  postId: number;
};

export const ToggleFavoriteButton = memo(
  ({ postId }: ToggleFavoriteButtonProps) => {
    const { isFavorite, toggle } = useToggleFavorite(postId);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        style={({ pressed }) => [
          styles.button,
          isFavorite && styles.favorite,
          pressed && styles.pressed,
        ]}
        onPress={toggle}
      >
        <Text style={styles.label}>
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    ...shadows.button,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.navy,
    borderWidth: 1,
    borderColor: colors.navyBorder,
  },
  favorite: {
    backgroundColor: colors.favorite,
    borderColor: colors.favoriteBorder,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
