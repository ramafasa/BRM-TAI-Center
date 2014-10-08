package com.accenture.environment.manager.data;

import java.io.IOException;

import net.schmizz.sshj.common.IOUtils;
import net.schmizz.sshj.connection.channel.direct.Session.Command;

public class CommandResult {

	private String output;
	private int exitCode;
	
	public CommandResult() { super(); }
	
	public CommandResult(String output, int exitCode) {
		super();
		this.output = output;
		this.exitCode = exitCode;
	}
	
	public CommandResult(Command command) throws IOException {
		
		super();
		
		if(command.getExitStatus() != null) {
			this.exitCode = command.getExitStatus().intValue();
		}
		
		this.output = IOUtils.readFully(command.getInputStream()).toString();
	}

	public String getOutput() {
		return output;
	}

	public void setOutput(String output) {
		this.output = output;
	}

	public int getExitCode() {
		return exitCode;
	}

	public void setExitCode(int exitCode) {
		this.exitCode = exitCode;
	}
}
