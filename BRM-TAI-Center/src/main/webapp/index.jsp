<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<link rel="stylesheet" type="text/css" href="styles/styles.css" />
		<link rel="stylesheet" type="text/css" href="styles/jquery.dataTables.css" />
		<link rel="stylesheet" type="text/css" href="styles/jquery.dataTables_themeroller.css" />
		<link rel="stylesheet" type="text/css" href="scripts/jquery-ui-1.11.1.custom/jquery-ui.css" />
		<link rel="stylesheet" href="scripts/jstree/themes/default/style.min.css" />
		
		<title>Hanoi Tower - Deploy Include Report</title>

		<script src="scripts/jquery-1.9-1.js" type="text/javascript"></script>
		<script src="scripts/jquery-ui-1.11.1.custom/jquery-ui.js" type="text/javascript"></script>
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
			<div id="new-package-select-files">
				<div id="new-package-select-files-left"></div>
				<div id="new-package-select-files-center">
					<img src='images/add_file_arow.png' alt='Add file'/>
				</div>
				<div id="new-package-select-files-right"></div>
			</div>
			
		
		</div>
		
		
		
		
		
		
	</body>
</html>
