'use strict';
var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var app = express();
var port    =   process.env.PORT || 3002;
app.use(bodyParser.json());

var cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();

/* 1. Get service credentials from Cloud Foundry */
var baas_options = appEnv.getServiceCreds(process.env.blockchainServiceName);

if(baas_options == null) {
		baas_options = {
	"serviceUrl": "https://blockchain-service.cfapps.eu10.hana.ondemand.com/blockchain/proofOfHistory/api/v1/",
	"authentication": {
		"url": "https://multichain-idp.authentication.eu10.hana.ondemand.com",
		"clientId": "sb-7e9ed857-3cf9-402d-a1b7-1c10437234fe!b3858|na-420adfc9-f96e-4090-a650-0386988b67e0!b1836",
		"clientSecret": "TFr2I0YK63HvES9vFP/DHlodZ6M=",
		"identityZone": "multichain-idp"
	}

        };
}
app.use(express.static(__dirname + '/public'));

var access_token = "";

/* 2. Get access token using the authentication url from Blockchain service stored in the service key */
getAccessToken();

/* 3. Map browser requests to actual HTTP requests */
app.get("/poh/:key", handleRead);

app.post("/poh/:key", handlePOST);

app.patch("/poh/:key", handlePATCH);

app.listen(port);

function getAccessToken() {
    request.post({
        url: baas_options.authentication.url + '/oauth/token',
        form: {
            client_id:  baas_options.authentication.clientId,
            client_secret: baas_options.authentication.clientSecret,
            grant_type: 'client_credentials'
        }
    }, function (err, res, body) {
        var status = res?res.statusCode:"500";
        if(err) body = err;
        console.log('[index.js] write[statusCode: ' + status + ', body: (' + (typeof body) + ') ' + (typeof body=='object'?JSON.stringify(body):body));
        if (!err) {
            var obj = JSON.parse(body);
            access_token = obj.access_token;
        }
        else {
            console.log("[index.js] init error: " + err);
        }
    });
}

function handleRead(req, res) {
    request.get({
        uri: baas_options.serviceUrl + "histories/" + req.params.key + '?$top=100&$skip=1',
        json: true,
        headers: {
            Authorization: "Bearer " + access_token
        }
    }, function (err, posRes, body){
        var status = posRes?posRes.statusCode:"500";
        if (err) body = err;
        res.status(status).send(body);
    });
}
function handlePOST(req, res) {
    request.post({
        uri: baas_options.serviceUrl + "histories/" + req.params.key,
        json: req.body,
        headers: {
            Authorization: "Bearer " + access_token
        }
    }, function (err, posRes, body){
        var status = posRes?posRes.statusCode:"500";
        if(err) body = err;
        res.status(status).send(body);
    });
}
function handlePATCH(req, res) {
    request.patch({
        uri: baas_options.serviceUrl + "histories/" + req.params.key,
        json: req.body,
        headers: {
            Authorization: "Bearer " + access_token
        }
    }, function (err, posRes, body){
        var status = posRes?posRes.statusCode:"500";
        if(err) body = err;
        res.status(status).send(body);
    });
}