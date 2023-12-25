import VideoService from '@/services/VideoService'

export const followMixin = {
    data: () => ({
        initialState : {
            auth_token: typeof window !== "undefined" ? localStorage.getItem('token') : null,
            domain: typeof window !== "undefined" ? localStorage.getItem('domain') : null,
            isAuthenticated: null,
            user: null
        }
    }),
    methods: {
      follow: async function (channelName, origin, serviceId,  createdTimestamp){
        const body = {
            relation: 'follow',
            text: channelName,
            member_id: origin,
            created_timestamp:createdTimestamp
        }
        return await VideoService.follow({domain:this.initialState.domain, serviceId: serviceId},{ data: body})
      }
  }
  
}