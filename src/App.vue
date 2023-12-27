<script lang="ts">
import { getStreams, translate, TranslateResult, addBadUrl,removeBadUrl,updateStreams } from './api/api'
import { Stream } from '../scripts/models'

import videojs from 'video.js'
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
			playUrl: "",
			checkRunning: false,
			checkUrls: <string[]>[],
			updating: false
		}
	},
	mounted() {
		this.load()
	},
	methods: {
		getChannelClass(stream: Stream): string {
			const cls = []
			if(!stream.available) {
				cls.push("invalid-channel")
			}
			if(stream.url == this.playUrl) {
				cls.push("active-channel")
			}
			return cls.join(" ")
		},
		async convertCountry2Chinese(country: string[], data: Stream[]) {
			const countryStr = country.join(",")
			const translateResult = await translate({ words: country })
			const cnStr = translateResult.TargetText
			const cnCountry = cnStr.split("\n")
			data.forEach(item => {
				const index = country.indexOf(item.country)
				if (index >= 0 && index < cnCountry.length) {
					item.country = cnCountry[index]
				}
			})

			this.options.country = this.countByCountry(cnCountry, data)
		},
		async load(): Promise<void> {
			let data = await getStreams()

			this.options.quality = Array.from(new Set(data.map(item => item.quality ?? "undefined")))
			this.options.isNSFW = Array.from(new Set(data.map(item => (item.isNSFW ? "nsfw" : "normal"))))
			let country = Array.from(new Set(data.map(item => (item.country ?? "undefined"))))
			await this.convertCountry2Chinese(country, data)

			this.streams = this.filter(data)
			this.originalStreams = data
		},
		copy(data: Stream[]): Stream[] {
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
					isOk &&= this.checked.country.indexOf(item.country) >= 0
				}
				if (this.checked.keywords) {
					isOk &&= item.name.indexOf(this.checked.keywords) >= 0
				}
				return isOk
			})
		},
		countByCountry(countrys:string[],data: Stream[]) {
			let map = new Map<string, number>()
			data.forEach(item=>{
				if(map.has(item.country)) {
					map.set(item.country, map.get(item.country) as number + 1)
				} else {
					map.set(item.country, 1)
				}
			})
			const result:string[] = []
			countrys.forEach(item => {
				result.push(item + " ("+ map.get(item) + ")")
			})
			return result
		},
		research() {
			this.streams = this.filter(this.originalStreams)
		},
		initPlayer(url: string) {
			console.log(url)
			this.playUrl = url

			if (this.player) {
				this.player.dispose()
				this.player = undefined
			}

			const boxNode = document.getElementById("video-box")
			if (boxNode) {
				boxNode.innerHTML = ''
				const videostr = `<video id="my-video" 
									class="video-js" 
									controls 
									preload="auto" 
									poster="//vjs.zencdn.net/v/oceans.png"
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
			let player = videojs('my-video', options,  () => {
				videojs.log('Your player is ready!');
				// In this context, `this` is the player that was created by Video.js.
				player.on("error", (e: EventTarget) => {
					console.log(`Invalid url - ${url}`)
					addBadUrl({url: url}).then(data => {
						// set available state
						this.streams.forEach(item => {
							if(item.url == url) {
								item.available = false
							}
						})
						this.checkNext()
					})
				})
				player.on("play", (e: EventTarget) => {
					console.log(`This url can play - ${url}`)
					removeBadUrl({url: url}).then(data => {
						this.checkNext()
					})
				})
				player.play();
				player.muted(true)

			});
			this.player = player
		},
		checkNext() {
			if(!this.checkRunning || this.checkUrls.length == 0) return
			const url = this.checkUrls.shift()
			if(url) this.initPlayer(url)
		},
		checkChannels() {
			if(this.checkRunning) {
				this.checkUrls = []
				this.checkRunning = false
			} else {
				this.checkUrls = this.streams.map(item => item.url)
				this.checkRunning = true
				this.checkNext()
			}
		},
		updateRemote() {
			this.updating = true
			updateStreams({}).then(data => {
				this.updating = false
			})
		}
	}
}
</script>

<template>
	<div class="container">
		<el-card class="options">
			<span class="result">{{ streams.length }}/{{ originalStreams.length }} results</span>
			<el-select v-model="checked.isNSFW" placeholder="nsfw" filterable clearable
				style="margin-left: 10px;max-width: 200px;">
				<el-option v-for="(item, index) in options.isNSFW" :key="'nsfw_' + item" :label="item" :value="item" />
			</el-select>
			<el-select v-model="checked.country" placeholder="nsfw" filterable clearable
				style="margin-left: 10px;max-width: 200px;">
				<el-option v-for="(item, index) in options.country" :key="'country_' + item" :label="item" :value="item" />
			</el-select>
			<el-input v-model="checked.keywords" placeholder="keywords" clearable
				style="margin-left: 10px;max-width: 200px;"></el-input>
			<el-button type="success" @click="research" style="margin-left: 10px;">Search</el-button>
			<el-button type="info" @click="checkChannels" style="margin-left: 10px;">{{checkRunning? 'Stop' : 'Check'}}</el-button>
			<el-button type="warning" @click="updateRemote" style="margin-left: 10px;" :disabled="updating" :loading="updating">Update</el-button>
		</el-card>
		<el-card class="content">
			<div class="stream-list">
				<div class="stream-item" v-for="(item, idx) in streams" :key="idx">
					<span class="stream-title" :class="getChannelClass(item)">{{ item.name }}</span>
					<el-button @click="initPlayer(item.url)" :title="item.url" style="margin-right: 10px;">DO</el-button>
				</div>
			</div>
			<div id="video-box" class="video-item" style="flex: 1;width: 100%;">
				<!-- <video id="my-video" class="video-js" controls preload="auto" poster="//vjs.zencdn.net/v/oceans.png"
					style="width: 100%;height:100%">
					<source id="source" :src="playUrl" type="application/x-mpegURL" />
				</video> -->
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
	display: flex;
	align-items: center;
}

:deep(.el-card__body) {
	display: flex;
	width: 100%;
}
.invalid-channel {
	color: #ccc;
}
.active-channel {
	color: red;
}
</style>
