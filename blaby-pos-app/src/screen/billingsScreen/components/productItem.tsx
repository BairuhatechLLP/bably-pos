import React, {memo, useCallback, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import FONTS from '../../../config/fonts';
import COLORS from '../../../config/color';
import ProductOptionModal from './productOptionModal';

const ProductItem = memo(
  ({item, cart, index, CartItem, showImage, add, remove}: any) => {
    const onAdd = useCallback((item: any) => add(item), [add]);
    const onRemove = useCallback((item: any) => remove(item), [remove]);
    const [showOption, setShowOption] = useState<any>(false);

    const itemObj = {
      id: item?.id,
      productId: item?.id,
      quantity: 1,
      idescription: item?.idescription,
      sp_price: item?.sp_price,
      comb_id: `${item?.id}-normal-normal-dine-in`,
      ice_option: 'normal',
      sugar_option: 'normal',
      parcel_option: 'dine-in',
    };

    return (
      <TouchableOpacity
        style={[
          styles.ProductItem,
          {borderColor: cart?.quantity > 0 ? COLORS.primary : COLORS?.grey4},
        ]}
        onLongPress={() => setShowOption(true)}
        onPress={() => onAdd(itemObj)}>
        {showImage ? (
          <ImageBackground
            source={require('../../../assets/images/placeholder.png')}
            style={styles.image}>
            <View style={styles.priceBox}>
              <Text style={styles.text2}>£{item?.sp_price || 0}</Text>
            </View>
          </ImageBackground>
        ) : null}
        <View style={styles.Box1}>
          <Text style={styles.text1}>{item?.idescription}</Text>
          {showImage ? null : (
            <View style={[styles.priceBox, {marginTop: 5}]}>
              <Text style={[styles.text2, {color: COLORS.primary}]}>
                £{Number(item?.sp_price).toFixed(2) || 0}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.Box2}>
          {cart?.quantity > 0 ? (
            <View style={styles.groupBox}>
              <TouchableOpacity
                style={styles.btn2}
                onPress={() => onRemove(itemObj)}>
                <Ionicons name="remove" color={'red'} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn3}>
                <Text style={styles.text3}>{cart?.quantity}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn4}
                onPress={() => onAdd(itemObj)}>
                <Ionicons name="add" color={'#fff'} size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.btn1}
              onPress={() => onAdd(itemObj)}>
              <Text style={styles.btn1text}>+ Add to cart </Text>
            </TouchableOpacity>
          )}
        </View>
        {showOption && (
          <ProductOptionModal
            open={showOption}
            product={itemObj}
            CartItem={CartItem}
            close={() => setShowOption(false)}
            updateCart={(obj: any, action: any) =>
              action === 'remove' ? onRemove(obj) : onAdd(obj)
            }
          />
        )}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.cart?.quantity === nextProps.cart?.quantity &&
      prevProps.showImage === nextProps.showImage
    );
  },
);
const styles = StyleSheet.create({
  ProductItem: {
    flex: 1,
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  image: {
    height: 80,
    margin: 10,
    marginBottom: 0,
    borderRadius: 7,
    overflow: 'hidden',
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  priceBox: {
    backgroundColor: '#fff',
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 19,
    paddingHorizontal: 5,
    alignSelf: 'flex-end',
  },
  Box1: {
    padding: 10,
    flex: 1,
    paddingTop: 5,
  },
  text1: {
    fontSize: 13,
    color: COLORS.black,
    fontFamily: FONTS.Medium,
  },
  text2: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: FONTS.Medium,
  },
  text3: {
    color: '#000',
    fontSize: 14,
  },
  Box2: {
    padding: 10,
    paddingTop: 0,
  },
  btn1: {
    backgroundColor: COLORS.primary,
    borderRadius: 7,
    padding: 5,
    paddingBottom: 3,
    alignItems: 'center',
  },
  btn1text: {
    color: '#fff',
    fontFamily: FONTS.Regular,
    fontSize: 12,
  },
  groupBox: {
    borderColor: COLORS?.grey4,
    borderWidth: 1,
    borderRadius: 7,
    backgroundColor: '#fcfcfc',
    flexDirection: 'row',
    padding: 2,
  },
  btn2: {
    backgroundColor: COLORS.grey2,
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    padding: 2,
  },
  btn3: {
    flex: 1,
    alignItems: 'center',
    padding: 2,
  },
  btn4: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    alignItems: 'center',
    padding: 2,
  },
});
export default ProductItem;
