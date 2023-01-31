
let oldArrayProto = Array.prototype;  //获取数组原型

// 获取新的实例原型  不影响原数组方法
export let newArrayProto = Object.create(oldArrayProto)
// 找到所有变异方法
let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice',
]

methods.forEach(method=>{
  // 数组方法的重新
  newArrayProto[method] = function(...args){

    // console.log('------this-----',this,args);
    
    // 内部还是调用了原来的方法
    const result = oldArrayProto[method].call(this,...args);

    // 我们对新增的数据进行劫持
    let inserted;
    let ob = this.__ob__;

    switch(method){
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':  //arr.splice(0,1,{age:18},{a:1})
        inserted = args.slice(2)
        break;
      default:
        break;
    }

    if(inserted){
      // 对新增的内容再次进行观测
      ob.observeArray(inserted);
    }

    console.log('inserted',inserted);
    return result;
  }
})

