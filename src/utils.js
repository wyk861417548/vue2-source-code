export function mergeOptions(parent,child){
  const options = {}
  for (const key in parent) {
    mergeField(key)
  }

  for (const key in child) {
    if(!parent.hasOwnProperty(key)){
      mergeField(key)
    }
  }


  function mergeField(key){
    options[key] = child[key] || parent[key];
  }

  console.log('options',options);
  return options;
}

