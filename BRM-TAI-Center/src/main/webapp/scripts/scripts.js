
var environmentList = new Array();
var svnBranches = new Array();
var svnSelectedFiles = new Object();

$(document).ready(function() {
	
	jQuery.support.cors = true;
	
	$(function() {
	    $( "#tabs-left" ).tabs();
 	});
	
	$(".tabs-left").click(function() {
		
		var currentActive = $(".tabs-left-active");
		currentActive.removeClass('tabs-left-active');
		currentActive.addClass('tabs-left-inactive');
		
		$(this).removeClass('tabs-left-inactive');
		$(this).addClass('tabs-left-active');
		
		$("#" + $(this).attr('id') + '-elem').show();
		$("#" + currentActive.attr('id') + '-elem').hide();
		
	});
	
	getEnvironments();
	getSVNBranches();
	
	sleep(500, updatePackagesForEnvironments, environmentList);
	updatePackagesForEnvironments();
	
	sleep(500, getSVNTree, svnBranches);
	
	
	//add tooltip for "R" (rollback) buttons
	$( document ).tooltip({
		items: "img",
		content: function() {
			var element = $( this );
			
			if ( element.is( "img" ) ) {
				return element.attr( "alt" );
			}
		}
	});
});

function sleep(millis, callback, list) {
    setTimeout(function() { 
    	
    	if(list.length == 0)
    		sleep(millis, callback, list);
    	
    	callback(); 
    }
    , millis);
}

function updatePackageDetails(environment, table) {
	
	var aData = table.rows('.selected').data();
    selectedPackageVersion = aData[0][1];
	
	$("#packageDetailsHeader_" + environment).text(aData[0][3] + "      " + selectedPackageVersion);
	$("#packageDetailsInstDate_" + environment).text("Installation date: " + aData[0][0]);
	
	
	if(aData[0][2] == '') {
		$("#packageDetailsRollbackDate_" + environment).text("Rollback date: N/A");
    }
    else {
    	$("#packageDetailsRollbackDate_" + environment).text("Rollback date: " + aData[0][4]);
    }
	
		
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
		   <soapenv:Header/>\
		   <soapenv:Body>\
		      <ser:GetPackageDetails>\
		         <packageDetailsRequest>\
		            <environmentName>' + environment + '</environmentName>\
		            <packageVersion>' + selectedPackageVersion + '</packageVersion>\
		         </packageDetailsRequest>\
		      </ser:GetPackageDetails>\
		   </soapenv:Body>\
		</soapenv:Envelope>';
	
	$.ajax({
		url: "http://localhost:8080/EnvironmentManager/services/packageManagement?wsdl", 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: function(data) { updatePackagDetailsOnSuccess(data, environment); },
		error: updatePackagDetailsOnError
	});
	
	$("#jstreeFiles_" + environment).hide();
	$("#packageDetails_" + environment + " img.progressWheel").show();
}

