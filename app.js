const express = require("express");
const bodyParser = require("body-parser");
const InvoiceRouter = require("./routes/invoice-routes.js");
const userRouter = require("./routes/user-routes.js");
const companyRouter = require("./routes/company-routes.js");
const partnerRouter = require("./routes/partner-routes.js");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");


app = express();
const corsOptions = {
  origin: ['http://localhost:3000','http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000', 'ws://localhost:3000', 'ws://localhost:5000'],
  credentials: true };
app.use(cors(corsOptions));

//All the middleware that is possible lol
//Depending on the PDF size usually max 5mb tho.
app.use(cookieParser())
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());


app.use("/invoice", InvoiceRouter);
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/partner", partnerRouter);


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

