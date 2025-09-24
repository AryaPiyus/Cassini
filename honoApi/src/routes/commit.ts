import { Hono } from 'hono'

const commitRoute = new Hono()

commitRoute.post('/commit/:userId/:repoId', async (c) => {
  const { userId, repoId } = c.req.param()
  const body = await c.req.json()
  // TODO: Validate token, check ownership, save files, proxy to Next.js backend
  return c.json({ message: 'Commit received', userId, repoId, body })
})

export default commitRoute