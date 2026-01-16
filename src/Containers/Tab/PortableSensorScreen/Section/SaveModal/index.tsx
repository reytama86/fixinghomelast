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
  Alert,
} from 'react-native';
import styles from './styles';
import {SavePortableSVG} from '@Assets/svg/Static';
import { RadioInput } from './Component/RadioInput';
import { CheckboxInput } from './Component/CheckboxInput';

type SaveModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (saveParams: {
    blockNumber: string;
    rowNumber: string;
    sectionNumber: string;
    flowerScore: string;
    isHealthy: boolean;
    symptoms: {
      slowGrowth: boolean;
      leafWilt: boolean;
      chlorosis: boolean;
      weakStem: boolean;
      rotRoot: boolean;
    };
    plantCounts: {
      slowGrowth: number;
      leafWilt: number;
      chlorosis: number;
      weakStem: number;
      rotRoot: number;
    };
  }) => Promise<void>;
  modalAnimation: Animated.Value;
};

export const SaveModal: React.FC<SaveModalProps> = ({
  visible,
  onClose,
  onSave,
  modalAnimation,
}) => {
  const [blockNumber, setBlockNumber] = useState('');
  const [rowNumber, setRowNumber] = useState('');
  const [sectionNumber, setSectionNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [condition, setCondition] = useState('');
  const [isHealthy, setIsHealthy] = useState('');
  const [unhealthyReasons, setUnhealthyReasons] = useState<string[]>([]);
  const [plantCounts, setPlantCounts] = useState<{ [key: string]: string }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [reasonAnimation] = useState(new Animated.Value(0));

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0], 
  });

  const backdropOpacity = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setBlockNumber('');
        setRowNumber('');
        setSectionNumber('');
        setCondition('');
        setIsHealthy('');
        setUnhealthyReasons([]);
        setPlantCounts({});
        reasonAnimation.setValue(0);
      }, 300);
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
      setPlantCounts({});
    }
  };

  const handleUnhealthyReasonChange = (value: string) => {
    setUnhealthyReasons(prev => {
      if (prev.includes(value)) {
        const newCounts = {...plantCounts};
        delete newCounts[value];
        setPlantCounts(newCounts);
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handlePlantCountChange = (symptomValue: string, count: string) => {
    setPlantCounts(prev => ({
      ...prev,
      [symptomValue]: count,
    }));
  };

  const handleClose = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleBackdropPress = () => {
    if (!isSaving) {
      handleClose();
    }
  };

  const handleSave = async () => {
    if (!blockNumber.trim() || !rowNumber.trim() || !sectionNumber.trim()) {
      Alert.alert('Error', 'Please fill Block, Row, and Section number');
      return;
    }

    if (!condition) {
      Alert.alert('Error', 'Please select flower score');
      return;
    }

    if (!isHealthy) {
      Alert.alert('Error', 'Please select plant health status');
      return;
    }

    if (isHealthy === 'tidak_sehat' && unhealthyReasons.length === 0) {
      Alert.alert('Error', 'Please select at least one symptom for unhealthy plant');
      return;
    }

    if (isHealthy === 'tidak_sehat') {
      const missingCounts = unhealthyReasons.filter(
        symptom => !plantCounts[symptom] || parseInt(plantCounts[symptom]) === 0
      );
      
      if (missingCounts.length > 0) {
        Alert.alert('Error', 'Harap isi jumlah tanaman untuk setiap gejala yang dipilih');
        return;
      }
    }

    setIsSaving(true);
    try {
      const symptoms = {
        slowGrowth: unhealthyReasons.includes('lambat'),
        leafWilt: unhealthyReasons.includes('layu'),
        chlorosis: unhealthyReasons.includes('klorosis'),
        weakStem: unhealthyReasons.includes('lemas'),
        rotRoot: unhealthyReasons.includes('busuk'),
      };

      const counts = {
        slowGrowth: parseInt(plantCounts['lambat'] || '0'),
        leafWilt: parseInt(plantCounts['layu'] || '0'),
        chlorosis: parseInt(plantCounts['klorosis'] || '0'),
        weakStem: parseInt(plantCounts['lemas'] || '0'),
        rotRoot: parseInt(plantCounts['busuk'] || '0'),
      };

      await onSave({
        blockNumber: blockNumber.trim(),
        rowNumber: rowNumber.trim(),
        sectionNumber: sectionNumber.trim(),
        flowerScore: condition,
        isHealthy: isHealthy === 'sehat',
        symptoms,
        plantCounts: counts,
      });
      
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const reasonHeight = reasonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent>
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
                <View style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#E0E0E0',
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginBottom: 16,
                }} />

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
                  style={{maxHeight: 450}}
                  contentContainerStyle={{paddingBottom: 16}}
                  bounces={false}>
                  
                  <View>
                    <Text style={styles.inputLabel}>
                      Block number<Text style={{color: 'red'}}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter block number"
                      placeholderTextColor="#999"
                      value={blockNumber}
                      onChangeText={setBlockNumber}
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
                      Gejala Tanaman Tidak Sehat
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
                      plantCounts={plantCounts}
                      onCountChange={handlePlantCountChange}
                    />
                  </Animated.View>
                </ScrollView>

                <View style={styles.resultOption}>
                  <TouchableOpacity
                    style={styles.cancelResult}
                    onPress={handleClose}
                    disabled={isSaving}
                    activeOpacity={0.7}>
                    <Text style={[styles.textButton, {color: 'black'}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmResult, isSaving && {opacity: 0.6}]}
                    onPress={handleSave}
                    disabled={isSaving || !blockNumber.trim()}
                    activeOpacity={0.7}>
                    {isSaving ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={[styles.textButton, {color: '#000'}]}>Save</Text>
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