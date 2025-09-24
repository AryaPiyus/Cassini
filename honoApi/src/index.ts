import { Hono } from 'hono'
import commitRoute from './routes/commit'

const app = new Hono()
app.route('/api', commitRoute)

export default app