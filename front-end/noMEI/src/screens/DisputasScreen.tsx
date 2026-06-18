import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import {
   Header,
   EmptyState,
   DisputaCard,
} from "../components";
import type { DisputaItem } from "../components";
import { colors, spacing, borderRadius, textPresets } from "../theme";
import type { MainTabScreenProps } from "../types";

type Props = MainTabScreenProps<"Disputas">;
type Tab = "open" | "closed";

// TODO: substituir por chamada real a GET /api/v1/disputas/minhas quando o
// endpoint for implementado no back-end.
const OPEN_DISPUTAS: DisputaItem[] = [];
const CLOSED_DISPUTAS: DisputaItem[] = [];

export function DisputasScreen({ navigation }: Props): React.JSX.Element {
   const [activeTab, setActiveTab] = useState<Tab>("open");

   const disputas = activeTab === "open" ? OPEN_DISPUTAS : CLOSED_DISPUTAS;

   return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
         <Header
            variant="screen"
            title="Licitações"
            notificationCount={0}
            onNotificationPress={() => {}}
         />

         <View style={styles.titleArea}>
            <Text style={styles.screenTitle}>Minhas Disputas</Text>
            <Text style={styles.screenSubtitle}>
               Acompanhe o andamento das suas participações.
            </Text>

            <View style={styles.tabsRow}>
               <TouchableOpacity
                  style={styles.tab}
                  onPress={() => setActiveTab("open")}
                  activeOpacity={0.7}
               >
                  <Text
                     style={[
                        styles.tabLabel,
                        activeTab === "open" && styles.tabLabelActive,
                     ]}
                  >
                     Em Aberto
                  </Text>
                  {activeTab === "open" && <View style={styles.tabUnderline} />}
               </TouchableOpacity>

               <TouchableOpacity
                  style={styles.tab}
                  onPress={() => setActiveTab("closed")}
                  activeOpacity={0.7}
               >
                  <Text
                     style={[
                        styles.tabLabel,
                        activeTab === "closed" && styles.tabLabelActive,
                     ]}
                  >
                     Encerradas
                  </Text>
                  {activeTab === "closed" && (
                     <View style={styles.tabUnderline} />
                  )}
               </TouchableOpacity>
            </View>
            <View style={styles.tabsDivider} />
         </View>

         <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
         >
            {disputas.length === 0 ? (
               activeTab === "open" ? (
                  <EmptyState
                     icon="file-tray-outline"
                     title="Nenhuma disputa em aberto"
                     description="Quando você participar de uma licitação, ela aparecerá aqui."
                  />
               ) : (
                  <EmptyState
                     icon="checkmark-done-circle-outline"
                     title="Nenhuma disputa encerrada"
                     description="Suas disputas finalizadas aparecerão aqui."
                  />
               )
            ) : (
               disputas.map((item) => (
                  <DisputaCard
                     key={item.id}
                     item={item}
                     onPressDetails={() =>
                        navigation.navigate("DetalhesLicitacao", {
                           bidId: item.id,
                           bidTitle: item.title,
                        })
                     }
                     onPressContract={() => {}}
                  />
               ))
            )}
         </ScrollView>
      </SafeAreaView>
   );
}


const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: colors.background,
   },
   titleArea: {
      backgroundColor: colors.white,
      paddingHorizontal: spacing[4],
      paddingTop: spacing[4],
   },
   screenTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.textPrimary,
      lineHeight: 28,
   },
   screenSubtitle: {
      ...textPresets.bodyMd,
      color: colors.textSecondary,
      marginTop: spacing[1],
   },
   tabsRow: {
      flexDirection: "row",
      marginTop: spacing[4],
   },
   tab: {
      paddingBottom: spacing[2],
      marginRight: spacing[5],
      position: "relative",
   },
   tabLabel: {
      ...textPresets.labelMd,
      color: colors.textSecondary,
   },
   tabLabelActive: {
      color: colors.primary,
   },
   tabUnderline: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
   },
   tabsDivider: {
      height: 1,
      backgroundColor: colors.border,
   },
   scroll: {
      flex: 1,
   },
   content: {
      padding: spacing[4],
      gap: spacing[3],
      paddingBottom: spacing[8],
   },
});
