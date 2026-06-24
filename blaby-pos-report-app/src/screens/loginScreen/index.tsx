import React, {useState} from 'react';
import {
  ScrollView,
  View,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {validateAll} from 'indicative/validator';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './styles';
import InputItem from '../../components/inputText';
import PrimaryButton from '../../components/buttons/primary';

import API from '../../config/api';
import {POST} from '../../utils/apiCalls';
import {login, setToken} from '../../redux/slices/AuthSlice';

function LoginScreen(props: any) {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  const [errors, setErrors] = useState<any>({});

  const [errorData, setErrorData] = useState<any>(null);

  const Rule = {
    email: 'required',
    password: 'required',
  };
  const messages = {
    required: (field: any) => `Required`,
  };

  const Login = async () => {
    try {
      setErrors({});
      setErrorData(null);
      setIsLoading(true);
      const obj: any = {
        email: email,
        password: password,
      };

      validateAll(obj, Rule, messages)
        .then(async (success: any) => {
          const response: any = await POST(API.LOGIN, success);

          if (response?.success) {
            if (response?.data?.user?.staffAccess?.includes('report')) {
              // Save token to AsyncStorage
              try {
                await AsyncStorage.setItem('authToken', response?.data?.token);
              } catch (storageError) {
                // Silent fail for storage error
              }

              // Dispatch to Redux
              dispatch(login(response?.data));
              dispatch(setToken(response?.data?.token));

              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'home'}],
                }),
              );
            } else {
              setErrorData("You don't have permission to login");
            }
          } else {
            setErrorData(response?.message || 'Login failed');
          }
          setIsLoading(false);
        })
        .catch((errors: any) => {
          var formattedErrors: any = {};
          errors.forEach(
            (error: any) => (formattedErrors[error.field] = error.message),
          );
          setErrors(formattedErrors);
          setIsLoading(false);
        });
    } catch (err) {
      setErrorData('oops. something gone wrong.try again');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.loginScreen}>
      <StatusBar
        barStyle={'dark-content'}
        translucent={true}
        backgroundColor={'transparent'}
      />
      <ScrollView
        contentContainerStyle={styles.ScrollView}
        keyboardShouldPersistTaps="handled">
        <View style={styles.Box1}>
          <View style={styles.Box2}>
            <Image
              resizeMode="contain"
              source={require('../../assets/images/logo-dark.png')}
              style={styles.Logo}
            />
          </View>
          <Text style={styles.text1}>Reports and sales</Text>
          <InputItem
            label={'Email address'}
            placeholder={'Enter Email'}
            required={true}
            error={errors['email'] || null}
            value={email}
            onChange={(value: any) => setEmail(value)}
          />
          <InputItem
            label={'Password'}
            placeholder={'Enter password'}
            secure={true}
            required={true}
            error={errors['password'] || null}
            value={password}
            onChange={(value: any) => setPassword(value)}
          />
          <View style={{margin: 10}} />
          {errorData ? <Text style={styles.errorText}>{errorData}</Text> : null}
          <PrimaryButton
            label={'Login'}
            loading={isLoading}
            onPress={() => Login()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
