package com.accenture.environment.manager.services;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.ws.soap.MTOM;

import org.apache.log4j.Logger;

import com.accenture.environment.manager.beans.DeploymentPackage;
import com.accenture.environment.manager.data.PackageInfoDataProvider;
import com.accenture.environment.manager.exceptions.PackageException;
import com.accenture.environment.manager.services.beans.DownloadPackageRequest;
import com.accenture.environment.manager.services.beans.DownloadPackageResponse;
import com.accenture.environment.manager.services.beans.InstalledPackageRequest;
import com.accenture.environment.manager.services.beans.InstalledPackageResponse;
import com.accenture.environment.manager.services.beans.PackageDetailsRequest;
import com.accenture.environment.manager.services.beans.PackageDetailsResponse;
import com.accenture.environment.manager.utils.ApplicationProperties;


@WebService(
		serviceName = "PackageManagement",
		endpointInterface = "com.accenture.environment.manager.services.PackageManagement")
public class PackageManagement {

	final static Logger logger = Logger.getLogger(PackageManagement.class);
	
	@WebMethod(operationName = "GetInstalledPackages")
	@WebResult(name = "installedPackagesResponse")
    
	public InstalledPackageResponse getInstalledPackages( @WebParam(name = "installedPackageRequest") @XmlElement(required = true) InstalledPackageRequest input) throws IOException {

		String envHostname = null;
		String envName = null;
		InstalledPackageResponse output = new InstalledPackageResponse();
		
		if(input.getEnvironmentHostname() != null && !input.getEnvironmentHostname().isEmpty()) {
			envHostname = input.getEnvironmentHostname();
			
			//TODO: Get environment name!!
			
		} else if(input.getEnvironmentName() != null && !input.getEnvironmentName().isEmpty()) {
			
			envName = input.getEnvironmentName();						
			 
		} else {
			
			//TODO: Throw error here!
			
		}
		
		PackageInfoDataProvider dm = PackageInfoDataProvider.getInstance();
		List<DeploymentPackage> packages = dm.getListOfPackages(envName);
		
		output.setPackages(packages);
				        
		return output;
	}
	
	
	@WebMethod(operationName = "GetListOfEnvironments")
	@WebResult(name = "listOfEnvironmentsResponse")
	public Set<String> getListOfEnvironments() {
		
		ApplicationProperties applicationProperties = ApplicationProperties.getInstance();
		applicationProperties.getEnvironments();
		
		return applicationProperties.getEnvironments().keySet();
		
	}
	
	@WebMethod(operationName = "GetPackageDetails")
	@WebResult(name = "packageDetail")
	public PackageDetailsResponse getPackageDetails(@WebParam(name = "packageDetailsRequest") @XmlElement(required = true) PackageDetailsRequest input) throws PackageException {
		
		PackageInfoDataProvider dm = PackageInfoDataProvider.getInstance();
		PackageDetailsResponse output = dm.getPackageDetails(input.getEnvironmentName(), input.getPackageVersion());		
		
		
		return output;
		
	}
	
	@MTOM
	@WebMethod(operationName = "DownloadPackage")
	@WebResult(name = "downloadPackageResponse")
	public DownloadPackageResponse downloadPackage(@WebParam(name = "downloadPackageRequest") @XmlElement(required = true) DownloadPackageRequest input) throws PackageException, IOException {
 
		PackageInfoDataProvider dm = PackageInfoDataProvider.getInstance();
		DownloadPackageResponse response = dm.downloadPackage(input.getEnvironmentName(), input.getPackageVersion());
	    
		return response;
	
	}
}
