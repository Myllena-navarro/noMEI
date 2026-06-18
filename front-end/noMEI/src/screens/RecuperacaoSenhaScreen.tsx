import React, { useState, useEffect } from "react";
import {
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, ValidationItem } from "../components";
import { colors, spacing } from "../theme";
import { resetPassword } from "../services";
import type { RootStackScreenProps } from "../types";

type Props = RootStackScreenProps<"RecuperacaoSenha">;

interface PasswordValidation {
   minLength: boolean;
   hasNumber: boolean;
   hasSymbol: boolean;
}

export function RecuperacaoSenhaScreen({
   navigation,
   route,
}: Props): React.JSX.Element {
   const insets = useSafeAreaInsets();
   const [token, setToken] = useState("");
   const [novaSenha, setNovaSenha] = useState("");
   const [confirmarSenha, setConfirmarSenha] = useState("");
   const [showNovaSenha, setShowNovaSenha] = useState(false);
   const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");
   const [validation, setValidation] = useState<PasswordValidation>({
      minLength: false,
      hasNumber: false,
      hasSymbol: false,
   });

   const { email } = route.params;

   useEffect(() => {
      setValidation({
         minLength: novaSenha.length >= 8,
         hasNumber: /\d/.test(novaSenha),
         hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(novaSenha),
      });
   }, [novaSenha]);

   const isValidPassword =
      validation.minLength && validation.hasNumber && validation.hasSymbol;
   const canSubmit = token.trim().length > 0 && novaSenha === confirmarSenha && isValidPassword;

   async function handleAlterarSenha(): Promise<void> {
      if (!canSubmit) return;
      setError("");
      setIsLoading(true);
      try {
         await resetPassword(token.trim(), novaSenha);
         navigation.navigate("Onboarding");
      } catch (err) {
         setError(err instanceof Error ? err.message : "Erro ao redefinir senha");
      } finally {
         setIsLoading(false);
      }
   }

   function handleBackPress(): void {
      navigation.goBack();
   }

   return (
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
         <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
            <TouchableOpacity onPress={handleBackPress} activeOpacity={0.7}>
               <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>noMEI</Text>
            <View style={{ width: 24 }} />
         </View>

         <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
         >
            <Text style={styles.title}>Criar Nova Senha</Text>
            <Text style={styles.subtitle}>
               Digite uma nova senha forte para proteger sua conta
            </Text>

            <View style={styles.emailDisplay}>
               <Ionicons name="mail-outline" size={18} color={colors.primary} />
               <Text style={styles.emailText}>{email}</Text>
            </View>

            <View style={styles.formContainer}>
               <Input
                  label="CÓDIGO DE VERIFICAÇÃO"
                  placeholder="Cole o código recebido por e-mail"
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                  autoCorrect={false}
               />

               <Input
                  label="NOVA SENHA"
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry={!showNovaSenha}
                  rightIcon={showNovaSenha ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowNovaSenha(!showNovaSenha)}
               />

               <Input
                  label="CONFIRMAR SENHA"
                  placeholder="Repita sua nova senha"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry={!showConfirmarSenha}
                  rightIcon={showConfirmarSenha ? "eye-off" : "eye"}
                  onRightIconPress={() =>
                     setShowConfirmarSenha(!showConfirmarSenha)
                  }
               />
            </View>

            <View style={styles.validationContainer}>
               <Text style={styles.validationTitle}>
                  Sua senha deve conter:
               </Text>

               <ValidationItem
                  icon="checkmark-circle"
                  label="Mínimo de 8 caracteres"
                  isValid={validation.minLength}
               />
               <ValidationItem
                  icon="checkmark-circle"
                  label="Pelo menos um número"
                  isValid={validation.hasNumber}
               />
               <ValidationItem
                  icon="checkmark-circle"
                  label="Pelo menos um símbolo (ex: @, #, $, %)"
                  isValid={validation.hasSymbol}
               />
            </View>

            <View style={styles.buttonContainer}>
               {error ? (
                  <Text style={styles.errorText}>{error}</Text>
               ) : null}
               <Button
                  label={isLoading ? "Alterando..." : "Alterar Senha"}
                  onPress={handleAlterarSenha}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!canSubmit || isLoading}
               />
            </View>
         </ScrollView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: colors.white,
   },
   header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary,
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
   },
   headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.white,
   },
   scrollContent: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[6],
      paddingBottom: spacing[8],
   },
   title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.dark,
      marginBottom: spacing[2],
      textAlign: "center",
   },
   subtitle: {
      fontSize: 14,
      fontWeight: "400",
      color: "rgba(0, 0, 0, 0.6)",
      marginBottom: spacing[6],
      lineHeight: 20,
      textAlign: "center",
   },
   emailDisplay: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[2],
      backgroundColor: "rgba(45, 91, 227, 0.1)",
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderRadius: 8,
      marginBottom: spacing[6],
   },
   emailText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary,
      flex: 1,
   },
   formContainer: {
      gap: spacing[4],
      marginBottom: spacing[6],
   },
   validationContainer: {
      marginBottom: spacing[8],
   },
   validationTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.dark,
      marginBottom: spacing[3],
   },
   buttonContainer: {
      width: "100%",
   },
   errorText: {
      color: colors.error ?? '#dc2626',
      fontSize: 14,
      textAlign: "center",
      marginBottom: spacing[3],
   },
});
