import { Dimensions } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const isMobile = () => {
  const { width } = Dimensions.get("window");
  return width < 768;
};

export const getFontSize = (size: number) =>{
  const { width } = Dimensions.get("window");
  const isMobile = width < 768;
  return moderateScale(size, isMobile?0.25:0.25);
} ;