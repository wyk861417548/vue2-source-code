import babel from 'rollup-plugin-babel'
export default{
  input:'./src/index.js', //入口
  
  output:{
    file:'./dist/vue.js',
    name:'Vue',
    format:'umd', //es
    sourcemap:true //希望可以调试源代码
  },
  plugins:[
    babel({
      exclude:'node_modules/**'
    })
  ]
}