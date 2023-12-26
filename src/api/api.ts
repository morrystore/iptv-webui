import { Collection } from "@freearhey/core"
import { get, post, axiosTranslate } from "./http"
import { Stream } from '../../scripts/models'
export const get_streams = () => get<Stream[]>("/", new Map())


type TranslateResultProps = {
    RequestId:string
    Source:string
    Target:string
    TargetText:string
}
export class TranslateResult {
    RequestId:string
    Source:string
    Target:string
    TargetText:string
    constructor({
        RequestId,
        Source,
        Target,
        TargetText
    }:TranslateResultProps) {
        this.RequestId = RequestId
        this.Source = Source
        this.Target = Target
        this.TargetText = TargetText
    }
}
export const translate = (params: any) => {
    return new Promise<TranslateResult>((resolve, reject) => {
        axiosTranslate.post<any>("prompt/translate", params)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}