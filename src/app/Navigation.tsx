import {
  createStaticNavigation,
  DarkTheme,
  type StaticParamList,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DetailsScreen } from '@screens/details';
import { PostsScreen } from '@screens/posts';
import { colors, typography } from '@shared/theme';

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerStyle: { backgroundColor: colors.navy },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      fontSize: typography.heading.fontSize,
      fontWeight: typography.heading.fontWeight,
    },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  },
  screens: {
    Posts: { screen: PostsScreen, options: { title: 'Posts' } },
    Details: { screen: DetailsScreen, options: { title: 'Post' } },
  },
});

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.navy,
    text: colors.textPrimary,
    border: colors.navyBorder,
    notification: colors.favorite,
  },
};

export const Navigation = () => <NavigationRoot theme={theme} />;

const NavigationRoot = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
