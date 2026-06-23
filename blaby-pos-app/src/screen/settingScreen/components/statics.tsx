import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';
import {isMobile} from '../../../utils/responsive';

const Statics = (props: any) => {
  console.log('props', );
  return (
    <View style={{marginBottom: 20}}>
      <View style={styles.Box6}>
        <View style={styles.Box7}>
          <View>
            <FontAwesome6 name="chart-pie" size={30} color={'#9534eb'} />
          </View>
          <Text style={styles.text3}>Total Orders</Text>
        </View>
        <View>
          <Text style={styles.text4}>{props?.data?.count || 0}</Text>
        </View>
      </View>
      <View style={styles.Box6}>
        <View style={styles.Box7}>
          <View>
            <FontAwesome6 name="chart-simple" size={30} color={'#fcba03'} />
          </View>
          <Text style={styles.text3}>Total Amount</Text>
        </View>
        <View>
          <Text style={styles.text4}>{Number(props?.data?.sum).toFixed(2) || 0}</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  Box6: {
    borderColor: COLOR.grey4,
    borderWidth: 1,
    marginTop: isMobile() ? 5 : 20,
    padding: isMobile() ? 10 : 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,

    backgroundColor: '#fff',
  },
  Box7: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  text3: {
    color: 'grey',
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    marginTop: 4,
  },
  text4: {
    color: '#000',
    fontSize: 18,
    fontFamily: FONTS.Bold,
  },
});

export default Statics;
