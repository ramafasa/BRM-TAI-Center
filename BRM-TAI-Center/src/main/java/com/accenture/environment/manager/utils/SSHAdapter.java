package com.accenture.environment.manager.utils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import org.apache.log4j.Logger;

import com.accenture.environment.manager.beans.StreamingInMemoryDestFile;
import com.accenture.environment.manager.data.CommandResult;
import com.accenture.environment.manager.data.PackageInfoDataProvider;
import com.accenture.environment.manager.exceptions.CommandException;

import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.connection.ConnectionException;
import net.schmizz.sshj.connection.channel.direct.Session;
import net.schmizz.sshj.connection.channel.direct.Session.Command;
import net.schmizz.sshj.transport.TransportException;
import net.schmizz.sshj.transport.verification.PromiscuousVerifier;
import net.schmizz.sshj.xfer.FileSystemFile;
import net.schmizz.sshj.xfer.LocalSourceFile;

public class SSHAdapter {

	final static Logger logger = Logger.getLogger(PackageInfoDataProvider.class);
	SSHClient ssh = null;
	Session session = null;
	
	public Session connect(EnvironmentData targetEnvironment) throws IOException {
		
		ssh = new SSHClient();
		ssh.addHostKeyVerifier(new PromiscuousVerifier());
		
		logger.debug("Trying to connect to " + targetEnvironment.getEnvironmentName() + " (" + targetEnvironment.getEnvironmentIp() + ")");
				
		ssh.connect(targetEnvironment.getEnvironmentIp());
		ssh.authPassword(targetEnvironment.getUsername(), targetEnvironment.getPassword());
		session = ssh.startSession();
		
		logger.debug("Session with ID " + session.getID() + " created successfully");
		
		return session;		
	}
	
	public CommandResult executeCommand(String command) throws CommandException, IOException {
		
		return executeCommand(command, false);
	}
	
	public CommandResult executeCommand(String command, boolean suspensCommandError) throws CommandException, IOException {
		
		logger.debug("[Session " + session.getID() + "] Executing command \"" + command + "\"");
		Command cmd = session.exec(command);
		cmd.join();
		
		CommandResult commandResult = new CommandResult(cmd);
		
		if(commandResult.getExitCode() == 0) {
			logger.debug("[Session " + session.getID() + "] Command executed successfully.");
		} else {
			if(!suspensCommandError) {
			
				logger.error("[Session " + session.getID() + "] Command executed with error (" + commandResult.getExitCode() + ") - " + commandResult.getOutput());
				throw new CommandException(commandResult.getExitCode(), command);
			}			
		}
		
		return commandResult;
	}
	
	public Session restartSession() throws TransportException, ConnectionException {
		
		session.close();
		session = ssh.startSession();
		return session;
		
	}
	
	public ByteArrayOutputStream downloadFile(EnvironmentData targetEnvironment, String filename) throws IOException {
		
		SSHClient ssh = new SSHClient();
		ssh.addHostKeyVerifier(new PromiscuousVerifier());
		
		logger.debug("Trying to connect to " + targetEnvironment.getEnvironmentName() + " (" + targetEnvironment.getEnvironmentIp() + ")");
		OutputStream outputStream = null;
		
		try {
			
			ssh.connect(targetEnvironment.getEnvironmentIp());
			ssh.authPassword(targetEnvironment.getUsername(), targetEnvironment.getPassword());
			
			outputStream = new ByteArrayOutputStream();
			StreamingInMemoryDestFile destFileInMem = new StreamingInMemoryDestFile(outputStream);
			
			logger.debug("Downloading the file " + filename + "...");
			ssh.newSCPFileTransfer().download(filename, destFileInMem);
						
		} catch (IOException e) {
			logger.error("Error while connecting to the environment!");
			e.printStackTrace();
			throw e;			
		} finally {
			
			ssh.disconnect();
			ssh.close();
		}	
		
		return (ByteArrayOutputStream) outputStream;
	}
	
	public void uploadFile(EnvironmentData targetEnvironment, String filename, String filepath, File file) throws IOException {
		
		SSHClient ssh = new SSHClient();
		ssh.addHostKeyVerifier(new PromiscuousVerifier());
		
		logger.debug("Trying to connect to " + targetEnvironment.getEnvironmentName() + " (" + targetEnvironment.getEnvironmentIp() + ")");
		
		try {
			
			ssh.connect(targetEnvironment.getEnvironmentIp());
			ssh.authPassword(targetEnvironment.getUsername(), targetEnvironment.getPassword());
			
			logger.debug("Uploading the file " + filename + " to path " + filepath + " in " + targetEnvironment.getEnvironmentName() + " environment...");
			FileSystemFile systemFile = new FileSystemFile(file);			
			ssh.newSCPFileTransfer().upload(systemFile, filepath);
			
		} catch (IOException e) {
			logger.error("Error while connecting to the environment!");
			e.printStackTrace();
			throw e;
		} finally {
			
			ssh.disconnect();
			ssh.close();
		}
	}
	
	public void disconnect() throws IOException {
		
		session.close();
		ssh.close();
		
		logger.debug("[Session " + session.getID() + "] Disconnected.");
	}
}
