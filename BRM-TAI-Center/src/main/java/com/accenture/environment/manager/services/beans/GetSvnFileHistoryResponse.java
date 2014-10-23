package com.accenture.environment.manager.services.beans;

import java.util.List;

import com.accenture.environment.manager.beans.SVNHistory;

public class GetSvnFileHistoryResponse {

	private List<SVNHistory> svnHistory;

	public List<SVNHistory> getSvnHistory() {
		return svnHistory;
	}

	public void setSvnHistory(List<SVNHistory> svnHistory) {
		this.svnHistory = svnHistory;
	}
	
		
}
