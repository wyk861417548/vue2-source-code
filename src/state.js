import { observe } from "./Observer/index.js";

export function initState(vm){
  const opts = vm.$options;
  if(opts.data){
    initData(vm)
  }
}

// 数据初始化
function initData(vm){
  let data = vm.$options.data; //data可能是函数和对象 vue3认定是函数

  // 疑问这里data函数的指向就是vm 为什么要call
  data = typeof data =='function'?data.call(vm):data;
 
  vm._data = data;  //将返回的对象放到_data上

  // 对于数据进行劫持 vue2里采用了一个api defineProperty
  observe(data)

  // 将vm._data 用vm来代理  方便用户获取
  for(let key in data){
    proxy(vm,'_data',key)
  }
}

// vm.xxx  代理到 vm._data.xxx
function proxy(vm,target,key){
  Object.defineProperty(vm,key,{
    get(){
      return vm[target][key]
    },

    set(value){
      vm[target][key] = value;
    }
  })
}