import React from "react";
import {
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
   type StyleProp,
   type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, borderRadius, textPresets } from "../theme";

interface HeaderDefaultProps {
   variant: "default";
   onNotificationPress?: () => void;
   notificationCount?: number;
}

interface HeaderBackProps {
   variant: "back";
   title: string;
   onBackPress: () => void;
}

interface HeaderScreenProps {
   variant: "screen";
   title: string;
   onNotificationPress?: () => void;
   notificationCount?: number;
}

interface HeaderDetailProps {
   variant: "detail";
   onBackPress: () => void;
   onBookmarkPress?: () => void;
   onSharePress?: () => void;
   /** true = ícone bookmark preenchido; false = outline */
   bookmarked?: boolean;
}

interface HeaderModalProps {
   variant: "modal";
   title: string;
   onClosePress: () => void;
}

type HeaderProps = (
   | HeaderDefaultProps
   | HeaderBackProps
   | HeaderScreenProps
   | HeaderDetailProps
   | HeaderModalProps
) & {
   style?: StyleProp<ViewStyle>;
};

export function Header(props: HeaderProps): React.JSX.Element {
   const insets = useSafeAreaInsets();

   if (props.variant === "detail") {
      return (
         <View
            style={[
               styles.detailContainer,
               { paddingTop: insets.top + spacing[2] },
               props.style,
            ]}
         >
            <TouchableOpacity
               onPress={props.onBackPress}
               style={styles.detailButton}
               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
               <Ionicons
                  name="arrow-back"
                  size={22}
                  color={colors.textPrimary}
               />
            </TouchableOpacity>
            <View style={styles.detailActions}>
               <TouchableOpacity
                  onPress={props.onBookmarkPress}
                  style={styles.detailButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
               >
                  <Ionicons
                     name={props.bookmarked ? "bookmark" : "bookmark-outline"}
                     size={22}
                     color={props.bookmarked ? colors.primary : colors.textPrimary}
                  />
               </TouchableOpacity>
               <TouchableOpacity
                  onPress={props.onSharePress}
                  style={styles.detailButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
               >
                  <Ionicons
                     name="share-social-outline"
                     size={22}
                     color={colors.textPrimary}
                  />
               </TouchableOpacity>
            </View>
         </View>
      );
   }

   if (props.variant === "screen") {
      const hasNotif = (props.notificationCount ?? 0) > 0;
      return (
         <View
            style={[
               styles.container,
               { paddingTop: insets.top + spacing[2] },
               props.style,
            ]}
         >
            <View style={styles.backPlaceholder} />
            <Text style={styles.screenTitle} numberOfLines={1}>
               {props.title}
            </Text>
            <TouchableOpacity
               onPress={props.onNotificationPress}
               style={styles.notificationButton}
               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
               <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.white}
               />
               {hasNotif && (
                  <View style={styles.notificationBadge}>
                     <Text style={styles.notificationBadgeText}>
                        {(props.notificationCount ?? 0) > 9
                           ? "9+"
                           : props.notificationCount}
                     </Text>
                  </View>
               )}
            </TouchableOpacity>
         </View>
      );
   }

   if (props.variant === "back") {
      return (
         <View
            style={[
               styles.container,
               { paddingTop: insets.top + spacing[2] },
               props.style,
            ]}
         >
            <TouchableOpacity
               onPress={props.onBackPress}
               style={styles.backButton}
               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
               <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.backTitle} numberOfLines={1}>
               {props.title}
            </Text>
            <View style={styles.backPlaceholder} />
         </View>
      );
   }

   if (props.variant === "modal") {
      return (
         <View style={[styles.modalHeader, props.style]}>
            <Text style={styles.modalTitle} numberOfLines={1}>
               {props.title}
            </Text>
            <TouchableOpacity
               onPress={props.onClosePress}
               style={styles.closeButton}
               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
               <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
         </View>
      );
   }

   const hasNotification = (props.notificationCount ?? 0) > 0;

   return (
      <View
         style={[
            styles.container,
            { paddingTop: insets.top + spacing[2] },
            props.style,
         ]}
      >
         <View style={styles.logoContainer}>
            <Text style={styles.logoText}>no</Text>
            <Text style={styles.logoTextBold}>MEI</Text>
         </View>
         <TouchableOpacity
            onPress={props.onNotificationPress}
            style={styles.notificationButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
         >
            <Ionicons
               name="notifications-outline"
               size={22}
               color={colors.white}
            />
            {hasNotification && (
               <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                     {(props.notificationCount ?? 0) > 9
                        ? "9+"
                        : props.notificationCount}
                  </Text>
               </View>
            )}
         </TouchableOpacity>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      backgroundColor: colors.dark,
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[4],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   detailContainer: {
      backgroundColor: colors.white,
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[3],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   detailButton: {
      width: 38,
      height: 38,
      borderRadius: borderRadius.full,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
   },
   detailActions: {
      flexDirection: "row",
      gap: spacing[2],
   },
   logoContainer: {
      flexDirection: "row",
      alignItems: "baseline",
   },
   avatar: {
      width: 34,
      height: 34,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
   },
   avatarText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.white,
      letterSpacing: 0.5,
   },
   logoText: {
      fontSize: 22,
      fontWeight: "400",
      color: colors.white,
      letterSpacing: -0.5,
   },
   logoTextBold: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.primaryLight,
      letterSpacing: -0.5,
   },
   notificationButton: {
      position: "relative",
      padding: spacing[1],
   },
   notificationBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: colors.error,
      borderRadius: borderRadius.full,
      minWidth: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
   },
   notificationBadgeText: {
      ...textPresets.labelSm,
      color: colors.white,
      fontSize: 9,
   },
   modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
   },
   modalTitle: {
      ...textPresets.h4,
      color: colors.textPrimary,
      flex: 1,
   },
   closeButton: {
      padding: spacing[1],
      backgroundColor: colors.inputBg,
      borderRadius: borderRadius.full,
   },
   backButton: {
      padding: spacing[1],
   },
   backTitle: {
      ...textPresets.h5,
      color: colors.white,
      flex: 1,
      textAlign: "center",
      marginHorizontal: spacing[2],
   },
   screenTitle: {
      ...textPresets.h5,
      color: colors.white,
      flex: 1,
      textAlign: "center",
      marginHorizontal: spacing[2],
   },
   backPlaceholder: {
      width: 32,
   },
});
