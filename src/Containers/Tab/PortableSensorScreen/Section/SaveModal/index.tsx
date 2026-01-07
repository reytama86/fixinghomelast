import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import styles from './styles';
import {SavePortableSVG} from '@Assets/svg/Static';
import { RadioInput } from './Component/RadioInput';
import { CheckboxInput } from './Component/CheckboxInput';

type SaveModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (resultName: string) => Promise<void>;
  modalAnimation: Animated.Value;
};

export const SaveModal: React.FC<SaveModalProps> = ({
  visible,
  onClose,
  onSave,
  modalAnimation,
}) => {
  const [blockNumber, setblockNumber] = useState('');
  const [rowNumber, setRowNumber] = useState('');
  const [sectionNumber, setSectionNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [condition, setCondition] = useState('');
  const [isHealthy, setIsHealthy] = useState('');
  const [unhealthyReasons, setUnhealthyReasons] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [reasonAnimation] = useState(new Animated.Value(0));

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const backdropOpacity = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Reset semua form ketika modal TERTUTUP (visible = false)
  useEffect(() => {
    if (!visible) {
      // Tunggu animasi selesai baru reset
      setTimeout(() => {
        setblockNumber('');
        setRowNumber('');
        setSectionNumber('');
        setCondition('');
        setIsHealthy('');
        setUnhealthyReasons([]);
        reasonAnimation.setValue(0);
      }, 300); // Sesuai durasi animasi
    }
  }, [visible]);

  const handleHealthChange = (value: string) => {
    setIsHealthy(value);
    
    if (value === 'tidak_sehat') {
      Animated.timing(reasonAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
    } else {
      Animated.timing(reasonAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setUnhealthyReasons([]);
    }
  };

  const handleUnhealthyReasonChange = (value: string) => {
    setUnhealthyReasons(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        if (prev.length >= 2) {
          return [...prev.slice(1), value];
        } else {
          return [...prev, value];
        }
      }
    });
  };

  // Handler untuk menutup modal dengan animasi smooth
  const handleClose = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Handler untuk klik backdrop (area di luar modal)
  const handleBackdropPress = () => {
    if (!isSaving) {
      handleClose();
    }
  };

  const handleSave = async () => {
    if (!blockNumber.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(blockNumber);
      // Setelah save berhasil, tutup modal dengan animasi
      handleClose();
    } catch (error) {
      // Jika error, tetap tampilkan modal
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const reasonHeight = reasonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 350],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: backdropOpacity }
          ]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {transform: [{translateY: modalTranslateY}]},
                ]}>
                <View style={styles.modalHeader}>
                  <SavePortableSVG />
                  <View style={{flexDirection: 'column'}}>
                    <Text style={styles.modalTitle}>Save Result</Text>
                    <Text style={styles.nameResultText}>Name the result</Text>
                  </View>
                </View>

                <ScrollView
                  ref={scrollViewRef}
                  showsVerticalScrollIndicator={false}
                  style={{maxHeight: 400}}
                  contentContainerStyle={{paddingBottom: 16}}>
                  
                  <View>
                    <Text style={styles.inputLabel}>
                      Block number<Text style={{color: 'red'}}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter block number"
                      placeholderTextColor="#999"
                      value={blockNumber}
                      onChangeText={setblockNumber}
                      editable={!isSaving}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>
                      Row number<Text style={{color: 'red'}}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter row number"
                      placeholderTextColor="#999"
                      value={rowNumber}
                      onChangeText={setRowNumber}
                      editable={!isSaving}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>
                      Section number<Text style={{color: 'red'}}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter section number"
                      placeholderTextColor="#999"
                      value={sectionNumber}
                      onChangeText={setSectionNumber}
                      editable={!isSaving}
                    />
                  </View>

                  <Text style={styles.inputLabel}>
                    Score<Text style={{color: 'red'}}> *</Text>
                  </Text>
                  <RadioInput
                    options={[
                      {label: '0', sublabel: '(Tidak terdapat bunga)', value: '0'},
                      {label: '1', sublabel:'(1-2 tanaman bunga)', value: '1'},
                      {label: '2', sublabel:'(3-4 tanaman bunga)', value: '2'},
                      {label: '3', sublabel:'(5-6 tanaman bunga)', value: '3'},
                      {label: '4', sublabel:'(7-8 tanaman bunga)', value: '4'},
                      {label: '5', sublabel:'(Bunga lebat >50 tandan)', value: '5'},
                    ]}
                    selectedValue={condition}
                    onChange={setCondition}
                  />

                  <Text style={styles.inputLabel}>
                    Apakah Tanaman Sehat?<Text style={{color: 'red'}}> *</Text>
                  </Text>
                  <RadioInput
                    options={[
                      {label: 'Sehat', value: 'sehat'},
                      {label: 'Tidak Sehat', value: 'tidak_sehat'},
                    ]}
                    selectedValue={isHealthy}
                    onChange={handleHealthChange}
                    columns={2}
                  />

                  <Animated.View
                    style={{
                      maxHeight: reasonHeight,
                      overflow: 'hidden',
                    }}>
                    <Text style={styles.inputLabel}>
                      Alasan Tanaman Tidak Sehat (Pilih maksimal 2)
                      <Text style={{color: 'red'}}> *</Text>
                    </Text>
                    <CheckboxInput
                      options={[
                        {label: 'Pertumbuhan lambat atau terhenti', value: 'lambat'},
                        {label: 'Daun layu meskipun kondisi tanah lembab', value: 'layu'},
                        {label: 'Warna daun pucat atau hijau kekuningan (klorosis)', value: 'klorosis'},
                        {label: 'Batang tampak lemas dan tidak kokoh', value: 'lemas'},
                        {label: 'Terdapat kebusukan pada batang dan/atau akar', value: 'busuk'},
                      ]}
                      selectedValues={unhealthyReasons}
                      onChange={handleUnhealthyReasonChange}
                      maxSelection={2}
                    />
                  </Animated.View>
                </ScrollView>

                <View style={styles.resultOption}>
                  <TouchableOpacity
                    style={styles.cancelResult}
                    onPress={handleClose}
                    disabled={isSaving}>
                    <Text style={styles.textButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmResult, isSaving && {opacity: 0.6}]}
                    onPress={handleSave}
                    disabled={isSaving || !blockNumber.trim()}>
                    {isSaving ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.textButton}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};