function createPackageDetailsDiv(environment, table) {

	var divTabsElem = document.getElementById("packagesDiv_" + environment);
	var packageDetailsElem = document.createElement("div");
	packageDetailsElem.setAttribute("id", "packageDetails_" + environment);
	packageDetailsElem.setAttribute("class", "packageDetails");
	
	var divJstreeElement = document.createElement("div");
	divJstreeElement.setAttribute("id", "jstreeFiles_" + environment);
	divJstreeElement.setAttribute("class", "jstreeFiles");
	
	var progressWheelElement = document.createElement("img");
	progressWheelElement.setAttribute("class", "progressWheel");
    progressWheelElement.setAttribute("src", "images/progress_wheel.gif");
    
    var aData = table.rows('.selected').data();
    selectedPackageVersion = aData[0][1];
    
    var pHeaderElement = document.createElement("p");
    pHeaderElement.setAttribute("id", "packageDetailsHeader_" + environment);
    pHeaderElement.setAttribute("class", "header_1");
    pHeaderElement.appendChild(document.createTextNode(aData[0][3] + "      " + selectedPackageVersion));
    
    var pInstDateElem = document.createElement("p");
    pInstDateElem.setAttribute("class", "header_2");
    pInstDateElem.setAttribute("id", "packageDetailsInstDate_" + environment);
    pInstDateElem.appendChild(document.createTextNode("Installation date: " + aData[0][0]));
    
    var pRollbackDateElem = document.createElement("p");
    pRollbackDateElem.setAttribute("class", "header_2");
    pRollbackDateElem.setAttribute("id", "packageDetailsRollbackDate_" + environment);
    
    var pPackageSizeElem = document.createElement("p");
    pPackageSizeElem.setAttribute("class", "header_2");
    pPackageSizeElem.setAttribute("id", "packageSize_" + environment);
    pPackageSizeElem.appendChild(document.createTextNode("Size: 0 kb"));
    
    if(aData[0][2] == '') {
    	pRollbackDateElem.appendChild(document.createTextNode("Rollback date: N/A"));
    }
    else {
    	pRollbackDateElem.appendChild(document.createTextNode("Rollback date: " + aData[0][2]));
    }
    	
    var downloadIconElement = document.createElement("img");
    downloadIconElement.setAttribute("src", "images/download.png");
    downloadIconElement.setAttribute("id",	"packageDetailsDownloadButton_" + environment);
    downloadIconElement.setAttribute("class", "button");
           
    packageDetailsElem.appendChild(pHeaderElement);
    packageDetailsElem.appendChild(pInstDateElem);
    packageDetailsElem.appendChild(pRollbackDateElem);
    packageDetailsElem.appendChild(pPackageSizeElem);
    packageDetailsElem.appendChild(downloadIconElement);
    packageDetailsElem.appendChild(divJstreeElement);
    packageDetailsElem.appendChild(progressWheelElement);
    divTabsElem.appendChild(packageDetailsElem);
	
    $("#packageDetailsDownloadButton_" + environment).click(function() {
    	downloadPackage(environment, table);
    });
    
	$("#jstreeFiles_" + environment).hide();
		
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
		   <soapenv:Header/>\
		   <soapenv:Body>\
		      <ser:GetPackageDetails>\
		         <packageDetailsRequest>\
		            <environmentName>' + environment + '</environmentName>\
		            <packageVersion>' + selectedPackageVersion + '</packageVersion>\
		         </packageDetailsRequest>\
		      </ser:GetPackageDetails>\
		   </soapenv:Body>\
		</soapenv:Envelope>';
	
	$.ajax({
		url: "http://localhost:8080/EnvironmentManager/services/packageManagement?wsdl", 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: function(data) { updatePackagDetailsOnSuccess(data, environment); },
		error: updatePackagDetailsOnError
	});
	
}

function updatePackagDetailsOnSuccess(data, environment) {
	
	$("#packageDetails_" + environment + " img.progressWheel").hide();
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var packageDetail = obj["S:Envelope"]["S:Body"]["ns2:GetPackageDetailsResponse"]["packageDetail"];
	var files = packageDetail["files"];
	
	$("#packageSize_" + environment).text("Size: " + packageDetail.size + " kb");
	
	$("#jstreeFiles_" + environment).jstree('destroy');
	$("#jstreeFiles_" + environment).addClass('jstreeFiles');
		
	var jsonString = JSON.stringify(packageDetail);
	
	$('#jstreeFiles_' + environment).jstree({ 'core' : {
	    'data' : files,
	    "animation" : 0,
	    "check_callback" : true,
	    "themes" : { "stripes" : true },
	} });
	
	$("#jstreeFiles_" + environment).show();
	
}

