import { StyleSheet, Text, View } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import EarningsScreen from '../screens/Earnings/EarningsScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { initialsOf } from '../utils/initials';
import { colors, radius, spacing, typography } from '../theme/colors';

const Drawer = createDrawerNavigator();

// Contenido del menú lateral: quién es el conductor, las pantallas y, al final, cerrar sesión.
function DrawerContent(props) {
  const { driver, signOut } = useAuth();
  const { t } = useLanguage();
  // El perfil nuevo guarda la categoría dentro de vehicle; el de prueba antiguo la tenía suelta.
  const category = driver?.vehicle?.category ?? driver?.category;
  const categoryLabel = category ? t(`category.${category}`) : null;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initialsOf(driver?.fullName)}</Text>
        </View>
        <Text style={styles.name}>{driver?.fullName ?? ''}</Text>
        <View style={styles.statusRow}>
          <View style={styles.dot} />
          <Text style={styles.status}>
            {categoryLabel ? t('drawer.approvedWith', { category: categoryLabel }) : t('drawer.approved')}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
      <DrawerItemList {...props} />

      <View style={styles.spacer} />
      <View style={styles.divider} />
      <DrawerItem
        label={t('drawer.logout')}
        labelStyle={styles.logoutLabel}
        onPress={signOut}
        style={styles.item}
      />
    </DrawerContentScrollView>
  );
}

// CONCEPTO: el Drawer es el menú lateral del conductor. Inicio oculta la cabecera porque dibuja su propio
// botón de menú flotando sobre el mapa. Tiene Inicio, Ganancias, Historial y Perfil. Los textos del menú
// vienen de t() y cambian con el idioma. El deslizamiento desde el borde queda
// desactivado: choca con el gesto del sistema y de Expo Go. El menú se abre solo con un botón.
export default function DrawerNavigator() {
  const { t } = useLanguage();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        swipeEnabled: false,
        drawerType: 'front',
        drawerStyle: { width: 312, backgroundColor: colors.surface },
        drawerActiveBackgroundColor: colors.background,
        drawerActiveTintColor: colors.text,
        drawerInactiveTintColor: colors.textMuted,
        drawerLabelStyle: { ...typography.body },
        drawerItemStyle: { borderRadius: radius.md },
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { ...typography.heading, color: colors.text },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTintColor: colors.text,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: t('drawer.home'), drawerLabel: t('drawer.home'), headerShown: false }} />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: t('drawer.earnings'), drawerLabel: t('drawer.earnings') }} />
      <Drawer.Screen name="History" component={HistoryScreen} options={{ title: t('drawer.history'), drawerLabel: t('drawer.history') }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: t('drawer.profile'), drawerLabel: t('drawer.profile') }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  profile: { gap: 6, paddingHorizontal: spacing.sm, paddingBottom: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...typography.heading, color: colors.text },
  name: { ...typography.heading, color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  status: { ...typography.caption, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  spacer: { flex: 1 },
  item: { borderRadius: radius.md },
  logoutLabel: { ...typography.body, color: colors.danger },
});
