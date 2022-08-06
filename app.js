const express = require("express");
const bodyParser = require("body-parser");
const InvoiceRouter = require("./routes/invoice-routes.js");
const userRouter = require("./routes/user-routes.js");
const companyRouter = require("./routes/company-routes.js");
const partnerRouter = require("./routes/partner-routes.js");
const cors = require("cors");
app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());

app.use("/invoice", InvoiceRouter);
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/partner", partnerRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
