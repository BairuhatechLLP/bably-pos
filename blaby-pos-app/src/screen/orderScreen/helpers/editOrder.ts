const EditOrder = async (data: any) => {
  try {
    let orderItems = [];
    if (data?.orderItems?.length) {
      orderItems = data?.orderItems.map((item: any) => ({
        id: item?.productId,
        productId: item?.productId,
        quantity: item?.quantity,
        idescription: item?.idescription
          ? item?.idescription
          : item?.productMaster?.idescription,
        sp_price: item?.sp_price
          ? Number(item?.sp_price)
          : Number(item?.productMaster?.sp_price),
        comb_id: `${item?.productId}-${item?.ice_option}-${item?.sugar_option}-${item?.parcel_option}`,
        ice_option: item?.ice_option,
        sugar_option: item?.sugar_option,
        parcel_option: item?.parcel_option,
      }));
    }
    return {
      id: data.id,
      total: data?.total,
      table_details: {
        id: data?.table_details?.id,
        table_number: data?.table_details?.table_number,
      },
      ac_room: data?.ac_room ? true : false,
      cooking_instructions: data?.cooking_instructions,
      tokenNo: data?.tokenNo,
      paymentMethod: data?.paymentMethod || null,
      orderItems: orderItems,
    };
  } catch (err) {
    console.log('err', err);
    return false;
  }
};

export {EditOrder};
