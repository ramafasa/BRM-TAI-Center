package com.accenture.environment.manager.exceptions;

public class CommandException extends Exception {

	private static final long serialVersionUID = 1L;
	private int exitStatus;
	private String executedCommand;
	
	public CommandException() {
		super();
	}
	
	public CommandException(int exitStatus) {
		super();
		this.exitStatus = exitStatus;
	}
	
	public CommandException(int exitStatus, String executedCommand) {
		super();
		this.exitStatus = exitStatus;
		this.executedCommand = executedCommand;
	}

	public int getExitStatus() {
		return exitStatus;
	}

	public void setExitStatus(int exitStatus) {
		this.exitStatus = exitStatus;
	}

	public String getExecutedCommand() {
		return executedCommand;
	}

	public void setExecutedCommand(String executedCommand) {
		this.executedCommand = executedCommand;
	}
	
	

}
