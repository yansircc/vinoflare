import { Hono } from 'hono'
import { renderer } from './renderer'
import { type Env, createDb, quotes } from './server/db'

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.get('/quotes', async (c) => {
  const db = createDb(c.env)
  const allQuotes = await db.select().from(quotes)
  return c.json(allQuotes)
})

app.post('/quotes', async (c) => {
  const db = createDb(c.env)
  const { name, email, message } = await c.req.json()
  
  const newQuote = await db.insert(quotes).values({
    name,
    email,
    message,
  }).returning()
  
  return c.json(newQuote[0])
})

export default app
