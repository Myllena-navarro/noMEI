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
import { register } from "../services";
import type { RootStackScreenProps } from "../types";

type Props = RootStackScreenProps<"CadastroSenha">;

interface PasswordValidation {
   minLength: boolean;
   hasNumber: boolean;
   hasSymbol: boolean;
}

export function CadastroSenhaScreen({ navigation, route }: Props): React.JSX.Element {
   const insets = useSafeAreaInsets();
   const [senha, setSenha] = useState("");
   const [confirmarSenha, setConfirmarSenha] = useState("");
   const [showSenha, setShowSenha] = useState(false);
   const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
   const [lgpdAccepted, setLgpdAccepted] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");
   const [validation, setValidation] = useState<PasswordValidation>({
      minLength: false,
      hasNumber: false,
      hasSymbol: false,
   });

   const { nome, email, cpfCnpj } = route.params;

   useEffect(() => {
      setValidation({
         minLength: senha.length >= 8,
         hasNumber: /\d/.test(senha),
         hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha),
      });
   }, [senha]);

   const isValidPassword =
      validation.minLength && validation.hasNumber && validation.hasSymbol;
   const passwordsMatch = senha === confirmarSenha && isValidPassword;
   const isFormValid = passwordsMatch && lgpdAccepted;

   async function handleContinuar(): Promise<void> {
      if (!isFormValid) return;
      setError("");
      setIsLoading(true);
      try {
         await register(email, senha, nome, lgpdAccepted);
         navigation.navigate("CadastroSucesso");
      } catch (err) {
         setError(err instanceof Error ? err.message : "Erro ao criar conta");
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
            <View style={styles.progressContainer}>
               <View style={styles.progressDotActive} />
               <View style={styles.progressLine} />
               <View style={[styles.progressDot, styles.progressDotActive]} />
               <View style={styles.progressLine} />
               <View style={styles.progressDot} />
            </View>

            <Text style={styles.title}>Crie sua senha</Text>
            <Text style={styles.subtitle}>
               Escolha uma senha forte para proteger seu acesso
            </Text>

            <View style={styles.formContainer}>
               <Input
                  label="SENHA"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showSenha}
                  rightIcon={showSenha ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowSenha(!showSenha)}
               />

               <Input
                  label="CONFIRMAR SENHA"
                  placeholder="Repita sua senha"
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
               <Text style={styles.validationTitle}>Sua senha deve conter:</Text>

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

            <TouchableOpacity
               style={styles.lgpdContainer}
               onPress={() => setLgpdAccepted(!lgpdAccepted)}
               activeOpacity={0.7}
            >
               <View style={[styles.checkbox, lgpdAccepted && styles.checkboxChecked]}>
                  {lgpdAccepted && (
                     <Ionicons name="checkmark" size={14} color={colors.white} />
                  )}
               </View>
               <Text style={styles.lgpdText}>
                  Li e aceito a{" "}
                  <Text style={styles.lgpdLink}>Política de Privacidade</Text>
                  {" "}e os{" "}
                  <Text style={styles.lgpdLink}>Termos de Uso</Text>
                  {", conforme a LGPD (Lei nº 13.709/2018)"}
               </Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
               {error ? (
                  <Text style={styles.errorText}>{error}</Text>
               ) : null}
               <Button
                  label={isLoading ? "Criando conta..." : "Continuar"}
                  onPress={handleContinuar}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!isFormValid || isLoading}
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
   progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing[8],
   },
   progressDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "rgba(45, 91, 227, 0.2)",
   },
   progressDotActive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
   },
   progressLine: {
      width: 40,
      height: 2,
      backgroundColor: "rgba(45, 91, 227, 0.2)",
      marginHorizontal: spacing[2],
   },
   title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.dark,
      marginBottom: spacing[2],
   },
   subtitle: {
      fontSize: 14,
      fontWeight: "400",
      color: "rgba(0, 0, 0, 0.6)",
      marginBottom: spacing[6],
      lineHeight: 20,
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
   lgpdContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing[6],
      gap: spacing[3],
   },
   checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
      flexShrink: 0,
   },
   checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
   },
   lgpdText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
   },
   lgpdLink: {
      color: colors.primary,
      fontWeight: "600",
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
