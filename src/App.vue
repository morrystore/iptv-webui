<script lang="ts">
import { get_streams } from './api/api'
import { Stream } from '../scripts/models'

export default {
	data() {
		return {
			streams: <Stream[]>[],
			originalStreams: <Stream[]>[],
			form: {
				keywords: ""
			},
			options: {
				channel: <string[]>[],
				groupTitle: [],
				isNSFW: <String[]>[],
				languages: [],
				name: [],
				quality: <string[]>[]
			},
			checked: {
				channel: undefined,
				groupTitle: undefined,
				isNSFW: "nsfw",
				languages: undefined,
				name: undefined,
				quality: undefined
			}
			

		}
	},
	mounted() {
		this.load()
	},
	methods: {
		async load(): Promise<void> {
			let data = await get_streams()
			this.streams = data
			this.originalStreams = JSON.parse(JSON.stringify(data))
			this.options.quality = Array.from(new Set(data.map(item => item.quality ?? "undefined")))
			this.options.isNSFW = Array.from(new Set(data.map(item => (item.isNSFW ? "nsfw": "normal"))))
			
		},
		filter(data:Stream[]) {

		}
	}
}
</script>

<template>
	<el-card class="container">
		<div class="options">
			<el-select v-model="checked.quality" class="m-2" placeholder="quality" size="small">
				<el-option
				v-for="item in options.quality"
				:key="item"
				:label="item"
				:value="item"
				/>
			</el-select>
			<el-select v-model="checked.isNSFW" class="m-2" placeholder="nsfw" size="small" style="margin-left: 10px;">
				<el-option
				v-for="item in options.isNSFW"
				:key="item"
				:label="item"
				:value="item"
				/>
			</el-select>
			<el-button type="success" size="small" style="margin-left: 10px;">Search</el-button>
		</div>
		<div class="stream-list">
			<div class="stream-item" v-for="(item,idx) in streams" :key="idx">
				<span class="stream-title">{{ item.name }}</span>
				<a class="stream-url" :href="item.url">GO</a>
			</div>
		</div>
		
		
	</el-card>
</template>

<style scoped>
.container {
	display: flex;
}
.options {
	height: 50px;
}
.stream-list {
	/* height: 80vh; */
	overflow-y: auto;
	margin-top: 20px;
	flex: 1;
}
.stream-item {
	display: flex;
	flex-direction: row;
	margin-bottom: 10px;
}
.stream-url {
	margin-left: 20px;
}
</style>
