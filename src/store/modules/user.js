import { login, logout } from "@/api/user"
import { removeToken, setToken } from "@/utils/auth"

const getDefaultState = () => {
  return {
    token: 'token',
    name: '',
    avatar: '',
    role: null
  }
}

const state = getDefaultState()

const actions = {
  async login({ commit }, loginForm) {
    try {
      // 直接写死token，不调用API
      const mockResponse = {
        data: {
          token: 'mock_token_' + Date.now(),
          name: 'Captain'
        }
      }
      
      commit('SET_TOKEN', mockResponse.data.token)
      setToken(mockResponse.data.token)
      return true
    } catch (e) {
      return false
    }
  },

  async logout({ commit }) {
    try {
      await logout()
    } catch (ignore) {
    }

    removeToken()
    commit('RESET_STATE')
  }
}

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
