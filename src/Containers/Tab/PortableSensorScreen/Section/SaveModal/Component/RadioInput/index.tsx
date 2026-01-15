import { Text, Pressable, View } from "react-native";

type RadioOption = {
  label: string;
  value: string;
  sublabel?: string;
};

type RadioInputProps = {
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  columns?: number;
};

export const RadioInput: React.FC<RadioInputProps> = ({
  options,
  selectedValue,
  onChange,
  columns = 1,
}) => {
  // Jika columns = 1, render biasa (vertikal tanpa border)
  if (columns === 1) {
    return (
      <View>
        {options.map(option => {
          const selected = selectedValue === option.value;
          
          return (
            <Pressable
              key={option.value}
              style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}
              onPress={() => onChange(option.value)}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: selected ? '#B4DC45' : '#49454F',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#B4DC45',
                    }}
                  />
                )}
              </View>
              <Text style={{marginLeft: 10, fontSize: 14, fontFamily:'SpaceGrotesk-Medium'}}>
                {option.label}
                {option.sublabel && (
                    <Text style={{color:'#BBC3CE'}}>
                        {''}  {option.sublabel}
                    </Text>
                )}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Jika columns > 1, bagi menjadi baris dengan border
  const rows = [];
  for (let i = 0; i < options.length; i += columns) {
    rows.push(options.slice(i, i + columns));
  }

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View 
          key={rowIndex} 
          style={{
            flexDirection: 'row',
            marginBottom: 10,
            gap: 10,
          }}
        >
          {row.map(option => {
            const selected = selectedValue === option.value;

            return (
              <Pressable
                key={option.value}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: selected ? '#B4DC45' : '#E0E0E0',
                }}
                onPress={() => onChange(option.value)}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selected ? '#B4DC45' : '#49454F',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#B4DC45',
                      }}
                    />
                  )}
                </View>

                <Text 
                  style={{
                    marginLeft: 10,
                    fontSize: 14,
                    fontFamily: 'SpaceGrotesk-Medium',
                    flex: 1,
                    flexWrap: 'wrap',
                    color: "#BBC3CE"
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
};