import { Text, Pressable, View, TextInput } from "react-native";

type CheckboxOption = {
  label: string;
  value: string;
};

type CheckboxInputProps = {
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (value: string) => void;
  plantCounts: { [key: string]: string };
  onCountChange: (value: string, count: string) => void;
};

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  options,
  selectedValues,
  onChange,
  plantCounts,
  onCountChange,
}) => {
  return (
    <View>
      {options.map(option => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <View key={option.value} style={{ marginBottom: 12 }}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => onChange(option.value)}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: isSelected ? '#B4DC45' : '#49454F',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#B4DC45' : 'transparent',
                }}
              >
                {isSelected && (
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    ✓
                  </Text>
                )}
              </View>
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 14,
                  fontFamily: 'SpaceGrotesk-Medium',
                  color: '#000',
                  flex: 1,
                }}
              >
                {option.label}
              </Text>
            </Pressable>

            {isSelected && (
              <View
                style={{
                  marginLeft: 30,
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: '#49454F',
                    fontFamily: 'SpaceGrotesk-Medium',
                    marginRight: 8,
                  }}
                >
                  Jumlah tanaman:
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#B4DC45',
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    fontSize: 14,
                    fontFamily: 'SpaceGrotesk-Medium',
                    width: 70,
                    textAlign: 'center',
                  }}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={plantCounts[option.value] || ''}
                  onChangeText={(text) => onCountChange(option.value, text)}
                  maxLength={3}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: '#666',
                    fontFamily: 'SpaceGrotesk-Medium',
                    marginLeft: 8,
                  }}
                >
                  tanaman
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};