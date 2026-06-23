import React, {useState} from 'react';
import {ImageBackground, ScrollView, StatusBar, Text, View} from 'react-native';
import {validateAll} from 'indicative/validator';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import styles from './styles';
import InputItem from '../../components/inputBox';
import PrimaryButton from '../../components/buttons/primary';

import API from '../../config/api';
import {POST} from '../../utils/apiCalls';
import {login, setToken} from '../../redux/slice/userSlice';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
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
      let obj = {
        email: email,
        password: password,
      };
      validateAll(obj, Rule, messages)
        .then(async success => {
          try {
            console.log('Validation passed, making API call...');
            const response: any = await POST(API.STAFF_EMAIL_LOGIN, success);
            console.log('API Response received:', response);

            if (response?.status) {
              console.log('Login successful!');
              dispatch(login(response?.data));
              dispatch(setToken(response?.data?.token));
              navigation.reset({
                index: 0,
                routes: [{name: 'HomeScreen'}],
              });
            } else {
              console.log('Login failed:', response?.message);
              setErrorData(response?.message || 'Login failed. Please check your credentials.');
            }
            setIsLoading(false);
          } catch (apiError) {
            console.log('API Call Error:', apiError);
            setErrorData('Network error. Please check your connection and try again.');
            setIsLoading(false);
          }
        })
        .catch(errors => {
          console.log('Validation errors:', errors);
          var formattedErrors: any = {};
          errors.forEach(
            (error: any) => (formattedErrors[error.field] = error.message),
          );
          setErrors(formattedErrors);
          setIsLoading(false);
        });
    } catch (err) {
      console.log('Unexpected error:', err);
      setErrorData('Oops. Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.Container}>
      <StatusBar
        barStyle={'dark-content'}
        translucent={true}
        backgroundColor={'#fff'}
      />
      <View style={styles.card}>
        <View style={styles.logoBox}>
          <ImageBackground
            style={styles.logo}
            source={require('../../assets/images/logo.png')}
          />
          <Text style={styles.txt1}>Login and continue</Text>
        </View>
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
        <View style={{margin: 20}} />
        {errorData ? <Text style={styles.errorText}>{errorData}</Text> : null}
        <PrimaryButton
          label={'Login'}
          loading={isLoading}
          styles={{padding:10}}
          onPress={() => Login()}
        />
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
