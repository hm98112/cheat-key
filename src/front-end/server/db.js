import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const adapter = new JSONFileSync('db.json')
const db = new LowSync(adapter, null)

export default db
