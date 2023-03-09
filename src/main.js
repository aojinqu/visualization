// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// import echarts from 'echarts'

// 加载 element 组件库
import ElementUI from 'element-ui'
 
// 加载 element 组件库的样式
import 'element-ui/lib/theme-chalk/index.css'
 
// 加载全局样式文件
//import './styles/index.less'
 
// 全局注册 element 组件库
Vue.use(ElementUI)
 
Vue.config.productionTip = false

// Vue.prototype.$echarts = echarts

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
