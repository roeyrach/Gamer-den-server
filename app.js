const express = require("express")

const app = express()

const cors = require("cors")

const mongoose = require("mongoose")

const PORT = 3000

app.listen(PORT, console.log(`Server started on port ${PORT}`))
