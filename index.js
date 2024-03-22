const app = require("./app");

const port = 3000;

app.get('/' , (req , resp) => {
    resp.send("Hello Sonku")
})

app.listen(port , () => {
    console.log("server is runnning on port 3000")
})