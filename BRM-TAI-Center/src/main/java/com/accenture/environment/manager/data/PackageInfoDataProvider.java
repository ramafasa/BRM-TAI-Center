package com.accenture.environment.manager.data;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;

import com.accenture.environment.manager.beans.DeploymentPackage;
import com.accenture.environment.manager.beans.PackageFile;
import com.accenture.environment.manager.exceptions.CommandException;
import com.accenture.environment.manager.exceptions.PackageException;
import com.accenture.environment.manager.services.beans.DownloadPackageResponse;
import com.accenture.environment.manager.services.beans.GeneratePackageResponse;
import com.accenture.environment.manager.services.beans.PackageDetailsResponse;
import com.accenture.environment.manager.utils.ApplicationProperties;
import com.accenture.environment.manager.utils.SSHAdapter;
import com.accenture.environment.manager.utils.SSHCommands;

public class PackageInfoDataProvider {
	
	private PackageInfoDataProvider() { }
	
	private static PackageInfoDataProvider instance = null;
	private ApplicationProperties applicationProperties = ApplicationProperties.getInstance();
	private SSHCommands sshCommands = SSHCommands.getInstance(); 
	final static Logger logger = Logger.getLogger(PackageInfoDataProvider.class);
	
	public static PackageInfoDataProvider getInstance() {
		
		if(instance == null)
		{
			instance = new PackageInfoDataProvider();
		}
		
		return instance;		
	}
	
	public List<DeploymentPackage> getListOfPackages(String environmentName) {
		
		List<DeploymentPackage> listOfPackages = new ArrayList<DeploymentPackage>();
		
		SSHAdapter ssh = new SSHAdapter();
		final String commandStr = "cat " + applicationProperties.getInstalledPackagesLog();
		
		try {
			
			ssh.connect(applicationProperties.getEnvironments().get(environmentName));
			CommandResult cmd = ssh.executeCommand(commandStr);
			
			String resultStr = cmd.getOutput().replaceAll("\\n", System.getProperty("line.separator"));
						
			logger.debug("Result of command (" + commandStr + "): " + System.getProperty("line.separator") + resultStr);
			
			String[] lines = resultStr.split(System.getProperty("line.separator"));
			for(String s : lines) {
				String[] members = s.split("\\s");
				
				if(members.length == 8)
				{
					listOfPackages.get(listOfPackages.size() - 1).setRollbackDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(members[0] + " " + members[1]));
					continue;
				}
				
				Date installationDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(members[0] + " " + members[1]);
				DeploymentPackage deploymentPackage = new DeploymentPackage();
				deploymentPackage.setInstallationDate(installationDate);
				deploymentPackage.setDeployApp(members[2] + " " + members[3] + " " + members[4] + " " + members[5]);
				deploymentPackage.setVersion(Integer.parseInt(members[6]));
				deploymentPackage.setInstallationDateTimestamp(installationDate.getTime() / 1000);
							
				listOfPackages.add(deploymentPackage);
			}
				        
		} catch (IOException e) {
			
			logger.error("Error while SSH processing: " + e.getMessage());
			e.printStackTrace();			
		} catch (CommandException e) {
			
			logger.error("Error while executing the command \"" + commandStr + "\". Exit code " + e.getExitStatus() + ")");
			e.printStackTrace();
		} catch (ParseException e) {
			
			logger.error("Error while parsing date obtained from command result!");
			e.printStackTrace();
		} catch (Exception e) {
			
			logger.error("Critical exception!");
			e.printStackTrace();
		} finally {
			
			try {
				ssh.disconnect();
			} catch (IOException e) {
				
				logger.error("Error while closing SSH connection: " + e.getMessage());
				e.printStackTrace();
			}
		}
		  
