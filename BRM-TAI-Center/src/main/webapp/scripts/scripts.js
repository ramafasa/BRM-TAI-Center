
/*
 * Global variables
 */

//List of environments configured in application
var environmentList = new Array();

//List of SVN branches configured in application
var svnBranches = new Array();

//SVN file selected while creating new package in left JSTREE
var svnSelectedFiles = new Object();

//JSTREE data for right JSTREE used while creating new package
var packageFilesJstreeData = undefined;

//List of the files with revision included in new package (used while creating new package)
var packageInclude = new Array();


$(document).ready(function() {
	
	jQuery.support.cors = true;
	
	//Creating tabs for 'Package list' site
	$(function() {	    
		$("#tabs-left").tabs();
	});
	
	//Handling click on left menu  
    $(".tabs-left").click(function() {
    	
    	if($(this).hasClass("tabs-left-active"))
    		return false;    	
		
    	var currentActive = $(".tabs-left-active");
		currentActive.removeClass('tabs-left-active');
		currentActive.addClass('tabs-left-inactive');
		
		$(this).removeClass('tabs-left-inactive');
		$(this).addClass('tabs-left-active');
		
		$("#" + $(this).attr('id') + '-elem').show();
		$("#" + currentActive.attr('id') + '-elem').hide();
    	
	});
	
    //Executing AJAX calls to the server to obtain information 
    //about configured environments, SVN branches etc.
	getEnvironments();
	getSVNBranches();
	
	waitForPopulatedList(500, updatePackagesForEnvironments, environmentList);
	waitForPopulatedList(500, getSVNTree, svnBranches);
	
	
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
	
	//add noClick handler for button 'generate-package-button'
	$("#generate-package-button").click(function(e) {
		
		generateNewPackage();
	});
	
	
	//Event handlers (click and blur) for search textbox in SVN files tree
	$("#new-package-select-files-search-textbox").click(function(e) {
		
		if($(this).hasClass('textbox-tip')) {
			$(this).removeClass('textbox-tip');
			$(this).val("");
		}		
	});	
	
	$("#new-package-select-files-search-button-cancel").click(function(e) {
		
		$("#new-package-select-files-search-textbox").addClass('textbox-tip');
		$("#new-package-select-files-search-textbox").val("Type filename to search in the tree..");
		
		$.each(svnBranches, function(index, elem) {
			$('#new-package-select-files-left-' + elem).jstree("clear_search");
		});	
	});
	
	$("#new-package-select-files-search-textbox").blur();
	
	//Add resizable functionality for the boxes with SVN files tree
	
	$("#new-package-select-files-left").resizable({
		handles: "e",
		minWidth: 100,
		maxWidth: 900,
		stop: function(event, ui) {
			var diff = ui.originalSize.width - ui.size.width;
			var currentLeftWidth = $("#new-package-select-files-right").width();
			$("#new-package-select-files-right").width(currentLeftWidth + diff);
			
		}
	});
	
});


/***********************************************************************
 * 				getEnvironments
 * 
 * Retrieves list of the environments from the server and creates
 * tabs plugin with configured environments. Populates global array
 * with list of environments. Create list of the checkboxes with 
 * environments in 'New package' tab.
 * 
 ***********************************************************************/

