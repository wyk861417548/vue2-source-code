import Dep from "./Observer/dep.js";
import { observe } from "./Observer/index.js";
import Watcher from './Observer/watcher.js'

export function initState(vm){
  const opts = vm.$options;

  if(opts.data){
    initData(vm)
  }

  if(opts.computed){
    initComputed(vm)
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

// 初始化 computed函数
function initComputed(vm){
  const computed = vm.$options.computed;
  let watchers = vm._computedWathcers  ={};
  // debugger
  for (const key in computed) {
    const userDef = computed[key];

    let fn = typeof userDef == 'function'?userDef:userDef.get;

    // 每个计算属性 对应一个计算watcher  默认lazy 首次不触发 视图更新操作
    // 此刻的计算watcher的get方法 就是当前计算属性的get方法
    watchers[key] = new Watcher(vm,fn,{lazy:true})
    // console.log('watchers[key]',watchers[key]);
    defineComputed(vm,key,userDef);
  }
}

// 定义计算属性
function defineComputed(target,key,userDef){
  const setter = userDef.set || (()=>{})
  Object.defineProperty(target,key,{
    get:createComputedGetter(key),
    set:setter
  })
}

// 创建一个计算属性控制器 用于控制页面多次调用计算属性只执行一次
// 计算属性根本不会去收集依赖，只会让自己的依赖属性去收集依赖
function createComputedGetter(key){
  return function(){
    let watcher = this._computedWathcers[key]; //获取到对应计算属性的watcher

    // console.log('createComputedGetter',watcher.dirty);
    if(watcher.dirty){
      // 如果用户传入的数据是脏的就去执行传入的函数
      watcher.evaluate();
    }

    // 这里的是渲染watcher了 让计算属性记住渲染watcher 用于当值变化地时候 即调用计算watcher更新值，也调用渲染watcher更新视图
    if(Dep.target){
      watcher.depend();
    }

    return watcher.value;
  }
}