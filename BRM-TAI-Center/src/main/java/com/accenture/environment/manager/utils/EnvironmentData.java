package com.accenture.environment.manager.utils;

public class EnvironmentData {

	private String environmentName;
	private String environmentIp;
	private String username;
	private String password;
	
	public EnvironmentData() { 
		super(); 
	}	
	
	public EnvironmentData(String environmentName, String environmentIp,
			String username, String password) {
		super();
		this.environmentName = environmentName;
		this.environmentIp = environmentIp;
		this.username = username;
		this.password = password;
	}
	
	@Override
	public String toString() {
		return environmentName + ": " + environmentIp + " (" + username + ", " + password + ")";			
	}
	
	
	public String getEnvironmentName() {
		return environmentName;
	}
	public void setEnvironmentName(String environmentName) {
		this.environmentName = environmentName;
	}
	public String getEnvironmentIp() {
		return environmentIp;
	}
	public void setEnvironmentIp(String environmentIp) {
		this.environmentIp = environmentIp;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	
}
