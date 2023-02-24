const isReservedTag = (tag)=>{
  return ['a','div','p','button','ul','li','span'].includes(tag)
}

//  _h() _c()
export function createElementVNode(vm,tag,data,...children){
  // console.log('66666666',tag,data,children);
  if(data == null){
    data = {};
  }
  
  // 不明白这里为什么要把key删除
  // let key = data.key;
  // if(key){
  //   delete data.key
  // }

  // 如果是真实dom
  if(isReservedTag(tag)){
    return vnode(vm,tag,data.key,data,children)
  }else{
    console.log('vm.$options',vm.$options);
    
    let Ctor = vm.$options.components[tag]; //组件的构造函数
    
    // 创建一个组件的虚拟节点
    console.log('createComponentVnod',createComponentVnode(vm,tag,data.key,data,children,Ctor));
    return createComponentVnode(vm,tag,data.key,data,children,Ctor)
  }
}

// 创建一个组件的虚拟节点
function createComponentVnode(vm,tag,key,data,children,Ctor){
  if(typeof Ctor == 'object'){
    Ctor = vm.$options._base.extend(Ctor)
  }
  

  data.hook = {
    init(vnode){ //稍后创建真实节点的时候，如果是组件则调用此方法
      let instance = vnode.componentInstance = new vnode.componentOptions.Ctor(); 
      instance.$mount();
    }
  }
  console.log('data----***',data,vnode(vm,tag,key,data,children,null,{Ctor}));
  
  return vnode(vm,tag,key,data,children,null,{Ctor})
}


// _v()
export function createTextVNode(vm,text){
  // console.log('_v()---------------',vm,text);
  return vnode(vm,undefined,undefined,undefined,undefined,text)
}


function vnode(vm,tag,key,data,children,text,componentOptions){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  }
}

// 比对两个dom元素是否相同
export function isSameVnode(vnode1,vnode2){
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}