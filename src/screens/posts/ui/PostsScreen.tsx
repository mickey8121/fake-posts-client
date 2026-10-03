import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { PostList } from '@widgets/post-list';

export const PostsScreen = () => {
  const navigation = useNavigation();

  const openDetails = useCallback(
    (postId: number) => navigation.navigate('Details', { postId }),
    [navigation],
  );

  return <PostList onPostPress={openDetails} />;
};
