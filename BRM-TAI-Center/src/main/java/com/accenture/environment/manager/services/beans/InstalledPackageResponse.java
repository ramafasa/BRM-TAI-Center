package com.accenture.environment.manager.services.beans;


import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import com.accenture.environment.manager.beans.DeploymentPackage;


@XmlAccessorType(XmlAccessType.FIELD)

public class InstalledPackageResponse {

	List<DeploymentPackage> packages;

	public List<DeploymentPackage> getPackages() {
		return packages;
	}

	public void setPackages(List<DeploymentPackage> packages) {
		this.packages = packages;
	}
	
	
}
