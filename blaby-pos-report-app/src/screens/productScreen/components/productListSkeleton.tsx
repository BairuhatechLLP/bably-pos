import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Skeleton} from '../../../components/skeleton';
import COLORS from '../../../config/color';

function ProductListSkeleton() {
  return (
    <View>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View key={item} style={styles.productItem}>
          <View style={styles.leftSection}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={14} style={{marginTop: 10}} />
            <Skeleton width="55%" height={14} style={{marginTop: 8}} />
          </View>
          <View style={styles.rightSection}>
            <Skeleton width={70} height={16} />
            <Skeleton width={60} height={14} style={{marginTop: 10}} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  productItem: {
    padding: 16,
    borderBottomColor: COLORS.GREY3,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
});

export default ProductListSkeleton;
