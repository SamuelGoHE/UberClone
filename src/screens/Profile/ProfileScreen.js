import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateField from '../../components/forms/DateField';
import FormField from '../../components/forms/FormField';
import SegmentedField from '../../components/forms/SegmentedField';
import SelectField from '../../components/forms/SelectField';
import { GENDER_OPTIONS, LANGUAGE_OPTIONS, VEHICLE_COLORS } from '../../constants/registration';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { updateDriverProfile } from '../../services/firebase/drivers';
import { formatDate, parseISODate } from '../../utils/formatDate';
import { initialsOf } from '../../utils/initials';
import {
  buildProfileUpdates,
  DOCUMENT_STATUS,
  documentStatus,
  profileSections,
  profileToForm,
  validateProfileForm,
} from '../../utils/profile';
import { colors, radius, spacing, typography } from '../../theme/colors';

const STATUS_STYLE = {
  [DOCUMENT_STATUS.VALID]: { color: colors.success, key: 'profile.docValid' },
  [DOCUMENT_STATUS.EXPIRING]: { color: colors.warning, key: 'profile.docExpiring' },
  [DOCUMENT_STATUS.EXPIRED]: { color: colors.danger, key: 'profile.docExpired' },
};

// Fila de solo lectura: un dato que se muestra pero no se puede cambiar.
function InfoRow({ label, value, missing }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || missing}</Text>
    </View>
  );
}

// Un documento: su nombre, el número si lo tiene, la etiqueta de estado (que se calcula con la fecha que el
// conductor tiene en el formulario, así cambia al renovarla) y el campo para editar el vencimiento.
function DocumentBlock({ title, detail, value, onChange, error, t }) {
  const status = documentStatus(value);
  const style = status ? STATUS_STYLE[status] : null;
  return (
    <View style={styles.document}>
      <View style={styles.documentHeader}>
        <View style={styles.documentTexts}>
          <Text style={styles.documentTitle}>{title}</Text>
          {detail ? <Text style={styles.caption}>{detail}</Text> : null}
        </View>
        {style ? (
          <View style={[styles.badge, { backgroundColor: `${style.color}26` }]}>
            <View style={[styles.dot, { backgroundColor: style.color }]} />
            <Text style={styles.badgeText}>{t(style.key)}</Text>
          </View>
        ) : null}
      </View>
      <DateField label={t('profile.expiry')} kind="expiry" value={value} onChange={onChange} error={error} />
    </View>
  );
}