		return listOfPackages;
	}
	
	
	
	public PackageDetailsResponse getPackageDetails(String environmentName, long packageVersion) throws PackageException {
		
		PackageDetailsResponse packageDetailsRet = new PackageDetailsResponse();
		
		SSHAdapter ssh = new SSHAdapter();
		
		final String checkPackageCommandStr = "ls -lat " + applicationProperties.getDeployDirectory() + "/data/" + applicationProperties.getPackagePrefixName() + "." + packageVersion + ".tar.gz";
		final String getPackageContentCommandStr = "tar -tvf " + applicationProperties.getDeployDirectory() + "/data/" + applicationProperties.getPackagePrefixName() + "." + packageVersion + ".tar.gz";
		final String checkTempDirectoryCmdStr = "ls " + applicationProperties.getPackageTempDirectory();
		final String createTempDirectoryCmdStr = "mkdir " + applicationProperties.getPackageTempDirectory();
		final String removeTempDirectoryCmdStr = "rm -r " + applicationProperties.getPackageTempDirectory();
		final String unpackPackageCmdStr = "tar xvf " + applicationProperties.getDeployDirectory() + "/data/" + applicationProperties.getPackagePrefixName() + "." + packageVersion + ".tar.gz -C " + applicationProperties.getPackageTempDirectory();
		
		String packageName = applicationProperties.getPackagePrefixName() + "." + packageVersion + ".tar.gz";
		
		try {

			//1. Check if the file with package exists and retrieve package size if exists
			
			ssh.connect(applicationProperties.getEnvironments().get(environmentName));
			CommandResult cmd = ssh.executeCommand(checkPackageCommandStr);			
			String resultStr = cmd.getOutput().replaceAll("\\n", System.getProperty("line.separator"));
			
			logger.debug("Result of command: (" + checkPackageCommandStr + "): " + System.getProperty("line.separator") + resultStr);
			
			if(resultStr.contains("No such file or directory") || cmd.getExitCode() != 0 || resultStr.isEmpty()) {
				logger.error("The package " + packageName + " not found in " + environmentName + " environment. PackageException is being thrown.");
				throw new PackageException("The package " + packageName + " not found in " + environmentName + " environment.");
			}
			
			String [] lsResultMembers = resultStr.split("\\s");
			packageDetailsRet.setSize(new Long(lsResultMembers[4]).longValue() / 1024);
						
			//2. Retrieve list of the files from the package
			
			List<PackageFile> filesInPackageList = new ArrayList<PackageFile>();
			List<String> fileList = new ArrayList<String>();
			
			ssh.restartSession();
			cmd = ssh.executeCommand(getPackageContentCommandStr);
			String resultFilesStr = cmd.getOutput().replaceAll("\\n", System.getProperty("line.separator"));
			logger.debug("Result of command: (" + getPackageContentCommandStr + "): " + System.getProperty("line.separator") + resultFilesStr);
			
						
			//3. Get revision number for each file in the package
			
			ssh.restartSession();
			cmd = ssh.executeCommand(checkTempDirectoryCmdStr, true);
			resultStr = cmd.getOutput().replaceAll("\\n", System.getProperty("line.separator"));
			logger.debug("Result of command: (" + checkTempDirectoryCmdStr + "): " + System.getProperty("line.separator") + resultStr);
						
			//If directory tai_manager_tmp_directory exists, remove it
			if(cmd.getExitCode() == 0) {
			
				ssh.restartSession();
				cmd = ssh.executeCommand(removeTempDirectoryCmdStr);
				
				if(cmd.getExitCode() == 0) {
					logger.debug("The directory " + applicationProperties.getPackageTempDirectory() + " existed and has been removed.");
				} else {
					logger.error("Error while removing " + applicationProperties.getPackageTempDirectory());
					throw new PackageException("Error while removing " + applicationProperties.getPackageTempDirectory());
				}
			}
			
			//Create new temporary directory
			ssh.restartSession();
			cmd = ssh.executeCommand(createTempDirectoryCmdStr);
			
			if(cmd.getExitCode() == 0) {
				logger.debug("The directory " + applicationProperties.getPackageTempDirectory() + " has been created.");
			} else {
				logger.error("Error while creating " + applicationProperties.getPackageTempDirectory());
				throw new PackageException("Error while creating " + applicationProperties.getPackageTempDirectory());
			}
				
			//Unpack the package to temporary directory
			
			ssh.restartSession();
			cmd = ssh.executeCommand(unpackPackageCmdStr);
			
			if(cmd.getExitCode() == 0) {
				logger.debug("The package " + packageName + " has been extracted to " + applicationProperties.getPackageTempDirectory());
			} else {
				logger.error("Error while unpacking " + packageName + " package.");
				throw new PackageException("Error while unpacking " + packageName + " package.");
			}
				
			
			String[] lines = resultFilesStr.split(System.getProperty("line.separator"));
			
			for(String line : lines) {
				String[] members = line.split("\\s");
				String filepath = members[members.length - 1];
				
				logger.debug("Processing file: " + filepath);
				fileList.add(filepath);
				
				String [] filePathMembers = filepath.split("/");
								
				for(int i=0; i<filePathMembers.length; i++) {
					
					String parent = "#";
					
					if(i > 0)
						parent = filePathMembers[i-1] + "_id";
					
					PackageFile pf = new PackageFile();
					pf.setParent(parent);
					pf.setText(filePathMembers[i]);
					pf.setId(filePathMembers[i] + "_id");
					pf.setFilepath(filepath);
					
					if(i == filePathMembers.length - 1)
					{
						ssh.restartSession();
						String grepRevisionCmdStr = "cat " + applicationProperties.getPackageTempDirectory() + "/" + filepath + " | grep -o 'Id: .* [0-9]*' | awk '{ print $3 }'";
						cmd = ssh.executeCommand(grepRevisionCmdStr);
						
						resultStr = cmd.getOutput().replaceAll("\\n", System.getProperty("line.separator"));
						logger.debug("Result of command: (" + grepRevisionCmdStr + "): " + System.getProperty("line.separator") + resultStr);
						
						long revision = 0;
						
						if(resultStr == null || resultStr.isEmpty())
							revision = -1;
						else {
							revision = new Long(resultStr.split(System.getProperty("line.separator"))[0]).longValue();
							pf.setText(pf.getText() + " " + revision);
						}
						
						pf.setRevision(revision);
						
					}
					
					if(!filesInPackageList.contains(pf))
						filesInPackageList.add(pf);					
				}
			}
			
			packageDetailsRet.setFiles(filesInPackageList);
			
			//Remove temporary directory
			
			ssh.restartSession();
			cmd = ssh.executeCommand(removeTempDirectoryCmdStr);
			
			if(cmd.getExitCode() == 0) {
				logger.debug("The directory " + applicationProperties.getPackageTempDirectory() + " has been removed.");
			} else {
				logger.error("Error while removing " + applicationProperties.getPackageTempDirectory());
				throw new PackageException("Error while removing " + applicationProperties.getPackageTempDirectory());
			}			
			
		} catch (IOException e) {
			
			logger.error("Error while SSH processing: " + e.getMessage());
			e.printStackTrace();
		} catch (CommandException e) {
			
			logger.error("Error while executing the command \"" + e.getExecutedCommand() + "\". Exit code " + e.getExitStatus() + ")");
			e.printStackTrace();
		} catch (Exception e) {
			
			logger.error("Critical exception!");
			e.printStackTrace();
		} finally {
			
			try {
				ssh.disconnect();
			} catch (IOException e) {
				
				logger.error("Error while closing SSH connection: " + e.getMessage());
				e.printStackTrace();
			}
		}
		
		
		
		return packageDetailsRet;
		
	}		
	
	public DownloadPackageResponse downloadPackage(String environmentName, long packageVersion) throws PackageException {
		
		SSHAdapter ssh = new SSHAdapter();
		ByteArrayOutputStream baos = null;
		String filename = applicationProperties.getDeployDirectory() + "/data/" + applicationProperties.getPackagePrefixName() + "." + packageVersion + ".tar.gz";
		DownloadPackageResponse response = new DownloadPackageResponse();
		
		try {
			
			baos = ssh.downloadFile(applicationProperties.getEnvironments().get(environmentName), filename);
		} catch (IOException e) {
			logger.error("Error while downloading the file " + filename + " from " + environmentName + " environment!");
			e.printStackTrace();
			throw new PackageException("Error while downloading the file " + filename + " from " + environmentName + " environment. Message: " + e.getMessage());
		} finally {
			try {
				baos.close();
			} catch (IOException e) {
				logger.error("Eror while closing OutputStream!");
				e.printStackTrace();
			}
		}
		
		logger.debug("The file " + filename + " has been downloaded successfully.");
		
		response.setPackageContentStream(baos.toByteArray());
		response.setPackageName(applicationProperties.getPackagePrefixName() + "." + packageVersion + ".tar.gz");
				
		return response;
	}
	
	
	public GeneratePackageResponse generatePackage(String branchName, List<String> includedFiles) throws PackageException  {
		
		SSHAdapter ssh = new SSHAdapter();
		GeneratePackageResponse response = new GeneratePackageResponse();
		String includeFileContent = "";
		
		//1. Prepare the file 'include' to be uploaded in the environment
		
		logger.debug("generatePackage: Uploading file " + applicationProperties.getIncludeFileName() + " to " + applicationProperties.getDeployOperatorEnvironment().getEnvironmentName() + " environment ("  +
				applicationProperties.getDeployOperatorEnvironment().getEnvironmentIp() + "). Target filepath: " + applicationProperties.getDeployOperatorDirectory() + "/" + applicationProperties.getIncludeFileName());
		
		logger.debug("generatePackage: Content of the file:");
		
		for(String entry : includedFiles) {
			logger.debug(" - " + entry);
			includeFileContent += entry + "\n";
		}
		
		File file = new File(applicationProperties.getIncludeFileName());
		FileOutputStream fileOuputStream = null;
		
		try {
			
			fileOuputStream = new FileOutputStream(file);
			fileOuputStream.write(includeFileContent.getBytes());
			fileOuputStream.flush();
		} catch (IOException e) {
			logger.error("Error while writing to the file " + applicationProperties.getIncludeFileName() + "!");
			e.printStackTrace();
			throw new PackageException("Error while writing to the file " + applicationProperties.getIncludeFileName() + "!");
		} finally {
			try {
				fileOuputStream.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}		 
		
		//---------//
		
		String commandStr = "";
		CommandResult cmd;
		String resultStr = "";
		String generatedPackageName = "";
		
		try {
			
			//2. Upload 'include' file to the environment, where the package will be generated
			ssh.uploadFile(applicationProperties.getDeployOperatorEnvironment(), applicationProperties.getIncludeFileName(), applicationProperties.getDeployOperatorDirectory(), file);
			
			logger.debug("generatePackage: The file " + applicationProperties.getIncludeFileName() + " has been uploaded succesfully.");
			
			//3. Call deploy.sh script to generate the package in the environment
			ssh = new SSHAdapter();
			ssh.connect(applicationProperties.getDeployOperatorEnvironment());
			//ssh.sourceBashProfile();
			
			commandStr = sshCommands.getSourceBashProfile() + ";" + applicationProperties.getDeployOperatorDirectory() + "/" + sshCommands.getGeneratePackageDefault();
			cmd = ssh.executeCommand(commandStr);
			resultStr = cmd.getOutput().replaceAll("\\n", System.getProperty("line.separator"));
			
			logger.debug("generatePackage: Result of command: (" + commandStr + "): " + System.getProperty("line.separator") + resultStr);
			
			String[] resultLines = resultStr.split(System.getProperty("line.separator"));
			generatedPackageName = resultLines[resultLines.length - 1];
			
			logger.debug("generatePackage: The package " + generatedPackageName + " has been generated successfully.");

			
			//4. Downloading generated package
			String generatedPackageFilepath = applicationProperties.getDeployOperatorDirectory() + "/" + generatedPackageName;
			
			logger.debug("generatePackage: Downloading generated package from " + generatedPackageFilepath + "...");
			ByteArrayOutputStream baos = ssh.downloadFile(applicationProperties.getDeployOperatorEnvironment(), generatedPackageFilepath);
			logger.debug("generatePackage: The package " + generatedPackageName + " downloaded successfully.");			
			
			response.setPackageContentStream(baos.toByteArray());
			response.setPackageName(generatedPackageName);
			
		} catch (CommandException e) {
			
			String message = "Error while executing the command \"" + commandStr + "\". Exit code " + e.getExitStatus() + ")";
			logger.error(message);
			e.printStackTrace();
			throw new PackageException(message);
		} catch (IOException e) {
			
			String message = "Error while SSH processing: " + e.getMessage();
			logger.error(message);
			e.printStackTrace();
			throw new PackageException(message);
		} catch(Exception e) {
			e.printStackTrace();
		} finally {
			
			try {
				ssh.disconnect();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}	
		
		
		return response;
	}
	
	

}