function getEnvironments() {
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/"> \
			<soapenv:Header/> \
			<soapenv:Body> \
				<ser:GetListOfEnvironments/> \
			</soapenv:Body> \
		</soapenv:Envelope>';
	
	$.ajax({
		url: SERVER_PACKAGE_MNGMT_URL, 
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
	    $("#new-package-checkboxes-environments").append('<input type="checkbox" name="' + v + '" class="environment-checkbox" />' + v + '<br />');
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

/***********************************************************************
 * 				getSVNBranches
 * 
 * Retrieves configured SVN branches from the server and creates
 * select list with them. Populates global array with configured
 * SVN branches. 
 * 
 ***********************************************************************/

function getSVNBranches() {
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
		   <soapenv:Header/>\
		   <soapenv:Body>\
		      <ser:GetSVNBranches/>\
		   </soapenv:Body>\
		</soapenv:Envelope>';
	
	$.ajax({
		url: SERVER_SVN_MNGMT_URL, 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: getSVNBranchesOnSuccess, 
		error: getSVNBranchesOnError
	});
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
	} else {
		
		selectBranchesElem.append("<option selected='selected'>" + branches.branchName + "</option>");
		svnBranches.push(branches.branchName);
	}	
}

function getSVNBranchesOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}

/***********************************************************************
 * 				updatePackagesForEnvironments
 * 
 * Retrieves the packages from all configured environemnts and
 * creates datatable plugin with packages in tabs with environments.
 * Calls function createPackageDetailsDiv to create box with
 * detailes information about the package.
 * 
 ***********************************************************************/

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
			url: SERVER_PACKAGE_MNGMT_URL, 
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

/***********************************************************************
 * 				createPackageDetailsDiv
 * 
 * Function creates box with detailed information about the selected
 * package. Add handler for click action on downloadPackage button.
 * Executes AJAX calls to list of the files in the package.
 * 
 ***********************************************************************/

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
		url: SERVER_PACKAGE_MNGMT_URL, 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: function(data) { updatePackagDetailsOnSuccess(data, environment); },
		error: updatePackagDetailsOnError
	});
}


/***********************************************************************
 * 				updatePackageDetails
 * 
 * Updates information about the selected package. Execute AJAX call
 * to obtain list of the file in the package.
 * 
 ***********************************************************************/

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
		url: SERVER_PACKAGE_MNGMT_URL, 
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


function updatePackagDetailsOnSuccess(data, environment) {
	
	$("#packageDetails_" + environment + " img.progressWheel").hide();
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var packageDetail = obj["S:Envelope"]["S:Body"]["ns2:GetPackageDetailsResponse"]["packageDetail"];
	var files = packageDetail["files"];
	
	$("#packageSize_" + environment).text("Size: " + packageDetail.size + " kb");	
	$("#jstreeFiles_" + environment).jstree('destroy');
	$("#jstreeFiles_" + environment).addClass('jstreeFiles');
		
	$('#jstreeFiles_' + environment).jstree({ 'core' : {
	    'data' : files,
	    "animation" : 0,
	    "check_callback" : true,
	    "themes" : { "stripes" : true },
	} });
	
	$("#jstreeFiles_" + environment).show();
	
}

function updatePackagDetailsOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}


/***********************************************************************
 * 				downloadPackage
 * 
 * Exacute AJAX calls to get download selected package. On success opens
 * download window with requested package.
 * 
 ***********************************************************************/


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
		url: SERVER_PACKAGE_MNGMT_URL, 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: function(data) { downloadPackageOnSuccess(data, environment, selectedPackageVersion); },
		error: downloadPackageOnError
	});
	
	createProgressBarVeil('veil-download', 'Downloading the package...', 0.75);

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

function downloadPackageOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}


/***********************************************************************
 * 				getSVNTree
 * 
 * Executes AJAX calls to get SVN tree from the server. Creates JSTEE
 * with the files from the SVN. Handles events on the JSTREE. Add
 * possibility to add files to the package.
 * 
 ***********************************************************************/


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
			url: SERVER_SVN_MNGMT_URL, 
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

