import {StyleSheet, Text, ToastAndroid, TouchableOpacity} from 'react-native';
import {BluetoothEscposPrinter} from 'rn-bt-escpos-printer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLOR from '../../../config/color';
import FONTS from '../../../config/fonts';

const PrinterTest = () => {
  const print = async () => {
    try {
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      );
      await BluetoothEscposPrinter.printText(`Printer connection check\n\r`, {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 0.5,
        heigthtimes: 0.5,
        fonttype: 0.6,
      });
      await BluetoothEscposPrinter.printText(
        '-----------------------------------------------\n\r',
        {},
      );
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      );
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.printText('\n\r', {});
      await BluetoothEscposPrinter.cutOnePoint();
    } catch (err) {
      console.log('err', err);
      ToastAndroid.show(
        'Printer not connected.Please check connection',
        ToastAndroid.SHORT,
      );
    }
  };
  return (
    <TouchableOpacity onPress={() => print()} style={styles.PrinterTest}>
      <Text style={styles.PrinterTesttext}>Test Printer</Text>
      <Ionicons name="print-outline" size={20} color={COLOR.primary} />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  PrinterTest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLOR.grey4,
    paddingHorizontal: 10,
    padding: 5,
    borderRadius: 6,
  },
  PrinterTesttext: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    marginTop: 2,
  },
});
export default PrinterTest;
