package com.accenture.environment.manager.exceptions;

public class CommandException extends Exception {

	private static final long serialVersionUID = 1L;
	private int exitStatus;
	
	public CommandException() {
		super();
	}
	
	public CommandException(int exitStatus) {
		super();
		this.exitStatus = exitStatus;
	}

	public int getExitStatus() {
		return exitStatus;
	}

	public void setExitStatus(int exitStatus) {
		this.exitStatus = exitStatus;
	}
	
	

}
