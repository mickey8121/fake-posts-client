import { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  POST_CARD_HEIGHT,
  PostCard,
  usePostList,
  type Post,
} from '@entities/post';
import { colors, spacing } from '@shared/theme';
import { PostListSeparator } from './PostListSeparator';

const ITEM_LENGTH = POST_CARD_HEIGHT + spacing.sm;

type PostListProps = {
  onPostPress: (postId: number) => void;
};

export const PostList = ({ onPostPress }: PostListProps) => {
  const { posts, favoriteIds, view, error, refetch } = usePostList();
  const { bottom } = useSafeAreaInsets();
  const contentStyle = useMemo(
    () => [styles.content, { paddingBottom: spacing.lg + bottom }],
    [bottom],
  );

  useEffect(() => {
    if (view === 'error') {
      Alert.alert(
        'Could not load posts',
        error ?? undefined,
        [{ text: 'Refetch', onPress: refetch }],
        { cancelable: false },
      );
    }
  }, [view, error, refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        isFavorite={favoriteIds.has(item.id)}
        onPress={onPostPress}
      />
    ),
    [favoriteIds, onPostPress],
  );

  if (view !== 'ready') {
    return (
      <View style={styles.center}>
        {view === 'loading' && <ActivityIndicator />}
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      extraData={favoriteIds}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={PostListSeparator}
      contentContainerStyle={contentStyle}
      initialNumToRender={10}
      windowSize={7}
    />
  );
};

const keyExtractor = (post: Post) => String(post.id);

const getItemLayout = (
  _: ArrayLike<Post> | null | undefined,
  index: number,
) => ({
  length: ITEM_LENGTH,
  offset: ITEM_LENGTH * index,
  index,
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
});
