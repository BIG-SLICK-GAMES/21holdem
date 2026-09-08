
import axios from "../axios";

export async function getTables(eBoardType = 'public') {
    const params = new URLSearchParams()
    if (eBoardType) params.set('eBoardType', eBoardType)
    const query = params.toString()
    return await axios.get(`/api/v1/poker/board/list${query ? `?${query}` : ''}`)
}

export async function joinTable(iTableId) {
    return await axios.post('/api/v1/poker/board/join', { iProtoId: iTableId })
}

export async function createPrivateTable(iTableId) {
    return await axios.post('/api/v1/poker/private/create', { iProtoId: iTableId })
}

export async function joinPrivateTable(sPrivateCode) {
    return await axios.post('/api/v1/poker/private/join', sPrivateCode)
}

export async function joinLeaveTable() {
    return await axios.get('/api/v1/poker/board/leave')
}

