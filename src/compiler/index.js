import { parseHTML} from "./parse";


const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;  //{{xx}} 匹配表达式的变量

// 属性切割
function genProps(attrs){
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];

    // 如果是style属性单独切割处理
    if(attr.name == 'style'){
      let obj = {};
      attr.value.split(';').map(item=>{
        let [key,value] = item.split(':');
        obj[key] = value;
      })
      attr.value = obj;
    }

    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0,-1)}}`;
}

function genChildren(children){
  return children.map(child=>gen(child)).join(',')
}

function gen(node){
  // 如果子节点是元素节点再次生成
  if(node.type === 1){
    return codegen(node)
  }else{
    // 如果是文本类型
    let text = node.text;

    // 如果没有匹配到 {{ }}  注意：/xxx/g.test() /xxx/g.exec(text))  匹配成功后的lastIndex 会变化
    if(!defaultTagRE.test(text)){
      return `_v(${JSON.stringify(text)})`
    }else{
      let tokens = [];
      let match;
      let lastIndex = 0;
      // 这里一定得设置为0 否则只会匹配到最后一个值（是因为使用了g全局匹配会导致这种问题）
      defaultTagRE.lastIndex = 0;

      // match : [0: "{{name}}" 1: "name"]
      while(match = defaultTagRE.exec(text)){
        let index = match.index;

        // 如果匹配的 '文字 {{}} ' 前面还有 其他文本 直接放入
        if(index > lastIndex){
          tokens.push(JSON.stringify(text.slice(lastIndex,index)))
        }

        // 重新设置当前匹配后的位置
        lastIndex = index + match[0].length;

        // console.log('match[1]',match[1],`${match[1]}`);
        tokens.push(`_s(${match[1]})`);
      }
      //  匹配完成了 '{{}} 文字' 最后如果还有 文字也得放入进来
      if(lastIndex < text.length){
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }

      return `_v(${tokens.join('+')})`
    }
  }
  
}

// 将ast语法树转换成render函数  _c  _s替换{{}}  _v 文本
function codegen(ast){
  let children = genChildren(ast.children)
  let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs):'null'}${ast.children.length>0 ? `,${children}`:''})`)
  return code
}

//对模板进行编译处理
export function compileToFunction(template){
  // 1. 将template转化成ast树
  const ast = parseHTML(template)

  console.log('ast',ast);

  // 2. 生成render方法 将ast语法树转换成render函数
  // 模板引擎的实现原理 就是 with + new Function
  let code = codegen(ast);
  console.log('code',this,code);

  
  // c('div',{id:"app",class:"999",style:{"color":" #f33","font-size":"18px"}},_c('div',{style:{"color":" #ff3"}},_v(_s(name)+" 你 "+_s(age)+"  好111")),_c('span',null,_v("hello")))
  // 因为with 当this传入vm的时候，_s(xxx)中的变量会自动去vm上拿取
  code = `with(this){return ${code}} `;
  let render = new Function(code);
  
  return render;
}