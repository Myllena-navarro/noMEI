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
import { Button, Input } from "../components";
import { colors, spacing } from "../theme";
import type { RootStackScreenProps } from "../types";

type Props = RootStackScreenProps<"CadastroIdentificacao">;

export function CadastroIdentificacaoScreen({
   navigation,
}: Props): React.JSX.Element {
   const insets = useSafeAreaInsets();
   const [nome, setNome] = useState("");
   const [email, setEmail] = useState("");
   const [emailError, setEmailError] = useState("");
   const [isEmailValid, setIsEmailValid] = useState(false);
   const [cnpj, setCnpj] = useState("");
   const [cnpjError, setCnpjError] = useState("");
   const [isCnpjValid, setIsCnpjValid] = useState(false);

   useEffect(() => {
      if (email.length === 0) {
         setEmailError("");
         setIsEmailValid(false);
         return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);

      if (!isValid) {
         setEmailError("E-mail inválido");
         setIsEmailValid(false);
      } else {
         setEmailError("");
         setIsEmailValid(true);
      }
   }, [email]);

   useEffect(() => {
      const onlyNumbers = cnpj.replace(/\D/g, "");
      const isValidCNPJ = onlyNumbers.length === 14;
      
      if (onlyNumbers.length > 0 && onlyNumbers.length !== 14) {
         setCnpjError("CNPJ deve ter 14 dígitos");
         setIsCnpjValid(false);
      } else {
         setCnpjError("");
         setIsCnpjValid(isValidCNPJ);
      }
   }, [cnpj]);

   const isFormValid = nome && email && isEmailValid && cnpj && isCnpjValid;

   function handleContinuar(): void {
      if (isFormValid) {
         navigation.navigate("CadastroSenha", {
            nome,
            email,
            cpfCnpj: cnpj,
         });
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
               <View style={[styles.progressDot, styles.progressDotActive]} />
               <View style={styles.progressLine} />
               <View style={styles.progressDot} />
               <View style={styles.progressLine} />
               <View style={styles.progressDot} />
            </View>

            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>
               Comece preenchendo seus dados básicos
            </Text>

            <View style={styles.formContainer}>
               <Input
                  label="Nome completo"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
               />

               <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
               />

               <Input
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChangeText={setCnpj}
                  keyboardType="numeric"
                  error={cnpjError}
               />
            </View>

            <View style={styles.buttonContainer}>
               <Button
                  label="Continuar"
                  onPress={handleContinuar}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!isFormValid}
                  rightIcon={
                     <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={colors.white}
                     />
                  }
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
      marginBottom: spacing[8],
   },
   buttonContainer: {
      width: "100%",
   },
});
