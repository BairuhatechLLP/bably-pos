import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  View,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {validateAll} from 'indicative/validator';

import styles from './styles';
import InputItem from '../../components/inputText';
import PrimaryButton from '../../components/buttons/primary';
import TabHeader from '../../navigation/tabHeader';

import API from '../../config/api';
import {POST} from '../../utils/apiCalls';
import COLOR from '../../config/color';

function CreateUserScreen(props: any) {
  const navigation: any = useNavigation();
  const branches = useSelector((state: any) => state?.Dropdown?.branches);

  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('staff');
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<any>({});

  // Set default branch when branches load
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
    }
  }, [branches]);

  const rules = {
    name: 'required|string',
    email: 'required|email',
    password: 'required|min:8',
    mobile: 'string',
  };

  const messages = {
    required: (field: any) => `${field} is required`,
    'email.email': 'Please enter a valid email address',
    'password.min': 'Password must be at least 8 characters long',
  };

  const handleCreateUser = async () => {
    try {
      setErrors({});
      setIsLoading(true);

      // Validate form
      const formData = {
        name,
        email,
        password,
        mobile,
      };

      await validateAll(formData, rules, messages);

      // Check if branch is selected
      if (!selectedBranch || !selectedBranch.companyId) {
        Alert.alert('Error', 'Please select a branch');
        setIsLoading(false);
        return;
      }

      // Prepare request body
      const requestBody = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        mobile: mobile.trim(),
        companyId: selectedBranch.companyId,
        role: role,
        staffAccess: ['orders', 'reports'], // Default permissions
        isActive: isActive,
      };

      // Call API
      const response: any = await POST(API.USER_CREATE, requestBody);

      setIsLoading(false);

      if (response?.success) {
        Alert.alert(
          'Success!',
          `User ${name} created successfully in all ${response.data?.databasesSynced || 7} databases.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert('Error', response?.message || 'Failed to create user');
      }
    } catch (err: any) {
      setIsLoading(false);

      if (err && typeof err === 'object') {
        // Validation errors
        const formattedErrors: any = {};
        err.forEach((error: any) => {
          formattedErrors[error.field] = error.message;
        });
        setErrors(formattedErrors);
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TabHeader
        title="Create New User"
        showLogo={false}
        showProfile={false}
        showBack={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>User Information</Text>

            {/* Name Input */}
            <InputItem
              placeholder="Full Name"
              label="Full Name"
              value={name}
              error={errors.name}
              onChange={(value: string) => setName(value)}
            />

            {/* Email Input */}
            <InputItem
              placeholder="Email Address"
              label="Email"
              value={email}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChange={(value: string) => setEmail(value)}
            />

            {/* Password Input */}
            <InputItem
              placeholder="Password (min 8 characters)"
              label="Password"
              value={password}
              error={errors.password}
              secureTextEntry={true}
              autoCapitalize="none"
              onChange={(value: string) => setPassword(value)}
            />

            {/* Mobile Input */}
            <InputItem
              placeholder="Mobile Number"
              label="Mobile (Optional)"
              value={mobile}
              error={errors.mobile}
              keyboardType="phone-pad"
              onChange={(value: string) => setMobile(value)}
            />

            <Text style={styles.sectionTitle}>Assignment</Text>

            {/* Branch Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Branch</Text>
              <View style={styles.branchSelector}>
                {selectedBranch ? (
                  <Text style={styles.branchText}>
                    {selectedBranch.bname || `Branch ${selectedBranch.id}`}
                  </Text>
                ) : (
                  <Text style={styles.branchTextPlaceholder}>
                    Loading branches...
                  </Text>
                )}
              </View>
              <Text style={styles.helperText}>
                User will be created in ALL databases, but assigned to this
                branch
              </Text>
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                {['staff', 'manager', 'admin'].map((roleOption) => (
                  <View
                    key={roleOption}
                    style={[
                      styles.roleButton,
                      role === roleOption && styles.roleButtonActive,
                    ]}
                    onTouchEnd={() => setRole(roleOption)}>
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === roleOption && styles.roleButtonTextActive,
                      ]}>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Active Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.roleContainer}>
                <View
                  style={[
                    styles.roleButton,
                    isActive && styles.roleButtonActive,
                  ]}
                  onTouchEnd={() => setIsActive(true)}>
                  <Text
                    style={[
                      styles.roleButtonText,
                      isActive && styles.roleButtonTextActive,
                    ]}>
                    Active
                  </Text>
                </View>
                <View
                  style={[
                    styles.roleButton,
                    !isActive && styles.roleButtonActive,
                  ]}
                  onTouchEnd={() => setIsActive(false)}>
                  <Text
                    style={[
                      styles.roleButtonText,
                      !isActive && styles.roleButtonTextActive,
                    ]}>
                    Inactive
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ⚠️ This user will be created in ALL 7 branch databases
                simultaneously with full transaction rollback on failure.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={isLoading ? 'Creating User...' : 'Create User'}
              onPress={handleCreateUser}
              disabled={isLoading}
              icon={
                isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : undefined
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default CreateUserScreen;