// Perfil y configuración. El formulario es un BORRADOR que se llena desde el perfil guardado (que llega en tiempo
// real): el conductor edita, y solo al tocar Guardar se validan los datos (con los mismos validadores del registro,
// errores debajo de cada campo, nunca en un Alert) y se guardan únicamente los campos que cambiaron.
// El idioma no es parte del borrador: es una preferencia que se aplica y se guarda en el momento.
export default function ProfileScreen() {
  const { user, driver, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [form, setForm] = useState(() => profileToForm(driver));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }

  const { hasVehicle, hasDocuments, hasTechnicalReview } = profileSections(driver);
  const updates = useMemo(() => buildProfileUpdates(form, driver), [form, driver]);
  const dirty = Object.keys(updates).length > 0;

  // El perfil se actualiza en tiempo real: si no hay cambios sin guardar, el formulario se pone al día solo.
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    if (!dirtyRef.current) setForm(profileToForm(driver));
  }, [driver]);

  // Cambia un campo del borrador y quita su error (reaparece al guardar si sigue mal).
  const setField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const { [field]: removed, ...rest } = current;
      return rest;
    });
    setMessage(null);
  };
  const digits = (field, maxLength) => ({
    value: form[field],
    onChangeText: (text) => setField(field)(text.replace(/\D/g, '')),
    keyboardType: 'number-pad',
    maxLength,
    error: errors[field],
  });

  const handleSave = async () => {
    setMessage(null);
    const found = validateProfileForm(form, driver);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setBusy(true);
    try {
      await updateDriverProfile(user.uid, updates);
      setMessage({ type: 'ok', text: t('profile.saved') });
    } catch {
      setMessage({ type: 'error', text: t('profile.saveError') });
    }
    setBusy(false);
  };
  const handleDiscard = () => {
    setForm(profileToForm(driver));
    setErrors({});
    setMessage(null);
  };

  const missing = t('profile.missing');
  const birthDate = formatDate(parseISODate(driver.birthDate));
  const vehicle = driver.vehicle;
  const documents = driver.documents;
  const category = vehicle?.category ?? driver.category;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          {driver.photoUrl ? (
            <Image source={{ uri: driver.photoUrl }} style={styles.avatar} accessibilityLabel={driver.fullName} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.initials}>{initialsOf(driver.fullName)}</Text>
            </View>
          )}
          <Text style={styles.name}>{driver.fullName}</Text>
          <View style={styles.approved}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.caption}>{t('profile.approved')}</Text>
          </View>
        </View>

        <Text style={styles.section}>{t('profile.personal')}</Text>
        <FormField
          label={t('profile.fullName')}
          value={form.fullName}
          onChangeText={setField('fullName')}
          maxLength={50}
          autoCapitalize="words"
          error={errors.fullName}
        />
        <FormField label={t('profile.phone')} {...digits('phone', 10)} />
        <SelectField
          label={t('profile.gender')}
          value={form.gender}
          options={GENDER_OPTIONS}
          onChange={setField('gender')}
          error={errors.gender}
        />
        <View style={styles.readOnly}>
          <InfoRow label={t('profile.email')} value={driver.email ?? user.email} missing={missing} />
          <InfoRow label={t('profile.document')} value={driver.document} missing={missing} />
          <InfoRow label={t('profile.birthDate')} value={birthDate} missing={missing} />
          <Text style={styles.caption}>{t('profile.readOnlyNote')}</Text>
        </View>

        {hasVehicle ? (
          <>
            <Text style={styles.section}>{t('profile.vehicle')}</Text>
            <View style={styles.readOnly}>
              <InfoRow label={t('profile.category')} value={t(`category.${category}`)} missing={missing} />
              <InfoRow label={t('profile.plate')} value={vehicle.plate} missing={missing} />
              <InfoRow
                label={t('profile.vehicleName')}
                value={`${vehicle.brand ?? ''} ${vehicle.model ?? ''} · ${vehicle.year ?? ''}`.trim()}
                missing={missing}
              />
            </View>
            <SelectField
              label={t('profile.color')}
              value={form.vehicleColor}
              options={VEHICLE_COLORS}
              onChange={setField('vehicleColor')}
              error={errors.vehicleColor}
            />
            <FormField label={t('profile.capacity')} {...digits('vehicleCapacity', 2)} />
          </>
        ) : null}

        {hasDocuments ? (
          <>
            <Text style={styles.section}>{t('profile.documents')}</Text>
            <DocumentBlock
              title={t('profile.license')}
              detail={documents.licenseNumber}
              value={form.licenseExpiry}
              onChange={setField('licenseExpiry')}
              error={errors.licenseExpiry}
              t={t}
            />
            <DocumentBlock
              title={t('profile.soat')}
              value={form.soatExpiry}
              onChange={setField('soatExpiry')}
              error={errors.soatExpiry}
              t={t}
            />
            {hasTechnicalReview ? (
              <DocumentBlock
                title={t('profile.technical')}
                value={form.techExpiry}
                onChange={setField('techExpiry')}
                error={errors.techExpiry}
                t={t}
              />
            ) : null}
            <FormField
              label={t('profile.mpEmail')}
              value={form.mercadoPagoEmail}
              onChangeText={setField('mercadoPagoEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.mercadoPagoEmail}
            />
          </>
        ) : null}

        <Text style={styles.section}>{t('profile.settings')}</Text>
        <SegmentedField label={t('profile.language')} value={language} options={LANGUAGE_OPTIONS} onChange={setLanguage} />

        {message ? (
          <Text style={[styles.message, message.type === 'error' && styles.messageError]}>{message.text}</Text>
        ) : null}
        <Pressable
          style={[styles.primary, (!dirty || busy) && styles.disabled]}
          onPress={handleSave}
          disabled={!dirty || busy}
          accessibilityRole="button"
          accessibilityLabel={t('profile.save')}
        >
          <Text style={styles.primaryText}>{t('profile.save')}</Text>
        </Pressable>
        {dirty ? (
          <Pressable style={styles.link} onPress={handleDiscard} disabled={busy} accessibilityRole="button">
            <Text style={styles.linkText}>{t('profile.cancel')}</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.logout} onPress={signOut} accessibilityRole="button" accessibilityLabel={t('profile.logout')}>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg * 2 },
  header: { alignItems: 'center', gap: spacing.xs, paddingBottom: spacing.sm },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  initials: { ...typography.title, color: colors.text },
  name: { ...typography.heading, color: colors.text, textAlign: 'center' },
  approved: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  section: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  caption: { ...typography.caption, color: colors.textMuted },
  readOnly: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.body, color: colors.text, flexShrink: 1, textAlign: 'right' },
  document: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  documentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  documentTexts: { flex: 1, gap: 2 },
  documentTitle: { ...typography.bodyStrong, color: colors.text },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { ...typography.caption, color: colors.text },
  message: { ...typography.caption, color: colors.success },
  messageError: { color: colors.danger },
  primary: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginTop: spacing.sm },
  primaryText: { ...typography.bodyStrong, color: colors.onPrimary },
  disabled: { opacity: 0.4 },
  link: { alignItems: 'center', justifyContent: 'center', height: 36 },
  linkText: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'underline' },
  logout: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  logoutText: { ...typography.bodyStrong, color: colors.danger },
});