function downloadPackage(environment, table) {

	var aData = table.rows('.selected').data();
    selectedPackageVersion = aData[0][1];
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
		   <soapenv:Header/>\
		   <soapenv:Body>\
		      <ser:DownloadPackage>\
		         <downloadPackageRequest>\
		            <environmentName>' + environment + '</environmentName>\
		            <packageVersion>' + selectedPackageVersion + '</packageVersion>\
		         </downloadPackageRequest>\
		      </ser:DownloadPackage>\
		   </soapenv:Body>\
		</soapenv:Envelope>';
	
	$.ajax({
		url: "http://localhost:8080/EnvironmentManager/services/packageManagement?wsdl", 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: function(data) { downloadPackageOnSuccess(data, environment, selectedPackageVersion); },
		error: downloadPackageOnError
	});
	
	//create veil
	var veil = jQuery("<div id='veil-download' style='text-align: center'><img src='images/progress_bar.gif' class='progressBar' /><p class='progressBar'>Downloading the package...</p></div>");
	 
	// Style veil
	veil.css({
		"z-index": 100000,
		width: "100%",
		height: "100%",
		background: "black",
		top: 0, left: 0,
		position: "fixed",
		opacity: 0
	});
	
	
	// Append veil
	$("body").append(veil);
	
	veil = jQuery("#veil-download");
	veil.fadeTo(250, 0.75);

}

function downloadPackageOnSuccess(data, environment, packageVersion) {
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var packageStream = obj["S:Envelope"]["S:Body"]["ns2:DownloadPackageResponse"]["downloadPackageResponse"]["packageContentStream"];
	var packageName = obj["S:Envelope"]["S:Body"]["ns2:DownloadPackageResponse"]["downloadPackageResponse"]["packageName"];
	
	var streamData = "data:" + "application/x-compressed" + ";base64," + escape(packageStream);
	
	var a = document.createElement('a');
	a.href = streamData;
	a.download = packageName;

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	
	$("#veil-download").remove();
}

function updatePackagDetailsOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}

function downloadPackageOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}


function updatePackagesForEnvironments() {
	
	$.each(environmentList, function(index, elem) {
		
		var soapMessage = '\
			<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
				<soapenv:Header/>\
				<soapenv:Body>\
					<ser:GetInstalledPackages>\
						<installedPackageRequest>\
							<environmentName>' + elem + '</environmentName>\
						</installedPackageRequest>\
					</ser:GetInstalledPackages>\
				</soapenv:Body>\
			</soapenv:Envelope>';
		
		$.ajax({
			url: "http://localhost:8080/EnvironmentManager/services/packageManagement?wsdl", 
			type: "POST",
			dataType: "xml", 
			data: soapMessage, 
			processData: false,
			contentType: "text/xml; charset=\"utf-8\"",
			success: function(data) { updatePackagesForEnvironmentsOnSuccess(data, elem); }, 
			error: updatePackagesForEnvironmentsOnError
		});
		
	});
}

function updatePackagesForEnvironmentsOnSuccess(data, environment) {
	
	 var divElement = document.getElementById("packagesDiv_" + environment);
	
	 divElement.innerHTML = '\
	    	<table id="packagesTable_' + environment + '" class="display" style="width: 500px;" > \
	    		<thead>\
					<tr>\
						<th>Installation date</th>\
						<th>Package version</th>\
						<th>Rollback</th>\
					</tr>\
	    		</thead>\
	    		<tbody></tbody>\
	    	</table>';
	
	var table = $('#packagesTable_' + environment).DataTable( {
		"order": [[ 1, "desc" ]],
		"iDisplayLength": 50,
		"bAutoWidth": false,
		"columnDefs": [
            { type: 'date-euro', targets: 0 },
            { visible: true },
            { visible: true },
            { visible: false },
            { visible: false },
            { visible: false }
         ],
		"aoColumns": [
             { "sWidth": "50%" },
             { "sWidth": "30%" },
             { "bSortable": false, "sWidth": "20%" }
         ]
         
	});
	
	//Handling for click on row action
	$('#packagesTable_' + environment + ' tbody').on( 'click', 'tr', function () {
	    if ( $(this).hasClass('selected') ) {
	    	//do nothing
	    }
	    else {
	        table.$('tr.selected').removeClass('selected');
	        $(this).addClass('selected');
	        updatePackageDetails(environment, table);
	    }
	} );
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var packages = obj["S:Envelope"]["S:Body"]["ns2:GetInstalledPackagesResponse"]["installedPackagesResponse"]["packages"];

	$(packages).each(function(index, elem) {
		
		var rollbackElem = "";
		
		if(typeof elem.rollbackDate != 'undefined') {
			rollbackElem = "<img src=\"images/rollback.png\" alt=\"" + elem.rollbackDate + "\" style=\"width: 40px; height: 40px;\"/> ";
		}
		
		table.row.add([elem.installationDate, elem.version, rollbackElem, elem.deployApp, elem.rollbackDate]);
	});
	
	table.draw();
	
	$('#packagesTable_' + environment + ' tbody tr:eq(0)').addClass('selected');
		
	
	createPackageDetailsDiv(environment, table);
	
	
	
	
}

function updatePackagesForEnvironmentsOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}

function getEnvironments() {
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/"> \
			<soapenv:Header/> \
			<soapenv:Body> \
				<ser:GetListOfEnvironments/> \
			</soapenv:Body> \
		</soapenv:Envelope>';
	
	$.ajax({
		url: "http://localhost:8080/EnvironmentManager/services/packageManagement?wsdl", 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: getEnvironmentsOnSuccess, 
		error: getEnvironmentsOnError
	});
	
	

	return false;	
}

function getSVNTree() {
	
	
	$.each(svnBranches, function(index, elem) {
	
		var soapMessage = '\
			<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
			   <soapenv:Header/>\
			   <soapenv:Body>\
			      <ser:GetSvnRepositoryTree>\
			         <getSvnRepositoryTreeRequest>\
			            <branchName>' + elem + '</branchName>\
			         </getSvnRepositoryTreeRequest>\
			      </ser:GetSvnRepositoryTree>\
			   </soapenv:Body>\
			</soapenv:Envelope>';
	
		$.ajax({
			url: "http://localhost:8080/EnvironmentManager/services/svnManagement?wsdl", 
			type: "POST",
			dataType: "xml", 
			data: soapMessage, 
			processData: false,
			contentType: "text/xml; charset=\"utf-8\"",
			success: function(data) { getSVNTreeOnSuccess(data, elem); }, 
			error: getSVNTreeOnError
		});
		
	});
}

function getSVNTreeOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}

