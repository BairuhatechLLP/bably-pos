import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from '../styles';
import InputItem from '../../../components/inputBox';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLOR from '../../../config/color';

const Denominations = (props: any) => {
  const [counters, setCounters] = useState<any>([{denomination: 0, count: 0}]);

  const [total, setTotal] = useState<any>(0);

  useEffect(() => {
    let totalS = 0;
    const filteredCounters = counters
      ?.filter((note: any) => note?.count !== '' && note?.denomination !== '')
      ?.map((note: any) => {
        const denomination = parseInt(note.denomination);
        const count = parseInt(note.count || 0);
        totalS += denomination * count;
        return { denomination, count };
      });
    const open_denomination = {
      banknotes: filteredCounters,
      total_balance: totalS,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setTotal(totalS);
    props?.totalOnChange(totalS);
    props?.onChange(open_denomination);
  }, [counters]);
  

  const addOne = () => {
    try {
      setCounters([...counters, {denomination: '0', count: '0'}]);
    } catch (err) {
      console.log('err', err);
    }
  };

  const removeOne = (index: number) => {
    try {
      const updatedCounters = counters.filter(
        (_: any, i: number) => i !== index,
      );
      setCounters(updatedCounters);
    } catch (err) {
      console.log('err', err);
    }
  };

  const handleInputChange = (index: number, field: any, value: any) => {
    try {
      const newCounters: any = [...counters];
      newCounters[index] = {
        ...newCounters[index],
        [field]: value,
      };
      setCounters(newCounters);
    } catch (err) {
      console.log('err', err);
    }
  };

  return (
    <View>
      <View style={styles.box8}>
        <View style={{flex: 2}}>
          <Text style={styles.label}>Amount</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.label}>Count</Text>
        </View>
        <View style={{width: 30}}></View>
      </View>
      {counters?.map((item: any, index: any) => {
        return (
          <View style={styles.box8} key={index}>
            <View style={{flex: 2}}>
              <InputItem
                placeholder={'Amount'}
                value={item.denomination}
                onChange={(value: any) =>
                  handleInputChange(index, 'denomination', value)
                }
              />
            </View>
            <View style={{flex: 1}}>
              <InputItem
                placeholder={'Count'}
                value={item.count}
                onChange={(value: any) =>
                  handleInputChange(index, 'count', value)
                }
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                index === counters.length - 1 ? addOne() : removeOne(index)
              }>
              {index === counters.length - 1 ? (
                <Ionicons name="add-outline" size={30} color={COLOR.primary} />
              ) : (
                <Ionicons name="remove-outline" size={30} color={'red'} />
              )}
            </TouchableOpacity>
          </View>
        );
      })}
      <View style={styles.box9}>
        <View style={{flex: 2}}>
          <Text style={styles.label}>Total Amount : </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.text3}> {Number(total).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

export default Denominations;
