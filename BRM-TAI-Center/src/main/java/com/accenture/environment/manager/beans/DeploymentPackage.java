package com.accenture.environment.manager.beans;

import java.util.Date;

import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

public class DeploymentPackage {

	private int version;
	private String deployApp;
	private Date installationDate;
	private Date rollbackDate;
	private long installationDateTimestamp;
	
	public DeploymentPackage() { }
	
	public DeploymentPackage(int version, Date installationDate) {
		
		this(version, installationDate, "TOWERS OF HANOI v1.0");
	}
	
	public DeploymentPackage(int version, Date installationDate, String deployApp) {
		
		this.version = version;
		this.installationDate = installationDate;
		this.deployApp = deployApp;
	}
	
	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}

	public String getDeployApp() {
		return deployApp;
	}

	public void setDeployApp(String deployApp) {
		this.deployApp = deployApp;
	}

	@XmlJavaTypeAdapter(DateAdapter.class)
	public Date getInstallationDate() {
		return installationDate;
	}

	public void setInstallationDate(Date installationDate) {
		this.installationDate = installationDate;
	}

	@XmlJavaTypeAdapter(DateAdapter.class)
	public Date getRollbackDate() {
		return rollbackDate;
	}

	public void setRollbackDate(Date rollbackDate) {
		this.rollbackDate = rollbackDate;
	}

	public long getInstallationDateTimestamp() {
		return installationDateTimestamp;
	}

	public void setInstallationDateTimestamp(long installationDateTimestamp) {
		this.installationDateTimestamp = installationDateTimestamp;
	}
	
	

	
}

	
