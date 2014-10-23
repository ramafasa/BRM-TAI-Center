package com.accenture.environment.manager.services.beans;

public class GetSvnFileHistoryRequest {

	private String branchName;
	private String filePath;
	private long maxRevision;

	public String getBranchName() {
		return branchName;
	}

	public void setBranchName(String branchName) {
		this.branchName = branchName;
	}

	public String getFilePath() {
		return filePath;
	}

	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}

	public long getMaxRevision() {
		return maxRevision;
	}

	public void setMaxRevision(long maxRevision) {
		this.maxRevision = maxRevision;
	}
	
		
}
