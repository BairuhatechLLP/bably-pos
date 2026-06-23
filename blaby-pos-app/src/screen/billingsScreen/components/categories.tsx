import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import COLORS from '../../../config/color';
import {getFontSize, isMobile} from '../../../utils/responsive';
import FONTS from '../../../config/fonts';

const Categories = (props: any) => {
   const navigation = useNavigation<any>();
  return (
    <ScrollView
      horizontal={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.ScrollView}>
      {props?.quickArea ? (
        <TouchableOpacity
          style={[
            styles.CategoryItem,
            props?.active?.id === -1 ? styles.active : {},
          ]}
          onPress={() => props?.setCategory({id: -1})}
          onLongPress={() => navigation.navigate('QuickProducts')}>
          <Text
            style={[
              styles.text1,
              {color: props?.active?.id === -1 ? '#fff' : '#000'},
            ]}>
            Quick Items
          </Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[
          styles.CategoryItem,
          props?.active?.id === 0 ? styles.active : {},
        ]}
        onPress={() => props?.setCategory({id: 0})}>
        <Text
          style={[
            styles.text1,
            {color: props?.active?.id === 0 ? '#fff' : '#000'},
          ]}>
          All Product
        </Text>
      </TouchableOpacity>
      {props?.categories?.map((item: any, index: number) => (
        <TouchableOpacity
          key={item?.id}
          style={[
            styles.CategoryItem,
            props?.active?.id === item?.id ? styles.active : {},
          ]}
          onPress={() => props?.setCategory(item)}>
          <Text
            style={[
              styles.text1,
              {color: props?.active?.id === item?.id ? '#fff' : '#666666'},
            ]}>
            {item?.category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  ScrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prefix: {
    marginLeft: 10,
    fontSize: getFontSize(20),
    color: COLORS.grey3,
  },
  CategoryItem: {
    padding: 5,
    paddingBottom: 1,
    paddingHorizontal: 12,
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  text1: {
    fontSize: isMobile()?12:15,
    color: COLORS.grey2,
    fontFamily: FONTS.Regular,
  },
  active: {
    backgroundColor: COLORS.primary,
  },
});
export default Categories;
