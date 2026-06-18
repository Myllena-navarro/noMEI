import React, { useState } from "react";
import {
   ActivityIndicator,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
   Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "../components";
import { colors, spacing } from "../theme";
import { login } from "../services";
import { fetchMinhaPerfil } from "../services/perfilService";
import { useProfile } from "../context/ProfileContext";
import type { RootStackScreenProps } from "../types";

type Props = RootStackScreenProps<"Onboarding">;

export function OnboardingScreen({ navigation }: Props): React.JSX.Element {
   const { setCnpj } = useProfile();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");

   async function handleLogin(): Promise<void> {
      if (!email || !password) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
         setError('E-mail inválido');
         return;
      }
      setError("");
      setIsLoading(true);
      try {
         await login(email, password);
         const perfil = await fetchMinhaPerfil().catch(() => null);
         if (perfil?.cnpj) {
            setCnpj(perfil.cnpj);
            navigation.navigate("MainTabs");
         } else {
            navigation.navigate("ProfileSetup", {});
         }
      } catch (err) {
         setError(err instanceof Error ? err.message : "Erro ao fazer login");
      } finally {
         setIsLoading(false);
      }
   }

   function handleCreateAccount(): void {
      navigation.navigate("CadastroIdentificacao");
   }

   function handleForgotPassword(): void {
      navigation.navigate("RecuperacaoEmail");
   }

   return (
      <SafeAreaView style={styles.safeArea}>
         <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
         >
            <View style={styles.logoContainer}>
               <Text style={styles.logoText}>no</Text>
               <Text style={styles.logoTextBold}>MEI</Text>
            </View>

            <View style={styles.imageContainer}>
               <Image
                  source={require("../../assets/noMEI.png")}
                  style={styles.image}
                  resizeMode="contain"
               />
            </View>

            <Text style={styles.loginTitle}>Login</Text>

            <View style={styles.formContainer}>
               <Input
                  label="E-mail"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
               />

               <Input
                  label="Senha"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
               />

               <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                  style={styles.forgotPasswordLink}
               >
                  <Text style={styles.forgotPasswordText}>
                     Esqueci minha senha
                  </Text>
               </TouchableOpacity>
            </View>

            {error ? (
               <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <View style={styles.buttonContainer}>
               <Button
                  label={isLoading ? "Entrando..." : "Entrar"}
                  onPress={handleLogin}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isLoading || !email || !password}
               />

               <Button
                  label="Criar uma conta"
                  onPress={handleCreateAccount}
                  variant="outline"
                  size="lg"
                  fullWidth
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
   scrollContent: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[4],
      paddingBottom: spacing[8],
      alignItems: "center",
   },
   logoContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      alignSelf: "center",
      marginBottom: spacing[4],
   },
   logoText: {
      fontSize: 24,
      fontWeight: "400",
      color: colors.dark,
      letterSpacing: -0.5,
   },
   logoTextBold: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: -0.5,
   },
   imageContainer: {
      width: "100%",
      height: 200,
      marginBottom: spacing[4],
      alignItems: "center",
      justifyContent: "center",
   },
   image: {
      width: "80%",
      height: "100%",
      resizeMode: "contain",
   },
   loginTitle: {
      fontSize: 32,
      fontWeight: "600",
      color: colors.dark,
      marginBottom: spacing[6],
      textAlign: "center",
   },
   formContainer: {
      width: "100%",
      gap: spacing[4],
      marginBottom: spacing[6],
   },
   forgotPasswordLink: {
      alignItems: "flex-end",
      paddingTop: spacing[1],
   },
   forgotPasswordText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary,
   },
   buttonContainer: {
      width: "100%",
      gap: spacing[3],
   },
   errorText: {
      color: colors.error ?? '#dc2626',
      fontSize: 14,
      textAlign: "center",
      marginBottom: spacing[3],
   },
});
