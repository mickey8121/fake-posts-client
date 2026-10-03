import { memo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, typography } from '@shared/theme';
import { Shimmer } from './Shimmer';

type RemoteImageProps = {
  uri: string;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
};

type Outcome = { uri: string; status: 'loaded' | 'error' };

export const RemoteImage = memo(
  ({ uri, width, height, style }: RemoteImageProps) => {
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    // Rows are recycled with new uris, so an outcome only counts for the uri it was reported for
    const status = outcome?.uri === uri ? outcome.status : 'loading';

    return (
      <View style={[styles.container, { width, height }, style]}>
        {status !== 'error' && (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            onLoad={() => setOutcome({ uri, status: 'loaded' })}
            onError={() => setOutcome({ uri, status: 'error' })}
          />
        )}
        {status === 'loading' && <Shimmer />}
        {status === 'error' && <Text style={styles.errorLabel}>error</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radii.sm,
    backgroundColor: colors.background,
  },
  errorLabel: {
    ...typography.micro,
    color: colors.textSecondary,
  },
});
