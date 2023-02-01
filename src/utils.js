const strats = {};


// 定义钩子
const LIFYCYCLE = [
  'beforeCreate',
  'created'
]


// 处理 mixin中的生命钩子和主页面的生命钩子  合并成数组，然后遍历执行钩子  即调用calHook(vm,hook)函数
// p和c：假装是created函数
// 1.首次进入 p是没有的 所有直接返回 [c], 首次必定有c 不然进入不了   {} =>  [created:fn]
// 2.再次合并 如果 p(即上次返回的 [c] )有,而新的c无 直接返回 p   或者 是 p 有 c有则合并返回
LIFYCYCLE.forEach(hook=>{
  strats[hook] = (p,c)=>{
    if(c){
      if(p){
        return p.concat(c)
      }else{
        return [c]
      }
    }else{
      return p;
    }
  }
})


// 属性合并
export function mergeOptions(parent,child){
  const options = {}

  // console.log('parent',parent);
  // console.log('child',child);
  for (const key in parent) {
    mergeField(key)
  }

  for (const key in child) {
    if(!parent.hasOwnProperty(key)){
      mergeField(key)
    }
  }

  // 1.首次所有属性都放入 options 中
  // 2.再次调用 mergeOptions 合并属性时，如果新传入的child中有，并且属性不在LIFYCYCLE中，直接新的属性直接覆盖
  function mergeField(key){
    // console.log('mergeField',key);
    // 如果是LIFYCYCLE中定义的钩子 需要单独处理
    if(strats[key]){
      options[key] = strats[key](parent[key],child[key])
    }else{
      // 如果新的合并回合  父和子都有相同属性 用‘子’也就是（新的mixin中的属性替换旧的mixin中的属性）
      options[key] = child[key] || parent[key];
    }

  }

  console.log('options',options);
  return options;
}

