import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface DateTimePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
}

export default function CustomDateTimePicker({
  selectedDate,
  onDateChange,
  label = "Date et heure",
  minimumDate = new Date()
}: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setTempDate(date);
      if (Platform.OS === 'android') {
        setTimeout(() => setShowTimePicker(true), 100);
      }
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    
    if (date) {
      onDateChange(date);
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Sélectionner la date et l'heure";
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('fr-FR', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} *</Text>
      
      <TouchableOpacity
        style={[styles.button, !selectedDate && styles.buttonEmpty]}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon 
          name={selectedDate ? "calendar" : "calendar-outline"} 
          size={20} 
          color={selectedDate ? "#7C3AED" : "#666"} 
        />
        <Text style={[styles.buttonText, !selectedDate && styles.buttonTextEmpty]}>
          {formatDateTime(selectedDate)}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && selectedDate && (
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(!showTimePicker)}
        >
          <Icon name="time-outline" size={20} color="#7C3AED" />
          <Text style={styles.buttonText}>{formatTime(selectedDate)}</Text>
        </TouchableOpacity>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          locale="fr-FR"
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          locale="fr-FR"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 10,
  },
  buttonEmpty: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  buttonTextEmpty: {
    color: '#999',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
});