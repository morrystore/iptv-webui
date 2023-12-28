import axios from "axios"

type TranslateResultProps = {
    RequestId: string
    Source: string
    Target: string
    TargetText: string
}
class TranslateResult {

    RequestId: string
    Source: string
    Target: string
    TargetText: string

    constructor(param: TranslateResultProps) {
        this.RequestId = param.RequestId
        this.Source = param.Source
        this.Target = param.Target
        this.TargetText = param.TargetText
    }
}

const axiosTranslate = axios.create({
    baseURL: "http://47.88.174.105:8080/api",
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    },
    timeout: 10000
})

const translate = (params: any) => {
    return new Promise<TranslateResult>((resolve, reject) => {
        axiosTranslate.post<any>("prompt/translate", params).then(res => { resolve(res.data) }).catch(err => { reject(err.data) })
    })
}

export {TranslateResult, translate}