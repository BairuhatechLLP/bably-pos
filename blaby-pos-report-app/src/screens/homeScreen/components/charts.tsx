import React, {useEffect, useState} from 'react';
import {Text, View, useWindowDimensions} from 'react-native';
import styles from '../styles';

import {LineChart} from 'react-native-gifted-charts';
import COLORS from '../../../config/color';
import FONTS from '../../../config/fonts';
import moment from 'moment';

function Chart(props: any) {
  const {width, height} = useWindowDimensions();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
    }, 10);
  }, [width]);

  function getTodayAndLastDate() {
    const today = new Date();
    const lastDate = new Date();
    lastDate.setDate(today.getDate() - 6);
    return {
      today: moment(today.toDateString()).format('DD/MM'),
      lastDate: moment(lastDate.toDateString()).format('DD/MM'),
    };
  }
  return refresh ? null : (
    <View style={styles.Box1}>
      <LineChart
        data={props?.data}
        isAnimated
        curved
        thickness={3}
        width={width - 10}
        height={200}
        color={COLORS.PRIMARY}
        noOfSections={6}
        animateOnDataChange
        animationDuration={1000}
        onDataChangeAnimationDuration={300}
        yAxisTextStyle={{
          color: 'grey',
          fontFamily: FONTS?.REGULAR,
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: 'grey',
          fontFamily: FONTS?.REGULAR,
          fontSize: 10,
        }}
        areaChart
        hideDataPoints
        startFillColor={'rgb(84, 234, 154)'}
        endFillColor={'rgb(84, 234, 152)'}
        startOpacity={0.4}
        endOpacity={0.1}
        spacing={(width - 48) / 6}
        backgroundColor="#fff"
        rulesColor={COLORS?.GREY3}
        rulesType="dashed"
        initialSpacing={0}
        yAxisColor={COLORS?.GREY3}
        xAxisColor={'#FFF'}
        lineGradient
      />
      <Text style={styles.text4}>
        Last 1 week ({getTodayAndLastDate().lastDate} -{' '}
        {getTodayAndLastDate().today}) summary
      </Text>
    </View>
  );
}

export default Chart;