function getSVNTreeOnSuccess(data, branchName) {
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var svnFiles = obj["S:Envelope"]["S:Body"]["ns2:GetSvnRepositoryTreeResponse"]["getSvnRepositoryTreeResponse"]["svnFiles"];
		
	var divSelectFilesLeftElement = $("#new-package-select-files-left");
	divSelectFilesLeftElement.append("<div id='new-package-select-files-left-" + branchName + "'></div>");
	
	$("#new-package-select-files-left-" + branchName).append("<ul id='new-package-select-files-left-" + branchName + "-root" + "'></ul>"); 
	
	
	$.each(svnFiles, function(key, value) {

		if(value.parent == "#") {
			console.log("Addind element " + value.id + " as root element.");
			$('#new-package-select-files-left-' + branchName + '-root').append('<li id="new-package-select-files-left-' + branchName + '-' + value.id + '" data-jstree=\'{"directory": ' + value.directory + ', "revision": ' + value.revision +  '}\'>' + value.text + '</li>');
			return true;
		}
		
		if(value.directory == 'false') {
			var parentLiElement = $("li#new-package-select-files-left-" + branchName + "-" + value.parent);
			parentLiElement.append('<ul><li id="new-package-select-files-left-' + branchName + '-' + value.id + '" data-jstree=\'{"directory":' + value.directory + ', "revision":' + value.revision + '}\'>' + value.text + '</li></ul>');
		} else {
			var parentLiElement = $("li#new-package-select-files-left-" + branchName + "-" + value.parent);
			parentLiElement.append('<ul id="new-package-select-files-left-' + branchName + '-' + value.id + '"><li id="new-package-select-files-left-' + branchName + '-' + value.id + '" data-jstree=\'{"directory": ' + value.directory + ', "revision": ' + value.revision + '}\'>' + value.text + '</li></ul>');
		}
	});
	
	
	$("#new-package-select-files-left-" + branchName).jstree('destroy');
	$("#new-package-select-files-left-" + branchName).addClass('jstreeSvnFiles');
		
	$("#new-package-select-files-left-" + branchName).jstree({ 
		'core' : {
		    "animation" : 0,
		    "check_callback" : true,
		    "themes" : { "stripes" : true },
		    "multiple" : false,
		},
		"plugins": [ "search" ],
		"search" : {
			"show_only_matches": true
		}
	})
	.on('changed.jstree', function (e, data) {
		
		var i,j;
		
		for(i = 0, j = data.selected.length; i < j; i++) {
		      svnSelectedFiles[branchName] = data.instance.get_node(data.selected[i]);
		      console.log("ELEMENT: " + svnSelectedFiles[branchName].toSource());
		      console.log("TUTU: " + svnSelectedFiles[branchName].text + " - " + svnSelectedFiles[branchName]["data"]["jstree"]);
		      console.log("TUTU1: " + svnSelectedFiles[branchName].text + " - " + svnSelectedFiles[branchName]["data"]["jstree"].revision);
		      
		      
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
	
	//Code for search tool in 'new-package-select-files-left-' jstree
	$('#new-package-select-files-search-button-accept').click(function(e) {
	   
		var v = $('#new-package-select-files-search-textbox').val();
	    $('#new-package-select-files-left-' + branchName).jstree(true).search(v);
	    //$('#new-package-select-files-left-' + branchName).jstree("open_all");
	});
	
	
	$("div#new-package-select-files-center img").click(function() {
		
		//1. Open a dialog box with list of the commits for the source to let user select revision of the file to be added.
		
		var veilSelectRevision = $("#veil-select-revision");
		veilSelectRevision.addClass("veil-displayed");
		veilSelectRevision.removeClass('veil-hidden');
		veilSelectRevision.fadeTo(250, 0.7);
		
		var selectRevisionBox = $("#veil-select-revision-main-box");
		selectRevisionBox.addClass("veil-displayed");
		selectRevisionBox.removeClass('veil-hidden');
		
		var selectRevisionHeaderContent = $("#veil-select-revision-main-box-header-content");
		selectRevisionHeaderContent.text("Choose revision of the file " + svnSelectedFiles[branchName].text);
		
		//2.
		updateSvnFileHistory(branchName);	
	});
		
	
	$("#new-package-select-files-left-" + branchName).show();
}

function getSVNTreeOnError(request, status, error) {
	alert('error: ' + status + ': ' + error);
}


/***********************************************************************
 * 				updateSvnFileHistory
 * 
 * Execute AJAX call to obtain SVN file history from the server.
 * On success, update table with file's history. Add handling 
 * for the elements of displayed box.
 * 
 ***********************************************************************/

function updateSvnFileHistory(branchName) {
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
		   <soapenv:Header/>\
		   <soapenv:Body>\
		      <ser:GetSvnFileHistory>\
		         <getSvnFileHistoryRequest>\
		            <branchName>' + branchName + '</branchName>\
		            <filePath>' + svnSelectedFiles[branchName].text + '</filePath>\
		            <maxRevision>' + svnSelectedFiles[branchName]["data"]["jstree"]["revision"] + '</maxRevision>\
		         </getSvnFileHistoryRequest>\
		      </ser:GetSvnFileHistory>\
		   </soapenv:Body>\
		</soapenv:Envelope>';
	
	$.ajax({
		url: SERVER_SVN_MNGMT_URL, 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: function(data) { updateSvnFileHistoryOnSuccess(data, branchName); }, 
		error: updateSvnFileHistoryOnError
	});
}


function updateSvnFileHistoryOnSuccess(data, branchName) {
	
	var json = xml2json(data, " ");
	var obj = jQuery.parseJSON(json);
	var historyEntries = obj["S:Envelope"]["S:Body"]["ns2:GetSvnFileHistoryResponse"]["getSvnFileHistoryResponse"]["svnHistory"];
	
	console.log("Updating SVNFile history for branch " + branchName);
	
	var divRevisionBoxElement = $("#veil-select-revision-main-box-content");
	
	divRevisionBoxElement.append('\
    	<table id="revision-table-' + branchName + '" class="display" style="width: 90%" > \
    		<thead>\
				<tr>\
					<th>Revision</th>\
    				<th>Date</th>\
    				<th>Author</th>\
					<th>Message</th>\
				</tr>\
    		</thead>\
    		<tbody></tbody>\
    	</table>');
	
	var table = $('#revision-table-' + branchName).DataTable( {
		"order": [ 0, "desc" ],
		"iDisplayLength": 5,
		"bAutoWidth": false,
		"bLengthChange": false,
		"columnDefs": [
	        { visible: true },
	        { visible: true, type: 'date-euro', targets: 1 },
	        { visible: true },
	        { visible: true }
	     ],
		"aoColumns": [
	         { "sWidth": "15%" },
	         { "sWidth": "15%" },
	         { "bSortable": false, "sWidth": "20%" },
	         { "bSortable": false, "sWidth": "55%" }
	     ]
	     
	});
	
	//Handling for click on row action
	$('#revision-table-' + branchName + ' tbody').on( 'click', 'tr', function () {
	    if ( $(this).hasClass('selected') ) {
	    	//do nothing
	    }
	    else {
	        table.$('tr.selected').removeClass('selected');
	        $(this).addClass('selected');
	    }
	});
	
	if(typeof historyEntries.length != 'undefined') {
		
		$.each(historyEntries, function(k, v) {
			table.row.add([v.revision, v.date, v.author, v.comment]);
			
		});
	} else {
		
		table.row.add([historyEntries.revision, historyEntries.date, historyEntries.author, historyEntries.comment]);
	}
	
	table.draw();
	
	$("#veil-select-revision-main-box-content-cancel").click(function(e) {		
		
		table.destroy();
		$("#revision-table-" + branchName).remove();
		
		//2.a remove event handler for click on Select button
		$("#veil-select-revision-main-box-content-select").unbind( "click" );
		
		$("#veil-select-revision-main-box").addClass('veil-hidden');
		$("#veil-select-revision-main-box").removeClass('veil-displayed');
		
		$("#veil-select-revision").addClass('veil-hidden');
		$("#veil-select-revision").removeClass('veil-displayed');
	});
	
	$("#veil-select-revision-main-box-content-select").click(function(e) {
		
		var aData = table.rows('.selected').data();
		
		if(typeof aData[0] == 'undefined') {
	        alert("Please select revision of the file!");
	        return false;
    	}
		
	    selectedRevision = aData[0][0];
	    
	    //1. Add suitable file to the right jstree panel.		
	    
	    if($.isEmptyObject(packageFilesJstreeData) == true) {
			
			packageFilesJstreeData = new Object();
			packageFilesJstreeData.files = new Array();
		}
		
		if(typeof svnSelectedFiles[branchName] != 'undefined') {
			
			var jstreeRight = $("#new-package-select-files-right-" + branchName);
			
			if(jstreeRight.length == 0) {
				
				var divSelectFilesRightElement = $("#new-package-select-files-right");
				divSelectFilesRightElement.append("<div id='new-package-select-files-right-" + branchName + "'></div>");
			}
			
			var i, j;
			for(i = svnSelectedFiles[branchName].parents.length - 1, j = 0 ; i >= j; i--) {
				
				console.log("FF: " + svnSelectedFiles[branchName].parents[i]);
			
				if(svnSelectedFiles[branchName].parents[i] == "#") {
					continue;
				}
				
				var tmpElementId = svnSelectedFiles[branchName].parents[i].replace("left", "right");
				var k;
				var foundInFileArrayFlag = 0;
				
				for(k = 0; k < packageFilesJstreeData.files.length; k++) {
					
					console.log("current: " + packageFilesJstreeData.files[k]);
					
					if(packageFilesJstreeData.files[k].id == tmpElementId) {
						console.log("Element " + tmpElementId + " already exist!");
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
			
			var k;
			var foundInFileArrayFlag = 0;
			var currentElementId =  svnSelectedFiles[branchName].id.replace("left", "right");
			
			for(k = 0; k < packageFilesJstreeData.files.length; k++) {
				
				console.log("current: " + packageFilesJstreeData.files[k].id);
				
				if(packageFilesJstreeData.files[k].id == currentElementId) {
					console.log("Element " + currentElementId + " already exist!");
					foundInFileArrayFlag = 1;
					break;
				}
			}
			
			if(foundInFileArrayFlag == 0) {
				
				var packageFileObject = new Object();
				packageFileObject.id = currentElementId;
				packageFileObject.text = svnSelectedFiles[branchName].text + " " + selectedRevision;
				packageFileObject.parent = svnSelectedFiles[branchName].parent.replace("left", "right");
				packageFilesJstreeData.files.push(packageFileObject);
				
				packageInclude.push(svnSelectedFiles[branchName].text + " " + selectedRevision);
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
			} }).bind("loaded.jstree", function(event, data) {
				$(this).jstree("open_all");
			});
		}
		
		//2. remove DataTable
		table.destroy();
		$("#revision-table-" + branchName).remove();
		
		//2.a remove event handler for click on Select button
		$("#veil-select-revision-main-box-content-select").unbind( "click" );
		
		//3. Remove veil
		$("#veil-select-revision-main-box").addClass('veil-hidden');
		$("#veil-select-revision-main-box").removeClass('veil-displayed');
		
		$("#veil-select-revision").addClass('veil-hidden');
		$("#veil-select-revision").removeClass('veil-displayed');
		
	});
}


function updateSvnFileHistoryOnError(request, status, error)
{
	alert('error: ' + status + ': ' + error);
}

/***********************************************************************
 * 				generateNewPackage
 * 
 * 
 * 
 ***********************************************************************/

function generateNewPackage() {
	
	//1. Validate if checkbox(es) with environments are selcted. If yes, prepare list of the environments.
	
	if( $( "input.environment-checkbox:checked" ).length == 0) {
		
		displayAlert('new-package-validation-error-veil', 'new-package-validation-error-veil-box', 'Validation error!', 'Please select at least one environment for the package.', 0.75);
		return;
	}
	
	console.log("TUTU: "+ packageInclude.length);
	
	if(packageInclude.length == 0) {
		displayAlert('new-package-validation-error-veil', 'new-package-validation-error-veil-box', 'Validation error!', 'Please add at least one file to the package.', 0.75);
		return;
	}
	
	createProgressBarVeil('generate-package-veil', "Generating the package...", 0.75);
	
	$.each(packageInclude, function(k, v) {
		console.log(v);
	});
	
	//TODO: zmienic TRUNK na wartosc dynamicznie ladowana
	
	var soapMessage = '\
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.manager.environment.accenture.com/">\
		   <soapenv:Header/>\
		   <soapenv:Body>\
		      <ser:GeneratePackage>\
		         <generatePackageRequest>\
		            <branchName>TRUNK</branchName>';
		           
	
	$.each(packageInclude, function(k, v) {

		soapMessage += '<includedFiles>' + v + '</includedFiles>';
	});
	
	soapMessage += '\
        			</generatePackageRequest>\
				</ser:GeneratePackage>\
			</soapenv:Body>\
		</soapenv:Envelope>';
	
	$.ajax({
		url: "http://localhost:8181/BRM-TAI-Center/services/packageManagement?wsdl", 
		type: "POST",
		dataType: "xml", 
		data: soapMessage, 
		processData: false,
		contentType: "text/xml; charset=\"utf-8\"",
		success: generateNewPackageOnSuccess, 
		error: generateNewPackageOnError
	});
}

function generateNewPackageOnSuccess() {
	
	$("#generate-package-veil").remove();
	alert("Success!");
}

function generateNewPackageOnError() {
	
}









/***********************************************************************				 
 *                   UTILITY FUNCTIONS
 ***********************************************************************/

/*
 * Function waits @millis miliseconds and checks if list @list was populated 
 * with data. If yes, executes function @callback. If not, wait again @millis
 * miliseconds.
 * 
 * @millis - miliseconds to wait
 * @callback - callback function to execute when list populated
 * @list - list to check if is populated
 */

function waitForPopulatedList(millis, callback, list) {
    setTimeout(function() { 
    	
    	if(list.length == 0)
    		waitForPopulatedList(millis, callback, list);
    	
    	callback(); 
    }
    , millis);
}

/*
 * Function creates veil on whole page with progress bar.
 * 
 * @id - id of veil element used while creating
 * @message - message to be displayed under proress bar
 * @opacity - opacity of the veil (0 - 1.0).
 */

function createProgressBarVeil(id, message, opacity) {
		
	var veil = jQuery("<div id='" + id + "' style='text-align: center'><img src='images/progress_bar.gif' class='progressBar' /><p class='progressBar'>" + message + "</p></div>");
	 
	veil.css({
		"z-index": 100000,
		width: "100%",
		height: "100%",
		background: "black",
		top: 0, left: 0,
		position: "fixed",
		opacity: 0
	});
		
	$("body").append(veil);
	veil.fadeTo(250, opacity);
}

/*
 * Displays veil and alert box with provided alert data.
 * 
 * @veilId - id of veil element used to display alert
 * @alertBoxId - id of alert box used to display alert
 * @header - message to be displayed in alert header
 * @message - message to be displayed in alert content
 * @opacity - opacity of the veil (0 - 1.0).
 */

function displayAlert(veilId, alertBoxId, header, message, opacity) {
	
	var veil = $("#" + veilId);
	veil.removeClass('veil-hidden');
	veil.addClass('veil-displayed');
	veil.fadeTo(250, opacity);
	
	var alertBox = $("#" + alertBoxId);
	alertBox.addClass('veil-displayed');
	alertBox.removeClass('veil-hidden');	
	
	var alertHeader = $("span#" + alertBoxId + "-header");
	alertHeader.text(header);
	
	var alertContent = $("span#" + alertBoxId + "-content");
	alertContent.text(message);
	
	$("div#" + alertBoxId + "-button").click(function(e) {
		
		//close this alert box
		alertBox.addClass('veil-hidden');
		alertBox.removeClass('veil-displayed');
		
		veil.addClass('veil-hidden');
		veil.removeClass('veil-displayed');
	});
}
