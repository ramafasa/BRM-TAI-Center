<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<link rel="stylesheet" type="text/css" href="styles/styles.css" />
		<link rel="stylesheet" type="text/css" href="styles/jquery.dataTables.css" />
		<link rel="stylesheet" type="text/css" href="styles/jquery.dataTables_themeroller.css" />
		<link rel="stylesheet" type="text/css" href="scripts/jquery-ui-1.11.1.custom/jquery-ui.css" />
		<link rel="stylesheet" href="scripts/jstree/themes/default/style.min.css" />
		
		<title>BRM-TAI-Center v.1.0</title>

		<script src="scripts/jquery-1.9-1.js" type="text/javascript"></script>
		<script src="scripts/jquery-ui-1.11.1.custom/jquery-ui.js" type="text/javascript"></script>
		<script src="scripts/scripts_config.js" type=text/javascript></script>
		<script src="scripts/scripts.js" type=text/javascript></script>		
		<script src="scripts/xml2json.js" type=text/javascript></script>
		<script src="scripts/DataTables-1.10.2/jquery.dataTables.js" type="text/javascript"></script>
		<script src="scripts/DataTables-1.10.2/date-euro.js" type="text/javascript"></script>
		<script src="scripts/jstree/jstree.min.js"></script>
	</head>
	<body>
		
		
		
		<div id="menu-left">		
			<div id="tab-button-list-tabs" class="tabs-left tabs-left-active"><span>Packages list</span></div>
			<div id="tab-button-list-new-package" class="tabs-left tabs-left-inactive"><span>New package</span></div>
		</div>
		
		
		<div id="tab-button-list-tabs-elem" class="main-div-element">
		 	<ul id="tabList">
			</ul>
		</div>
		
		<div id="tab-button-list-new-package-elem" style="display: none" class="main-div-element">
		
			<p class="header_2">1. Choose the environment where the package will be installed:</p>
			<div id="new-package-checkboxes-environments"></div>
			
			<p class="header_2">2. Choose the SVN branch:</p>
			<div id="new-package-select-branches">
				<select name="new-package-select-branches-select" id="new-package-select-branches-select"></select>
			</div>
			
			
			<p class="header_2">3. Attach Release Notes document:</p>
			
			<p class="header_2">4. Select the files:</p>
			
			<input id="new-package-select-files-search-textbox" type="text" class="textbox-tip" value="Type filename to search in the tree..">
			<img src="images/search-48.png" class="search-icon" alt="Find file in SVN tree" id="new-package-select-files-search-button-accept" />
			<img src="images/cancel.png" class="search-icon" alt="Remove filter in SVN tree" id="new-package-select-files-search-button-cancel" />
			
			<div id="new-package-select-files">
				<div id="new-package-select-files-left"></div>
				<div id="new-package-select-files-center">
					<img src='images/add_file_arow.png' alt='Add file'/>
				</div>
				<div id="new-package-select-files-right"></div>
			</div>
			
			<div id="generate-package-button">
				<p>Generate package</p>
			</div>
			
		
		</div>
		
		<!-- Veil for select revision functionality -->
		
		<div id='veil-select-revision' class="veil-hidden"></div>
		
		<div id='veil-select-revision-main-box' class='veil-hidden'>
			<div id='veil-select-revision-main-box-header' >
				<span id="veil-select-revision-main-box-header-content" class='header_2'></span>
			</div>
			<div id='veil-select-revision-main-box-content'></div>
			
			<div id="veil-select-revision-main-box-content-select" class="veil-button"><p>Select</p></div>
			<div id="veil-select-revision-main-box-content-cancel" class="veil-button"><p>Cancel</p></div>
			
		</div>
		
		<!-- Veil for errors alerts -->
		
		<div id="new-package-validation-error-veil" class="alert-veil veil-hidden"></div>
		 
		<!-- This is moved out of the veil above, to avoid problem of "inheriting" opacity of element -->
		<div id="new-package-validation-error-veil-box" class="veil-hidden" >
			<span id="new-package-validation-error-veil-box-header"></span>
			<span id="new-package-validation-error-veil-box-content"></span>
			<div id="new-package-validation-error-veil-box-button" class="veil-button"><p>Close</p></div>
		</div>
		
		
		
		
		
		
	</body>
</html>
