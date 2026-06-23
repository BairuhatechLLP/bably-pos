import {BluetoothEscposPrinter} from 'rn-bt-escpos-printer';
import moment from 'moment';
import {ToastAndroid} from 'react-native';

const PrintInvoice = async (product: any, tables: any, Auth: any) => {
  try {
    let token = product?.tokenNo || 0;
    let table = tables?.table_number || 0;
    let Date = moment(product?.createdAt).format('DD/MM/YYYY HH:mm');
    let total = Number(product?.total).toFixed(2) || 0.00;
    let productName = (item: any) =>
      `${item?.idescription}${
        item?.parcel_option !== 'dine-in' ? ` (${item?.parcel_option})` : ''
      }`;
    // Store Header with larger font
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    await BluetoothEscposPrinter.printText(`${Auth?.companyInfo?.bname}\n\r`, {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0.5,
      heigthtimes: 0.5,
      fonttype: 0.6,
    });

    await BluetoothEscposPrinter.printText(
      `${Auth?.companyInfo?.fulladdress}\n\r`,
      {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 0,
        heigthtimes: 0,
        fonttype: 0.5,
      },
    );
    // VAT registration number (if set by admin)
    if (Auth?.companyInfo?.taxregno) {
      await BluetoothEscposPrinter.printText(
        `VAT No: ${Auth?.companyInfo?.taxregno}\n\r`,
        {
          encoding: 'GBK',
          codepage: 0,
          widthtimes: 0,
          heigthtimes: 0,
          fonttype: 0.5,
        },
      );
    }
    // Token Divider
    await BluetoothEscposPrinter.printText(
      '-----------------------------------------------\n\r',
      {},
    );
    const TokenColumns = [22, 2, 23];
    await BluetoothEscposPrinter.printColumn(
      TokenColumns,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      [`Token: ${token}`, '', `Table: ${table}`],
      {},
    );

    // Secont Divider
    await BluetoothEscposPrinter.printText(
      '-----------------------------------------------\n\r',
      {},
    );

    // Date with correct spacing
    const dateColumns = [22, 2, 23];
    await BluetoothEscposPrinter.printColumn(
      dateColumns,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ['Date & Time', '', Date],
      {},
    );
    await BluetoothEscposPrinter.printText(
      '-----------------------------------------------\n\r',
      {},
    );

    // Items Header
    const itemColumns = [22, 15, 10];
    await BluetoothEscposPrinter.printColumn(
      itemColumns,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ['Item', 'Qty    Price', 'Total'],
      {},
    );

    await BluetoothEscposPrinter.printText(
      '-----------------------------------------------\n\r',
      {},
    );

    // Print each item
    for (let item of product?.orderItems) {
      await BluetoothEscposPrinter.printColumn(
        itemColumns,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
        productName(item),
          `${item?.quantity}    ${Number(item?.sp_price)?.toFixed(2)}`,
          Number(Number(item?.sp_price) * Number(item?.quantity)).toFixed(2),
        ],
        {},
      );
    }

    // Divider before totals
    await BluetoothEscposPrinter.printText(
      '-----------------------------------------------\n\r',
      {},
    );

    // Parcel Charge
    let parcelCharge = 0;
    for (let item of product?.orderItems) {
      if (item?.parcel_option && item?.parcel_option !== 'dine-in') {
        parcelCharge += Number(item?.quantity || 0) * 5;
      }
    }
    if (parcelCharge > 0) {
      await BluetoothEscposPrinter.printColumn(
        itemColumns,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ['Parcel Charge', '', parcelCharge.toFixed(2)],
        {},
      );
    }

    // VAT — prices are VAT-inclusive, so show the VAT portion within the total
    const vatRate = Number(Auth?.companyInfo?.tax) || 0;
    if (vatRate > 0) {
      const grandTotal = Number(product?.total) || 0;
      const netTotal = grandTotal / (1 + vatRate / 100);
      const vatAmount = grandTotal - netTotal;
      await BluetoothEscposPrinter.printColumn(
        itemColumns,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ['Subtotal (excl. VAT)', '', netTotal.toFixed(2)],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        itemColumns,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [`VAT (${vatRate}%)`, '', vatAmount.toFixed(2)],
        {},
      );
    }

    // Total Amount
    await BluetoothEscposPrinter.printColumn(
      itemColumns,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ['Total Amount', '', total],
      {},
    );

    // Payment Method
    if (product?.paymentMethod) {
      await BluetoothEscposPrinter.printColumn(
        itemColumns,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ['Payment', '', product?.paymentMethod],
        {},
      );
    }

    // Divider before totals
    await BluetoothEscposPrinter.printText(
      '-----------------------------------------------\n\r',
      {},
    );

    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    await BluetoothEscposPrinter.printText(`Thank you visit again\n\r`, {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0.5,
      heigthtimes: 0.5,
      fonttype: 0.6,
    });

    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.cutOnePoint();
  } catch (error) {
    console.log('error', error);
    ToastAndroid.show(
      'Printer not connected.Please check connection',
      ToastAndroid.SHORT,
    );
  }
};

export default PrintInvoice;
