import React from "react";
import {
   StyleSheet,
   Text,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components";
import { colors, spacing } from "../theme";
import type { RootStackScreenProps } from "../types";

type Props = RootStackScreenProps<"CadastroSucesso">;

export function CadastroSucessoScreen({ navigation }: Props): React.JSX.Element {
   function handleIrParaDashboard(): void {
      navigation.reset({
         index: 0,
         routes: [{ name: "MainTabs" }],
      });
   }

   return (
      <SafeAreaView style={styles.safeArea}>
         <View style={styles.container}>
            {/* Ícone de Sucesso */}
            <View style={styles.iconContainer}>
               <View style={styles.iconBackground}>
                  <Ionicons
                     name="checkmark"
                     size={64}
                     color={colors.white}
                  />
               </View>
            </View>

            <View style={styles.contentContainer}>
               <Text style={styles.title}>Tudo pronto!</Text>
               <Text style={styles.subtitle}>
                  Sua conta foi criada com sucesso. Agora você já pode explorar as
                  melhores oportunidades para o seu negócio.
               </Text>
            </View>

            <View style={styles.buttonContainer}>
               <Button
                  label="Ir para a tela inicial"
                  onPress={handleIrParaDashboard}
                  variant="primary"
                  size="lg"
                  fullWidth
               />
            </View>
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: colors.white,
   },
   container: {
      flex: 1,
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[8],
      justifyContent: "space-between",
      alignItems: "center",
   },
   iconContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   iconBackground: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
   },
   contentContainer: {
      alignItems: "center",
      marginVertical: spacing[8],
   },
   title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.dark,
      marginBottom: spacing[3],
      textAlign: "center",
   },
   subtitle: {
      fontSize: 16,
      fontWeight: "400",
      color: "rgba(0, 0, 0, 0.6)",
      textAlign: "center",
      lineHeight: 24,
   },
   buttonContainer: {
      width: "100%",
   },
});
