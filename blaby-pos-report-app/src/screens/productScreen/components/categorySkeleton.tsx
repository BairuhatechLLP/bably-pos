import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Skeleton} from '../../../components/skeleton';
import COLORS from '../../../config/color';

function CategorySkeleton() {
  return (
    <View>
      {/* Summary Skeleton */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.statBox}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <View style={styles.statTextBox}>
              <Skeleton width={60} height={18} />
              <Skeleton width={70} height={12} style={{marginTop: 6}} />
            </View>
          </View>
          <View style={styles.statBox}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <View style={styles.statTextBox}>
              <Skeleton width={50} height={18} />
              <Skeleton width={60} height={12} style={{marginTop: 6}} />
            </View>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.statBox}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <View style={styles.statTextBox}>
              <Skeleton width={80} height={18} />
              <Skeleton width={65} height={12} style={{marginTop: 6}} />
            </View>
          </View>
          <View style={styles.statBox}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <View style={styles.statTextBox}>
              <Skeleton width={55} height={18} />
              <Skeleton width={60} height={12} style={{marginTop: 6}} />
            </View>
          </View>
        </View>
      </View>

      {/* Category Section Skeletons */}
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.categoryContainer}>
          <View style={styles.categoryHeader}>
            <View style={styles.headerLeft}>
              <Skeleton width={36} height={36} borderRadius={8} />
              <View style={styles.headerTextBox}>
                <Skeleton width={120} height={16} />
                <Skeleton width={70} height={12} style={{marginTop: 6}} />
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.totalBox}>
                <Skeleton width={80} height={16} />
                <Skeleton width={50} height={11} style={{marginTop: 4}} />
              </View>
              <Skeleton width={20} height={20} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GREY6,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
  },
  statTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.GREY6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  totalBox: {
    alignItems: 'flex-end',
  },
});

export default CategorySkeleton;
