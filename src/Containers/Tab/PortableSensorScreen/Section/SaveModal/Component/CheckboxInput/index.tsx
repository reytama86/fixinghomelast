import { Text, Pressable, View } from "react-native";

type CheckboxOption = {
  label: string;
  value: string;
};

type CheckboxInputProps = {
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (value: string) => void;
  maxSelection?: number;
};

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  options,
  selectedValues,
  onChange,
  maxSelection,
}) => {
  return (
    <View>
      {options.map(option => {
        const isSelected = selectedValues.includes(option.value);
        const isDisabled = !isSelected && maxSelection && selectedValues.length >= maxSelection;
        
        return (
          <Pressable
            key={option.value}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
              opacity: isDisabled ? 0.5 : 1,
            }}
            onPress={() => onChange(option.value)}
            disabled={isDisabled}
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
                fontFamily: 'SpaceGrotesk-Regular',
                color: isDisabled ? '#999' : '#000',
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
      
      {maxSelection && selectedValues.length > 0 && (
        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          {selectedValues.length} dari {maxSelection} pilihan terpilih
        </Text>
      )}
    </View>
  );
};