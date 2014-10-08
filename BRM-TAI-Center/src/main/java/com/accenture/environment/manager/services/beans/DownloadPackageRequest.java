package com.accenture.environment.manager.services.beans;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;


@XmlAccessorType(XmlAccessType.FIELD)
public class DownloadPackageRequest {
	
	@XmlElement(required=true)
	private String environmentName;
	private long packageVersion;
	
	
	public String getEnvironmentName() {
		return environmentName;
	}
	public void setEnvironmentName(String environmentName) {
		this.environmentName = environmentName;
	}
	public long getPackageVersion() {
		return packageVersion;
	}
	public void setPackageVersion(long packageVersion) {
		this.packageVersion = packageVersion;
	}

}
