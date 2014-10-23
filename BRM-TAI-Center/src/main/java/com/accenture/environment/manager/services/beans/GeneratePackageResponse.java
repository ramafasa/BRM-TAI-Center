package com.accenture.environment.manager.services.beans;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;


@XmlAccessorType(XmlAccessType.FIELD)
public class GeneratePackageResponse {
	
	private String packageName;
	private byte [] packageContentStream;
	
	
	public byte [] getPackageContentStream() {
		return packageContentStream;
	}
	public void setPackageContentStream(byte [] packageContentStream) {
		this.packageContentStream = packageContentStream;
	}
	public String getPackageName() {
		return packageName;
	}
	public void setPackageName(String packageName) {
		this.packageName = packageName;
	}

}