function getSVNTreeOnSuccess(data, branchName) {
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var svnFiles = obj["S:Envelope"]["S:Body"]["ns2:GetSvnRepositoryTreeResponse"]["getSvnRepositoryTreeResponse"]["svnFiles"];
	
	var divSelectFilesLeftElement = $("#new-package-select-files-left");
	divSelectFilesLeftElement.append("<div id='new-package-select-files-left-" + branchName + "'></div>");
	
	$("#new-package-select-files-left-" + branchName).append("<ul id='new-package-select-files-left-" + branchName + "-root" + "'></ul>"); 
	
	
	$.each(svnFiles, function(key, value) {

		//console.log("Processing: " + value.id + "(" + value.parent + ", isDirectory: " + value.directory + ")");
		
		if(value.parent == "#") {
			console.log("Addind element " + value.id + " as root element.");
			$("#new-package-select-files-left-" + branchName + "-root").append("<li id='new-package-select-files-left-" + branchName + "-" + value.id + "' data-jstree='directory: " + value.directory + "'>" + value.text + "</li>");
			return true;
		}
				
		if(value.directory == 'false') {
			var parentLiElement = $("li#new-package-select-files-left-" + branchName + "-" + value.parent);
			parentLiElement.append("<ul><li id='new-package-select-files-left-" + branchName + "-" + value.id + "' data-jstree='directory: " + value.directory + "'>" + value.text + "</li></ul>");
		} else {
			var parentLiElement = $("li#new-package-select-files-left-" + branchName + "-" + value.parent);
			parentLiElement.append("<ul id='new-package-select-files-left-" + branchName + "-" + value.id + "'><li id='new-package-select-files-left-" + branchName + "-" + value.id + "' data-jstree='directory: " + value.directory + "'>" + value.text + "</li></ul>");// + value.text + "</ul>");
		}
	});
	
	
	$("#new-package-select-files-left-" + branchName).jstree('destroy');
	$("#new-package-select-files-left-" + branchName).addClass('jstreeSvnFiles');
		
	$("#new-package-select-files-left-" + branchName).jstree({ 'core' : {
	    "animation" : 0,
	    "check_callback" : true,
	    "themes" : { "stripes" : true },
	    "multiple" : false
	} })
	.on('changed.jstree', function (e, data) {
		
		var i,j;
		
		for(i = 0, j = data.selected.length; i < j; i++) {
		      svnSelectedFiles[branchName] = data.instance.get_node(data.selected[i]);
		      //console.log("TUTU: " + svnSelectedFiles[branchName].text + " - " + svnSelectedFiles[branchName]["data"]["jstree"]["dupa"]);
		      //console.log('TUTU1: ' + data.node.toSource());
		      
		      console.log("ELEMENT: " + svnSelectedFiles[branchName].toSource());
		      
		      svnSelectedFiles[branchName].parents_text = new Array();
		      svnSelectedFiles[branchName].parents_directory = new Array();
		      var k, l;
		      
		      for(k = 0, l = svnSelectedFiles[branchName].parents.length ; k < l; k++) {
		    	  
		    	  if(svnSelectedFiles[branchName].parents[k] == "#") {
		    		  continue;
		    	  }
		    	  
		    	  var tmpElement = data.instance.get_node(svnSelectedFiles[branchName].parents[k]);
		    	  
		    	  svnSelectedFiles[branchName].parents_text.push(tmpElement.text);  
		    	  svnSelectedFiles[branchName].parents_directory.push(tmpElement["data"]["jstree"]["directory"]);
	    	 }
		} 
		
	});
	
	//$("#new-package-select-files-center").append("<img src='images/add_file_arow.png' alt='Add file'/>");
	$("div#new-package-select-files-center img").click(function() {
		
		if(typeof svnSelectedFiles[branchName] != 'undefined') {
			
			var jstreeRight = $("#new-package-select-files-right-" + branchName);
			var previousElement;
			
			if(jstreeRight.length == 0) {
				
				var divSelectFilesRightElement = $("#new-package-select-files-right");
				divSelectFilesRightElement.append("<div id='new-package-select-files-right-" + branchName + "'></div>");
			}
			
			var i, j;
			var packageFilesJstreeData = new Object();
			packageFilesJstreeData.files = new Array();
			
			
			for(i = svnSelectedFiles[branchName].parents.length - 1, j = 0 ; i >= j; i--) {
				
				console.log("FF: " + svnSelectedFiles[branchName].parents[i]);
			
				if(svnSelectedFiles[branchName].parents[i] == "#") {
					continue;
				}
				
				var tmpElementId = svnSelectedFiles[branchName].parents[i].replace("left", "right");
				var k, j;
				var foundInFileArrayFlag = 0;
				
				for(k = 0; k < packageFilesJstreeData.files.length; k++) {
					
					console.log("current: " + packageFilesJstreeData.files[k]);
					
					if(packageFilesJstreeData.files[k].id == tmpElementId) {
						console("Element " + tmpElementId + " already exist!");
						foundInFileArrayFlag = 1;
						break;
					}
				}
				
				if(foundInFileArrayFlag == 0) {
					
					var packageFileObject = new Object();
					packageFileObject.id = tmpElementId;
					packageFileObject.text = svnSelectedFiles[branchName].parents_text[i];
					packageFileObject.parent = svnSelectedFiles[branchName].parents[i + 1].replace("left", "right");
					packageFilesJstreeData.files.push(packageFileObject);
				}
			}
			
			var k, j;
			var foundInFileArrayFlag = 0;
			
			for(k = 0; k < packageFilesJstreeData.files.length; k++) {
				
				console.log("current: " + packageFilesJstreeData.files[k].id);
				
				if(packageFilesJstreeData.files[k].id == svnSelectedFiles[branchName].id) {
					console("Element " + tmpElementId + " already exist!");
					foundInFileArrayFlag = 1;
					break;
				}
			}
			
			if(foundInFileArrayFlag == 0) {
				
				var packageFileObject = new Object();
				packageFileObject.id = svnSelectedFiles[branchName].id;
				packageFileObject.text = svnSelectedFiles[branchName].text;
				packageFileObject.parent = svnSelectedFiles[branchName].parent.replace("left", "right");
				packageFilesJstreeData.files.push(packageFileObject);
			}
			
			
			var jsonString = JSON.stringify(packageFilesJstreeData);
			
			console.log("JSON: " + jsonString);
			
			$("#new-package-select-files-right-" + branchName).jstree('destroy');
			$("#new-package-select-files-right-" + branchName).addClass('jstreeSvnFiles');
				
			$("#new-package-select-files-right-" + branchName).jstree({ 'core' : {
				'data' : packageFilesJstreeData["files"],
			    "animation" : 0,
			    "check_callback" : true,
			    "themes" : { "stripes" : true },
			    "multiple" : false
			} });
		}
	});
	
	
		
	
	$("#new-package-select-files-left-" + branchName).show();
}

