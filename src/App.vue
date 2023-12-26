<script lang="ts">
import { get_streams } from './api/api'
import { Stream } from '../scripts/models'
import { New265WebJs } from './static/libs/h265web.js'

import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
// import 'videojs-contrib-hls'

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
				quality: <string[]>[],
				country: <string[]>[]
			},
			checked: {
				channel: undefined,
				groupTitle: undefined,
				isNSFW: "normal",
				languages: undefined,
				name: undefined,
				quality: undefined,
				country: "us"
			},
			player:  undefined as Player | undefined,
			playUrl: "https://bigcitytv.playout.vju.tv/bigcitytv/main.m3u8"
		}
	},
	mounted() {
		this.load()
	},
	methods: {
		async load(): Promise<void> {
			let data = await get_streams()
			
			this.originalStreams = data
			this.options.quality = Array.from(new Set(data.map(item => item.quality ?? "undefined")))
			this.options.isNSFW = Array.from(new Set(data.map(item => (item.isNSFW ? "nsfw" : "normal"))))
			this.options.country = Array.from(new Set(data.map(item => (item.filepath ?? "undefined").replace(".m3u", ""))))

			this.streams = this.filter(data)
		},
		filter(data: Stream[]): Stream[] {
			let newObj = JSON.parse(JSON.stringify(data)) as Stream[]

			return newObj.filter(item => {
				let isOk = true
				if(this.checked.isNSFW == "nsfw") {
					isOk &&= item.isNSFW
				} else {
					isOk &&= !item.isNSFW
				}
				if(this.checked.country) {
					isOk &&= item.filepath == (this.checked.country + ".m3u")
				}
				return isOk
			})
		},
		research() {
			this.streams = this.filter(this.originalStreams)
		},
		initPlayer(url:string) {
			console.log(url)
			let options = {
				bigPlayButton: false,
				textTrackDisplay: false,
				posterImage: true,
				errorDisplay: false,
				controlBar: true,
				sources: [
					{
						src: url,
						type: 'application/x-mpegURL', // 告诉videojs,这是一个m3u8流
					}
				]
			}
			if(this.player) {
				this.player.dispose()
				this.player = undefined
			}
			let player = videojs('my-video',options ,  () => {
				videojs.log('Your player is ready!');

				// In this context, `this` is the player that was created by Video.js.
				player.play();

				// How about an event listener?
				player.on('ended', function() {
					videojs.log('Awww...over so soon?!');
				});
			});
			this.player = player
		}
	}
}
</script>

<template>
	<div class="container">
		<el-card class="options">
			<span class="result">{{ originalStreams.length }} results</span>
			<el-select v-model="checked.isNSFW" class="m-2" placeholder="nsfw" size="small" filterable clearable
				style="margin-left: 10px;">
				<el-option v-for="(item, index) in options.isNSFW" :key="index" :label="item" :value="item" />
			</el-select>
			<el-select v-model="checked.country" class="m-2" placeholder="nsfw" size="small" filterable clearable
				style="margin-left: 10px;">
				<el-option v-for="(item, index) in options.country" :key="item" :label="item" :value="item" />
			</el-select>
			<el-button type="success" size="small" @click="research" style="margin-left: 10px;">Search</el-button>
		</el-card>
		<el-card class="content">
			<div class="stream-list">
				<div class="stream-item" v-for="(item, idx) in streams" :key="idx">
					<span class="stream-title">{{ item.name }}</span>
					<el-button 
						@click="initPlayer(item.url)" 
						:title="item.url"
						size="small" 
						style="margin-left: 10px;">DO</el-button>
				</div>
			</div>
			
			<div id="video-box" class="video-item">
				<video
				id="my-video"
				class="video-js"
				controls
				preload="auto"
				poster="//vjs.zencdn.net/v/oceans.png"
				data-setup='{}'
				style="width: 500px;height:400px"
				>
				<source id="source" :src="playUrl" type="application/x-mpegURL" />
				</video>
			</div>
		</el-card>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100%;
	margin: 0;
}

.options {
	height: 50px;
	min-height: 50px;
	margin: 5px 10px;
	display: flex;
	justify-content: center;
	align-items: center;
}
.content {
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	margin: 5px 10px;
}
.stream-list {
	/* height: 80vh; */
	overflow-y: auto;
	height: 100%;
	flex: 1 0 auto;
	width: 400px;
}
#player {
	height: 100%;
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

.result {
	font-size: 13px;
	color: green;
	margin-right: 20px;
	display: inline-block;
}
:deep(.el-card__body) {
	display: flex;
}
</style>
