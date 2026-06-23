const CartManage = (item: any, cart: any, action: any) => {
  try {
    let array: any = cart?.length ? [...cart] : [];
    const productId = item?.comb_id;

    if (action === 'clear') {
      return [];
    } else if (action === 'add') {
      if (array?.length) {
        const index = array.findIndex(
          (check: any) => check.comb_id === productId,
        );
        if (index >= 0) {
          let indexItem = array[index];
          array[index] = {
            ...indexItem,
            quantity: Number(indexItem?.quantity) + 1,
          };
          array = array;
        } else {
          item = {...item};
          array.push(item);
        }
      } else {
        item = {...item};
        array.push(item);
      }
    } else if (action === 'remove') {
      const index = array.findIndex(
        (check: any) => check.comb_id === productId,
      );
      if (index >= 0) {
        let indexItem = array[index];
        if (indexItem?.quantity <= 1) {
          array.splice(index, 1);
        } else {
          array[index] = {
            ...indexItem,
            quantity: Number(indexItem?.quantity) - 1,
          };
        }
      }
    } else if(action === 'delete'){
      const index = array.findIndex(
        (check: any) => check.comb_id === productId,
      );
      if (index >= 0) {
        array.splice(index, 1);
      }
    }else {
      console.log('no action found');
    }
    return array;
  } catch (err) {
    console.log('err = = =>', err);
    return cart;
  }
};

export {CartManage};
