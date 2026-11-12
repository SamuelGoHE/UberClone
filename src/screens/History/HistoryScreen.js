import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import ClockIcon from '../../components/common/ClockIcon';
import DateField from '../../components/forms/DateField';
import FilterChip from '../../components/history/FilterChip';
import TripCard from '../../components/history/TripCard';
import { PAYMENT_METHODS } from '../../constants/paymentMethods';
import { useAuth } from '../../context/AuthContext';
import useTripHistory from '../../hooks/useTripHistory';
import { HISTORY_PERIODS } from '../../utils/historyFilters';
import { colors, radius, spacing, typography } from '../../theme/colors';

const PERIOD_CHIPS = [
  { value: HISTORY_PERIODS.DAY, label: 'Hoy' },
  { value: HISTORY_PERIODS.WEEK, label: 'Semana' },
  { value: HISTORY_PERIODS.MONTH, label: 'Mes' },
  { value: HISTORY_PERIODS.RANGE, label: 'Rango' },
];
const METHOD_CHIPS = [
  { value: null, label: 'Todos' },
  { value: PAYMENT_METHODS.MERCADO_PAGO, label: 'Mercado Pago' },
  { value: PAYMENT_METHODS.CASH, label: 'Efectivo' },
];

// Historial de carreras: los viajes del conductor, del más reciente al más antiguo, con filtros de periodo y de
// método de pago. La lista se pide de 20 en 20 (useTripHistory) y pide la página siguiente al llegar al final.
export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [period, setPeriod] = useState(HISTORY_PERIODS.WEEK);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [rangeFrom, setRangeFrom] = useState(null);
  const [rangeTo, setRangeTo] = useState(null);
  const history = useTripHistory(user.uid, { period, paymentMethod, rangeFrom, rangeTo });

  // Qué mostrar cuando no hay viajes en pantalla: cargando, rango sin completar, error o lista vacía.
  let empty;
  if (history.loading) {
    empty = <ActivityIndicator size="large" color={colors.primary} />;
  } else if (!history.rangeReady) {
    empty = <Text style={styles.emptyText}>Elige las dos fechas del rango para ver tus viajes.</Text>;
  } else if (history.error) {
    empty = (
      <View style={styles.emptyBox}>
        <Text style={styles.error}>{history.error}</Text>
        <Pressable style={styles.retry} onPress={history.refresh} accessibilityRole="button">
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  } else {
    empty = (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIcon}>
          <ClockIcon color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No tienes viajes en este filtro</Text>
        <Text style={styles.emptyText}>Prueba con otro rango de fechas o con otro método de pago.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.chips}>
          {PERIOD_CHIPS.map((chip) => (
            <FilterChip key={chip.value} label={chip.label} selected={period === chip.value} onPress={() => setPeriod(chip.value)} />
          ))}
        </View>
        <View style={styles.chips}>
          {METHOD_CHIPS.map((chip) => (
            <FilterChip
              key={chip.label}
              label={chip.label}
              selected={paymentMethod === chip.value}
              onPress={() => setPaymentMethod(chip.value)}
            />
          ))}
        </View>
        {period === HISTORY_PERIODS.RANGE ? (
          <View style={styles.dates}>
            <View style={styles.date}>
              <DateField label="Desde" kind="range" value={rangeFrom} onChange={setRangeFrom} />
            </View>
            <View style={styles.date}>
              <DateField label="Hasta" kind="range" value={rangeTo} onChange={setRangeTo} error={history.rangeError} />
            </View>
          </View>
        ) : null}
      </View>

      <FlatList
        data={history.trips}
        keyExtractor={(trip) => trip.id}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => navigation.navigate('TripDetail', { tripId: item.id })} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<View style={styles.empty}>{empty}</View>}
        ListFooterComponent={history.loadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        onEndReached={history.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={history.refreshing} onRefresh={history.refresh} enabled={history.rangeReady} />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dates: { flexDirection: 'row', gap: spacing.sm },
  date: { flex: 1 },
  list: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  separator: { height: spacing.sm + 4 },
  footer: { paddingVertical: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg * 2 },
  emptyBox: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { ...typography.heading, color: colors.text, textAlign: 'center' },
  emptyText: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  error: { ...typography.caption, color: colors.danger, textAlign: 'center' },
  retry: { paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  retryText: { ...typography.bodyStrong, color: colors.text },
});
