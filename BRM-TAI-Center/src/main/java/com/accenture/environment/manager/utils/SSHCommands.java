package com.accenture.environment.manager.utils;

import java.io.IOException;
import java.util.Properties;

import org.apache.log4j.Logger;

public class SSHCommands {

	Properties properties = new Properties();
	private static SSHCommands instance = null;
	final static Logger logger = Logger.getLogger(SSHCommands.class);
	
	private String generatePackageDefault;
	private String sourceBashProfile;
	
	private SSHCommands() {
		
		try {
			properties.load(Thread.currentThread().getContextClassLoader().getResourceAsStream("ssh_commands"));
		} catch (IOException e) {
			logger.error("Error while reading the file with SSH commands!");
			e.printStackTrace();
		}
		
		setGeneratePackageDefault(properties.getProperty("GENERATE_PACKAGE_DEFAULT"));
		setSourceBashProfile(properties.getProperty("SOURCE_BASH_PROFILE"));
		
	}
	
	public static SSHCommands getInstance() {
		
		if(instance == null) {
			instance = new SSHCommands();
		}
		
		return instance;	
	}

	public String getGeneratePackageDefault() {
		return generatePackageDefault;
	}

	public void setGeneratePackageDefault(String generatePackageDefault) {
		this.generatePackageDefault = generatePackageDefault;
	}

	public String getSourceBashProfile() {
		return sourceBashProfile;
	}

	public void setSourceBashProfile(String sourceBashProfile) {
		this.sourceBashProfile = sourceBashProfile;
	}
	
	
	
}
