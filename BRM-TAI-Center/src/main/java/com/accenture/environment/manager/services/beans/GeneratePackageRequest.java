package com.accenture.environment.manager.services.beans;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;


@XmlAccessorType(XmlAccessType.FIELD)
public class GeneratePackageRequest {
	
	
	private String branchName;
	private List<String> includedFiles;
	
	
	public String getBranchName() {
		return branchName;
	}
	public void setBranchName(String branchName) {
		this.branchName = branchName;
	}
	public List<String> getIncludedFiles() {
		return includedFiles;
	}
	public void setIncludedFiles(List<String> includedFiles) {
		this.includedFiles = includedFiles;
	}
	
	
	
	
	

}
