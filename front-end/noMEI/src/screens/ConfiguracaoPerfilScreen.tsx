import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components';
import { colors, spacing, borderRadius, shadows, textPresets } from '../theme';
import { useProfile } from '../context/ProfileContext';
import { fetchMinhaPerfil, saveMinhaPerfil } from '../services/perfilService';
import { getMe } from '../services/authService';
import type { RootStackScreenProps } from '../types';

type Props = RootStackScreenProps<"ProfileSetup">;

const INTEREST_AREAS = [
  { id: 'tech', label: 'Tecnologia', icon: 'laptop-outline' as const, category: null },
  { id: 'office', label: 'Material de Escritório', icon: 'documents-outline' as const, category: null },
  { id: 'cleaning', label: 'Limpeza', icon: 'sparkles-outline' as const, category: null },
  { id: 'food', label: 'Alimentação', icon: 'restaurant-outline' as const, category: null },
  { id: 'construction', label: 'Construção', icon: 'construct-outline' as const, category: null },
  { id: 'health', label: 'Saúde', icon: 'medkit-outline' as const, category: null },
  { id: 'transport', label: 'Transporte', icon: 'car-outline' as const, category: null },
  { id: 'consulting', label: 'Consultoria', icon: 'briefcase-outline' as const, category: null },
  { id: 'security', label: 'Segurança', icon: 'shield-outline' as const, category: null },
  { id: 'events', label: 'Eventos', icon: 'calendar-outline' as const, category: null },
  { id: 'dispensa', label: 'Dispensa', icon: 'receipt-outline' as const, category: 'Dispensa' },
  { id: 'concurso', label: 'Concurso', icon: 'trophy-outline' as const, category: 'Concurso' },
];

export function ConfiguracaoPerfilScreen({ navigation, route }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { setSelectedAreas: saveToContext, setCnpj } = useProfile();
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['tech', 'office']);

  const { nome, email, cpfCnpj } = route.params || {};

  // Dados vindos da API (quando não chegam por params — fluxo de login)
  const [nameToDisplay, setNameToDisplay] = useState<string>(nome ?? '');
  const [cnpjToDisplay, setCnpjToDisplay] = useState<string>(cpfCnpj ?? '');
  const [cnaeToDisplay, setCnaeToDisplay] = useState<string>('');
  const [loadingGovData, setLoadingGovData] = useState(!nome && !cpfCnpj);

  useEffect(() => {
    // Se os dados já vieram por params (fluxo de cadastro), não precisa buscar
    if (nome && cpfCnpj) return;

    setLoadingGovData(true);
    Promise.all([
      getMe().catch(() => null),
      fetchMinhaPerfil().catch(() => null),
    ]).then(([user, perfil]) => {
      if (user?.nome) setNameToDisplay(user.nome);
      if (perfil?.cnpj) setCnpjToDisplay(perfil.cnpj);
      if (perfil?.cnae) setCnaeToDisplay(perfil.cnae);
    }).finally(() => {
      setLoadingGovData(false);
    });
  }, []);

   function toggleArea(id: string): void {
      setSelectedAreas((prev) =>
         prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
      );
   }

  function handleSave(): void {
    const selected = INTEREST_AREAS.filter((area) => selectedAreas.includes(area.id));
    const categories = selected
      .filter((area) => area.category !== null)
      .map((area) => area.category as string);
    const labels = selected.map((area) => area.label);
    saveToContext(selectedAreas, categories, labels);

    // Só persiste se tiver CNPJ real — nunca salva string vazia ou dado falso
    if (cnpjToDisplay) {
      setCnpj(cnpjToDisplay);
      saveMinhaPerfil({
        cnpj: cnpjToDisplay,
        cnae: cnaeToDisplay || undefined,
      }).catch(() => {
        // silently ignore — cnpj already set in context
      });
    }

    if (nome) {
      navigation.navigate('CadastroSucesso');
    } else {
      navigation.navigate('MainTabs');
    }
  }

   return (
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
         {/* Header */}
         <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
            <TouchableOpacity
               onPress={() => navigation.goBack()}
               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
               <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
               <Text style={styles.headerTitle}>Confirme seus dados</Text>
               <Text style={styles.headerSubtitle}>
                  Revise suas informações na base do governo.
               </Text>
            </View>
         </View>

         <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
         >
            {/* Seção Gov.br */}
            <View style={styles.section}>
               <View style={styles.sectionHeaderRow}>
                  <Ionicons
                     name="shield-checkmark"
                     size={16}
                     color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Dados do Gov.br</Text>
               </View>

               <View style={styles.card}>
                  {loadingGovData ? (
                     <ActivityIndicator
                        size="small"
                        color={colors.primary}
                        style={{ paddingVertical: spacing[4] }}
                     />
                  ) : (
                     <>
                        <DataRow
                           icon="person-outline"
                           label="Nome"
                           value={nameToDisplay || 'Não informado'}
                        />
                        {!!email && (
                           <>
                              <View style={styles.divider} />
                              <DataRow
                                 icon="mail-outline"
                                 label="E-mail"
                                 value={email}
                              />
                           </>
                        )}
                        <View style={styles.divider} />
                        <DataRow
                           icon="business-outline"
                           label="CNPJ"
                           value={cnpjToDisplay || 'Não informado'}
                        />
                        <View style={styles.divider} />
                        <DataRow
                           icon="grid-outline"
                           label="CNAE"
                           value={cnaeToDisplay || 'Não informado'}
                        />
                     </>
                  )}
               </View>

               <View style={styles.govbrBadge}>
                  <Ionicons
                     name="checkmark-circle"
                     size={14}
                     color={colors.success}
                  />
                  <Text style={styles.govbrBadgeText}>
                     Verificado pelo Gov.br
                  </Text>
               </View>
            </View>

            {/* Seção Áreas de Interesse */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Áreas de Interesse</Text>
               <Text style={styles.sectionDescription}>
                  Selecione as áreas que você deseja receber oportunidades.
               </Text>

               <View style={styles.chipsContainer}>
                  {INTEREST_AREAS.map((area) => {
                     const isSelected = selectedAreas.includes(area.id);
                     return (
                        <TouchableOpacity
                           key={area.id}
                           onPress={() => toggleArea(area.id)}
                           style={[
                              styles.chip,
                              isSelected && styles.chipSelected,
                           ]}
                           activeOpacity={0.75}
                        >
                           <Ionicons
                              name={area.icon}
                              size={14}
                              color={
                                 isSelected
                                    ? colors.primary
                                    : colors.textSecondary
                              }
                           />
                           <Text
                              style={[
                                 styles.chipLabel,
                                 isSelected && styles.chipLabelSelected,
                              ]}
                           >
                              {area.label}
                           </Text>
                        </TouchableOpacity>
                     );
                  })}
               </View>

               {selectedAreas.length > 0 && (
                  <Text style={styles.selectedCount}>
                     {selectedAreas.length} área
                     {selectedAreas.length > 1 ? "s" : ""} selecionada
                     {selectedAreas.length > 1 ? "s" : ""}
                  </Text>
               )}
            </View>

            {/* CTA */}
            <Button
               label="Salvar e Ver Oportunidades"
               onPress={handleSave}
               variant="primary"
               size="lg"
               fullWidth
               rightIcon={
                  <Ionicons
                     name="arrow-forward"
                     size={20}
                     color={colors.white}
                  />
               }
               style={styles.ctaButton}
            />
         </ScrollView>
      </SafeAreaView>
   );
}

