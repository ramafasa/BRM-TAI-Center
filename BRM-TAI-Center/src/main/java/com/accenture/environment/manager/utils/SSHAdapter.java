package com.accenture.environment.manager.utils;

import java.io.ByteArrayOutputStream;
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
		
		logger.debug("[Session " + session.getID() + "] Executing command \"" + command + "\"");
		Command cmd = session.exec(command);
		
		CommandResult commandResult = new CommandResult(cmd);
		
		if(commandResult.getExitCode() == 0) {
			logger.debug("[Session " + session.getID() + "] Command executed successfully.");
		} else {
			logger.error("[Session " + session.getID() + "] Command executed with error (" + commandResult.getExitCode() + ")");
			throw new CommandException(commandResult.getExitCode());
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
		
		ssh.connect(targetEnvironment.getEnvironmentIp());
		ssh.authPassword(targetEnvironment.getUsername(), targetEnvironment.getPassword());
		
		OutputStream outputStream = new ByteArrayOutputStream();
		StreamingInMemoryDestFile destFileInMem = new StreamingInMemoryDestFile(outputStream);
		
		logger.debug("Downloading the file " + filename + "...");
		ssh.newSCPFileTransfer().download(filename, destFileInMem);
		
		ssh.disconnect();
		ssh.close();
		
		return (ByteArrayOutputStream) outputStream;
		
	}
	
	public void disconnect() throws IOException {
		
		session.close();
		ssh.close();
		
		logger.debug("[Session " + session.getID() + "] Disconnected.");
	}
}
