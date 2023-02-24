/**
 * vue核心流程
 * 1. 创造了响应式数据
 * 2. 模板转换成ast语法树
 * 3. 将ast语法树转换成render函数
 * 4. 后续每次数据更新可以只执行render函数（无需再次执行ast转化过程）
 */

import Watcher from "./Observer/watcher";
import { createElementVNode,createTextVNode} from "./vdom/index";
import { patch } from "./vdom/patch";

export function initLifeCycle(Vue){
  Vue.prototype._update = function(vnode){
    const vm = this;
    let el = vm.$el;  

    // 将组件第一次产生的虚拟节点保存在_vnode上
    let preVnode = vm._vnode;
    vm._vnode = vnode;

    // 通过判断是否是第一次渲染，如果不是 传入上次的渲染节点 进行diff算法比较
    if(preVnode){
      vm.$el = patch(preVnode,vnode)
    }else{
      // 这里patch既有初始化方法  又有更新（vm.$el重新赋值新的节点） 
      vm.$el = patch(el,vnode);
    }
    
  }

  Vue.prototype._render = function(){
    // console.log('this.$options.render',this.$options.render);
    // 指向Vue 因为render函数使用with 当this传入vm的时候，_s(xxx)中的变量会自动去vm上拿取
    return this.$options.render.call(this);
  }

  Vue.prototype._c = function(){
    // console.log('1',arguments);
    return createElementVNode(this,...arguments)
  }
  Vue.prototype._v = function(){
    // console.log('2',arguments);
    return createTextVNode(this,...arguments);
  }

  // 因为render函数使用with的原因 所以_s(xxx)中的变量 可以直接获取对应的值
  Vue.prototype._s = function(value){
    // console.log('3',value);
    if( typeof value !== 'object') return value;
    return JSON.stringify(value);
  }
}

export function mountComponent(vm,el){
  vm.$el = el;

  // 1.调用render方法产生虚拟节点，虚拟DOM
  // console.log('vm----------',vm,vm._render());

  console.log('-----------mountComponent-----------');
  const updateComponents = ()=>{
    vm._update(vm._render()); // 更新组件渲染
  }
  // debugger
  // watcher 相当于一个观察者  dep则是收集者 
  let watcher = new Watcher(vm,updateComponents,true) //true 用于标识 是一个渲染watcher

  console.log('watcher',watcher);
  // 2.根据虚拟DOM产生真实DOM

  // 3.插入到el元素中
}

// 生命周期钩子遍历执行
export function calHook(vm,hook){
  // console.log('hook',hook);
  // 如果钩子函数的数组存在
  const handles = vm.$options[hook];
  
  handles && handles.forEach(handle=>handle())
}