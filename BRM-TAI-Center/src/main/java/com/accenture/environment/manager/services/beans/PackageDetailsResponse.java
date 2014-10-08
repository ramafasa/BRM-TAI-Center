package com.accenture.environment.manager.services.beans;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import com.accenture.environment.manager.beans.PackageFile;

@XmlAccessorType(XmlAccessType.FIELD)
public class PackageDetailsResponse {

	List<PackageFile> files;
	
	private long size;
	private String releaseNotesDocument;

	public List<PackageFile> getFiles() {
		return files;
	}

	public void setFiles(List<PackageFile> files) {
		this.files = files;
	}
	
	public long getSize() {
		return size;
	}

	public void setSize(long size) {
		this.size = size;
	}

	public String getReleaseNotesDocument() {
		return releaseNotesDocument;
	}

	public void setReleaseNotesDocument(String releaseNotesDocument) {
		this.releaseNotesDocument = releaseNotesDocument;
	}
	
}
