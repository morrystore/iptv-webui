<script lang="ts">
import { get_streams } from './api/api'
import { Stream } from '../scripts/models'

export default {
	data() {
		return {
			streams: <any>[]
		}
	},
	mounted() {
		this.load()
	},
	methods: {
		async load(): Promise<void> {
			let data = await get_streams()
			this.streams = data
			let d = data.filter(item => item.isNSFW)
			console.log(d.at(0)?.url)
		}
	}
}
</script>

<template>
	<div>
	</div>
</template>

<style scoped></style>
