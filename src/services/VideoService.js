import Api from '@/services/Api'

export default {
  getAll() {
    return Api().get(`service/data`)
  },
  getMemberVideos(url, body={}) {
    return Api().post(url, body)
  },

  async follow({domain, serviceId}, body){
    return await Api().post(`https://${domain}/api/v1/data/${serviceId}/network_invites/append`, body)
  },
  
  getById(url, filter) {
      return Api().post(url, filter)
  },
  uploadVideo(data, optional) {
    return Api().post('videos', data, optional)
  },
  updateVideo(id, data) {
    return Api().put(`videos/${id}`, data)
  },
  updateViews(id) {
    return Api().put(`videos/${id}/views`)
  },
  uploadThumbnail(id, data) {
    return Api().put(`videos/${id}/thumbnails`, data)
  },
  deleteById(id) {
    return Api().delete(`videos/${id}`)
  }
}
