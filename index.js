import app from "./server.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`server is running on the port ${PORT}`));
