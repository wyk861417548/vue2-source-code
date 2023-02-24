import { initGlobalAPI } from "./gloabAPI";
import { initMinx } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import {compileToFunction} from './compiler/index'
import { createElm, patch} from "./vdom/patch";

// 不使用class 去创建类 是为了避免所有的方法耦合在一起
function Vue(options){
  // 初始化
  this._init(options)
}


// 扩展了init 方法
initMinx(Vue);
// vm._update  vm._render
initLifeCycle(Vue)
// 全局api的实现
initGlobalAPI(Vue)
// 实现了 nextTick $watch
initStateMixin(Vue)


// -------------------为了方便观察前后的虚拟节点 ‘测试’-----------------
// 生成虚拟节点的过程
// 1.调用compileToFunction函数对模板进行编译，生成render函数
// 2.调用render函数，生成虚拟dom树结构
// 3.调用patch生成真实dom节点并替旧节点

{/* <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
  <li key='d'>d</li> */}
// let render1 = compileToFunction(`<ul key='a' a='1' style='color:#f99'>
//   <li>e</li>
//   <li>c</li>
//   <li>f</li>
//   <li>g</li>
// </ul>`)
// let vm1 = new Vue({data:{name:'你好'}})
// let preVNode = render1.call(vm1);
// // console.log('preVNode',render1,preVNode);
// let el = createElm(preVNode)
// document.body.appendChild(el)

// let render2 = compileToFunction(`<ul key='a' a='1' style='color:#f99;background:#ff6700'>
//   <li>d</li>
//   <li>a</li>
//   <li>b</li>
//   <li>c</li>
// </ul>`)
// let vm2 = new Vue({data:{name:'哒哒哒看'}})
// let nextVNode = render2.call(vm2);


// setTimeout(()=>{
//   patch(preVNode,nextVNode)
// },1500)

export default Vue;