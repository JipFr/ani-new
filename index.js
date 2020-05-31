
const cfg = require("./config.json");
const logger = require("./logger");
const db = require("./db");

const express = require("express");
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();

const ROUTES = {
	API: {
		getStreams: require("./routes/api/getStreams")
	},
	WEB: {
		home: require("./routes/web/home"),
		show: require("./routes/web/show")
	}
}

app.engine("handlebars", hbs());
app.set("view engine", "handlebars");
app.use(bodyParser.json());

app.use(ROUTES.API.getStreams);
app.use(ROUTES.WEB.home);
app.use(ROUTES.WEB.show);
app.use(express.static("public"));

db.connect(() => {
	app.listen(cfg.http.port, () => {
		logger.info(`Server is life at 127.0.0.1:${cfg.http.port}`);
	});
});