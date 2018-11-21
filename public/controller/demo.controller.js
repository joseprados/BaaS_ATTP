sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox',
	'sap/m/MessageToast',
	'sap/ui/core/format/DateFormat'
], function (Controller, JSONModel, MessageBox, MessageToast, DateFormat) {
	"use strict";

	return Controller.extend("sap.baas.devX_BaaS.controller.demo", {
		onInit: function () {

			this.setModel(this.createModel(), "drugs");
			var oDrug = {
			    "Id": "664d7af3bc88d6671977f9b0ee648849c6293bcab62191a4dc51ea281d631840"
			    };
			this.getModel("drugs").setProperty("/drug", oDrug);
			this.readHistory();
		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		createModel: function () {
			var oModel = {};

			oModel = new sap.ui.model.json.JSONModel();

			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oModel.setSizeLimit(2147483646);

			return oModel;
		},
		_formatEventPicture: function(sEvent){
            var sIcon = "images/scanned.png";
            if(sEvent === 'Commissioned'){
                sIcon = "images/commissioned.png";
            }else if(sEvent === 'Shipped'){
                sIcon = "images/transport.png";
            }else if(sEvent === 'Packed'){
                sIcon = "images/packed.png";
            }
            return sIcon;
        },
        _formatDateTime: function(sDateTime){
            return new Date(sDateTime);
        },
        _formatEventText: function(sLocation, sResult){
            var sText = sLocation;
            if(sResult){
                sText = sText + ", Authentic";
            }
            return sText;
        },
		readHistory: function () {
			if (!this._bcCreated) {
				var that = this;
				var xhr = new XMLHttpRequest();
				var aHistory = [];
				xhr.open('GET', '/poh/' + this._getObjectKey());
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.onload = function () {
					if (xhr.status == 200) {
						that._bcCreated = true;
						var aHistory = JSON.parse(xhr.responseText).updates;
						aHistory.splice(0, 1);
						that.getModel("drugs").setProperty("/data", aHistory[0])
						that.getModel("drugs").setProperty("/history", aHistory);
					} else {
						MessageBox.error("Calling the BaaS API GET History failed");
					}
				};
				xhr.send();
			}
		},
		_getObjectKey: function () {
		        var oDrug = this.getModel("drugs").getProperty("/drug");
		    	return oDrug.Id;
		}
	});
});