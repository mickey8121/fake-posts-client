import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useNavigation,
  type StaticScreenProps,
} from '@react-navigation/native';
import { IMAGE_SIZE, usePost } from '@entities/post';
import { ToggleFavoriteButton } from '@features/toggle-favorite';
import { colors, spacing, typography } from '@shared/theme';
import { RemoteImage } from '@shared/ui';

type DetailsScreenProps = StaticScreenProps<{ postId: number }>;

export const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { postId } = route.params;
  const navigation = useNavigation();
  const { post, view, error, refetch } = usePost(postId);

  useEffect(() => {
    if (view === 'error') {
      Alert.alert(
        'Could not load the post',
        error ?? undefined,
        [
          { text: 'Back', style: 'cancel', onPress: navigation.goBack },
          { text: 'Refetch', onPress: refetch },
        ],
        { cancelable: false },
      );
    }
  }, [view, error, refetch, navigation]);

  if (view !== 'ready' || !post) {
    return (
      <View style={styles.center}>
        {view === 'loading' && <ActivityIndicator />}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <RemoteImage
        uri={post.imageUrl}
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        style={styles.image}
      />
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <ToggleFavoriteButton postId={post.id} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'stretch',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  image: {
    alignSelf: 'center',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
