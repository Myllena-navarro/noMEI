import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header, EmptyState } from "../components";
import { colors, spacing, borderRadius, shadows, textPresets } from "../theme";
import { fetchAlertas, markAlertaRead, markAllAlertasRead } from "../services/alertasService";
import type { Alerta } from "../services/alertasService";
import type { RootStackScreenProps } from "../types";

type Props = RootStackScreenProps<"Alertas">;

const ALERT_TYPE_CONFIG = {
   new_bid: {
      icon: "megaphone-outline" as const,
      color: colors.primary,
      bg: colors.primaryLight,
   },
   deadline: {
      icon: "time-outline" as const,
      color: colors.warning,
      bg: colors.warningLight,
   },
   status_change: {
      icon: "swap-horizontal-outline" as const,
      color: colors.success,
      bg: colors.successLight,
   },
   document: {
      icon: "document-outline" as const,
      color: colors.error,
      bg: colors.errorLight,
   },
};

export function AlertasScreen({ navigation }: Props): React.JSX.Element {
   const [alertas, setAlertas] = useState<Alerta[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [markingAll, setMarkingAll] = useState(false);

   const load = useCallback(async () => {
      setLoading(true);
      setError("");
      try {
         const data = await fetchAlertas();
         setAlertas(data.items);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Erro ao carregar notificações");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      void load();
   }, [load]);

   const unreadCount = alertas.filter((a) => !a.read).length;

   async function handleMarkRead(id: string): Promise<void> {
      // Atualização otimista
      setAlertas((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
      try {
         await markAlertaRead(id);
      } catch {
         // Reverter em caso de erro
         setAlertas((prev) => prev.map((a) => a.id === id ? { ...a, read: false } : a));
         Alert.alert('Erro', 'Não foi possível marcar o alerta como lido.');
      }
   }

   async function handleMarkAllRead(): Promise<void> {
      const unreadIds = alertas.filter((a) => !a.read).map((a) => a.id);
      if (unreadIds.length === 0) return;

      setMarkingAll(true);
      // Atualização otimista
      setAlertas((prev) => prev.map((a) => ({ ...a, read: true })));
      try {
         await markAllAlertasRead(unreadIds);
      } catch {
         // Reverter
         setAlertas((prev) => prev.map((a) =>
            unreadIds.includes(a.id) ? { ...a, read: false } : a
         ));
         Alert.alert('Erro', 'Não foi possível marcar todos como lidos.');
      } finally {
         setMarkingAll(false);
      }
   }

   return (
      <SafeAreaView style={styles.safeArea}>
         <Header
            variant="modal"
            title="Alertas & Notificações"
            onClosePress={() => navigation.goBack()}
         />

         <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
         >

            <Text style={styles.sectionTitle}>Recentes</Text>

            {unreadCount > 0 && (
               <TouchableOpacity
                  style={styles.markAllBtn}
                  onPress={handleMarkAllRead}
                  disabled={markingAll}
                  activeOpacity={0.7}
               >
                  {markingAll ? (
                     <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                     <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
                  )}
                  <Text style={styles.markAllText}>Marcar tudo como lido ({unreadCount})</Text>
               </TouchableOpacity>
            )}

            {loading && (
               <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={styles.loader}
               />
            )}

            {!loading && error ? (
               <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity onPress={load} style={styles.retryBtn}>
                     <Text style={styles.retryText}>Tentar novamente</Text>
                  </TouchableOpacity>
               </View>
            ) : null}

            {!loading && !error && alertas.length === 0 && (
               <EmptyState
                  icon="notifications-off-outline"
                  title="Sem alertas"
                  description="Você será notificado de novas oportunidades e prazos aqui."
               />
            )}

            {!loading && !error && alertas.map((alert) => {
               const config = ALERT_TYPE_CONFIG[alert.type];
               return (
                  <TouchableOpacity
                     key={alert.id}
                     style={[styles.alertCard, !alert.read && styles.alertCardUnread]}
                     onPress={() => { if (!alert.read) void handleMarkRead(alert.id); }}
                     activeOpacity={alert.read ? 1 : 0.75}
                  >
                     <View
                        style={[
                           styles.alertIcon,
                           { backgroundColor: config.bg },
                        ]}
                     >
                        <Ionicons
                           name={config.icon}
                           size={20}
                           color={config.color}
                        />
                     </View>
                     <View style={styles.alertContent}>
                        <View style={styles.alertHeader}>
                           <Text style={styles.alertTitle} numberOfLines={1}>
                              {alert.title}
                           </Text>
                           <Text style={styles.alertDate}>{alert.date}</Text>
                        </View>
                        <Text style={styles.alertMessage} numberOfLines={2}>
                           {alert.message}
                        </Text>
                     </View>
                     {!alert.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
               );
            })}
         </ScrollView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: colors.background,
   },
   titleSection: {
      backgroundColor: colors.dark,
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[5],
      gap: spacing[1],
   },
   screenTitle: {
      ...textPresets.h4,
      color: colors.white,
   },
   screenSubtitle: {
      ...textPresets.bodySm,
      color: "rgba(255,255,255,0.65)",
   },
   scroll: {
      flex: 1,
   },
   content: {
      padding: spacing[4],
      paddingBottom: spacing[10],
      gap: spacing[3],
   },
   calendarPlaceholder: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      padding: spacing[5],
      alignItems: "center",
      gap: spacing[2],
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
   },
   calendarTitle: {
      ...textPresets.labelMd,
      color: colors.textPrimary,
      textAlign: "center",
   },
   calendarSubtitle: {
      ...textPresets.bodySm,
      color: colors.textSecondary,
      textAlign: "center",
   },
   sectionTitle: {
      ...textPresets.h5,
      color: colors.textPrimary,
      marginTop: spacing[2],
   },
   alertCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      padding: spacing[3],
      gap: spacing[3],
      ...shadows.sm,
   },
   alertCardUnread: {
      backgroundColor: colors.primaryLight,
   },
   unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: spacing[1],
      flexShrink: 0,
   },
   loader: {
      marginTop: spacing[8],
   },
   markAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      alignSelf: 'flex-end',
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.full,
   },
   markAllText: {
      ...textPresets.bodySm,
      color: colors.primary,
      fontWeight: '600',
   },
   errorContainer: {
      alignItems: "center",
      gap: spacing[3],
      marginTop: spacing[8],
   },
   errorText: {
      ...textPresets.bodySm,
      color: colors.error,
      textAlign: "center",
   },
   retryBtn: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.md,
   },
   retryText: {
      ...textPresets.labelMd,
      color: colors.primary,
   },
   alertIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
   },
   alertContent: {
      flex: 1,
      gap: spacing[1],
   },
   alertHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing[2],
   },
   alertTitle: {
      ...textPresets.labelMd,
      color: colors.textPrimary,
      flex: 1,
   },
   alertDate: {
      ...textPresets.bodySm,
      color: colors.textSecondary,
      flexShrink: 0,
   },
   alertMessage: {
      ...textPresets.bodyMd,
      color: colors.textSecondary,
   },
});
