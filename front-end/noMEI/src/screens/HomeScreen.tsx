import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Header, BidCard, EmptyState, ErrorState, Input } from "../components";
import { colors, spacing, textPresets } from "../theme";
import { useLicitacoes } from "../hooks";
import { useProfile } from "../context/ProfileContext";
import { getMe } from "../services/authService";
import type { MainTabScreenProps } from "../types";
import { Ionicons } from "@expo/vector-icons";

const BRAZIL_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type Props = MainTabScreenProps<"Inicio">;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { selectedCategories, selectedLabels, nome, setNome } = useProfile();

  const [busca, setBusca] = useState("");

  useEffect(() => {
    getMe().then((user) => setNome(user.nome)).catch(() => { });
  }, []);

  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [selectedUf, setSelectedUf] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusca(busca.trim()), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const { items, loading, error } = useLicitacoes({
    limit: 100,
    busca: debouncedBusca || undefined,
    uf: selectedUf ?? undefined,
  });

  const recommendedItems = useMemo(() => {
    const hasPreferences = selectedCategories.length > 0 || selectedLabels.length > 0;
    if (!hasPreferences) return items;

    const labelsLower = selectedLabels.map((l) => l.toLowerCase());

    const scored = items.flatMap((bid) => {
      const categoryMatch = selectedCategories.includes(bid.category);
      const titleLower = bid.title.toLowerCase();
      const textMatch = labelsLower.some((label) => titleLower.includes(label));

      if (categoryMatch) return [{ ...bid, compatibility: 100 }];
      if (textMatch) return [{ ...bid, compatibility: 50 }];
      return [];
    });

    return scored.sort((a, b) => b.compatibility - a.compatibility);
  }, [items, selectedCategories, selectedLabels]);

  const recentHistoryItems = useMemo(() => {
    const participacoes = items.filter(bid => bid.status !== "open");
    return participacoes.length > 0 ? participacoes.slice(0, 3) : items.slice(0, 3);
  }, [items]);

  const dashboardStats = useMemo(() => {
    return {
      open: items.filter((bid) => bid.status === "open").length,
      analysis: items.filter((bid) => bid.status === "analysis").length,
      sent: items.filter((bid) => bid.status === "sent").length,
      winner: items.filter((bid) => bid.status === "winner").length,
    };
  }, [items]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Em aberto";
      case "analysis": return "Em análise";
      case "sent": return "Enviada";
      case "winner": return "Vencedora";
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Header
        variant="default"
        notificationCount={3}
        onNotificationPress={() => navigation.navigate("Alertas")}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Olá, {nome ?? "..."}! 👋</Text>
        <Text style={styles.subtitle}>Bem-vindo ao seu painel de licitações.</Text>

        <Text style={styles.sectionTitle}>Resumo das suas participações</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard} accessible={true} accessibilityRole="text">
            <Ionicons name="folder-open-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{dashboardStats.open}</Text>
            <Text style={styles.statLabel}>Em aberto</Text>
          </View>

          <View style={styles.statCard} accessible={true} accessibilityRole="text">
            <Ionicons name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{dashboardStats.analysis}</Text>
            <Text style={styles.statLabel}>Em análise</Text>
          </View>

          <View style={styles.statCard} accessible={true} accessibilityRole="text">
            <Ionicons name="send-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{dashboardStats.sent}</Text>
            <Text style={styles.statLabel}>Enviadas</Text>
          </View>

          <View style={styles.statCard} accessible={true} accessibilityRole="text">
            <Ionicons name="trophy-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{dashboardStats.winner}</Text>
            <Text style={styles.statLabel}>Vencedoras</Text>
          </View>
        </View>

        <Input
          leftIcon="search-outline"
          placeholder="Buscar licitações..."
          value={busca}
          onChangeText={setBusca}
          clearable
          returnKeyType="search"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ufRow}
          style={styles.ufScroll}
        >
          <TouchableOpacity
            style={[styles.ufChip, selectedUf === null && styles.ufChipActive]}
            onPress={() => setSelectedUf(null)}
          >
            <Text style={[styles.ufChipText, selectedUf === null && styles.ufChipTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>

          {BRAZIL_UFS.map((uf) => (
            <TouchableOpacity
              key={uf}
              style={[styles.ufChip, selectedUf === uf && styles.ufChipActive]}
              onPress={() => setSelectedUf((prev) => (prev === uf ? null : uf))}
            >
              <Text style={[styles.ufChipText, selectedUf === uf && styles.ufChipTextActive]}>
                {uf}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Histórico recente</Text>

        <View style={styles.historyContainer}>
          {recentHistoryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyCard}
              accessible={true}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate("DetalhesLicitacao", {
                  bidId: item.id,
                  bidTitle: item.title,
                  agency: item.agency,
                  value: item.value,
                  status: item.status,
                })
              }
            >
              <View style={styles.historyTextContainer}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.historyStatus}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}

          {!loading && recentHistoryItems.length === 0 && (
            <Text style={styles.emptyHistoryText}>
              Nenhuma atividade recente encontrada.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Recomendadas para você</Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        )}

        {error && !loading && (
          <ErrorState title="Erro ao carregar licitações" description={error} />
        )}

        {!loading && !error && recommendedItems.map((bid) => (
          <BidCard
            key={bid.id}
            title={bid.title}
            agency={bid.agency}
            value={bid.value ?? 0}
            status={bid.status}
            deadline={bid.deadline}
            compatibility={bid.compatibility}
            onPress={() =>
              navigation.navigate("DetalhesLicitacao", {
                bidId: bid.id,
                bidTitle: bid.title,
                agency: bid.agency,
                value: bid.value,
                status: bid.status,
              })
            }
          />
        ))}

        {!loading && !error && recommendedItems.length === 0 && (
          <EmptyState
            icon="search-outline"
            title="Sem recomendações no momento"
            description="Complete seu perfil para receber oportunidades alinhadas ao seu CNAE."
            actionLabel="Completar perfil"
            onAction={() => navigation.navigate("Perfil")}
          />
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  greeting: {
    ...textPresets.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...textPresets.bodyMd,
    color: colors.textSecondary,
    marginTop: -spacing[1],
  },
  sectionTitle: {
    ...textPresets.h5,
    color: colors.textPrimary,
    marginTop: spacing[2],
  },
  ufScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  ufRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  ufChip: {
    paddingHorizontal: spacing[3],
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  ufChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ufChipText: {
    ...textPresets.bodyMd,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  ufChipTextActive: {
    color: colors.white,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing[3],
    marginTop: spacing[2],
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    alignItems: "center",
  },
  statValue: {
    ...textPresets.h2,
    color: colors.primary,
  },
  statLabel: {
    ...textPresets.bodySm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  historyContainer: {
    marginTop: spacing[1],
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing[4],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  historyTextContainer: {
    flex: 1,
    paddingRight: spacing[2],
  },
  historyTitle: {
    ...textPresets.labelMd,
    color: colors.textPrimary,
  },
  historyStatus: {
    ...textPresets.bodySm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  emptyHistoryText: {
    ...textPresets.bodyMd,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing[2],
  },
  loader: {
    marginVertical: spacing[6],
  },
});