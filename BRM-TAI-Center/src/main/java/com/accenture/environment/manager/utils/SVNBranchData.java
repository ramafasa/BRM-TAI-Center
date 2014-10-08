package com.accenture.environment.manager.utils;

public class SVNBranchData {

	private String branchName;
	private String url;
	private String username;
	private String password;
	
	public SVNBranchData() { }
		
	public SVNBranchData(String branchName, String url, String username, String password) {
		
		super();
		this.branchName = branchName;
		this.url = url;
		this.username = username;
		this.password = password;
	}


	public String getBranchName() {
		return branchName;
	}


	public void setBranchName(String branchName) {
		this.branchName = branchName;
	}


	public String getUrl() {
		return url;
	}


	public void setUrl(String url) {
		this.url = url;
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
