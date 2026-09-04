import { TextInput, View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000000'
  },
  inputError: {
    borderColor: '#dc2626'
  },
  error: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4
  }
});

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  editable = true,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};
