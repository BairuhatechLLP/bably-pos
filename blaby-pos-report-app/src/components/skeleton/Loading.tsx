import React from 'react';
import {View, ScrollView} from 'react-native';

import {Skeleton} from './index';
function LoadingBox(props: any) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}>
      {[1, 2, 4, 5, 6].map((item, index) => (
        <View
          key={index}
          style={{padding:15}}>
           <Skeleton height={100} width={"100%"}/>
        </View>
      ))}
    </ScrollView>
  );
}
export default LoadingBox;
