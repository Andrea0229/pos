//'use strict';
//var loadAllItems  = require('./fixtures.js');
//const loadPromotions  = require('./fixtures.js');

function printReceipt(tags){
  var resultStr = '***<没钱赚商店>收据***\n';
  var allItems = loadAllItems();              //获取商品列表
  var allDiscount = loadPromotions();         //获取打折信息
  var allGoods = getPayoff(allItems, allDiscount, tags);      //计算所有商品价格

}

/*
 * 计算商品价格
 */
function getPayoff(allItems, allDiscount, tags){
  var all_price = 0;        //所有商品总价
  var all_discount  = 0;    //所有折扣金额
  var result = '***<没钱赚商店>收据***\n'                       //所有商品总计
  var all_goods = [];
  for(let tag of tags){
    var goods = {
      'barcode' : tag,
      'count' : 1
    };                          //存放每个商品的条码，单价，数量，折扣，小计
    all_goods = getCount(goods, all_goods);                   //获取购物车单个商品条码，数量（存放到列表中）
  }
  for(var goods of all_goods){
    // console.log('goods.barcode='+goods.barcode+'\t goods.count='+goods.count);
    goods = getOriginPrice(allItems, goods); //获取名称单，价，单位，
    // console.log('goods.barcode='+goods.barcode+'\t goods.count='+goods.count+'\tname:'+goods.name+'\tprice:'+goods.price);
    goods = getActualPrice(allDiscount, goods);  //获取商品折扣，商品小计
    result += '名称：'+goods.name+'，数量：'+goods.count+goods.unit+'，单价：'+goods.price+'(元)，小计：'+goods.subtotal.toFixed(2)+'(元)\n';
    all_price += goods.subtotal;
    all_discount += goods.offer;
  }

  result += '----------------------\n';
  result += '总计：' + all_price.toFixed(2) + '(元)\n节省：'+all_discount.toFixed(2) + '(元)\n**********************';
  console.log(result);
}

/*
 * 获取shashangp商品条码，数量
 */
function getCount(goods, all_goods){
   if(goods.barcode.indexOf('-') >= 0){
    let temp = goods.barcode.split('-');
    goods.barcode = temp[0];
    goods.count = parseFloat(temp[1]);
  }

  for(let i=0; i<all_goods.length; i++){
    if(all_goods[i].barcode === goods.barcode){
      all_goods[i].count += goods.count;
      return all_goods;
    }
  }
  all_goods.push(goods);
  return all_goods;

  return goods;
}

/*
 * 是否包含某个字符
 */
function isContains(tag, ch){
  for(let i of tag){
    if(i === ch){
      return true;
    }
  }
  return false;
}

/*
 * 获取原单价
 */
function getOriginPrice(allItems, goods){
  for(let item of allItems) {
    if (item.barcode === goods.barcode) {
      goods.name = item.name;
      goods.unit = item.unit;
      goods.price = item.price.toFixed(2);
    }
  }
  // console.log(goods.barcode+'\t'+goods.name+'\t'+goods.unit);
  return goods;
}

/**
 * 通过优惠活动直接计算每件商品价格及优惠信息
 */
function getActualPrice(allDiscount, goods){
    //获取商品是否有折扣

    let discount = getDiscount(allDiscount, goods.barcode);

    //买3免个，3个付2个
    if(discount === 'BUY_TWO_GET_ONE_FREE'){
      let a = parseInt(goods.count/3);
      let b = goods.count % 3;
      goods.subtotal = (a*2+b)*goods.price;
      goods.offer = a * goods.price;
    }
    //否则没有活动
    else{
      goods.subtotal = goods.count * goods.price;
      goods.offer = 0;
    }

    // console.log('小计：'+goods.subtotal);
  return goods;
}

/**
 * 商品是否有折扣
 */
function getDiscount(allDiscount, goods_barcode){
  for(let discount_type of allDiscount){
    // console.log('barcode=='+discount_type.barcodes);
    for(let item of discount_type.barcodes){
      if(item === goods_barcode){
        return discount_type.type;
      }
    }
  }

  return 'default';
}