interface DataRowProps {
   icon: keyof typeof Ionicons.glyphMap;
   label: string;
   value: string;
}

function DataRow({ icon, label, value }: DataRowProps): React.JSX.Element {
   return (
      <View style={dataRowStyles.row}>
         <View style={dataRowStyles.iconWrapper}>
            <Ionicons name={icon} size={16} color={colors.primary} />
         </View>
         <View style={dataRowStyles.textWrapper}>
            <Text style={dataRowStyles.label}>{label}</Text>
            <Text style={dataRowStyles.value} numberOfLines={2}>
               {value}
            </Text>
         </View>
      </View>
   );
}

const dataRowStyles = StyleSheet.create({
   row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing[3],
      paddingVertical: spacing[3],
   },
   iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
   },
   textWrapper: {
      flex: 1,
   },
   label: {
      ...textPresets.labelSm,
      color: colors.textSecondary,
      marginBottom: 2,
   },
   value: {
      ...textPresets.bodyMd,
      color: colors.textPrimary,
   },
});

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: colors.background,
   },
   header: {
      backgroundColor: colors.dark,
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[5],
      gap: spacing[3],
   },
   headerCenter: {
      gap: spacing[1],
   },
   headerTitle: {
      ...textPresets.h3,
      color: colors.white,
   },
   headerSubtitle: {
      ...textPresets.bodyMd,
      color: "rgba(255,255,255,0.7)",
   },
   scrollView: {
      flex: 1,
   },
   scrollContent: {
      padding: spacing[4],
      paddingBottom: spacing[10],
      gap: spacing[5],
   },
   section: {
      gap: spacing[3],
   },
   sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[2],
   },
   sectionTitle: {
      ...textPresets.h5,
      color: colors.textPrimary,
   },
   sectionDescription: {
      ...textPresets.bodyMd,
      color: colors.textSecondary,
      marginTop: -spacing[1],
   },
   card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing[4],
      ...shadows.sm,
   },
   divider: {
      height: 1,
      backgroundColor: colors.border,
   },
   govbrBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[1],
      alignSelf: "flex-start",
   },
   govbrBadgeText: {
      ...textPresets.bodySm,
      color: colors.success,
   },
   chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
   },
   chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[1],
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.white,
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
   },
   chipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
   },
   chipLabel: {
      ...textPresets.labelSm,
      color: colors.textSecondary,
   },
   chipLabelSelected: {
      color: colors.primary,
   },
   selectedCount: {
      ...textPresets.bodySm,
      color: colors.textSecondary,
   },
   ctaButton: {
      marginTop: spacing[2],
   },
});
