import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "./Colors";

interface CustomDateTimePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  label?: string;
  minimumDate?: Date;
}

export default function CustomDateTimePicker({
  selectedDate,
  onDateChange,
  label = "Date et heure",
  minimumDate,
}: CustomDateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());

  const handleConfirm = () => {
    onDateChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(selectedDate || new Date());
    setShowPicker(false);
  };

  const onChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && date) {
        if (mode === "date") {
          setTempDate(date);
          setMode("time");
          setShowPicker(true);
        } else {
          onDateChange(date);
        }
      }
    } else {
      if (date) {
        setTempDate(date);
      }
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Sélectionner la date et l'heure";
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    };
    
    return date.toLocaleDateString("fr-FR", options);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setMode("date");
          setShowPicker(true);
        }}
      >
        <Icon name="calendar-outline" size={20} color={COLORS.secondary} />
        <Text style={styles.buttonText}>{formatDateTime(selectedDate)}</Text>
        <Icon name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {Platform.OS === "ios" && showPicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Annuler</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Sélectionner</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.confirmButton}>OK</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                onChange={onChange}
                minimumDate={minimumDate}
                locale="fr-FR"
                textColor={COLORS.textPrimary}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display="default"
          onChange={onChange}
          minimumDate={minimumDate}
          locale="fr-FR"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  buttonText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.neutralGray800,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: "600",
  },
  confirmButton: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: "600",
  },
});