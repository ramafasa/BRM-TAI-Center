package com.accenture.environment.manager.beans;

import java.io.IOException;
import java.io.OutputStream;

import net.schmizz.sshj.xfer.InMemoryDestFile;

public class StreamingInMemoryDestFile extends InMemoryDestFile {

		 
	private OutputStream os;
	 
	
	public StreamingInMemoryDestFile(OutputStream os) {
		super();
		this.os = os;
	}
	 
	public OutputStream getOutputStream() throws IOException {
		return os;
	}
	 
}
	

