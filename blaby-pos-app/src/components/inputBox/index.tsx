import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Platform,
    TouchableOpacity,
  } from 'react-native';
  import React, {useState} from 'react';
  import Ionicons from 'react-native-vector-icons/Ionicons';
  
  import COLOR from '../../config/color';
  import FONTS from '../../config/fonts';
  
  const InputItem = (props: any) => {
    const [view, setView] = useState(props?.secure ? true : false);
    const checkNumbers = (value: any) => {
      props.onChange ? props.onChange(value) : null;
    };
    return (
      <View>
        {props.label ? (
          <Text style={styles.label}>
            {props.label}{' '}
            {props?.required ? <Text style={{color: 'red'}}>*</Text> : null}
          </Text>
        ) :null}
        <View style={styles.inputBox}>
          {props?.prefix?props?.prefix:null}
          <TextInput
            readOnly={props?.read}
            multiline={props?.multiline}
            placeholder={props.placeholder}
            placeholderTextColor={'grey'}
            style={[
              styles.input,
              props?.inputStyle,
              {textAlignVertical: props?.multiline ? 'top' : 'center'},
            ]}
            value={props.value}
            onChangeText={(value: any) => checkNumbers(value)}
            keyboardType={props?.keyboardType ? props?.keyboardType : 'default'}
            numberOfLines={props.rows}
            maxLength={props?.maxLength ?? null}
            secureTextEntry={view ? true : false}
          />
          {props?.secure ? (
            <TouchableOpacity onPress={() => setView(!view)}>
              <Ionicons
                name={view ? 'eye-outline' : 'eye-off-outline'}
                color={COLOR.primary}
                size={20}
                style={{marginRight: 10}}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
      </View>
    );
  };
  const styles = StyleSheet.create({
    label: {
      fontFamily: FONTS.Medium,
      color: '#000',
      fontSize: 12,
      marginBottom: 5,
      marginTop: 15,
      alignItems: 'center',
      marginLeft: 2,
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      borderColor: COLOR.grey1,
      borderWidth: 1,
    },
  
    input: {
      flex: 1,
      fontFamily: FONTS.Medium,
      padding: Platform.OS === 'ios' ? 12 : 9,
      paddingLeft: 10,
      paddingBottom: Platform.OS === 'ios' ? 8 : 6,
      fontSize: 14,
      color: '#000',
    },
    error: {
      color: 'red',
      fontFamily: FONTS.Regular,
      marginTop: 3,
      fontSize: 13,
      marginLeft: 2,
    },
  });
  export default InputItem;
  