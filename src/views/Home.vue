<template>
  <div id="home" class="pa-4">
    <v-container fluid>
      <v-alert prominent type="error" v-if="errored">
        <v-row align="center">
          <v-col class="grow">
            <div class="title">Error!</div>
            <div>
              Something went wrong, but don’t fr  et — let’s give it another shot. Junaid
            </div>
          </v-col>
          <v-col class="shrink">
            <v-btn @click="getVideos">Take action</v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <main v-else>
        <h3 class="headline font-weight-medium"> {{ $store.getters.isAuthenticated ? 'From your network' : 'Recommended' }}</h3>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="3"
            v-for="(video, i) in loading ? 12 : videos"
            :key="i"
            class="mx-xs-auto"
            @click="getItem(video)"
          >
            <v-skeleton-loader type="card-avatar" :loading="loading">
              <video-card
                :card="{ maxWidth: 350 }"
                :video="video.node"
                :channel="video.origin"
             
              ></video-card>
            </v-skeleton-loader>
          </v-col>
          <v-col class="text-center" v-if="videos.length === 0 && !loading">
            <p>No videos yet</p>
          </v-col>
          <v-col cols="12" sm="12" md="12" lg="12">
            <infinite-loading @infinite="getVideos">
              <div slot="spinner">
                <v-progress-circular
                  indeterminate
                  color="red"
                ></v-progress-circular>
              </div>
              <div slot="no-results"></div>
              <span slot="no-more"></span>
              <div slot="error" slot-scope="{ trigger }">
                <v-alert prominent type="error">
                  <v-row align="center">
                    <v-col class="grow">
                      <div class="title">Error!</div>
                      <div>
                        Something went wrong, but don’t fret — let’s give it
                        another shot.
                      </div>
                    </v-col>
                    <v-col class="shrink">
                      <v-btn @click="trigger">Take action</v-btn>
                    </v-col>
                  </v-row>
                </v-alert>
              </div>
            </infinite-loading>
          </v-col>
        </v-row>
      </main>
    </v-container>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import moment from 'moment'
import VideoCard from '@/components/VideoCard'
import VideoService from '@/services/VideoService'
import { constants } from '@/globals/contants'

export default {
  name: 'Home',
  data: () => ({
    loading: false,
    loaded: false,
    errored: false,
    videos: [],
    service_id : process.env.VUE_APP_BYOTUBE_SERVICE_ID,
    page: 1,
    initialState : {
        auth_token: typeof window !== "undefined" ? window.localStorage.getItem('token') : null,
        domain: typeof window !== "undefined" ? window.localStorage.getItem('domain') : null,
        isAuthenticated: null,
        user: null
    }
  }),
  methods: {
    async getServiceVideos($state) {
      if (!this.loaded) {
        this.loading = true
      }

      const videos = await VideoService.getAll()
        .catch((err) => {
          console.log(err)
          this.errored = true
        })
        .finally(() => {
          this.loading = false
        })

      if (typeof videos === 'undefined') return

      if (videos.data.edges.length) {
        this.page += 1
        this.videos.push(...videos.data.edges)
        $state.loaded()
        this.loaded = true
      } else {
        $state.complete()
      }
    },
    async getMemberVideos($state) {
      if (!this.loaded) {
        this.loading = true
      }
      
      let host_url = ''
      if(this.initialState.domain){
        host_url = `https://${this.initialState.domain}`
      }

      const data_url = `${host_url}/api/v1/data/${this.service_id}/feed_assets/query`;

      const videos = await VideoService.getMemberVideos(data_url)
        .catch((err) => {
          console.log(err)
          this.errored = true
        })
        .finally(() => {
          this.loading = false
        })

      if (typeof videos === 'undefined') return

      if (videos.data.edges.length) {
        this.page += 1
        this.videos.push(...videos.data.edges)
        $state.loaded()
        this.loaded = true
      } else {
        $state.complete()
      }
    },
    async getVideos($state){
      this.initialState.auth_token ? await this.getMemberVideos($state) : await this.getServiceVideos($state)
    },
    dateFormatter(date) {
      return moment(date).fromNow()
    },
    getItem(edge) {
      const SIGNEDBY = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      const SIGNED_TOKEN = "dummy"

      let asset = edge.node
      if (asset.ingest_status != 'external') {
        let apiUrl = `https://proxy.${constants.BYODA_NETWORK}/${constants.BYOTUBE_SERVICE_ID}/${edge.origin}/api/v1/pod/content/token?asset_id=${asset.asset_id}&service_id=${constants.BYOTUBE_SERVICE_ID}&signedby=${SIGNEDBY}&token=${SIGNED_TOKEN}&ingest_status=${asset.ingest_status}`
        fetch(apiUrl)
          .then((response) => response.json())
          .then(
            (data) => {
              asset = {...asset, key_id:data.key_id, content_token: data.content_token}
              localStorage.setItem('watch', JSON.stringify(asset))
              this.$router.push({name:'Watch'})
              
            }
          )
          .catch(
            (error) => {
              console.error(error);
            }
          );
      }else{
        localStorage.setItem('watch', JSON.stringify(asset))
        this.$router.push({name:'Watch'})
      }
    }
  },
  components: {
    VideoCard,
    InfiniteLoading
  }
}
</script>

<style lang="scss">
.card {
  background: #f9f9f9 !important;
}
</style>
