<script lang="ts">
import { get_streams, translate, TranslateResult } from './api/api'
import { Stream } from '../scripts/models'

import videojs from 'video.js'
// import { Search } from '@element-plus/icons-vue'
// import 'videojs-contrib-hls'
import Player from 'video.js/dist/types/player'

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
				country: "美国",
				keywords: ""
			},
			player: undefined as Player | undefined,
			playUrl: ""
		}
	},
	mounted() {
		this.load()
	},
	methods: {
		async convertCountry2Chinese(country: string[], data:Stream[])  {
			const countryStr = country.join(",")
			const translateResult = await translate({words: country})
			const cnStr = translateResult.TargetText
			const cnCountry = cnStr.split("\n")
			data.forEach(item => {
				const index = country.indexOf(item.country)
				if(index >= 0 && index < cnCountry.length) {
					item.country = cnCountry[index]
				}
			})

			this.options.country = cnCountry
		},
		async load(): Promise<void> {
			let data = await get_streams()

			this.options.quality = Array.from(new Set(data.map(item => item.quality ?? "undefined")))
			this.options.isNSFW = Array.from(new Set(data.map(item => (item.isNSFW ? "nsfw" : "normal"))))
			let country = Array.from(new Set(data.map(item => (item.country ?? "undefined"))))
			await this.convertCountry2Chinese(country, data)

			this.streams = this.filter(data)
			this.originalStreams = data
		},
		copy(data:Stream[]):Stream[] {
			return JSON.parse(JSON.stringify(data)) as Stream[]
		},
		filter(data: Stream[]): Stream[] {
			let newObj = this.copy(data)

			return newObj.filter(item => {
				let isOk = true
				if (this.checked.isNSFW == "nsfw") {
					isOk &&= item.isNSFW
				} else {
					isOk &&= !item.isNSFW
				}
				if (this.checked.country) {
					isOk &&= item.country == (this.checked.country)
				}
				if(this.checked.keywords) {
					isOk &&= item.name.indexOf(this.checked.keywords) >= 0
				}
				return isOk
			})
		},
		research() {
			this.streams = this.filter(this.originalStreams)
		},
		initPlayer(url: string) {
			console.log(url)

			if(this.player) {
				this.player.dispose()
				this.player = undefined
			}
			
			const boxNode = document.getElementById("video-box")
			console.log(boxNode)
			if(boxNode) {
				boxNode.innerHTML = ''
				const videostr = `<video id="my-video" class="video-js" controls preload="auto" poster="//vjs.zencdn.net/v/oceans.png"
										style="width: 100%;height:100%">
										<source id="source" type="application/x-mpegURL" />
									</video>`
				
				boxNode.insertAdjacentHTML("afterend", videostr)
			}
			

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
				],
				fluid: true
			}

			let player = videojs('my-video', options, () => {
				videojs.log('Your player is ready!');

				// In this context, `this` is the player that was created by Video.js.
				player.play();

				// How about an event listener?
				player.on('ended', function () {
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
			<span class="result">{{ streams.length }}/{{ originalStreams.length }} results</span>
			<el-select v-model="checked.isNSFW" placeholder="nsfw" filterable clearable
				style="margin-left: 10px;">
				<el-option v-for="(item, index) in options.isNSFW" :key="index" :label="item" :value="item" />
			</el-select>
			<el-select v-model="checked.country" placeholder="nsfw" filterable clearable
				style="margin-left: 10px;">
				<el-option v-for="(item, index) in options.country" :key="index" :label="item" :value="item" />
			</el-select>
			<el-input v-model="checked.keywords" placeholder="keywords"
				clearable
				style="margin-left: 10px;"></el-input>
			<el-button type="success"  @click="research" style="margin-left: 10px;">Search</el-button>
		</el-card>
		<el-card class="content">
			<div class="stream-list">
				<div class="stream-item" v-for="(item, idx) in streams" :key="idx">
					<span class="stream-title">{{ item.name }}</span>
					<el-button @click="initPlayer(item.url)" :title="item.url" size="small"
						style="margin-right: 10px;">DO</el-button>
				</div>
			</div>

			<div id="video-box" class="video-item" style="flex: 1;width: 100%;">
				<video id="my-video" class="video-js" controls preload="auto" poster="//vjs.zencdn.net/v/oceans.png"
					style="width: 100%;height:100%">
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
	flex: 0 0 auto;
	width: 400px;
}

#player {
	height: 100%;
	flex: 1;
}

.stream-item {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
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
	width: 100%;
}
</style>
