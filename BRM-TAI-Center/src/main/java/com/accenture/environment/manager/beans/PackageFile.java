package com.accenture.environment.manager.beans;

public class PackageFile extends File {

	
	private long revision;
	
	
	
	public PackageFile() {
		this.revision = -1;
	}
	
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((parent == null) ? 0 : parent.hashCode());
		result = prime * result + ((text == null) ? 0 : text.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object other) {
		
		if (other == null) return false;
		
		if (this == other) return true;
		
		if (getClass() != other.getClass())
			return false;
		
		PackageFile otherPackageFile = (PackageFile) other;
		
		
		if (parent == null) {
			if (otherPackageFile.parent != null)
				return false;
		} else if (!parent.equals(otherPackageFile.parent))
			return false;
		
		if (text == null) {
			if (otherPackageFile.text != null)
				return false;
		} else if (!text.equals(otherPackageFile.text))
			return false;
				
		return true;
	}
	
	
	public long getRevision() {
		return revision;
	}

	public void setRevision(long revision) {
		this.revision = revision;
	}

}
