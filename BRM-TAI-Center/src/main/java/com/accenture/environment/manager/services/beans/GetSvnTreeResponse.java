package com.accenture.environment.manager.services.beans;

import java.util.List;

import com.accenture.environment.manager.beans.SVNFile;

public class GetSvnTreeResponse {

	List<SVNFile> svnFiles;

	public List<SVNFile> getSvnFiles() {
		return svnFiles;
	}

	public void setSvnFiles(List<SVNFile> svnFiles) {
		this.svnFiles = svnFiles;
	}
	
		
}