function getSVNBranches() {
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
		   <soapenv:Header/>\
		   <soapenv:Body>\
		      <ser:GetSVNBranches/>\
		   </soapenv:Body>\
		</soapenv:Envelope>';
	
	$.ajax({
		url: "http://localhost:8080/EnvironmentManager/services/svnManagement?wsdl", 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: getSVNBranchesOnSuccess, 
		error: getSVNBranchesOnError
	});
}

function getSVNBranchesOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}



function getSVNBranchesOnSuccess(data, status) {
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var branches = obj["S:Envelope"]["S:Body"]["ns2:GetSVNBranchesResponse"]["getSVNBranchesResponse"];
	
	var selectBranchesElem = $("#new-package-select-branches-select");
	var i = 0;
	
	if(branches instanceof Array) {
		
		$.each(branches, function(k, v) {
			
			if(i == 0)
				selectBranchesElem.append("<option selected='selected'>" + v.branchName + "</option>");
			else
				selectBranchesElem.append("<option>" + v.branchName + "</option>");
			
			svnBranches.push(v.branchName);
		});
	}
	
	else {
		selectBranchesElem.append("<option selected='selected'>" + branches.branchName + "</option>");
		svnBranches.push(branches.branchName);
	}
	
	
	
}

function getEnvironmentsOnSuccess(data, status) {
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var environments = obj["S:Envelope"]["S:Body"]["ns2:GetListOfEnvironmentsResponse"]["listOfEnvironmentsResponse"];
	
	var unorderedList = document.getElementById("tabList");
	var divMainList = document.getElementById("tab-button-list-tabs-elem");
	
	$.each(environments, function(k, v) {
		
		//add element to list for tabs
	    var envLiElement = document.createElement("li");
	    var envAElement = document.createElement("a");
	    var envElementValue = document.createTextNode(v);
	    
	    envAElement.setAttribute("href", "#packagesDiv_" + v);
	    envAElement.appendChild(envElementValue);
	    envLiElement.appendChild(envAElement);
	    
	    unorderedList.appendChild(envLiElement);
	    
	    //add div elements or content	    
	    var divElement = document.createElement("div");
	    divElement.setAttribute("id", "packagesDiv_" + v);

	    var progressWheelElement = document.createElement("img");
	    progressWheelElement.setAttribute("src", "images/progress_wheel.gif");
	    
	    var pElement = document.createElement("p");
	    pElement.appendChild(document.createTextNode("Loading..."));
	    
	    divElement.appendChild(progressWheelElement);
	    divElement.appendChild(pElement);
	    
	    divMainList.appendChild(divElement);
	    environmentList.push(v);
	    
	    //update checkBoxes in "New package" tab
	    $("#new-package-checkboxes-environments").append('<input type="checkbox" name="' + v + '" />' + v + '<br />');
	});
	
	$(function() {
		var tabs = $( "#tab-button-list-tabs-elem" ).tabs();
		tabs.find( ".ui-tabs-nav" ).sortable({
			axis: "x",
			stop: function() {
				tabs.tabs( "refresh" );
			}
		});
	});
}

function getEnvironmentsOnError(request, status, error)
{
	alert('error: ' + status + ': ' + error);
}




