// 改写axios

import axios from 'axios'
import _this from 'main'
import qs from 'qs'

const devBaseUrl = [
  'http://192.168.1.234:9090/JeemaaPortalFrame',
]

const prodBaseUrl = [
  'http://192.168.1.234:9090/JeemaaPortalFrame',
]

function paramsToUrl (url, params) {
  if (!params) return url
  for (let key in params) {
    if (params[key] && params[key] !== 'undefined') {
      if (url.indexOf('?') > -1) {
        url += '&' + '' + key + '=' + params[key] || '' + ''
      } else {
        url += '?' + '' + key + '=' + params[key] || '' + ''
      }
    }
  }
  return url
}

const ajax = () => {
  // 默认Ajax配置
  let $http = axiosFrame.create({
    timeout: 60000
  })
  // 拦截request
  $http.interceptors.request.use(function (config) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (typeof config.data === 'undefined' || typeof config.data === 'object') {
      config.data = config.data || {}
      //   config.data.domainName = location.hostname
    } else if (typeof config.data === 'string') {
      //   config.data = config.data + '&domainName=' + location.hostname
    }
    if (config.method === 'post') {
      config.data = qs.stringify(config.data)
    }

    // if (localStorage.getItem('_token')) {
    //   config.headers.common['token'] = localStorage.getItem('_token')
    // }
    return config
  }, function (error) {
    return Promise.reject(error)
  })
  // 拦截response
  $http.interceptors.response.use(function (response) {
    let code = Number(response.data.code)
    if (code === 222 || code === 223 || code === 224) {
      localStorage.removeItem('_token')
      if (!_this.$store.state.global.isDropped) {
        _this.$message({
          message: '您已掉线，请重新登录',
          type: 'error'
        })
      }
    } else if (code === 400) {
      // _this.$route.path.indexOf('/') < 0
        _this.$message.error(response.data.message)
    }
    return response.data
  }, function (error) {
    return Promise.reject(error)
  })
  return $http
}

function requireData (url, params, type, index) {
  if (!url) return false
  if (process.env.NODE_ENV === 'development') {
    url = devBaseUrl[index] + url
  } else if (process.env.NODE_ENV === 'production') {
    url = prodBaseUrl[index] + url
  }

  // 拦截axios请求前后并做相关处理
  let $http = ajax()

  if (type && type.toLowerCase() === 'get') {
    url = paramsToUrl(url, params)
    return new Promise((resolve, reject) => {
      $http.get(url, params).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  } else {
    return new Promise((resolve, reject) => {
      $http.post(url, params).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

export default {
  insatll (Vue) {
    // 第一个参数是返回的 Vue实例
    // 做一些事
    // 比如 改写axios
    prodBaseUrl.forEach((item, index) => {
      Vue.prototype['reqServiceOf' + index] = function (url, params, type) {
        return requireData.call(this, url, params, type, index)
      }
    })
  }
}
