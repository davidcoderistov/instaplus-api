import express from 'express'
import morgan from 'morgan'

const app = express()
app.use(morgan('dev'))

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})