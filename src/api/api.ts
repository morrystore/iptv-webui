import { Collection } from "@freearhey/core"
import { get, post } from "./http"
import { Stream } from '../../scripts/models'
export const get_streams = () => get<Stream[]>("/", new Map())