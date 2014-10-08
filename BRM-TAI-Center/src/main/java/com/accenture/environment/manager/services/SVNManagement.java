package com.accenture.environment.manager.services;

import java.util.Collection;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlElement;

import org.apache.log4j.Logger;

import com.accenture.environment.manager.data.SVNDataProvider;
import com.accenture.environment.manager.services.beans.GetSvnTreeRequest;
import com.accenture.environment.manager.services.beans.GetSvnTreeResponse;
import com.accenture.environment.manager.utils.SVNBranchData;


@WebService(
		serviceName = "SVNManagement",
		endpointInterface = "com.accenture.environment.manager.services.SVNManagement")
public class SVNManagement {

	final static Logger logger = Logger.getLogger(SVNManagement.class);
	
	
	@WebMethod(operationName = "GetSVNBranches")
	@WebResult(name = "getSVNBranchesResponse")
    
	public Collection<SVNBranchData> getSVNBranches() {

		return new SVNDataProvider().getSVNBranches();
	}
	
	
	@WebMethod(operationName = "GetSvnRepositoryTree")
	@WebResult(name = "getSvnRepositoryTreeResponse")
    
	public GetSvnTreeResponse getSvnRepositoryTree( @WebParam(name = "getSvnRepositoryTreeRequest") @XmlElement(required = true) GetSvnTreeRequest input) {

		SVNDataProvider dm = new SVNDataProvider();
		GetSvnTreeResponse response = new GetSvnTreeResponse();
		response.setSvnFiles(dm.getSVNFileTree(input.getBranchName()));
		
		return response;	
		
	}
	
	
	
}
