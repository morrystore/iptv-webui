import { get, post } from "./http"
import { Stream } from '../../scripts/models'

// apis
export const getStreams = () => get<Stream[]>("/", new Map())
export const addBadUrl = (p:any) => post<string>("/addBadUrl", p)
export const removeBadUrl = (p:any) => post<string>("/removeBadUrl", p)
export const updateStreams = (p:any) => post<string>("/updateStreams", p)
