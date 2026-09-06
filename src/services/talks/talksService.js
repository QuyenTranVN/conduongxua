import { apiGet } from '../api/apiClient.js'

export const talksService = {
  async getTalks({ page = 1, pageSize = 20, signal } = {}) {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    return apiGet(`/v1/talks?${query}`, { signal })
  },
}
