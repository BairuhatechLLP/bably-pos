import {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';

import EditModal from './editModal';
import {View} from 'react-native';

const EditProfile = () => {
  const [showEdit, setShowEdit] = useState<any>(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.EditProfile}
        onPress={() => setShowEdit(true)}>
        <Text style={styles.PrinterTesttext}>Edit</Text>
        <FontAwesome6 name="user-pen" size={15} color={COLOR.primary} />
      </TouchableOpacity>
      {showEdit && (
        <EditModal open={showEdit} close={() => setShowEdit(false)}/>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  EditProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: COLOR.grey4,
    paddingHorizontal: 10,
    padding: 5,
    borderRadius: 6,
  },
  PrinterTesttext: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    marginTop: 2,
  },
});
export default EditProfile;
