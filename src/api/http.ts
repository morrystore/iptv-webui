/**axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
import axios from 'axios'
import QS from 'qs'
import { ElMessage } from 'element-plus'

// 环境的切换
if (process.env.NODE_ENV == 'development') {
    axios.defaults.baseURL = 'http://localhost:9001'
} else if (process.env.NODE_ENV == 'debug') {
    axios.defaults.baseURL = 'http://localhost:9001'
} else if (process.env.NODE_ENV == 'production') {
    axios.defaults.baseURL = 'http://47.88.174.105:9001'
}
// 请求超时时间
axios.defaults.timeout = 10000
// post请求头
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
// 响应拦截器
axios.interceptors.response.use(
    response => {
        if (response.status === 200) {
            if (response.data.code == 1) {
                ElMessage.error(response.data.message)
            }
            return Promise.resolve(response)
        } else {
            return Promise.reject(response)
        }
    },
    error => {
        if (error.response.status) {
            ElMessage.error(error.response.data.message)
            return Promise.reject(error.response);
        }
    }
)
/** 
 * get方法，对应get请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function get<T = any>(url: string, params: Map<String, any>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        axios.get<any>(url, { params: params })
            .then(res => { resolve(res.data) })
            .catch(err => { reject(err.data) })
    });
}
/** 
 * post方法，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function post<T = any>(url: string, params: Map<String, any>): Promise<T> {
    return new Promise((resolve, reject) => {
        axios.post(url, params)
            .then(res => { resolve(res.data) })
            .catch(err => { reject(err.data) })
    });
}