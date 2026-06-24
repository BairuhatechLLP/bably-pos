import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import COLORS from '../config/color';
import FONTS from '../config/fonts';

import {GET} from './apiCalls';
import API from '../config/api';
import {saveBranch} from '../redux/slices/dropdownSlice';

const StoreDropdown = (props: any) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get logged-in user's ID to use as adminId
  const authUser = useSelector((state: any) => state?.Auth?.user);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try DATABASE_BRANCHES first (most reliable for staff performance)
      let response: any = await GET(API.DATABASE_BRANCHES);

      // If DATABASE_BRANCHES fails, try BRANCHES_LIST
      if (!response?.success) {
        response = await GET(API.BRANCHES_LIST);
      }

      // If BRANCHES_LIST fails, try BRANCH_DETAILD
      if (!response?.success) {
        response = await GET(API.BRANCH_DETAILD);
      }

      // If BRANCH_DETAILD also fails, fallback to BRANCHES_PICKER
      if (!response?.success) {
        response = await GET(API.BRANCHES_PICKER);
      }

      if (response?.success) {
        // Get adminId from logged-in user
        const adminId = authUser?.staff?.id || authUser?.id || null;

        // Transform branch data to match expected format
        const transformedBranches  = (response?.data || []).map((branch: any) => {
          return {
            id: branch?.id,
            bname: branch?.name || branch?.bname,
            companyId: branch?.primaryBranchId || branch?.companyId,
            adminId: branch?.adminId || adminId,
            userId: branch?.userId || branch?.adminId || adminId,
          };
        });

        dispatch(saveBranch(transformedBranches));
        setError(null);
      } else {
        const errorMsg = 'Failed to load branches from server. Please check your network connection.';
        setError(errorMsg);
        // Still dispatch empty array to prevent undefined state
        dispatch(saveBranch([] as any ));
      }
    } catch (err) {
      const errorMsg = 'Unable to connect to server. Please check network and try again.';
      setError(errorMsg);
      // Dispatch empty array on error to prevent undefined state
      dispatch(saveBranch([] as any));
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if show prop is false
  if (!props?.show) {
    return null;
  }

  // Show full-screen loading during initialization
  if (isLoading) {
    return (
      <View style={styles.fullScreenOverlay}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading branches...</Text>
          <Text style={styles.loadingSubText}>Please wait</Text>
        </View>
      </View>
    );
  }

  // Show error with retry button if loading failed
  if (error) {
    return (
      <View style={styles.fullScreenOverlay}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 16,
    color: COLORS.GREY1,
    marginTop: 15,
  },
  loadingSubText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 13,
    color: COLORS.GREY2,
    marginTop: 5,
  },
  errorCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    maxWidth: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  errorIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  errorTitle: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 18,
    color: COLORS.GREY1,
    marginBottom: 10,
  },
  errorText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 14,
    color: COLORS.GREY2,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 15,
    color: '#fff',
  },
});

export default StoreDropdown;
