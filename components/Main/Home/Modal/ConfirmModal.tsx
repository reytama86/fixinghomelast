import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Farmer from '../../../../assets/svg/Farmer';

interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'water' | 'fertilizer'; 
}


const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  type
}) => {
  const titleText = type === 'water' ? 'Watering in Progress' : 'Fertilization in Progress';
  const descriptionText = type === 'water'
    ? 'The machine is watering the plants, are you sure you want to stop this process?'
    : 'The machine is spraying fertilizer, are you sure you want to stop this process?';
  return(
    <Modal transparent animationType="fade" visible={visible}>
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* <Text style={styles.message}>{message}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onCancel} style={[styles.btn, styles.cancel]}>
            <Text style={styles.btnText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={[styles.btn, styles.confirm]}>
            <Text style={styles.btnText}>Yes</Text>
          </TouchableOpacity>
        </View> */}
        <View style={styles.farmer}>
            <Farmer/>
        </View>
        <View style={styles.infoProgress}>
        <Text style={{fontFamily:"Space Grotesk", fontWeight: 500, fontSize: 16}}>{titleText}</Text>
        </View>
        <View style={styles.detailProgress}>
        <Text style={{fontFamily:"Space Grotesk", fontWeight: 500, fontSize: 14, textAlign:"center", color: 'rgba(0, 0, 0, 0.5)', }}>{descriptionText}</Text>
        </View>
        
        <View style={styles.footerModal}>
            <TouchableOpacity onPress={onCancel} style={styles.btnCancel}>
                <Text style={styles.textConfirm}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.btnYes}>
                <Text style={styles.textConfirm}>Yes</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  )

}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 343,
    height: 311,
    // top : 1978,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    // padding: 20,
    // elevation: 5,
  },
  farmer: {
    alignItems: "center",
    top: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  confirm: {
    backgroundColor: '#B4DC45',
  },
  btnText: {
    fontSize: 16,
    color: '#000',
  },
  footerModal: {
    alignItems:"center",
    flexDirection:"row",
    justifyContent:"space-between",
    gap: 10,
    top: 85
  },
  btnCancel: {  // kalau mau pakai top:200
    // top: 200,
    width: 150.5,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,              // <-- wajib!
    borderColor: '#B4DC45',
    backgroundColor: '#F9FBFF',
    // jika mau garis putus-putus:
    // borderStyle: 'dashed',
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    top: -87.5,
  },
  btnYes: { // kalau mau pakai top:200
    // top: 200,
    width: 150.5,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,              // <-- wajib!
    borderColor: '#B4DC45',
    backgroundColor: '#B4DC45',
    // jika mau garis putus-putus:
    // borderStyle: 'dashed',
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    top: -87.5,
  },
  textConfirm: {
    fontSize: 14,
    fontFamily: 'Space Grotesk', // Atau nama sesuai Font Book
    color: 'black',
    fontWeight: 500,
  },
  infoProgress:{
    alignItems: 'center',
    justifyContent:"center",
    marginTop: 15,
    paddingBottom: 1,
    marginBottom: -2.5,
  },
  detailProgress:{
    alignItems: 'center',
    justifyContent:"center",
    marginTop: 1,
  }
  
});

export default ConfirmModal;
