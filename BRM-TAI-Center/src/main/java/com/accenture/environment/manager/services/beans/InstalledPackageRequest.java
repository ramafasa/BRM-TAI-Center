package com.accenture.environment.manager.services.beans;


import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;


@XmlAccessorType(XmlAccessType.FIELD)

public class InstalledPackageRequest {

	@XmlElement(required = false)
    protected String environmentName;
	
	@XmlElement(required = false)
	protected String environmentHostname;
	
	
	
	public String getEnvironmentName() {
		return environmentName;
	}

	public void setEnvironmentName(String environmentName) {
		this.environmentName = environmentName;
	}

	public String getEnvironmentHostname() {
		return environmentHostname;
	}

	public void setEnvironmentHostname(String environmentHostname) {
		this.environmentHostname = environmentHostname;
	}
}
