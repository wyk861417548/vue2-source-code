const ncname = `[a-zA-z_][\\-\\.0-9_a-zA-z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; 
const startTagOpen = new RegExp(`^<${qnameCapture}`); //匹配标签名 <div
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配结束标签名 </div>

// 第一个分组就是属性的key value就是分组3/4/5
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
const startTagClose = /^\s*(\/?)>/; //开始标签的结束 ' > '


// 对模板进行编译处理（vue3采用的不是正则）或者使用插件 htmlparser2 解析
export function parseHTML(html){
  const TEXT_TYPE = 3,  //文本类型
        ELEMENT_TYPE = 1, //元素类型
        stack = []; //存为元素
  let currentParent; //指向栈中的最后一个
  let root; //根节点


  // 创建ast树
  function createASTElement(tag,attrs){
    return {
      tag,
      attrs,
      children:[],
      type:ELEMENT_TYPE,
      parent:null
    }
  }

  // 利用栈型结构，来构造一颗树 通过每次匹配判断标签开始与结束 判断进栈出栈 由此可以清晰知道当前节点所属位置
  function start(tag,attrs){
    let node = createASTElement(tag,attrs)

    // 看下是否是空树 如果是当前树就是根节点
    if(!root){
      root = node;
    }

    // 如果当前节点的父节点存在，设置当前节点的父节点，以及给父节点添加儿子节点
    if(currentParent){
      node.parent = currentParent;
      currentParent.children.push(node)
    }

    // 使用栈的进出判断当前节点以及其父节点
    stack.push(node);
    currentParent = node;
  }

  function chars(text){
    // 去除所有空格  这里会把文本中的空格也给去除调
    // text = text.replace(/\s/g,'')
    text = text.trim();
    text && currentParent.children.push({
      type:TEXT_TYPE,
      text,
      parent:currentParent
    })
  }

  function end(tag){
    stack.pop();
    // 当前父节点，就是栈最后一个
    currentParent = stack[stack.length - 1]
  }

  
  // 去除匹配到了
  function advance(n){
    html = html.substring(n)
  }

  // 开始标签匹配处理
  function parseStartTag(){
    const start = html.match(startTagOpen);
    //start: [0: "<div"  1: "div"]
    if(start){
      const match = {
        tagName:start[1],
        attrs:[]
      }

      // 匹配到之后 去除匹配开始标签
      advance(start[0].length)

      let attr,end;
      // 当不是开始标签的结束时，而是属性则一直匹配 
      while( !(end = html.match(startTagClose)) && (attr = html.match(attribute)) ){
        // 将匹配得属性部分删除
        advance(attr[0].length)

        //通过正则匹配 1是属性名 2是‘：’ 3/4/5位是属性的值  true处理disabled这种属性
        match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5] || true })
      }

      // 当匹配到开始标签得结束 > 时 删除 > 
      if(end){
        advance(end[0].length)
      }

      return match;
    }

    return false;
  }
  
  // 通过正则匹配开始标签 结束标签 字符 进行分类处理
  while(html){
    // 为0代表是一个开始标签或者结束标签
    let textEnd = html.indexOf('<');

    // 开始标签或者结束标签
    if(textEnd == 0){

      // 当匹配到开始标签
      const startTagMatch = parseStartTag();
      if(startTagMatch){
        // 处理开始标签为ast树
        start(startTagMatch.tagName,startTagMatch.attrs)
        continue;
      }

      // 如果是结束标签
      const endTagMatch = html.match(endTag)
      if(endTagMatch){
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue;
      }
      break;
    }

    // 如果是文本
    if(textEnd > 0){
      // 获取文本部分
      const text = html.substring(0,textEnd)
      // 删除文本部分
      advance(text.length)
      // 将文本处理成ast树
      chars(text)
    }
  }

  return root;
}