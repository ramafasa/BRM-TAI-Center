package com.accenture.environment.manager.utils;

import java.io.IOException;
import java.util.HashMap;
import java.util.Properties;

public class ApplicationProperties {

	Properties properties = new Properties();
	private static ApplicationProperties instance = null;
	
	private HashMap<String, EnvironmentData> environments = null; 
	private HashMap<String, SVNBranchData> svnBanches = null;
	private String packagePrefixName = null;
	private String deployDirectory = null;
	private String installedPackagesLog = null;
	private String packageTempDirectory = null;
	private String includeFileName = null;
	private EnvironmentData deployOperatorEnvironment = null;
	private String deployOperatorDirectory = null;
	
	
	private ApplicationProperties() {
		
		try {
			properties.load(Thread.currentThread().getContextClassLoader().getResourceAsStream("application.properties"));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		//Getting list of the environemnts
		environments = new HashMap<String, EnvironmentData>();
		String environmentListStr = properties.getProperty("ENVIRONMENTS");
		
		for(String s : environmentListStr.split(";")) {
			
			EnvironmentData env = new EnvironmentData(s, properties.getProperty(s + "_IP"), properties.getProperty(s + "_USER"), properties.getProperty(s + "_PASS"));
			environments.put(s, env);
		}
		
		//Getting list of the SVN banches
		svnBanches = new HashMap<String, SVNBranchData>();
		String branchsListStr = properties.getProperty("SVN_BRANCHES");
		
		for(String s : branchsListStr.split(";")) {
			
			SVNBranchData svnData = new SVNBranchData(s, properties.getProperty(s + "_URL"), properties.getProperty(s + "_USER"), properties.getProperty(s + "_PASS"));
			svnBanches.put(s, svnData);
		}
		
		//Getting deploy operator environment data (environment where the packages are generated)
		deployOperatorEnvironment = new EnvironmentData();
		deployOperatorEnvironment.setEnvironmentIp(properties.getProperty("DEPLOY_OPERATOR_ENV_IP"));
		deployOperatorEnvironment.setEnvironmentName("DEPLOY_OPERATOR");
		deployOperatorEnvironment.setUsername(properties.getProperty("DEPLOY_OPERATOR_ENV_USER"));
		deployOperatorEnvironment.setPassword(properties.getProperty("DEPLOY_OPERATOR_ENV_PASS"));		
		
		//Getting another properties
		setPackagePrefixName(properties.getProperty("PACKAGE_PREFIX_NAME"));
		setDeployDirectory(properties.getProperty("DEPLOY_DIRECTORY"));
		setInstalledPackagesLog(properties.getProperty("INSTALLED_PACKAGES_LOG"));
		setPackageTempDirectory(properties.getProperty("PACKAGE_TEMP_DIRECTORY"));
		setIncludeFileName(properties.getProperty("INCLUDE_FILE_NAME"));
		setDeployOperatorDirectory(properties.getProperty("DEPLOY_OPERATOR_DIRECTORY"));		
		
	}
	
	public static ApplicationProperties getInstance() {
		
		if(instance == null) {
			instance = new ApplicationProperties();
		}
		
		return instance;	
	}
	
	public HashMap<String, EnvironmentData> getEnvironments() {
		return environments;
	}

	public void setEnvironments(HashMap<String, EnvironmentData> environments) {
		this.environments = environments;
	}

	public String getPackagePrefixName() {
		return packagePrefixName;
	}

	public void setPackagePrefixName(String packagePrefixName) {
		this.packagePrefixName = packagePrefixName;
	}

	public String getDeployDirectory() {
		return deployDirectory;
	}

	public void setDeployDirectory(String deployDirectory) {
		this.deployDirectory = deployDirectory;
	}

	public String getInstalledPackagesLog() {
		return installedPackagesLog;
	}

	public void setInstalledPackagesLog(String installedPackagesLog) {
		this.installedPackagesLog = installedPackagesLog;
	}

	public String getPackageTempDirectory() {
		return packageTempDirectory;
	}

	public void setPackageTempDirectory(String packageTempDirectory) {
		this.packageTempDirectory = packageTempDirectory;
	}

	public HashMap<String, SVNBranchData> getSvnBanches() {
		return svnBanches;
	}

	public void setSvnBanches(HashMap<String, SVNBranchData> svnBanches) {
		this.svnBanches = svnBanches;
	}

	public String getIncludeFileName() {
		return includeFileName;
	}

	public void setIncludeFileName(String includeFileName) {
		this.includeFileName = includeFileName;
	}

	public EnvironmentData getDeployOperatorEnvironment() {
		return deployOperatorEnvironment;
	}

	public void setDeployOperatorEnvironment(EnvironmentData deployOperatorEnvironment) {
		this.deployOperatorEnvironment = deployOperatorEnvironment;
	}

	public String getDeployOperatorDirectory() {
		return deployOperatorDirectory;
	}

	public void setDeployOperatorDirectory(String deployOperatorDirectory) {
		this.deployOperatorDirectory = deployOperatorDirectory;
	}
	
	
	
}
