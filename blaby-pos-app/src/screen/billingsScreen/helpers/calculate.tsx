const CalculateSum = (data: any, ac: any) => {
  try {
    let total = 0;
    data?.map((item: any) => {
      let quantity = Number(item?.quantity) * Number(item?.sp_price);
      total += Number(quantity);
      if (ac) {
        let ac_charge = 5 * Number(item?.quantity);
        total = total + ac_charge;
      }
    });
    return {
      total: Number(total).toFixed(2),
    };
  } catch (err) {
    return {
      total: Number(0).toFixed(2),
    };
  }
};

export {CalculateSum};
