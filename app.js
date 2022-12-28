const express = require("express")

const app = express()

const cors = require("cors")

const mongoose = require("mongoose")

const uri =
	"mongodb+srv://guyroey:X3PErZ1DUnqfGWee@cluster0.xcovqzy.mongodb.net/?retryWrites=true&w=majority"

const PORT = process.env.PORT || 8081

mongoose
	.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((res) => console.log("connected"))
	.catch((err) => console.log(err))

app.listen(PORT, console.log(`Server started on port ${PORT}`))
