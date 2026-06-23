import React from 'react';
import {Text, StyleSheet, View, Switch} from 'react-native';
import FONTS from '../../config/fonts';
import COLORS from '../../config/color';
import COLOR from '../../config/color';

const ListItem = (props: any) => {
  return (
    <View style={styles.ListItem}>
      <View style={{flex: 1}}>
        <Text style={styles.text1}>{props?.item?.idescription}</Text>
        <Text style={styles.text2}>
          {Number(props?.item?.sp_price).toFixed(2)}
        </Text>
      </View>
      <View>
        <Switch
          value={props?.active}
          trackColor={{false: COLOR.grey1, true: COLOR.primary}}
          thumbColor={COLOR.white}
          onChange={(value: any) => {
            props?.active ? props?.remove() : props?.add();
          }}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  ListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomColor: COLORS?.grey4,
    borderBottomWidth: 1,
  },
  text1: {
    fontFamily: FONTS?.SemiBold,
    fontSize: 14,
    color: '#000',
  },
  text2: {
    fontFamily: FONTS?.Medium,
    fontSize: 12,
    color: COLOR.primary,
  },
});
export default ListItem;
