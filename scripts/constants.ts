const rootDir = process.cwd()
export const ROOT_DIR = process.env.ROOT_DIR || `${rootDir}`
export const STREAMS_DIR = process.env.STREAMS_DIR || `${rootDir}/streams`
export const PUBLIC_DIR = process.env.PUBLIC_DIR || `${rootDir}/.gh-pages`
export const README_DIR = process.env.README_DIR || `${rootDir}/.readme`
export const API_DIR = process.env.API_DIR || `${rootDir}/.api`
export const DATA_DIR = process.env.DATA_DIR || `${rootDir}/temp/data`
export const LOGS_DIR = process.env.LOGS_DIR || `${rootDir}/temp/logs`
export const TESTING = process.env.NODE_ENV === 'test' ? true : false
export const OWNER = 'iptv-org'
export const REPO = 'iptv'
