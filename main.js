import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
// 引入elementUI
import ElementUI from 'element-ui'
Vue.use(ElementUI)

// 引入 手动改写的 axios.js
import Axios from 'axios.js'
Vue.use(Axios)


// 引入自写公共组件
import '@/components/common'


/** 在用vue  import引入资源的时候
 *  问题？
 *  什么时候使用 Vue.use()  ?
 *  什么时候使用 Vue.prototype.$name  ?
 *  什么时候直接 import ’@/path...‘   ?
* */

/** 解答
 *  1、Vue.use()  必须处理 含有install方法属性的对象
 *  改写的 axios 因为返回了install 对象，所以可以 用Vue.use()
 *
 *  2、Vue.prototype.$name 在最先获取到Vue对象的时候实例化之前注册原型方法，以供在实例化后的范围内随意使用
 *  3、无返回值，上下文执行类型文件，直接 import 执行
 *
 * */
//
//

let vue = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
export default vue



