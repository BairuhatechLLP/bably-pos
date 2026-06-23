import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {validateAll} from 'indicative/validator';

import InputItem from '../../../components/inputBox';
import ResponsiveModal from '../../../components/responsiveModal';
import PrimaryButton from '../../../components/buttons/primary';

import API from '../../../config/api';
import {PUT} from '../../../utils/apiCalls';
import {update} from '../../../redux/slice/userSlice';

export default function EditModal(props: any) {
  const Auth = useSelector((state: any) => state?.Auth?.user);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [errorData, setErrorData] = useState<any>(null);

  const [name, setName] = useState(Auth?.staff.name);
  const [email, setEmail] = useState(Auth?.staff.email);
  const [telephone, setTelephone] = useState(Auth?.staff.mobile);
  const [address, setAddress] = useState(Auth?.staff.address);
  const [city, setCity] = useState(Auth?.staff.city);
  const [postcode, setPostcode] = useState(Auth?.staff.postcode);

  const Rule = {
    name: 'required',
    email: 'required',
    telephone: 'required',
  };
  const messages = {
    required: (field: any) => `Required`,
  };

  const onUpdate = async () => {
    setIsLoading(true);
    try {
      let url = API.UPDATE_PROFILE + Auth?.staff?.id;
      let obj = {
        staffId: Auth?.staff?.staffId,
        name: name,
        email: email,
        telephone: telephone,
        address: address,
        city: city,
        postcode: postcode,
      };
      validateAll(obj, Rule, messages)
        .then(async success => {
          const response: any = await PUT(url, obj, {});
          if (response?.status === true) {
            let obj = {...Auth, staff: response?.data};
            dispatch(update(obj));
            setIsLoading(false);
            props.close(false);
          }
        })
        .catch(errors => {
          var formattedErrors: any = {};
          errors.forEach(
            (error: any) => (formattedErrors[error.field] = error.message),
          );
          setErrors(formattedErrors);
          setIsLoading(false);
        });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      title={`Edit Profile`}
      open={props?.open}
      close={() => props.close(false)}>
      <View style={styles.Box1}>
        <InputItem
          label={'Name'}
          placeholder={'Enter Name'}
          required={true}
          error={errors['name'] || null}
          value={name}
          onChange={(value: any) => setName(value)}
        />
        <InputItem
          label={'Email address'}
          placeholder={'Enter Email'}
          required={true}
          error={errors['email'] || null}
          value={email}
          onChange={(value: any) => setEmail(value)}
        />
        <InputItem
          label={'Phone Number'}
          placeholder={'Enter Number'}
          required={true}
          keyboardType={'phone-pad'}
          error={errors['telephone'] || null}
          value={telephone}
          onChange={(value: any) => setTelephone(value)}
        />
        <InputItem
          label={'Address'}
          placeholder={'Enter Address'}
          multiline={true}
          rows={4}
          error={errors['address'] || null}
          value={address}
          onChange={(value: any) => setAddress(value)}
        />
        <View style={{flexDirection: 'row', gap: 10}}>
          <View style={{flex: 1}}>
            <InputItem
              label={'City'}
              placeholder={'Enter City'}
              error={errors['city'] || null}
              value={city}
              onChange={(value: any) => setCity(value)}
            />
          </View>
          <View style={{flex: 1}}>
            <InputItem
              label={'Postcode'}
              placeholder={'Enter Postcode'}
              error={errors['postcode'] || null}
              value={postcode}
              onChange={(value: any) => setPostcode(value)}
            />
          </View>
        </View>
        <View style={{margin: 20}} />
        <PrimaryButton
          label={'Update'}
          loading={isLoading}
          styles={{padding: 10}}
          onPress={() => onUpdate()}
        />
      </View>
    </ResponsiveModal>
  );
}
const styles = StyleSheet.create({
  Box1: {
    padding: 20,
    paddingTop: 10,
  },
});
