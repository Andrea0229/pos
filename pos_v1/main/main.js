//'use strict';

function printReceipt(tags) {
  let allItems = loadAllItems();              //获取商品列表
  let allDiscount = loadPromotions();         //获取打折信息
  getPayoff(allItems, allDiscount, tags);      //计算所有商品价格
}

/*
 * 计算商品价格
 */
function getPayoff(allItems, allDiscount, tags) {
  let all_price = 0;        //所有商品总价
  let all_discount = 0;    //所有折扣金额
  let result = '***<没钱赚商店>收据***\n'                       //所有商品总计
  let all_goods = [];
  for (let tag of tags) {
    all_goods = getCount(tag, all_goods);                   //获取购物车单个商品条码，数量（存放到列表中）
  }
  for (let goods of all_goods) {
    goods = getOriginPrice(allItems, goods); //获取名称单，价，单位，
    goods = getActualPrice(allDiscount, goods);  //获取商品折扣，商品小计
    result += '名称：' + goods.name + '，数量：' + goods.count + goods.unit + '，单价：' + goods.price + '(元)，小计：' + goods.subtotal.toFixed(2) + '(元)\n';
    all_price += goods.subtotal;
    all_discount += goods.offer;
  }

  result += '----------------------\n';
  result += '总计：' + all_price.toFixed(2) + '(元)\n节省：' + all_discount.toFixed(2) + '(元)\n**********************';
  console.log(result);
}

function addGoods(all_goods, goods) {
  for (let i = 0; i < all_goods.length; i++) {
    if (all_goods[i].barcode === goods.barcode) {
      all_goods[i].count += goods.count;
      return all_goods;
    }
  }
  all_goods.push(goods);
  return all_goods;
}

/*
 * 获取商品条码，数量
 */
function getCount(tag, all_goods) {
  let goods = {
    'barcode': tag,
    'count': 1
  };
  if (goods.barcode.indexOf('-') >= 0) {
    let temp = goods.barcode.split('-');
    goods.barcode = temp[0];
    goods.count = parseFloat(temp[1]);
  }
  return addGoods(all_goods, goods);
}

/*
 * 获取原单价
 */
function getOriginPrice(allItems, goods) {
  for (let item of allItems) {
    if (item.barcode === goods.barcode) {
      goods.name = item.name;
      goods.unit = item.unit;
      goods.price = item.price.toFixed(2);
    }
  }
  return goods;
}

/**
 * 通过优惠活动直接计算每件商品价格及优惠信息
 */
function getActualPrice(allDiscount, goods) {
  //获取商品是否有折扣
  let discount = getDiscount(allDiscount, goods.barcode);
  //买3免个，3个付2个
  if (discount === 'BUY_TWO_GET_ONE_FREE') {
    let a = parseInt(goods.count / 3);
    let b = goods.count % 3;
    goods.subtotal = (a * 2 + b) * goods.price;
    goods.offer = a * goods.price;
  }
  //否则没有活动
  else {
    goods.subtotal = goods.count * goods.price;
    goods.offer = 0;
  }
  return goods;
}

/**
 * 商品是否有折扣
 */
function getDiscount(allDiscount, goods_barcode) {
  for (let discount_type of allDiscount) {
    for (let item of discount_type.barcodes) {
      if (item === goods_barcode) {
        return discount_type.type;
      }
    }
  }

  return 'default';
}
