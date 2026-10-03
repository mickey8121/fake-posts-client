import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '@shared/theme';
import { RemoteImage } from '@shared/ui';
import { THUMBNAIL_SIZE } from '../lib/enrichPost';
import type { Post } from '../model/types';

const BORDER_WIDTH = 1;
const TITLE_LINES = 1;
const BODY_LINES = 2;

export const POST_CARD_HEIGHT =
  2 * (BORDER_WIDTH + spacing.md) +
  TITLE_LINES * typography.heading.lineHeight +
  spacing.xs +
  BODY_LINES * typography.body.lineHeight;

type PostCardProps = {
  post: Post;
  isFavorite: boolean;
  onPress: (postId: number) => void;
};

export const PostCard = memo(({ post, isFavorite, onPress }: PostCardProps) => (
  <Pressable
    accessibilityRole="button"
    style={({ pressed }) => [
      styles.card,
      isFavorite && styles.favorite,
      pressed && styles.pressed,
    ]}
    onPress={() => onPress(post.id)}
  >
    <RemoteImage
      uri={post.thumbnailUrl}
      width={THUMBNAIL_SIZE}
      height={THUMBNAIL_SIZE}
    />
    <View style={styles.texts}>
      <Text style={styles.title} numberOfLines={TITLE_LINES}>
        {post.title}
      </Text>
      <Text style={styles.body} numberOfLines={BODY_LINES}>
        {post.body}
      </Text>
    </View>
  </Pressable>
));

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    height: POST_CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.surfaceMuted,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  favorite: {
    borderColor: colors.favoriteBorder,
    backgroundColor: colors.favorite,
  },
  pressed: {
    opacity: 0.8,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
