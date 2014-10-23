/*******************************************
* Global configuration for BRM-TAI-Center
* 
********************************************/


var SERVER_HOSTNAME = "localhost";
var SERVER_PORT = "8181";
var SERVER_APP_NAME = "BRM-TAI-Center";

var SERVER_PACKAGE_MANAGEMENT_ENDPOINT = "packageManagement?wsdl";
var SERVER_SVN_MANAGEMENT_ENDPOINT = "svnManagement?wsdl";

var SERVER_SVN_MNGMT_URL = "http://" + SERVER_HOSTNAME + ":" + SERVER_PORT + "/" + SERVER_APP_NAME + "/services/" + SERVER_SVN_MANAGEMENT_ENDPOINT;
var SERVER_PACKAGE_MNGMT_URL = "http://" + SERVER_HOSTNAME + ":" + SERVER_PORT + "/" + SERVER_APP_NAME + "/services/" + SERVER_PACKAGE_MANAGEMENT_ENDPOINT;