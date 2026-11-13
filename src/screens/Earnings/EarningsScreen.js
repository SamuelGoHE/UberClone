// AI-assisted: see docs/AI_LOG.md #28
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SegmentedField from '../../components/forms/SegmentedField';
import { PRICING } from '../../config/pricing';
import { useAuth } from '../../context/AuthContext';
import useEarnings from '../../hooks/useEarnings';
import { requestPayout } from '../../services/firebase/payouts';
import { PERIODS } from '../../utils/earnings';
import { formatMoney } from '../../utils/formatMoney';
import { colors, radius, spacing, typography } from '../../theme/colors';

const PERIOD_OPTIONS = [
  { value: PERIODS.DAY, label: 'Hoy' },
  { value: PERIODS.WEEK, label: 'Semana' },
  { value: PERIODS.MONTH, label: 'Mes' },
];
const PERIOD_NAMES = { [PERIODS.DAY]: 'hoy', [PERIODS.WEEK]: 'esta semana', [PERIODS.MONTH]: 'este mes' };

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// Pantalla de Ganancias: los totales del día, la semana o el mes, y el saldo del conductor. Los datos y las
// cuentas vienen de useEarnings; la pantalla solo guarda el periodo escogido y dibuja el resultado.
export default function EarningsScreen() {
  const { user } = useAuth();
  const [period, setPeriod] = useState(PERIODS.WEEK);
  const { summary, balance, loading, error, payoutsError } = useEarnings(user.uid, period);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const commissionPercent = Math.round(PRICING.commissionRate * 100);

  // Si no se pudieron leer las liquidaciones, el saldo se vería más alto de lo real: no se deja liquidar.
  const canRequestPayout = balance > 0 && !busy && !payoutsError;

  const confirmPayout = async (amount) => {
    setBusy(true);
    setMessage(null);
    try {
      await requestPayout(user.uid, amount);
      setMessage(`Liquidación de ${formatMoney(amount)} solicitada.`);
    } catch {
      setMessage('No pudimos solicitar la liquidación. Inténtalo de nuevo.');
    }
    setBusy(false);
  };
  const handlePayout = () =>
    Alert.alert('¿Solicitar liquidación?', `Se simulará el pago de ${formatMoney(balance)} a tu cuenta.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Solicitar', onPress: () => confirmPayout(balance) },
    ]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SegmentedField value={period} options={PERIOD_OPTIONS} onChange={setPeriod} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.caption}>{`Ganancia neta · ${PERIOD_NAMES[period]}`}</Text>
        <Text style={styles.display}>{formatMoney(summary.net)}</Text>
      </View>

      <View style={styles.grid}>
        <Stat label="Viajes" value={String(summary.count)} />
        <Stat label="Total facturado" value={formatMoney(summary.fares)} />
        <Stat label={`Comisiones (${commissionPercent} %)`} value={formatMoney(-summary.commissions)} />
        <Stat label="Propinas" value={formatMoney(summary.tips)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.caption}>Promedio por viaje</Text>
        <Text style={styles.statValue}>{formatMoney(summary.average)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.caption}>Saldo del conductor</Text>
        <Text style={[styles.balance, balance < 0 && styles.negative]}>{formatMoney(balance)}</Text>
        <Text style={styles.caption}>
          Pagos por pasarela menos las comisiones de los viajes en efectivo. Puede quedar en negativo.
        </Text>
        {payoutsError ? <Text style={styles.error}>{payoutsError}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable
          style={[styles.payout, !canRequestPayout && styles.disabled]}
          onPress={handlePayout}
          disabled={!canRequestPayout}
          accessibilityRole="button"
          accessibilityLabel="Solicitar liquidación simulada"
        >
          <Text style={styles.payoutText}>Solicitar liquidación (simulada)</Text>
        </Pressable>
        {balance <= 0 ? <Text style={styles.caption}>Solo puedes liquidar cuando tu saldo es positivo.</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '48.5%',
    flexGrow: 1,
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  caption: { ...typography.caption, color: colors.textMuted },
  display: { ...typography.display, color: colors.text },
  statValue: { ...typography.heading, color: colors.text },
  balance: { ...typography.title, color: colors.text },
  negative: { color: colors.danger },
  error: { ...typography.caption, color: colors.danger },
  message: { ...typography.caption, color: colors.success },
  payout: {
    height: 48,
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  payoutText: { ...typography.bodyStrong, color: colors.text },
});
